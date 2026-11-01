# Escala: reconstructing a frontend workflow from evidence

Scope: technical reverse engineering of `nicolas2601/cde-platform-hackathon`, revision `634b49690da884a8069a8f47817603d7dc5b7be0`, accessed 2026-10-29. This is a bounded engineering investigation, not a complete audit, usability study or reconstruction of anyone's private thought process.

Paths below are relative to that repository. Nico's inspected local checkout was `/home/nicolas/work/cde-platform-hackathon`. The skill's general workflow does not require this checkout. The evidence came from a **private repository**; do not publish the case-study material without appropriate authorization.

## Contents

1. Attribution and evidence limits
2. Observable development sequence
3. What makes the interface distinctive
4. States, contracts and implementation craft
5. What was actually rendered and tested
6. What not to copy
7. A transferable workflow

## 1. Attribution and evidence limits

`apps/web/README.md:1-4` identifies Noel as frontend owner. `apps/web/DESIGN.md:3-5` and later decision entries name Santiago as visual decision maker. Git records the account `Noel1805`. This investigation does not independently establish that every named identity maps to the same person.

At the pinned revision, `git shortlog -sn HEAD -- apps/web` reported 90 commits for Noel1805, 7 for Nicolas Moreno, 1 for Nicolas Santiago Moreno Monroy and 1 for Nicole Camila Niño Ariza. These counts include merges and do **not** measure lines written, originality, hours or contribution quality.

No reliable prompt transcripts, model identifiers or agent execution logs were found for the frontend work. Instructions in handoff documents are not proof that a particular prompt or tool was used historically. Missing coauthor metadata does not prove the absence of AI assistance.

Use three labels:

- **Observed:** code, git metadata, command output, rendered behavior.
- **Documented:** a decision or rationale explicitly written in the repository.
- **Inferred:** a plausible explanation not independently established by those records.

“This workflow is reproducible from the artifacts” is defensible. “This is Noel's exact mindset, prompts and tool chain” is not.

## 2. Observable development sequence

Representative commits, verified directly from Git:

| Commit | Local date/time | Observable change |
| --- | --- | --- |
| `baa3e82` | Oct 26, 19:11 | React/Vite/Tailwind/TanStack Query foundation with Bun |
| `822b5a8` | Oct 26, 21:50 | Tokens from DESIGN.md and locally hosted Open Sans |
| `fe19b54` | Oct 26, 22:35 | Shared Boton, Campo, Tarjeta, Icono and Vidrio components |
| `72f1e38` | Oct 26, 22:53 | Session, role-protected routes and provisional views |
| `80cbe59` | Oct 27, 00:55 | P1 access screen based on a mockup, with real login integration |
| `2fe9321` | Oct 27, 18:28 | Revised shell scaling around a 1920 × 1080 logical canvas |
| `c1a614b` | Oct 28, 12:19 | Copilot transition from the mascot and close control inside the context panel |
| `1b4c6a5` | Oct 28, 15:48 | Copilot prefetch/premount and delayed column entrance |

Other evidence of iteration includes V4 screen work (`25bbf64`), replacement of color primitives with roles (`53cb3c8`), content corrections (`1f0053a`) and visual adjustments (`27fd6ae`). Those are examples, not a claim that every screen followed an identical process.

The design document labels its v2 direction as Oct 25, while the first tracked introduction of that file in this history is Oct 26 (`822b5a8`). Git does not establish when an earlier untracked draft was authored.

`apps/web/scripts/comparar-visual.ts` implements local Playwright/pixelmatch comparison for P1 at desktop and mobile dimensions. The P1 commit mentions local visual comparison. This establishes a tool and a reported practice—not the number of times it ran or a complete historical test log.

The original mockups cited in `DESIGN.md:291-298` were not present in the inspected checkout; the comparison tool refers to an external export directory. Exact original fidelity cannot be independently reconstructed from the committed artifacts alone.

## 3. What makes the interface distinctive

### A. A written visual thesis

