# Design decisions that compound

Use this as implementation detail under the primary [Product craft foundation](product-craft-foundation.md). Preserve approved incumbent decisions for refinements. These are design heuristics unless a linked standard says otherwise.

## Contents

1. Product and flow
2. Reference analysis
3. Brand and visual thesis
4. Typography
5. Color and materials
6. Layout and composition
7. Component contracts
8. How to critique

## 1. Product and flow

A screen is a decision point in a task, not a collection of attractive cards.

Write the shortest useful flow:

`entry/context → understand → act → pending → result → recover/continue`

For each step identify actor, permission, available data, irreversible effects and where the user goes next. Distinguish selection, navigation, progress and completion; they must not look interchangeable.

Choose the surface's mode:

| Mode | Success | Expression belongs in | Common mistake |
| --- | --- | --- | --- |
| Operate | Task completed correctly | Consistent controls, information hierarchy, a few signature details | Turning a daily tool into a cinematic landing page |
| Read | Content understood | Type, rhythm, navigation and examples | Giant display type and scroll effects interrupting reading |
| Persuade | Informed decision and next action | Story, composition, useful imagery and differentiated voice | Unsupported claims and three generic feature cards |
| Experience | Work explored meaningfully | Spatial/visual storytelling when accessible | Effects hiding the actual work |

Use actual domain language. A primary action should say what happens, not just “Continue” when the consequence is unclear. Place controls near what they affect.

Compose from what the visitor scans, compares, chooses or edits. Identify essential, optional, derived and unavailable content before choosing equal cards, a table or a timeline. Test the same proposal with a typical record and an uneven/long/missing-value record. If content no longer fits, decide whether the content model or its presentation is wrong; do not conceal the mismatch with clipped text and uniformly perfect fixtures.

## 2. Reference analysis

Collect a small reference set with these fields:

```text
Source + access date + capture date if known:
Mode and intended audience:
Transfer: one structural/interaction/identity principle:
Mechanism: what produces that result:
Avoid copying:
Rights and access limits:
```

Useful sources have different jobs:

- Current product and official design systems: behavior and state conventions.
- Screenshot galleries: composition/density/hierarchy; not proof of live behavior.
- Interaction galleries: timing/continuity ideas; test their accessibility yourself.
- Code registries: implementation options; not independent usability evidence.
- Brand manuals: required identity constraints; not blanket approval of every color pairing.

Compare a reference at the same viewport and with comparable content. A sparse marketing hero and a dense operational table solve different problems.

Extract a principle, then apply it to a different domain. If the result only works with the original brand, you copied a style rather than learned a technique.

## 3. Brand and visual thesis

Capture the product's promise, audience, desired emotion and credible differentiator. Pick three descriptive attributes that lead to decisions, and three anti-goals.

Example—not an Escala clone:

```text
Product: a scheduling tool for independent repair technicians.
Thesis: dependable, legible, quietly technical.
Mechanisms: warm neutral canvas, compact work-order rows, one deep blue action role,
tabular times, clear job-state labels, restrained geometric illustration.
Anti-goals: medical SaaS template, playful achievement badges, cinematic scroll.
Signature: a readable day timeline that preserves job context when opening details.
```

Build identity across composition, typography, shape, icons, copy, imagery and interaction—not only a seed color.

Keep brand provenance explicit. A consistent palette is desirable for an approved identity; it is not a reason to preserve an agent's rejected fictional-brand proposal. For a fresh direction, reconsider the concept, main artifact, framing and palette together. Compare color **roles and proportions** (how much canvas, ink, product material and accent the visitor sees), not just nearby hex values. Do not mechanically map every technology product to cobalt-on-gray or choose random colors solely to look different. Validate selected/hover/focus and text pairs in the rendered composition.

For original brand work, start with simple reproducible forms and readable wordmarks. Check recognizability at small sizes and in one color. A generated logo is not proof of trademark clearance. Never imply client/institutional endorsement without evidence.

Use one icon family and a consistent optical size/stroke. Decorative icons should not create duplicate accessible names. Keep original artwork and licensed assets distinct from code/runtime licenses.

### Authorship and anti-generic gate

For new direction work, connect **product proposition → visible evidence → composition/interaction**. “Quiet, material, editorial” describes a mood; it does not yet establish what makes this particular studio, service or tool different.

Check these questions in the actual render:

- Without the wordmark, what concrete feature still belongs to this product? It may be content, geometry, a domain-specific visual encoding or a meaningful interaction—not necessarily an effect.
- Does the first viewport express the primary artifact/job? A portfolio can lead with typography, but a large empty region and a barely visible stock image need an intentional reason, not a generic spacing rule.
- Does the main content have a useful depth of evidence? For a portfolio, one coherent case with a constraint, decision and result can demonstrate more than eight unrelated thumbnails. Do not imply case exploration if the cards are only static figures.
- Does section rhythm follow content importance, or repeat the same two-column arrangement simply because it is easy to generate?
- Do photography, crop, caption, alt text and claims agree? Color grading can unify images; it cannot make an office corridor a library interior or prove ownership of a pictured project.
- Is each aesthetic choice anchored to the user, a legitimate incumbent constraint or an explained reference? Record an agent proposal as a proposal; do not promote it to user approval by writing DESIGN.md.

