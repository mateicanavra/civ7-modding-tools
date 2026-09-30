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

## SDK Authoring Reviewer

`mapgen-sdk-simplicity-steward` reviews one sealed operation, rule, strategy, or
step delta against the existing MapGen SDK. Use it in the bounded design and
patch review loop for each substantive pipeline authoring change, grouped by
one meaningful domino rather than by file. It does not join physical-model
selection or require a separate pass for unchanged authoring. The parent supplies the candidate, intended
behavior, preservation obligations, accepted decisions, and existing proof,
then adjudicates findings and owns implementation and checks. Re-run after a
material candidate revision or a new cited SDK capability, and stop once the
supported findings are resolved or explicitly retained with evidence.

### Separate Intent Capture

User intent, preserved verbatim rather than converted into model-fit claims:

> ensure that we are not over-engineering when we define things like domain operations or rules or steps

> TypeScript typing issues and then just forcing that into the steps or the operations ... over-typing without actually understanding the much simpler architecture or approach that is already available through our little map generation SDK.

The review seeks a smaller supported authoring path, not a lower line count at
the expense of needed physical mechanisms, deterministic behavior, ownership,
or Habitat law. It may conclude that no simplification is justified.

### Why A Distinct Role

The existing `native-authority-reviewer` partially overlaps but reviews a custom
mechanism at a vendor/runtime boundary, including pinned-versus-stable vendor
capabilities. Extending it to every MapGen authoring delta would add that survey
to a local SDK question and blur its infrastructure trigger. The Earth stewards
review physical meaning, while the Civ7 system-model steward reviews container
and lifecycle ownership. None currently owns the narrow distinction between
unnecessary authoring scaffolding and legitimate private algorithm types.

The new role returns `ALIGNED`, `SIMPLIFY`, `AUTHORITY_REQUIRED`, or
`INSUFFICIENT`; at most three cited findings; preserved obligations and a
discriminating proof; and one bounded handoff. A simplification finding needs
both the candidate location and an actual supported SDK/policy alternative.
An authority conflict names conflicting sources and the required owner
decision; an unknown SDK capability produces a named missing discriminator,
not a proposed rewrite. The eighteen-file budget includes routers and tests.
No nested agents, test or build execution, output materialization, live Civ7,
or other mutation is admitted.

### SDK Evidence And Authority

- [Operation authoring](../../system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)
  separates inline admission envelopes from private algorithm `Params`/`Result`
  and smaller shared atoms. Similar structural shapes do not justify a second
  contract authority, nor replacement of private types with contract-derived
  aliases.
- [Step authoring](../../system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md)
  composes bound operation config rather than requiring copied step envelopes.
  Core's [createStrategy](../../../packages/mapgen-core/src/authoring/operation/strategy.ts)
  contextually types callbacks, and [createStep](../../../packages/mapgen-core/src/authoring/step/create.ts)
  derives config, injected ops, artifact/engine capabilities, and observations.
- [Module shape](../../system/libs/mapgen/policies/MODULE-SHAPE.md),
  [schema/admission law](../../system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md),
  and [truth versus projection](../../system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md)
  constrain any alternative. SDK source establishes capability, not new law.
- [Habitat authority](../../../.habitat/AUTHORITY.md) and the selected
  blueprint/rule govern structural qualification. The reviewer can consume a
  supplied resolution receipt and identify parent-owned Habitat proof, but
  cannot bypass law, copy shared packets, or promote historical blueprint
  residue into authority.

### Dated Fit And Registration

Verified 2026-09-30: local CLI is `0.159.0`; local configuration selects
`gpt-6.1-sol` with `low` effort, and the same-day provider model cache lists it
as the latest workhorse. These describe local defaults and availability, not
the model or effort actually selected for every parent/spawned session.
The agent omits both overrides, preserving caller/runtime selection.

The official [current model guide](https://developers.openai.com/api/docs/guides/latest-model)
supports GPT-6.1 Sol for complex coding. Its detailed behavioral advice is
explicitly Astra-derived and requires evaluation on the chosen workload;
Sol-specific persistence, literalism, and length behavior are not verified
here. The contract therefore bounds retrieval, requires a concise evidence
handoff, permits completing supported analysis without unnecessary questions,
and stops before execution. This is task design, not an invented Sol profile.
Recheck the fit assumptions when model selection changes.

The official [subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
confirms standalone `.codex/agents/*.toml` discovery with `name`, `description`,
and `developer_instructions`; no additional project config registry is needed.
The file follows existing read-only stewards with `sandbox_mode = "read-only"`
and `[features] apps = false`. Live parent permission overrides can supersede
sandbox defaults, so the explicit no-mutation instruction remains necessary.
Parsing and path validation do not establish live discovery or tool isolation.

### Prompt-Design Checks

Applied the same RAWR HQ prompt-design references as the physical reviewers,
including sub-agent mode, model-fit method, principles, mechanics, and review
loop. The bounded SDK read corroborated contextual inference and legitimate
private types against a real Pedology strategy/rule/step, not invented types.

| Lens | SDK Reviewer Disposition |
| --- | --- |
| T1 / T7 | Keep supported-alternative evidence and preservation; omit persona, slogans, and repetitive safety prose. |
| T2 / T5 | Finish a bounded read; stop on decisive evidence, no justified simplification, or eighteen files. Unknown Sol defaults remain quarantined above. |
| T3 | Prohibitions protect authority and side effects; simplification is conditional, not a blanket ban on types or wrappers. |
| T4 | State outcome, evidence, and stop rules rather than a fixed reading sequence or mandatory defect. |
| T6 | No prose runtime levers; no model/effort override. |
| SA1 / SA3 | Stateless launch inputs, durable sources, source citations, proof status, and explicit handoff. |
| SA2 / SA5 | Trigger is one MapGen authoring delta; physical science, vendor upgrades, Habitat design, and implementation are excluded. |
| SA4 / Model Fit | Read-only default plus no-mutation contract; inherit selection, re-evaluate fit on a model bump. |

Verification for this artifact is TOML/required-key validation, unique name and
matching filename, actual source-link existence, and the above self-critique.
Parent-owned independent prompt review and representative candidate review
remain necessary; no new agent activation or behavioral pass is claimed here.
The five prompt dimensions were also reviewed as separate sequential reads by
one read-only reviewer because the shared agent slots were occupied; this is
not five independent reviewers. The editor accepted its structure finding:
authority conflicts need an owner decision, not an invented simpler API.
Intent, model-fit, concision, and tone reads found no material defects.

The parent independently reviewed the final prompt, validated its standalone
TOML and unique registration, and corrected the triggering scope to cover each
substantive pipeline authoring domino rather than a per-file audit. A bounded
representative invocation through an existing agent followed the final prompt
on forest commit `cf2b305ef9` and the separate cutoff diagnostic delta. It
returned `ALIGNED`: contextual strategy inference and private rule vocabulary
already match the supported SDK; the cutoff observer belongs to test proof,
not physical recipe authority. No speculative SDK rewrite was requested. This
qualifies the prompt's review contract, not automatic discovery or tool
isolation of the new TOML role. Two stale domain-modeling examples were updated
to the existing direct module router and leaf `defineStrategy` contracts; no
authoring law or runtime behavior changed.
