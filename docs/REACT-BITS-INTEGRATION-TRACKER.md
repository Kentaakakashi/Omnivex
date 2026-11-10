# OMNIVEX — React Bits 25-Component Implementation Tracker

Date: 2026-11-10  
Branch: `field-atlas-redesign`  
Source of truth: the uploaded OMNIVEX Component Integration Specification.

## Status rules

- **NOT STARTED** — no implementation work has begun for that component.
- **RESEARCHED / SOURCE INSPECTED** — the official component page/source, props and implementation requirements have been reviewed. An opened documentation page without readable preview content does not count as visual preview verification.
- **INTEGRATED** — the official implementation is imported and rendered in its mandatory location.
- **FUNCTIONAL** — its defining interaction and the related application action have actually been tested.
- **VERIFIED** — the full acceptance test has passed, including location, routes/actions, relevant data, desktop and mobile behaviour.

Source files copied into the repository or a green production build do not independently qualify as FUNCTIONAL or VERIFIED.

## Current implementation snapshot

The first seven selected components have been copied from the official React Bits source and placed in the initial Field Atlas application shell/homepage. The latest fully verified build at the time this tracker was created is commit `59c1daa177948681cfeb80dc20056bbc2666a8dd`; a later change wiring the copy-link action into Swipe Toast is being built and must receive its own result before its build is marked successful.

The source repository tree and implementation were inspected for the seven copied components. The official React Bits documentation pages were opened, but the browser reader did not expose their live preview contents. A true visual comparison against the live previews and a rendered desktop/mobile browser test remain outstanding.

## Component tracker

