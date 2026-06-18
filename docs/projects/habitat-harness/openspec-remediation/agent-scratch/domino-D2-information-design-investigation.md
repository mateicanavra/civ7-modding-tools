# D2 Rule Registry Metadata Contract Information-Design Investigation

## Objective

Review the D2 Rule Registry Metadata Contract packet as a fresh information-design reviewer. The review asks whether the OpenSpec artifacts present the right information in the right location for a later implementation agent to refactor without guessing.

Verdict: not acceptable for design/specification acceptance.

D2 is a high-fanout authority packet. It enables D3, D4, D5, D6, D7, D8, D10, and D13, but the current OpenSpec scaffold does not define the registry schema, facet states, projection matrix, term disposition, D0/D1 compatibility dependencies, validation oracles, or downstream handoff rows with enough precision. An implementation agent would still have to infer sequencing, ownership, compatibility, validation, and terminology from scattered prose plus current code evidence. That triggers the stop condition.

## Sources Read

- Required skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`
- Repo-local workstream skills and references:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/review-and-realignment.md`
- Repo and project authority:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/FRAME.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/dra-takeover-frame.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/README.md`
- D2 source and OpenSpec artifacts:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/downstream-realignment-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/closure-checklist.md`
- Accepted comparison artifacts:
  - D0 OpenSpec packet under `/openspec/changes/deep-habitat-d0-command-surface-inventory/**`
  - D0 final acceptance review at `/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md`
  - D1 OpenSpec packet under `/openspec/changes/deep-habitat-d1-receipt-contract-boundary/**`
  - D1 final information-design and cross-domino reviews plus D1 review disposition ledger
- Current code and tests as evidence only:
  - `tools/habitat-harness/src/rules/rules.json`
  - `tools/habitat-harness/src/rules/architecture.ts`
  - `tools/habitat-harness/src/plugin.js`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/src/lib/baseline.ts`
  - `tools/habitat-harness/src/lib/generated-zones.ts`
  - `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat-harness/test/lib/classify.test.ts`
  - `tools/habitat-harness/test/lib/rule-selection.test.ts`
  - `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
- Downstream lookahead:
  - D3, D4, D5, D6, D7, D8, D10, D13, and G-HOST OpenSpec scaffolds by D2 references.

## Artifact-Structure Findings

The D2 source packet is stronger than the D2 OpenSpec scaffold. The source packet names minimal facets, consumer projections, rejected alternatives, proof classes, injected bad cases, and stop conditions. The OpenSpec scaffold compresses those into broad statements such as "Define typed rule metadata facets and consumer projections" and "Add malformed-metadata refusal states." That is not information design; it is an instruction to do the design later.

D0 and D1 show the accepted pattern. D0 puts row schema, stable ID rules, closed state/action vocabularies, typed relationships, write/protected sets, and completeness checks in the packet itself. D1 puts target objects, term disposition, execution inventory shape, state families, relationship ontology, validation-result recording shape, and downstream owner map directly in the artifacts. D2 currently lacks the equivalent self-contained control layer.

The current D2 reading order also hides the important decisions. A reader sees proposal summary, design frame, a two-scenario spec, and generic tasks before seeing any inventory/projection contract. The source packet's actual decision material is not promoted into `design.md` or `spec.md`, so the implementation agent has to jump back to the source packet and code evidence to reconstruct the target contract.

The workstream files are phase-control shells rather than D2-specific control records. The phase record names validation commands but has no D2 projection inventory, no validation-result recording contract, no D0/D1 prerequisite row shape, and no downstream projection handoff. The downstream ledger has one generic "Later domino packets" row where D2 needs one row per enabled domino.

## Missing Decision Records

D2 must record these decisions before acceptance:

