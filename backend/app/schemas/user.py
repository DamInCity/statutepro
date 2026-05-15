"""User schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.user import UserRole


class UserBase(BaseSchema):
    """Base user schema with common fields."""
    
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    role: UserRole = UserRole.ASSOCIATE
    hourly_rate: Optional[int] = Field(None, ge=0, description="Hourly rate in cents")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseSchema):
    """Schema for updating a user (all fields optional)."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    role: Optional[UserRole] = None
    hourly_rate: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class UserResponse(UserBase, TimestampSchema):
    """Schema for user API responses."""
    
    id: UUID
    is_active: bool
    is_verified: bool
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserBrief(BaseSchema):
    """Brief user info for nested responses."""
    
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
