"""Trust Account model for IOLTA compliance."""
import enum
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlalchemy import String, Text, Enum, Date, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.matter import Matter
    from app.models.user import User


class TrustAccountType(str, enum.Enum):
    """Type of trust account."""
    IOLTA = "iolta"  # Interest on Lawyers Trust Account
    CLIENT_TRUST = "client_trust"
    ESCROW = "escrow"
    RETAINER = "retainer"


class TrustAccount(BaseModel):
    """Trust account for holding client funds."""
    
    __tablename__ = "trust_accounts"
    
    # Account info
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_branch: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Type
    account_type: Mapped[TrustAccountType] = mapped_column(
        Enum(TrustAccountType, name="trust_account_type", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=TrustAccountType.CLIENT_TRUST,
        nullable=False
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Currency
    currency: Mapped[str] = mapped_column(String(3), default="KES", nullable=False)
    
    # Running balance (in cents)
    current_balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Transactions
    transactions: Mapped[List["TrustTransaction"]] = relationship(
        "TrustTransaction",
        back_populates="trust_account",
        cascade="all, delete-orphan"
    )
    
    # Client ledgers
    client_ledgers: Mapped[List["ClientTrustLedger"]] = relationship(
        "ClientTrustLedger",
        back_populates="trust_account",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<TrustAccount {self.account_name}>"


class TransactionType(str, enum.Enum):
    """Type of trust transaction."""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    INTEREST = "interest"
    FEE = "fee"
    PAYMENT_TO_FIRM = "payment_to_firm"  # Payment for services
    REFUND_TO_CLIENT = "refund_to_client"


class TrustTransaction(BaseModel):
    """Transaction in a trust account."""
    
    __tablename__ = "trust_transactions"
    
    # Relationship to trust account
    trust_account_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trust_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    trust_account: Mapped["TrustAccount"] = relationship(
        "TrustAccount",
        back_populates="transactions"
    )
    
    # Transaction details
    transaction_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # In cents, positive value
    running_balance: Mapped[int] = mapped_column(Integer, nullable=False)  # Balance after transaction
    
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    
    # Reference
    reference_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Client/Matter association
    client_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    matter_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # User who recorded the transaction
    recorded_by_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Link to invoice payment (if this is a payment to firm)
    invoice_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Reconciliation
    is_reconciled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reconciled_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    def __repr__(self) -> str:
        return f"<TrustTransaction {self.transaction_type.value} {self.amount}>"


class ClientTrustLedger(BaseModel):
    """Client-specific ledger within a trust account."""
    
    __tablename__ = "client_trust_ledgers"
    
    # Trust account
    trust_account_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trust_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    trust_account: Mapped["TrustAccount"] = relationship(
        "TrustAccount",
        back_populates="client_ledgers"
    )
    
    # Client
    client_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Optional matter-specific ledger
    matter_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Balance for this client/matter
    balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    def __repr__(self) -> str:
        return f"<ClientTrustLedger client={self.client_id} balance={self.balance}>"
