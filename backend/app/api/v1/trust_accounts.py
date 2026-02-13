"""Trust Account management API endpoints."""
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.api.deps import DBSession, CurrentUser
from app.models.trust_account import (
    TrustAccount,
    TrustAccountType,
    TrustTransaction,
    TransactionType,
    ClientTrustLedger
)
from app.models.client import Client
from app.models.matter import Matter
from app.models.invoice import Invoice
from app.schemas.trust_account import (
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

router = APIRouter(prefix="/trust-accounts", tags=["Trust Accounts"])


@router.post("", response_model=TrustAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_trust_account(
    account_data: TrustAccountCreate,
    db: DBSession,
    current_user: CurrentUser
) -> TrustAccountResponse:
    """Create a new trust account."""
    
    # Check if account number already exists
    result = await db.execute(
        select(TrustAccount).where(TrustAccount.account_number == account_data.account_number)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account number already exists"
        )
    
    account = TrustAccount(
        **account_data.model_dump(),
        current_balance=0,
        is_active=True
    )
    
    db.add(account)
    await db.flush()
    await db.refresh(account)
    
    return TrustAccountResponse.model_validate(account)


@router.get("", response_model=List[TrustAccountBrief])
async def list_trust_accounts(
    db: DBSession,
    current_user: CurrentUser,
    is_active: Optional[bool] = None,
    account_type: Optional[TrustAccountType] = None
) -> List[TrustAccountBrief]:
    """List all trust accounts."""
    
    query = select(TrustAccount)
    
    if is_active is not None:
        query = query.where(TrustAccount.is_active == is_active)
    if account_type:
        query = query.where(TrustAccount.account_type == account_type)
    
    query = query.order_by(TrustAccount.account_name)
    result = await db.execute(query)
    accounts = result.scalars().all()
    
    return [TrustAccountBrief.model_validate(a) for a in accounts]


@router.get("/summary", response_model=TrustAccountSummary)
async def get_trust_account_summary(
    db: DBSession,
    current_user: CurrentUser
) -> TrustAccountSummary:
    """Get summary of all trust accounts."""
    
    result = await db.execute(select(TrustAccount))
    accounts = result.scalars().all()
    
    total_accounts = len(accounts)
    active_accounts = sum(1 for a in accounts if a.is_active)
    total_balance = sum(a.current_balance for a in accounts)
    
    # Get total client funds from ledgers
    result = await db.execute(select(ClientTrustLedger))
    ledgers = result.scalars().all()
    total_client_funds = sum(l.balance for l in ledgers)
    
    return TrustAccountSummary(
        total_accounts=total_accounts,
        active_accounts=active_accounts,
        total_balance=total_balance,
        total_client_funds=total_client_funds
    )


@router.get("/{account_id}", response_model=TrustAccountResponse)
async def get_trust_account(
    account_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TrustAccountResponse:
    """Get a specific trust account."""
    
    result = await db.execute(select(TrustAccount).where(TrustAccount.id == account_id))
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trust account not found")
    
    return TrustAccountResponse.model_validate(account)


@router.patch("/{account_id}", response_model=TrustAccountResponse)
async def update_trust_account(
    account_id: UUID,
    account_data: TrustAccountUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> TrustAccountResponse:
    """Update a trust account."""
    
    result = await db.execute(select(TrustAccount).where(TrustAccount.id == account_id))
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trust account not found")
    
    update_data = account_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
    
    await db.flush()
    await db.refresh(account)
    
    return TrustAccountResponse.model_validate(account)


# Trust Transactions
@router.post("/{account_id}/transactions", response_model=TrustTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    account_id: UUID,
    transaction_data: TrustTransactionCreate,
    db: DBSession,
    current_user: CurrentUser
) -> TrustTransactionResponse:
    """Create a trust account transaction."""
    
    # Verify account exists and is active
    result = await db.execute(select(TrustAccount).where(TrustAccount.id == account_id))
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trust account not found")
    
    if not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add transactions to inactive account"
        )
    
    # Verify client if provided
    if transaction_data.client_id:
        result = await db.execute(select(Client).where(Client.id == transaction_data.client_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Verify matter if provided
    if transaction_data.matter_id:
        result = await db.execute(select(Matter).where(Matter.id == transaction_data.matter_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matter not found")
    
    # Calculate new balance
    amount = transaction_data.amount
    if transaction_data.transaction_type in [
        TransactionType.WITHDRAWAL,
        TransactionType.TRANSFER_OUT,
        TransactionType.PAYMENT_TO_FIRM,
        TransactionType.REFUND_TO_CLIENT,
        TransactionType.FEE
    ]:
        new_balance = account.current_balance - amount
        if new_balance < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds in trust account"
            )
    else:
        new_balance = account.current_balance + amount
    
    # Create transaction
    transaction = TrustTransaction(
        trust_account_id=account_id,
        transaction_type=transaction_data.transaction_type,
        amount=amount,
        running_balance=new_balance,
        transaction_date=transaction_data.transaction_date,
        reference_number=transaction_data.reference_number,
        description=transaction_data.description,
        client_id=transaction_data.client_id,
        matter_id=transaction_data.matter_id,
        recorded_by_id=current_user.id,
        invoice_id=transaction_data.invoice_id
    )
    
    db.add(transaction)
    
    # Update account balance
    account.current_balance = new_balance
    
    # Update client ledger if client is specified
    if transaction_data.client_id:
        await _update_client_ledger(
            db,
            account_id,
            transaction_data.client_id,
            transaction_data.matter_id,
            transaction_data.transaction_type,
            amount
        )
    
    await db.flush()
    await db.refresh(transaction)
    
    return TrustTransactionResponse.model_validate(transaction)


@router.get("/{account_id}/transactions", response_model=List[TrustTransactionBrief])
async def list_transactions(
    account_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    client_id: Optional[UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[TrustTransactionBrief]:
    """List transactions for a trust account."""
    
    # Verify account exists
    result = await db.execute(select(TrustAccount).where(TrustAccount.id == account_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trust account not found")
    
    query = select(TrustTransaction).where(TrustTransaction.trust_account_id == account_id)
    
    if client_id:
        query = query.where(TrustTransaction.client_id == client_id)
    if date_from:
        query = query.where(TrustTransaction.transaction_date >= date_from)
    if date_to:
        query = query.where(TrustTransaction.transaction_date <= date_to)
    
    query = query.order_by(TrustTransaction.transaction_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return [TrustTransactionBrief.model_validate(t) for t in transactions]


@router.get("/{account_id}/transactions/{transaction_id}", response_model=TrustTransactionResponse)
async def get_transaction(
    account_id: UUID,
    transaction_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TrustTransactionResponse:
    """Get a specific transaction."""
    
    result = await db.execute(
        select(TrustTransaction).where(
            TrustTransaction.id == transaction_id,
            TrustTransaction.trust_account_id == account_id
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    
    return TrustTransactionResponse.model_validate(transaction)


@router.post("/{account_id}/transactions/{transaction_id}/reconcile", response_model=TrustTransactionResponse)
async def reconcile_transaction(
    account_id: UUID,
    transaction_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> TrustTransactionResponse:
    """Mark a transaction as reconciled."""
    
    result = await db.execute(
        select(TrustTransaction).where(
            TrustTransaction.id == transaction_id,
            TrustTransaction.trust_account_id == account_id
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    
    transaction.is_reconciled = True
    transaction.reconciled_date = date.today()
    
    await db.flush()
    await db.refresh(transaction)
    
    return TrustTransactionResponse.model_validate(transaction)


# Client Trust Ledgers
@router.get("/clients/{client_id}/balance", response_model=ClientTrustBalance)
async def get_client_trust_balance(
    client_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> ClientTrustBalance:
    """Get a client's total trust balance across all accounts."""
    
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Get all ledgers for this client
    result = await db.execute(
        select(ClientTrustLedger).where(ClientTrustLedger.client_id == client_id)
    )
    ledgers = result.scalars().all()
    
    total_balance = sum(l.balance for l in ledgers)
    
    return ClientTrustBalance(
        client_id=client_id,
        client_name=client.name,
        total_balance=total_balance,
        ledger_count=len(ledgers)
    )


@router.get("/{account_id}/ledgers", response_model=List[ClientTrustLedgerResponse])
async def list_client_ledgers(
    account_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> List[ClientTrustLedgerResponse]:
    """List all client ledgers for a trust account."""
    
    # Verify account exists
    result = await db.execute(select(TrustAccount).where(TrustAccount.id == account_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trust account not found")
    
    result = await db.execute(
        select(ClientTrustLedger).where(ClientTrustLedger.trust_account_id == account_id)
    )
    ledgers = result.scalars().all()
    
    return [ClientTrustLedgerResponse.model_validate(l) for l in ledgers]


async def _update_client_ledger(
    db: DBSession,
    trust_account_id: UUID,
    client_id: UUID,
    matter_id: Optional[UUID],
    transaction_type: TransactionType,
    amount: int
) -> None:
    """Update or create client trust ledger."""
    
    # Find existing ledger
    query = select(ClientTrustLedger).where(
        ClientTrustLedger.trust_account_id == trust_account_id,
        ClientTrustLedger.client_id == client_id
    )
    if matter_id:
        query = query.where(ClientTrustLedger.matter_id == matter_id)
    else:
        query = query.where(ClientTrustLedger.matter_id.is_(None))
    
    result = await db.execute(query)
    ledger = result.scalar_one_or_none()
    
    # Calculate balance change
    if transaction_type in [
        TransactionType.WITHDRAWAL,
        TransactionType.TRANSFER_OUT,
        TransactionType.PAYMENT_TO_FIRM,
        TransactionType.REFUND_TO_CLIENT,
        TransactionType.FEE
    ]:
        balance_change = -amount
    else:
        balance_change = amount
    
    if ledger:
        ledger.balance += balance_change
    else:
        # Create new ledger
        ledger = ClientTrustLedger(
            trust_account_id=trust_account_id,
            client_id=client_id,
            matter_id=matter_id,
            balance=balance_change,
            is_active=True
        )
        db.add(ledger)
