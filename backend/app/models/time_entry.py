"""Time Entry model for billing and time tracking."""
import enum
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlalchemy import String, Text, Enum, Date, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.user import User
    from app.models.invoice import InvoiceLineItem


class TimeEntryStatus(str, enum.Enum):
    """Status of a time entry in the billing workflow."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    BILLED = "billed"
    WRITTEN_OFF = "written_off"


class TimeEntry(BaseModel):
    """Time entry for billing purposes."""
    
    __tablename__ = "time_entries"
    
    # Time details
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)  # In minutes
    
    # Description
    description: Mapped[str] = mapped_column(Text, nullable=False)
    activity_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Billing
    status: Mapped[TimeEntryStatus] = mapped_column(
        Enum(TimeEntryStatus, name="time_entry_status", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=TimeEntryStatus.DRAFT,
        nullable=False,
        index=True
    )
    hourly_rate: Mapped[int] = mapped_column(Integer, nullable=False)  # In cents
    is_billable: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_billed: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    # Relationships
    matter_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    matter: Mapped["Matter"] = relationship("Matter", back_populates="time_entries")
    
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user: Mapped["User"] = relationship("User", back_populates="time_entries")
    
    # Invoice line items (when billed)
    invoice_line_items: Mapped[List["InvoiceLineItem"]] = relationship(
        "InvoiceLineItem",
        back_populates="time_entry"
    )
    
    @property
    def duration_hours(self) -> float:
        """Duration in decimal hours (for billing)."""
        return self.duration_minutes / 60.0
    
    @property
    def total_amount(self) -> int:
        """Total billable amount in cents."""
        return int((self.duration_minutes / 60.0) * self.hourly_rate)
    
    def __repr__(self) -> str:
        return f"<TimeEntry {self.entry_date} - {self.duration_minutes}min>"
