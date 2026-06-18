# D3 Information Design Investigation

## Scope

Framed objective: deep Habitat D3 information-design review before acceptance.

Packet reviewed:

- Source packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D3-workspace-graph-integration-boundary.md`
- OpenSpec change: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary`
- Negative control review: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D3-review.md`

Mandatory skills read in full before artifact review:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- repo-local TypeScript refactoring corpus under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/`

Important current-state note: during this review, D3 artifacts were edited by another actor. I treated those edits as current worktree state and did not modify them. This scratch review is based on the latest observed D3 artifact state, where `proposal.md`, `design.md`, `tasks.md`, `specs/habitat-harness/spec.md`, and `workstream/review-disposition-ledger.md` have uncommitted edits.

## Verdict

Not accepted.

D3 is no longer merely the weak scaffold described by the earlier negative-control review. The current `proposal.md`, `design.md`, `tasks.md`, and spec now substantially name the full Workspace Graph Integration authority: owner roots, graph-owned target names, target availability, alias dependencies, aggregate/workspace targets, graph read/refusal states, consumer scope, D0/D2 gates, write set, validation oracle, and D4/D7/D12 handoffs.

That is the correct acceptance bar. D3 must not be accepted as a partial `biome-ci` patch, and this review does not treat the live `biome-ci` falsifier as the whole problem. The live falsifier is useful because it proves the boundary failure, but acceptance requires a complete Workspace Graph Integration authority contract that prevents the whole class of split graph truth: plugin inference, classify output, verify target planning, alias dependencies, aggregate workspace gates, graph-read failures, and downstream consumers must all route through one named authority.

The packet remains blocked because the complete authority contract is not yet carried consistently through the whole artifact set, and one key boundary still leaves implementation inference: how the plain ESM contract, typed graph service, and Nx plugin cooperate to validate or refuse alias dependencies before a no-op wrapper can succeed.

## P1 Findings

### P1-1: Workstream control artifacts still publish the old weak validation and downstream story

`design.md`, `proposal.md`, `tasks.md`, and the spec have moved toward the complete D3 contract. The workstream records have not caught up.

Current stale surfaces:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/phase-record.md` still lists only `nx show project`, `habitat classify`, OpenSpec validation, and `git diff --check` as "Exact Validation Gates". That omits the full D3 validation oracle: workspace graph tests, injected missing-project and missing-target aliases, malformed graph JSON, Nx read/daemon failure, cache-disabled alias execution, and dependency-execution evidence.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/downstream-realignment-ledger.md` still says "Later domino packets: pending" instead of publishing the accepted graph facts D4, D7, and D12 may consume.
- The phase record objective still frames D3 as converting a "scaffold" rather than recording the now-chosen Workspace Graph Integration authority contract.

Why this blocks acceptance: an implementation or downstream agent reading the phase record/downstream ledger can still run smoke checks that pass while the complete graph authority remains unproven. Information design failure here is not formatting; it is conflicting artifact hierarchy. The packet's stronger design contract is buried in some files while the operational control files still authorize the old weaker path.

Required repair:

- Replace phase-record validation gates with the same falsifying gates now present in `tasks.md` and `design.md`.
- Update phase-record objective/status to say D3 defines the complete Workspace Graph Integration authority contract, not a scaffold.
- Update downstream ledger with explicit rows for D4, D7, and D12:
  - D4 may consume project ownership, target availability, unavailable target, aggregate/workspace target, and graph refusal facts; it may not infer graph truth or alias validity.
  - D7 may consume available targets, aggregate/workspace targets, and resolved alias dependency facts for execution planning; it may not treat wrapper exit 0 as success without D3 dependency resolution.
  - D12 may consume graph-read status and verify target-plan facts; it owns receipt schema and handoff wording, not graph construction.
- Add review-ledger rows for this information-design review and any other fresh D3 reviews before acceptance.

### P1-2: The plugin/service split still leaves the alias-refusal mechanism partly implicit

The current design correctly rejects separate graph truths and introduces:

- `workspace-graph-contract.js` as a plain ESM contract for the Nx plugin and TypeScript code.
- `workspace-graph.ts` as the typed graph service that reads Nx metadata and returns graph facts/refusals.
- `plugin.js` as a consumer that emits only resolved alias dependencies or graph refusal targets.

The hidden ambiguity is the handoff between static plugin target inference and current graph validation. The design says the plain ESM contract owns alias dependency declarations and dependency validation helpers, while the TypeScript service reads current Nx metadata and validates declarations against graph data. It also says `plugin.js` emits only resolved alias dependencies or graph refusal targets. That is still underspecified at the exact point where the false-green class is born.

