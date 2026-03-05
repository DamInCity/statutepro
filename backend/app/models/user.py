"""User model for authentication and authorization."""
import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.time_entry import TimeEntry
    from app.models.task import Task
    from app.models.audit import AuditLog
    from app.models.organization import Organization
    from app.models.token_usage import TokenUsage


class UserRole(str, enum.Enum):
    """User roles for access control within an organization."""
    OWNER = "owner"          # Organization owner (full access)
    ADMIN = "admin"          # Organization admin
    PARTNER = "partner"
    ASSOCIATE = "associate"
    PARALEGAL = "paralegal"
    STAFF = "staff"
    READONLY = "readonly"


class User(BaseModel):
    """User account for the legal CMS."""
    
    __tablename__ = "users"
    
    # Organization relationship (multi-tenancy)
    organization_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Authentication
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Role & Permissions (within organization)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.ASSOCIATE,
        nullable=False
    )
    
    # Platform admin flag (super admin, separate from org roles)
    is_platform_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Billing info
    hourly_rate: Mapped[Optional[int]] = mapped_column(nullable=True)  # In cents
    
    # Relationships
    organization: Mapped[Optional["Organization"]] = relationship(
        "Organization",
        back_populates="users",
        foreign_keys=[organization_id]
    )
    matters: Mapped[List["Matter"]] = relationship(
        "Matter",
        back_populates="responsible_attorney",
        foreign_keys="Matter.responsible_attorney_id"
    )
    time_entries: Mapped[List["TimeEntry"]] = relationship(
        "TimeEntry",
        back_populates="user"
    )
    assigned_tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="assigned_to",
        foreign_keys="Task.assigned_to_id"
    )
    created_tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="created_by",
        foreign_keys="Task.created_by_id"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user"
    )
    token_usage: Mapped[List["TokenUsage"]] = relationship(
        "TokenUsage",
        back_populates="user"
    )
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_org_admin(self) -> bool:
        """Check if user is an organization admin or owner."""
        return self.role in [UserRole.OWNER, UserRole.ADMIN]
    
    @property
    def can_manage_users(self) -> bool:
        """Check if user can manage other users in the organization."""
        return self.role in [UserRole.OWNER, UserRole.ADMIN]
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
