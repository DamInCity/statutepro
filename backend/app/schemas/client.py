"""Client schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.client import ClientType, ClientStatus


class ClientBase(BaseSchema):
    """Base client schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=255)
    client_type: ClientType = ClientType.INDIVIDUAL
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    
    # Address
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(default="Kenya", max_length=100)
    
    # Business
    industry: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    
    # Billing
    billing_email: Optional[EmailStr] = None
    default_billing_rate: Optional[int] = Field(None, ge=0, description="Rate in cents")
    payment_terms_days: int = Field(default=30, ge=0)
    
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseSchema):
    """Schema for updating a client (all fields optional)."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    client_type: Optional[ClientType] = None
    status: Optional[ClientStatus] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    billing_email: Optional[EmailStr] = None
    default_billing_rate: Optional[int] = Field(None, ge=0)
    payment_terms_days: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    conflict_check_completed: Optional[bool] = None


class ClientResponse(ClientBase, TimestampSchema):
    """Schema for client API responses."""
    
    id: UUID
    client_number: str
    status: ClientStatus
    conflict_check_completed: bool


class ClientBrief(BaseSchema):
    """Brief client info for nested responses."""
    
    id: UUID
    client_number: str
    name: str
    client_type: ClientType
    status: ClientStatus
