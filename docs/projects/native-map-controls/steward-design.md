# Earth-Physics Steward Design

## Scope And Intent

Two reusable, stateless reviewers support physical-model decisions before
implementation. They recommend one bounded change or discriminator; they do
not operate Civ7, implement a simulation, or own acceptance. This scoped design
note adapts the scope, deliverables, and references sections of the repository's
[project template](../../_templates/project.md).

User intent, preserved verbatim and separately from model-fit choices:

> serve the most Earth-like physical process and approach that can then be put forth into the game

> avoid trying to precisely sculpt too many things and create too many proxies, unless those proxies are very well defined

> opportunities for simplification through your design process

The design implication is causal coherence at the represented scale, followed
by explicit game projection. It is not an instruction to reproduce Earth at
full resolution, reject every approximation, or increase simulation complexity.
A proxy earns its place through meaning, scale, ownership, limitations, and a
discriminating observation. Native acceptance and attractive screenshots are
separate from physical validity.

## Roles And Routing

| Agent | Decision it reviews | Excluded decision |
| --- | --- | --- |
| `earth-relief-climate-steward` | Whether relief, terrain classes, and climate responses describe a coherent landscape with the intended gameplay affordances | Basin outlet/storage algorithm or native API qualification |
| `earth-basin-drainage-steward` | Whether depression treatment, storage, outlets, and river routing have a defensible physical meaning | Whole-map relief styling, climate calibration, or native API qualification |

Use one role when one decision is in question. Use both for a proposal that
changes basin treatment and therefore relief or climate, with the same sealed
candidate, inputs, and evidence. Their overlap is consequence-checking, not
joint ownership: the basin reviewer assesses water/terrain causality; the
relief reviewer assesses the resulting landscape and gameplay coupling.
The parent adjudicates disagreements and owns tests, native qualification,
implementation, and durable decision updates. There is no standing review
committee or additional steward layer.

## Launch And Return

Supply one decision, desired outcome, candidate or alternatives, relevant
source paths, preserved constraints, scenario identity, and available evidence.
Identify coordinate convention, wrapping, cell support, horizontal/vertical
units, datum, temporal interpretation, and empirical quantities where known.
Unknown scale is admissible input, not a reason to guess meters or years.
Launch without conversation-history inheritance; restate necessary intent and
link the controlling accepted decision. If the runtime exposes an empty-history
spawn option, use it rather than copying a long parent session.

Both agents return the same bounded contract: verdict, up to three findings,
one strongest counter-hypothesis and discriminator, one simplification, and the
smallest next proof. Each material finding names physical meaning, affected
owner, evidence class, and citations. `INSUFFICIENT` identifies exactly which
missing fact could change the decision, while preserving supported conclusions.
It does not open an unbounded research loop or ask permission to read sources.

The retrieval budget is fourteen relevant repository files and three external
primary sources, unless the launch explicitly changes it. A decisive answer
ends retrieval early. No edits, generated artifacts, builds/tests, Git changes,
UI actions, game/controller calls, or nested agents belong to these reviewers.
Public research is read-only; material scientific claims require primary
sources with the claimed regime and resolution, not analogy alone.

## Durable Authority

Agent prompts name these repository sources directly, so they survive session
loss without depending on a memory store or temporary diagnostic directory:

- [Truth versus projection](../../system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md)
  governs authored truth and downstream realization.
