"""Currency API endpoints."""
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.api.deps import get_db, get_current_user, require_platform_admin
from app.models import User
from app.models.currency import Currency, ExchangeRate, CurrencyConversionLog
from app.schemas.currency import (
    CurrencyCreate, CurrencyUpdate, CurrencyResponse, CurrencyBrief,
    ExchangeRateCreate, ExchangeRateUpdate, ExchangeRateResponse,
    CurrencyConversionRequest, CurrencyConversionResponse,
    BulkConversionRequest, BulkConversionResponse,
    ExchangeRateHistory
)

router = APIRouter(prefix="/currencies", tags=["currencies"])


# ============== Currency CRUD ==============

@router.get("", response_model=List[CurrencyResponse])
async def list_currencies(
    active_only: bool = Query(True, description="Only return active currencies"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all currencies."""
    
    query = select(Currency).order_by(Currency.code)
    
    if active_only:
        query = query.where(Currency.is_active == True)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/brief", response_model=List[CurrencyBrief])
async def list_currencies_brief(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List currencies with brief info (for dropdowns)."""
    
    result = await db.execute(
        select(Currency)
        .where(Currency.is_active == True)
        .order_by(Currency.code)
    )
    currencies = result.scalars().all()
    
    return [
        CurrencyBrief(code=c.code, name=c.name, symbol=c.symbol)
        for c in currencies
    ]


@router.get("/{code}", response_model=CurrencyResponse)
async def get_currency(
    code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get currency by code."""
    
    result = await db.execute(
        select(Currency).where(Currency.code == code.upper())
    )
    currency = result.scalar_one_or_none()
    
    if not currency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
    
    return currency


@router.post("", response_model=CurrencyResponse, status_code=status.HTTP_201_CREATED)
async def create_currency(
    currency_data: CurrencyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Create a new currency (admin only)."""
    
    # Check if currency already exists
    existing = await db.scalar(
        select(Currency).where(Currency.code == currency_data.code.upper())
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency with this code already exists"
        )
    
    currency = Currency(**currency_data.model_dump())
    currency.code = currency.code.upper()
    
    db.add(currency)
    await db.commit()
    await db.refresh(currency)
    return currency


@router.patch("/{code}", response_model=CurrencyResponse)
async def update_currency(
    code: str,
    currency_data: CurrencyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Update a currency (admin only)."""
    
    result = await db.execute(
        select(Currency).where(Currency.code == code.upper())
    )
    currency = result.scalar_one_or_none()
    
    if not currency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
    
    update_data = currency_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(currency, field, value)
    
    await db.commit()
    await db.refresh(currency)
    return currency


# ============== Exchange Rates ==============

@router.get("/rates/latest")
async def get_latest_rates(
    base: str = Query("USD", description="Base currency code"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get latest exchange rates for a base currency."""
    
    base = base.upper()
    
    # Get the latest rate date for this base currency
    latest_date_result = await db.execute(
        select(ExchangeRate.rate_date)
        .where(ExchangeRate.from_currency_code == base)
        .order_by(desc(ExchangeRate.rate_date))
        .limit(1)
    )
    latest_date = latest_date_result.scalar_one_or_none()
    
    if not latest_date:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No exchange rates found for {base}"
        )
    
    # Get all rates for that date
    result = await db.execute(
        select(ExchangeRate)
        .where(
            and_(
                ExchangeRate.from_currency_code == base,
                ExchangeRate.rate_date == latest_date
            )
        )
    )
    rates = result.scalars().all()
    
    return {
        "base": base,
        "date": latest_date.isoformat(),
        "rates": {r.to_currency_code: float(r.rate) for r in rates}
    }


@router.get("/rates/{from_code}/{to_code}", response_model=ExchangeRateResponse)
async def get_exchange_rate(
    from_code: str,
    to_code: str,
    rate_date: Optional[date] = Query(None, description="Date for rate (defaults to latest)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get exchange rate between two currencies."""
    
    from_code = from_code.upper()
    to_code = to_code.upper()
    
    query = select(ExchangeRate).where(
        and_(
            ExchangeRate.from_currency_code == from_code,
            ExchangeRate.to_currency_code == to_code
        )
    )
    
    if rate_date:
        query = query.where(ExchangeRate.rate_date == rate_date)
    else:
        query = query.order_by(desc(ExchangeRate.rate_date))
    
    result = await db.execute(query.limit(1))
    rate = result.scalar_one_or_none()
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exchange rate not found for {from_code} to {to_code}"
        )
    
    return ExchangeRateResponse(
        **{k: v for k, v in rate.__dict__.items() if not k.startswith('_')},
        inverse_rate=rate.inverse_rate
    )


@router.post("/rates", response_model=ExchangeRateResponse, status_code=status.HTTP_201_CREATED)
async def create_exchange_rate(
    rate_data: ExchangeRateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_platform_admin)
):
    """Create or update an exchange rate (admin only)."""
    
    from_code = rate_data.from_currency_code.upper()
    to_code = rate_data.to_currency_code.upper()
    
    # Verify currencies exist
    from_currency = await db.scalar(select(Currency).where(Currency.code == from_code))
    to_currency = await db.scalar(select(Currency).where(Currency.code == to_code))
    
    if not from_currency:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Currency {from_code} not found")
    if not to_currency:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Currency {to_code} not found")
    
    # Check if rate exists for this date
    existing = await db.scalar(
        select(ExchangeRate).where(
            and_(
                ExchangeRate.from_currency_code == from_code,
                ExchangeRate.to_currency_code == to_code,
                ExchangeRate.rate_date == rate_data.rate_date
            )
        )
    )
    
    if existing:
        # Update existing rate
        existing.rate = rate_data.rate
        existing.source = rate_data.source
        existing.fetched_at = datetime.now()
        await db.commit()
        await db.refresh(existing)
        rate = existing
    else:
        # Create new rate
        rate = ExchangeRate(
            from_currency_code=from_code,
            to_currency_code=to_code,
            rate=rate_data.rate,
            rate_date=rate_data.rate_date,
            source=rate_data.source,
            fetched_at=datetime.now()
        )
        db.add(rate)
        await db.commit()
        await db.refresh(rate)
    
    return ExchangeRateResponse(
        **{k: v for k, v in rate.__dict__.items() if not k.startswith('_')},
        inverse_rate=rate.inverse_rate
    )


@router.get("/rates/history/{from_code}/{to_code}", response_model=ExchangeRateHistory)
async def get_rate_history(
    from_code: str,
    to_code: str,
    start_date: date = Query(..., description="Start date"),
    end_date: date = Query(..., description="End date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get historical exchange rates between two currencies."""
    
    from_code = from_code.upper()
    to_code = to_code.upper()
    
    result = await db.execute(
        select(ExchangeRate)
        .where(
            and_(
                ExchangeRate.from_currency_code == from_code,
                ExchangeRate.to_currency_code == to_code,
                ExchangeRate.rate_date >= start_date,
                ExchangeRate.rate_date <= end_date
            )
        )
        .order_by(ExchangeRate.rate_date)
    )
    rates = result.scalars().all()
    
    return ExchangeRateHistory(
        from_currency=from_code,
        to_currency=to_code,
        rates=[{"date": r.rate_date.isoformat(), "rate": r.rate} for r in rates],
        start_date=start_date,
        end_date=end_date
    )


# ============== Currency Conversion ==============

@router.post("/convert", response_model=CurrencyConversionResponse)
async def convert_currency(
    conversion: CurrencyConversionRequest,
    log_conversion: bool = Query(False, description="Log this conversion"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert an amount from one currency to another."""
    
    from_code = conversion.from_currency.upper()
    to_code = conversion.to_currency.upper()
    
    # Get currencies
    from_currency = await db.scalar(select(Currency).where(Currency.code == from_code))
    to_currency = await db.scalar(select(Currency).where(Currency.code == to_code))
    
    if not from_currency:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Currency {from_code} not found")
    if not to_currency:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Currency {to_code} not found")
    
    # Same currency - no conversion needed
    if from_code == to_code:
        return CurrencyConversionResponse(
            from_currency=from_code,
            to_currency=to_code,
            original_amount=conversion.amount,
            converted_amount=conversion.amount,
            exchange_rate=Decimal("1.0"),
            rate_date=conversion.rate_date or date.today(),
            formatted_original=from_currency.format_amount(conversion.amount),
            formatted_converted=to_currency.format_amount(conversion.amount)
        )
    
    # Get exchange rate
    query = select(ExchangeRate).where(
        and_(
            ExchangeRate.from_currency_code == from_code,
            ExchangeRate.to_currency_code == to_code
        )
    )
    
    if conversion.rate_date:
        query = query.where(ExchangeRate.rate_date == conversion.rate_date)
    else:
        query = query.order_by(desc(ExchangeRate.rate_date))
    
    result = await db.execute(query.limit(1))
    rate_record = result.scalar_one_or_none()
    
    if not rate_record:
        # Try inverse rate
        inverse_query = select(ExchangeRate).where(
            and_(
                ExchangeRate.from_currency_code == to_code,
                ExchangeRate.to_currency_code == from_code
            )
        )
        
        if conversion.rate_date:
            inverse_query = inverse_query.where(ExchangeRate.rate_date == conversion.rate_date)
        else:
            inverse_query = inverse_query.order_by(desc(ExchangeRate.rate_date))
        
        inverse_result = await db.execute(inverse_query.limit(1))
        inverse_rate_record = inverse_result.scalar_one_or_none()
        
        if inverse_rate_record:
            exchange_rate = inverse_rate_record.inverse_rate
            rate_date = inverse_rate_record.rate_date
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exchange rate not found for {from_code} to {to_code}"
            )
    else:
        exchange_rate = rate_record.rate
        rate_date = rate_record.rate_date
    
    converted_amount = conversion.amount * exchange_rate
    
    # Log conversion if requested
    if log_conversion and current_user.organization_id:
        log_entry = CurrencyConversionLog(
            organization_id=current_user.organization_id,
            from_currency_code=from_code,
            to_currency_code=to_code,
            original_amount=conversion.amount,
            converted_amount=converted_amount,
            exchange_rate=exchange_rate,
            rate_date=rate_date
        )
        db.add(log_entry)
        await db.commit()
    
    return CurrencyConversionResponse(
        from_currency=from_code,
        to_currency=to_code,
        original_amount=conversion.amount,
        converted_amount=converted_amount,
        exchange_rate=exchange_rate,
        rate_date=rate_date,
        formatted_original=from_currency.format_amount(conversion.amount),
        formatted_converted=to_currency.format_amount(converted_amount)
    )


@router.post("/convert/bulk", response_model=BulkConversionResponse)
async def bulk_convert_currency(
    request: BulkConversionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert multiple amounts at once."""
    
    conversions = []
    totals_original: dict[str, Decimal] = {}
    totals_converted: dict[str, Decimal] = {}
    
    for conv_request in request.amounts:
        # Reuse single conversion logic
        result = await convert_currency(conv_request, log_conversion=False, db=db, current_user=current_user)
        conversions.append(result)
        
        # Accumulate totals
        from_code = conv_request.from_currency.upper()
        to_code = conv_request.to_currency.upper()
        
        totals_original[from_code] = totals_original.get(from_code, Decimal(0)) + conv_request.amount
        totals_converted[to_code] = totals_converted.get(to_code, Decimal(0)) + result.converted_amount
    
    return BulkConversionResponse(
        conversions=conversions,
        total_original=totals_original,
        total_converted=totals_converted
    )
