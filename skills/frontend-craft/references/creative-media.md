# Creative media and original interactive components

Use this only when the concept needs authored 2D, object inspection, a cinematic sequence or a video deliverable. A short user brief is enough to propose the medium; it is not permission to install tools, spend on generation, upload assets or render an unrequested film. Keep one director and scoped specialists.

## 1. Decide what must be different

Separate three jobs:

- **Originality:** a concept, composition or interaction derived from this product. A shader or new library is not a concept.
- **Practical component craft:** a clear task, understandable controls, useful detail, trustworthy states and recovery. Preserve native/installed accessible primitives underneath the custom anatomy.
- **Physical realism:** coherent geometry, proportions, materials, lighting, reflections/contact shadows and camera framing. A 3D transform does not supply those ingredients. Compare the actual asset at delivery size, including close-ups, before promising realism.

Write one compact shot/component brief: `visitor question → subject/asset → framing → action/change → visible evidence → fallback`. For example, “What changes when I choose this material?” can become a material selector with a consistent product view and an inspected close-up. “How is this assembled?” can become a selectable layer view with adjacent HTML explanation. These are alternatives serving different questions, not mandatory extras on every product page.

## 2. Choose the lightest adequate medium

| Need | Suitable candidate | Required input and fallback |
| --- | --- | --- |
| Responsive controls, masks, line drawings, simple spatial transitions | Native CSS/SVG/WAAPI or the project's installed motion tool | Design start/intermediate/end states; retain semantic HTML, keyboard access and reduced-motion behavior |
| Authored 2D illustration or a richer vector sequence | Lottie when its asset/player fit; a Rive state-machine asset when one actually exists | Inspect the real JSON/.riv and runtime compatibility; provide status text, an appropriate still and reserved dimensions. A guide is not an animation asset |
| Inspect, rotate or configure an actual object | A scoped Three.js viewer or the project's existing renderer | Supplied/licensed or deliberately authored geometry, textures, camera and lighting; bounded controls, loading/error UI, adjacent HTML actions and a static product view |
| A few justified visual-material effects | A scoped shader/WebGL component | A no-WebGL fallback, context-loss recovery and bounded resource use. Avoid one renderer/animation loop per repeated list item |
| A timed launch film or editable product loop | Remotion or an existing frame-based composition workflow | Shot list, real product assets/components, delivery size and timeline; preview before an explicitly requested export |
| Scroll-led product story | Native/staged scroll with owned media, a suitable live scene, or a verified clip-seeking path | The scroll must reveal information, not merely extend page height. Keep ordinary navigation, reachable content, a static path and mobile-specific framing |

Do not migrate a site to React just for a component, or use a video export as a substitute for a working configurator. CSS/SVG can be the right visual language; use them intentionally rather than faking photographic material with ever more gradients. Libraries and asset licenses are separate; check commercial-use terms and rendering costs before adopting them.

For richer component examples, inspect a relevant existing registry or source specimen, including its interior behavior and dependencies. React Bits/shadcn can be implementation resources in a compatible project, not a reason to add generic animated backgrounds or a mandatory component catalog. Keep the actual product's geometry, content and state contract.

## 3. Borrow film direction without turning the website into a film

Useful film mechanisms are **wide view → material/detail → meaningful transformation → resolved product**, variation in scale and pacing, motivated camera changes and continuity of object/shape across shots. Choose a sequence that answers the brief; this order is an example, not a compulsory narrative.

Establish a focal subject, restrained supporting layers and consistent light. A detail shot must reveal something not already visible in the hero. Keep captions legible at phone size and make a landing loop understandable muted. Music needs permission/rights and is optional; interactive web feedback must not wait for a musical beat.

For frame-rendered video, scene state must be reproducible from timeline position; do not reuse uncontrolled timers or live UI animation clocks and assume seeking/export will match. Sample representative frames and scene handoffs, preview a draft, then inspect the decoded export's dimensions, duration, crop, colors and audio if export was requested. Verify current framework APIs rather than copying an untested snippet.

Do **not** import quotas such as “three motion properties per entrance,” “three layers per scene,” compulsory particles/glows, or “something must always move.” These are author style prescriptions, not quality standards, and can directly recreate the generic visual noise the user rejected. Stillness and simple cuts can serve the story. Video pacing rules do not override interactive latency, accessibility or user control.

