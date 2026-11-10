# OMNIVEX — Application Architecture
Date: 2026-11-10
Status: Architecture baseline for implementation
Follows: Website Master Prompt, Component Integration Specification and Design Research & Visual Direction

## 1. Architecture goals

The architecture must support the complete OMNIVEX product without becoming one oversized component or one database table full of unrelated JSON.

It must:
- Preserve the current React + Vite application and Netlify deployment model.
- Add real URL-based pages; the current one-page hash navigation is insufficient.
- Keep entity identity, versions, continuities, works and evidence separate.
- Make all 25 required React Bits components render in their specified locations.
- Separate demonstration fixtures from production data.
- Allow Supabase to become the source of truth without coupling pages directly to database queries.
- Keep private user data private through ownership checks and Row Level Security.
- Support mobile-specific navigation and interaction patterns.
- Be testable feature by feature and page by page.

## 2. Current technical decisions

### Frontend and routing

- Keep React 19, Vite 8 and the current static-site deployment model.
- Use React Router 8 in declarative mode for client-side routes.
- The current official installation guide uses the react-router package and imports BrowserRouter from react-router. Do not add the old react-router-dom dependency by habit.
- Use route parameters for entity, version, universe, matchup, discussion and member pages.
- Use query parameters for reversible view state such as search filters, sort order, selected ranking type and time window.
- Support browser back/forward, direct URL entry, refresh and copied links.
- Retain the existing Netlify SPA fallback so nested routes resolve to index.html.

Official routing references:
- https://reactrouter.com/start/declarative/installation
- https://reactrouter.com/api/declarative-routers/BrowserRouter
- https://reactrouter.com/changelog

### State boundaries

Do not introduce a global state library unless implementation demonstrates a real need.

Use route state for navigation and shareable filters; local component state for transient interactions; small context providers for cross-page concerns such as authentication session, notification feedback and matchup draft state; Supabase as the persistent source of truth; and feature repositories/hooks as the single boundary between pages and remote data.

A local preview must never masquerade as persisted production data.

### Existing systems

- Retain Vite, React, Netlify, the current build workflow and working utilities where useful.
- Do not assume Supabase is already connected: the inspected repository does not contain a Supabase client, schema, migrations or connected authentication.
- Do not remove Magic UI code merely because it exists. It does not satisfy any of the 25 mandatory React Bits requirements; it can be retired later if unused and safe to remove.
- Re-check package compatibility and the official React Bits page/source before each component installation.

## 3. Route map

All routes must load directly and survive refresh.

| Route | Page / purpose | Access |
|---|---|---|
| / | Homepage and editorial entry point | Public |
| /discover | Drift Wall visual discovery | Public |
| /characters | Character directory | Public |
| /characters/:entitySlug | Character dossier, default version/context | Public |
| /characters/:entitySlug/versions/:versionSlug | Version-locked character dossier | Public |
| /entities/:entitySlug | Non-character entity dossier | Public |
| /universes | Full universe explorer | Public |
| /universes/:universeSlug | Universe hub | Public |
| /matchups/create | Five-stage matchup workflow | Sign-in required to publish |
| /matchups/:matchupSlug | Published matchup and Battle Engine report | Public |
| /evidence | Evidence Explorer | Public |
| /evidence/:evidenceSlug | Claim/feat/source evidence detail | Public |
| /rankings | Ranking types and activity | Public |
| /community | Community discovery and debate feed | Public |
| /discussions/:discussionSlug | Discussion thread | Public |
| /events/:eventSlug | Tournament or community event | Public |
| /members/:username | Public member profile | Public |
| /me | Signed-in account overview | Owner |
| /me/library | Saved library and collections | Owner |
| /me/research | Personal research notebook | Owner |
| /auth/sign-in | Authentication entry | Public |
| /auth/callback | Supabase authentication callback | Public |
| * | Not-found page | Public |

### Route behaviour

