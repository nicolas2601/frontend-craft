# Product craft foundation

Primary design-judgment source for frontend-craft: the user-supplied **Frontend Craft Playbook, version 2.0, October 2026**, attributed in the document to Noel Santiago Méndez Jaimes. Nico explicitly designated it as the stronger basis. This is an original condensed adaptation of its method, not a copy of its full text, brand assets or project histories.

Source reviewed completely: `frontend-craft-playbook.md`; SHA-256 `61b440e0382256affa387eaaa1c57be3cfedd84f001364b931178fc84da0fb7d`. The original local document is preserved. Its case histories and reported measurements are source testimony, not newly reproduced experiments or access to an agent's internal reasoning. The described private suite, commands and scripts are not supplied by this adaptation.

The [complete source reading guide](noel-playbook-guide.md) routes to a verbatim local copy, so this condensation does not discard the detailed method. Read the relevant original sections when working on their topic; keep the host and technical adaptations below. No prior demo supplies a compulsory visual style.

## 1. Judgment before a catalog

Precedence: **host safety/authorization → explicit current user brief and accessibility/product truth → verified approved project decisions → this product-craft foundation → selected specialist advice → library defaults**. A document written by an agent is not evidence of user approval. Third-party skills fill a named gap; they do not take over the visual identity.

A short subject-and-goal request is sufficient. The agent owns the missing design work, states reasonable assumptions, and asks only when a consequential unknown blocks progress. Do not turn the playbook's brief questions into a mandatory interview or add a process ceremony to a small change.

Every important visible choice should be defensible: font, color role, hierarchy, shape, material, density, motion. Simplicity exposes purpose; it does not require sparse or static pages. Cohesion across these choices creates the product, not the number of effects or frameworks.

Choose the surface mode before its expression:

| Mode | Craft should emphasize |
| --- | --- |
| Operate | Precise hierarchy, appropriate density, fast feedback, reliable editing/recovery |
| Read | Legibility, rhythm, useful context and navigation |
| Persuade | A specific proposition, visible evidence and an intentional next action |
| Experience | A committed atmosphere or scene, with exploration that remains understandable and accessible |

Variance, motion and density are independent qualitative choices, not random seeds, measured quality scores or fixed numerical presets. A landing can be expressive while its embedded configurator remains precise.

## 2. System before screens, without overbuilding

First gather the brief, actual content, assets and approved references; then select specialist guidance. Do not choose a skill's aesthetic first and retrofit the product to it.

Establish one visual grammar and one token source of truth. Use semantic roles for text, surfaces, action, focus and status; reserve meaningful business colors so decorative uses do not consume their meaning. Define typography as size/weight/leading/tracking roles, including comparable numerals and credible font loading. Share spacing, shape, elevation and motion roles where they actually recur.

For multiple screens or a new reusable system, build a **compact rendered system proof** from the production components: text hierarchy, surface/material hierarchy, primary controls, selection, focus, relevant pending/error states and the signature component. Show a narrow arrangement too. The same components then build the screens; the proof is not a second hand-styled mockup. For one small surface, this can be the representative slice itself—no compulsory Storybook, universal token ramp, new route, or set of documentation files.

A cross-cutting correction belongs in that shared system. Verify its consumers instead of applying unrelated CSS fixes to every screen. Check code and current output before editing; preserve other people's work.

## 3. Depth, geometry and color as relationships

Build separation in this order: grouping/space → surface tone → justified elevation → necessary contour. Borders, pills, gradients and glass are tools, not universal bans; do not let one device erase distinctions between content, controls and floating layers.

Keep related geometry related: a tab indicator derives from its actual tab; an annotation from its target; a map pin from its anchor. Recompute together when layout changes. Judge nested radii and neighboring alignments optically rather than collecting arbitrary values.

Material should express a real layer or chosen atmosphere. Glass needs visible context, stable readable text, limited overlap and solid/high-contrast fallbacks; it is not the default material for dense content. Contact and ambient shadow have different jobs. Check light direction and material consistency at actual size.