For live 3D, inspect silhouette and material at normal view and close-up, touch/keyboard alternatives, resize, unsupported-renderer behavior and context loss. Bound model/texture size, pixel ratio and lights/shadows for the target device; pause unnecessary offscreen/hidden work and dispose resources. No frame-rate, GPU or hardware claim without measurement. Do not claim a CSS exploded diagram is a physically accurate assembly or a material model unless it actually is.

## 4. Reference scope and independent creative judgment

A user can like one material treatment, transition or interaction while rejecting the rest of a reference. Record exactly what transfers and what does not. Partial approval is not permission to copy that project's layout, scene, palette or subject into a new brief. No previous demo is the base for this workflow; the Noel playbook supplies the method, and the current product supplies its visual world.

For a tangible scene, design its product-specific geometry, material vocabulary, light and camera together. Give parts understandable relationships and connect relevant controls to visible consequences. Keep the rest of the page at the same level of specificity rather than attaching a striking scene to generic blocks. Finish can come from deliberate procedural code, licensed assets or supplied media; it does not automatically require paid generation.

For an explorable object, define ownership between the user's camera and guided scroll. Manual input must not be immediately overwritten by the narrative camera. Provide an understandable return/reset, bounded zoom/orbit where appropriate, touch/keyboard alternatives and matching HTML information for selectable parts. Do not add every gesture to a daily business screen.

Reject an under-resolved contour or enlarged icon when the brief calls for a finished central asset. Conversely, do not impose photorealism on a genuinely authored flat/vector direction. Judge task fit and visual finish against the selected references, not a named previous project's style or a claim that another model should match it.

### Illustrative reasoning, not templates

| Visitor question | Deliberate presentation and useful component | Why the medium earns its place |
| --- | --- | --- |
| A conservation team compares shoreline scenarios | A sourced 2D map, scenario selector and dated annotations; keep projections visibly distinct from observations | Spatial comparison is already readable in 2D. A navigable terrain scene is justified only if depth/landform adds evidence, with a map/text equivalent |
| A repair customer needs to identify a chair joint before booking | An authored close-up/cutaway and part selector revealing the matching repair information; use bounded 3D only when hidden geometry matters | The interaction connects inspection to the next decision, instead of orbiting a decorative object. Preserve an image/text route and do not imply a diagnosis beyond the evidence |

These are hypothetical exercises in choosing medium, evidence and behavior. They prescribe no palette, composition or asset for a new project, and are not claimed usability results.

## 5. Selective guidance inspected, 2026-10-30

Full UI Skills guide texts were retrieved for:

- [flornkm/webgl-components](https://www.ui-skills.com/skills/flornkm/webgl-components/llms.txt): small authored WebGL components and fallback/resource considerations; not a default page-wide effect layer.
- [mengto/threejs](https://www.ui-skills.com/skills/mengto/threejs/llms.txt) and [cloudai-x/threejs-interaction](https://www.ui-skills.com/skills/cloudai-x/threejs-interaction/llms.txt): scene/object interaction, loaders, controls and lifecycle. Version-specific examples require current documentation.
- [diffusionstudio/text-to-lottie](https://www.ui-skills.com/skills/diffusionstudio/text-to-lottie/llms.txt): authored vector motion; its Skia Skottie target is not proof that every Lottie player will match. No Rive-specific guide was found in the bounded lookup; no .riv asset/runtime was tested.
- [rieranthony/product-film](https://www.ui-skills.com/skills/rieranthony/product-film/llms.txt): reuse actual product identity/components, shot planning, timeline-driven scenes and handoff review. Its linked templates/scripts were not retrieved or executed; specific codec/color claims were not independently verified.
- [remotion-dev/remotion-best-practices](https://www.ui-skills.com/skills/remotion-dev/remotion-best-practices/llms.txt): a routing guide, not the complete implementation references. Its browser-launch instructions do not override the host's Playwright-only policy.
- [memex-lab/product-launch-video](https://www.ui-skills.com/skills/memex-lab/product-launch-video/llms.txt): the complete 805-line retrieval was read; useful sensory translation, shot contrast, storyboard and muted-playback thinking. Reject its unlimited-budget posture, mandatory visual-density rules and blanket font/easing bans.

This is source research, not execution or a comparative outcome benchmark. No animation asset, 3D model, film, installed package or demonstrated improvement is implied by these guide reads.
