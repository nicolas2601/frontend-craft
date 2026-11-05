# Model and harness portability

Use this when a model, agent client, skill loader or tool is missing. A skill is a procedure and supporting knowledge, **not** a browser, design-trained model, permissions system or API subscription.

## Contents

1. Minimum working agent
2. Capability check
3. Loading this skill elsewhere
4. Qwen/Kimi and the limits of model cards
5. Small-context execution
6. Evaluation without pretending
7. Reading is not application

## 1. Minimum working agent

The complete design-engineering loop needs:

```text
User brief + repository/design context
        ↓
Model in an agent harness
        ↔ read/search and scoped edit tools
        ↔ shell for project checks
        ↔ documentation/reference access when available
        ↔ authorized browser interaction and screenshots
        ↔ actual screenshot interpretation (model vision or a human)
        ↓
Observed discrepancies → focused correction → evidence-backed delivery
```

The model proposes tool calls; the harness validates/executes them and returns results. Neither a plain chat page nor an OpenAI-compatible endpoint automatically provides a filesystem, tool loop, browser or visual understanding.

Prefer the coding client already authorized/configured by the user. OpenCode is one provider-independent option, not a requirement or an endorsement of every configured provider. Qwen-Agent is documented by Qwen as an agent/tool integration option. Do not build a new orchestration framework for a frontend task.

## 2. Capability check

| Capability | Small check | Honest fallback |
| --- | --- | --- |
| Read/search | Read the named project manifest/design record | Request the minimal relevant file text |
| Edit | Confirm an authorized workspace/edit tool | Return a patch; do not say it was applied |
| Shell/checks | Run an appropriate harmless existing command | Give exact project commands for a human; mark unrun |
| Skill loader | List exposed skills; load one known ID | Read local SKILL.md and its relative references |
| UI Skills MCP | List a narrow topic, retrieve one chosen skill | Use verified upstream SKILL.md or bundled principles |
| Reference images | Retrieve metadata then one relevant image | Explain the reference gap; use incumbent assets |
| Browser control | Open the authorized local route, inspect semantics | Stop visual verification; do useful nonvisual work |
| Image understanding | Actually inspect a screenshot | Ask a human or separately authorized vision model; no pixel-quality claim |
| Backend | Verify authorized endpoint/data mode | Local synthetic fixtures; no persistence/authorization claim |

A configured tool can still fail authentication or be unavailable in this session. Record the actual result, not the tool's installation status. Never print credentials while diagnosing capability.

## 3. Loading this skill elsewhere

This package follows the Agent Skills directory convention: `frontend-craft/SKILL.md` plus relative `references/` and `assets/`. It has no runtime dependency on the private Escala repository.

- **Client with Agent Skills support:** place the folder in a documented skill directory for that client; verify discovery and invoke its displayed name.
- **Client with file tools but no skill feature:** explicitly read `frontend-craft/SKILL.md`; follow its links only for the current stage. No fake `Skill(...)` call is needed.
- **Chat-only client:** provide the core instructions and relevant reference text. Without tools, expect a proposal/code listing—not a verified implementation.
- **API integration:** the application must supply tool definitions, execute authorized calls, return outputs, manage budgets and expose screenshots in a format the selected model supports. An MCP entry in a model card is not an already running server.

OpenCode documentation inspected for this package lists global discovery in `~/.config/opencode/skills`, `~/.claude/skills` and `~/.agents/skills`, and project equivalents under `.opencode`, `.claude` and `.agents`. Other clients differ; check the installed version instead of assuming the same paths everywhere.

For this package's local installation recipes and verified optional skill IDs, read [skills and installation](skills-and-installation.md). Do not overwrite an existing same-named skill or global configuration. Restart/reload discovery only when the client requires it; a symlink on disk is not proof the current model has loaded the skill.

## 4. Qwen/Kimi and the limits of model cards

The workflow does not depend on a model's country of origin. It depends on reliable tool use, coding ability, adequate context, suitable visual understanding and an evidence loop.

Public examples inspected on 2026-10-29:

- **Qwen/Qwen3-8B:** the official card documents agentic/tool use, MCP via Qwen-Agent and OpenAI-compatible deployment options. It is a **text-generation** model, not screenshot vision. This is an illustrative supported tool-use path, **not** a claim that this older/smaller model matches a frontier frontend model or is the newest Qwen.
- **moonshotai/Kimi-K3:** the official card describes native multimodality and agentic coding. It lists 2.8T total parameters and a custom license. That is **not** a sensible automatic local download for a typical workstation, a free hosted API promise or independent proof of frontend quality.

**Operating profile for Chinese and other open-weight hosts (DeepSeek, Kimi, Qwen, GLM, MiniMax):** use the [operating card](operating-card.md), not the full SKILL.md, as the first read. It exists because these runs usually fail by skipping steps, inventing tool names, or claiming a visual pass without seeing pixels, not because of the model's origin. Take model IDs, context limits and image support from the actual runtime (never from this file or a model card), and treat any vision claim as untested until one screenshot was really interpreted. Tool-name wildcards in `agents/frontend-craft/*.md` follow Claude Code's format; OpenCode and other hosts need their own agent format (not converted here).

Model cards contain author claims; no cross-model frontend benchmark was run while creating this skill. Do not copy benchmark numbers across different harnesses/protocols or use popularity as a quality ranking.

Before selecting a candidate:

1. Inspect the actual provider/runtime model ID, license, context/output limits, tool parser and image-input support.
2. Confirm cost, hardware/quantization and privacy requirements. Open weights do not make hosting or compute free.
3. Use the runtime's documented chat template/tool format. Do not assume “OpenAI-compatible” means every tool/image feature works.
4. Try one bounded tool-call round trip and one screenshot-understanding check if vision is claimed.
5. Complete one representative slice with the same acceptance checks as any other model.

Use current model/runtime docs for deployment details. Never set an invented `tools: true` or image capability merely to make a client offer a feature. Do not hardcode one temperature/context size across all models or silently change global settings.

During the source investigation, the local `ollama` executable existed but its service was not reachable. No weights were downloaded, no Chinese model was executed and no paid endpoint was called. Treat later successful tests as new evidence, not as something already established by this package.

## 5. Small-context execution

Large prompts do not substitute for judgment. Help a constrained model by reducing degrees of freedom at the right stage:

- Read the core skill and only the relevant specialist/reference; do not concatenate every frontend skill.
- The user can supply only the subject and goal. The agent derives a concrete proposal, reference-transfer notes, token roles and component contracts from that brief; do not push those design decisions back into a required long user prompt.
- Work one representative vertical slice at a time. Preserve explicit decisions across slices in the project's existing design record.
- Search first and read the named files; do not dump an entire repository or skill catalog into context.
- Keep a compact checkpoint: current gate, decisions, changed files, failing checks, inspected screenshots and next action.
- After a failure, isolate it and change one cause. Do not let repeated tool errors turn into speculative success claims.
- Use compiler/tests/browser evidence to constrain corrections. Do not ask the model to self-score its own aesthetics as the only evaluator.

Suggested checkpoint—not a mandatory new file:

```text
Gate / scope:
Preserved identity and behavior:
Chosen director + current specialists:
Evidence acquired:
Current concrete failure or uncertainty:
Next bounded action:
```

## 6. Evaluation without pretending

Use [evaluation cases](../assets/evaluation-cases.json) for instruction-following smoke tests. They test process decisions, not whether a real UI looks good.

For an actual model comparison, hold brief, repository revision, tools, data, references, permitted iterations and viewport/device constant. Save actual outputs/checks/screenshots and evaluation criteria. Report:

- Tool-call reliability and scope preservation.
- Task and recovery correctness.
- Specific accessibility/quality checks.
- Visual coherence judged from actual renders, preferably with human assessment.
- Time/iteration cost under the stated conditions.

For practical reliability require no unresolved blocking defect in the selected task, honest evidence and a human acceptance review when aesthetics matter. Do not promise equal outcomes across model sizes, providers or tasks. If one model cannot inspect images, declare the asymmetric capability instead of pretending the comparison is fair.

