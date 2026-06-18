# D4 Domain/Ontology Investigation

## Supervisor Vocabulary Correction

D3 owns this state family as `GraphRefusal` / `graph-refusal`. Any earlier scratch wording inherited from the source packet that used a D4-owned graph state name is superseded by the active D4 packet language: D4 consumes and renders D3 graph refusals, with D3-owned reason categories for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, and unresolved alias dependency.

## Verdict

D4 is not acceptable as an execution authority yet.

The current scaffold names the domain but does not commit to a usable ontology for
`habitat classify`. It still lets an implementation agent invent state names,
relationship meanings, compatibility behavior, and scenario coverage while
coding. That fails the D4 objective: orientation/routing must be a command-facing
contract assembled from D2 rule-routing projections and D3 graph facts, not
documentation backfill over the current optional-heavy classify shape.

The blocker is semantic, not OpenSpec syntax. The packet must define the exact
result states, ownership boundaries, accepted relationships, forbidden terms,
and refusal/recovery semantics before implementation starts.

## Sources Read

- Mandatory cognition skills:
  `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`,
  `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`,
  `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/SKILL.md`.
- Ontology references, all files under
  `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/`.
- Remediation routers:
  `$REMEDIATION_DIR/context.md`, `$REMEDIATION_DIR/packet-index.md`.
- D4 inputs:
  `$PHASE2_PACKET_DIR/D4-orientation-and-routing.md`,
  `$AGENT_SCRATCH/domino-D4-review.md`,
  `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md,workstream/*}`.
- Accepted upstream specs:
  `$OPENSPEC_CHANGES/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`,
  `$OPENSPEC_CHANGES/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`,
  `$OPENSPEC_CHANGES/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`.
- D3 design for graph-boundary vocabulary:
  `$OPENSPEC_CHANGES/deep-habitat-d3-workspace-graph-boundary/design.md`.

## Competency Questions D4 Must Answer

The D4 ontology earns its place only if the packet can answer these questions
without appealing to prose, current module placement, or executor judgment:

1. Given one repo path, what exact classify result state is returned?
2. Given one diff, which changed paths are classified, which are refused, and
   what result state owns the aggregate output?
3. When no owner can be resolved, what state is returned and which fields are
   prohibited?
4. When D3 graph facts are unavailable or refuse a target, how does classify
   surface that without creating runnable commands?
5. Which rule-routing facts came from D2, and which target facts came from D3?
6. What does the result authorize as a next command, and what does it explicitly
   not prove?
7. Which public JSON/human-output surface is being preserved, versioned, or
   refused through D0?

If the D4 packet cannot answer all seven with scenarios and field constraints,
it remains a design scaffold, not an execution authority.

## Target Ontology

### Accepted Entity and State Names

D4 should use standard engineering names for the command output and reserve
Habitat-specific terms for real Habitat invariants:

| Target term | Use | Identity / constraints | Owner |
| --- | --- | --- | --- |
| `ClassifyResult` | Top-level versioned DTO returned by `habitat classify`. Prefer this over `OrientationResult`; the command is classify and the output is a result. | Exactly one top-level `kind`; carries `schemaVersion`; compatibility disposition must cite D0 rows. | D4, with D0 compatibility control. |
| `PathClassification` | Result state for one input path. Prefer this over `PathOrientation`. | One path input; may be project-owned, workspace-owned, unsupported, or unresolved. | D4. |
| `DiffClassification` | Result state for diff input. This term already matches standard command behavior and current public language. | Contains ordered per-path classifications plus aggregate non-claims; malformed/pathless diff is not a successful empty diff. | D4, with D0 compatibility control. |
| `OwnerResolution` | Process/result of resolving a path to workspace/project/no owner. Keep only if constrained. | Values must be closed: `project-owner`, `workspace-owner`, `unresolved-owner`, `unsupported-path`; owner identity comes from D3 project facts, not local D4 tables. | D4 consumes D3 ownership facts. |
| `RuleRouting` | Rule applicability projection for classify. Prefer this over `RuleRoute` because it names a fact set, not an imperative route. | Must be derived from D2 `ruleRoutingFacts`; may not parse legacy `scope`. | D4 consumes D2; D2 owns projection schema. |
| `TargetGuidance` | Command-facing guidance over graph-backed targets. Accept only as guidance, not permission or execution. | Split into `runnableTargets`, `unavailableTargets`, and `recoveryInstructions`; runnable targets require D3 available/aggregate target facts. | D4 renders; D3 owns target truth. |
| `UnavailableTarget` | Command target known not to be runnable in current graph state. | No runnable command string; must include reason from D3 target state. | D4 renders; D3 owns reason vocabulary. |
| `GraphRefusal` | D3 graph refusal consumed by classify. | Closed reasons from D3: missing project, missing target, unresolved alias dependency, malformed graph JSON, Nx read failure, Nx daemon failure. | D3 owns; D4 renders classify state. |
| `MalformedDiff` | Diff-like or diff-declared input that cannot produce classified changed paths. | Stable refusal reason; no owner inference; no graph-backed target commands. | D4. |
| `RecoveryInstruction` | Bounded next step after refusal/unresolved state. | Must be actionable and non-executing unless backed by D3 graph target facts. | D4 text contract; D7/D12 may consume later. |
| `NonClaim` | Explicit statement of what classify did not prove. | Required on states where overclaim risk exists: targets not run, rules not proven correct, safety not applied, ownership not inferred. | D4; D0 controls public wording compatibility. |