- Registry schema version and migration stance: whether D2 adds an explicit schema version to `rules.json`, where it lives, and how current unversioned rows are interpreted.
- Field disposition: which current fields are target metadata, compatibility facts, human output, execution-only, derived, or deprecated.
- Facet state model: required and forbidden fields per `ownerTool`, `lane`, and consumer, including exact malformed states.
- Projection boundary: exact projection names, fields, consumers, forbidden fields, and refusal conditions.
- Whole-row ban: where whole `HarnessRule` import/pass-through is still allowed, if anywhere, and why that is smaller than projections.
- Owner-root authority: whether `plugin.js` `OWNER_ROOTS` moves to graph facet, workspace graph metadata, or a D3-owned source, and how D2/D3 split truth.
- Target alias policy: whether `nxTarget`, hard-coded aliases, and `habitat:rule:<id>` are D2 graph facets, D3 graph decisions, or compatibility-only inputs.
- Routing/scope authority: target shape replacing prose `scope`, including exact path globs, project-owner fallback, workspace-gate marking, unresolved-metadata behavior, and no-prose-scrape rule.
- Baseline relation: how a rule declares baseline state, baseline file, external exception source, and rule-introduction manifest relation without D5 owning the registry.
- Grit relation: how `gritPattern`, scan roots, `manifestPath`, hook scope, and Pattern Authority reference are represented without D2 owning diagnostic acquisition or governance admission.
- Generated-zone relation: how `generatedZone` links to host declaration/protected-zone authority without D2 owning D10 policy.
- Governance relation: what D2 may say about Pattern Authority lifecycle/status versus what D8 owns.
- D0 compatibility dependency: which CLI JSON, human output, package export, Nx target metadata, generator, hook, and docs-example rows D2 touches.
- D1 command outcome dependency: whether malformed metadata appears as a check report diagnostic, selector failure, refusal record, command outcome, or downstream D1-constrained record.
- Validation recording: where actual D2 implementation validation results will be recorded.

## Table And Schema Recommendations

Add a `Registry Field Inventory` table in `design.md`.

| Column | Purpose |
| --- | --- |
| `current_field` | Current `rules.json` key or current code table. |
| `current_consumer` | Existing consumer such as CLI execution, classify, plugin graph, baseline, generated-zone guard, Pattern Authority, hook, generator. |
| `current_problem` | Prose authority, duplicate authority, optional-field invalid state, whole-row leakage, or compatibility exposure. |
| `target_facet` | Identity, selector, routing, graph, baseline, grit, generated-zone, governance, command-output, human-prose, or execution. |
| `target_status` | target-retained, target-renamed, compatibility-only, derived, deprecated, D3/D5/D8/D10-owned, or removed. |
| `required_when` | Exact owner tool/lane/consumer condition. |
| `forbidden_when` | Invalid combinations such as `ownerTool: grit-check` without `gritPattern` or generated-zone fields on non-file-layer rules. |
| `d0_surface_row` | Concrete D0 `surface_id` when public/durable, or `blocked-pending-d0-row` before implementation. |
| `owner` | Single authority for semantics. |
| `bad_case` | Malformed row that must fail before execution or silent disablement. |

Add a `Facet Contract` table in `design.md`.

| Facet | Owns | Required fields | Optional fields | Forbidden fields | Refusal if missing | Consumers |
| --- | --- | --- | --- | --- | --- | --- |
| Identity | Rule identity and stable owner identity | `id`, `ownerProject`, `ownerTool`, `lane` | none unless justified | prose-only identity | registry load fails or rule unavailable with diagnostic | all projections |
| Selector | `--owner`, `--rule`, `--tool` selection facts | selector ids and namespace facts | matched namespace facts | human prose | selector failure report | check/classify |
| Routing | path/project/workspace scope | structured globs or explicit owner/workspace route | unresolved metadata reason | prose `scope` authority | unresolved metadata before execution/routing | classify/D4 |
| Graph | declared rule-to-project/target metadata | owner project root source or D3 graph link, alias policy | dependency target | colon string parsing | target metadata unresolved | D3/plugin/classify |
| Baseline | declared relation to baseline authority | baseline state/ref or no-baseline state | introduction manifest ref | file-presence-only admission | baseline contract failure | D5/D7 |
| Grit | rule-to-pattern relation | `gritPattern`, scan root ref, manifest ref as needed | hook scope | pattern prose/frontmatter only | pattern metadata unresolved | D6/D8/hooks |
| Generated zone | rule-to-zone declaration | zone id and host declaration link | staged-only mode | code-only zone table | unknown-zone/protected-zone refusal | D10/D7/D13 |
| Governance | pattern lifecycle relation | Pattern Authority reference/status projection | baseline policy ref | registry admission by file presence | governance unresolved | D8/D13 |