| # | Component | Required placement | Official source | Research completed | Source inspected | Dependencies identified | Integrated in assigned page | Functional interaction tested | Data connected | Desktop verified | Mobile verified |
|---:|---|---|---|---|---|---|---|---|---|---|
| 01 | Pixel Blast | Homepage hero background | https://reactbits.dev/backgrounds/pixel-blast | PARTIAL — source/props inspected; live preview not readable | COPIED; React/WebGL2 implementation retained | React + WebGL2; no added package | YES — homepage hero | NOT VERIFIED — runtime/WebGL interaction pending | N/A — atmospheric background | NOT VERIFIED | NOT VERIFIED |
| 02 | Accordion Gallery | Homepage featured universes | https://reactbits.dev/components/accordion-gallery | PARTIAL — source/props inspected; live preview not readable | COPIED; small route callback added | GSAP (installed) | YES — featured universe gallery | NOT VERIFIED — hover/touch expansion and destination navigation need browser testing | SIX DEMO ITEMS; routes are scaffold destinations, not live universe data | NOT VERIFIED | NOT VERIFIED |
| 03 | Carousel | Homepage spotlight | https://reactbits.dev/components/carousel | PARTIAL — source/props inspected; live preview not readable | COPIED; original carousel interaction retained | Hugeicons React + Core Free Icons (installed) | YES — OMNIVEX Spotlight | NOT VERIFIED — drag/slide/CTA navigation need browser testing | THREE LABELLED SPOTLIGHT PREVIEWS; no backend catalogue | NOT VERIFIED | NOT VERIFIED |
| 04 | Laser Flow | Homepage featured matchup | https://reactbits.dev/animations/laser-flow | PARTIAL — source/props inspected; live preview not readable | COPIED; WebGL2 implementation retained | React + WebGL2; no added package | YES — featured matchup treatment | NOT VERIFIED — WebGL rendering/fallback needs browser testing | N/A — atmospheric visual effect | NOT VERIFIED | NOT VERIFIED |
| 05 | Drift Wall | Discover visual wall | https://reactbits.dev/components/drift-wall | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 06 | Chroma Grid | Character directory | https://reactbits.dev/components/chroma-grid | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 07 | Flowing Menu | Universe explorer | https://reactbits.dev/components/flowing-menu | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 08 | Infinite Menu | Character relationship explorer | https://reactbits.dev/components/infinite-menu | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 09 | Pill Nav | Global desktop navigation | https://reactbits.dev/components/pill-nav | PARTIAL — source/props inspected; live preview not readable | COPIED; React Router link adapter supplied | React; no added package | YES — desktop header | NOT VERIFIED — active state and route changes need browser testing | ROUTE LINKS; routes exist, destination feature data is pending | NOT VERIFIED | N/A — desktop assignment |
| 10 | Staggered Menu | Global mobile navigation | https://reactbits.dev/components/staggered-menu | PARTIAL — source/props inspected; live preview not readable | COPIED; small SPA navigation callback added | GSAP (installed) | YES — mobile header | NOT VERIFIED — open/close, focus, swipe-away and route callback need browser testing | ROUTE LINKS; routes exist, destination feature data is pending | N/A — mobile assignment | NOT VERIFIED |
| 11 | Line Sidebar | Character profile navigation | https://reactbits.dev/components/line-sidebar | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 12 | Dock | Character contextual actions | https://reactbits.dev/components/dock | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 13 | Stepper | Matchup creation workflow | https://reactbits.dev/components/stepper | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 14 | Option Wheel | Matchup condition selection | https://reactbits.dev/components/option-wheel | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 15 | Scroll Stack | Published matchup breakdown | https://reactbits.dev/components/scroll-stack | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 16 | Card Swap | Matchup evidence highlights | https://reactbits.dev/components/card-swap | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 17 | Folder | Character source vault | https://reactbits.dev/components/folder | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 18 | Folder Float | Personal research notebook | https://reactbits.dev/micro/folder-float?trigger=click | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 19 | Branched Menu | Evidence relationship navigator | https://reactbits.dev/micro/branched-menu | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 20 | Border Glow | Selected evidence highlights | https://reactbits.dev/components/border-glow | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 21 | Animated List | Rankings activity | https://reactbits.dev/components/animated-list | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 22 | Swipe Row | Saved library | https://reactbits.dev/micro/swipe-row | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 23 | Swipe Toast | Global notification and feedback system | https://reactbits.dev/micro/swipe-toast | PARTIAL — source/props inspected; live preview not readable | COPIED; connected to the ToastProvider and page-link copy action | Motion (existing), Hugeicons React + Core Free Icons (installed) | YES — global ToastProvider | NOT VERIFIED — clipboard feedback is wired; swipe/fuse/timer dismissal need browser testing | LOCAL ACTION FEEDBACK; no notification backend | NOT VERIFIED | NOT VERIFIED |
| 24 | Bell Toggle | Follow notifications | https://reactbits.dev/micro/bell-toggle | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |
| 25 | Pulse Heart | Community contribution reactions | https://reactbits.dev/micro/pulse-heart | NOT STARTED | UPSTREAM DIRECTORY LOCATED; file not yet researched/copied | NOT IDENTIFIED | NO | NO | NO | NOT VERIFIED | NOT VERIFIED |

## Shared dependencies added for the first integration slice

- `react-router@8.0.1` — URL-based routing.
- `gsap` — required by the selected Accordion Gallery and Staggered Menu originals.
- `@hugeicons/react` and `@hugeicons/core-free-icons` — required by Carousel and Swipe Toast.
- `motion` — already present in the application and used by Swipe Toast.

## Acceptance gate before marking any component VERIFIED

1. Official component implementation is present and rendered at the mandatory location.
2. Defining original appearance and behaviour are recognisable.
3. Component's actual interaction works.
4. Intended route/action works.
5. Correct application data is connected; demonstration fixtures are labelled.
6. Desktop behaviour has been tested where applicable.
7. Mobile/touch behaviour has been tested where applicable.
8. Console/runtime errors and conflicts with other components have been checked.
9. A production build passes for the commit being verified.

A source copy, successful compile, component name in code, or screenshot alone is not sufficient evidence of verification.