### Result State Model

The packet should require one closed `ClassifyResult.kind` union:

- `project-path`: a path resolved to a D3 project owner.
- `workspace-path`: a path resolved to workspace-level ownership or a workspace
  gate without project-local ownership.
- `diff`: a valid diff with one or more classified changed paths.
- `malformed-diff`: diff-like input or diff mode with no classifiable changed
  path.
- `unresolved-owner`: a path or diff path is inside the repo context but no
  D3-backed owner can be resolved.
- `graph-refusal`: D3 graph facts are missing, unreadable, or refuse the target
  facts needed for guidance.
- `unsupported-path`: the input is outside supported Habitat scenarios.

The source packet's "workspace path, project path, diff with classified paths,
malformed/pathless diff, unresolved owner, graph refusal" is directionally right
but should be normalized to the terms above. `graph-refusal` is the current D3
state family, and D4 renders that family without renaming it or treating every
graph refusal as infrastructure unavailability.

### Accepted Semantic Commitments

- D4 owns command-facing classification state, result composition, human/JSON
  rendering requirements, refusal/recovery wording, and classify non-claims.
- A runnable target in D4 output means only: D3 reported an available project
  target or aggregate/workspace target, and D4 rendered it as guidance. It does
  not mean the target was run or will pass.
- An unavailable target means only: D3 reported a known current graph state that
  prevents runnable target guidance.
- Rule routing in D4 means only: D2 `ruleRoutingFacts` matched the classified
  path/state. D4 may filter/render routing, but may not create routing truth.
- `scope` is compatibility prose only. It is never D4 authority.
- A recovery instruction is a command-facing next step, not an enforcement
  result, scaffolding permission, or topology admission.
- Non-claims are part of the output contract, not explanatory appendix text.

### Forbidden Terms and Misleading Language

| Term / phrase | Disposition | Repair demand |
| --- | --- | --- |
| `OrientationResult` | Avoid unless the packet defines "orientation" as a Habitat-specific invariant. | Use `ClassifyResult`. |
| `PathOrientation` | Avoid; too abstract for command JSON. | Use `PathClassification`. |
| `DiffOrientation` | Avoid; current public behavior already says classify/diff. | Use `DiffClassification`. |
| `RuleRoute` | Avoid if it suggests D4 creates route truth. | Use `RuleRouting` or `RuleRoutingProjection`. |
| D4-owned graph state names | Avoid as top-level D4 inventions. | Consume D3 `GraphRefusal`; render as `graph-refusal`. |
| `supported actions` | Too broad; could imply generation, enforcement, or mutation. | Split into `runnableTargets`, `unavailableTargets`, and `recoveryInstructions`. |
| `next safe commands` | Too strong unless backed by graph facts and non-claims. | Use `target guidance` plus non-claims; reserve "safe" for D7/D10/D13 where safety is actually decided. |
| `proof`, `evidence`, `artifact` | Compatibility-only unless a packet explicitly owns a proof/receipt scenario. | Prefer result, receipt, diagnostic, target fact, command outcome, non-claim. |
| `scope` | Compatibility-only legacy prose. | Consume D2 path coverage/routing facts. |
| `graph refusal` | Under-specified; mixes read failure, missing target, and unresolved alias. | Use D3 `graph-refusal` reasons. |

