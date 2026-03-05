"""Trust Account schemas for API requests/responses."""
from typing import Optional, List
from uuid import UUID
from datetime import date
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.trust_account import TrustAccountType, TransactionType


class TrustAccountBase(BaseSchema):
    """Base trust account schema."""
    
    account_name: str = Field(..., min_length=1, max_length=255)
    account_number: str = Field(..., min_length=1, max_length=50)
    bank_name: str = Field(..., min_length=1, max_length=255)
    bank_branch: Optional[str] = Field(None, max_length=255)
    account_type: TrustAccountType = TrustAccountType.CLIENT_TRUST
    currency: str = Field(default="KES", max_length=3)
    notes: Optional[str] = None


class TrustAccountCreate(TrustAccountBase):
    """Schema for creating a trust account."""
    pass


class TrustAccountUpdate(BaseSchema):
    """Schema for updating a trust account."""
    
    account_name: Optional[str] = Field(None, min_length=1, max_length=255)
    bank_name: Optional[str] = Field(None, min_length=1, max_length=255)
    bank_branch: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class TrustAccountResponse(TrustAccountBase, TimestampSchema):
    """Schema for trust account response."""
    
    id: UUID
    is_active: bool
    current_balance: int


class TrustAccountBrief(BaseSchema):
    """Brief trust account info."""
    
    id: UUID
    account_name: str
    account_number: str
    account_type: TrustAccountType
    currency: str
    current_balance: int
    is_active: bool


class TrustTransactionBase(BaseSchema):
    """Base trust transaction schema."""
    
    transaction_type: TransactionType
    amount: int = Field(..., gt=0, description="Amount in cents (always positive)")
    transaction_date: date
    description: str = Field(..., min_length=1)
    reference_number: Optional[str] = Field(None, max_length=100)


class TrustTransactionCreate(TrustTransactionBase):
    """Schema for creating a trust transaction."""
    
    trust_account_id: UUID
    client_id: Optional[UUID] = None
    matter_id: Optional[UUID] = None
    invoice_id: Optional[UUID] = None  # For payment to firm


class TrustTransactionResponse(TrustTransactionBase, TimestampSchema):
    """Schema for trust transaction response."""
    
    id: UUID
    trust_account_id: UUID
    running_balance: int
    client_id: Optional[UUID]
    matter_id: Optional[UUID]
    recorded_by_id: Optional[UUID]
    invoice_id: Optional[UUID]
    is_reconciled: bool
    reconciled_date: Optional[date]


class TrustTransactionBrief(BaseSchema):
    """Brief transaction info for lists."""
    
    id: UUID
    transaction_type: TransactionType
    amount: int
    transaction_date: date
    description: str
    running_balance: int


class ClientTrustLedgerBase(BaseSchema):
    """Base client trust ledger schema."""
    
    client_id: UUID
    matter_id: Optional[UUID] = None


class ClientTrustLedgerCreate(ClientTrustLedgerBase):
    """Schema for creating a client trust ledger."""
    
    trust_account_id: UUID


class ClientTrustLedgerResponse(ClientTrustLedgerBase, TimestampSchema):
    """Schema for client trust ledger response."""
    
    id: UUID
    trust_account_id: UUID
    balance: int
    is_active: bool


class TrustAccountSummary(BaseSchema):
    """Summary of trust accounts."""
    
    total_accounts: int
    active_accounts: int
    total_balance: int
    total_client_funds: int


class ClientTrustBalance(BaseSchema):
    """Client's trust balance across all accounts."""
    
    client_id: UUID
    client_name: str
    total_balance: int
    ledger_count: int
