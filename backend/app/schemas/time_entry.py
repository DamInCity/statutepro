"""Time Entry schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.schemas.user import UserBrief
from app.schemas.matter import MatterBrief
from app.models.time_entry import TimeEntryStatus


class TimeEntryBase(BaseSchema):
    """Base time entry schema with common fields."""
    
    entry_date: date
    duration_minutes: int = Field(..., ge=1, description="Duration in minutes")
    description: str = Field(..., min_length=1)
    activity_code: Optional[str] = Field(None, max_length=50)
    is_billable: bool = True


class TimeEntryCreate(TimeEntryBase):
    """Schema for creating a new time entry."""
    
    matter_id: UUID
    hourly_rate: Optional[int] = Field(None, ge=0, description="Rate in cents, defaults to user rate")


class TimeEntryUpdate(BaseSchema):
    """Schema for updating a time entry (all fields optional)."""
    
    entry_date: Optional[date] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, min_length=1)
    activity_code: Optional[str] = Field(None, max_length=50)
    status: Optional[TimeEntryStatus] = None
    is_billable: Optional[bool] = None
    hourly_rate: Optional[int] = Field(None, ge=0)


class TimeEntryResponse(TimeEntryBase, TimestampSchema):
    """Schema for time entry API responses."""
    
    id: UUID
    matter_id: UUID
    user_id: UUID
    status: TimeEntryStatus
    hourly_rate: int
    is_billed: bool
    invoice_id: Optional[UUID]
    
    # Computed fields
    duration_hours: float
    total_amount: int


class TimeEntryDetail(TimeEntryResponse):
    """Detailed time entry response with nested objects."""
    
    matter: MatterBrief
    user: UserBrief


class TimeEntrySummary(BaseSchema):
    """Summary of time entries for reporting."""
    
    total_entries: int
    total_minutes: int
    total_hours: float
    total_amount: int
    billable_minutes: int
    non_billable_minutes: int
