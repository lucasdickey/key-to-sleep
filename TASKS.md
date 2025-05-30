# TASKS.md

## Project Plan: Key To Sleep Podcast Automation

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