- [ADR-008: Hydrology owns canonical drainage routing](../../system/ADR.md#adr-008-hydrology-owns-canonical-drainage-routing)
  assigns water movement to Hydrology and terrain/earth-matter to Morphology.
  The full title disambiguates another ADR-008 in that file.
- [Morphology](../../system/libs/mapgen/reference/domains/MORPHOLOGY.md) and
  [Hydrology](../../system/libs/mapgen/reference/domains/HYDROLOGY.md) describe
  the owned products; their source anchors help detect documentation drift.
- [Benchmarks](../../system/libs/mapgen/benchmarks/BENCHMARKS.md) separates
  measurements, recipe targets, scenario identity, and generated/native proof.

Accepted workstream decisions may refine these contracts when explicitly
identified in the launch. Historical proposals, current implementation, and
passing tests do not independently authorize a physical claim. A conflict
between current sources is reported rather than silently resolved in favor of
the most convenient document. The current workstream's
[drainage reconciliation](drainage-reconciliation.md),
[climate](earthlike-climate.md), and [native river evidence](rivers.md) are useful
launch references, not frozen assumptions in reusable prompts.

## Dated Model-Fit Lens

Verified 2026-09-28. Local `codex --version` reports `0.154.0`. That identifies
the inspected CLI, not this session's model, a spawned agent's model, or the
desktop runtime version. Both agent files deliberately omit `model` and
`model_reasoning_effort`. They retain the caller/runtime selection rather than
pinning the older overrides found in existing repository stewards.

The official [subagent configuration documentation](https://developers.openai.com/codex/subagents/)
confirms standalone project TOML files and the required name, description, and
developer instructions. Model/effort can come from explicit spawn settings,
agent defaults, or the parent; file overrides take precedence. The new files
make no override. The documentation also warns that live parent permission
overrides can supersede an agent's sandbox default. Consequently `read-only`
is defense in depth, not a claim of complete tool isolation.

The official [current model guidance](https://developers.openai.com/api/docs/guides/latest-model)
describes GPT-6 Astra as more clarification-prone and detailed in its output,
and warns that verification can exceed a small task's scope. The separately
selected [GPT-5.5 guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.5)
emphasizes outcome-first instructions, literal constraint following, and clear
stopping conditions. These are documented family profiles, not a claim that
either family is the active runtime. The skill's older GPT-5.5 profile is not
silently promoted into a current-model identity or universal behavior law.

Design choice: a portable outcome contract, concise return shape, finite
retrieval, and permission to complete supported analysis without unnecessary
questions. Stop on a decisive recommendation; return a specific missing
discriminator when evidence remains inadequate. No prose attempts to set
effort or impersonate a model. Recheck these dated assumptions and evaluate a
representative task when the selected model or Codex configuration changes.

Tool posture follows the existing repository convention of
`sandbox_mode = "read-only"` and `[features] apps = false`, reinforced by an
explicit prohibition on external mutation. MCP server configuration remains
runtime-owned; the files do not pretend that a sandbox or an unverified empty
MCP table removes every inherited tool. Scientific web retrieval may use an
available read-only research tool. The reviewer may not use inherited tools to
operate external systems.

## Prompt-Design Review

Applied the RAWR HQ `cognition/prompt-design` skill, including its model-fit,
principles, sub-agent mode, Codex mechanics, and review-loop references.

| Lens | Design disposition |
| --- | --- |
| T1 deletion / T7 dilution | Keep physical interpretation, counter-hypothesis, simplification, and bounded handoff; omit motivational persona and repeated instructions. |
| T2 grain / T5 bounding | Finish authorized source review without unnecessary questions; bound retrieval and stop before implementation or broad research. |
| T3 absolutes | Reserve prohibitions for side effects and authority violations; choose scientific approximations by evidence, not categorical bans. |
| T4 scripts | Specify evidence and success conditions, not a fixed reading order or mandatory catalog of physical processes. |
| T6 levers | Model and effort remain unset in config; prose declares the job and return rather than runtime parameters. |
| SA routing / responsibility | Landscape-climate consequences and basin-water mechanisms have distinct triggers and explicit exclusions. |
| SA statelessness / return | Each prompt restates its boundaries and names durable authority; the final summary carries the decision evidence. |
| SA tools / model choice | Read-only default, apps disabled, explicit no-mutation rule, no model override or runtime-identity claim. |

Validation is TOML parsing, required-key/config checks, source-link existence,
and this lens review. It does not establish native agent discovery, actual
model selection, tool removal, or scientific decision quality. Independent
review and a representative invocation remain parent-owned; no separate
reviewer fanout or live agent activation is claimed here.

Independent review subsequently found no material role or prompt-boundary
defect. Its one source-currency finding was the Morphology reference's retired
`buildElevation` and meters language; those anchors now describe explicit
numeric projection and normalized model units. A representative read-only
relief review followed the new prompt via an existing reviewer: ALIGNED with
neutral measurements, with altitude-rank interpretation and display
exaggeration identified as counter-hypotheses. This tests the prompt's task
contract, not automatic discovery of the newly added TOML agent names.
