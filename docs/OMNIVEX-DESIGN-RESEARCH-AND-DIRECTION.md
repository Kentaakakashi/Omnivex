# OMNIVEX — Design Research & Visual Direction
Date: 2026-11-10
Status: Research synthesis and proposed art direction
Applies to: Website Master Prompt + 25-component integration specification

> This document records the research and design decisions guiding the next architecture and implementation stages. It does not mark any React Bits component as implemented or verified.

## 1. Product interpretation

OMNIVEX is a connected knowledge environment, not a conventional SaaS dashboard and not only a fictional-character battle site. Its interface must support three related modes:

1. **Explore** — discover entities, versions, universes, relationships, matchups and community activity.
2. **Investigate** — inspect profiles, source records, feats, claims, conflicting interpretations and evidence provenance.
3. **Compare and contribute** — configure matchups, examine structured analysis, debate, submit corrections and maintain personal research.

Every page should make its purpose obvious. Shared design tokens and navigation create coherence; page-specific compositions create variety.

## 2. Research examined

### Character-led visual compositions

- **Superhero Database concept by Bytecompass (Dribbble):** a large character image sits at the centre of the interface, with smaller character selections and matchup artwork elsewhere in the same visual field. Lesson: artwork should be part of the composition, not a thumbnail inside a generic card. This is a visual concept, not a product architecture to copy.
  - https://dribbble.com/shots/20832865-Superhero-database-website
- **DC Character Website concept by Jesse Showalter (Dribbble):** large character portraits, strong character-name typography and layered page panels demonstrate how a character identity can dominate a profile without hiding supporting information.
  - https://dribbble.com/shots/16027591-DC-Character-Website
- **The Batman website concept by Rendika Nurhartanto (Dribbble):** demonstrates a character-specific hero composition with navigation and identity details. Treat as inspiration for composition, not as a template.
  - https://dribbble.com/shots/19490617-Website-Design-The-Batman

### Real catalogue and research mechanics

- **VerseDB character directory:** exposes search, publisher and role filters, sorting and pagination, and links character records to detail pages. Adopt the practical catalogue mechanics; do not copy its layout.
  - https://versedb.com/characters
- **OpenProfile:** demonstrates a community-owned character catalogue with visible creator attribution and profile-status indicators. Lesson: authorship and moderation/verification states should be visible. Its original-character focus differs from OMNIVEX.
  - https://beta.openprofile.app/
- **Super Hero Stats:** separates adaptations/versions and labels the provenance state of powers, weaknesses and relationships. Its methodology says its 1–10 scores are editorial assessments, not official publisher data. Adopt version separation and provenance labels; do not adopt simplistic universal numeric power ratings.
  - https://www.superherostats.com/en/
- **Comic Book Co Codex:** presents a structured database of characters, works, teams, relationships and sourced feats, with claims linked to origins. Lesson: entities and their relationships should be first-class data, not unrelated lists.
  - https://comicbookco.com/codex/
- **ASOIAF Lore data methodology:** distinguishes coverage from completeness and documents which data is curated, partially reviewed or higher-confidence. Lesson: disclose scope and confidence rather than implying an incomplete dataset is comprehensive.
  - https://asoiaf.io/about/data
- **Charopedia:** organizes a broad character catalogue by media/universe groupings and provides a search-led entry point. Lesson: users need multiple discovery paths, not only one giant list.
  - https://charopedia.com/

### Interaction and component source

- The official **React Bits** repository and website are the source of truth for the 25 selected components. The repository documents 215+ animated components/backgrounds and provides JS/TS and CSS/Tailwind variants.
  - https://github.com/DavidHDev/react-bits
  - https://reactbits.dev/
- The official repository source tree was inspected and all 25 named component source directories were located. This is only a source-location check. Before each component is implemented, its own official page, preview, source, props, install instructions, dependencies and mobile behaviour must still be examined individually.
- Important licensing note: React Bits uses **MIT + Commons Clause**, not plain MIT. Preserve copyright/license notices for copied portions. The license permits use as part of a website/product but prohibits selling, sublicensing or redistributing the components themselves as standalone, bundled or ported components. Keep attribution and license records in the repository.
  - https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

## 3. What to take from the research

Adopt:
- Artwork-led composition with large, high-quality character imagery.
- A visual hierarchy that makes character identity immediately legible.
- Real catalogue structure with search, filters, sorting, pagination and detail destinations.
- Explicit version/continuity identity on directory entries and profiles.
- Visible source/provenance states distinguishing verified, submitted, disputed and editorial/inferred information.
- Relationships between characters, universes, works, versions, evidence and matchups.
- Honest dataset scope, incomplete states and missing-data handling.
- Page-specific layouts rather than repeating the same card grid.

Do not adopt:
- Unsubstantiated 1–10 power scores or one universal cross-universe tier.
- Popularity presented as capability or evidence quality.
- Verification conveyed only through colour, glow or decoration.
- UI concepts treated as tested, functional products.
- Whole templates copied from unrelated sites.
- Fake record counts, engagement values, ranking movement, or placeholder actions represented as live functionality.