- The character directory is the character-browsing entry point; canonical records remain general entities in the domain model.
- A version-specific URL identifies one exact version/continuity. It must never silently merge alternate versions.
- If a character has one version, the profile may present it by default while retaining explicit version identity in data.
- Matchup routes resolve participants by version IDs, not loose display-name strings.
- Rankings encode category and time range in query parameters, for example /rankings?type=most-debated&period=weekly.
- Search state and filters should be linkable where practical.
- Unknown slugs and deleted/private records need designed unavailable states, not fake placeholder profiles.

## 4. Feature-oriented project structure

Organize by feature and shared application infrastructure. Avoid one App.jsx containing every page and interaction.

    src/
      app/
        App.jsx
        router.jsx
        providers/
        layouts/
        route-guards/
      components/
        shared/
        feedback/
        navigation/
        react-bits/
          backgrounds/
          galleries/
          navigation/
          discovery/
          matchup/
          evidence/
          micro/
      features/
        home/
        discovery/
        characters/
        entities/
        universes/
        matchups/
        evidence/
        rankings/
        community/
        events/
        members/
        library/
        research-notes/
        notifications/
        auth/
      domain/
        entities/
        versions/
        universes/
        sources/
        evidence/
        matchups/
        community/
      data/
        demo/
        repositories/
        supabase/
      lib/
        supabase/
        validation/
        formatting/
        accessibility/
      styles/
        tokens.css
        global.css
        typography.css
        utilities.css

Rules:
- Page components compose feature components; they do not contain all database logic.
- React Bits source goes into the react-bits area, organized by component family, retaining the original implementation and required CSS/assets.
- Each React Bits wrapper adapts props/data to OMNIVEX while preserving the original component's defining behaviour.
- Feature UI remains with its feature.
- Supabase calls live in repository/data modules, not scattered through visual components.
- Demo fixtures live only under data/demo and carry an explicit demo marker.
- Names, types and IDs must be stable. Never use display names as database keys.

## 5. Core domain model

### Entity identity and versioning

The domain distinguishes:

1. **Entity** — enduring indexed identity, canonical name, aliases, entity category and slug.
2. **Entity Version** — a specific incarnation, depiction or form, tied to a continuity or universe and supported by appearances/sources.
3. **Continuity** — rules and chronology in which the version exists.
4. **Universe** — franchise, mythology, fictional setting or source-world grouping records.
5. **Work** — comic issue, chapter, episode, film, game, interview or other original material in which evidence may appear.

Example: Hulk is an entity. Earth-616 Hulk and MCU Hulk are separate version records. A special form/state must be represented according to the chosen version model and never confused with an unrelated continuity.

A canonical entity can have many versions. A version can appear in many works. A work can contain many source passages/scenes. A matchup participant must point to a specific version.

### Evidence and claims

Keep separate records for:
- Source: bibliographic identity, publisher/creator, release date, media type and canonical URL/reference.
- Evidence item: specific scene/panel/statement/reference and its location inside a source.
- Claim: proposition being supported or challenged.
- Feat: described capability/event linked to an entity version and evidence.
- Interpretation: explanation of what the evidence demonstrates.
- Review status: submitted, under review, verified, disputed, rejected or outdated/retconned.

Store source reliability separately from interpretation quality. Preserve limitations, context, contradictory evidence, continuity, contributor and verification history. A source existing does not automatically make an interpretation verified.

### Abilities and relationships

- Abilities are reusable concepts with mechanics, activation, range, requirements, limitations, counters and resistance interactions.
- An entity-version ability assignment links an ability to a specific version and is supported by evidence.
- Relationships are typed and directional where necessary: ally, enemy, family, creator/creation, member, rival, affiliation or appearance connection.
- Relationship edges carry provenance and continuity. Never infer factual relationships simply because two names are associated with the same franchise.

## 6. Matchup domain

A matchup has:
- Stable ID and public slug.
- Creator and publication status.
- Two or more participants, each linked to an exact entity-version ID.
- Typed conditions/configuration.
- Victory conditions and applicable assumptions.
- Attached evidence/claims.
- Community discussion reference.
- Analysis report and immutable report snapshot.

Conditions should be typed fields, not arbitrary unvalidated text:
- Environment / battlefield.
- Starting distance.
- Preparation time.
- Prior knowledge.
- Equipment and resources.
- Forms/transformations allowed.
- Team size / participant arrangement.
- Ruleset: standard, canon-only, composite opt-in, equalized rules or custom.
- Victory condition.
- Analysis mode.

