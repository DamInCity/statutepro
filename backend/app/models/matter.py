"""Matter (Case) model - the core unit of legal work."""
import enum
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlalchemy import String, Text, Enum, Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.user import User
    from app.models.document import Document
    from app.models.time_entry import TimeEntry
    from app.models.invoice import Invoice
    from app.models.task import Task


class MatterStatus(str, enum.Enum):
    """Status of a matter/case."""
    INTAKE = "intake"
    ACTIVE = "active"
    PENDING = "pending"
    ON_HOLD = "on_hold"
    CLOSED = "closed"
    ARCHIVED = "archived"


class BillingType(str, enum.Enum):
    """Billing arrangement for the matter."""
    HOURLY = "hourly"
    FIXED = "fixed"
    CONTINGENCY = "contingency"
    PRO_BONO = "pro_bono"
    HYBRID = "hybrid"


class PracticeArea(str, enum.Enum):
    """Practice area categories."""
    CORPORATE = "corporate"
    LITIGATION = "litigation"
    EMPLOYMENT = "employment"
    REAL_ESTATE = "real_estate"
    FAMILY = "family"
    CRIMINAL = "criminal"
    IP = "intellectual_property"
    TAX = "tax"
    IMMIGRATION = "immigration"
    BANKING = "banking"
    INSURANCE = "insurance"
    ENVIRONMENTAL = "environmental"
    OTHER = "other"


class Matter(BaseModel):
    """A legal matter/case - the core work unit."""
    
    __tablename__ = "matters"
    
    # Identification
    matter_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status & Type
    status: Mapped[MatterStatus] = mapped_column(
        Enum(MatterStatus, name="matter_status", create_constraint=True),
        default=MatterStatus.INTAKE,
        nullable=False,
        index=True
    )
    practice_area: Mapped[PracticeArea] = mapped_column(
        Enum(PracticeArea, name="practice_area", create_constraint=True),
        nullable=False,
        index=True
    )
    
    # Dates
    open_date: Mapped[date] = mapped_column(Date, nullable=False)
    close_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    statute_of_limitations: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Relationships
    client_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    client: Mapped["Client"] = relationship("Client", back_populates="matters")
    
    responsible_attorney_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    responsible_attorney: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="matters",
        foreign_keys=[responsible_attorney_id]
    )
    
    # Billing
    billing_type: Mapped[BillingType] = mapped_column(
        Enum(BillingType, name="billing_type", create_constraint=True),
        default=BillingType.HOURLY,
        nullable=False
    )
    budget_amount: Mapped[Optional[int]] = mapped_column(nullable=True)  # In cents
    hourly_rate_override: Mapped[Optional[int]] = mapped_column(nullable=True)  # In cents
    
    # Jurisdiction
    jurisdiction: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    court: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    case_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    judge: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Opposing party
    opposing_party: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    opposing_counsel: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Related entities
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="matter",
        cascade="all, delete-orphan"
    )
    time_entries: Mapped[List["TimeEntry"]] = relationship(
        "TimeEntry",
        back_populates="matter",
        cascade="all, delete-orphan"
    )
    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="matter"
    )
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="matter",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Matter {self.matter_number}: {self.name}>"
