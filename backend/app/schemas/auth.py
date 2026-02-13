"""Authentication schemas."""
from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema
from app.schemas.user import UserResponse


class LoginRequest(BaseSchema):
    """Schema for login request."""
    
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseSchema):
    """Schema for token response."""
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseSchema):
    """Schema for decoded token payload."""
    
    sub: str
    exp: int
    type: str


class RefreshTokenRequest(BaseSchema):
    """Schema for refresh token request."""
    
    refresh_token: str


class AuthResponse(BaseSchema):
    """Schema for full auth response with user info."""
    
    tokens: TokenResponse
    user: UserResponse


class PasswordChangeRequest(BaseSchema):
    """Schema for password change."""
    
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
