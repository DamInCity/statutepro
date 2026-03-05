"""Token usage tracking for AI features."""
import enum
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Enum, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.user import User


class AIFeatureType(str, enum.Enum):
    """Types of AI features that consume tokens."""
    CHAT_ASSISTANT = "chat_assistant"
    DOCUMENT_SUMMARY = "document_summary"
    DOCUMENT_DRAFTING = "document_drafting"
    EMAIL_DRAFTING = "email_drafting"
    LEGAL_RESEARCH = "legal_research"
    CONTRACT_REVIEW = "contract_review"
    CASE_ANALYSIS = "case_analysis"
    TRANSLATION = "translation"
    OTHER = "other"


class AIModel(str, enum.Enum):
    """AI models available."""
    QWEN3_235B = "qwen3-235b-a22b"
    DEEPSEEK_R1 = "deepseek-r1"
    QWEN_VL_72B = "qwen2.5-vl-72b"
    GPT4 = "gpt-4"
    GPT4_TURBO = "gpt-4-turbo"
    CLAUDE_3_OPUS = "claude-3-opus"
    OTHER = "other"


class TokenUsage(BaseModel):
    """Track AI token usage per organization and user."""
    
    __tablename__ = "token_usage"
    
    # Organization relationship
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # User who made the request (optional, for per-user tracking)
    user_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Feature and model info
    feature_type: Mapped[AIFeatureType] = mapped_column(
        Enum(AIFeatureType, name="ai_feature_type"),
        nullable=False,
        index=True
    )
    
    model: Mapped[AIModel] = mapped_column(
        Enum(AIModel, name="ai_model"),
        default=AIModel.QWEN3_235B,
        nullable=False
    )
    
    # Token counts
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Cost tracking (in micro-cents for precision: 1 cent = 1,000,000 micro-cents)
    cost_micro_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Request metadata
    request_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Response time in milliseconds
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Success/failure tracking
    was_successful: Mapped[bool] = mapped_column(default=True, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # For aggregation queries (denormalized for performance)
    usage_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False,
        index=True
    )
    usage_month: Mapped[str] = mapped_column(String(7), nullable=False, index=True)  # YYYY-MM format
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="token_usage"
    )
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="token_usage"
    )
    
    @property
    def cost_cents(self) -> float:
        """Convert micro-cents to cents."""
        return self.cost_micro_cents / 1_000_000
    
    @property
    def cost_dollars(self) -> float:
        """Convert micro-cents to dollars."""
        return self.cost_micro_cents / 100_000_000
    
    def __repr__(self) -> str:
        return f"<TokenUsage {self.total_tokens} tokens for {self.feature_type.value}>"


class TokenUsageAggregate(BaseModel):
    """Pre-aggregated token usage for faster reporting."""
    
    __tablename__ = "token_usage_aggregates"
    
    # Organization
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Aggregation period (YYYY-MM format)
    period: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    
    # Feature breakdown (nullable for org-level aggregates)
    feature_type: Mapped[Optional[AIFeatureType]] = mapped_column(
        Enum(AIFeatureType, name="ai_feature_type", create_type=False),
        nullable=True
    )
    
    # Aggregated counts
    total_requests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_cost_micro_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Success rate
    successful_requests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_requests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Average response time
    avg_response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    def __repr__(self) -> str:
        return f"<TokenUsageAggregate {self.period} for org {self.organization_id}>"
