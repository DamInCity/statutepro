"""Schema exports for the application."""
from app.schemas.base import BaseSchema, TimestampSchema, IDSchema
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    TokenPayload,
    RefreshTokenRequest,
    AuthResponse,
    PasswordChangeRequest
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserBrief
)
from app.schemas.client import (
    ClientBase,
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientBrief
)
from app.schemas.matter import (
    MatterBase,
    MatterCreate,
    MatterUpdate,
    MatterResponse,
    MatterDetail,
    MatterBrief
)
from app.schemas.contact import (
    ContactBase,
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    ContactBrief
)
from app.schemas.document import (
    DocumentBase,
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentBrief
)
from app.schemas.time_entry import (
    TimeEntryBase,
    TimeEntryCreate,
    TimeEntryUpdate,
    TimeEntryResponse,
    TimeEntryDetail,
    TimeEntrySummary
)
from app.schemas.invoice import (
    InvoiceBase,
    InvoiceCreate,
    InvoiceCreateFromTimeEntries,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceDetail,
    InvoiceBrief,
    InvoiceSummary,
    InvoiceLineItemCreate,
    InvoiceLineItemResponse,
    PaymentCreate,
    PaymentResponse
)
from app.schemas.trust_account import (
    TrustAccountBase,
    TrustAccountCreate,
    TrustAccountUpdate,
    TrustAccountResponse,
    TrustAccountBrief,
    TrustTransactionCreate,
    TrustTransactionResponse,
    TrustTransactionBrief,
    ClientTrustLedgerCreate,
    ClientTrustLedgerResponse,
    TrustAccountSummary,
    ClientTrustBalance
)
from app.schemas.task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskStatusUpdate,
    TaskAssignmentUpdate,
    TaskBulkUpdate,
    TaskSummary
)

__all__ = [
    # Base
    "BaseSchema",
    "TimestampSchema",
    "IDSchema",
    # Auth
    "LoginRequest",
    "TokenResponse",
    "TokenPayload",
    "RefreshTokenRequest",
    "AuthResponse",
    "PasswordChangeRequest",
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserBrief",
    # Client
    "ClientBase",
    "ClientCreate",
    "ClientUpdate",
    "ClientResponse",
    "ClientBrief",
    # Matter
    "MatterBase",
    "MatterCreate",
    "MatterUpdate",
    "MatterResponse",
    "MatterDetail",
    "MatterBrief",
    # Contact
    "ContactBase",
    "ContactCreate",
    "ContactUpdate",
    "ContactResponse",
    "ContactBrief",
    # Document
    "DocumentBase",
    "DocumentCreate",
    "DocumentUpdate",
    "DocumentResponse",
    "DocumentBrief",
    # Time Entry
    "TimeEntryBase",
    "TimeEntryCreate",
    "TimeEntryUpdate",
    "TimeEntryResponse",
    "TimeEntryDetail",
    "TimeEntrySummary",
    # Invoice
    "InvoiceBase",
    "InvoiceCreate",
    "InvoiceCreateFromTimeEntries",
    "InvoiceUpdate",
    "InvoiceResponse",
    "InvoiceDetail",
    "InvoiceBrief",
    "InvoiceSummary",
    "InvoiceLineItemCreate",
    "InvoiceLineItemResponse",
    "PaymentCreate",
    "PaymentResponse",
    # Trust Account
    "TrustAccountBase",
    "TrustAccountCreate",
    "TrustAccountUpdate",
    "TrustAccountResponse",
    "TrustAccountBrief",
    "TrustTransactionCreate",
    "TrustTransactionResponse",
    "TrustTransactionBrief",
    "ClientTrustLedgerCreate",
    "ClientTrustLedgerResponse",
    "TrustAccountSummary",
    "ClientTrustBalance",
    # Task
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
    "TaskStatusUpdate",
    "TaskAssignmentUpdate",
    "TaskBulkUpdate",
    "TaskSummary",
]
