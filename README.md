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

## Supabase and research engine

The live Supabase project URL is:

`https://brbeqauwzvuruvjdjnud.supabase.co`

The frontend reads:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never put a `service_role` key or Supabase secret key in a `VITE_` variable, a browser bundle, or a public GitHub commit. The baseline schema is in [supabase/schema.sql](./supabase/schema.sql), and deployed migrations are tracked in [supabase/migrations](./supabase/migrations).

The live database has Row Level Security enabled on its public tables. The security advisor returned no findings after the source-link and AI review migrations. Performance advisor notices remain for older foreign keys and repeated auth checks elsewhere in the existing schema.

### Online discovery

The deployed `omnivex-research` Supabase Edge Function searches public discovery/catalogue endpoints:
- Wikidata and Wikipedia for broad identity/reference discovery.
- Jikan / MyAnimeList for anime character catalogue discovery.
- Crossref for scholarly metadata.
- Open Library for book and publication catalogue metadata.

Search leads do not automatically become facts. Entity imports are provisional, continuity placeholders remain unresolved until reviewed, and saved references are submitted source records. Character pages live inside OMNIVEX at `/character/:slug`. Saved sources open internal `/research/source/:id` records; the publisher's original page is an optional citation.

### AI evidence extraction and review

The Edge Function can use Gemini URL Context to inspect an allowlisted public source URL, extract source-supported evidence and capability candidates, and suggest relationships to existing evidence. The source page exposes:
- **Extract evidence & capabilities** — checks one linked source against one exact entity version.
- **Scan for contradictions** — looks for contradictory, qualifying, supporting, contextual or superseding relationships within the same exact version.
- **Relationships** — shows the submitted AI review leads.

AI output is always inserted as `submitted`. It is never auto-verified and must not be treated as fact until an authorized reviewer checks it.

To enable the Gemini stage, an owner/admin must add a production Edge Function secret in the Supabase Dashboard:

1. Open the OMNIVEX Supabase project.
2. Go to **Edge Functions → Secrets**.
3. Add key `GEMINI_API_KEY` with the private API key as its value, then save.
4. Optional: add `GEMINI_RESEARCH_MODEL` with value `gemini-3.6-flash` to pin the model.

Supabase injects these production secrets into Edge Functions, where the code reads them with `Deno.env.get`. A secret change takes effect without redeploying the function. Do not send the key in chat, commit it to GitHub, or put it in a `VITE_` variable. See the [Supabase Edge Function secrets guide](https://supabase.com/docs/guides/functions/secrets).

Gemini URL Context is limited to approved public source hosts and at most 20 URLs per request. It may be unable to read paywalled, blocked, inaccessible or unsupported pages. In those cases, the workflow returns an error or insufficient-source state; it must not invent a source claim. See [Google's URL Context documentation](https://ai.google.dev/gemini-api/docs/url-context).

### Battle Engine

The first report-generation workflow is wired to matchup pages. It loads only moderator-verified evidence and verified capability records for the exact participant versions. It stores reproducible, unverified report snapshots and links each citation back to the existing evidence record. If either side lacks verified evidence, the result is explicitly inconclusive. Non-fictional subjects are not given simulated fight outcomes. The analysis is high-level and non-graphic; weapon handling, attack techniques, injury methods and tactical sequences are excluded.

Each report also carries an independent deterministic citation audit. The audit checks that cited IDs belong to the matchup's verified evidence set, structured comparisons carry valid evidence links, and a predicted result cites both sides. A failed audit downgrades the result to inconclusive or marks the audit as needing review. It is not a semantic fact-check and does not approve the report.

Reports remain `unverified` until an authorized moderator reviews their versions, evidence IDs, source references, uncertainty and reasoning. The Research review queue includes stored matchup reports and records the moderator, review time and review note. The report is a research prediction, not a canon-confirmed result.

### Human review

The Research workspace has a moderator-only queue for source records, evidence claims, capability records, evidence relationships and matchup reports. Moderator authorization comes from trusted Supabase `app_metadata.omnivex_role` values (`moderator` or `admin`), not editable profile metadata. Moderators can verify, dispute or reject submissions. Regular members can submit material but cannot approve it.

### Current catalogue

The initial live index contains 10 universe hubs and 12 starter character dossiers with linked official/publisher reference records. These are starting identity records, not completed biographies or verified feat databases. Artwork appears only with an approved usage basis and version-matched provenance; otherwise the site uses a neutral placeholder.

Netlify must have the two frontend environment variables above and a successful deploy before the public website is considered live. GitHub Actions production builds verify compilation only; browser QA, authenticated AI calls and Netlify deployment must be checked separately.

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
