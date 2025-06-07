# AGENTS.md

## Project Technology Stack

- **Frontend**: Next.js (React, Vercel-friendly)
- **Backend/API**: Next.js API routes (for serverless functions), or scripts run by GitHub Actions
- **AI Services**:
  - OpenAI (for story, description, and artwork generation)
  - Uses `gpt-image-1` for artwork generation (base64 output, no response_format param)
  - Uses async IIFE pattern for all automation scripts to avoid build/type errors
  - ElevenLabs (for text-to-speech)
- **Automation**: GitHub Actions (scheduled workflows)
- **Secrets Management**: GitHub Actions secrets for all API keys and IDs
- **Storage**: AWS S3 for persistent asset storage with sleep-stories organization
- **Database**: Supabase for job tracking, progress updates, and asset management
- **SMS**: Twilio for completion notifications (international support)
- **Podcast Syndication**: RSS feed generation for podcast platforms

## Best Practices

- **Security**: Store all sensitive credentials in GitHub Actions secrets, never in code or version control.
- **Modularity**: Keep scripts and functions modular for easy testing and reuse.
- **Error Handling**: Add robust error handling and logging in each script step.
- **API Usage**: Respect API rate limits and handle failures gracefully.
- **Automation**: Ensure each automation step properly consumes the output of the previous step.
- **Deployment**: Deploy the app to Vercel for instant updates. Use GitHub Actions to automate daily episode generation and deployment.
- **Documentation**: Keep this file and TASKS.md up to date as the project evolves.
- **Testing**: Validate each step in isolation before full workflow orchestration.

## Type Safety & Package Compatibility

- **TypeScript First**: Use TypeScript for all new code (frontend, backend, scripts). Avoid plain JavaScript unless absolutely necessary.
- **Consistent Types**: Define and reuse types/interfaces across modules to ensure consistency between API, frontend, and backend.
- **ES Modules**: Prefer ES modules (`import/export`) over CommonJS (`require/module.exports`). Configure `tsconfig.json` and `package.json` to use `module: "esnext"` or `module: "node16"` as appropriate.
- **Compatible Packages**: Choose libraries/packages that provide TypeScript types (`@types/*` or built-in types). Avoid packages that are not maintained or lack type support.
- **Type Checking in CI**: Add type checking (`tsc --noEmit`) as a required step in GitHub Actions to catch type errors early.
- **Interop Awareness**: When integrating with JavaScript or legacy code, use TypeScript's type definitions and type guards. Avoid type assertions unless necessary and document them.
- **Avoid Type Mismatches**: Be cautious with data serialization/deserialization (e.g., JSON), and always validate external data before use.
- **Dependencies**: Keep dependencies up to date, and prefer those with strong TypeScript and ESM support. Test compatibility before major upgrades.

> **Caveat:** If you're even remotely unsure, use web access and find the latest documentation from the software or service vendor.

## Atomic Branching, Testing & Documentation

- **Branch Per Story**: Start each new "story" (feature, episode, or major change) on a dedicated git branch.
- **Logical Grouping**: Organize work into logically grouped tasks. After each group, pause to test atomically.
- **Atomic Testing**: At each critical step, stop and:
  - Build and run the project locally (`npm run build`)
  - Run all linting and type checks (`npm run lint`, `tsc --noEmit`)
  - Run test suite (`npm run test`)
  - Ensure all features work as expected in browser
- **Commit Discipline**: Only after successful atomic testing:
  - Add/commit all relevant files
  - Write a thorough, descriptive commit message
  - Merge the branch (ideally via PR)
- **Living Documentation**: If any requirements, best practices, or processes change during the work, update AGENTS.md and/or TASKS.md before completing and merging the branch.

## Component Architecture Patterns (Established)

- **Inline Editing**: Use InlineField component pattern for click-to-edit functionality
  - Consistent 40px heights across all field states to prevent layout shifting
  - Keyboard navigation support (Enter/Tab/Escape)
  - Custom styling with gradients and proper focus states
- **Form Components**: Modular components with clear TypeScript interfaces
- **Styling Consistency**: Tailwind CSS v3 with custom configuration
  - Modern input styling with rounded-xl borders and gradients
  - Custom dropdown appearance overriding browser defaults
  - Smooth transitions and hover effects throughout

---

All agents/models working on this project should follow these guidelines and refer to this document for reference on technology choices and best practices.
