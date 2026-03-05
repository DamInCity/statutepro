"""Currency schemas for API requests/responses."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema


class CurrencyBase(BaseSchema):
    """Base currency schema."""
    
    code: str = Field(..., min_length=3, max_length=3)
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=10)
    decimal_places: int = Field(default=2, ge=0, le=4)
    symbol_position: str = Field(default="before", pattern=r'^(before|after)$')
    thousands_separator: str = Field(default=",", max_length=1)
    decimal_separator: str = Field(default=".", max_length=1)
    is_active: bool = True
    is_base_currency: bool = False
    country_codes: Optional[str] = None


class CurrencyCreate(CurrencyBase):
    """Schema for creating a currency."""
    pass


class CurrencyUpdate(BaseSchema):
    """Schema for updating a currency."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    symbol: Optional[str] = Field(None, min_length=1, max_length=10)
    decimal_places: Optional[int] = Field(None, ge=0, le=4)
    symbol_position: Optional[str] = Field(None, pattern=r'^(before|after)$')
    thousands_separator: Optional[str] = Field(None, max_length=1)
    decimal_separator: Optional[str] = Field(None, max_length=1)
    is_active: Optional[bool] = None
    is_base_currency: Optional[bool] = None
    country_codes: Optional[str] = None


class CurrencyResponse(CurrencyBase, TimestampSchema):
    """Schema for currency API responses."""
    
    id: UUID


class CurrencyBrief(BaseSchema):
    """Brief currency info."""
    
    code: str
    name: str
    symbol: str


class ExchangeRateBase(BaseSchema):
    """Base exchange rate schema."""
    
    from_currency_code: str = Field(..., min_length=3, max_length=3)
    to_currency_code: str = Field(..., min_length=3, max_length=3)
    rate: Decimal = Field(..., gt=0)
    rate_date: date
    source: Optional[str] = Field(None, max_length=100)


class ExchangeRateCreate(ExchangeRateBase):
    """Schema for creating an exchange rate."""
    pass


class ExchangeRateUpdate(BaseSchema):
    """Schema for updating an exchange rate."""
    
    rate: Optional[Decimal] = Field(None, gt=0)
    source: Optional[str] = Field(None, max_length=100)


class ExchangeRateResponse(ExchangeRateBase, TimestampSchema):
    """Schema for exchange rate API responses."""
    
    id: UUID
    fetched_at: datetime
    inverse_rate: Decimal


class CurrencyConversionRequest(BaseSchema):
    """Request to convert currency."""
    
    from_currency: str = Field(..., min_length=3, max_length=3)
    to_currency: str = Field(..., min_length=3, max_length=3)
    amount: Decimal = Field(..., gt=0)
    rate_date: Optional[date] = None  # If not provided, use latest rate


class CurrencyConversionResponse(BaseSchema):
    """Response from currency conversion."""
    
    from_currency: str
    to_currency: str
    original_amount: Decimal
    converted_amount: Decimal
    exchange_rate: Decimal
    rate_date: date
    formatted_original: str
    formatted_converted: str


class BulkConversionRequest(BaseSchema):
    """Request for bulk currency conversion."""
    
    amounts: List[CurrencyConversionRequest]


class BulkConversionResponse(BaseSchema):
    """Response for bulk currency conversion."""
    
    conversions: List[CurrencyConversionResponse]
    total_original: dict[str, Decimal]  # Totals by currency
    total_converted: dict[str, Decimal]


class ExchangeRateFetchRequest(BaseSchema):
    """Request to fetch exchange rates from external provider."""
    
    base_currency: str = Field(default="USD", min_length=3, max_length=3)
    target_currencies: Optional[List[str]] = None  # If None, fetch all active currencies
    source: str = Field(default="manual")


class ExchangeRateHistory(BaseSchema):
    """Historical exchange rates for a currency pair."""
    
    from_currency: str
    to_currency: str
    rates: List[dict]  # List of {date: str, rate: Decimal}
    start_date: date
    end_date: date
