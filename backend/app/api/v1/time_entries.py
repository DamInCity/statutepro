"""Time Entry management API endpoints."""
from typing import List, Optional
from uuid import UUID
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, or_, func, and_
from sqlalchemy.orm import selectinload
from app.api.deps import DBSession, CurrentUser
from app.models.time_entry import TimeEntry, TimeEntryStatus
from app.models.matter import Matter
from app.models.user import User
from app.schemas.time_entry import (
    TimeEntryCreate, 
    TimeEntryUpdate, 
    TimeEntryResponse, 
    TimeEntryDetail,
    TimeEntrySummary
)
from app.schemas.matter import MatterBrief
from app.schemas.user import UserBrief

router = APIRouter(prefix="/time-entries", tags=["Time Entries"])


@router.post("", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_time_entry(
    entry_data: TimeEntryCreate,
    db: DBSession,
    current_user: CurrentUser
) -> TimeEntryResponse:
    """Create a new time entry."""
    
    # Verify matter exists
    result = await db.execute(select(Matter).where(Matter.id == entry_data.matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    # Determine hourly rate
    hourly_rate = entry_data.hourly_rate
    if hourly_rate is None:
        # Use matter override, then user rate, then default
        if matter.hourly_rate_override:
            hourly_rate = matter.hourly_rate_override
        elif current_user.hourly_rate:
            hourly_rate = current_user.hourly_rate
        else:
            hourly_rate = 0  # Default to 0 if no rate set
    
    time_entry = TimeEntry(
        entry_date=entry_data.entry_date,
        duration_minutes=entry_data.duration_minutes,
        description=entry_data.description,
        activity_code=entry_data.activity_code,
        is_billable=entry_data.is_billable,
        matter_id=entry_data.matter_id,
        user_id=current_user.id,
        hourly_rate=hourly_rate,
        status=TimeEntryStatus.DRAFT
    )
    
    db.add(time_entry)
    await db.flush()
    await db.refresh(time_entry)
    
    return _build_time_entry_response(time_entry)


@router.get("", response_model=List[TimeEntryResponse])
async def list_time_entries(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    matter_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    status: Optional[TimeEntryStatus] = None,
    is_billable: Optional[bool] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[TimeEntryResponse]:
    """List time entries with optional filtering."""
    
    query = select(TimeEntry)
    
    # Apply filters
    if matter_id:
        query = query.where(TimeEntry.matter_id == matter_id)
    if user_id:
        query = query.where(TimeEntry.user_id == user_id)
    if status:
        query = query.where(TimeEntry.status == status)
    if is_billable is not None:
        query = query.where(TimeEntry.is_billable == is_billable)
    if date_from:
        query = query.where(TimeEntry.entry_date >= date_from)
    if date_to:
        query = query.where(TimeEntry.entry_date <= date_to)
    
    query = query.order_by(TimeEntry.entry_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    entries = result.scalars().all()
    
    return [_build_time_entry_response(e) for e in entries]


@router.get("/my", response_model=List[TimeEntryResponse])
async def list_my_time_entries(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[TimeEntryResponse]:
    """List current user's time entries."""
    
    query = select(TimeEntry).where(TimeEntry.user_id == current_user.id)
    
    if date_from:
        query = query.where(TimeEntry.entry_date >= date_from)
    if date_to:
        query = query.where(TimeEntry.entry_date <= date_to)
    
    query = query.order_by(TimeEntry.entry_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    entries = result.scalars().all()
    
    return [_build_time_entry_response(e) for e in entries]


@router.get("/summary", response_model=TimeEntrySummary)
async def get_time_entry_summary(
    db: DBSession,
    current_user: CurrentUser,
    matter_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> TimeEntrySummary:
    """Get summary statistics for time entries."""
    
    # Build base query
    conditions = []
    if matter_id:
        conditions.append(TimeEntry.matter_id == matter_id)
    if user_id:
        conditions.append(TimeEntry.user_id == user_id)
    if date_from:
        conditions.append(TimeEntry.entry_date >= date_from)
    if date_to:
        conditions.append(TimeEntry.entry_date <= date_to)
    
    where_clause = and_(*conditions) if conditions else True
    
    # Get all matching entries
    query = select(TimeEntry).where(where_clause)
    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Calculate summary
    total_entries = len(entries)
    total_minutes = sum(e.duration_minutes for e in entries)
    billable_minutes = sum(e.duration_minutes for e in entries if e.is_billable)
    non_billable_minutes = total_minutes - billable_minutes
    total_amount = sum(e.total_amount for e in entries if e.is_billable)
    
    return TimeEntrySummary(
        total_entries=total_entries,
        total_minutes=total_minutes,
        total_hours=round(total_minutes / 60.0, 2),
        total_amount=total_amount,
        billable_minutes=billable_minutes,
        non_billable_minutes=non_billable_minutes
    )


@router.get("/{entry_id}", response_model=TimeEntryDetail)
async def get_time_entry(
    entry_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TimeEntryDetail:
    """Get a specific time entry by ID with full details."""
    
    query = (
        select(TimeEntry)
        .options(
            selectinload(TimeEntry.matter),
            selectinload(TimeEntry.user)
        )
        .where(TimeEntry.id == entry_id)
    )
    result = await db.execute(query)
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    return _build_time_entry_detail(entry)


@router.patch("/{entry_id}", response_model=TimeEntryResponse)
async def update_time_entry(
    entry_id: UUID,
    entry_data: TimeEntryUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> TimeEntryResponse:
    """Update a time entry."""
    
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Only owner or admin can edit
    if entry.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit another user's time entry"
        )
    
    # Cannot edit billed entries
    if entry.is_billed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a billed time entry"
        )
    
    # Apply updates
    update_data = entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    await db.flush()
    await db.refresh(entry)
    
    return _build_time_entry_response(entry)


@router.post("/{entry_id}/submit", response_model=TimeEntryResponse)
async def submit_time_entry(
    entry_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TimeEntryResponse:
    """Submit a time entry for approval."""
    
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    if entry.status != TimeEntryStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft entries can be submitted"
        )
    
    entry.status = TimeEntryStatus.SUBMITTED
    await db.flush()
    await db.refresh(entry)
    
    return _build_time_entry_response(entry)


@router.post("/{entry_id}/approve", response_model=TimeEntryResponse)
async def approve_time_entry(
    entry_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TimeEntryResponse:
    """Approve a submitted time entry."""
    
    # TODO: Add role check for approval permissions
    
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    if entry.status != TimeEntryStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted entries can be approved"
        )
    
    entry.status = TimeEntryStatus.APPROVED
    await db.flush()
    await db.refresh(entry)
    
    return _build_time_entry_response(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    entry_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> None:
    """Delete a time entry."""
    
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Only owner or admin can delete
    if entry.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's time entry"
        )
    
    # Cannot delete billed entries
    if entry.is_billed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a billed time entry"
        )
    
    await db.delete(entry)
    await db.flush()


def _build_time_entry_response(entry: TimeEntry) -> TimeEntryResponse:
    """Build TimeEntryResponse with computed fields."""
    return TimeEntryResponse(
        id=entry.id,
        entry_date=entry.entry_date,
        duration_minutes=entry.duration_minutes,
        description=entry.description,
        activity_code=entry.activity_code,
        is_billable=entry.is_billable,
        matter_id=entry.matter_id,
        user_id=entry.user_id,
        status=entry.status,
        hourly_rate=entry.hourly_rate,
        is_billed=entry.is_billed,
        invoice_id=entry.invoice_id,
        duration_hours=entry.duration_hours,
        total_amount=entry.total_amount,
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )


def _build_time_entry_detail(entry: TimeEntry) -> TimeEntryDetail:
    """Build TimeEntryDetail with nested objects."""
    response = _build_time_entry_response(entry)
    return TimeEntryDetail(
        **response.model_dump(),
        matter=MatterBrief.model_validate(entry.matter),
        user=UserBrief.model_validate(entry.user)
    )
