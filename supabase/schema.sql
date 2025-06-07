-- Key To Sleep Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table - main table for tracking story generation jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL, -- Human-readable token like "2025-05-username-abc123"
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    phone_number VARCHAR(20), -- International format
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    
    -- Story configuration
    character_name VARCHAR(100),
    character_age INTEGER,
    character_gender VARCHAR(20),
    has_companion BOOLEAN DEFAULT false,
    companion_name VARCHAR(100),
    companion_animal VARCHAR(50),
    location TEXT,
    values_morals TEXT[], -- Array of selected values/morals
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Job progress table - tracks individual steps
CREATE TABLE IF NOT EXISTS job_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL, -- story, metadata, artwork, audio
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    attempt_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Ensure unique step per job
    UNIQUE(job_id, step)
);

-- Generated assets table - stores S3 URLs and metadata
CREATE TABLE IF NOT EXISTS generated_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- story, metadata, artwork, audio
    s3_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Store actual content/metadata as JSONB
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one asset per type per job
    UNIQUE(job_id, asset_type)
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_jobs_token ON jobs(token);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_job_progress_job_id ON job_progress(job_id);
CREATE INDEX IF NOT EXISTS idx_job_progress_step_status ON job_progress(step, status);
CREATE INDEX IF NOT EXISTS idx_generated_assets_job_id_type ON generated_assets(job_id, asset_type);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for jobs table
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to jobs by token (for progress checking)
CREATE POLICY "Public can read jobs by token" ON jobs
    FOR SELECT USING (true);

-- Allow public read access to job progress
CREATE POLICY "Public can read job progress" ON job_progress
    FOR SELECT USING (true);

-- Allow public read access to generated assets
CREATE POLICY "Public can read generated assets" ON generated_assets
    FOR SELECT USING (true);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role has full access to jobs" ON jobs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to job_progress" ON job_progress
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to generated_assets" ON generated_assets
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role'); 