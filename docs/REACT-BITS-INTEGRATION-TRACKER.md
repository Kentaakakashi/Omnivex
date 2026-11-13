# OMNIVEX — React Bits Placement Tracker

Updated: 2026-11-13
Repository branch: main
Official source repository: https://github.com/DavidHDev/react-bits

## Current decision

The component-first integration pass has been paused. The frontend is being rebuilt around the product's actual features and page hierarchy first. The copied React Bits source files remain in the repository, but the active router now renders feature-first React pages and does not rely on these components.

Do not force a component into a page just to mark it integrated. Once the feature flows are stable, review each component against the page's real information hierarchy, interaction needs, accessibility and mobile behaviour. A component may be moved, redesigned, used on a different surface or omitted entirely.

## Status definitions

- COPIED / RETAINED — source implementation exists in the repository.
- PLACEMENT DEFERRED — not currently mounted in the active feature-first pages.
- REVIEW REQUIRED — decide whether the component actually improves the intended feature.
- FUNCTIONAL / VERIFIED — only mark after browser interaction, desktop/mobile layout and runtime checks pass.

## Placement queue

| # | Component | Original idea | Current status | Revisit after |
|---:|---|---|---|---|
| 01 | Pixel Blast | Homepage atmosphere | COPIED / PLACEMENT DEFERRED | Home visual QA |
| 02 | Accordion Gallery | Universe showcase | COPIED / PLACEMENT DEFERRED | Explore/universe hub UX |
| 03 | Carousel | Editorial spotlight | COPIED / PLACEMENT DEFERRED | Discovery content model |
| 04 | Laser Flow | Matchup spotlight | COPIED / PLACEMENT DEFERRED | Matchup overview design |
| 05 | Drift Wall | Explore surface | COPIED / PLACEMENT DEFERRED | Explore page content hierarchy |
| 06 | Chroma Grid | Entity directory | COPIED / PLACEMENT DEFERRED | Entity-card data and media rules |
| 07 | Flowing Menu | Universe explorer | COPIED / PLACEMENT DEFERRED | Universe hub UX |
| 08 | Infinite Menu | Related entity navigation | COPIED / PLACEMENT DEFERRED | Dossier relationships |
| 09 | Pill Nav | Desktop primary navigation | COPIED / PLACEMENT DEFERRED | Navigation usability review |
| 10 | Staggered Menu | Mobile primary navigation | COPIED / PLACEMENT DEFERRED | Mobile navigation QA |
| 11 | Line Sidebar | Dossier section navigation | COPIED / PLACEMENT DEFERRED | Entity dossier content length |
| 12 | Dock | Dossier contextual actions | COPIED / PLACEMENT DEFERRED | Dossier action priorities |
| 13 | Stepper | Matchup creation | COPIED / PLACEMENT DEFERRED | Matchup configuration usability |
| 14 | Option Wheel | Matchup ruleset selection | COPIED / PLACEMENT DEFERRED | Ruleset control accessibility |
| 15 | Scroll Stack | Matchup report | COPIED / PLACEMENT DEFERRED | Battle report information architecture |
| 16 | Card Swap | Evidence highlights | COPIED / PLACEMENT DEFERRED | Evidence report hierarchy |
| 17 | Folder | Source vault | COPIED / PLACEMENT DEFERRED | Source library design |
| 18 | Folder Float | Private research notebook | COPIED / PLACEMENT DEFERRED | Note editor UX |
| 19 | Branched Menu | Evidence relationships | COPIED / PLACEMENT DEFERRED | Evidence graph model |
| 20 | Border Glow | Evidence emphasis | COPIED / PLACEMENT DEFERRED | Research detail hierarchy |
| 21 | Animated List | Rankings | COPIED / PLACEMENT DEFERRED | Ranking comparison UX |
| 22 | Swipe Row | Saved library | COPIED / PLACEMENT DEFERRED | Library interaction testing |
| 23 | Swipe Toast | Global feedback | COPIED / PLACEMENT DEFERRED | Toast accessibility and device QA |
| 24 | Bell Toggle | Follow notifications | COPIED / PLACEMENT DEFERRED | Follow/notification model |
| 25 | Pulse Heart | Community reactions | COPIED / PLACEMENT DEFERRED | Debate interaction model |

## Acceptance checklist before reintroducing a component

- The underlying feature is already implemented and uses real data.
- The component improves the task rather than obscuring it.
- Loading, empty, error, permission and success states are defined.
- Keyboard, touch, focus and reduced-motion behaviour are acceptable.
- Small-screen layout is tested.
- Its interaction is connected to the intended feature action.
- The component's source and applicable license notices remain preserved.

Copied source, successful compilation or an attractive screenshot does not establish integration or functional verification.