`DESIGN.md:22-32` names **Escala · Terreno claro**: a luminous, precise workspace where progress appears as a real route, not points-and-badges gamification. It explicitly rejects a generic gray dashboard and indiscriminate glass.

This gives decisions a common direction. The transferable technique is a thesis plus anti-goals—not the specific mountain, green pigment or institutional identity.

### B. Semantic color, not a bag of hex values

`DESIGN.md:34-82` and `src/estilos/tema.css:26-78` distinguish ramps and semantic roles. The brand seed `#008E6C` is separate from the darker action/text role `#006B51`. A green-tinted neutral canvas and darker ink surfaces connect the app without coloring everything.

Independent sRGB luminance calculation during this investigation, with black/white and identical-color self-checks, gave:

| Pair | Ratio | Meaning |
| --- | --- | --- |
| `#008E6C` on white | 4.129:1 | Below normal-text AA's 4.5:1 threshold |
| `#006B51` on white | 6.518:1 | Above normal-text AA's contrast threshold |
| `#E9A427` on white | 2.142:1 | Unsuitable for normal text on white |
| `#575C5A` on white | 6.810:1 | Legible secondary text pairing by ratio |
| `#1E2120` on white | 16.234:1 | High-contrast primary text pairing |

These are static color-pair checks, not a conformance audit of transparent surfaces or every state. `DESIGN.md:70` calls 18 px/600 text large; that is not a universal WCAG large-text definition.

### C. Typography carries hierarchy

`DESIGN.md:96-122` defines roles from one family: body 16/24, metadata 14/20, headings/counters with distinct weights and leading. `src/estilos/tema.css:4-24` hosts Open Sans Latin/Latin-ext with swap loading. Numerals use tabular alignment where appropriate.

The mechanism is a controlled role system and font loading, not a requirement that every product use Open Sans. Effective rendered text must still be checked when a logical canvas is scaled.

### D. The shell establishes an identity before the content

The CDE and entrepreneur surfaces use different shells for different audiences. The CDE's active navigation is geometrically joined to the inserted content panel; the entrepreneur shell uses a top navigation (`src/componentes/marco/MarcoCde.tsx`, `MarcoEmprendedor.tsx`, `src/estilos/marcos.css`).

In the observed desktop render, this created a recognizable frame while content cards stayed restrained. On narrow viewports, the shell rearranged rather than preserving a full desktop sidebar.

### E. Illustration is constructed, not pasted on

P1's terrain is procedural layered SVG with clipping and measured wordmark geometry (`src/vistas/acceso/Paisaje.tsx:147-208,291-399`). The design record documents glyph measurement, font-ready recalculation and alignment adjustments (`DESIGN.md:289-298`).

This is a useful example of art direction expressed as geometry. It is not evidence that procedural SVG is always cheaper or that every access form needs a cinematic landscape.

### F. Materials have roles and fallbacks

The glass system centralizes navigation/floating/hero recipes and supports unsupported backdrop filters, reduced transparency and forced colors (`src/estilos/vidrio.css:34-78,181-227`). Stronger surfaces stabilize reading and inputs.

Observed screenshot contrast and material layering contribute to the visual coherence. Port the recipe-based architecture and fallbacks, not “glass is mandatory” as a universal principle.

### G. Signature components remain domain-specific

The diagnosis flower and route mountain express the product metaphor. `src/componentes/empresa/flor.ts` separates geometry; `Flor.tsx` includes accessible explanations and an optional table, with related tests. Route geometry is implemented in JavaScript/SVG rather than a general 3D framework.

Transfer: separate meaningful visual encoding, geometry, state and accessible equivalent. Do not copy a visually interesting chart without checking whether its encoding fits the new data/task.

## 4. States, contracts and implementation craft

