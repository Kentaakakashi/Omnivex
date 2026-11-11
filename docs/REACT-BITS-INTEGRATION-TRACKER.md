# OMNIVEX — React Bits 25-Component Integration Tracker

Updated: 2026-11-11  
Repository branch: `main`  
Specification: the uploaded OMNIVEX Component Integration Specification  
Official source repository: https://github.com/DavidHDev/react-bits

## Status definitions

- **INTEGRATED** — official implementation is copied into the app, imported, and rendered in its assigned page or surface.
- **FUNCTIONAL** — defining interaction and its OMNIVEX action have been exercised in a running browser.
- **VERIFIED** — acceptance tests pass, including route, data binding, desktop/mobile behaviour and runtime/console review.

A source copy, import, successful compile or green production build does not establish runtime functionality or visual verification. The live React Bits documentation previews were not available for side-by-side visual inspection during this implementation pass.

## Component status

| # | Component | Required placement | Integration location | Data/action wiring | Integrated | Functional test | Desktop QA | Mobile QA |
|---:|---|---|---|---|---|---|---|---|
| 01 | Pixel Blast | Homepage hero background | Homepage hero | Decorative WebGL field | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 02 | Accordion Gallery | Homepage featured universes | Homepage featured-universe section | Six explicitly labelled preview destinations; not a live universe index | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 03 | Carousel | Homepage spotlight | Homepage spotlight carousel | Three labelled preview slides | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 04 | Laser Flow | Featured matchup | Homepage matchup feature | Decorative WebGL effect; no verdict implied | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 05 | Drift Wall | Discover visual wall | `/discover` | Abstract archive textures only; current entities and matchups are loaded separately from Supabase | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 06 | Chroma Grid | Character directory | `/characters` | Search/filter over live entity rows; cards link to exact entity slugs; image layer is abstract texture, not canon artwork | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 07 | Flowing Menu | Universe explorer | `/universes` | Universe rows from Supabase; menu links to universe hubs | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 08 | Infinite Menu | Related character explorer | Entity dossier, related same-universe index | Linked entities from the selected entity's primary universe | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 09 | Pill Nav | Global desktop navigation | Application shell | React Router links and active route | YES | NOT VERIFIED | NOT VERIFIED | N/A |
| 10 | Staggered Menu | Global mobile navigation | Application shell | React Router navigation callback | YES | NOT VERIFIED | N/A | NOT VERIFIED |
| 11 | Line Sidebar | Character dossier navigation | Entity dossier | Scrolls to dossier sections | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 12 | Dock | Character contextual actions | Entity dossier | Save record, copy link, private research notebook, entity index | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 13 | Stepper | Matchup creation workflow | `/matchups/create` | Selects two exact entity versions; saves draft matchup and participant records | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 14 | Option Wheel | Matchup condition selection | Matchup creation step 2 | Selects the requested ruleset | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 15 | Scroll Stack | Published matchup breakdown | Matchup detail | Reads stored configuration and report fields; no verdict is invented | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 16 | Card Swap | Matchup evidence highlights | Matchup detail | Evidence highlights linked to the stored report snapshot | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 17 | Folder | Character source vault | Entity dossier | Source records linked through version evidence; click opens source URL when present | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 18 | Folder Float | Personal research notebook | `/me/research` | Owner-scoped research notes; select and edit notes | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 19 | Branched Menu | Evidence relationship navigator | `/evidence` | Selects evidence records in the current explorer tree | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 20 | Border Glow | Selected evidence highlights | Evidence explorer and detail | Frames the selected stored evidence record; highlight is not a verification state | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 21 | Animated List | Rankings activity | `/rankings` | Reads ranking snapshots and filters by ranking type | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 22 | Swipe Row | Saved library | `/me/library` | Swipe action removes only the current user's saved relationship | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 23 | Swipe Toast | Global notification and feedback | Global ToastProvider | Local action feedback, including copy and save outcomes | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 24 | Bell Toggle | Follow notifications | Entity dossier | Inserts/deletes the current user's entity follow relationship | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| 25 | Pulse Heart | Community contribution reactions | `/community` | Adds/removes the current user's support reaction on discussions | YES | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

## Source and dependency notes

The 18 remaining implementations were copied from the official React Bits JavaScript + CSS sources into `src/components/react-bits/`, retaining the upstream component implementations and styles. React Bits' MIT + Commons Clause license is preserved in `licenses/REACT_BITS_LICENSE.md`. The required third-party notice must remain with the app.

- React Bits official source: https://github.com/DavidHDev/react-bits
- React Bits live component library: https://reactbits.dev/
- `matter-js@0.20.0` is added for Folder Float.
- `motion/react` and Hugeicons imports are provided by existing dependencies.
- Existing GSAP, React Router and component icon dependencies remain in use.

## Data and truthfulness boundaries

- The discovery wall uses abstract textures, not character artwork.
- Character names and universe records are loaded from Supabase tables; they are not hardcoded as catalogue fixtures.
- A saved matchup configuration is not an analysis, report or verdict.
- A report only appears when a stored matchup report exists.
- Evidence highlight styling never implies evidence verification.
- Community support reactions are not factual consensus.
- Saves and follows are separate relationships.
- Notebook notes are private, owner-scoped records.
- Rankings are shown only from stored snapshots and remain identified by ranking type.
- Supabase browser access requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The schema is supplied in `supabase/schema.sql`; remote installation and advisor checks still require access to the user's Supabase project.

## Acceptance gate still outstanding

1. Run through every component interaction in a real browser.
2. Verify all routes and navigation targets.
3. Verify authenticated reads/writes against the configured Supabase project and RLS.
4. Check mobile/touch and desktop layouts.
5. Inspect console/runtime errors, WebGL2 behaviour, and reduced-motion handling.
6. Compare against official live previews where they are accessible.
7. Confirm a production build for the exact commit under test.

Until those checks are completed, the status is **INTEGRATED**, not FUNCTIONAL or VERIFIED.
