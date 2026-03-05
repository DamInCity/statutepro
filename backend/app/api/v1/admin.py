"""Admin API endpoints for platform management."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user, require_platform_admin
from app.models import (
    User, Organization, Subscription, TokenUsage, TokenUsageAggregate,
    SubscriptionStatus, PlanTier
)
from app.schemas import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse, OrganizationDetail,
    OrganizationStats, OrganizationBrief,
    SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse, SubscriptionRenewalInfo,
    TokenUsageSummary, PlatformTokenOverview,
    UserResponse, UserCreate, UserUpdate
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ============== Platform Dashboard ==============

@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get platform admin dashboard overview."""
    
    # Get organization counts
    total_orgs = await db.scalar(select(func.count(Organization.id)))
    active_orgs = await db.scalar(
        select(func.count(Organization.id)).where(Organization.is_active == True)
    )
    
    # Get subscription stats
    active_subs = await db.scalar(
        select(func.count(Subscription.id)).where(
            Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING])
        )
    )
    
    # Subscriptions by tier
    tier_counts = await db.execute(
        select(Subscription.plan_tier, func.count(Subscription.id))
        .where(Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]))
        .group_by(Subscription.plan_tier)
    )
    subscriptions_by_tier = {tier.value: count for tier, count in tier_counts}
    
    # Get user counts
    total_users = await db.scalar(select(func.count(User.id)))
    active_users = await db.scalar(
        select(func.count(User.id)).where(User.is_active == True)
    )
    
    # Get token usage for current month
    current_month = datetime.now().strftime("%Y-%m")
    month_tokens = await db.scalar(
        select(func.sum(TokenUsage.total_tokens))
        .where(TokenUsage.usage_month == current_month)
    ) or 0
    
    # Calculate MRR (Monthly Recurring Revenue)
    mrr_result = await db.execute(
        select(func.sum(Subscription.price_cents))
        .where(
            and_(
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.billing_interval == "monthly"
            )
        )
    )
    monthly_mrr = mrr_result.scalar() or 0
    
    # Add yearly subscriptions divided by 12
    yearly_result = await db.execute(
        select(func.sum(Subscription.price_cents))
        .where(
            and_(
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.billing_interval == "yearly"
            )
        )
    )
    yearly_mrr = (yearly_result.scalar() or 0) / 12
    
    total_mrr_cents = int(monthly_mrr + yearly_mrr)
    
    # Upcoming renewals (next 7 days)
    next_week = datetime.now() + timedelta(days=7)
    upcoming_renewals = await db.scalar(
        select(func.count(Subscription.id))
        .where(
            and_(
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.current_period_end <= next_week,
                Subscription.current_period_end > datetime.now()
            )
        )
    )
    
    # At-risk subscriptions (past due or canceled)
    at_risk = await db.scalar(
        select(func.count(Subscription.id))
        .where(
            Subscription.status.in_([SubscriptionStatus.PAST_DUE, SubscriptionStatus.UNPAID])
        )
    )
    
    return {
        "organizations": {
            "total": total_orgs,
            "active": active_orgs,
            "inactive": total_orgs - active_orgs
        },
        "subscriptions": {
            "active": active_subs,
            "by_tier": subscriptions_by_tier,
            "upcoming_renewals": upcoming_renewals,
            "at_risk": at_risk
        },
        "users": {
            "total": total_users,
            "active": active_users
        },
        "revenue": {
            "mrr_cents": total_mrr_cents,
            "mrr_dollars": total_mrr_cents / 100
        },
        "tokens": {
            "used_this_month": month_tokens
        }
    }


# ============== Organization Management ==============