These are critique prompts, not a demand for constant novelty. Strong minimalism is valid; beige, serif type, editorial grids and glass are not banned. Reject **unjustified interchangeability and semantic mismatch**, not an entire visual vocabulary.

Before expanding a new surface, compare two small, structurally distinct composition studies if the direction is unpinned. Do not build two complete apps or change the framework for a visual experiment. Select one and justify it with the actual task, content and reference mechanisms.

After rendering, separate “works” from “meets the visual brief.” A technically correct page can still need a direction change. Do not repair weak hierarchy/content with generic word reveals, parallax or another dependency.

### Visual energy is an explicit direction choice

Do not silently equate premium with quiet beige editorial minimalism. An expressive, product-led brief can remain clean while using a dominant image/artifact, stronger variation in composition and density, layered detail, responsive controls and a coordinated entry/change/exit sequence.

Map the requested energy to the surface's job. A portfolio may expose a case as a visual journey; an operational app may use continuity between selected item and detail, clear pending/success feedback and a well-behaved sheet. Neither needs decorative motion on every element. Account for interruption, keyboard/touch behavior, actual rendering cost and a static/reduced-motion equivalent.

Describe the intended motion as a short interaction storyboard before coding: trigger → what changes → what remains anchored → what the user learns → how it reverses. “Fade everything on scroll” is not a complete motion direction. Do not claim Apple-level quality from using blur, rounded corners, springs or a particular framework.

### Turn subject matter into component ideas

Use this compact reasoning pass, not a new mandatory document:

1. **Inventory:** identify a handful of actual materials, constraints, artifacts, outputs or rituals from the brief. For fiction, label proposed details as demo assumptions; do not invent provenance or endorsements. “Mechanical keyboard” is a category; its particular assembly, choices and typing behavior are possible design material.
2. **Argument:** for each planned section write `visitor question → visible evidence → action`. Let these determine the order and geometry, not a stock hero/features/manifesto sequence. Delete a section that only repeats a slogan; add evidence rather than empty space.
3. **Concept:** complete `this product's [specific thing] becomes [a visual/interaction device]`. Substitute an unrelated product: if the mechanism survives unchanged except for labels and colors, revise it. Category conventions remain useful; novelty is not permission to obscure the task.
4. **Signature component:** choose one task that benefits from a designed interaction. Define its anatomy, input, state change, visual consequence and recovery. Build its inside, not only its container. Reuse accessible radios/dialogs/buttons underneath; a signature component is not an excuse to reinvent basic controls.
5. **Prototype:** show the idea at actual desktop and phone size with its real central asset and one working transition. Judge this before filling out the rest of the page. A self-authored DESIGN.md and a list of consulted skills are not visual evidence.

Examples of reasoning, **not a template library to paste into every build**:

| Subject evidence | Possible component mechanism | What it proves / limit |
| --- | --- | --- |
| A keyboard's assembly affects its feel | Select a layer in a construction view; expose that part and explain the choice alongside it | Makes assembly understandable; requires coherent layer artwork, not an unsupported exploded-CSS claim |
| A keyboard has distinct sound options | An honest A/B listening control with visible selection and consistent playback interaction | Makes comparison useful; synthesized sound must not masquerade as a recording |
| A room's light changes through the day | A time selector changes the same view and its annotations | Explains a spatial decision; needs truthful corresponding imagery |
| A schedule has competing time constraints | Selection expands an appointment in place, preserving the day and showing valid alternatives | Explains consequences without a separate decorative marketing scene |

Distinguish **new component behavior** from reskinning a card. Explain what the user can now understand or do, not how many UI parts or effects were added. Carry the concept into supporting sections through changing scale, detail, viewpoints or task depth; do not repeat the hero's asset and angle merely to make the page longer. Keep a shared visual grammar—variety is not random layout mutation.

## 4. Typography

Choose a family for the product's language, reading load, brand constraints, available weights and licensing. System fonts are a valid intentional choice; custom fonts are not automatically better.

Define roles as a set of **size, line-height, weight and tracking**:

- Display: rare emphasis on expressive surfaces.
- Page heading: location and task context.
- Section heading: grouping and scanning.
- Body: sustained reading, realistic paragraphs.
- Label/help/error: form comprehension and recovery.
- Metadata: secondary but still readable information.
- Numeric: tabular figures for changing or aligned numbers when the font supports them.

Use a small scale, then judge optical results. A mathematical modular scale is a starting point, not a guarantee. Tighten large display tracking only when the chosen font needs it; do not apply negative tracking to all text.

Start around the browser's default body size; verify effective text size after layout/zoom. Use rem/em where scaling should follow user text preferences. Avoid shrinking an entire app with CSS zoom to fit a mockup unless that is an explicit constrained requirement, and still test browser zoom and reflow.

Choose line lengths and leading from real content and script. Do not canonize one line-length number across tables, articles, buttons and multilingual text. Test accents, long names, currency, dates and fallbacks.

