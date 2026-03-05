"""Organization schemas for API requests/responses."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import EmailStr, Field, field_validator
import re
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.organization import OrganizationType


class OrganizationBase(BaseSchema):
    """Base organization schema."""
    
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    org_type: OrganizationType = OrganizationType.LAW_FIRM
    
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(default="US", max_length=2)
    
    timezone: str = Field(default="UTC", max_length=50)
    default_currency: str = Field(default="USD", max_length=3)
    
    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must only contain lowercase letters, numbers, and hyphens')
        return v


class OrganizationCreate(OrganizationBase):
    """Schema for creating a new organization."""
    
    billing_email: Optional[EmailStr] = None
    tax_id: Optional[str] = Field(None, max_length=50)
    max_seats: int = Field(default=5, ge=1)
    monthly_token_limit: int = Field(default=100000, ge=0)


class OrganizationUpdate(BaseSchema):
    """Schema for updating an organization."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    org_type: Optional[OrganizationType] = None
    
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=2)
    
    timezone: Optional[str] = Field(None, max_length=50)
    default_currency: Optional[str] = Field(None, max_length=3)
    logo_url: Optional[str] = Field(None, max_length=500)
    
    billing_email: Optional[EmailStr] = None
    tax_id: Optional[str] = Field(None, max_length=50)
    
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    
    max_seats: Optional[int] = Field(None, ge=1)
    monthly_token_limit: Optional[int] = Field(None, ge=0)
    storage_limit_mb: Optional[int] = Field(None, ge=0)
    
    feature_ai_assistant: Optional[bool] = None
    feature_document_assembly: Optional[bool] = None
    feature_analytics: Optional[bool] = None
    feature_api_access: Optional[bool] = None
    
    admin_notes: Optional[str] = None


class OrganizationResponse(OrganizationBase, TimestampSchema):
    """Schema for organization API responses."""
    
    id: UUID
    logo_url: Optional[str] = None
    billing_email: Optional[str] = None
    tax_id: Optional[str] = None
    
    is_active: bool
    is_verified: bool
    
    max_seats: int
    monthly_token_limit: int
    storage_limit_mb: int
    
    feature_ai_assistant: bool
    feature_document_assembly: bool
    feature_analytics: bool
    feature_api_access: bool


class OrganizationDetail(OrganizationResponse):
    """Detailed organization response with computed fields."""
    
    used_seats: int
    available_seats: int
    admin_notes: Optional[str] = None


class OrganizationBrief(BaseSchema):
    """Brief organization info for nested responses."""
    
    id: UUID
    name: str
    slug: str
    is_active: bool


class OrganizationStats(BaseSchema):
    """Statistics for an organization."""
    
    organization_id: UUID
    total_users: int
    active_users: int
    total_matters: int
    active_matters: int
    total_clients: int
    tokens_used_this_month: int
    tokens_remaining: int
    storage_used_mb: int
    storage_remaining_mb: int
