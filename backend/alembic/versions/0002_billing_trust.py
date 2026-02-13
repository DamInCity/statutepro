"""Add billing and trust account tables

Revision ID: 0002_billing_trust
Revises: 0001_initial
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0002_billing_trust'
down_revision: Union[str, None] = '0001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types (use DO block to handle "if not exists" for enums)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'void', 'written_off');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE payment_method AS ENUM ('cash', 'check', 'bank_transfer', 'credit_card', 'mobile_money', 'trust_account', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE trust_account_type AS ENUM ('iolta', 'client_trust', 'escrow', 'retainer');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'interest', 'fee', 'payment_to_firm', 'refund_to_client');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Create invoices table
    op.create_table(
        'invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('invoice_number', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('status', postgresql.ENUM('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'void', 'written_off', name='invoice_status', create_type=False), nullable=False, server_default='draft', index=True),
        sa.Column('issue_date', sa.Date, nullable=False),
        sa.Column('due_date', sa.Date, nullable=False),
        sa.Column('paid_date', sa.Date, nullable=True),
        sa.Column('subtotal', sa.Integer, nullable=False, server_default='0'),
        sa.Column('tax_rate', sa.Integer, nullable=False, server_default='0'),
        sa.Column('tax_amount', sa.Integer, nullable=False, server_default='0'),
        sa.Column('discount_amount', sa.Integer, nullable=False, server_default='0'),
        sa.Column('total_amount', sa.Integer, nullable=False, server_default='0'),
        sa.Column('amount_paid', sa.Integer, nullable=False, server_default='0'),
        sa.Column('billing_period_start', sa.Date, nullable=True),
        sa.Column('billing_period_end', sa.Date, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('payment_terms', sa.Text, nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create invoice_line_items table
    op.create_table(
        'invoice_line_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('time_entry_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('time_entries.id', ondelete='SET NULL'), nullable=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False, server_default='100'),
        sa.Column('unit_price', sa.Integer, nullable=False),
        sa.Column('amount', sa.Integer, nullable=False),
        sa.Column('entry_date', sa.Date, nullable=True),
        sa.Column('timekeeper_name', sa.String(255), nullable=True),
        sa.Column('sort_order', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('amount', sa.Integer, nullable=False),
        sa.Column('payment_date', sa.Date, nullable=False),
        sa.Column('payment_method', postgresql.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'mobile_money', 'trust_account', 'other', name='payment_method', create_type=False), nullable=False),
        sa.Column('reference_number', sa.String(100), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('trust_transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create trust_accounts table
    op.create_table(
        'trust_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('account_name', sa.String(255), nullable=False),
        sa.Column('account_number', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('bank_name', sa.String(255), nullable=False),
        sa.Column('bank_branch', sa.String(255), nullable=True),
        sa.Column('account_type', postgresql.ENUM('iolta', 'client_trust', 'escrow', 'retainer', name='trust_account_type', create_type=False), nullable=False, server_default='client_trust'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('current_balance', sa.Integer, nullable=False, server_default='0'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create trust_transactions table
    op.create_table(
        'trust_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('trust_account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trust_accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('transaction_type', postgresql.ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'interest', 'fee', 'payment_to_firm', 'refund_to_client', name='transaction_type', create_type=False), nullable=False),
        sa.Column('amount', sa.Integer, nullable=False),
        sa.Column('running_balance', sa.Integer, nullable=False),
        sa.Column('transaction_date', sa.Date, nullable=False, index=True),
        sa.Column('reference_number', sa.String(100), nullable=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('recorded_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('invoices.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_reconciled', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('reconciled_date', sa.Date, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create client_trust_ledgers table
    op.create_table(
        'client_trust_ledgers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('trust_account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trust_accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('balance', sa.Integer, nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('client_trust_ledgers')
    op.drop_table('trust_transactions')
    op.drop_table('trust_accounts')
    op.drop_table('payments')
    op.drop_table('invoice_line_items')
    op.drop_table('invoices')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS transaction_type")
    op.execute("DROP TYPE IF EXISTS trust_account_type")
    op.execute("DROP TYPE IF EXISTS payment_method")
    op.execute("DROP TYPE IF EXISTS invoice_status")
