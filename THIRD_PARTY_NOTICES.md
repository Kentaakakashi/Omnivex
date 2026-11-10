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

The frontend uses React, React Router, Motion, GSAP, Lucide React, Hugeicons, Radix UI Dialog, Radix UI Tabs and cmdk as runtime dependencies. Their licenses and notices remain with their respective packages in the npm dependency tree.

- React: https://github.com/facebook/react
- Motion: https://github.com/motiondivision/motion
- Lucide: https://github.com/lucide-icons/lucide
- Radix UI: https://github.com/radix-ui/primitives
- cmdk: https://github.com/pacocoursey/cmdk
- GSAP: https://gsap.com/
- Hugeicons: https://github.com/hugeicons/hugeicons
- React Router: https://reactrouter.com/

The official React Bits components listed above are copied into the redesign branch for use as part of the OMNIVEX website. Staggered Menu and Accordion Gallery have small application-navigation callbacks added; their defining interactions and presentation are preserved.


## React Bits

The following official React Bits source components are integrated in the redesign branch:

- Pixel Blast — https://reactbits.dev/backgrounds/pixel-blast
- Accordion Gallery — https://reactbits.dev/components/accordion-gallery
- Carousel — https://reactbits.dev/components/carousel
- Laser Flow — https://reactbits.dev/animations/laser-flow
- Pill Nav — https://reactbits.dev/components/pill-nav
- Staggered Menu — https://reactbits.dev/components/staggered-menu
- Swipe Toast — https://reactbits.dev/micro/swipe-toast

Source repository: https://github.com/DavidHDev/react-bits
Copyright (c) 2026 David Haz
License: MIT + Commons Clause License Condition v1.0. The source license is preserved in licenses/REACT_BITS_LICENSE.md. React Bits source may be used as part of the OMNIVEX application/product; the components themselves must not be sold, sublicensed or redistributed on their own, in a bundle, or as a ported version. A small application-integration callback was added to Staggered Menu so its original animated menu can navigate through OMNIVEX routes; its underlying animated implementation and appearance remain the React Bits component.

## Added runtime dependencies

- GSAP: https://gsap.com/ (used by Staggered Menu)
- Hugeicons React: https://github.com/hugeicons/hugeicons-react (used by Swipe Toast)
- Hugeicons Core Free Icons: https://github.com/hugeicons/hugeicons (used by Swipe Toast)
- React Router: https://reactrouter.com/ (client-side route foundation)
