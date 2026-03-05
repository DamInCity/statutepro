"""Token usage schemas for API requests/responses."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.token_usage import AIFeatureType, AIModel


class TokenUsageCreate(BaseSchema):
    """Schema for recording token usage."""
    
    organization_id: UUID
    user_id: Optional[UUID] = None
    
    feature_type: AIFeatureType
    model: AIModel = AIModel.QWEN3_235B
    
    prompt_tokens: int = Field(default=0, ge=0)
    completion_tokens: int = Field(default=0, ge=0)
    total_tokens: int = Field(default=0, ge=0)
    
    cost_micro_cents: int = Field(default=0, ge=0)
    
    request_id: Optional[str] = None
    response_time_ms: Optional[int] = None
    was_successful: bool = True
    error_message: Optional[str] = None


class TokenUsageResponse(TokenUsageCreate, TimestampSchema):
    """Schema for token usage API responses."""
    
    id: UUID
    usage_date: datetime
    usage_month: str
    
    # Computed
    cost_cents: float
    cost_dollars: float


class TokenUsageSummary(BaseSchema):
    """Summary of token usage for a period."""
    
    organization_id: UUID
    period: str  # YYYY-MM
    
    total_requests: int
    successful_requests: int
    failed_requests: int
    
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    
    total_cost_cents: float
    total_cost_dollars: float
    
    avg_response_time_ms: Optional[int] = None
    
    # Limit info
    token_limit: int
    tokens_remaining: int
    usage_percentage: float


class TokenUsageByFeature(BaseSchema):
    """Token usage breakdown by feature."""
    
    feature_type: AIFeatureType
    total_requests: int
    total_tokens: int
    total_cost_cents: float
    percentage_of_total: float


class TokenUsageByUser(BaseSchema):
    """Token usage breakdown by user."""
    
    user_id: UUID
    user_name: str
    user_email: str
    total_requests: int
    total_tokens: int
    total_cost_cents: float
    percentage_of_total: float


class TokenUsageByDay(BaseSchema):
    """Daily token usage for charts."""
    
    date: str  # YYYY-MM-DD
    total_requests: int
    total_tokens: int
    total_cost_cents: float


class OrganizationTokenDashboard(BaseSchema):
    """Complete token dashboard for an organization."""
    
    organization_id: UUID
    organization_name: str
    period: str
    
    summary: TokenUsageSummary
    by_feature: List[TokenUsageByFeature]
    by_user: List[TokenUsageByUser]
    daily_usage: List[TokenUsageByDay]


class PlatformTokenOverview(BaseSchema):
    """Platform-wide token usage overview for admins."""
    
    period: str
    
    total_organizations: int
    active_organizations: int
    
    total_requests: int
    total_tokens: int
    total_cost_dollars: float
    
    top_consuming_orgs: List[TokenUsageSummary]
    usage_by_model: dict[str, int]
    usage_by_feature: List[TokenUsageByFeature]
