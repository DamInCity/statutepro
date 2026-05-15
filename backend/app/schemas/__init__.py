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
from app.schemas.task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskSummary,
    TaskStatusUpdate,
    TaskAssignmentUpdate,
    TaskBulkUpdate,
    TaskListResponse
)
from app.schemas.invoice import (
    InvoiceLineItemBase,
    InvoiceLineItemCreate,
    InvoiceLineItemResponse,
    PaymentBase,
    PaymentCreate,
    PaymentResponse,
    InvoiceBase,
    InvoiceCreate,
    InvoiceCreateFromTimeEntries,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceDetail,
    InvoiceBrief,
    InvoiceSummary
)
from app.schemas.currency import (
    CurrencyBase,
    CurrencyCreate,
    CurrencyUpdate,
    CurrencyResponse,
    CurrencyBrief,
    ExchangeRateBase,
    ExchangeRateCreate,
    ExchangeRateUpdate,
    ExchangeRateResponse,
    CurrencyConversionRequest,
    CurrencyConversionResponse,
    BulkConversionRequest,
    BulkConversionResponse,
    ExchangeRateFetchRequest,
    ExchangeRateHistory
)
from app.schemas.organization import (
    OrganizationBase,
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationDetail,
    OrganizationStats,
    OrganizationBrief
)
from app.schemas.subscription import (
    SubscriptionBase,
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SubscriptionBrief,
    PlanPricing,
    SubscriptionRenewalInfo
)
from app.schemas.token_usage import (
    TokenUsageCreate,
    TokenUsageResponse,
    TokenUsageSummary,
    TokenUsageByFeature,
    TokenUsageByUser,
    TokenUsageByDay,
    OrganizationTokenDashboard,
    PlatformTokenOverview
)
from app.schemas.trust_account import (
    TrustAccountBase,
    TrustAccountCreate,
    TrustAccountUpdate,
    TrustAccountResponse,
    TrustAccountBrief,
    TrustTransactionBase,
    TrustTransactionCreate,
    TrustTransactionResponse,
    TrustTransactionBrief,
    ClientTrustLedgerBase,
    ClientTrustLedgerCreate,
    ClientTrustLedgerResponse,
    TrustAccountSummary,
    ClientTrustBalance
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
    # Task
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskSummary",
    "TaskStatusUpdate",
    "TaskAssignmentUpdate",
    "TaskBulkUpdate",
    "TaskListResponse",
    # Invoice
    "InvoiceLineItemBase",
    "InvoiceLineItemCreate",
    "InvoiceLineItemResponse",
    "PaymentBase",
    "PaymentCreate",
    "PaymentResponse",
    "InvoiceBase",
    "InvoiceCreate",
    "InvoiceCreateFromTimeEntries",
    "InvoiceUpdate",
    "InvoiceResponse",
    "InvoiceDetail",
    "InvoiceBrief",
    "InvoiceSummary",
    # Currency
    "CurrencyBase",
    "CurrencyCreate",
    "CurrencyUpdate",
    "CurrencyResponse",
    "CurrencyBrief",
    "ExchangeRateBase",
    "ExchangeRateCreate",
    "ExchangeRateUpdate",
    "ExchangeRateResponse",
    "CurrencyConversionRequest",
    "CurrencyConversionResponse",
    "BulkConversionRequest",
    "BulkConversionResponse",
    "ExchangeRateFetchRequest",
    "ExchangeRateHistory",
    # Organization
    "OrganizationBase",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationResponse",
    "OrganizationDetail",
    "OrganizationStats",
    "OrganizationBrief",
    # Subscription
    "SubscriptionBase",
    "SubscriptionCreate",
    "SubscriptionUpdate",
    "SubscriptionResponse",
    "SubscriptionBrief",
    "PlanPricing",
    "SubscriptionRenewalInfo",
    # Token Usage
    "TokenUsageCreate",
    "TokenUsageResponse",
    "TokenUsageSummary",
    "TokenUsageByFeature",
    "TokenUsageByUser",
    "TokenUsageByDay",
    "OrganizationTokenDashboard",
    "PlatformTokenOverview",
    # Trust Account
    "TrustAccountBase",
    "TrustAccountCreate",
    "TrustAccountUpdate",
    "TrustAccountResponse",
    "TrustAccountBrief",
    "TrustTransactionBase",
    "TrustTransactionCreate",
    "TrustTransactionResponse",
    "TrustTransactionBrief",
    "ClientTrustLedgerBase",
    "ClientTrustLedgerCreate",
    "ClientTrustLedgerResponse",
    "TrustAccountSummary",
    "ClientTrustBalance",
]
