-- Initialize Legal CMS Database
-- This script runs on first container creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for future AI embeddings
-- Note: pgvector needs to be installed in the image for production
-- For now, we'll add this when we need AI features
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum types for the application
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'associate', 'paralegal', 'staff', 'readonly');
CREATE TYPE matter_status AS ENUM ('intake', 'active', 'pending', 'on_hold', 'closed', 'archived');
CREATE TYPE billing_type AS ENUM ('hourly', 'fixed', 'contingency', 'pro_bono', 'hybrid');
CREATE TYPE time_entry_status AS ENUM ('draft', 'submitted', 'approved', 'billed', 'written_off');

-- Grant privileges (for development)
GRANT ALL PRIVILEGES ON DATABASE legalcms TO legalcms;
