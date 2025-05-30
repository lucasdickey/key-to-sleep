This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## Key To Sleep Podcast Automation

This project automates the generation of podcast episodes, including:
- Story/script generation (OpenAI)
- Metadata/title/description generation (OpenAI)
- Artwork prompt generation (OpenAI)
- Audio generation (ElevenLabs TTS)
- Asset storage in Vercel Blob (audio), and database (metadata)
- Modular scripts for each step, written in TypeScript

### Modular Scripts
- `scripts/generateEpisode.ts` — Orchestrates the full episode generation (story, metadata, artwork prompt)
- `scripts/generateMetadata.ts` — Generates evocative, story-specific metadata and title
- `scripts/generateArtwork.ts` — Generates artwork prompt for each episode
- `scripts/generateAudio.ts` — Generates TTS audio from the episode story

### Automation & Integration
- After each script runs, assets are stored in the output directory
- Audio is uploaded to Vercel Blob and the blob URL is saved in the DB
- Metadata is inserted into the DB as a first-class object
- Local audio files are deleted after upload to save disk space

### TypeScript & Troubleshooting
- All scripts use `export {};` at the top to avoid block-scoped variable redeclaration errors
- Run `tsc --noEmit` to check type safety across all scripts
- If you see TS2451 errors, ensure each script starts with `export {};`

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
