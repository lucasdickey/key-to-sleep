# TASKS.md

## Project Plan: Key To Sleep Custom Story Platform

### Platform Transformation Tasks

#### 0. Infrastructure & Configuration Setup ✅ **COMPLETED**

- [x] **API Keys & Services Setup**:

  - [x] Verify/update OpenAI API key in environment
  - [x] Verify/update ElevenLabs API key and Voice ID
  - [x] Set up Stripe account and obtain API keys
  - [x] Set up Twilio account and obtain credentials
  - [x] Configure AWS S3 bucket and IAM credentials

- [x] **Environment Configuration**:

  - [x] Create `.env.local` with all required keys
  - [ ] Set up GitHub Actions secrets for production
  - [ ] Configure Vercel environment variables

- [x] **Stripe Integration**:

  - [x] Set up Stripe webhook endpoint for payment processing
  - [x] Configure payment link creation and event handling
  - [x] Test basic Stripe integration locally

- [x] **AWS S3 Configuration**:

  - [x] Create S3 bucket for asset storage
  - [x] Configure bucket policies for public read access
  - [x] Implement S3 utilities with sleep-stories subdirectory organization
  - [x] Test upload/download functionality

- [x] **Database Setup** (for job tracking):

  - [x] Set up Supabase project and obtain credentials
  - [x] Create schema for job tracking and progress updates (jobs, job_progress, generated_assets tables)
  - [x] Set up database connection and utilities
  - [x] Implement all CRUD operations for job management

- [x] **Additional Infrastructure**:
  - [x] Audio processing utilities with MP3 artwork embedding
  - [x] SMS notification system with international phone formatting
  - [x] Generation pipeline foundation
  - [x] Comprehensive type definitions and error handling

#### 1. Frontend Development

- [ ] Create story customization form with optional fields:
  - [ ] Character name - free form text input with placeholder
  - [ ] Character age - integer dropdown selector
  - [ ] Character gender - dropdown (male/female/other)
  - [ ] Companion toggle - yes/no boolean
  - [ ] Companion name - free form text (shown only if companion = yes)
  - [ ] Companion animal - dropdown with 100 child-friendly animals (shown only if companion = yes)
  - [ ] Location - free form text input with placeholder
  - [ ] Values/Morals - multi-select tag picker with options: courage, determination, empathy, compassion, ingenuity, motivated, self-sufficient, hopeful
- [ ] Implement madlib-style preview: "A [gender] named [name] goes on a journey with [companion name] their trusty [companion species] through [location]."
- [ ] Add default/placeholder values for all fields
- [ ] Implement "Generate Custom Sleep Story Now" CTA button
- [ ] Design and build with Tailwind CSS and react-icons

#### 2. Payment Integration

- [ ] Set up Stripe MCP (Model Context Protocol) server
  - [ ] Install and configure @stripe/mcp
  - [ ] Create semantic payment flow for $2 transactions
  - [ ] Implement phone number collection in Stripe checkout (if accessible for Twilio)
- [ ] Handle payment success/failure states
- [ ] Generate unique transaction tokens for tracking

#### 3. SMS Notification System

- [ ] Integrate Twilio for SMS notifications
- [ ] Support international phone numbers (English messages only)
- [ ] Capture phone number (from Stripe or separate form)
- [ ] Add proper consent language for SMS notifications
- [ ] Send completion notification with download links

#### 4. Real-time Progress System

- [ ] Create token-based session tracking with human-readable URLs (e.g., `/progress/2025-05-username-abc123`)
- [ ] Implement polling-based progress updates (check every 2-3 seconds)
- [ ] Build GitHub Actions-style progress UI with:
  - [ ] Step list with checkmarks/spinners
  - [ ] Elapsed time per step
  - [ ] Current status indicator
  - [ ] Steps: "Generating story", "Generating metadata", "Generating artwork", "Generating audio"
- [ ] Display "Approximately 3 minutes" expectation message
- [ ] Add note that users can close page and wait for SMS
- [ ] Make progress page URL-shareable (token in URL)

#### 5. Asset Management Updates

- [ ] Migrate from Vercel Blob to AWS S3
- [ ] Implement indefinite asset retention
- [ ] Create secure, token-based download links
- [ ] Build download page with:
  - [ ] Spotify-style inline media player (HTML5 audio with artwork)
  - [ ] "Download All" button that zips assets
  - [ ] Copyable metadata display
- [ ] Implement asset zipping functionality
- [ ] Embed artwork into MP3 files using ID3 tags for enhanced user experience
- [ ] Add proper MP3 metadata (title, artist, album, genre)

#### 6. Backend API Updates

- [ ] Update generation scripts to accept custom parameters
- [ ] Create API endpoints for:
  - [ ] Story generation with custom inputs
  - [ ] Progress status updates
  - [ ] Asset retrieval
- [ ] Implement generation workflow:
  - [ ] Story generation (must complete first)
  - [ ] Parallel generation of metadata, artwork, and audio
  - [ ] Keep initial implementation simple, add queues later if needed

#### 7. Error Handling & Reliability

- [ ] Add comprehensive error handling for failed generations
- [ ] Implement 3x retry mechanism for each generation step
- [ ] After 3 failed attempts, send SMS via Twilio to contact customer service
- [ ] Create customer service contact workflow
- [ ] Log all failures to Supabase for debugging

### Original Project Tasks (Completed)

### 1. Project Initialization

- [x] Set up Next.js project and repository structure
- [x] Add AGENTS.md and TASKS.md for team guidance
- [x] Configure Vercel deployment

### 2. Prompt Integration

- [x] Integrate `key-to-sleep-stochastic-prompts.md` for story generation

### 3. Story Generation

- [x] Script to generate a peaceful story using OpenAI GPT and stochastic prompts
- [x] Store generated story for downstream use

### 4. Audio Generation

- [x] Script to send story text to ElevenLabs API (using Voice ID) for TTS
- [x] Save resulting audio file

### 5. Description Generation

- [x] Script to summarize story into an episode description with episode title using OpenAI
- [x] Save episode description

### 6. Artwork Generation

- [x] Script to generate unique episode artwork using OpenAI's image model (now uses gpt-image-1; scripts use async IIFE pattern for compatibility)
- [x] Save artwork image

### 7. Asset Storage

- [ ] Store all generated assets (story, audio, description, artwork) in a persistent location (Vercel storage BLOBS and Supabase for metadata)

### 8. Web App & Podcast Feed

- [ ] Update Next.js app to display new episode (audio, artwork, description) as an RSS endpoint. The RSS feed should be consistent with what is required of Apple and Spotify according to their specs. There are also open-source RSS feed validators available online that can help ensure the feed is valid.

### 9. Automation/Orchestration

- [x] Write GitHub Actions YAML workflow to:
  - Run all scripts in sequence daily
  - Pass outputs between steps
  - Redeploy app as needed
- [x] Store all secrets (API keys, Voice ID) in GitHub Actions secrets

### 10. Testing & Validation

- [x] Test each script independently
- [x] Run full workflow end-to-end in staging (via GitHub Actions)
- [ ] Validate episode appears in web app and RSS feed

### 11. Launch & Maintenance

- [ ] Launch initial version
- [ ] Monitor for errors or API changes
- [ ] Update documentation and scripts as needed

---

**Note:** Update this plan as tasks are completed or new requirements emerge. All contributors should reference this file to track project progress and next steps.