## Owner Boundaries

### D4 Owns

- `habitat classify` result-state ontology and field constraints.
- Per-state output composition for path, diff, malformed diff, unresolved owner,
  graph refusal, unsupported path, and workspace/project classifications.
- Mapping D2 `ruleRoutingFacts` and D3 graph facts into classify-facing guidance.
- Refusal reason and recovery instruction wording for classify states.
- Non-claims in classify human and JSON output.
- D14 handoff example corpus for classify states, once D4 is repaired.

### D4 Does Not Own

- D2 rule registry schema, rule identity, adapter variants, `PathCoverage`,
  projection functions, malformed rule metadata taxonomy, or the fact that
  legacy `scope` is not authority.
- D3 Nx graph read status, project identity, owner roots, target availability,
  target dependency declarations, alias validity, aggregate/workspace target
  truth, or graph refusal reason vocabulary.
- D7 execution planning, rule execution, structural violation semantics,
  enforcement aggregation, or pass/fail claims.
- D13 scaffolding behavior, generator support, refusal implementation for
  scaffolding, protected-zone mutation policy, or authoring affordances.
- D14 topology admission/fence semantics. D4 only supplies classify examples
  D14 may cite.
- D0 compatibility decisions. D4 must cite D0 rows before changing public JSON,
  human output, package exports, or docs examples.

## Findings

### P1: D4 Lacks a Closed Command Result Ontology

The current spec has only "supported path" and "unsupported path" scenarios.
That does not constrain the source packet's real state space: project path,
workspace path, diff with classified paths, malformed/pathless diff, unresolved
owner, and graph refusal/refusal. It also does not name the top-level result type,
required fields, forbidden fields, or per-state non-claims.

Repair demand: add a normative `ClassifyResult` union to `design.md` and
`specs/habitat-harness/spec.md` with the closed states listed above. For each
state, define required fields, prohibited fields, source authority, recovery
instruction requirements, and non-claims. A `malformed-diff` result must be
distinguishable from a successful `diff` with no paths.

### P1: D4 Blurs D2/D3 Truth with D4 Rendering

The scaffold says classify reports "supported actions" and "command guidance
backed by current metadata," but it does not say which facts come from D2 and
which come from D3. That ambiguity invites D4 implementation to recreate route
truth from rule prose or target truth from local arrays.

Repair demand: state that D4 consumes only D2 `ruleRoutingFacts` for rule
applicability and only D3 project ownership, target availability, unavailable
target, aggregate/workspace target, and graph-refusal facts for target guidance.
D4 may render or combine those facts but may not infer owner roots, parse
`scope`, validate aliases, construct target truth, or downgrade graph refusals
into runnable commands.

### P1: Public Compatibility Is Named as a Gate but Not Bound to Surfaces

D4 changes the classify JSON/human contract, but the packet does not require
specific D0 `surface_id` citations before accepting its target shape. D0's
accepted spec says later packets stop if a changed public surface lacks a D0
row. The current D4 scaffold says compatibility decisions are needed but leaves
the actual rows and disposition outside the packet.

Repair demand: add a Public Surface Compatibility table for `habitat classify`
human output, `habitat classify --json` or equivalent JSON output,
`Classification`/`DiffClassification` exports if public, docs examples, and any
package export touched. Each row must cite or require a concrete D0 `surface_id`
and closed handling action: preserve, version, facade, deprecate, refuse,
document-only, or generated-only.

### P2: "Supported Actions" and "Next Safe Commands" Are Ontology Leaks

Those phrases are not operationally closed. In this repo they can be confused
with enforcement execution, generation/scaffolding, protected-zone mutation, or
authoring topology admission.

Repair demand: replace them with bounded field names:
`runnableTargets`, `unavailableTargets`, `recoveryInstructions`, and
`nonClaims`. If the packet keeps prose phrases for human output, it must define
their exact mapping to these fields and state that classify does not run
targets, prove rules correct, apply safety, generate files, or admit topology.

### P2: Malformed Diff, Unresolved Owner, and Graph Refusal Need Separate Recovery Semantics