@router.get("/organizations", response_model=List[OrganizationResponse])
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """List all organizations with filtering."""
    
    query = select(Organization).order_by(Organization.created_at.desc())
    
    if is_active is not None:
        query = query.where(Organization.is_active == is_active)
    
    if search:
        search_filter = or_(
            Organization.name.ilike(f"%{search}%"),
            Organization.slug.ilike(f"%{search}%"),
            Organization.email.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Create a new organization."""
    
    # Check if slug is unique
    existing = await db.scalar(
        select(Organization).where(Organization.slug == org_data.slug)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists"
        )
    
    org = Organization(**org_data.model_dump())
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/organizations/{org_id}", response_model=OrganizationDetail)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get organization details."""
    
    result = await db.execute(
        select(Organization)
        .options(selectinload(Organization.users), selectinload(Organization.subscriptions))
        .where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    return OrganizationDetail(
        **{k: v for k, v in org.__dict__.items() if not k.startswith('_')},
        used_seats=org.used_seats,
        available_seats=org.available_seats
    )


@router.patch("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_data: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Update an organization."""
    
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    update_data = org_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(org, field, value)
    
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/organizations/{org_id}/stats", response_model=OrganizationStats)
async def get_organization_stats(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get statistics for an organization."""
    
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    # Get user counts
    total_users = await db.scalar(
        select(func.count(User.id)).where(User.organization_id == org_id)
    )
    active_users = await db.scalar(
        select(func.count(User.id)).where(
            and_(User.organization_id == org_id, User.is_active == True)
        )
    )
    
    # Token usage this month
    current_month = datetime.now().strftime("%Y-%m")
    tokens_used = await db.scalar(
        select(func.sum(TokenUsage.total_tokens))
        .where(
            and_(
                TokenUsage.organization_id == org_id,
                TokenUsage.usage_month == current_month
            )
        )
    ) or 0
    
    return OrganizationStats(
        organization_id=org_id,
        total_users=total_users or 0,
        active_users=active_users or 0,
        total_matters=0,  # TODO: Implement when matters have org_id
        active_matters=0,
        total_clients=0,  # TODO: Implement when clients have org_id
        tokens_used_this_month=tokens_used,
        tokens_remaining=max(0, org.monthly_token_limit - tokens_used),
        storage_used_mb=0,  # TODO: Implement storage tracking
        storage_remaining_mb=org.storage_limit_mb
    )


@router.get("/organizations/{org_id}/users", response_model=List[UserResponse])
async def list_organization_users(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """List users in an organization."""
    
    result = await db.execute(
        select(User).where(User.organization_id == org_id).order_by(User.created_at)
    )
    return result.scalars().all()


# ============== Subscription Management ==============

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[SubscriptionStatus] = None,
    plan_tier: Optional[PlanTier] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """List all subscriptions with filtering."""
    
    query = select(Subscription).order_by(Subscription.created_at.desc())
    
    if status:
        query = query.where(Subscription.status == status)
    
    if plan_tier:
        query = query.where(Subscription.plan_tier == plan_tier)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    subscriptions = result.scalars().all()
    
    return [
        SubscriptionResponse(
            **{k: v for k, v in sub.__dict__.items() if not k.startswith('_')},
            is_active=sub.is_active,
            is_trialing=sub.is_trialing,
            days_until_renewal=sub.days_until_renewal,
            effective_price_cents=sub.effective_price_cents
        )
        for sub in subscriptions
    ]


@router.get("/subscriptions/renewals", response_model=List[SubscriptionRenewalInfo])
async def get_upcoming_renewals(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get upcoming subscription renewals."""
    
    cutoff = datetime.now() + timedelta(days=days)
    
    result = await db.execute(
        select(Subscription)
        .options(selectinload(Subscription.organization))
        .where(
            and_(
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.current_period_end <= cutoff,
                Subscription.current_period_end > datetime.now()
            )
        )
        .order_by(Subscription.current_period_end)
    )
    subscriptions = result.scalars().all()
    
    return [
        SubscriptionRenewalInfo(
            organization_id=sub.organization_id,
            organization_name=sub.organization.name if sub.organization else "Unknown",
            subscription_id=sub.id,
            plan_tier=sub.plan_tier,
            status=sub.status,
            current_period_end=sub.current_period_end,
            days_until_renewal=sub.days_until_renewal,
            next_billing_amount_cents=sub.effective_price_cents,
            currency=sub.currency
        )
        for sub in subscriptions
    ]


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    sub_data: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Create a subscription for an organization."""
    
    # Verify organization exists
    org = await db.get(Organization, sub_data.organization_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    subscription = Subscription(**sub_data.model_dump())
    
    # Set dates if not provided
    if subscription.status == SubscriptionStatus.TRIALING and not subscription.trial_start:
        subscription.trial_start = datetime.now()
        subscription.trial_end = datetime.now() + timedelta(days=14)
    
    if not subscription.current_period_start:
        subscription.current_period_start = datetime.now()
        if subscription.billing_interval == "monthly":
            subscription.current_period_end = datetime.now() + timedelta(days=30)
        elif subscription.billing_interval == "quarterly":
            subscription.current_period_end = datetime.now() + timedelta(days=90)
        else:  # yearly
            subscription.current_period_end = datetime.now() + timedelta(days=365)
    
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    
    # Update organization limits based on subscription
    org.max_seats = subscription.seats_included
    org.monthly_token_limit = subscription.monthly_tokens_included
    await db.commit()
    
    return SubscriptionResponse(
        **{k: v for k, v in subscription.__dict__.items() if not k.startswith('_')},
        is_active=subscription.is_active,
        is_trialing=subscription.is_trialing,
        days_until_renewal=subscription.days_until_renewal,
        effective_price_cents=subscription.effective_price_cents
    )


@router.patch("/subscriptions/{sub_id}", response_model=SubscriptionResponse)
async def update_subscription(
    sub_id: UUID,
    sub_data: SubscriptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Update a subscription."""
    
    subscription = await db.get(Subscription, sub_id)
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    
    update_data = sub_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subscription, field, value)
    
    await db.commit()
    await db.refresh(subscription)
    
    return SubscriptionResponse(
        **{k: v for k, v in subscription.__dict__.items() if not k.startswith('_')},
        is_active=subscription.is_active,
        is_trialing=subscription.is_trialing,
        days_until_renewal=subscription.days_until_renewal,
        effective_price_cents=subscription.effective_price_cents
    )


@router.post("/subscriptions/{sub_id}/cancel")
async def cancel_subscription(
    sub_id: UUID,
    immediate: bool = Query(False, description="Cancel immediately or at end of period"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Cancel a subscription."""
    
    subscription = await db.get(Subscription, sub_id)
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    
    subscription.canceled_at = datetime.now()
    
    if immediate:
        subscription.status = SubscriptionStatus.CANCELED
        subscription.ended_at = datetime.now()
    else:
        # Will be canceled at end of period (handled by background job)
        subscription.auto_renew = False
    
    await db.commit()
    
    return {"message": "Subscription canceled", "immediate": immediate}


# ============== Token Usage Analytics ==============

@router.get("/tokens/overview", response_model=PlatformTokenOverview)
async def get_platform_token_overview(
    period: Optional[str] = Query(None, description="Period in YYYY-MM format"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get platform-wide token usage overview."""
    
    if not period:
        period = datetime.now().strftime("%Y-%m")
    
    # Total organizations
    total_orgs = await db.scalar(select(func.count(Organization.id)))
    
    # Organizations with usage this period
    active_org_ids = await db.execute(
        select(TokenUsage.organization_id)
        .where(TokenUsage.usage_month == period)
        .distinct()
    )
    active_orgs = len(active_org_ids.scalars().all())
    
    # Total usage
    usage_result = await db.execute(
        select(
            func.count(TokenUsage.id),
            func.sum(TokenUsage.total_tokens),
            func.sum(TokenUsage.cost_micro_cents)
        )
        .where(TokenUsage.usage_month == period)
    )
    row = usage_result.one()
    total_requests = row[0] or 0
    total_tokens = row[1] or 0
    total_cost_micro_cents = row[2] or 0
    
    # Usage by feature
    feature_result = await db.execute(
        select(
            TokenUsage.feature_type,
            func.count(TokenUsage.id),
            func.sum(TokenUsage.total_tokens)
        )
        .where(TokenUsage.usage_month == period)
        .group_by(TokenUsage.feature_type)
    )
    
    by_feature = []
    for feature, count, tokens in feature_result:
        by_feature.append({
            "feature_type": feature,
            "total_requests": count,
            "total_tokens": tokens or 0,
            "total_cost_cents": 0,  # Calculate based on model pricing
            "percentage_of_total": (tokens or 0) / total_tokens * 100 if total_tokens > 0 else 0
        })
    
    # Usage by model
    model_result = await db.execute(
        select(TokenUsage.model, func.sum(TokenUsage.total_tokens))
        .where(TokenUsage.usage_month == period)
        .group_by(TokenUsage.model)
    )
    usage_by_model = {str(model.value): tokens or 0 for model, tokens in model_result}
    
    return PlatformTokenOverview(
        period=period,
        total_organizations=total_orgs or 0,
        active_organizations=active_orgs,
        total_requests=total_requests,
        total_tokens=total_tokens,
        total_cost_dollars=total_cost_micro_cents / 100_000_000,
        top_consuming_orgs=[],  # TODO: Implement top consumers query
        usage_by_model=usage_by_model,
        usage_by_feature=by_feature
    )


@router.get("/tokens/organization/{org_id}")
async def get_organization_token_usage(
    org_id: UUID,
    period: Optional[str] = Query(None, description="Period in YYYY-MM format"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Get token usage for a specific organization."""
    
    if not period:
        period = datetime.now().strftime("%Y-%m")
    
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    # Get usage summary
    usage_result = await db.execute(
        select(
            func.count(TokenUsage.id),
            func.sum(TokenUsage.prompt_tokens),
            func.sum(TokenUsage.completion_tokens),
            func.sum(TokenUsage.total_tokens),
            func.sum(TokenUsage.cost_micro_cents),
            func.count(TokenUsage.id).filter(TokenUsage.was_successful == True),
            func.count(TokenUsage.id).filter(TokenUsage.was_successful == False),
            func.avg(TokenUsage.response_time_ms)
        )
        .where(
            and_(
                TokenUsage.organization_id == org_id,
                TokenUsage.usage_month == period
            )
        )
    )
    row = usage_result.one()
    
    total_tokens = row[3] or 0
    
    return TokenUsageSummary(
        organization_id=org_id,
        period=period,
        total_requests=row[0] or 0,
        successful_requests=row[5] or 0,
        failed_requests=row[6] or 0,
        total_prompt_tokens=row[1] or 0,
        total_completion_tokens=row[2] or 0,
        total_tokens=total_tokens,
        total_cost_cents=(row[4] or 0) / 1_000_000,
        total_cost_dollars=(row[4] or 0) / 100_000_000,
        avg_response_time_ms=int(row[7]) if row[7] else None,
        token_limit=org.monthly_token_limit,
        tokens_remaining=max(0, org.monthly_token_limit - total_tokens),
        usage_percentage=(total_tokens / org.monthly_token_limit * 100) if org.monthly_token_limit > 0 else 0
    )
