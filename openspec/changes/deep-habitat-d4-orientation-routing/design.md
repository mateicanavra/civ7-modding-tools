# Design: D4 Classify Orientation And Routing

## Frame

D4 owns the `habitat classify` command result. The result is a command-facing
classification contract for repo paths and diffs, not a second graph model, rule
registry, enforcement engine, generator, or authoring topology. Current Habitat
code is present-behavior evidence. The D4 source packet is controlling input,
and this OpenSpec packet is the execution-ready design/specification layer.

D4 is accepted only when it removes the current optional-heavy classify state
space from the implementation plan. The executor must not decide later whether
malformed diffs are successful empty diffs, whether workspace paths and
unresolved owners are the same thing, whether graph refusals throw or serialize,
or whether rule routing can still parse prose `scope`.

## Solution Frame

- Frame: `habitat classify` should answer "what does this path or diff mean
  for repo maintenance?" without overclaiming execution, safety, or authoring
  support.
- Aspiration threshold: a future TypeScript implementation can introduce a
  closed discriminated union, migrate consumers through compatibility facades
  when D0 requires them, and delete invalid optional combinations without
  reopening domain decisions.
- Constraint reality: D4 may consume D0/D1/D2/D3 accepted design/specification
  state now, but source implementation remains blocked behind concrete D0 rows,
  live D2 rule-routing projections, and live D3 graph facts.

## Domain Boundary

D4 owns:

- the top-level classify result state;
- command-facing path and diff classification composition;
- refusal reason and recovery instruction wording for classify states;
- classify non-claims;
- presentation of D2 rule-routing projections and D3 graph facts as guidance;
- the D14 classify example handoff.

D4 does not own:

- D0 compatibility actions or public-surface row completeness;
- D1 command outcome, refusal, recovery, or non-claim vocabulary;
- D2 rule registry identity, `PathCoverage`, `ruleRoutingFacts`, malformed rule
  metadata, or legacy `scope` compatibility;
- D3 project identity, graph read status, target availability, alias validity,
  dependency resolution, aggregate/workspace target truth, or `GraphRefusal`;
- D7 structural enforcement;
- D13 scaffolding/generator behavior;
- D14 authoring topology fence semantics.

## Target Ontology

D4 target language uses standard engineering terms first. Habitat-specific
phrases are kept only where they name a real Habitat invariant.

| Term | Decision |
| --- | --- |
| `ClassifyResult` | Target top-level versioned DTO returned by `habitat classify`. It has exactly one `state`. |
| `PathClassification` | Target path-level classification. It may be project-owned, workspace-owned, unresolved, graph-blocked, or unsupported. |
| `DiffClassification` | Target diff state when the diff has one or more classified changed paths. Existing public `DiffClassification` remains D0-controlled compatibility surface until source implementation. |
| `RuleRouting` | D4's command-facing view of D2 `ruleRoutingFacts`; D4 may render it but may not create route truth. |
| `TargetGuidance` | D4's command-facing view of D3 available/unavailable/aggregate target facts. It is guidance, not execution. |
| `RecoveryInstruction` | Bounded next step for malformed, unresolved, graph-refusal, or unsupported states. |
| `NonClaim` | Output statement of what classify did not do or establish. |

Forbidden target language:

- `proof` and `evidence` are compatibility terms only for legacy output fields;
  D4 target code should use result, fact, guidance, diagnostic, refusal,
  recovery instruction, command outcome, receipt, and non-claim terminology.
- `supported actions` is too broad. Use `runnableTargets`,
  `unavailableTargets`, `recoveryInstructions`, and `nonClaims`.
- `next safe commands` is too strong for classify. Use graph-backed target
  guidance plus non-claims.
- `scope` is compatibility prose only; D4 target routing consumes D2
  `ruleRoutingFacts`.

## Classify Result State Model

D4 defines a closed `ClassifyResult` state model:

| State | Selected when | Required fields | Forbidden fields | Authority |
| --- | --- | --- | --- | --- |
| `project-path` | One path resolves to a D3 project owner. | `schemaVersion`, `state`, `input`, `path`, `owner.project`, `owner.projectRoot`, `owner.tags`, `ruleRouting`, `runnableTargets`, `unavailableTargets`, `recoveryInstructions`, `nonClaims`. | top-level `paths`, graph-refusal payload, workspace-owner note, unsupported-path reason. | D4 composes; D2 owns `ruleRouting`; D3 owns owner/target facts. |
| `workspace-path` | One path is an intentional workspace-level path or workspace gate. | `schemaVersion`, `state`, `input`, `path`, `workspaceOwner`, workspace rule routing, workspace/aggregate target guidance when D3-backed, `recoveryInstructions`, `nonClaims`. | project owner/root/tags, project-local targets, unavailable project targets, diff path array. | D4 composes; D2/D3 facts only. |
| `diff` | Input is a valid diff with at least one classified changed path. | `schemaVersion`, `state`, `input`, ordered non-empty `paths`, aggregate `nonClaims`. | direct single-path owner fields, wrapper-level runnable targets, empty `paths`. | D4 owns aggregation; child paths use path states. |
| `malformed-or-pathless-diff` | Input is diff-like or `.diff`/`.patch` content but yields no classifiable changed path. | `schemaVersion`, `state`, `input`, stable refusal reason, `recoveryInstructions`, `nonClaims`. | `paths`, project owner/root/tags, runnable targets, unavailable project targets. | D4 owns refusal shape, using D1 vocabulary. |
| `unresolved-owner` | A path is in the repo context but cannot be mapped to a supported project or intentional workspace owner. | `schemaVersion`, `state`, `input`, `path`, unresolved reason, `recoveryInstructions`, `nonClaims`. | project owner/root/tags, project-local runnable targets, rule routing that requires owner certainty. | D4 owns state; D3 owns project facts. |
| `graph-refusal` | D3 graph refusal state prevents project/target guidance. | `schemaVersion`, `state`, `input`, D3 graph refusal category, `recoveryInstructions`, `nonClaims`. | graph-backed runnable targets, inferred unavailable targets, project owner/root/tags unless supplied by D3 before the refusal boundary. | D3 owns graph category and reason values; D4 renders. |

`unsupported-path` may appear as a path-level refusal classification only when
the implementation must distinguish unsupported input from unresolved ownership.
If introduced, it uses the same refusal/recovery/non-claim rules and must be
D0-cited before becoming public JSON.

## Forbidden Field Combinations

The target TypeScript model must make these combinations impossible or confine
them to an explicitly D0-cited legacy facade:

- `project: null` with `projectRoot`, `tags`, project-owned `targets`,
  `unavailableTargets`, `rulesInScope`, or `scopedRules`.
- project owner without `projectRoot` and tags.
- project owner with workspace-only note text.
- `requiredTargets` or runnable targets on malformed/pathless diff,
  unresolved-owner, graph-refusal, or unsupported-path states.
- `diff` with `paths: []` treated as successful orientation.
- wrapper-level diff owner, tags, rule list, or target list.
- unavailable target reported beside a runnable command for the same
  project/target.
- graph metadata failure represented by thrown exception or workspace fallback.
- rule routing derived from raw `scope` prose.
- open `note?: string` as a semantic routing/refusal channel.
- `rulesInScope` diverging from the target rule-routing projection.

## Public Surface Compatibility

D4 design may name target contracts with placeholder D0 citations. Source
implementation must stop until the concrete D0 matrix rows exist and are cited.

| Surface | Plane | Required D0 row before source edits | Target handling |
| --- | --- | --- | --- |
| `habitat classify` command invocation | command | `blocked-pending-d0-row` | Preserve verb/argument unless D0 records a public command change. |
| `habitat classify` path JSON | command-json | `blocked-pending-d0-row` | Version to `ClassifyResult` or facade legacy `Classification`; no silent shape change. |
| `habitat classify` diff JSON | command-json | `blocked-pending-d0-row` | Version to `diff` state or facade legacy `DiffClassification`; no successful empty malformed diff. |
| `habitat classify` human output | human-output | `blocked-pending-d0-row` | If JSON-only remains current behavior, state that; human guidance must not claim more than JSON. |
| `Classification` export | package-export | `blocked-pending-d0-row` | Changes must cite D0 rows and keep the compatibility shape explicit through facade, deprecation, or versioning. |
| `DiffClassification` export | package-export | `blocked-pending-d0-row` | Changes must cite D0 rows and keep the compatibility shape explicit through facade, deprecation, or versioning. |
| `ClassifiedTarget`, `UnavailableClassifiedTarget`, `ScopedRule`, `RuleScopeKind` exports | package-export | `blocked-pending-d0-row` | Preserve as supporting compatibility types unless D0 and owning packets version them. |
| `classifyPath`, `classifyTarget` exports | package-export | `blocked-pending-d0-row` | Preserve or facade public functions; target model may live behind new internal module first. |
| Classify docs/examples | docs-example | `blocked-pending-d0-row` | Document-only update after behavior and public rows are aligned. |
| Generated help/manifests, if affected | generated | `blocked-pending-d0-row` | Generated-only; regenerate from source, never hand-edit generated output. |

Allowed D0 compatibility actions remain only: `preserve`, `version`, `facade`,
`deprecate`, `refuse`, `document-only`, and `generated-only`.

## D2 And D3 Consumption Rules

