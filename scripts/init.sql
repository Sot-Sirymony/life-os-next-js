-- PostgreSQL initialization script for Life OS
-- This script runs when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create database if it doesn't exist
-- (This is handled by Docker environment variables)

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma)
-- These are just examples of what Prisma will create

-- Optimize for JSON operations
-- PostgreSQL has excellent JSON support out of the box

-- Set default search path
SET search_path TO public;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE life_os_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres; 