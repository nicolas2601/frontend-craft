# Polish, mobile-native fixes, design plan and WCAG audit

Distilled from four UI Skills guides retrieved with `get_skill` on 2026-11-05 and read in full: `anthropics/frontend-design`, `jakubkrehel/better-ui` (companion files `surfaces.md`, `animations.md`, `enter-exit.md`, `icon-transitions.md`, `icons.md`, `performance.md` not read), `wshobson/wcag-audit-patterns` (its `references/details.md` not read) and `emilkowalski/mobile-native`. Use after the interaction works and the direction is chosen; a polish finding never outranks a broken interaction. The Noel playbook stays the authority where values differ (it presses at `scale(.97)` and staggers lists 30-80 ms). Exact values below are defaults for the unguided case; a deliberate project convention (for example a no-shadow style) is a preference, not a finding, but the same detail done two ways in one project is a finding.

## 1. Design plan before code (anthropics/frontend-design)

1. If the brief does not name the subject, audience and primary job, propose one concrete version of each and state it as an assumption.
2. Write a compact plan: 4-6 named hex colors; typefaces and their roles (one family or two clearly distinct); a layout concept in one sentence plus an ASCII wireframe, with alignment stated; 2-3 principles that make this page unique.
3. Review the plan against the brief. If a part is what you would produce for any similar page, revise it and say what changed and why. Only then write code.
4. Spend boldness in one place: one memorable element, everything around it quiet. Remove one accessory before shipping.

Generated-default tells (legitimate only when the brief asks for them): warm cream background with a high-contrast serif and a terracotta accent; near-black with one acid-green or vermilion accent; broadsheet layout with hairlines and zero radius; identical rounded cards with the same soft grey shadow and gradient washes; template chrome such as an all-caps tracked eyebrow above every heading, `A · B · C` meta strings, `WORD - fragment` labels, `->` appended to links, monospace for every small label. Typographic tells: accenting one word of a headline, all-caps labels, labels above content that add nothing. Numbered markers (01/02/03) only when the content really is a sequence. Motion: one orchestrated page-load moment beats fade-and-slide on every section and hover motion on every card; motion that answers a person's action is welcome. Line length under about 80 characters; serif body gets slightly more line height.

Copy is design: write from the user's side in plain words; a button says what happens ("Save changes", not "Submit") and the same action keeps its name through the flow (Publish -> "Published"); errors say what went wrong and how to fix it without apologizing; an empty screen invites one action; sentence case, active voice, one job per element.

## 2. Exact-value polish (jakubkrehel/better-ui)

- Nested surfaces with an even inset: outer radius = inner radius + padding + border. Past about 24 px padding or asymmetric padding, treat them as separate surfaces.
- Optical alignment: nudge by eye, for example 2 px less padding on the icon side of a button, a play triangle shifted toward its point.
- Shadows for elevation, borders for structure (dividers, table cells, inputs, selected state). Keep `border: 1px solid transparent` under a shadow ring so forced-colors mode still draws an edge.
- Content images get a 1 px inset outline in pure black or white at 10 percent (`oklch(0 0 0 / .1)` light, `oklch(1 0 0 / .1)` dark), never a tinted neutral or the accent; skip transparent artwork.
- Interactive state uses transitions or springs (they retarget on reversal), not keyframes; keyframes only for sequences that run once.
- Press feedback: scale about 0.96-0.97 over about 150 ms, ease-out; a disabled control never scales; provide an opt-out.
- High-frequency actions (keystrokes, row hover, tab switch) respond instantly or within 150 ms on opacity or background-color. Expressive motion is for rare moments. Every animated state change also leaves a static cue (color, icon or label).
- Reduced motion: run movement, scale and blur only under `prefers-reduced-motion: no-preference`; under reduce, cross-fade opacity instead of removing the element.
- Staged entrance of semantic chunks (title, description, actions): 100 ms apart, each opacity + 4 px blur + 12 px translateY over about 300 ms ease-out. Never stagger routine interactions. Exit: opacity + 4 px blur + -12 px over about 150 ms, shorter and smaller than the enter; slide fully out only when the destination carries meaning.
- `initial={false}` on an `AnimatePresence` that wraps a state swap so the default state does not animate on mount; not around an intentional entrance.
- Icon swap on a rare state change (play/pause, copy/copied): scale 0.25 -> 1, opacity 0 -> 1, blur 4 -> 0 px; spring `bounce: 0`, about 300 ms.
- Suppress all transitions during a theme switch (disable, force a style flush, restore next frame).
- `transition` names the exact properties, never `all`; add `will-change` only after seeing first-frame stutter and name the property.
- Hover styling only inside `@media (hover: hover)`; set `-webkit-tap-highlight-color: transparent` where you draw your own pressed state.
- Scrollable dialogs, drawers, menus and side panels: `overscroll-behavior: contain`.
- Icon stroke tracks adjacent text weight (about 1.5 px at 400 to 2.5 px at 700); one icon library per surface; icons use `currentColor`, outline by default and fill for the active state; mirror only direction-dependent icons under `dir="rtl"`.
- Severity: HIGH = broken interaction (keyframe toggle that cannot reverse, hover stuck on touch, motion ignoring reduced motion, state carried by motion alone); MEDIUM = visible inconsistency; LOW = isolated polish. End with Block if any HIGH remains, else Approve, and list every check not run as Not verified.