D4 consumes D2 `ruleRoutingFacts`; it must not receive whole rule registry
records as routing authority. D4 may render routing facts, unresolved routing
metadata, and rule identifiers. D4 may not parse raw `scope`, infer rule
coverage from prose, or make malformed registry metadata look like a normal
absence of rules.

D4 consumes D3 project ownership, target availability, unavailable targets,
aggregate/workspace targets, and `GraphRefusal`. D4 may render those facts as
target guidance, unavailable target rows, graph-refusal states, and recovery
instructions. D4 may not infer owner roots, target existence, alias validity,
dependency resolution, graph read status, or workspace aggregate targets
locally.

## Write Set And Protected Paths

The D4 OpenSpec repair write set is `$D4_CHANGE/**`, `$D4_REVIEW_LEDGER`,
`$D4_PHASE_RECORD`, `$D4_DOWNSTREAM_LEDGER`, `$D4_CLOSURE_CHECKLIST`,
`$REMEDIATION_DIR/context.md`, `$REMEDIATION_DIR/packet-index.md`, and D4
scratch review records under `$AGENT_SCRATCH`.

Later source implementation may edit only after D4 acceptance and prerequisites:

| Area | Allowed purpose |
| --- | --- |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | Preserve/facade current classify entrypoints and route to target classification model. |
| `$HABITAT_TOOL/src/lib/classify-result.ts` or equivalent new module | Define target `ClassifyResult` union and typed projections. |
| `$HABITAT_TOOL/src/commands/classify.ts` | Render command JSON/human output and exit status according to D0/D1. |
| `$HABITAT_TOOL/src/index.ts` | Add/facade public exports only with D0 rows. |
| `$HABITAT_TOOL/test/lib/classify.test.ts` and focused classify fixtures | Cover every D4 state and forbidden combination. |
| `$HABITAT_TOOL/test/commands/habitat-commands.test.ts` | Cover command adapter output/status behavior. |
| `$HABITAT_TOOL/docs/SCENARIOS.md`, `$HABITAT_TOOL/docs/CAPABILITIES.md` | Update examples only after D0 docs rows and source behavior exist. |

Protected paths:

- D2 registry schema/source ownership except consuming implemented projections.
- D3 workspace graph modules except consuming implemented graph facts.
- D7 structural enforcement behavior.
- D13 scaffolding/generator behavior.
- D14 topology fence implementation, except D14 downstream metadata if needed.
- generated output, lockfiles, unrelated Civ/MapGen product domains, and other
  OpenSpec packets except packet-index/downstream metadata updates.

## TypeScript Refactor Strategy

D4 implementation must follow state-space collapse before rearrangement:

1. Characterize current path, workspace, diff, malformed/pathless diff,
   unavailable target, unresolved routing, and graph-refusal behavior.
2. Introduce the target `ClassifyResult` discriminated union and exhaustiveness
   checks without replacing public exports.
3. Add D0-required legacy facades/adapters from the target union to current
   `Classification`/`DiffClassification` surfaces when preservation is required.
4. Migrate command adapter, tests, docs examples, and public consumers through
   exhaustive `state` switches or typed projection helpers.
5. Delete or deprecate invalid optionals, raw prose routing, and open note
   channels after all consumers use the target model or compatibility facade.
6. Validate after each logical move; keep Graphite layers small and reviewable.

## D14 Example Handoff

D4 must hand D14 an example corpus with:

- `project-path`;
- `workspace-path`;
- `diff` with multiple classified paths;
- `malformed-or-pathless-diff`;
- `unresolved-owner`;
- `graph-refusal`;
- unavailable target guidance;
- D2 unresolved routing metadata;
- authoring-looking path/request that classify can orient but does not support
  as authoring topology.

Each example must include state name, owner/routing/target facts where present,
recovery instruction, human-output obligation, and non-claims. D14 may use the
examples only to fence authoring requests and show that classify orientation is
not generator support, MapGen authoring support, rule correctness, target
freshness, or verify closure.

## Non-Goals

- No new generator support.
- No structural enforcement pipeline rewrite.
- No Civ-specific routing authority.
- No Pattern Authority, baseline, diagnostic catalog, or topology-fence
  semantics. D4 may surface those only as non-owned/unresolved facts until D5,
  D6, D8, and D14 own their packets.

## Structural Alternative Rejected

The rejected alternative is to keep the current optional-heavy `Classification`
shape and add more prose or a shallow `kind?: string`. That preserves the exact
state-space smell D4 exists to remove: a single object that can represent
project path, workspace fallback, diff, unresolved owner, unavailable target,
and graph failure in invalid combinations. D4 requires a closed state model,
owned field rules, D0 compatibility rows, and D2/D3 projection boundaries.
