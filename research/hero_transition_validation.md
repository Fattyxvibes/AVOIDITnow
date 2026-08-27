# Hero Transition Validation

Date: 2026-08-23

The Avoidit hero retains its existing layout, copy, colors, lightweight video, glass protocol panel, and sound control. The only enhancement is the supplied reference-style entrance sequence: the headline rises in at 300 ms, supporting copy at 500 ms, product search at 700 ms, and the existing video-backed protocol panel scales in at 900 ms.

The motion uses the reference easing `cubic-bezier(0.16, 1, 0.3, 1)` with transform and opacity only. A `prefers-reduced-motion` gate leaves all hero content fully visible without animation for visitors who request reduced motion. Desktop and mobile screenshots confirmed the unchanged final composition and content hierarchy.
