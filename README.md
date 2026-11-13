# OMNIVEX

**Beyond every universe.**

OMNIVEX is a universal comparison, research, evidence, discovery, rankings and community platform. It is designed to connect entities, versions, universes, sources, matchups and community contributions.

## Current application

The `main` branch now contains the Multiverse Field Atlas implementation. The earlier `field-atlas-redesign` branch is preserved at the same prior commit as a recovery point.

The active frontend is being rebuilt feature-first around the agreed product structure:
- Home (/) — live catalogue summaries, recent universes/entities and published matchup configurations.
- Explore (/explore) — merged entity + universe index with category filters, sorting and alias-aware search.
- Entity dossiers (/entity/:slug) and universe hubs (/universe/:slug) — version-aware identity, capabilities, evidence and sources.
- Matchups (/matchups) — browse configurations, create comparisons using exact versions and inspect stored reports.
- Research (/research) — evidence explorer, source library and review queue.
- Community (/community) — feed, debates, events and members, plus discussion/event detail pages.
- Rankings (/rankings) — distinct ranking types and periods resolved to indexed subjects.
- Library (/library) — saved items and private editable research notes.
- Profiles (/profile/:username) — public member pages and self-editable username, display name and bio.
- Responsive shared shell with universal Explore search, Library and Profile access.
- Supabase browser client and email/password auth integration.
- Version-specific media provenance and approval migration for actual character artwork.

React Bits source copies are retained in the repository, but their placement in the feature-first UI is intentionally paused until feature UX is stable. They are not considered active page integrations right now; see the revised tracker.

## Build vs. runtime status

The production build verifies compilation and bundling only. Browser interaction, visual desktop/mobile QA, authenticated database operations and Netlify deployment must be tested separately. A successful GitHub Actions production build was confirmed for commit 3bee866; later commits need their own build verification. React Bits placement is deferred and is not claimed as integrated into the new frontend.

Pages load records from Supabase rather than filling empty catalogues with invented entities, scores or discussions. Until the Supabase publishable key is added and the schema has been applied, database-backed pages will not display live data.

## Supabase setup

The project URL is configured as:

`https://brbeqauwzvuruvjdjnud.supabase.co`

Add these environment variables to the deployment:
- `VITE_SUPABASE_URL` — the project URL above.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the project's publishable key from Supabase Settings → API Keys.

Never put a `service_role` key or Supabase secret key in a `VITE_` variable or any browser bundle. The base schema is in [supabase/schema.sql](./supabase/schema.sql). The additive artwork-provenance migration is [supabase/migrations/20261113_entity_media_provenance.sql](./supabase/migrations/20261113_entity_media_provenance.sql). Both still need to be applied to the intended Supabase project and checked with RLS/security advisors; remote installation has not been confirmed from this repository workflow.

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