The packet must decide, before implementation:

- Is `workspace-graph-contract.js` declarative only, or does it validate against a passed current project/target set?
- If the Nx plugin cannot read full current graph metadata at target-inference time, does it withhold alias wrapper targets, emit a target whose command fails before wrapper execution, or emit dependencies only after static declarations name canonical current project ids?
- What is a "graph refusal target" in Nx inferred target terms? Is it a Habitat classify/verify fact only, an Nx target with a failing command, or a withheld target plus diagnostic elsewhere?
- Where is the single source of truth for "canonical Habitat Biome target" encoded, and how does D2 rule graph projection feed it without allowing `rules.json` or local plugin constants to become a second authority?

Why this blocks acceptance: the current prose protects the complete solution at the domain level but still lets an implementer choose a mechanism locally. If one implementer validates aliases in TypeScript classify only while the plugin still emits wrappers, or another adds a failing command target while classify reports a refusal, D3's single authority collapses into two behavior paths.

Required repair:

- Add a "Plugin/Graph Validation Data Flow" subsection to `design.md` that states the exact sequence from alias declaration to Nx inferred target emission to classify/verify projection.
- Define whether unresolved aliases are withheld, represented as non-runnable graph facts, or represented as failing Nx targets, and make that representation consistent across plugin, classify, verify, and tests.
- State the API shape between `workspace-graph-contract.js` and `workspace-graph.ts`: declarative registry only vs validation function receiving resolved graph facts.
- Add the corresponding tasks and spec scenarios so the mechanism is not inferred while coding.

### P1-3: Acceptance state is still structurally unresolved across ledgers

The packet index says D3 is a draft scaffold with the per-domino adversarial gate blocking. The D3 review ledger still contains the generic per-domino gate row, but it does not yet record this review's verdict, accepted findings, or repair evidence. The closure checklist says review ledger has no unresolved P1/P2 findings, but the packet currently has unresolved P1s from this review.

Why this blocks acceptance: the remediation frame makes per-domino review a design-time gate, not an implementation-time cleanup task. D3 cannot become accepted by improving proposal/design/spec alone; the acceptance artifacts must record the findings, dispositions, and repair evidence.

Required repair:

- Add this review as a blocking P1 row in `workstream/review-disposition-ledger.md`.
- After repairs, update the row with exact repair evidence paths and a disposition.
- Update packet index only after the D3 review ledger has no accepted unresolved P1/P2 findings.

## P2 Findings

### P2-1: The spec is much better, but it still lacks the plugin/service boundary scenarios

The current spec now covers singular authority, closed target states, alias resolution, classify/check/verify scope, D0/D2 blockers, and downstream fact consumption. That is the right shape for the full domain problem.

What is still missing is the same mechanism-level split from P1-2:

- A scenario for static alias declarations being validated against current graph facts before plugin emission.
- A scenario for the exact unresolved-alias representation in Nx inferred target output.
- A scenario proving classify/verify receive the same refusal/fact as the plugin path, not a separately reconstructed result.

Required repair:

- Add spec scenarios under `Alias Targets Require Resolved Dependencies` and/or a new `Plugin And Graph Service Share One Validation Path` requirement.

### P2-2: D0/D2 dependency wording needs to distinguish design acceptance from source implementation closure everywhere

The latest design/proposal/tasks mostly do this correctly: D3 can be accepted for design/specification while source implementation remains blocked until concrete D0 rows and D2 implementation facts exist.

The remaining issue is propagation. Workstream ledgers and phase record still do not reflect the stronger dependency contract. Acceptance should not leave a reader to reconcile "D0/D2 accepted design/specification" with "source implementation blocked on live facts" by memory.

Required repair:

- Put the D0/D2 live-fact blocker in `phase-record.md`, `closure-checklist.md`, and downstream ledger.
- In `tasks.md`, keep source preconditions as implementation blockers, not optional "cite or rerun" items.

### P2-3: Full graph-state compatibility surface needs an explicit artifact map

The design says existing `ClassifiedTarget` / `UnavailableClassifiedTarget` are compatibility DTOs and legacy `proof` fields are compatibility fields. That is useful but not yet an artifact structure that an implementer can audit.

Required repair:

- Add a compatibility map naming each public/durable D3-touched surface:
  - classify JSON target fields;
  - verify target plan/output fields;
  - Nx inferred target names and dependency shape;
  - root scripts that invoke inferred targets;
  - package exports, if `workspace-graph.ts` or `workspace-graph-contract.js` becomes public/internal-exported;
  - docs/examples that show classify/check/verify target facts.