Color is a hierarchy of roles and proportions, not a collection of attractive hex values. Use product/brand evidence, a useful neutral ground and deliberate accent placement. Tinted neutrals or perceptual color tools are options, not proof of contrast or a reason to reproduce Escala's green palette. Measure the actual foreground/background pairs and states.

## 4. Components are behavior with a designed anatomy

Decide semantics before appearance. Distinguish changing a view, selecting an option, filtering, progress and navigation. Reuse native/installed accessible behavior underneath the custom composition.

The smallest useful component proof includes normal, selected, focus, press and applicable pending/disabled/error/result states. Loading must represent real work, retain context and avoid accidental duplicate actions. Preserve the user's input on recoverable failure. A closed panel must not leave invisible controls reachable; a modal needs appropriate focus entry, containment, exit and restoration. Do not make every task modal.

Positive mechanisms to transfer, not fixed component recipes:

- A saving control retains its footprint while status changes, with a real submission guard and useful confirmation.
- A segmented selector preserves spatial continuity, but uses tab/radio/button semantics according to its job; its geometry follows actual labels and resizing.
- An assistant belongs to the workflow: it reveals the context it used and offers editable proposals at the relevant object, rather than adding a disconnected mascot. Respect the product's actual approval policy.
- A route or timeline makes state, order and next action visible; its geometry and data stay coherent across views.

Fictional fixtures may demonstrate these behaviors but are labeled honestly. No fabricated customers, endorsements, measurements or institutional claims. Useful copy names the action and explains cause/recovery; decoration is not a substitute for content.

## 5. Motion is a behavior and material decision

Choose purpose and frequency first. Frequent operations must not wait for delight; rare explanatory surfaces can sustain a signature scene. Coordinate immediate feedback, origin, continuity, interruption and reversal. Use one coherent motion vocabulary rather than the same reveal everywhere.

A signature transition has a small technical contract: trigger, initial/intermediate/final states, properties, timing/easing, ownership, interruption, reduced-motion alternative and actual check. A video beat, a gesture and a keyboard action have different timing needs. Do not erase necessary feedback simply because input came from a keyboard.

Use the least costly adequate technique and profile observed problems. CSS transitions can retarget, springs can carry useful velocity, and layout/paint effects can be justified locally. None guarantees compositor execution, a frame rate or battery cost. Reduced motion is a designed alternative; even a rotating loader needs contextual judgment, not a universal exemption.

## 6. Feedback is scoped product memory

Retain this compact chain in the existing design record when a correction matters:

`feedback → observed cause → exact correction → scope → approved/pending → regression check`

Separate a fact about this project, an explicit user preference and a general reusable principle. “No grid background” does not mean “remove the approved tiled illustration.” “Move this button” does not authorize rewriting its card. Never promote an inferred preference into an approved constraint.

When a user says “generic,” diagnose first: excess effects, weak hierarchy, inconsistent type, missing evidence, poor imagery or the wrong concept can demand different fixes. Polish within a **valued/approved** identity first; if the direction itself was rejected, revisit it instead of preserving the agent's own proposal. Preserve what the user explicitly likes and change exactly the requested scope.

## 7. Demonstrated quality, not ceremonial completion

Check the representative system and primary task at relevant desktop, tablet and narrow widths, with long/missing content, keyboard/focus, zoom/reflow and reduced motion as applicable. Inspect both stable frames and transitions. A linked shape must remain attached; related data must remain ordered and consistent; meaningful whitespace must serve the content rather than hide missing work.

Use real project checks and the host-authorized browser. In Nico's environment that is Playwright MCP: do not execute the playbook's standalone browser script or modify global config to imitate its setup. Test offline only when offline/self-contained delivery is in scope. Performance budgets are targets until measured; automated accessibility tools and self-scores do not establish complete conformance or aesthetic success.

Deliver what changed, what actually ran/was observed, and what remains unverified. For scope-limited tasks, a short response is enough. No fake model-switch markers, uninstalled commands, private-suite invocations, publication, or assertion that the source's reported tests ran here.