## 3. Mobile-native fixes (emilkowalski/mobile-native)

Apply a fix where its reason applies, not as a global habit. Use media queries and capabilities, never user-agent sniffing; touch and mouse coexist.

| Symptom | Fix | Why |
| --- | --- | --- |
| Hover stuck after tap | `@media (hover: hover) and (pointer: fine)` around every `:hover`; give touch press feedback through `:active` | Touch fakes hover until the next tap elsewhere |
| Gray flash on tap | `html { -webkit-tap-highlight-color: transparent }` and give every tappable its own `:active` state | The flash fights your feedback |
| Wrong height | app shell `100dvh`; hero `min-height: 100svh`; avoid `100vh` | `vh` is the largest viewport with chrome collapsed |
| Page zooms into an input | inputs `font-size: 16px` (or `@media (pointer: coarse)`); never `user-scalable=no` or `maximum-scale=1` | iOS zooms under 16 px; disabling zoom is an a11y failure |
| Laggy tap | `touch-action: manipulation` on controls; style `:active` or use `pointerdown`, not only `click` | Click delay and feedback on release |
| Pull-to-refresh hijacks scroll | `overscroll-behavior: none` on `html, body`; `contain` on inner scrollers; no `touchmove` + `preventDefault` | Passive listeners and native physics |
| Content under the notch | `viewport-fit=cover` plus `env(safe-area-inset-*)` padding on fixed headers, bottom bars, toasts, sheets (with `0px` fallback in calc) | Without the meta tag the insets are 0 |
| Long-press selects button text | `user-select: none`, `-webkit-user-select: none`, `-webkit-touch-callout: none` on controls only, never `body` | Content must stay selectable |
| Carousel scrolls the wrong way | `touch-action: pan-y` on horizontal carousels; `none` only on surfaces that own every axis; prefer `scroll-snap` for native scroll | Values name what the browser may still do |
| Status bar color mismatch | one `theme-color` per `prefers-color-scheme` matching the top of the page, plus `color-scheme` | One value fits only one scheme |
| Keyboard resize | `interactive-widget=resizes-content` in the viewport meta | Android keyboard shrinks the layout viewport |
| Right in Chrome, wrong on phone | test on a real phone (LAN IP, Safari Web Inspector or `chrome://inspect`), older device, keyboard open, landscape, installed PWA if targeted | Emulation cannot reproduce these |

Input keyboards: `inputmode="numeric"` or `"decimal"`, `type="email"`/`"tel"`, `autocapitalize="none"` and `autocorrect="off"` on usernames and codes, `enterkeyhint` that names the action. If you cannot test on hardware, say which fixes were verified from code and which need a phone.

## 4. WCAG 2.2 audit workflow (wshobson/wcag-audit-patterns)

1. Run automated scans (axe, Lighthouse) for the first pass; they find roughly 30-50 percent of issues. 2. Do manual checks: keyboard path, focus order, screen-reader flow, 200 percent zoom, reduced motion. 3. Map each issue to a WCAG criterion, severity and remediation. 4. Re-test after fixes and document residual risk. Never claim legal compliance (ADA, Section 508, VPAT) without expert review; keep the test steps as evidence.

Impact order: Critical (alt on functional images, keyboard access, form labels, autoplay media without controls); Serious (contrast, skip links, inaccessible custom widgets, page titles); Moderate (`lang`, unclear link text, landmarks, heading hierarchy). Principles: perceivable, operable, understandable, robust. Native HTML before ARIA; never hide focus outlines; never disable zoom; never color alone. Start in design, not after build.