A published report preserves versions, assumptions, evidence references, rule set and engine version used at the time. Updating evidence or conditions creates a new analysis/revision; it must not silently rewrite the historical report.

The Battle Engine output separates canon-confirmed outcomes from hypothetical predictions and allows inconclusive outcomes. Popularity and community votes are not evidence and do not determine the AI analysis.

## 7. Community and personal data

Core feature records:
- Member profile.
- Discussion thread and post/reply.
- Reaction.
- Evidence submission and correction proposal.
- Saved item.
- Collection and collection item.
- Follow/subscription.
- Personal research note.
- Notification.
- Event/tournament and participation record.
- Ranking snapshot or query-backed ranking data.

Critical distinctions:
- Saved items are not follow subscriptions.
- A reaction is not a formal matchup vote.
- Community consensus is not factual verification.
- Removing a saved item never deletes the public entity or discussion.
- Personal notes are private by default and accessible only by their owner.
- Notification records and preferences are scoped to their recipient.

## 8. Supabase security model

Supabase is the chosen backend, but it has not yet been connected to this repository.

Before implementation, inspect the actual Supabase project and current official docs. Do not assume a schema, project ID, key, authentication provider or existing policy.

Baseline access model:
- Public indexed records and published reports are publicly readable where appropriate.
- Authenticated users can submit contributions; submissions begin unverified.
- Only authorized moderators/admins can change verification/moderation status.
- Users can update their own profile and authored contributions within allowed states.
- Saved items, follows, collections, private notes and notifications require owner-scoped Row Level Security.
- Private note content must never be exposed to another member or anonymous user.
- Never expose a service-role/secret key in browser code.
- Authorization must not rely on user-editable metadata.
- Updates require ownership checks and matching WITH CHECK conditions.
- Views must be configured so they do not accidentally bypass RLS.

Use policies based on the actual table access model, not one broad policy copied to every table. Run security advisors and test representative anonymous, owner and non-owner queries after any schema change.

## 9. Data access and demo strategy

Use repository interfaces such as entityRepository, universeRepository, evidenceRepository, matchupRepository, rankingRepository, discussionRepository, profileRepository, libraryRepository, researchNoteRepository and notificationRepository.

Pages consume feature hooks or loader functions built on these repositories.

Data implementation stages:
1. Demo adapter for clearly labelled UI prototypes.
2. Supabase adapter for real persistence.
3. Tests proving that the page uses the appropriate adapter and demo data is never represented as live statistics.

Do not hardwire the seven current demo characters as the permanent directory. They are temporary fixture data.

Search eventually resolves aliases, typos, versions, universes, matchups, evidence and discussions. Search input, filters and ordering should be URL-compatible where appropriate.

## 10. Mandatory component wiring map

These placements are locked by the Component Integration Specification.

| # | Component | Route / feature | App responsibility |
|---:|---|---|---|
| 01 | Pixel Blast | / homepage hero | Atmospheric hero background, readable foreground, reduced-motion/device fallback |
| 02 | Accordion Gallery | / homepage featured universes | Expand panels and navigate to universe hubs |
| 03 | Carousel | / homepage spotlight | Navigate to real featured content |
| 04 | Laser Flow | / homepage featured matchup | Visual treatment; never obscure actions |
| 05 | Drift Wall | /discover | Image-led destination wall |
| 06 | Chroma Grid | /characters | Main browsable character catalogue |
| 07 | Flowing Menu | /universes | Full universe explorer |
| 08 | Infinite Menu | Character dossier | Related-character relationship navigation |
| 09 | Pill Nav | Global desktop shell | Primary desktop route navigation |
| 10 | Staggered Menu | Global mobile shell | Primary mobile route navigation |
| 11 | Line Sidebar | Character dossier | Anchored section navigation |
| 12 | Dock | Character dossier | Character-specific contextual actions |
| 13 | Stepper | /matchups/create | Five-stage create/publish workflow |
| 14 | Option Wheel | /matchups/create | Typed matchup condition selection |
| 15 | Scroll Stack | /matchups/:matchupSlug | Full structured battle breakdown |
| 16 | Card Swap | /matchups/:matchupSlug | Selected evidence highlights |
| 17 | Folder | Character dossier | Grouped source vault |
| 18 | Folder Float | /me/research | Owner-scoped personal notebook |
| 19 | Branched Menu | /evidence | Source-to-claim relationship navigation |
| 20 | Border Glow | /evidence and dossier highlights | Selective evidence emphasis only |
| 21 | Animated List | /rankings | Ranking activity; movement only when data exists |
| 22 | Swipe Row | /me/library | Saved-item contextual actions |
| 23 | Swipe Toast | Global feedback provider | Reusable action feedback and undo |
| 24 | Bell Toggle | Entity/matchup/discussion pages | Persisted follow/subscription state |
| 25 | Pulse Heart | /community and discussion detail | Persisted contribution reactions |

