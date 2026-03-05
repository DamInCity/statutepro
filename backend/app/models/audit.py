"""Audit log model for tracking all user actions."""
import enum
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class AuditAction(str, enum.Enum):
    """Types of auditable actions."""
    # CRUD operations
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    
    # Auth actions
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"
    
    # Document actions
    UPLOAD = "upload"
    DOWNLOAD = "download"
    VIEW = "view"
    SHARE = "share"
    
    # Billing actions
    INVOICE_SENT = "invoice_sent"
    PAYMENT_RECEIVED = "payment_received"
    
    # Trust account actions
    TRUST_DEPOSIT = "trust_deposit"
    TRUST_WITHDRAWAL = "trust_withdrawal"
    
    # Task actions
    TASK_ASSIGNED = "task_assigned"
    TASK_COMPLETED = "task_completed"
    
    # Export/Import
    EXPORT = "export"
    IMPORT = "import"


class AuditLog(BaseModel):
    """Immutable audit log for compliance and security."""
    
    __tablename__ = "audit_logs"
    
    # Action details
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction, name="audit_action", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    
    # Resource being acted upon
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    resource_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # User who performed the action
    user_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")
    user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Request context
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv6 max length
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Changes (for updates) - stores old/new values
    changes: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    # Additional context data
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    # Status
    success: Mapped[bool] = mapped_column(default=True, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    def __repr__(self) -> str:
        return f"<AuditLog {self.action} {self.resource_type}>"
