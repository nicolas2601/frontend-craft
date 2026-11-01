# Interaction, accessibility and verification

Use this when implementing interactions or closing a frontend task. Apple HIG is native-platform guidance; WCAG is a web standard; Emil/UI Skills provide interpreted craft advice. Keep those categories separate. Primary links are in [sources](sources.md).

## Contents

1. Fluidity without an Apple skin
2. Accessibility gates
3. Mobile/platform behavior
4. Rendering and performance
5. State and flow matrix
6. Evidence and stopping

## 1. Fluidity without an Apple skin

Transfer these principles, not a compulsory glass aesthetic:

- **Immediate feedback:** acknowledge pressing before release, but commit actions using appropriate activation semantics. Do not fire destructive operations on pointer-down.
- **Direct manipulation:** an object follows the user's input while being dragged; respect grab offset and scroll intent.
- **Continuity:** relate the transition to its origin and preserve context.
- **Interruptibility:** a new input can redirect an ongoing transition without a jump or wait.
- **Momentum:** use velocity where the gesture calls for it; no universal flick threshold fits every control.
- **Restraint:** frequent task actions should not require waiting through decoration.

Use springs when velocity-aware retargeting is useful. Use CSS/native platform behavior for simple feedback. CSS transitions can retarget; they are not universally “non-interruptible.” A fixed keyframe sequence does not automatically preserve gesture velocity. Check the actual library/implementation.

Animation times are starting heuristics, not standards: small press feedback often works around 100–160 ms; short menus around 150–250 ms. Large transitions may need more time, but must not block input. Judge the complete interaction, frequency and reduced-motion alternative.

Use a small motion vocabulary by role (press, select, expand, dismiss), not unrelated numbers on every component. Before an effect, name its purpose and frequency. Repeated task actions need immediate response; a rare product explanation can have a longer authored sequence. Neither a universal 300 ms cap nor a quota of moving elements decides quality.

Treat frequency as evidence about interruption and patience, not a numerical pass/fail rule. A keyboard action should respond immediately, but its focus movement, selection change, or short continuity cue is not automatically forbidden; remove/reduce motion when it delays or obscures the user's next task. Do not animate information-dense data just to decorate it; animate a real value change only when the movement helps users understand that change. Choose the simplest suitable mechanism, then verify its behavior in the actual component and context.

Use origin-aware popovers; centered modals are not anchored popovers. Preserve exit direction when it communicates the same spatial relationship. Do not apply spring bounce to every menu or business-table update.

Reduced motion may mean an instant state change or a short crossfade. Even opacity changes can be inappropriate in some contexts; do not interpret “reduced motion” as permission for all animation. Keep necessary status feedback available.

## 2. Accessibility gates

### Contrast and targets

- WCAG 2.2 **1.4.3 AA**: generally **4.5:1** for normal text, **3:1** for large text, subject to the criterion's stated exceptions.
- “Large” is approximately **24 CSS px regular** or **18.67 CSS px bold** (18 pt/14 pt at 96 CSS px per inch). A blanket “18 px / weight 600” rule is not the WCAG definition.
- **1.4.11 AA**: relevant UI components/states and meaningful graphical objects generally require **3:1** against adjacent colors, with exceptions. Do not assume every decorative border needs it, or that any filled input automatically qualifies as an exception.
- **2.5.8 AA**: pointer targets are generally **24 × 24 CSS px**, with spacing and other exceptions. Read the criterion before approving exceptions.
- **2.5.5 AAA**: **44 × 44 CSS px**, with exceptions. A larger comfortable touch area is often a sensible product default, not the same requirement as AA.
- Apple's commonly cited **44 × 44 pt** native touch guideline is not a CSS-pixel standard. Check the current platform/control guidance; do not equate units.

Contrast cannot be rounded up to pass. A color contrast calculator does not establish overall WCAG conformance. User approval of a brand exception does not turn a failed criterion into a pass.

### Semantics, focus and control

- Use native buttons/links/inputs before ARIA workarounds. Prefer a vetted primitive for composite controls.
- Give controls accessible names; keep visible labels for forms. Hide decorative icons from assistive technologies.
- Preserve keyboard access, logical focus order and visible focus. Never use positive tabindex to repair a broken layout order.
- For a true modal: provide an accessible name, appropriate modal semantics, initial focus, containment, a closing mechanism and focus restoration. Do not trap focus in ordinary nonmodal content.
- Keep focused controls visible, including under sticky bars and at zoom. Check WCAG 2.4.11 rather than relying only on a pretty ring.
- Associate help/errors with their input; use `aria-invalid` when applicable. Announce meaningful asynchronous status without announcing every animation frame.
- Do not block paste or password managers. Avoid overusing `role=alert`; routine loading text usually does not warrant an interrupting alert.
- Restore input and explain recoverable failure. Never claim “nothing was lost” unless the implementation actually preserves it.

### Scale and alternative input

Test text resizing at 200%, and reflow at an equivalent 320 CSS px wide where the criterion applies. Some inherently two-dimensional content has exceptions; that does not exempt the whole app shell.

Check touch, mouse and keyboard as overlapping capabilities, not mutually exclusive devices. Provide non-drag alternatives for required dragging actions when applicable. Do not hide essential actions behind hover.

## 3. Mobile/platform behavior

