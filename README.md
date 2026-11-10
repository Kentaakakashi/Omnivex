# OMNIVEX

**Beyond every universe.**

OMNIVEX is a universal comparison, research, evidence, discovery, rankings and community platform. It is designed to connect entities, versions, universes, sources, matchups and community contributions.

## Development branches

- `main` remains the previously working frontend baseline.
- `field-atlas-redesign` is the active implementation branch for the new **Multiverse Field Atlas** design and routed application architecture. It is deliberately separate while the new pages and all required components are being implemented and verified.

## Current implementation status

The redesign branch currently contains:
- A React 19 + Vite 8 app with URL-based routes and a shared desktop/mobile navigation shell.
- A new homepage direction using Pixel Blast, Accordion Gallery, Carousel and Laser Flow in their assigned roles.
- The official React Bits Pill Nav, Staggered Menu and Swipe Toast integrations.
- Route scaffolds for discovery, characters, entities, universes, matchup creation/reports, evidence, rankings, community, events, member profiles and personal areas.
- An explicit 25-component status tracker in [docs/REACT-BITS-INTEGRATION-TRACKER.md](./docs/REACT-BITS-INTEGRATION-TRACKER.md).

**Only seven of the 25 required React Bits components have been copied and placed so far.** Their runtime interactions and desktop/mobile appearances still need browser testing. The other 18 have not been integrated.

The visible homepage imagery is temporary Wikimedia Commons cosplay photography and historical sculpture photography, not official character artwork. See [IMAGE_CREDITS.md](./IMAGE_CREDITS.md).

## What is not connected yet

- Supabase client, database schema, Row Level Security, authentication and persistent user data.
- A real entity/version catalogue and production search.
- Evidence records, source verification and the Battle Engine.
- Community posts, reactions, subscriptions, collections, private notes and notifications.
- Live ranking datasets and event/tournament data.
- Full functional page experiences beyond the current homepage and route scaffolds.
- Desktop/mobile browser visual QA and Netlify deployment verification.

The route scaffolds label missing systems rather than pretending that demonstration data is live. The Battle Engine must not invent sources, feats, verdicts or confidence values.

## Stack

- React 19 + Vite 8
- React Router 8
- GSAP (Accordion Gallery and Staggered Menu)
- Motion for React
- Hugeicons React + Core Free Icons (Carousel and Swipe Toast)
- Lucide React
- Radix UI Dialog and Tabs
- cmdk
- Official React Bits source integrations
- Custom Field Atlas CSS
- Netlify static hosting configuration
- Supabase selected for the backend; not yet connected in the redesign branch

React Bits attribution and the MIT + Commons Clause source license are preserved in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) and [licenses/REACT_BITS_LICENSE.md](./licenses/REACT_BITS_LICENSE.md).

## Run locally

Requires Node.js 22.22.0 or newer.

    npm install
    npm run dev

Build and preview:

    npm run build
    npm run preview

## Netlify

The included `netlify.toml` configures `npm run build`, publishes `dist`, uses Node 22.22.0 and routes client-side paths to `index.html`.

The production build on GitHub Actions has passed for the redesign branch. This does not mean that the branch has been deployed to Netlify or visually verified in a browser.

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
5. Never fabricate source references, feats, ranking movement or engagement statistics.
6. Distinguish popularity from capability and evidence quality.
7. Keep saves, follows, reactions and formal votes as separate user actions.
8. Protect private user data with owner-scoped access control.