## 4. Proposed OMNIVEX art direction

### Working name: The Multiverse Field Atlas

Build an interface that feels like an instrument for navigating a vast, interconnected archive. The experience combines the atmosphere of a cinematic character database with the clarity of a modern research catalogue.

This is a proposed creative direction derived from the user-provided visual brief and research. It is not a claim that the final UI has already been built or visually tested.

### Colour system

Move away from the current near-black canvas with red/blue/gold accents. Use a **cool mineral / deep-petrol** system with controlled signal colours:

- Mineral canvas: #E9EFF0 — primary light workspace background.
- Porcelain surface: #F7F9F8 — elevated reading surfaces.
- Deep ink: #13242D — primary text and dark interface surfaces.
- Petrol: #173B46 — immersive hero and feature panels.
- Muted slate: #71838A — secondary text and metadata.
- Signal coral: #E76F51 — one matchup side / important alerts.
- Ion teal: #42BFC0 — opposing matchup side / active data accents.
- Cobalt: #426DAB — links, navigation focus and selected research states.

Use coral and teal as semantic matchup-side colours only when there are two competing participants. They are not a licence to tint every component. Verification states must use explicit text/icons as well as colour.

Alternate light research workspaces with a few deep cinematic stages. Do not make every section a dark rectangle. The overall visual identity must be recognizably different from the current black/red-heavy implementation and from Black Dragons.

### Typography

Proposed family roles:
- Display and section titles: **Space Grotesk** — assertive but not condensed esports typography.
- Body and controls: **Manrope** — readable at compact mobile sizes.
- Data labels, IDs, source metadata and timestamps: **IBM Plex Mono** — measured technical metadata.

Use typography and whitespace to establish hierarchy. Avoid oversized display text in every section.

### Composition and layout

- Use asymmetric, art-directed page compositions instead of a repeating three-column card system.
- Use large cutouts and cinematic image panels where artwork helps identify an entity.
- Keep source details, continuity labels and technical metadata close to the relevant claim or entity.
- Use horizontal rails and image bands selectively for browsing, not as the default for every section.
- Make directory pages information-dense but scannable, with filters and meaningful empty/loading states.
- Give character profiles a distinct dossier layout with a clear section index and related-entity exploration.
- Make evidence pages feel like research tools: traceable relationships, context, sources and dispute states.
- Treat the matchup page as a structured comparison workspace, not two portraits separated by a large VS.
- Give Community and Personal Library their own information architecture rather than reusing the directory layout.

### Artwork rules

- Artwork must match the actual entity/version being presented.
- Do not label cosplay photos as official character renders.
- Maintain source/license notes for assets and provide a graceful fallback.
- Use responsive image crops and focal-point positioning instead of forcing every image into the same thumbnail ratio.
- Avoid hotlinking arbitrary images as a permanent asset strategy.

## 5. Page-level visual translation

| Page / experience | Design approach | Required component relationship |
|---|---|---|
| Homepage hero | Two-part editorial hero: clear product introduction plus a large cinematic character/atlas stage. Pixel texture stays behind content. | Pixel Blast |
| Featured universes | Wide image-led expanding universe bands; featured destinations, not the full directory. | Accordion Gallery |
| Homepage spotlight | Editorial rotating feature for a selected profile, research item or matchup; each slide has a destination. | Carousel |
| Featured matchup | Dedicated deep-petrol matchup stage with two large participants and subtle energy treatment. | Laser Flow |
| Discover | Scrollable image-first map of entities, universes, matchups and discussions; every tile is a destination. | Drift Wall |
| Character directory | Search/filter/sort controls around an artwork-led directory that scales to many entries. | Chroma Grid |
| Universe explorer | Full-page image-band selection, distinct from the homepage gallery. | Flowing Menu |
| Character profile | Dossier with hero artwork, explicit version identity, anchored sections, action dock, source vault and related characters. | Line Sidebar, Dock, Infinite Menu, Folder, Border Glow |
| Matchup creation | Guided multi-step workflow with retained values, validation and review. | Stepper, Option Wheel |
| Published matchup | Evidence-led breakdown with conditions, capabilities, interactions, counters, sources, uncertainty and conclusion. | Scroll Stack, Card Swap |
| Evidence Explorer | Trace a claim from universe/continuity/work/issue or episode through scene, feat and claim; highlight selected evidence only. | Branched Menu, Border Glow |
| Rankings | Separate popularity, debate activity and other ranking types; show change only when historical data exists. | Animated List |
| Community | Threaded discussions and contribution actions; reaction counts come from stored records. | Pulse Heart |
| User profile | Personal notes and saved entries belong to the authenticated user. Saving and following stay separate. | Folder Float, Swipe Row, Bell Toggle |
| Global feedback | Reusable success/error/undo feedback tied to actual actions. | Swipe Toast |
| Global navigation | Separate desktop/mobile navigation presentations with accessible touch states. | Pill Nav, Staggered Menu |