- Use viewport units intentionally: dynamic viewport height for an app that follows browser chrome, small viewport height for a stable hero where appropriate. `100dvh` does not magically solve every software-keyboard behavior.
- Preserve browser zoom. Avoid `user-scalable=no` and `maximum-scale=1`.
- Use readable input sizes; 16 px is a practical iOS input-zoom heuristic, not a universal accessibility certification.
- Apply safe-area padding to the relevant fixed/sticky controls when using edge-to-edge layout. Check portrait and landscape.
- Gate hover treatment by capability. A coarse pointer still needs immediate press feedback.
- Keep content selectable. Do not place `user-select:none` on all body text or disable native link menus indiscriminately.
- Use scroll snap/native scrolling when it solves the carousel. Scope `touch-action` and overscroll behavior to the actual interaction; do not globally disable useful document scrolling/pull-to-refresh out of habit.
- Keep the software keyboard from covering inputs/actions. Test on target browser/OS versions; emulator behavior is incomplete evidence.
- An installed PWA needs manifest, navigation/offline/update/cache correctness separately from visual polish. A PWA does not gain every native API.
- If theme switching is in scope, resolve a saved “system” choice against the current OS preference before first paint. Check imagery, SVG, native inputs/autofill, focus and third-party surfaces as well as token colors. Do not add dark mode merely to demonstrate completeness.

Record the physical device/browser if tested. Otherwise say **desktop/mobile emulation only**; do not claim native feel on real hardware.

## 4. Rendering and performance

Prefer transform and opacity for animations because they often avoid layout work. But compositing depends on browser, content and implementation. “Uses transform” does not prove GPU acceleration, 60/120 fps, low power consumption or smoothness under load.

Investigate observed cost:

1. Reproduce the actual slow interaction on an appropriate build/device.
2. Inspect main-thread work, layout/paint/compositing and network/data waterfalls.
3. Check expensive blur, large raster layers, offscreen loops, excessive rerenders and synchronous measurement.
4. Change the smallest demonstrated cause, then remeasure the same interaction.

Keep expensive loops paused offscreen and when the document is hidden. Scope `will-change` to a demonstrated need and remove it when appropriate; it is not a universal performance switch.

Do not animate blur radius over a full-screen background by default. A hidden element with opacity zero can still incur rendering cost; visibility/unmount strategies have different focus/state/performance consequences. Measure before generalizing an optimization from one app.

For scroll storytelling, preserve ordinary scrolling/navigation, offer reduced/static motion, keep content reachable with keyboard and avoid loading an unnecessary animation stack into operational routes. Read the current scroll-world instructions before using it.

Assess bundles, fonts, image dimensions/loading, layout stability and route/data boundaries. A build chunk warning is not a measured user-visible slowdown, but it is a legitimate item to investigate.

Use real browser traces/field metrics when making performance claims. A screenshot cannot validate motion quality, input latency or Core Web Vitals.

## 5. State and flow matrix

Choose relevant cells; mark inapplicable cells with a reason instead of fabricating universal coverage.

| Surface | Ready | Loading | Empty | Error/retry | Permission | Long/missing content | Input/keyboard |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Form | Editable | Pending without duplicate submit | Optional/default state | Field + submission error | Explain access | Long values; retained edits | Labels; paste; focus; correct keyboard |
| List/table | Scannable data | Stable structure | Useful next action | Retry without false totals | Honest restrictions | Zero vs unknown; large totals | Selection vs navigation semantics |
| Detail/dialog | Context + next action | Relevant placeholder | Missing sections explained | Recover/close safely | No leaked private data | Long headings/content | Initial/contained/restored focus if modal |
| Chart | Units/date/scale | Honest pending state | Missing not zero | Recoverable failure | Authorized data only | Large/negative/null values | Accessible text/table equivalent |

A synthetic response can validate UI behavior. It does not prove persistence, server authorization, concurrency handling or a live AI provider.

### Interaction contract and representative states

For the primary/signature interaction, keep this contract beside its design reasoning:

`trigger → immediate feedback → pending (if real) → confirmed result → exit/reverse`

Name who owns the state, what persists, what a second input/Escape/navigation does mid-transition, and how failure preserves or recovers the user's work. Canceling an edit, aborting a request and undoing a committed result are different behaviors. Do not claim that Escape cancels remote work unless it does.

Exercise only reachable states using realistic fixtures at the component's actual data boundary. Include selected/unselected and appropriate long/narrow/empty/pending/error cases; do not invent a backend, spinner or permissions model to fill a checklist. Inspect the transition's start, meaningful intermediate frame and settled result, then reverse or change selection before it settles. Verify the reduced-motion path separately. A final screenshot cannot prove continuity or interruption.

## 6. Evidence and stopping

Record what ran with enough detail to reproduce:

```text
Source revision / changed files:
Tool/runtime versions relevant to the check:
Command → exit status → actual counts/failure:
Route + viewport + data mode + media preferences:
Interaction → expected result → observed result:
Screenshot path + what was visually inspected:
Hardware / assistive-technology checks actually performed:
Known limits and next step:
```

If tests time out under parallel load, isolate the failing case and rerun under an explicit bounded worker count. Report the original failure and the changed execution conditions; do not silently call it a product fix or a proven root cause.

Close after checks appropriate to the change and a targeted rendered pass. Do not add endless redesign/review loops. For UI diffs use a Before/After/Why table when it improves understanding; do not invent before screenshots.
