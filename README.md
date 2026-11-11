# OMNIVEX

**Beyond every universe.**

OMNIVEX is a universal comparison, research, evidence, discovery, rankings and community platform. It is designed to connect entities, versions, universes, sources, matchups and community contributions.

## Current application

The `main` branch now contains the Multiverse Field Atlas implementation. The earlier `field-atlas-redesign` branch is preserved at the same prior commit as a recovery point.

The application currently includes:
- React 19 + Vite 8 with React Router 8 and a responsive shared navigation shell.
- The editorial Field Atlas homepage.
- Routed discovery, entity directory, universe hubs, entity dossiers, matchup setup and report pages, evidence explorer/detail, rankings, community, personal space, saved library and private research notebook.
- Supabase browser client and email/password auth integration, configured through environment variables.
- A Supabase database schema with entity/version, source/evidence, capability/feat, matchup/report, debate/reaction, follow/save, note, notification, event, ranking and moderation structures.
- All 25 React Bits components integrated in their assigned locations. See [the implementation tracker](./docs/REACT-BITS-INTEGRATION-TRACKER.md).

## Build vs. runtime status

The production build verifies compilation and bundling only. Browser interaction, visual desktop/mobile QA, authenticated database operations and Netlify deployment must be tested separately. All React Bits entries are currently marked **INTEGRATED**; their interaction and desktop/mobile acceptance tests remain **NOT VERIFIED**.

Pages load records from Supabase rather than filling empty catalogues with invented entities, scores or discussions. Until the Supabase publishable key is added and the schema has been applied, database-backed pages will not display live data.

## Supabase setup

The project URL is configured as:

`https://brbeqauwzvuruvjdjnud.supabase.co`

Add these environment variables to the deployment:
- `VITE_SUPABASE_URL` — the project URL above.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the project's publishable key from Supabase Settings → API Keys.

Never put a `service_role` key or Supabase secret key in a `VITE_` variable or any browser bundle. The schema is in [supabase/schema.sql](./supabase/schema.sql). It still needs to be applied to the intended Supabase project and checked with RLS/security advisors; remote installation has not been confirmed from this repository workflow.

## Stack

- React 19 + Vite 8
- React Router 8
- Supabase JS client
- GSAP, Motion for React
- Hugeicons React + Core Free Icons
- Matter.js (Folder Float physics)
- Lucide React, Radix UI, cmdk
- Official React Bits source integrations
- Custom Field Atlas CSS
- Netlify static hosting configuration

React Bits attribution and the MIT + Commons Clause source license are preserved in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) and [licenses/REACT_BITS_LICENSE.md](./licenses/REACT_BITS_LICENSE.md). Do not sell, sublicense or redistribute the components as standalone source.

## Run locally

Requires Node.js 22.22.0 or newer.

    npm install
    npm run dev

Production build:

    npm run build

Netlify uses `npm run build`, publishes `dist`, and has an SPA redirect configured in `netlify.toml`. Hosting deployment has not been claimed as verified unless a deployment run confirms it.

## Project documents

- [Design research and Field Atlas direction](./docs/OMNIVEX-DESIGN-RESEARCH-AND-DIRECTION.md)
- [Application architecture](./docs/OMNIVEX-APPLICATION-ARCHITECTURE.md)
- [25-component React Bits tracker](./docs/REACT-BITS-INTEGRATION-TRACKER.md)
- [Image credits](./IMAGE_CREDITS.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)

## Product principles

1. Keep entity identity, versions and continuities explicit.
2. Separate canon-confirmed outcomes from hypothetical predictions.
3. Make evidence, sources, context and counter-evidence traceable.
4. Allow inconclusive results.
5. Never fabricate sources, feats, verdicts, rankings or engagement counts.
6. Distinguish popularity from capability and evidence quality.
7. Keep saves, follows, reactions and formal votes as separate user actions.
8. Protect private user data with owner-scoped access control.
