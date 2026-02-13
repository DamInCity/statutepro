"""Contact schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema, TimestampSchema


class ContactBase(BaseSchema):
    """Base contact schema with common fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=100)
    
    # Contact Details
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    mobile: Optional[str] = Field(None, max_length=50)
    
    # Address
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    # Role flags
    is_primary: bool = False
    is_billing_contact: bool = False
    
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    """Schema for creating a new contact."""
    
    client_id: UUID


class ContactUpdate(BaseSchema):
    """Schema for updating a contact (all fields optional)."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    mobile: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    is_primary: Optional[bool] = None
    is_billing_contact: Optional[bool] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase, TimestampSchema):
    """Schema for contact API responses."""
    
    id: UUID
    client_id: UUID


class ContactBrief(BaseSchema):
    """Brief contact info for nested responses."""
    
    id: UUID
    first_name: str
    last_name: str
    email: Optional[EmailStr]
    is_primary: bool