Add a `Consumer Projection Matrix` in `design.md`.

| Projection | Consumer domains | Includes | Excludes | Required D0/D1 dependency | Required tests |
| --- | --- | --- | --- | --- | --- |
| `ruleSelectorFacts` | check, baseline expansion, classify selectors | selector namespace, known/matched ids, intersections | prose scope, detect commands | D0 command JSON rows if public output changes; D1 check report for failures | selector facts and wrong namespace tests |
| `ruleRoutingFacts` | classify, D4 routing | structured path scope, owner match, workspace gate, unresolved reason | human `scope` prose | D0 classify output rows; D1 refusal/diagnostic contract | classify no-prose-routing tests |
| `ruleGraphFacts` | D3, Nx plugin, classify targets | owner root source, target alias policy, dependency target | colon parsing, hard-coded owner roots outside declared owner | D0 Nx target metadata rows | `nx show project` metadata assertion |
| `ruleBaselineFacts` | D5, D7 | baseline state/ref, exception source, introduction manifest relation | baseline file presence alone | D1 check-report diagnostic if malformed | baseline contract tests |
| `ruleGritFacts` | D6, D8, hooks | pattern id, scan roots, manifest ref, hook scope | Pattern Authority lifecycle ownership | D1 local feedback if hook metadata malformed | Pattern Authority and staged roots tests |
| `ruleGeneratedZoneFacts` | D10, D7, D13 | generated zone id, host declaration link, mutation mode | generated-zone policy decision | D1 refusal/recovery record | unknown zone and staged mutation refusal tests |
| `ruleGovernanceFacts` | D8, D13 | manifest status projection and registry relation | pattern admission decision | D1 refusal/non-claim where command-facing | manifest mismatch/orphan tests |

Add a `Term Disposition` table in `design.md`.

Minimum terms: `ownerTool`, `ownerProject`, `lane`, `scope`, `nxTarget`, `gritPattern`, `manifestPath`, `generatedZone`, `hookScope`, `file-layer`, `wrapped-test`, `wrapped-script`, `Pattern Authority`, `baseline`, `detect`, `why`, `message`, `remediate`.

Columns: current term, target term, status, owning domain, consumers, D0 compatibility surface, forbidden interpretation.

Add a `Validation Results Recording Contract` to `workstream/phase-record.md`, following D1's pattern: gate id, command, expected status, actual status, evidence path or summary, cache/freshness observed, non-claims confirmed, blocker disposition.

## Ambiguity Hotspots

- `scope`: Current code mixes machine-readable glob strings and prose. D2 must decide which structured routing shape replaces it and when `unresolved-metadata` is required.
- `ownerTool`: It currently drives execution, projection, staged hook behavior, and plugin target aliasing. D2 must decide whether this remains a target discriminant or splits into execution tool, diagnostic source, and governance owner.
- `lane`: It currently means enforcement/advisory and is also used as a Pattern Authority lifecycle input. D2 must decide the target relation to governance lifecycle.
- `nxTarget`: Current plugin parses target strings and creates aliases. D2 must specify whether target dependency metadata is a graph facet or D3-owned graph truth.
- `OWNER_ROOTS`: Current `plugin.js` duplicates project-root truth outside the registry. D2 must specify whether registry declares roots, references resolved Nx metadata, or defers to D3.
- `generatedZone`: Current rule metadata points at a code table in `generated-zones.ts`. D2 must require a host declaration link but must not own D10 policy.
- `manifestPath`: Pattern Authority requires a canonical manifest path. D2 must define the rule-pack reference but not pattern lifecycle acceptance.
- `exceptionPath`: Baseline/external exception state currently lives in baseline code, not registry facets. D2 must define the registry relation without stealing D5 shrink-only authority.
- `detect`: Execution commands are part of current rule rows. D2 must decide whether execution stays in an execution facet, becomes consumer-private, or is excluded from non-execution projections.
- Malformed metadata: The packet says refuse or report unresolved metadata, but it does not say which output family reports it or which command stops before execution.

