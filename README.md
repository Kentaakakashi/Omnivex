# OMNIVEX

**Beyond every universe.**

OMNIVEX is a universe-spanning character index and comparison platform concept. It brings together character discovery, continuity-aware matchups, evidence research, rankings and community debate.

This repository contains the frontend experience. Search, matchup setup, rankings and discussion previews currently use illustrative local data; the Battle Engine, user accounts and community backend are not connected yet.

## Stack

- React 19 + Vite 8
- Motion for React
- Lucide React
- Radix UI Dialog and Tabs
- cmdk command palette
- Magic UI adapted components (MIT)
- Custom responsive CSS
- Netlify static hosting
- Supabase planned for authentication, structured data and community features

## Run locally

Requires Node.js 22.

    npm install
    npm run dev

Build and preview:

    npm run build
    npm run preview

## Netlify

The included `netlify.toml` configures `npm run build`, publishes `dist`, uses Node 22 and routes client-side paths to `index.html`.

Connect this GitHub repository to a Netlify site and use the repository's `main` branch for continuous deployment.

## Component sources

Reusable components in `src/components/magicui/` are adapted from or inspired by Magic UI. Attribution and the MIT license are included in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Image credits

Temporary character visuals are Wikimedia Commons cosplay photographs, not official character renders. See [IMAGE_CREDITS.md](./IMAGE_CREDITS.md) for creators and licenses.

## Product principles

1. Keep versions and continuities explicit.
2. Separate canon outcomes from hypothetical predictions.
3. Make evidence and counter-evidence visible.
4. Allow an inconclusive outcome.
5. Never fabricate sources, statistics or verdicts.
6. Distinguish popularity from capability.

## Next milestone

Connect Supabase Auth and the entity/version schema after approving the frontend direction. Build evidence research, moderation and community systems as separate, testable capabilities.
