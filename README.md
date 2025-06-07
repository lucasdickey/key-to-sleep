# Key To Sleep - Custom Sleep Story Platform

This project has evolved from a podcast automation tool to a custom sleep story generation platform where users can create personalized bedtime stories.

## Platform Features

- **Customizable Story Generation**: Users can optionally specify:
  - Character name and age
  - Character gender (with gender-neutral option)
  - Companion animal and name
  - Story location
  - Values/morals to emphasize (courage, empathy, etc.)
  - All fields have defaults if not specified
- **Interactive Madlib Interface**: Inline click-to-edit fields within story preview text with real-time updates
- **Simple Payment Flow**: $2 per story generation via Stripe MCP integration
- **Real-time Progress Updates**: GitHub Actions-style progress UI with polling
- **SMS Notifications**: Text message alerts when generation is complete (via Twilio)
- **No Account Required**: Simple, stateless transactions with token-based asset retrieval

## Technical Architecture

- **Frontend**: Next.js with Tailwind CSS v3, TypeScript, and custom components
  - Interactive inline editing with keyboard navigation
  - Modern input styling with consistent 40px heights
  - Custom dropdown styling overriding browser defaults
- **Payment Processing**: Stripe integration using Model Context Protocol (MCP) for semantic API interactions
- **Database**: Supabase for job tracking and progress state
- **SMS Notifications**: Twilio for completion notifications (international numbers, English only)
- **Asset Storage**: AWS S3 for persistent storage of generated audio, artwork, and metadata
- **Real-time Updates**: Polling-based progress tracking (every 2-3 seconds)
- **Progress UI**: GitHub Actions-style step indicator with elapsed time
- **Error Handling**: 3x retry mechanism with SMS fallback to customer service
- **URLs**: Human-readable progress URLs (e.g., `/progress/2025-05-username-abc123`)
- **Download Experience**: Spotify-style media player with "Download All" zip functionality

## Core Generation Pipeline

- Story/script generation (OpenAI) - must complete first
- Metadata/title/description generation (OpenAI) - can run in parallel
- Artwork generation (OpenAI) - can run in parallel
- Audio generation (ElevenLabs TTS) - can run in parallel
- Enhanced MP3 creation with embedded artwork and metadata
- Asset storage in S3 with indefinite retention

## Modular Scripts

- `scripts/generateEpisode.ts` — Orchestrates the full episode generation (story, metadata, artwork prompt)
- `scripts/generateMetadata.ts` — Generates evocative, story-specific metadata and title
- `scripts/generateArtwork.ts` — Generates artwork prompt for each episode
- `scripts/generateAudio.ts` — Generates TTS audio from the episode story

## Automation & Integration

- After each script runs, assets are stored in the output directory
- Audio is uploaded to Vercel Blob and the blob URL is saved in the DB
- Metadata is inserted into the DB as a first-class object
- Local audio files are deleted after upload to save disk space

## TypeScript & Troubleshooting

- All scripts use `export {};` at the top to avoid block-scoped variable redeclaration errors
- Run `tsc --noEmit` to check type safety across all scripts
- If you see TS2451 errors, ensure each script starts with `export {};`

## Implementation

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the detailed development roadmap and branch strategy.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