## 7. Reading is not application

Focused scoping review, checked 2026-10-31; four primary studies, not systematic or exhaustive. Access/retrieval, choosing the right procedure, loading it and applying it are different failure points. Tool traces establish observable reads/actions, not internal attention or comprehension. A long context window, an emphatic MUST, a hash, a quotation or a self-reported checklist is not a compliance guarantee.

### Evidence, including counterevidence

- **[SkillsBench, arXiv:2602.12670v4](https://arxiv.org/html/2602.12670v4), Table 2 and §5:** curated skills improved mean task-macro success from 33.9% to 50.5% across 87 terminal tasks and 18 model–harness configurations. Skills can help, but invocation did not ensure success and some task/configuration results worsened. Skill-count/length comparisons favored focused bundles in this sample; those grouped comparisons do not isolate a causal optimum, and the comprehensive bucket had only five tasks. No universal token ceiling or “three skills guarantees success” follows.
- **[Skill Retrieval Augmentation, arXiv:2604.24594v3](https://arxiv.org/html/2604.24594v3), §4.2, §5.2 and §5.4–5.6; [published DOI](https://doi.org/10.18653/2026.findings-emnlp.1955):** retrieval, loading and task success can diverge. Distractor skills harmed results; progressive disclosure was not the strongest method on every task/model. Conditional loading is a context-management strategy, not a proven universal winner.
- **[HANDBOOK.md, arXiv:2607.25398v3](https://arxiv.org/html/2607.25398v3), §3 and §6:** long-policy agent tasks exposed skipped checks, checks whose results were ignored, and unsupported final compliance claims. Reading or even correctly recognizing a rule can precede a violating action. Its 65 simulated enterprise tasks and specific harness are not a frontend aesthetic benchmark.
- **[Lost in the Middle](https://doi.org/10.1162/tacl_a_00638), §2–§5:** controlled QA/retrieval experiments found position/length sensitivity in the evaluated historical models. Repeating a query helped synthetic retrieval more than multi-document QA. This is not evidence that repeating every skill instruction fixes current coding agents or reveals their attention weights.

The specialist review read the four primary full texts; source locations and access limits were recorded in the research artifact. Main-session checks additionally inspected SkillsBench v4 aggregate text and HANDBOOK v3 failure cases. Semantic Scholar returned HTTP 429. A bounded one-hop OpenAlex expansion of the historical seed sampled three references and three recent citing works, not the whole graph; these did not add directly eligible skill-adherence experiments. No Scopus/WoS coverage or independent replication is claimed. Official [Claude Code skill documentation](https://code.claude.com/docs/en/skills) describes loading/progressive disclosure; it is product documentation, not experimental proof.

### Practical contract, not a new ceremony

1. Keep the primary core available; read relevant procedures just before their stage rather than injecting every guide and example. Read the complete relevant source section, not only its title or a remembered summary. Report inaccessible sections honestly.
2. Preserve a compact requirement → actual decision/artifact → observed check checkpoint in existing context/notes. Recover it after interruptions or compaction. Do not ask the user for a longer prompt to compensate for missing agent judgment.
3. Verify positive and negative requirements against real outputs/actions: candidate comparison, rendered first slice, observed state transitions, test results and absence of unauthorized side effects. A generated evidence note alone cannot prove its claims.
4. If a stop condition occurs—quota, unavailable tool, unverified rights, failed output—preserve it and use only the authorized fallback. A compliance paragraph must not erase the blocker.
5. Host-executed checks can enforce observable constraints only when actually configured and run. Do not silently install hooks or edit global instructions/settings. Even an enforced build/read check cannot certify aesthetic judgment or semantic understanding.

These are source-informed design choices, **not measured improvements to frontend-craft**. To establish improvement, use matched briefs/repository/tools/model versions with and without the change, include negative cases and accumulated-context conditions, measure behavioral fidelity and time separately, and assess actual renders blind with a human when possible. Do not compare percentages from the four incompatible benchmarks or substitute a self-score for that evaluation.
