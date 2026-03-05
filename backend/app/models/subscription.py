"""Subscription model for billing and plan management."""
import enum
from typing import Optional, TYPE_CHECKING
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Enum, Text, Integer, Date, DateTime, DECIMAL, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.organization import Organization


class PlanTier(str, enum.Enum):
    """Subscription plan tiers."""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class SubscriptionStatus(str, enum.Enum):
    """Status of subscription."""
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    PAUSED = "paused"
    EXPIRED = "expired"


class BillingInterval(str, enum.Enum):
    """Billing frequency."""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class Subscription(BaseModel):
    """Subscription model for organization billing."""
    
    __tablename__ = "subscriptions"
    
    # Organization relationship
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Plan details
    plan_tier: Mapped[PlanTier] = mapped_column(
        Enum(PlanTier, name="plan_tier"),
        default=PlanTier.FREE,
        nullable=False
    )
    
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, name="subscription_status"),
        default=SubscriptionStatus.TRIALING,
        nullable=False,
        index=True
    )
    
    billing_interval: Mapped[BillingInterval] = mapped_column(
        Enum(BillingInterval, name="billing_interval"),
        default=BillingInterval.MONTHLY,
        nullable=False
    )
    
    # Pricing (stored in cents to avoid floating point issues)
    price_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    
    # Seats
    seats_included: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    additional_seat_price_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Token limits
    monthly_tokens_included: Mapped[int] = mapped_column(Integer, default=100000, nullable=False)
    additional_token_price_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # per 1000 tokens
    
    # Dates
    trial_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    canceled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # External payment provider references (e.g., Stripe)
    external_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    external_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    external_product_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    external_price_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Discount
    discount_percent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0-100
    discount_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    discount_ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Auto-renewal
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="subscriptions"
    )
    
    @property
    def is_active(self) -> bool:
        """Check if subscription is currently active."""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
    
    @property
    def is_trialing(self) -> bool:
        """Check if subscription is in trial period."""
        return self.status == SubscriptionStatus.TRIALING
    
    @property
    def days_until_renewal(self) -> Optional[int]:
        """Calculate days until next renewal."""
        if self.current_period_end:
            delta = self.current_period_end.date() - date.today()
            return delta.days
        return None
    
    @property
    def effective_price_cents(self) -> int:
        """Calculate price after discount."""
        if self.discount_percent and self.discount_ends_at:
            if datetime.now(self.discount_ends_at.tzinfo) < self.discount_ends_at:
                return int(self.price_cents * (100 - self.discount_percent) / 100)
        return self.price_cents
    
    def __repr__(self) -> str:
        return f"<Subscription {self.plan_tier.value} for org {self.organization_id}>"
