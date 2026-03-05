"""Currency and exchange rate models."""
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Boolean, Integer, Date, DateTime, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Currency(BaseModel):
    """Supported currencies in the system."""
    
    __tablename__ = "currencies"
    
    # ISO 4217 currency code (e.g., USD, EUR, GBP, KES)
    code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False, index=True)
    
    # Full name
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Symbol (e.g., $, €, £, KSh)
    symbol: Mapped[str] = mapped_column(String(10), nullable=False)
    
    # Decimal places (most currencies have 2, some like JPY have 0)
    decimal_places: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    
    # Symbol position: 'before' or 'after' the amount
    symbol_position: Mapped[str] = mapped_column(String(10), default="before", nullable=False)
    
    # Thousands separator and decimal separator
    thousands_separator: Mapped[str] = mapped_column(String(1), default=",", nullable=False)
    decimal_separator: Mapped[str] = mapped_column(String(1), default=".", nullable=False)
    
    # Whether this currency is active/available for selection
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Whether this is the system's base currency for conversions
    is_base_currency: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Country codes where this currency is used (comma-separated ISO 3166-1 alpha-2)
    country_codes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    exchange_rates_from: Mapped[List["ExchangeRate"]] = relationship(
        "ExchangeRate",
        back_populates="from_currency",
        foreign_keys="ExchangeRate.from_currency_code"
    )
    exchange_rates_to: Mapped[List["ExchangeRate"]] = relationship(
        "ExchangeRate",
        back_populates="to_currency",
        foreign_keys="ExchangeRate.to_currency_code"
    )
    
    def format_amount(self, amount: Decimal) -> str:
        """Format an amount with this currency's formatting rules."""
        # Round to appropriate decimal places
        rounded = round(amount, self.decimal_places)
        
        # Format with separators
        if self.decimal_places > 0:
            format_str = f"{{:,.{self.decimal_places}f}}"
        else:
            format_str = "{:,.0f}"
        
        formatted = format_str.format(rounded)
        
        # Replace default separators with currency-specific ones
        if self.thousands_separator != ",":
            formatted = formatted.replace(",", "TEMP")
        if self.decimal_separator != ".":
            formatted = formatted.replace(".", self.decimal_separator)
        if self.thousands_separator != ",":
            formatted = formatted.replace("TEMP", self.thousands_separator)
        
        # Add symbol
        if self.symbol_position == "before":
            return f"{self.symbol}{formatted}"
        else:
            return f"{formatted} {self.symbol}"
    
    def __repr__(self) -> str:
        return f"<Currency {self.code}>"


class ExchangeRate(BaseModel):
    """Exchange rates between currencies."""
    
    __tablename__ = "exchange_rates"
    __table_args__ = (
        UniqueConstraint('from_currency_code', 'to_currency_code', 'rate_date', name='uq_exchange_rate'),
    )
    
    # Source currency
    from_currency_code: Mapped[str] = mapped_column(
        String(3),
        ForeignKey("currencies.code", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Target currency
    to_currency_code: Mapped[str] = mapped_column(
        String(3),
        ForeignKey("currencies.code", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Exchange rate (how many units of to_currency for 1 unit of from_currency)
    rate: Mapped[Decimal] = mapped_column(DECIMAL(18, 8), nullable=False)
    
    # Date this rate is effective
    rate_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    
    # Source of the exchange rate
    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., "ECB", "OpenExchange", "Manual"
    
    # Timestamp when rate was fetched/updated
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    from_currency: Mapped["Currency"] = relationship(
        "Currency",
        back_populates="exchange_rates_from",
        foreign_keys=[from_currency_code]
    )
    to_currency: Mapped["Currency"] = relationship(
        "Currency",
        back_populates="exchange_rates_to",
        foreign_keys=[to_currency_code]
    )
    
    def convert(self, amount: Decimal) -> Decimal:
        """Convert an amount using this exchange rate."""
        return amount * self.rate
    
    @property
    def inverse_rate(self) -> Decimal:
        """Get the inverse exchange rate."""
        return Decimal(1) / self.rate
    
    def __repr__(self) -> str:
        return f"<ExchangeRate {self.from_currency_code}->{self.to_currency_code}: {self.rate}>"


class CurrencyConversionLog(BaseModel):
    """Log of currency conversions performed."""
    
    __tablename__ = "currency_conversion_logs"
    
    # Organization that performed the conversion
    organization_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Conversion details
    from_currency_code: Mapped[str] = mapped_column(String(3), nullable=False)
    to_currency_code: Mapped[str] = mapped_column(String(3), nullable=False)
    
    # Amounts
    original_amount: Mapped[Decimal] = mapped_column(DECIMAL(18, 4), nullable=False)
    converted_amount: Mapped[Decimal] = mapped_column(DECIMAL(18, 4), nullable=False)
    
    # Rate used
    exchange_rate: Mapped[Decimal] = mapped_column(DECIMAL(18, 8), nullable=False)
    rate_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Context (what was being converted)
    context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., "invoice", "trust_deposit", etc.
    reference_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # ID of related entity
    
    def __repr__(self) -> str:
        return f"<CurrencyConversion {self.original_amount} {self.from_currency_code} -> {self.converted_amount} {self.to_currency_code}>"
