"""Organization model for multi-tenancy."""
import enum
from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Boolean, Enum, Text, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.subscription import Subscription
    from app.models.token_usage import TokenUsage


class OrganizationType(str, enum.Enum):
    """Type of organization."""
    LAW_FIRM = "law_firm"
    LEGAL_DEPARTMENT = "legal_department"
    SOLO_PRACTITIONER = "solo_practitioner"
    GOVERNMENT = "government"
    NON_PROFIT = "non_profit"


class Organization(BaseModel):
    """Organization/Tenant model for multi-tenancy."""
    
    __tablename__ = "organizations"
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    
    # Organization details
    org_type: Mapped[OrganizationType] = mapped_column(
        Enum(OrganizationType, name="organization_type"),
        default=OrganizationType.LAW_FIRM,
        nullable=False
    )
    
    # Contact info
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Address
    address_line1: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(2), default="US", nullable=False)  # ISO 3166-1 alpha-2
    
    # Settings
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    default_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)  # ISO 4217
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Billing
    billing_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tax_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Limits (can be overridden by subscription)
    max_seats: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    monthly_token_limit: Mapped[int] = mapped_column(Integer, default=100000, nullable=False)  # AI tokens
    storage_limit_mb: Mapped[int] = mapped_column(Integer, default=5000, nullable=False)  # 5GB default
    
    # Feature flags (JSON could be used, but explicit columns are clearer)
    feature_ai_assistant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    feature_document_assembly: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    feature_analytics: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    feature_api_access: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Notes (internal admin notes)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="organization",
        foreign_keys="User.organization_id"
    )
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="organization"
    )
    token_usage: Mapped[List["TokenUsage"]] = relationship(
        "TokenUsage",
        back_populates="organization"
    )
    
    @property
    def active_subscription(self) -> Optional["Subscription"]:
        """Get the currently active subscription."""
        from app.models.subscription import SubscriptionStatus
        for sub in self.subscriptions:
            if sub.status == SubscriptionStatus.ACTIVE:
                return sub
        return None
    
    @property
    def used_seats(self) -> int:
        """Count active users in this organization."""
        return len([u for u in self.users if u.is_active])
    
    @property
    def available_seats(self) -> int:
        """Calculate remaining available seats."""
        return max(0, self.max_seats - self.used_seats)
    
    def __repr__(self) -> str:
        return f"<Organization {self.name}>"
