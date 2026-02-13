"""User model for authentication and authorization."""
import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.time_entry import TimeEntry
    from app.models.task import Task
    from app.models.audit import AuditLog


class UserRole(str, enum.Enum):
    """User roles for access control."""
    ADMIN = "admin"
    PARTNER = "partner"
    ASSOCIATE = "associate"
    PARALEGAL = "paralegal"
    STAFF = "staff"
    READONLY = "readonly"


class User(BaseModel):
    """User account for the legal CMS."""
    
    __tablename__ = "users"
    
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
    
    # Role & Permissions
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", create_constraint=True),
        default=UserRole.ASSOCIATE,
        nullable=False
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Billing info
    hourly_rate: Mapped[Optional[int]] = mapped_column(nullable=True)  # In cents
    
    # Relationships
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
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
