"""Subscription schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.subscription import PlanTier, SubscriptionStatus, BillingInterval


class SubscriptionBase(BaseSchema):
    """Base subscription schema."""
    
    plan_tier: PlanTier = PlanTier.FREE
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    
    price_cents: int = Field(default=0, ge=0)
    currency: str = Field(default="USD", max_length=3)
    
    seats_included: int = Field(default=5, ge=1)
    additional_seat_price_cents: int = Field(default=0, ge=0)
    
    monthly_tokens_included: int = Field(default=100000, ge=0)
    additional_token_price_cents: int = Field(default=0, ge=0)


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription."""
    
    organization_id: UUID
    status: SubscriptionStatus = SubscriptionStatus.TRIALING
    
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    
    external_subscription_id: Optional[str] = None
    external_customer_id: Optional[str] = None
    
    discount_percent: Optional[int] = Field(None, ge=0, le=100)
    discount_code: Optional[str] = Field(None, max_length=50)
    discount_ends_at: Optional[datetime] = None
    
    auto_renew: bool = True
    notes: Optional[str] = None


class SubscriptionUpdate(BaseSchema):
    """Schema for updating a subscription."""
    
    plan_tier: Optional[PlanTier] = None
    status: Optional[SubscriptionStatus] = None
    billing_interval: Optional[BillingInterval] = None
    
    price_cents: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    
    seats_included: Optional[int] = Field(None, ge=1)
    additional_seat_price_cents: Optional[int] = Field(None, ge=0)
    
    monthly_tokens_included: Optional[int] = Field(None, ge=0)
    additional_token_price_cents: Optional[int] = Field(None, ge=0)
    
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    
    external_subscription_id: Optional[str] = None
    external_customer_id: Optional[str] = None
    external_product_id: Optional[str] = None
    external_price_id: Optional[str] = None
    
    discount_percent: Optional[int] = Field(None, ge=0, le=100)
    discount_code: Optional[str] = Field(None, max_length=50)
    discount_ends_at: Optional[datetime] = None
    
    auto_renew: Optional[bool] = None
    notes: Optional[str] = None


class SubscriptionResponse(SubscriptionBase, TimestampSchema):
    """Schema for subscription API responses."""
    
    id: UUID
    organization_id: UUID
    status: SubscriptionStatus
    
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    
    discount_percent: Optional[int] = None
    discount_code: Optional[str] = None
    discount_ends_at: Optional[datetime] = None
    
    auto_renew: bool
    
    # Computed
    is_active: bool
    is_trialing: bool
    days_until_renewal: Optional[int] = None
    effective_price_cents: int


class SubscriptionBrief(BaseSchema):
    """Brief subscription info."""
    
    id: UUID
    plan_tier: PlanTier
    status: SubscriptionStatus
    current_period_end: Optional[datetime] = None


class PlanPricing(BaseSchema):
    """Plan pricing configuration."""
    
    plan_tier: PlanTier
    name: str
    description: str
    
    monthly_price_cents: int
    yearly_price_cents: int
    
    seats_included: int
    additional_seat_monthly_cents: int
    
    tokens_included: int
    additional_tokens_per_1k_cents: int
    
    features: list[str]
    is_popular: bool = False


class SubscriptionRenewalInfo(BaseSchema):
    """Information about upcoming renewals."""
    
    organization_id: UUID
    organization_name: str
    subscription_id: UUID
    plan_tier: PlanTier
    status: SubscriptionStatus
    current_period_end: Optional[datetime]
    days_until_renewal: Optional[int]
    next_billing_amount_cents: int
    currency: str