## Required Cross-Links

- D0: D2 must link every touched public/durable surface to D0 rows or state `blocked-pending-d0-row` for design-only status. Expected row classes include classify JSON/human output, check JSON selector/metadata failures, package exports for registry/projection types, Nx inferred target metadata, generator metadata, hook-scoped rule output, and docs examples that teach registry metadata.
- D1: D2 must consume D1 for malformed metadata output: check report diagnostic, refusal record, command outcome, local hook feedback, or recovery instruction. It must not invent a separate failure vocabulary.
- D3: D2 hands off only declared graph facts. D3 owns resolved Nx project metadata, target availability, and current graph truth.
- D4: D2 provides routing facts; D4 owns user-facing orientation and next-action guidance.
- D5: D2 provides baseline relation facts; D5 owns shrink-only baseline decisions, stale rows, and accidental expansion refusal.
- D6: D2 provides Grit/pattern references; D6 owns diagnostic acquisition and projection semantics.
- D7: D2 provides registry inputs; D7 owns check-pipeline aggregation and false-green prevention.
- D8: D2 provides Pattern Authority references/status projection; D8 owns lifecycle admission and governance decisions.
- G-HOST/D10: D2 provides generated-zone declaration links; G-HOST/D10 own host policy and protected-zone mutation/refusal.
- D13: D2 provides metadata required by scaffolding/refusal; D13 owns generator-facing product behavior.
- Packet index: D2 status and downstream dependency assumptions must not move from draft to accepted until each accepted P1/P2 finding is imported and repaired.

## P1 Blockers

### P1-1: D2 lacks an executable schema and projection contract

The current artifacts name "typed facets" and "consumer projections" but do not specify their row shape, closed states, required fields, forbidden fields, or projection contents. Current code evidence shows 51 rules, 16 observed registry fields, seven owner-tool categories, hard-coded owner roots in `plugin.js`, classifier heuristics in `command-engine.ts`, baseline state in `baseline.ts`, generated-zone state in `generated-zones.ts`, and Pattern Authority references in `manifest.ts`. Without a D2-owned inventory and projection matrix, implementers must decide the core domain model while coding.

Required repair: add the registry field inventory, facet contract, consumer projection matrix, term disposition, and malformed-state model to `design.md`; then mirror the normative pieces in `spec.md` and tasks.

### P1-2: D2 does not encode D0/D1 compatibility prerequisites

D2 can affect classify output, check JSON selector failures, package exports, Nx target metadata, hook-scoped rule behavior, pattern generator metadata, and docs examples. The packet says D0/D1 are required but does not list concrete D0 row classes or D1 failure-output contracts. That leaves public compatibility and malformed-metadata semantics to implementation.

Required repair: add a D0/D1 dependency inventory. Use `blocked-pending-d0-row` only for design/specification status, and state that source edits cannot start until concrete D0 rows exist. Name the D1 record family used for each malformed metadata class.

### P1-3: The spec delta is too thin to prevent partial or wrong implementation

The current spec has one requirement and two scenarios. An implementation could satisfy it while still passing whole rule rows to consumers, leaving `plugin.js` owner roots duplicated, using prose `scope` for some routes, leaving baseline/generator/governance interpretation in separate parsers, or silently skipping malformed metadata in non-routing consumers.

