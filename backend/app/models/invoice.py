"""Invoice model for billing and payments."""
import enum
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from decimal import Decimal
from sqlalchemy import String, Text, Enum, Date, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.matter import Matter
    from app.models.time_entry import TimeEntry


class InvoiceStatus(str, enum.Enum):
    """Status of an invoice."""
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"
    VOID = "void"
    WRITTEN_OFF = "written_off"


class Invoice(BaseModel):
    """Invoice for billing clients."""
    
    __tablename__ = "invoices"
    
    # Identification
    invoice_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )
    
    # Relationships
    client_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    client: Mapped["Client"] = relationship("Client", back_populates="invoices")
    
    matter_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    matter: Mapped[Optional["Matter"]] = relationship("Matter", back_populates="invoices")
    
    # Status
    status: Mapped[InvoiceStatus] = mapped_column(
        Enum(InvoiceStatus, name="invoice_status", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=InvoiceStatus.DRAFT,
        nullable=False,
        index=True
    )
    
    # Dates
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Amounts (in cents for precision)
    subtotal: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tax_rate: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # Basis points (1600 = 16%)
    tax_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    discount_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    amount_paid: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    @property
    def balance_due(self) -> int:
        """Calculate remaining balance."""
        return self.total_amount - self.amount_paid
    
    # Billing details
    billing_period_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    billing_period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_terms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Currency
    currency: Mapped[str] = mapped_column(String(3), default="KES", nullable=False)
    
    # Related line items and payments
    line_items: Mapped[List["InvoiceLineItem"]] = relationship(
        "InvoiceLineItem",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_number}>"


class InvoiceLineItem(BaseModel):
    """Line item on an invoice."""
    
    __tablename__ = "invoice_line_items"
    
    # Relationship to invoice
    invoice_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="line_items")
    
    # Link to time entry (if applicable)
    time_entry_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("time_entries.id", ondelete="SET NULL"),
        nullable=True
    )
    time_entry: Mapped[Optional["TimeEntry"]] = relationship(
        "TimeEntry",
        back_populates="invoice_line_items"
    )
    
    # Line item details
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=100, nullable=False)  # In hundredths (100 = 1.00)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)  # In cents
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # In cents
    
    # For time entries
    entry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    timekeeper_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Order
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    def __repr__(self) -> str:
        return f"<InvoiceLineItem {self.description[:30]}...>"


class PaymentMethod(str, enum.Enum):
    """Payment method types."""
    CASH = "cash"
    CHECK = "check"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    MOBILE_MONEY = "mobile_money"  # M-Pesa, etc.
    TRUST_ACCOUNT = "trust_account"
    OTHER = "other"


class Payment(BaseModel):
    """Payment received against an invoice."""
    
    __tablename__ = "payments"
    
    # Relationship to invoice
    invoice_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")
    
    # Payment details
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # In cents
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    reference_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # From trust account
    trust_transaction_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )
    
    def __repr__(self) -> str:
        return f"<Payment {self.amount} on {self.payment_date}>"
