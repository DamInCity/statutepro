"""Matter schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.schemas.client import ClientBrief
from app.schemas.user import UserBrief
from app.models.matter import MatterStatus, BillingType, PracticeArea


class MatterBase(BaseSchema):
    """Base matter schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    practice_area: PracticeArea
    billing_type: BillingType = BillingType.HOURLY
    
    # Dates
    open_date: date
    statute_of_limitations: Optional[date] = None
    
    # Billing
    budget_amount: Optional[int] = Field(None, ge=0, description="Budget in cents")
    hourly_rate_override: Optional[int] = Field(None, ge=0, description="Rate in cents")
    
    # Court info
    jurisdiction: Optional[str] = Field(None, max_length=100)
    court: Optional[str] = Field(None, max_length=255)
    case_number: Optional[str] = Field(None, max_length=100)
    judge: Optional[str] = Field(None, max_length=255)
    
    # Opposing
    opposing_party: Optional[str] = Field(None, max_length=255)
    opposing_counsel: Optional[str] = Field(None, max_length=255)
    
    notes: Optional[str] = None


class MatterCreate(MatterBase):
    """Schema for creating a new matter."""
    
    client_id: UUID
    responsible_attorney_id: Optional[UUID] = None


class MatterUpdate(BaseSchema):
    """Schema for updating a matter (all fields optional)."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[MatterStatus] = None
    practice_area: Optional[PracticeArea] = None
    billing_type: Optional[BillingType] = None
    close_date: Optional[date] = None
    statute_of_limitations: Optional[date] = None
    budget_amount: Optional[int] = Field(None, ge=0)
    hourly_rate_override: Optional[int] = Field(None, ge=0)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    court: Optional[str] = Field(None, max_length=255)
    case_number: Optional[str] = Field(None, max_length=100)
    judge: Optional[str] = Field(None, max_length=255)
    opposing_party: Optional[str] = Field(None, max_length=255)
    opposing_counsel: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    responsible_attorney_id: Optional[UUID] = None


class MatterResponse(MatterBase, TimestampSchema):
    """Schema for matter API responses."""
    
    id: UUID
    matter_number: str
    status: MatterStatus
    close_date: Optional[date]
    client_id: UUID
    responsible_attorney_id: Optional[UUID]


class MatterDetail(MatterResponse):
    """Detailed matter response with nested objects."""
    
    client: ClientBrief
    responsible_attorney: Optional[UserBrief]


class MatterBrief(BaseSchema):
    """Brief matter info for nested responses."""
    
    id: UUID
    matter_number: str
    name: str
    status: MatterStatus
    practice_area: PracticeArea