## 6. Non-negotiable product integrity

- Separate entity identity from incarnation/version and continuity.
- Do not merge alternate forms, media versions or continuities by default.
- Do not invent relationships, feats, source records, statistics, vote counts or ranking movement.
- Clearly mark demonstration data until real indexed/backend data exists.
- Keep canon-confirmed outcomes distinct from hypothetical analysis.
- Allow inconclusive outcomes and visible uncertainty.
- Distinguish verified source existence from interpretation quality.
- A visual highlight never implies source verification.
- Save/remove actions affect only the user's saved relationship, never the public entity or discussion.
- Follow/subscription preferences are separate from saved items.
- Private notebook data must be scoped to its owner.

## 7. Current repository baseline (before redesign implementation)

Repository: https://github.com/Kentaakakashi/Omnivex

The main branch inspected on 2026-11-10 contains:
- React 19 + Vite 8 single-page frontend.
- One main application module (src/App.jsx) and one large stylesheet (src/styles.css).
- Hash-anchor navigation rather than a full route/page architecture.
- Seven local demonstration character entries, three example matchups, sample ranking arrays, sample debates and six universe entries.
- Six Magic UI-derived components imported into the current page.
- No Supabase client dependency, schema/migrations or connected authentication/community backend visible in the inspected repository.
- README accurately says that search, matchup setup, rankings and discussion previews use illustrative local data and that the Battle Engine, accounts and community backend are not connected.
- Netlify configuration and a GitHub Actions production build workflow are present.

The latest main commit inspected was 62fdd47397137e05ab2e9ec749b2461f3873c8ca. GitHub Actions run 42860350068 completed successfully for that exact commit. This verifies the current Vite production build only; it does not verify visual rendering, mobile interactions, Netlify deployment, Supabase or the 25 React Bits integrations.

## 8. Implementation gates

Do not skip or collapse the sequence defined by the master prompt:

1. Existing project investigation — completed as a repository/API inspection; browser visual QA is still outstanding.
2. Review both master prompts — completed in full.
3. External design research — completed to the extent recorded here.
4. Visual identity — proposed above; still requires implementation and visual refinement.
5. Website architecture — next stage.
6. Page design and implementation — only after routes, data relationships and component placement are established.
7. Functional integration.
8. Responsive refinement.
9. Testing and verification.
10. Production readiness.

### React Bits implementation tracker

The complete, current 25-component checklist is maintained in [REACT-BITS-INTEGRATION-TRACKER.md](./REACT-BITS-INTEGRATION-TRACKER.md). That file is the authoritative tracker for official URLs, research/source status, dependencies, integration, functionality, data connection and desktop/mobile verification.

The first implementation slice contains seven rendered component integrations. Their browser interaction tests and visual desktop/mobile verification remain outstanding. The remaining 18 components are not started.

A component may only be marked **VERIFIED** after it is rendered in its assigned page, its defining behaviour is tested, its real route/action/data binding works, and desktop/mobile behaviour has been checked.


All components are currently **NOT STARTED** in the OMNIVEX application. Locating their upstream source directories is not the same as researching, installing, integrating or verifying them.

| # | Component | Assigned placement | Research | Source | Integrated | Functional | Data connected | Desktop verified | Mobile verified |
|---:|---|---|---|---|---|---|---|---|---|
| 01 | Pixel Blast | Homepage hero | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 02 | Accordion Gallery | Featured universes | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 03 | Carousel | Homepage spotlight | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 04 | Laser Flow | Featured matchup | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 05 | Drift Wall | Discover visual wall | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 06 | Chroma Grid | Character directory | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 07 | Flowing Menu | Universe explorer | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 08 | Infinite Menu | Related character explorer | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 09 | Pill Nav | Desktop navigation | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 10 | Staggered Menu | Mobile navigation | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 11 | Line Sidebar | Character profile navigation | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 12 | Dock | Character contextual actions | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 13 | Stepper | Matchup creation | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 14 | Option Wheel | Matchup conditions | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 15 | Scroll Stack | Published matchup breakdown | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 16 | Card Swap | Evidence highlights | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 17 | Folder | Character source vault | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 18 | Folder Float | Personal research notebook | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 19 | Branched Menu | Evidence relationship navigator | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 20 | Border Glow | Selected evidence highlights | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 21 | Animated List | Ranking activity | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 22 | Swipe Row | Saved library | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 23 | Swipe Toast | Global feedback | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 24 | Bell Toggle | Follow notifications | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |
| 25 | Pulse Heart | Community reactions | NOT STARTED | LOCATED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED |

A component may only be marked **VERIFIED** after it is rendered in its assigned page, its defining behaviour is tested, its real route/action/data binding works, and desktop/mobile behaviour has been checked.