Required repair: split the spec into separate normative requirements for registry versioning, projection boundaries, no-prose routing, graph facts, baseline facts, Grit facts, generated-zone facts, governance facts, malformed metadata, and whole-row leakage.

## P2 Blockers

### P2-1: Validation gates do not falsify the D2 contract

The listed commands are mostly existing tests and shape checks. They do not require a field inventory, projection matrix test, malformed row per facet class, no-prose-routing assertion, target metadata assertion, or generated-zone/governance mismatch tests.

Required repair: add validation tasks and phase-record gates for malformed identity, routing, graph, baseline, Grit, generated-zone, and governance rows; projection tests per consumer; command compatibility checks; and `nx show project` assertions that target metadata comes from structured graph facts.

### P2-2: Downstream realignment is too generic for D2's fanout

The downstream ledger has a generic later-domino row. D2 needs one row per enabled domino with the projection consumed, status, repair trigger, and blocked/unblocked disposition. Otherwise downstream packet authors can reinterpret D2 facts independently.

Required repair: replace the generic row with D3, D4, D5, D6, D7, D8, D10, D13, and G-HOST rows where applicable.

### P2-3: Tasks are unresolved design work

Tasks 2.1 through 2.3 are broad outcomes, not executable steps. They do not name files, artifacts, projections, tests, sequence, or write/protected sets.

Required repair: after the projection matrix exists, rewrite tasks into ordered implementation steps: inventory/migration, schema loader, projection constructors, consumer migrations, malformed-state tests, D0/D1 compatibility checks, downstream updates, validation, and closure.

### P2-4: Workstream records lack D2-specific state contracts

The phase record and closure checklist do not include the D2 inventory/projection completion gates, actual validation result location, public-surface prerequisite state, or downstream row completion state.

Required repair: add D2-specific completion gates and result recording, mirroring the accepted D1 phase-record pattern.

## Concrete Repair Recommendations By Artifact

### Source Packet

Keep `D2-rule-registry-metadata-contract.md` as controlling input and provenance. Do not make implementation agents mine it for executable details. Promote its facet list, projection names, malformed-rule scenarios, proof classes, rejected alternative, and stop conditions into the OpenSpec artifacts.

### `proposal.md`

Repair the proposal so it accurately presents D2's scope and unresolved gates:

- Replace over-ready wording with "review-gated design packet" until P1/P2 repairs land.
- Add D0/D1 prerequisite summary with concrete row/contract classes.
- Add a compact projection summary: selector, routing, graph, baseline, Grit, generated-zone, governance.
- Add "What Does Not Change" bullets stating D2 does not own current Nx graph truth, baseline debt decisions, Pattern Authority admission, generated-zone mutation policy, hook behavior, diagnostic acquisition, scaffolding behavior, or rule execution.
- Add affected owner/forbidden-owner bullets for each adjacent domain.

### `design.md`

Make `design.md` the decision center. Add:

- Current diagnosis grounded in code evidence: `rules.json` fields/counts, `plugin.js` owner roots/aliases, classify prose-scope heuristics, baseline and generated-zone separate authorities, Pattern Authority rule references.
- Registry field inventory.
- Facet contract table.
- Consumer projection matrix.
- Term disposition table.
- D0/D1 dependency inventory.
- Write set and protected paths.
- Whole-row leakage policy.
- Malformed metadata state model.
- Rejected alternatives: "add optional fields to rules.json", "make D2 own all registry-adjacent truth", "let each consumer build its own projection".

### `specs/habitat-harness/spec.md`

Replace the two-scenario spec with multiple normative requirements. Minimum requirements:

