"""Multi-tenancy, subscriptions, token usage, and currency support

Revision ID: 0004_multitenancy
Revises: 0003_tasks_audit
Create Date: 2026-02-21

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0004_multitenancy'
down_revision: Union[str, None] = '0003_tasks_audit'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types — one op.execute() per statement (asyncpg limitation)
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE organization_type AS ENUM (
                'law_firm', 'legal_department', 'solo_practitioner', 'government', 'non_profit'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE plan_tier AS ENUM (
                'free', 'starter', 'professional', 'enterprise', 'custom'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE subscription_status AS ENUM (
                'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'expired'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE billing_interval AS ENUM (
                'monthly', 'quarterly', 'yearly'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE ai_feature_type AS ENUM (
                'chat_assistant', 'document_summary', 'document_drafting', 'email_drafting',
                'legal_research', 'contract_review', 'case_analysis', 'translation', 'other'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE ai_model AS ENUM (
                'qwen3-235b-a22b', 'deepseek-r1', 'qwen2.5-vl-72b',
                'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'other'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # Named references for use in create_table calls.
    # postgresql.ENUM with create_type=False means "this type already exists, don't CREATE it"
    organization_type = postgresql.ENUM(
        'law_firm', 'legal_department', 'solo_practitioner', 'government', 'non_profit',
        name='organization_type', create_type=False
    )
    plan_tier = postgresql.ENUM(
        'free', 'starter', 'professional', 'enterprise', 'custom',
        name='plan_tier', create_type=False
    )
    subscription_status = postgresql.ENUM(
        'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'expired',
        name='subscription_status', create_type=False
    )
    billing_interval = postgresql.ENUM(
        'monthly', 'quarterly', 'yearly',
        name='billing_interval', create_type=False
    )
    ai_feature_type = postgresql.ENUM(
        'chat_assistant', 'document_summary', 'document_drafting', 'email_drafting',
        'legal_research', 'contract_review', 'case_analysis', 'translation', 'other',
        name='ai_feature_type', create_type=False
    )
    ai_model = postgresql.ENUM(
        'qwen3-235b-a22b', 'deepseek-r1', 'qwen2.5-vl-72b', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'other',
        name='ai_model', create_type=False
    )
    
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        # Basic info
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, index=True, nullable=False),
        
        # Organization type
        sa.Column('org_type', organization_type, default='law_firm', nullable=False),
        
        # Contact info
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        
        # Address
        sa.Column('address_line1', sa.String(255), nullable=True),
        sa.Column('address_line2', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('country', sa.String(2), default='US', nullable=False),
        
        # Settings
        sa.Column('timezone', sa.String(50), default='UTC', nullable=False),
        sa.Column('default_currency', sa.String(3), default='USD', nullable=False),
        sa.Column('logo_url', sa.String(500), nullable=True),
        
        # Billing
        sa.Column('billing_email', sa.String(255), nullable=True),
        sa.Column('tax_id', sa.String(50), nullable=True),
        
        # Status
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_verified', sa.Boolean(), default=False, nullable=False),
        
        # Limits
        sa.Column('max_seats', sa.Integer(), default=5, nullable=False),
        sa.Column('monthly_token_limit', sa.Integer(), default=100000, nullable=False),
        sa.Column('storage_limit_mb', sa.Integer(), default=5000, nullable=False),
        
        # Feature flags
        sa.Column('feature_ai_assistant', sa.Boolean(), default=True, nullable=False),
        sa.Column('feature_document_assembly', sa.Boolean(), default=True, nullable=False),
        sa.Column('feature_analytics', sa.Boolean(), default=False, nullable=False),
        sa.Column('feature_api_access', sa.Boolean(), default=False, nullable=False),
        
        # Notes
        sa.Column('admin_notes', sa.Text(), nullable=True),
    )
    
    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        # Organization
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        
        # Plan details
        sa.Column('plan_tier', plan_tier, default='free', nullable=False),
        sa.Column('status', subscription_status, default='trialing', nullable=False, index=True),
        sa.Column('billing_interval', billing_interval, default='monthly', nullable=False),
        
        # Pricing (in cents)
        sa.Column('price_cents', sa.Integer(), default=0, nullable=False),
        sa.Column('currency', sa.String(3), default='USD', nullable=False),
        
        # Seats
        sa.Column('seats_included', sa.Integer(), default=5, nullable=False),
        sa.Column('additional_seat_price_cents', sa.Integer(), default=0, nullable=False),
        
        # Token limits
        sa.Column('monthly_tokens_included', sa.Integer(), default=100000, nullable=False),
        sa.Column('additional_token_price_cents', sa.Integer(), default=0, nullable=False),
        
        # Dates
        sa.Column('trial_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('trial_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('canceled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        
        # External provider
        sa.Column('external_subscription_id', sa.String(255), nullable=True, index=True),
        sa.Column('external_customer_id', sa.String(255), nullable=True, index=True),
        sa.Column('external_product_id', sa.String(255), nullable=True),
        sa.Column('external_price_id', sa.String(255), nullable=True),
        
        # Discount
        sa.Column('discount_percent', sa.Integer(), nullable=True),
        sa.Column('discount_code', sa.String(50), nullable=True),
        sa.Column('discount_ends_at', sa.DateTime(timezone=True), nullable=True),
        
        # Auto-renewal
        sa.Column('auto_renew', sa.Boolean(), default=True, nullable=False),
        
        # Notes
        sa.Column('notes', sa.Text(), nullable=True),
    )
    
    # Create token_usage table
    op.create_table(
        'token_usage',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        # Foreign keys
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        
        # Feature and model
        sa.Column('feature_type', ai_feature_type, nullable=False, index=True),
        sa.Column('model', ai_model, default='qwen3-235b-a22b', nullable=False),
        
        # Token counts
        sa.Column('prompt_tokens', sa.Integer(), default=0, nullable=False),
        sa.Column('completion_tokens', sa.Integer(), default=0, nullable=False),
        sa.Column('total_tokens', sa.Integer(), default=0, nullable=False),
        
        # Cost (in micro-cents)
        sa.Column('cost_micro_cents', sa.Integer(), default=0, nullable=False),
        
        # Metadata
        sa.Column('request_id', sa.String(255), nullable=True),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('was_successful', sa.Boolean(), default=True, nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        
        # Aggregation helpers
        sa.Column('usage_date', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('usage_month', sa.String(7), nullable=False, index=True),
    )
    
    # Create token_usage_aggregates table
    op.create_table(
        'token_usage_aggregates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        # Foreign key
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        
        # Period and feature
        sa.Column('period', sa.String(7), nullable=False, index=True),
        sa.Column('feature_type', ai_feature_type, nullable=True),
        
        # Aggregated counts
        sa.Column('total_requests', sa.Integer(), default=0, nullable=False),
        sa.Column('total_prompt_tokens', sa.Integer(), default=0, nullable=False),
        sa.Column('total_completion_tokens', sa.Integer(), default=0, nullable=False),
        sa.Column('total_tokens', sa.Integer(), default=0, nullable=False),
        sa.Column('total_cost_micro_cents', sa.Integer(), default=0, nullable=False),
        
        # Success rate
        sa.Column('successful_requests', sa.Integer(), default=0, nullable=False),
        sa.Column('failed_requests', sa.Integer(), default=0, nullable=False),
        
        # Performance
        sa.Column('avg_response_time_ms', sa.Integer(), nullable=True),
    )
    
    # Create currencies table
    op.create_table(
        'currencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        sa.Column('code', sa.String(3), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('symbol', sa.String(10), nullable=False),
        sa.Column('decimal_places', sa.Integer(), default=2, nullable=False),
        sa.Column('symbol_position', sa.String(10), default='before', nullable=False),
        sa.Column('thousands_separator', sa.String(1), default=',', nullable=False),
        sa.Column('decimal_separator', sa.String(1), default='.', nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_base_currency', sa.Boolean(), default=False, nullable=False),
        sa.Column('country_codes', sa.String(255), nullable=True),
    )
    
    # Create exchange_rates table
    op.create_table(
        'exchange_rates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        sa.Column('from_currency_code', sa.String(3), sa.ForeignKey('currencies.code', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('to_currency_code', sa.String(3), sa.ForeignKey('currencies.code', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('rate', sa.DECIMAL(18, 8), nullable=False),
        sa.Column('rate_date', sa.Date(), nullable=False, index=True),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('fetched_at', sa.DateTime(timezone=True), nullable=False),
        
        sa.UniqueConstraint('from_currency_code', 'to_currency_code', 'rate_date', name='uq_exchange_rate'),
    )
    
    # Create currency_conversion_logs table
    op.create_table(
        'currency_conversion_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('from_currency_code', sa.String(3), nullable=False),
        sa.Column('to_currency_code', sa.String(3), nullable=False),
        sa.Column('original_amount', sa.DECIMAL(18, 4), nullable=False),
        sa.Column('converted_amount', sa.DECIMAL(18, 4), nullable=False),
        sa.Column('exchange_rate', sa.DECIMAL(18, 8), nullable=False),
        sa.Column('rate_date', sa.Date(), nullable=False),
        sa.Column('context', sa.String(100), nullable=True),
        sa.Column('reference_id', sa.String(255), nullable=True),
    )
    
    # Add organization_id and is_platform_admin to users table
    op.add_column('users', sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('users', sa.Column('is_platform_admin', sa.Boolean(), default=False, nullable=False, server_default='false'))
    op.create_foreign_key('fk_users_organization', 'users', 'organizations', ['organization_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])
    
    # Update user_role enum to include 'owner'
    op.execute(sa.text("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner' BEFORE 'admin'"))
    
    # Seed default currencies
    op.execute(sa.text("""
        INSERT INTO currencies (id, code, name, symbol, decimal_places, symbol_position, thousands_separator, decimal_separator, is_active, is_base_currency, country_codes)
        VALUES 
            (gen_random_uuid(), 'USD', 'US Dollar',          '$',    2, 'before', ',', '.', true,  true,  'US'),
            (gen_random_uuid(), 'EUR', 'Euro',                '€',    2, 'before', '.', ',', true,  false, 'DE,FR,IT,ES,NL,BE,AT,PT,FI,IE,GR'),
            (gen_random_uuid(), 'GBP', 'British Pound',       '£',    2, 'before', ',', '.', true,  false, 'GB'),
            (gen_random_uuid(), 'KES', 'Kenyan Shilling',     'KSh',  2, 'before', ',', '.', true,  false, 'KE'),
            (gen_random_uuid(), 'UGX', 'Ugandan Shilling',    'USh',  0, 'before', ',', '.', true,  false, 'UG'),
            (gen_random_uuid(), 'TZS', 'Tanzanian Shilling',  'TSh',  2, 'before', ',', '.', true,  false, 'TZ'),
            (gen_random_uuid(), 'ZAR', 'South African Rand',  'R',    2, 'before', ',', '.', true,  false, 'ZA'),
            (gen_random_uuid(), 'NGN', 'Nigerian Naira',      '₦',    2, 'before', ',', '.', true,  false, 'NG'),
            (gen_random_uuid(), 'GHS', 'Ghanaian Cedi',       'GH₵',  2, 'before', ',', '.', true,  false, 'GH'),
            (gen_random_uuid(), 'RWF', 'Rwandan Franc',       'FRw',  0, 'before', ',', '.', true,  false, 'RW'),
            (gen_random_uuid(), 'ETB', 'Ethiopian Birr',      'Br',   2, 'before', ',', '.', true,  false, 'ET'),
            (gen_random_uuid(), 'CAD', 'Canadian Dollar',     'C$',   2, 'before', ',', '.', true,  false, 'CA'),
            (gen_random_uuid(), 'AUD', 'Australian Dollar',   'A$',   2, 'before', ',', '.', true,  false, 'AU'),
            (gen_random_uuid(), 'CHF', 'Swiss Franc',         'CHF',  2, 'before', '''', '.', true,  false, 'CH'),
            (gen_random_uuid(), 'JPY', 'Japanese Yen',        '¥',    0, 'before', ',', '.', true,  false, 'JP'),
            (gen_random_uuid(), 'CNY', 'Chinese Yuan',        '¥',    2, 'before', ',', '.', true,  false, 'CN'),
            (gen_random_uuid(), 'INR', 'Indian Rupee',        '₹',    2, 'before', ',', '.', true,  false, 'IN'),
            (gen_random_uuid(), 'AED', 'UAE Dirham',          'د.إ',  2, 'before', ',', '.', true,  false, 'AE'),
            (gen_random_uuid(), 'SGD', 'Singapore Dollar',    'S$',   2, 'before', ',', '.', true,  false, 'SG'),
            (gen_random_uuid(), 'HKD', 'Hong Kong Dollar',    'HK$',  2, 'before', ',', '.', true,  false, 'HK')
    """))


def downgrade() -> None:
    # Remove foreign key and columns from users
    op.drop_index('ix_users_organization_id', 'users')
    op.drop_constraint('fk_users_organization', 'users', type_='foreignkey')
    op.drop_column('users', 'is_platform_admin')
    op.drop_column('users', 'organization_id')
    
    # Drop tables in reverse order
    op.drop_table('currency_conversion_logs')
    op.drop_table('exchange_rates')
    op.drop_table('currencies')
    op.drop_table('token_usage_aggregates')
    op.drop_table('token_usage')
    op.drop_table('subscriptions')
    op.drop_table('organizations')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS ai_model')
    op.execute('DROP TYPE IF EXISTS ai_feature_type')
    op.execute('DROP TYPE IF EXISTS billing_interval')
    op.execute('DROP TYPE IF EXISTS subscription_status')
    op.execute('DROP TYPE IF EXISTS plan_tier')
    op.execute('DROP TYPE IF EXISTS organization_type')
