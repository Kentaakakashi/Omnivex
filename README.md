# OMNIVEX

**Beyond every universe.**

OMNIVEX is a universe-spanning index for comparison, evidence, discovery and community debate.

This repository contains the first responsive website experience. Matchup configuration and search are interactive previews, not connected research or account features yet.

## Stack
- React 19 + Vite 8
- Motion for React for restrained animation
- Lucide React for iconography
- Custom CSS design system
- Netlify for static hosting
- Supabase is the planned backend; no credentials or database connection are included yet

## Local development
Requires Node.js 20.19+ (22 recommended).

    npm install
    npm run dev

Create a production build:

    npm run build
    npm run preview

## Netlify
The included netlify.toml sets npm run build, publishes dist, and uses Node 22. Connect this GitHub repository to Netlify to enable automatic deployments from main.

## Current experience
- Responsive homepage and navigation
- Search overlay with illustrative entries
- Interactive matchup configuration preview
- Universe directory selector
- Evidence-methodology section
- Community debate preview
- Reduced-motion support and keyboard-accessible controls

## Product principles
1. Keep versions and continuities explicit.
2. Separate canon outcomes from hypothetical predictions.
3. Make sources and counter-evidence visible.
4. Allow an inconclusive result.
5. Never invent source coverage, statistics or verdicts.

## Next milestone
Connect Supabase Auth and the structured entity/version schema after the website direction is approved. Build research, evidence, moderation and community systems as separate, testable capabilities.
