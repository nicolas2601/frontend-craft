# Ship gate: review, fix order and verdict

Use this at step 7-8 of the [operating card](operating-card.md), or whenever you review, polish or call something done. It is a set of checks, not a score: every rule here names the thing you must look at. A rule you did not check is reported as unverified. Mechanisms were taken from the UI Skills guides listed in [skills and installation](skills-and-installation.md#ui-skills-round-3-2026-11-05); the Noel playbook (sections 11, 13, 19) stays the authority when they disagree.

## 1. Auto-blockers: any one means NOT done

1. A control with no accessible name.
2. A keyboard-reachable control with no visible focus.
3. A path that works by pointer but not by keyboard.
4. Motion that ignores `prefers-reduced-motion`.
5. Content or control clipped, overlapped or unreachable at 320 px width or 200 percent zoom.
6. Text below its contrast ratio (4.5:1 text, 3:1 large text, controls, focus).
7. A state carried by color alone, or by motion alone.
8. A destructive action with no confirmation, undo or distinct treatment.
9. A truncated value with no way to read it in full.
10. Content reachable only past a hidden scroll edge.
11. An error with no recovery path, or a form that loses what was typed.
12. A semantic color used against its meaning (red for success).
13. Fake data, fake loading or fake success presented as real.

## 2. Findings have a shape

Each finding: **criterion** (which rule), **locator** (role + accessible name, or `file:line`), **width or state** where it shows, **evidence** (measured value, quote or screenshot path), **exact fix** (a value, not "increase spacing"). One root cause is one finding listing every location. A finding that rests only on taste goes to a "left out" list, not to the findings. Cap about 15 findings; if you cap, list all blockers first and say how many were cut. Runtime claims need a render; source alone cannot prove a visual finding. Write your design review before reading automated scan output so the scan does not anchor you.

Severity: **critical** = an auto-blocker above; **major** = hurts hierarchy, readability, usability or consistency; **minor** = polish. Tie-break: would a user contact support about it? Then at least major.

## 3. Fix order and the cheapest fix

Classify each drift before fixing: missing token; one-off implementation (replace with the shared component); conceptual mismatch (flow or hierarchy differs from sibling screens); local defect. Fix at the narrowest correct level. Then fix in this order:

1. Broken or blocked paths, data loss, misleading state, inaccessible controls.
2. Missing loading, empty, error, success, disabled and permission states (an empty state gives exactly one next action).
3. Flow, hierarchy, responsive and system drift.
4. Visual and motion.
5. Cleanup: churn, orphaned code, unused variants, temporary files.

Cheapest fix that works, in order: delete it; use the native element; reuse an existing token or component; correct the wrong value; add a new token or wrapper last. Before a new shared component or variant, stop at the first step that fits: reuse as is; compose existing parts; add one property for a real recurring difference; change a shared contract only if use is blocked; add a new pattern only if the responsibility differs. Visual similarity alone is not a reason to share. Clear and safe fixes (contrast, focus, reduced motion, semantic tags, alt text) are applied; restructuring and subjective changes are proposed and confirmed first.

## 4. Structure and type checks

- **Squint test:** blur the render and name, in order, the primary element, the secondary element and the major groups. If you cannot, fix structure before moving boxes.
- **Ablation test:** remove every non-text device (images, icons, effects). The page must still read as this product. If it could take another brand name unchanged, the direction is generic.
- **Subject inventory:** list 8-12 things that belong only to this client (meaning of the name, place, numbers in the brief, constraints, materials, rituals and hours, printed artifacts such as ticket, label, menu, sign). Use them as content and form.
- **Headlines:** every headline and the first-screen main line fits in two lines or fewer at 390, 768, 1280 and 1440. Cut words before shrinking type. An intro set large is a paragraph of about 25 words or fewer.
- **Rhythm:** gaps between sections are clearly larger than gaps inside a section; two or three sizes carry the visible hierarchy; hierarchy comes from weight, size and opacity steps of one color before a second hue.
- **Decision points:** count visible options at any choice. 4 or fewer is fine, 5-7 group or disclose, 8 or more is overload.
- **Persona walk:** run the main action as an impatient expert, a first-timer, a keyboard or screen-reader user and a one-handed phone user; name the exact element that fails each.
- **Type details:** curly quotes, a single ellipsis character, non-breaking space between a number and its unit, `tabular-nums` in numeric columns, `text-wrap: balance` on headings and `pretty` on body.
- **DOM order equals visual order** at every width, including after reordering on narrow screens.

## 5. Grep the source before you finish

`img` without `alt`; `div`/`span` with `onClick` and no role and key handler; `a` without `href`; `outline: none` with no replacement; `tabindex` above 0; skipped heading levels; icon-only button without `aria-label`; `input` without a label; `transition: all`; `ease-in` on entrances; `100vh`; hard-coded hex where a token exists; stray `console.log`; remote URLs when the deliverable must work offline. Read the code, not only the preview.

## 6. Interaction contract (consequential actions)

Write six lines: trigger; immediate feedback and pending state; confirmed result; what cancel, Escape, navigation or a second submit does; what survives a failure and how to recover; which value is authoritative and when it commits. Ignore any response that arrives after a newer request for the same thing. Optimistic UI needs a failure and reconcile path; do not promise remote cancellation or success.

## 7. Defaults that keep weak models safe

Hover and press feedback finish within about 200 ms by default (menus and selects up to about 240 ms); a longer duration needs a stated reason. No gradient unless the brief or `DESIGN.md` asks for one. These are defaults for the unguided case, not laws: a deliberate brief wins.

## 8. Verdict

Start the report with **Ship: no** if any blocker or unverified trigger remains, **yes, with fixes** if only should-fix items remain, **yes** if only notes remain. Then a **Coverage** line: widths opened, states probed, tools run, and what was NOT measured. Do not click or submit anything that writes shared data during a review. Do not adopt review tools that send telemetry or upload artifacts to a third party.
