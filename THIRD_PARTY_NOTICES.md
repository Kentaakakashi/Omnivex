# Third-party notices

## Magic UI

The small reusable UI primitives in `src/components/magicui/` are adapted from or inspired by Magic UI components, including Marquee, Number Ticker, Magic Card, Animated List, Border Beam and Shimmer Button.

Source: https://github.com/magicuidesign/magicui  
License: MIT

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Runtime dependencies

The frontend uses React, React Router, Motion, GSAP, Lucide React, Hugeicons, Matter.js, Radix UI Dialog, Radix UI Tabs and cmdk as runtime dependencies. Their individual licenses remain with their respective npm packages.

- React: https://github.com/facebook/react
- Motion: https://github.com/motiondivision/motion
- Lucide: https://github.com/lucide-icons/lucide
- Radix UI: https://github.com/radix-ui/primitives
- cmdk: https://github.com/pacocoursey/cmdk
- GSAP: https://gsap.com/
- Hugeicons: https://github.com/hugeicons/hugeicons
- Matter.js: https://github.com/liabru/matter-js
- React Router: https://reactrouter.com/
- Supabase JS: https://github.com/supabase/supabase-js

## React Bits

The following official React Bits source components are integrated in OMNIVEX:

- Pixel Blast — https://reactbits.dev/backgrounds/pixel-blast
- Accordion Gallery — https://reactbits.dev/components/accordion-gallery
- Carousel — https://reactbits.dev/components/carousel
- Laser Flow — https://reactbits.dev/animations/laser-flow
- Drift Wall — https://reactbits.dev/components/drift-wall
- Chroma Grid — https://reactbits.dev/components/chroma-grid
- Flowing Menu — https://reactbits.dev/components/flowing-menu
- Infinite Menu — https://reactbits.dev/components/infinite-menu
- Pill Nav — https://reactbits.dev/components/pill-nav
- Staggered Menu — https://reactbits.dev/components/staggered-menu
- Line Sidebar — https://reactbits.dev/components/line-sidebar
- Dock — https://reactbits.dev/components/dock
- Stepper — https://reactbits.dev/components/stepper
- Option Wheel — https://reactbits.dev/components/option-wheel
- Scroll Stack — https://reactbits.dev/components/scroll-stack
- Card Swap — https://reactbits.dev/components/card-swap
- Folder — https://reactbits.dev/components/folder
- Folder Float — https://reactbits.dev/micro/folder-float?trigger=click
- Branched Menu — https://reactbits.dev/micro/branched-menu
- Border Glow — https://reactbits.dev/components/border-glow
- Animated List — https://reactbits.dev/components/animated-list
- Swipe Row — https://reactbits.dev/micro/swipe-row
- Swipe Toast — https://reactbits.dev/micro/swipe-toast
- Bell Toggle — https://reactbits.dev/micro/bell-toggle
- Pulse Heart — https://reactbits.dev/micro/pulse-heart

Source repository: https://github.com/DavidHDev/react-bits  
Copyright (c) 2026 David Haz  
License: MIT + Commons Clause License Condition v1.0. The complete upstream license is preserved in `licenses/REACT_BITS_LICENSE.md`. React Bits components may be used as part of the OMNIVEX application/product; the component source itself must not be sold, sublicensed or redistributed standalone, as a bundle, or as a ported version. Small application integration changes are identified in the component tracker.

## Added integration dependencies

- GSAP: required by selected animated menu/gallery components.
- Motion for React: required by micro-interaction components.
- Hugeicons React + Core Free Icons: used by the original component icon implementations.
- Matter.js 0.20.0: required by Folder Float.
