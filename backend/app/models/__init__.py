"""Model exports for the application."""
from app.models.base import BaseModel, TimestampMixin
from app.models.user import User, UserRole
from app.models.client import Client, ClientType, ClientStatus
from app.models.matter import Matter, MatterStatus, BillingType, PracticeArea
from app.models.contact import Contact
from app.models.document import Document, DocumentCategory
from app.models.time_entry import TimeEntry, TimeEntryStatus
from app.models.task import Task, TaskStatus, TaskPriority, TaskCategory
from app.models.audit import AuditLog, AuditAction
from app.models.invoice import Invoice, InvoiceStatus, InvoiceLineItem, Payment, PaymentMethod
from app.models.currency import Currency, ExchangeRate, CurrencyConversionLog
from app.models.organization import Organization, OrganizationType
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus, BillingInterval
from app.models.token_usage import TokenUsage, TokenUsageAggregate, AIFeatureType, AIModel
from app.models.trust_account import (
    TrustAccount, TrustAccountType, TrustTransaction, TransactionType, ClientTrustLedger
)

__all__ = [
    # Base
    "BaseModel",
    "TimestampMixin",
    # User
    "User",
    "UserRole",
    # Client
    "Client",
    "ClientType",
    "ClientStatus",
    # Matter
    "Matter",
    "MatterStatus",
    "BillingType",
    "PracticeArea",
    # Contact
    "Contact",
    # Document
    "Document",
    "DocumentCategory",
    # Time Entry
    "TimeEntry",
    "TimeEntryStatus",
    # Task
    "Task",
    "TaskStatus",
    "TaskPriority",
    "TaskCategory",
    # Audit
    "AuditLog",
    "AuditAction",
    # Invoice
    "Invoice",
    "InvoiceStatus",
    "InvoiceLineItem",
    "Payment",
    "PaymentMethod",
    # Currency
    "Currency",
    "ExchangeRate",
    "CurrencyConversionLog",
    # Organization
    "Organization",
    "OrganizationType",
    # Subscription
    "Subscription",
    "PlanTier",
    "SubscriptionStatus",
    "BillingInterval",
    # Token Usage
    "TokenUsage",
    "TokenUsageAggregate",
    "AIFeatureType",
    "AIModel",
    # Trust Account
    "TrustAccount",
    "TrustAccountType",
    "TrustTransaction",
    "TransactionType",
    "ClientTrustLedger",
]