Load only necessary font files/weights. Check font loading, layout stability and fallback metrics; a screenshot before the intended font loads is misleading. Native SF font licensing is not a free pass to redistribute Apple's font files on the web.

## 5. Color and materials

Separate **primitives** from **semantic roles**:

```text
Primitives: hue/ramp, neutral ramp, literal pigment values.
Roles: canvas, surface, raised/sunken, primary/muted text, action/hover,
focus, border, selected, success, warning, error, information.
Components consume roles; components should not rediscover the palette.
```

A brand seed can be perfect for a surface and unsuitable for small text. Derive an accessible action/text role rather than forcing the seed everywhere.

Use perceptual color tools such as OKLCH to reason about ramps, but measure actual output/gamut and contrast. Equal numeric steps do not prove equal perceived contrast. Generate only the ramp the project needs.

Do not use hue alone to communicate meaning. Pair status with text, icon, shape or position. Preserve semantic colors across routes; document exceptions with a reason and affected components.

Measure relevant foreground/background pairs and states. On transparent or gradient surfaces, consider the actual pixels behind the text; two hex values in a token file do not certify the render.

Material communicates layering:

- Solid surfaces for sustained reading and data entry.
- Elevation for actual overlap or interaction hierarchy, not every nested box.
- Translucency only where it explains a floating layer and remains legible.
- A solid fallback for unsupported blur, reduced transparency or high contrast.

Glass is not mandatory Apple design. Do not animate large blur surfaces by default. Keep contrast stable through animation and scrolling. See [interaction and verification](interaction-and-verification.md).

## 6. Layout and composition

Establish a spacing vocabulary and consistent density, then tune optically. A four- or eight-unit rhythm helps consistency; it does not forbid a needed one-pixel optical correction.

Use proximity and common regions to show relationships. Use whitespace deliberately, not to hide missing information. Prefer a meaningful dominant region over equal-priority cards everywhere.

For nested rounded surfaces, derive inner radii from outer radius and padding when appropriate. Concentric geometry is more coherent than unrelated arbitrary radii.

Build responsive behavior from content needs, not device-brand guesses. Container queries can adapt a component to its actual available width. A mobile layout can rearrange information; merely shrinking desktop is usually not enough.

Use overflow locally where justified, such as a wide data table with labels/navigation preserved. Do not make the whole page horizontally scroll because a fixed-width decorative layout needs it.

Plan stacking contexts, sticky regions and scroll ownership. A fixed call to action must not cover validation messages or keyboard-focused controls. When an overlay is behind something, inspect its stacking context before raising z-index; use named layers, not arbitrary escalation.

## 7. Component contracts

For each reusable component specify:

1. User job and semantic HTML/primitives.
2. Inputs, outputs and source of truth.
3. Variants that are actually used.
4. Relevant states: ready/loading/empty/error/retry, selected, invalid, pending, success, permission.
5. Focus/keyboard and announcement behavior.
6. Narrow/long-content behavior.
7. Token roles and motion/material limits.
8. A small behavior test and rendered example.

Reuse the house component before importing another library. Mature primitives are especially valuable for dialogs, menus, comboboxes and gestures. Do not hand-write a focus trap to avoid reading the library docs.

Separate **behavior**, **anatomy**, and **skin**. For a selectable product part, behavior owns selection/keyboard rules; anatomy places the preview, name, consequence and price; skin applies the product's tokens. A compound API is useful only when callers need to compose those parts—do not create a component framework for one page. Let content choose the layout: a wrapping cluster for choices, a split preview/decision region for configuration, a reel for genuinely sequential media. Map only the used component states to semantic tokens, including motion roles such as selection, expansion and dismissal. Reuse that vocabulary across the signature component and ordinary controls. This creates coherence without forcing every region into identical cards.

Keep a loading button's footprint stable and expose its real status. Whether to use `disabled` or `aria-disabled` depends on semantics and focus needs; `aria-disabled` alone does not prevent clicks or submission.

Keep missing, zero, unknown, unavailable and unauthorized data distinct. A chart requires honest scales, units, comparison/date context and an accessible equivalent—not just an attractive shape.

## 8. How to critique

Review in this order: task/primary action → hierarchy/grouping → content/states → type/spacing → color/contrast → component consistency → material/motion.

Use a quick focal test on the rendered screen: what dominates at a glance, what is secondary, and where is the action? Then remove the wordmark mentally and swap the content for an unrelated product: which composition or behavior still carries this subject? These are critique prompts, not claimed human-test results. If the concept only exists in the design notes, change the pixels rather than strengthen the adjectives.

Use the Emil review format for concrete changes:

| Before | After | Why |
| --- | --- | --- |
| All sections compete at the same weight | One task heading; supporting sections reduced | Makes the next action easier to locate |
| Brand seed used for small low-contrast text | Dedicated darker semantic text/action role | Preserves identity without sacrificing legibility |
| A decorative transition delays an edit | Immediate edit; subtle non-blocking feedback | Prioritizes task control over spectacle |

Attach evidence, not taste insults. Test the proposed change in the render. “Premium,” “Apple-like,” “modern” and “beautiful” are not acceptance criteria.