- Registry schema is versioned and validates typed facets.
- Consumers receive projections, not whole rows, unless the packet names a justified exception.
- Routing facts do not parse human prose `scope`.
- Graph facts declare only rule graph metadata and do not replace resolved Nx metadata.
- Baseline facts link to D5-owned baseline authority without file-presence admission.
- Grit facts link rule, pattern, scan roots, hook scope, and manifest reference without owning D6/D8 decisions.
- Generated-zone facts link to host/protected-zone declarations without owning D10 policy.
- Governance facts expose Pattern Authority relation/status without admitting patterns.
- Malformed metadata refuses or reports through D1-constrained output before execution or silent disablement.

### `tasks.md`

Rewrite tasks after design repair:

- Grounding: read D0/D1 accepted packets, D2 source, projection matrix, and D2 downstream ledger.
- Prerequisite: fill/cite D0 rows and D1 malformed-output contracts.
- Inventory: classify every current field and consumer.
- Schema: implement versioned registry validation and facet discriminants.
- Projections: implement one projection at a time with tests.
- Consumers: migrate classify/routing, plugin graph facts, baseline, Grit, generated-zone, Pattern Authority, hooks/generator references only in approved order.
- Bad cases: add malformed row tests per facet.
- Validation: exact commands, expected status, cache/freshness stance, non-claims.
- Realignment: update downstream rows and packet index.

### `workstream/phase-record.md`

Add:

- D2 acceptance status with current verdict `not accepted`.
- D0/D1 prerequisite state.
- Approved write/protected set once designed.
- Validation Results Recording Contract.
- Inventory/projection completion checklist.
- Non-claims: OpenSpec validation does not prove projection completeness, implementation readiness, public compatibility, or downstream safety.

### `workstream/review-disposition-ledger.md`

Import this review's P1/P2 findings as blocking findings. Do not leave them only in scratch. Each accepted finding needs repair evidence pointing to exact D2 artifacts before the packet index can mark D2 accepted.

### `workstream/downstream-realignment-ledger.md`

Replace generic rows with per-domino rows:

- D3 consumes `ruleGraphFacts`.
- D4 consumes `ruleRoutingFacts`.
- D5 consumes `ruleBaselineFacts`.
- D6 consumes `ruleGritFacts` and diagnostic handoff metadata.
- D7 consumes selector/routing/baseline/generated-zone aggregate inputs.
- D8 consumes governance and Pattern Authority reference facts.
- D10 consumes generated-zone declaration facts plus G-HOST policy links.
- D13 consumes governance/scaffolding metadata and refusal prerequisites.
- G-HOST consumes only the host-policy boundary pieces it needs; if none, mark not applicable with rationale.

Each row should state blocked/unchanged/repair-required and the exact trigger.

### `workstream/closure-checklist.md`

Add D2-specific closure checks:

- Registry field inventory complete.
- Facet contract table complete.
- Projection matrix complete.
- Term disposition complete.
- D0/D1 dependency inventory complete.
- Spec has consumer-specific normative requirements.
- Tasks no longer contain unresolved design work.
- Downstream ledger has per-domino rows.
- Validation gates include malformed rows and projection tests.
- Review ledger has no accepted unresolved P1/P2 findings.

### Packet Index

Keep D2 as draft/blocking until the D2 review ledger imports and repairs the accepted P1/P2 findings. When repaired, update the D2 row to cite design/specification acceptance only, not implementation completion.

## Final Stop-Condition Check

D2 currently fails the zero-guess execution test. An implementation agent would have to infer:

- the schema shape and versioning model;
- which current fields are target metadata versus compatibility/prose/execution fields;
- which projections exist and what each includes;
- which consumer gets which refusal behavior;
- whether D0 rows and D1 command-output contracts are prerequisites;
- how D2 splits authority with D3, D5, D6, D8, D10, and D13;
- what exact tests prove no-prose-routing, no whole-row leakage, and malformed metadata refusal.

Therefore D2 is not acceptable until those decisions are repaired in the OpenSpec packet itself.

Skills used: domain-design, information-design, solution-design, system-design, civ7-open-spec-workstream, civ7-habitat-dra-workstream.
