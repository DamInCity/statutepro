"""Analytics and dashboard API endpoints."""
from datetime import date, datetime, timedelta
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_, or_, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models import (
    User, UserRole, Client, ClientStatus, Matter, MatterStatus,
    TimeEntry, TimeEntryStatus, Invoice, InvoiceStatus, Task, TaskStatus
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# Response schemas
class FirmOverview(BaseModel):
    """Firm-wide overview metrics."""
    total_clients: int
    active_clients: int
    total_matters: int
    active_matters: int
    total_users: int
    active_users: int


class RevenueMetrics(BaseModel):
    """Revenue and billing metrics."""
    total_billed: int  # cents
    total_collected: int  # cents
    outstanding_amount: int  # cents
    overdue_amount: int  # cents
    average_days_to_pay: float
    collection_rate: float  # percentage


class BillableHoursMetrics(BaseModel):
    """Billable hours metrics."""
    total_hours: float
    billable_hours: float
    non_billable_hours: float
    billed_hours: float
    unbilled_hours: float
    utilization_rate: float  # percentage


class AttorneyPerformance(BaseModel):
    """Individual attorney performance."""
    user_id: UUID
    name: str
    role: str
    billable_hours: float
    billed_amount: int  # cents
    collection_rate: float
    active_matters: int
    task_completion_rate: float


class MatterMetrics(BaseModel):
    """Matter distribution metrics."""
    by_status: dict[str, int]
    by_practice_area: dict[str, int]
    by_billing_type: dict[str, int]
    avg_matter_value: int  # cents
    avg_matter_duration_days: float


class MonthlyTrend(BaseModel):
    """Monthly trend data point."""
    month: str
    year: int
    revenue: int
    hours: float
    new_matters: int
    new_clients: int


class DashboardSummary(BaseModel):
    """Complete dashboard summary."""
    overview: FirmOverview
    revenue: RevenueMetrics
    billable_hours: BillableHoursMetrics
    matter_metrics: MatterMetrics
    trends: List[MonthlyTrend]


@router.get("/overview", response_model=FirmOverview)
async def get_firm_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get firm-wide overview metrics."""
    # Clients
    total_clients = await db.scalar(select(func.count(Client.id)))
    active_clients = await db.scalar(
        select(func.count(Client.id)).where(Client.status == ClientStatus.ACTIVE)
    )
    
    # Matters
    total_matters = await db.scalar(select(func.count(Matter.id)))
    active_matters = await db.scalar(
        select(func.count(Matter.id)).where(Matter.status == MatterStatus.ACTIVE)
    )
    
    # Users
    total_users = await db.scalar(select(func.count(User.id)))
    active_users = await db.scalar(
        select(func.count(User.id)).where(User.is_active == True)
    )
    
    return FirmOverview(
        total_clients=total_clients or 0,
        active_clients=active_clients or 0,
        total_matters=total_matters or 0,
        active_matters=active_matters or 0,
        total_users=total_users or 0,
        active_users=active_users or 0
    )


@router.get("/revenue", response_model=RevenueMetrics)
async def get_revenue_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get revenue and billing metrics."""
    if not start_date:
        start_date = date.today().replace(month=1, day=1)  # Start of year
    if not end_date:
        end_date = date.today()
    
    # Query invoices in date range
    query = select(Invoice).where(
        and_(
            Invoice.issue_date >= start_date,
            Invoice.issue_date <= end_date
        )
    )
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    total_billed = 0
    total_collected = 0
    outstanding_amount = 0
    overdue_amount = 0
    payment_days = []
    
    today = date.today()
    
    for inv in invoices:
        if inv.status != InvoiceStatus.VOID:
            total_billed += inv.total_amount
            total_collected += inv.amount_paid
            
            if inv.status not in [InvoiceStatus.PAID, InvoiceStatus.VOID]:
                outstanding_amount += inv.total_amount - inv.amount_paid
                if inv.due_date < today:
                    overdue_amount += inv.total_amount - inv.amount_paid
            
            # Calculate days to pay for paid invoices
            if inv.paid_date and inv.issue_date:
                days = (inv.paid_date - inv.issue_date).days
                payment_days.append(days)
    
    avg_days_to_pay = sum(payment_days) / len(payment_days) if payment_days else 0
    collection_rate = (total_collected / total_billed * 100) if total_billed > 0 else 0
    
    return RevenueMetrics(
        total_billed=total_billed,
        total_collected=total_collected,
        outstanding_amount=outstanding_amount,
        overdue_amount=overdue_amount,
        average_days_to_pay=round(avg_days_to_pay, 1),
        collection_rate=round(collection_rate, 1)
    )


@router.get("/billable-hours", response_model=BillableHoursMetrics)
async def get_billable_hours(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[UUID] = None
):
    """Get billable hours metrics."""
    if not start_date:
        start_date = date.today().replace(day=1)  # Start of month
    if not end_date:
        end_date = date.today()
    
    query = select(TimeEntry).where(
        and_(
            TimeEntry.entry_date >= start_date,
            TimeEntry.entry_date <= end_date
        )
    )
    
    if user_id:
        query = query.where(TimeEntry.user_id == user_id)
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    total_minutes = 0
    billable_minutes = 0
    non_billable_minutes = 0
    billed_minutes = 0
    unbilled_billable_minutes = 0
    
    for entry in entries:
        total_minutes += entry.duration_minutes
        if entry.is_billable:
            billable_minutes += entry.duration_minutes
            if entry.is_billed:
                billed_minutes += entry.duration_minutes
            else:
                unbilled_billable_minutes += entry.duration_minutes
        else:
            non_billable_minutes += entry.duration_minutes
    
    total_hours = total_minutes / 60
    billable_hours = billable_minutes / 60
    non_billable_hours = non_billable_minutes / 60
    billed_hours = billed_minutes / 60
    unbilled_hours = unbilled_billable_minutes / 60
    
    # Utilization rate (billable / total * 100)
    utilization_rate = (billable_hours / total_hours * 100) if total_hours > 0 else 0
    
    return BillableHoursMetrics(
        total_hours=round(total_hours, 2),
        billable_hours=round(billable_hours, 2),
        non_billable_hours=round(non_billable_hours, 2),
        billed_hours=round(billed_hours, 2),
        unbilled_hours=round(unbilled_hours, 2),
        utilization_rate=round(utilization_rate, 1)
    )


@router.get("/attorney-performance", response_model=List[AttorneyPerformance])
async def get_attorney_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get performance metrics for all attorneys."""
    if not start_date:
        start_date = date.today().replace(month=1, day=1)
    if not end_date:
        end_date = date.today()
    
    # Get all billable users (attorneys, partners, associates)
    users_query = select(User).where(
        User.role.in_([UserRole.PARTNER, UserRole.ASSOCIATE, UserRole.PARALEGAL])
    )
    users_result = await db.execute(users_query)
    users = users_result.scalars().all()
    
    performances = []
    
    for user in users:
        # Time entries
        time_query = select(TimeEntry).where(
            and_(
                TimeEntry.user_id == user.id,
                TimeEntry.entry_date >= start_date,
                TimeEntry.entry_date <= end_date,
                TimeEntry.is_billable == True
            )
        )
        time_result = await db.execute(time_query)
        time_entries = time_result.scalars().all()
        
        billable_minutes = sum(e.duration_minutes for e in time_entries)
        billed_amount = sum(e.total_amount for e in time_entries if e.is_billed)
        
        # Active matters
        matter_count = await db.scalar(
            select(func.count(Matter.id)).where(
                and_(
                    Matter.responsible_attorney_id == user.id,
                    Matter.status == MatterStatus.ACTIVE
                )
            )
        )
        
        # Task completion rate
        total_tasks = await db.scalar(
            select(func.count(Task.id)).where(Task.assigned_to_id == user.id)
        )
        completed_tasks = await db.scalar(
            select(func.count(Task.id)).where(
                and_(
                    Task.assigned_to_id == user.id,
                    Task.status == TaskStatus.COMPLETED
                )
            )
        )
        task_completion = (completed_tasks / total_tasks * 100) if total_tasks else 0
        
        performances.append(AttorneyPerformance(
            user_id=user.id,
            name=user.full_name,
            role=user.role.value,
            billable_hours=round(billable_minutes / 60, 2),
            billed_amount=billed_amount,
            collection_rate=0,  # Would need invoice data linked to user
            active_matters=matter_count or 0,
            task_completion_rate=round(task_completion, 1)
        ))
    
    return performances


@router.get("/matter-metrics", response_model=MatterMetrics)
async def get_matter_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get matter distribution and metrics."""
    result = await db.execute(select(Matter))
    matters = result.scalars().all()
    
    by_status = {}
    by_practice_area = {}
    by_billing_type = {}
    total_value = 0
    durations = []
    
    today = date.today()
    
    for matter in matters:
        # By status
        status_key = matter.status.value
        by_status[status_key] = by_status.get(status_key, 0) + 1
        
        # By practice area
        if matter.practice_area:
            pa_key = matter.practice_area.value
            by_practice_area[pa_key] = by_practice_area.get(pa_key, 0) + 1
        
        # By billing type
        bt_key = matter.billing_type.value
        by_billing_type[bt_key] = by_billing_type.get(bt_key, 0) + 1
        
        # Value
        if matter.budget_amount:
            total_value += matter.budget_amount
        
        # Duration for closed matters
        if matter.status == MatterStatus.CLOSED and matter.close_date and matter.open_date:
            duration = (matter.close_date - matter.open_date).days
            durations.append(duration)
    
    avg_value = total_value // len(matters) if matters else 0
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    return MatterMetrics(
        by_status=by_status,
        by_practice_area=by_practice_area,
        by_billing_type=by_billing_type,
        avg_matter_value=avg_value,
        avg_matter_duration_days=round(avg_duration, 1)
    )


@router.get("/trends", response_model=List[MonthlyTrend])
async def get_monthly_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    months: int = Query(12, ge=1, le=24)
):
    """Get monthly trend data for the last N months."""
    trends = []
    today = date.today()
    
    for i in range(months - 1, -1, -1):
        # Calculate month
        month_date = today.replace(day=1) - timedelta(days=i * 30)
        month_start = month_date.replace(day=1)
        if month_date.month == 12:
            month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
        
        # Revenue (from invoices)
        revenue = await db.scalar(
            select(func.coalesce(func.sum(Invoice.amount_paid), 0)).where(
                and_(
                    Invoice.paid_date >= month_start,
                    Invoice.paid_date <= month_end
                )
            )
        )
        
        # Billable hours
        hours_minutes = await db.scalar(
            select(func.coalesce(func.sum(TimeEntry.duration_minutes), 0)).where(
                and_(
                    TimeEntry.entry_date >= month_start,
                    TimeEntry.entry_date <= month_end,
                    TimeEntry.is_billable == True
                )
            )
        )
        
        # New matters
        new_matters = await db.scalar(
            select(func.count(Matter.id)).where(
                and_(
                    Matter.open_date >= month_start,
                    Matter.open_date <= month_end
                )
            )
        )
        
        # New clients
        new_clients = await db.scalar(
            select(func.count(Client.id)).where(
                and_(
                    func.date(Client.created_at) >= month_start,
                    func.date(Client.created_at) <= month_end
                )
            )
        )
        
        trends.append(MonthlyTrend(
            month=month_start.strftime("%B"),
            year=month_start.year,
            revenue=revenue or 0,
            hours=round((hours_minutes or 0) / 60, 2),
            new_matters=new_matters or 0,
            new_clients=new_clients or 0
        ))
    
    return trends


@router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete dashboard summary."""
    overview = await get_firm_overview(db, current_user)
    revenue = await get_revenue_metrics(db, current_user)
    billable_hours = await get_billable_hours(db, current_user)
    matter_metrics = await get_matter_metrics(db, current_user)
    trends = await get_monthly_trends(db, current_user, months=6)
    
    return DashboardSummary(
        overview=overview,
        revenue=revenue,
        billable_hours=billable_hours,
        matter_metrics=matter_metrics,
        trends=trends
    )