The current scaffold collapses unsupported/refusal language into one scenario.
That is too coarse for an orientation command: malformed input, missing owner,
and graph refusal have different next steps and different prohibited claims.

Repair demand: add scenarios for malformed/pathless diff, unresolved owner,
graph-refusal due to unreadable graph, graph-refusal due to unavailable target,
and valid diff with one unclassifiable path. Each scenario must define whether
rule routing may appear, whether target guidance may appear, and what recovery
instruction is allowed.

### P2: D14 Dependency Is Not Scenario-Complete

D4 enables D14, but the downstream ledger only says later dominoes are pending.
D14 cannot safely build topology-fence examples unless D4 commits to the
classify states and example corpus it will hand off.

Repair demand: D4 must provide a compact example matrix for D14: project path,
workspace path, valid multi-path diff, malformed diff, unresolved owner,
graph-refusal, unsupported path, available target, and unavailable target. Each
example needs JSON state name, human-output obligation, and non-claim.

### P3: The Packet Should Stop Preserving Current DTO Names by Inertia

`Classification` and `DiffClassification` may be compatibility facts, but only
`DiffClassification` is obviously worth preserving as target language. A bare
`Classification` type is too generic for a public command result if D4 is
versioning the contract.

Repair demand: use `ClassifyResult` as the target name in the D4 design/spec.
Treat existing `Classification` and `DiffClassification` names as D0-controlled
compatibility surfaces unless D4 explicitly accepts one as target language.

### P3: Recovery Instruction Needs an Identity Rule

The current packet says "recovery guidance" but does not identify what makes two
instructions the same, versioned, or changed. That matters because docs,
handoffs, and D14 examples will cite these instructions.

Repair demand: define recovery instruction identity by `code`, `state`, and
`sourceAuthority`, with human text as renderable wording. This avoids treating a
wording tweak as a semantic change while still making behavior changes
reviewable.

## Compact Target Language Table

| Concept | Preferred D4 name | Avoid | Source authority |
| --- | --- | --- | --- |
| Top-level classify DTO | `ClassifyResult` | `OrientationResult`, generic `Classification` as target language | D4 + D0 compatibility |
| Single path state | `PathClassification` | `PathOrientation` | D4, consuming D3 owner facts |
| Diff state | `DiffClassification` | `DiffOrientation` | D4 + D0 compatibility |
| Owner decision | `OwnerResolution` | local owner-root lookup, "best guess owner" | D4 consumes D3 |
| Rule applicability | `RuleRouting` / `RuleRoutingProjection` | `RuleRoute`, `scope` | D2 |
| Runnable command guidance | `runnableTargets` | `supported actions`, "safe commands" | D4 renders D3 |
| Non-runnable target | `UnavailableTarget` | target with command string and warning | D3 fact rendered by D4 |
| Graph refusal | `GraphRefusal` / `graph-refusal` | D4-owned graph state names | D3 |
| Bad diff input | `MalformedDiff` / `malformed-diff` | successful empty diff | D4 |
| Next step after refusal | `RecoveryInstruction` | broad remediation/proof guidance | D4 |
| Explicit overclaim guard | `NonClaim` | buried prose note | D4 + D0 wording |

## Complete Contract Repair Shape

D4 can become acceptable only after the OpenSpec packet, not implementation
code, contains:

1. A closed `ClassifyResult` state model with field-level requirements and
   forbidden-field rules.
2. A source-authority map proving every D4 field comes from D4 itself, D2,
   D3, or D0 compatibility.
3. A D0 public-surface compatibility table with concrete required row citations.
4. Scenarios for project path, workspace path, valid diff, malformed diff,
   unresolved owner, graph refusal, unsupported path, available target, and
   unavailable target.
5. Explicit forbidden terms and compatibility-only language.
6. D14 handoff examples that downstream topology-fence work can cite without
   inventing classify behavior.

No TypeScript source changes were made or recommended as part of this review.

## Non-Claims

- This investigation does not accept D4.
- This investigation does not reopen D0, D2, or D3 acceptance; it uses their
  accepted specs as upstream commitments.
- This investigation does not claim current `habitat classify` behavior is
  wrong before D4 is repaired; it claims D4 must decide target behavior before
  implementation.
- This investigation does not authorize implementation, public DTO changes, or
  packet-file edits.

Skills used: domain-design, information-design, ontology-design.
