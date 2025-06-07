# Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for transforming the Key To Sleep podcast automation into a custom sleep story platform.

## Phase 1: Infrastructure Setup (Branch: `feat/infrastructure-setup`)

### 1.1 Environment Configuration

- [ ] Create comprehensive `.env.local` template
- [ ] Document all required environment variables
- [ ] Set up local development environment

### 1.2 Database Setup (Supabase)

- [ ] Create Supabase project
- [ ] Design schema:
  - `jobs` table (id, token, status, created_at, updated_at, phone_number, stripe_session_id)
  - `job_progress` table (job_id, step, status, started_at, completed_at, error_message)
  - `generated_assets` table (job_id, asset_type, s3_url, metadata)
- [ ] Create database client utilities
- [ ] Test connection and basic operations

### 1.3 AWS S3 Configuration

- [ ] Create S3 bucket with proper permissions
- [ ] Set up IAM user with minimal required permissions
- [ ] Create S3 client utilities
- [ ] Test upload/download functionality

### 1.4 Stripe MCP Setup

- [ ] Install and configure @stripe/mcp
- [ ] Create Stripe product for sleep stories ($2)
- [ ] Set up test environment
- [ ] Implement MCP server with required tools

### 1.5 Twilio Setup

- [ ] Create Twilio account and get credentials
- [ ] Set up SMS service
- [ ] Create SMS utility functions
- [ ] Test international number support

**Checkpoint: All infrastructure services connected and tested**

## Phase 2: Frontend - Story Configuration (Branch: `feat/story-configuration`)

### 2.1 Create Story Configuration Form

- [ ] Build form component with Tailwind CSS
- [ ] Implement all input fields with proper types
- [ ] Add madlib preview functionality
- [ ] Create default value system
- [ ] Add form validation

### 2.2 Values/Morals Tag Picker

- [ ] Create multi-select component
- [ ] Style with Tailwind and react-icons
- [ ] Implement tag management logic

### 2.3 Responsive Design

- [ ] Ensure mobile-friendly layout
- [ ] Test across different screen sizes
- [ ] Add loading states and animations

**Checkpoint: Story configuration form complete and tested**

## Phase 3: Payment Integration (Branch: `feat/payment-integration`)

### 3.1 Stripe Payment Flow

- [ ] Create API endpoint for payment initiation
- [ ] Generate unique job token
- [ ] Store initial job in Supabase
- [ ] Create Stripe Payment Link with MCP
- [ ] Handle success/cancel redirects

### 3.2 Phone Number Collection

- [ ] Investigate Stripe custom fields for phone collection
- [ ] Implement fallback form if needed
- [ ] Add consent language for SMS

**Checkpoint: Payment flow working end-to-end**

## Phase 4: Generation Pipeline (Branch: `feat/generation-pipeline`)

### 4.1 Update Generation Scripts

- [ ] Modify story generation to accept custom parameters
- [ ] Update prompts to incorporate user selections
- [ ] Add error handling and retries
- [ ] Test with various parameter combinations

### 4.2 Job Processing System

- [ ] Create API endpoint to trigger generation
- [ ] Implement sequential story generation
- [ ] Add parallel processing for metadata/artwork/audio
- [ ] Update job progress in Supabase

### 4.3 Asset Storage

- [ ] Upload generated assets to S3
- [ ] Store URLs in Supabase
- [ ] Clean up temporary files
- [ ] Embed artwork into MP3 files using ID3 tags
- [ ] Extract story title for MP3 metadata

**Checkpoint: Full generation pipeline working with enhanced MP3s**

## Phase 5: Progress Tracking UI (Branch: `feat/progress-tracking`)

### 5.1 Progress Page

- [ ] Create progress page component
- [ ] Implement GitHub Actions-style UI
- [ ] Add polling mechanism (2-3 second intervals)
- [ ] Display elapsed time per step

### 5.2 Token-based Routing

- [ ] Implement human-readable URL structure
- [ ] Add token validation
- [ ] Handle invalid/expired tokens

**Checkpoint: Real-time progress tracking working**

## Phase 6: Download Experience (Branch: `feat/download-experience`)

### 6.1 Completion Page

- [ ] Create Spotify-style media player
- [ ] Display artwork prominently
- [ ] Add copyable metadata section
- [ ] Implement "Download All" with zip functionality

### 6.2 SMS Notifications

- [ ] Trigger SMS on completion
- [ ] Include download link in message
- [ ] Handle SMS failures gracefully

**Checkpoint: Complete user experience from payment to download**

## Phase 7: Error Handling & Polish (Branch: `feat/error-handling`)

### 7.1 Comprehensive Error Handling

- [ ] Add 3x retry logic for each generation step
- [ ] Implement customer service SMS fallback
- [ ] Add error logging to Supabase
- [ ] Create user-friendly error messages

### 7.2 Polish & Optimization

- [ ] Add loading animations
- [ ] Optimize asset delivery
- [ ] Implement proper caching
- [ ] Add analytics tracking

**Checkpoint: Production-ready application**

## Phase 8: Deployment (Branch: `feat/deployment`)

### 8.1 Production Environment

- [ ] Set up production environment variables
- [ ] Configure Vercel deployment
- [ ] Set up monitoring and alerts
- [ ] Create deployment documentation

### 8.2 Testing & Launch

- [ ] End-to-end testing in production
- [ ] Load testing for concurrent users
- [ ] Create operation runbook
- [ ] Soft launch with limited users

## Development Guidelines

1. **Branch Strategy**: Create a new branch for each phase
2. **Testing**: After each checkpoint, run full local tests
3. **Documentation**: Update README.md and TASKS.md as we progress
4. **Commits**: Make atomic commits with clear messages
5. **Reviews**: Self-review before merging each phase

## Timeline Estimate

- Phase 1: 4-6 hours (infrastructure is often unpredictable)
- Phase 2: 3-4 hours
- Phase 3: 3-4 hours
- Phase 4: 4-5 hours
- Phase 5: 2-3 hours
- Phase 6: 3-4 hours
- Phase 7: 2-3 hours
- Phase 8: 2-3 hours

**Total: 23-32 hours of development time**

## Next Steps

1. Review and approve this plan
2. Set up all the service accounts (Stripe, Twilio, AWS, Supabase)
3. Begin with Phase 1: Infrastructure Setup
