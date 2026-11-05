# Rights and redistribution

This repository does not grant a blanket license to every bundled or referenced work. Unless a particular file or asset has an explicit license that applies to the intended use, do not assume that public availability, attribution, a private source repository, or a successful download permits copying, modification, commercial use, or redistribution.

## Bundled design playbook and study material

The complete Noel Santiago playbook was supplied by the user and is included intact as source material, with a separately identified adaptation and guide. No independent license to redistribute that playbook was established. Preserve attribution and source integrity; do not extract or republish it as an independently licensed work. Before distributing this package beyond an authorized context, obtain the rights holder's permission or a license that covers redistribution. The repository is private; keep the playbook inside it.

The Escala case study derives from another private project. It is not permission to copy that project's checkout, screenshots, source, or raw data. The package may describe verified local observations as historical context; do not turn them into reusable project materials or public screenshots.

## Subagents and upstream attribution

The ten `fc-*` subagents in `agents/frontend-craft/` are original adaptations written for the frontend-craft stages. Several roles are informed by the MIT-licensed **agency-agents** project (https://github.com/msitarzewski/agency-agents, pinned commit recorded in [agents/NOTICE.md](../agents/NOTICE.md)). The adaptations do not copy the upstream persona text, emoji styling, memory sections, or integrations, and the rest of that agency is not imported.

Attribution, the idea-credit table for each `fc-*` agent, and the upstream MIT notice are in [agents/NOTICE.md](../agents/NOTICE.md). Keep that notice with any redistribution of the agent files. Attribution there does not extend to the Noel playbook or to any other third-party skill.

## svg-craft packs

`skills/svg-craft/` vendors an SVG skill. Its packs carry their own MIT license files, each with its copyright line. Keep these files beside the packs when copying or repackaging them:

| Pack | License file | Copyright line (as written in the file) |
| --- | --- | --- |
| animation | `skills/svg-craft/packs/animation/LICENSE-iart-MIT` | MIT License, (c) 2026 iart.ai |
| diagram | `skills/svg-craft/packs/diagram/LICENSE-bybit-MIT` | MIT License, (c) 2026 bybit-exchange |
| diagram / svg-diagram | `skills/svg-craft/packs/diagram/svg-diagram/LICENSE` | MIT License, (c) 2026 bybit-exchange |
| generative | `skills/svg-craft/packs/generative/LICENSE-narumiruna-MIT` | MIT License, (c) 2026 なるみ |
| illustration | `skills/svg-craft/packs/illustration/LICENSE-mengto-MIT` | MIT License, (c) 2026 Meng To |

Each license file governs only the pack it sits in. It does not clear rights to any artwork, brand, or depicted third-party material a pack might reproduce. The anatomy kit (about 40 MB) is not bundled; obtain it from its own source under its own terms if you need it. The svg-craft tools in `skills/svg-craft/tools/` depend on `playwright-core` and `svgo`; check their licenses for the installed versions.

## Code, dependencies, components, and references

Check each dependency's license and notices for the version actually installed. A dependency's MIT license applies to that dependency, not automatically to this repository, its playbook, or copied assets. No repository-wide license grant should be inferred unless an explicit license file is added by the project owner.

Do not redistribute third-party registry components, fonts, product screenshots, photography, icons, or generated assets until their licenses and source terms are checked.

## External reference data (not redistributable)

The following produce reference material for research, not material this repository may republish:

- **Awwwards** (via the third-party awwwards-mcp project): search results, design DNA, captured page structure, screenshots, and motion evidence describe third-party sites. The awwwards-mcp README states that daily listings use scraping of public pages. Treat outputs as private reference notes; do not republish captures or copy site content, and check the terms of the sites involved.
- **Figma** files and the Figma MCP's outputs belong to their owners. Read, adapt and cite them within the project that is authorized to use them; do not publish file contents or exported assets from them here.
- **Pinterest** and similar boards: view them only in your own logged-in session. Do not bulk-save, scrape, or redistribute pins.
- **design-screenshots** and **Lazyweb** captures: the capture rights for the design-screenshots connector were not established, and Lazyweb's terms were not verified. Use them for inspiration and cite provenance; do not redistribute.
- **UI Skills** guides are third-party interpretations; cite them and do not copy their text into this repository.

## Generated imagery and video

Model or Space metadata does not settle rights in a hosted inference service's inputs and outputs. Check current provider terms, model license, quota/credit behavior, and any downstream restrictions before generation or publication. Anonymous/free access is not a rights waiver and not a way to bypass a quota or access restriction. This applies to the bundled Hugging Face image helper, to Google Flow, and to any other generator.

Generated scenes must be described honestly as synthetic. Do not present invented people, products, facilities, metrics, or outcomes as documentary evidence. Do not upload private client or user material to public inference unless the data owner has authorized that route and its terms are acceptable. Preserve prompts, model/provider, settings/seed, source, and the selected output's review status where applicable.

## Before publishing a derivative

- Identify each copied text, code, image, font, screenshot, and model output.
- Verify the license/terms for that exact item and version; record required notices and attribution.
- Remove or obtain permission for material without a redistribution right, including the user-supplied playbook where permission is not established.
- Keep the MIT notices and license files for the svg-craft packs and the agency-agents attribution in [agents/NOTICE.md](../agents/NOTICE.md).
- Exclude private project checkouts, client data, credentials, local paths, and raw provider traces.
- Ask the rights holder or project owner when scope is unclear; do not infer permission from repository access.