- For each, state "preserve under D0", "additive only", "version required", or "internal only".

### P2-4: Downstream handoffs should name stable fact names, not just concepts

The current `design.md` downstream handoff table is conceptually correct but still fairly broad. D4, D7, and D12 should not infer exact names from prose.

Required repair:

- Use the accepted D3 discriminants in downstream handoffs:
  - `available-project-target`
  - `unavailable-project-target`
  - `alias-target`
  - `aggregate-workspace-target`
  - `graph-refusal`
  - `graph-ready`
  - `malformed-graph-json`
  - `nx-read-failure`
  - `nx-daemon-failure`
- For each downstream packet, name which discriminants are consumable and which are non-claims.

## Exact Artifact Structure Repairs

### `proposal.md`

Current direction is acceptable as the executive entrypoint. Keep the complete authority framing. Do not reduce it to `biome-ci`; keep `biome-ci` as the falsifier proving the class of boundary failure.

Repair:

- Add one sentence under Summary or Problem Statement: "The `biome-ci` case is the live falsifier, not the scope boundary; D3 acceptance requires the full Workspace Graph Integration authority contract."

### `design.md`

Current direction is close to acceptance but needs the plugin/service mechanism closed.

Repair:

- Add `Plugin/Graph Validation Data Flow`.
- Decide unresolved alias representation across Nx plugin, classify, and verify.
- Define whether `workspace-graph-contract.js` is declarative-only or validation-capable, and what inputs validation receives.
- Add a compatibility map for public/durable surfaces.
- Expand downstream handoff table with exact discriminants.

### `tasks.md`

Current tasks are implementation-ready in broad sequence and much stronger than the original scaffold.

Repair:

- Add tasks for the plugin/service data-flow mechanism.
- Add tasks for compatibility map updates.
- Add a task proving plugin path and classify/verify path use the same alias-refusal result, not parallel validation.

### `specs/habitat-harness/spec.md`

Current spec now represents the full graph authority at a useful level.

Repair:

- Add scenarios for shared plugin/service validation path and unresolved alias representation.
- Add scenarios binding the exact D3 discriminants to downstream consumer non-claims.

### `workstream/phase-record.md`

Currently stale and blocking.

Repair:

- Replace the old smoke gates with the full falsifying validation suite from `tasks.md`.
- Record D0/D2 source implementation blockers.
- Update objective/status from scaffold conversion to complete Workspace Graph authority packet.

### `workstream/downstream-realignment-ledger.md`

Currently stale and blocking.

Repair:

- Replace generic "Later domino packets" row with D4, D7, and D12 rows naming accepted discriminants and non-claims.

### `workstream/review-disposition-ledger.md`

Currently incomplete for this review.

Repair:

- Add this information-design review with P1 blocking disposition.
- Do not mark D3 accepted until all accepted P1/P2 rows have repair evidence.

### `workstream/closure-checklist.md`

Repair:

- Add checklist items for complete graph-authority propagation across proposal/design/tasks/spec/phase/downstream/review ledgers.
- Add explicit items for plugin/service validation data flow, D0/D2 live blockers, and D4/D7/D12 discriminant handoffs.

## Acceptance Bar Restated

D3 acceptance requires all of these to be true:

- One Workspace Graph Integration owner owns graph read status, owner roots, target-name policy, alias dependencies, aggregate/workspace targets, project/target availability, and graph refusals.
- The ESM plugin contract and TypeScript graph service have one explicit data flow; no implementer decides during coding how alias resolution is validated or refused.
- Missing project, missing target, unresolved alias dependency, malformed graph JSON, Nx read failure, and Nx daemon failure are closed graph states, not generic command failures.
- `plugin.js`, classify, and verify cannot carry separate target maps, owner-root maps, or alias dependency truth.
- `habitat check` consumer scope is bounded to Nx inferred target surfaces; D7 owns direct enforcement semantics.
- D4, D7, and D12 consume named D3 facts and do not recreate graph authority locally.
- Validation gates are falsifying and can fail the entire class of split graph truth, not just the observed `biome-ci` instance.
- Workstream ledgers and phase records publish the same authority contract as proposal/design/spec/tasks.

Until those are repaired, D3 should remain not accepted.

## Non-Claims

- This review does not authorize source changes.
- This review does not treat historical scratch evidence as current guidance.
- This review does not accept a `biome-ci`-only repair.
- This review does not reject the current direction of `proposal.md`, `design.md`, `tasks.md`, or the spec; it rejects acceptance until the complete authority contract is consistent and mechanism-complete across the full artifact set.
- This review does not evaluate implementation correctness because implementation has not started.