- `src/App.tsx:55-125` separates public routes, audience shells, protected areas and the copilot over a background route.
- `src/api/cliente.ts` centralizes same-origin Laravel access, CSRF and typed errors; `src/main.tsx:14-22` controls retry behavior.
- `Boton.tsx:60-88` preserves footprint/focus during loading and prevents repeat activation; `Campo.tsx:46-99` links labels/help/errors; `Segmento.tsx:55-125` handles radiogroup keys.
- Bandeja, route and event tests exercise specific loading/empty/error/permission paths. A declaration that “every view has all states” does not itself prove complete coverage.
- `Banu.tsx` associates mascot behavior with state and pauses loops under relevant conditions. Visible “Noctua” naming intentionally differs from older internal Banu identifiers (`DESIGN.md:318`).
- `CapaCopiloto.tsx` handles inert background, focus and Escape; the design record explains opening from the mascot, premounting and deferring expensive glass painting (`DESIGN.md:299-314`).

This is why copying only colors and cards misses much of the work: the frontend has contracts, permissions, states, data meaning and recoverable interactions.

## 5. What was actually rendered and tested

The main investigation used Playwright MCP against the actual frontend with its **synthetic API helper**, not the production backend. A local proxy target pointed to an unused loopback port; external browser requests were blocked. No application source was edited.

Screens inspected:

- Access at 1440 × 900 and 390 × 844.
- Adviser Bandeja at 1440 × 900 and 390 × 844.
- Entrepreneur Mi empresa at 1440 × 900.
- Copilot at 1440 × 900.

Evidence images are in Nico's research directory `renders/`. The observed shell/document widths on the sampled Bandeja/enterprise views did not exceed the tested viewport. This does not establish every route/state/zoom behavior.

Interaction exercised: click **Abrir el copiloto Noctua** → dialog route → Tab reaches a company control → Escape closes → URL returns to `/bandeja` and focus returns to the triggering control. This is targeted evidence, not a full screen-reader/focus-containment audit.

Local checks used project-pinned Bun 1.4.4; installed Bun 1.3.12 could not parse lockfile version 2. Locked dependencies installed without lifecycle scripts; no lockfile changes were made.

| Check | Actual result |
| --- | --- |
| Initial full test run alongside other checks | 864 passed; 1 timed out at 5000 ms |
| Same failing test alone | Passed; 42 other tests in that file intentionally skipped |
| Full suite with `--maxWorkers=2` | **865 passed / 63 files**, exit 0 |
| Typecheck | Exit 0 |
| Biome lint | 240 files checked, no fixes, exit 0 |
| Production build | Exit 0; main JS chunk 804.49 kB / gzip 234.33 kB, with chunk-size warning |

CPU contention/timing sensitivity is a plausible explanation for the first timeout, not a proven product root cause. No test assertions or timeouts were modified. The chunk warning is not by itself a measured user-visible slowdown. No physical-phone, production backend, live-provider or user-usability test was performed.

## 6. What not to copy

There is no “perfect” source design immune to tradeoffs:

- `DESIGN.md:3,169` refers to older stylesheet names; current entry imports the newer split styles.
- The documented navigation glass recipe (24→8% tint, 180% saturation) differs from current CSS (62→46%, 170% at `vidrio.css:34-47`).
- The blanket transform/opacity-only statement does not literally describe all color/width/SMIL changes in the current implementation.
- Selected-border widths differ between sections of the design record.
- CSS zoom/logical-canvas fitting was a specific demonstration requirement, not a general responsive-web best practice.
- Internal approval of a name/color exception is not proof of institutional approval or accessibility conformance.

These are reasons to compare design intent with source and render—not to discard the valuable system or to repair unrelated code during this research.

## 7. A transferable workflow

The artifacts support this observable pattern:

**Choose an identity → encode it as roles → build common components → connect audience/routes and data states → implement a representative composition → compare with a reference → correct geometry/content → refine interaction and rendering cost.**

This is an evidence-based reconstruction, not a claim about the exact order of someone's thoughts. Practice it with a different brand/domain, one small slice at a time. The learning target is a repeatable chain of decisions and checks, not an Escala template or an untestable “perfect mindset.”