Do not merge components because they look similar. Accordion Gallery and Flowing Menu have different routes and jobs. Folder and Folder Float have different data ownership and purposes. Swipe Row and Bell Toggle manage different user relationships.

## 11. Shared user journeys

1. **Discovery:** Home or Discover → visual tile → character/universe/matchup detail → related content.
2. **Character research:** Characters → dossier → version selector → Line Sidebar section → Folder source → evidence detail → Branched Menu trace.
3. **Matchup creation:** character selection → Stepper → Option Wheel conditions → evidence attachments → review → publish → published matchup route.
4. **Battle inspection:** published matchup → Scroll Stack breakdown → Card Swap evidence record → original source.
5. **Community contribution:** matchup/discussion → reply or evidence submission → Pulse Heart appreciation → persisted reaction.
6. **Personal library:** dossier/matchup → save → /me/library → Swipe Row action → saved relationship updated only.
7. **Following:** character/matchup/discussion → Bell Toggle → subscription persisted → notification feedback.
8. **Research notebook:** /me/research → Folder Float → create/edit/delete owner-private note.

All journeys need real route transitions, correct state updates and explicit loading/error/empty states.

## 12. Implementation sequence

1. Add the router and shared application shell without deleting the current working page until replacement routes render.
2. Establish design tokens and shared layout primitives from the Field Atlas direction.
3. Create the route skeleton and not-found/loading/error states.
4. Create domain types and demo fixtures aligned to the entity/version/evidence model.
5. Create repository interfaces and keep Supabase adapter work separate.
6. Implement individual page experiences in the order their required components and data dependencies demand.
7. Connect Supabase only after inspecting the target project, docs, existing auth settings and security model.
8. Wire all 25 official React Bits components individually; inspect their own source and install notes before each integration.
9. Connect the user journeys in Section 11.
10. Verify every page and component on desktop/mobile, then build and deploy.

## 13. Explicit current status

- Repository investigation: COMPLETED as source/metadata inspection; browser visual QA remains outstanding.
- Both TXT prompts: READ IN FULL.
- External design research: RECORDED.
- Visual direction: proposed in the Field Atlas design document; the initial homepage composition and design tokens are now implemented, but visual browser QA remains outstanding.
- Application architecture: RECORDED IN THIS DOCUMENT.
- React Bits: seven selected components are copied and rendered in their assigned initial locations; runtime interaction and desktop/mobile testing remain outstanding. The remaining 18 are NOT STARTED. See [the exact 25-component tracker](./REACT-BITS-INTEGRATION-TRACKER.md).
- Supabase: selected by product plan; not connected in this repository.
- Route implementation: initial shared shell and route skeleton implemented; feature-specific page experiences and data integrations remain pending.
- UI redesign implementation: initial homepage and global shell implemented; all other page designs remain pending.
- Production build: GitHub Actions passed for application-code commit 4ec0edf0e9ab9881474f31886842b60f127fd04a (run 42876433018). Documentation-only commits followed; their latest CI run was still in progress at the time of this update.
- Desktop/mobile browser QA: NOT STARTED.
- Netlify deployment verification: NOT STARTED.

Do not report any unverified interaction, page, component or deployment as complete.
