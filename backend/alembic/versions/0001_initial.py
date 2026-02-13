"""Initial migration - core tables

Revision ID: 0001_initial
Revises: 
Create Date: 2025-12-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types (use DO block to handle "if not exists" for enums)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('admin', 'partner', 'associate', 'paralegal', 'staff', 'readonly');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE client_type AS ENUM ('individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'government', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE client_status AS ENUM ('prospect', 'active', 'inactive', 'former', 'declined');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE matter_status AS ENUM ('intake', 'active', 'pending', 'on_hold', 'closed', 'archived');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE billing_type AS ENUM ('hourly', 'fixed', 'contingency', 'pro_bono', 'hybrid');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE practice_area AS ENUM ('corporate', 'litigation', 'employment', 'real_estate', 'family', 'criminal', 'intellectual_property', 'tax', 'immigration', 'banking', 'insurance', 'environmental', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE document_category AS ENUM ('pleading', 'correspondence', 'contract', 'evidence', 'research', 'memo', 'invoice', 'client_document', 'court_filing', 'template', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE time_entry_status AS ENUM ('draft', 'submitted', 'approved', 'billed', 'written_off');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('title', sa.String(100), nullable=True),
        sa.Column('bio', sa.Text, nullable=True),
        sa.Column('role', postgresql.ENUM('admin', 'partner', 'associate', 'paralegal', 'staff', 'readonly', name='user_role', create_type=False), nullable=False, server_default='associate'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('hourly_rate', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create clients table
    op.create_table(
        'clients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('client_number', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('client_type', postgresql.ENUM('individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'government', 'other', name='client_type', create_type=False), nullable=False, server_default='individual'),
        sa.Column('status', postgresql.ENUM('prospect', 'active', 'inactive', 'former', 'declined', name='client_status', create_type=False), nullable=False, server_default='active'),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('address_line1', sa.String(255), nullable=True),
        sa.Column('address_line2', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('country', sa.String(100), nullable=False, server_default='Kenya'),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('tax_id', sa.String(50), nullable=True),
        sa.Column('billing_email', sa.String(255), nullable=True),
        sa.Column('default_billing_rate', sa.Integer, nullable=True),
        sa.Column('payment_terms_days', sa.Integer, nullable=False, server_default='30'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('conflict_check_completed', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create matters table
    op.create_table(
        'matters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('matter_number', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', postgresql.ENUM('intake', 'active', 'pending', 'on_hold', 'closed', 'archived', name='matter_status', create_type=False), nullable=False, server_default='intake', index=True),
        sa.Column('practice_area', postgresql.ENUM('corporate', 'litigation', 'employment', 'real_estate', 'family', 'criminal', 'intellectual_property', 'tax', 'immigration', 'banking', 'insurance', 'environmental', 'other', name='practice_area', create_type=False), nullable=False, index=True),
        sa.Column('open_date', sa.Date, nullable=False),
        sa.Column('close_date', sa.Date, nullable=True),
        sa.Column('statute_of_limitations', sa.Date, nullable=True),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('responsible_attorney_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('billing_type', postgresql.ENUM('hourly', 'fixed', 'contingency', 'pro_bono', 'hybrid', name='billing_type', create_type=False), nullable=False, server_default='hourly'),
        sa.Column('budget_amount', sa.Integer, nullable=True),
        sa.Column('hourly_rate_override', sa.Integer, nullable=True),
        sa.Column('jurisdiction', sa.String(100), nullable=True),
        sa.Column('court', sa.String(255), nullable=True),
        sa.Column('case_number', sa.String(100), nullable=True),
        sa.Column('judge', sa.String(255), nullable=True),
        sa.Column('opposing_party', sa.String(255), nullable=True),
        sa.Column('opposing_counsel', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create contacts table
    op.create_table(
        'contacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('title', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), nullable=True, index=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('mobile', sa.String(50), nullable=True),
        sa.Column('address_line1', sa.String(255), nullable=True),
        sa.Column('address_line2', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('is_primary', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('is_billing_contact', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create documents table
    op.create_table(
        'documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.BigInteger, nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('category', postgresql.ENUM('pleading', 'correspondence', 'contract', 'evidence', 'research', 'memo', 'invoice', 'client_document', 'court_filing', 'template', 'other', name='document_category', create_type=False), nullable=False, server_default='other', index=True),
        sa.Column('version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('parent_document_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('uploaded_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('extracted_text', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create time_entries table
    op.create_table(
        'time_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('entry_date', sa.Date, nullable=False, index=True),
        sa.Column('duration_minutes', sa.Integer, nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('activity_code', sa.String(50), nullable=True),
        sa.Column('status', postgresql.ENUM('draft', 'submitted', 'approved', 'billed', 'written_off', name='time_entry_status', create_type=False), nullable=False, server_default='draft', index=True),
        sa.Column('hourly_rate', sa.Integer, nullable=False),
        sa.Column('is_billable', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_billed', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('time_entries')
    op.drop_table('documents')
    op.drop_table('contacts')
    op.drop_table('matters')
    op.drop_table('clients')
    op.drop_table('users')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS time_entry_status")
    op.execute("DROP TYPE IF EXISTS document_category")
    op.execute("DROP TYPE IF EXISTS practice_area")
    op.execute("DROP TYPE IF EXISTS billing_type")
    op.execute("DROP TYPE IF EXISTS matter_status")
    op.execute("DROP TYPE IF EXISTS client_status")
    op.execute("DROP TYPE IF EXISTS client_type")
    op.execute("DROP TYPE IF EXISTS user_role")
