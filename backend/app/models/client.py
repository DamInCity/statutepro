"""Client model for law firm clients."""
import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.contact import Contact
    from app.models.invoice import Invoice


class ClientType(str, enum.Enum):
    """Type of client entity."""
    INDIVIDUAL = "individual"
    CORPORATION = "corporation"
    PARTNERSHIP = "partnership"
    LLC = "llc"
    NONPROFIT = "nonprofit"
    GOVERNMENT = "government"
    OTHER = "other"


class ClientStatus(str, enum.Enum):
    """Client relationship status."""
    PROSPECT = "prospect"
    ACTIVE = "active"
    INACTIVE = "inactive"
    FORMER = "former"
    DECLINED = "declined"


class Client(BaseModel):
    """Client entity - individuals or organizations the firm represents."""
    
    __tablename__ = "clients"
    
    # Basic Information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    client_number: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        index=True, 
        nullable=False
    )
    client_type: Mapped[ClientType] = mapped_column(
        Enum(ClientType, name="client_type", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=ClientType.INDIVIDUAL,
        nullable=False
    )
    status: Mapped[ClientStatus] = mapped_column(
        Enum(ClientStatus, name="client_status", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=ClientStatus.ACTIVE,
        nullable=False
    )
    
    # Contact Information
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Address
    address_line1: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Kenya", nullable=False)
    
    # Business Details
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tax_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Billing
    billing_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    default_billing_rate: Mapped[Optional[int]] = mapped_column(nullable=True)  # In cents
    payment_terms_days: Mapped[int] = mapped_column(default=30, nullable=False)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Conflict check
    conflict_check_completed: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        nullable=False
    )
    
    # Relationships
    matters: Mapped[List["Matter"]] = relationship(
        "Matter",
        back_populates="client",
        cascade="all, delete-orphan"
    )
    contacts: Mapped[List["Contact"]] = relationship(
        "Contact",
        back_populates="client",
        cascade="all, delete-orphan"
    )
    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="client",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Client {self.client_number}: {self.name}>"
