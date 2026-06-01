# Graphite Stack Integration Workstream Record

**Status:** Gate 8 plan captured; source integration paused by Gate 2
**Captured:** 2026-06-01 02:07 EDT
**Last refreshed:** 2026-06-01 02:15 EDT
**Record branch:** `codex/integration-stack-reference-frame`
**Current systematic gate:** Gate 8, implementation slicing and stop condition

This record is the current operating view for the Civ7 Graphite integration
workstream. It does not claim source integration, runtime proof, Graphite
submit, or closure. It records the evidence-grounded frame, conflict model,
agent objective framing rule, proposed stack order, validation lanes, and the
explicit stop condition before implementation.

## Frame

This workstream is an intent-synthesis integration pass, not a mechanical merge.
Authority follows intentional ownership: domain, stage, behavior, and config
workstreams are authoritative for their intended semantic changes when commits,
OpenSpec records, tests, docs, and proof records show that intent.

The standard recipe public config surface is the clean expression boundary for
accepted intent. It is not a veto over valid domain/stage or behavior changes.
If an incoming workstream intentionally changed behavior that should now be
publicly expressible, the public surface must accommodate that behavior. If an
incoming branch merely retained stale internals or properties another workstream
intentionally removed, those leftovers are noise and must not be revived.

### In

- Current local Graphite branches, active worktrees, and branch parentage.
- Commit trains, OpenSpec records, tests, docs, and available thread/agent
  context for branch intent.
- Textual conflicts, semantic conflicts, generated-output churn, and intention
  conflicts.
- A forward-building Graphite stack proposal with small, reviewable slices.

### Foreground

- Synthesis of all accepted workstream intentions without carrying accidental
  leftovers.
- Config-surface cleanliness as an expression boundary, not an authority override.
- Morphology realism repairs as behavior.
- Resource corpus, group-planning, materialization, diagnostics, and runtime
  proof behavior.
- Dirty worktree isolation before any restack.
- Proof classes kept separate: docs, local tests, generated artifacts, deploy,
  direct-control response, runtime logs, Graphite submit, and product proof are
  not interchangeable.

### Exterior

- Ad-hoc merge branches or plain git rebase/merge as the integration method.
- Raw step/op envelopes, public `candidateResourceTypes`-style controls, stale
  placement internals, and intentionally removed properties.
- Hand-editing generated map artifacts.
- Closing a slice with dirty files, stale tasks, stale phase records, stale next
  packets, or unresolved P1/P2 findings.
- Treating the current public schema as frozen when another workstream has
  intentional authority to change what the surface should express.

### Reframe Triggers

- A branch believed to be stale carryover proves to own a documented behavior or
  domain/stage contract.
- The resource train already has a real, verified `resources` stage boundary
  elsewhere.
- Studio save/run becomes required to prove MapGen/resource runtime behavior.
- Generated artifact conflicts trace back to source-schema disagreement rather
  than ordinary regeneration.

## Agent Objective Framing Rule

Any additional agent in this workstream should receive a frame, not a task list.
The objective should carry:

- Outcome experience: the reviewer should see one forward story where each slice
  expresses one coherent intention boundary.
- Hard core: authority follows intentional ownership; public config is the clean
  expression boundary; generated outputs are regenerated; proof classes remain
  separate; dirty worktrees are unsafe.
- Scope and exterior: name the branches, files, proof records, and stale shapes
  that are in or out.
- Evidence mandate: cite commits, docs, specs, tests, diffs, and runtime proof
  records separately.
- Stop condition: stop before mutation if the worktree is dirty, parentage is
  stale, records are stale, or a P1/P2 finding blocks closure.
- Desired deliverable: a branch-ready slice plan or a bounded repair, not a broad
  "merge everything" answer.

## Gate 2 State Refresh

Commands re-run before this record:

- `git worktree list --porcelain`
- `git status --short --branch` in every active worktree
- `gt ls`
- `gt log --stack` from the root and integration reference worktrees
- `gt branch info` for active branch worktrees

Continuation refresh on 2026-06-01 02:12 EDT re-ran
`git worktree list --porcelain`, `gt ls`, and `git status --short --branch` for
the root, resource, authoring-surface guard, morphology, and integration
worktrees. The implementation stop condition still holds.

Continuation refresh on 2026-06-01 02:15 EDT re-ran the same Gate 2 checks. The
root Studio save/run WIP and resource `NOTE-TO-DRA.md` blocker are unchanged.
The authoring-surface guard worktree still has protected Earthlike config WIP,
but the generated `swooper-earthlike.ts` file is no longer dirty in that
worktree.

Current active worktrees:

| Worktree | Branch | State | Integration disposition |
| --- | --- | --- | --- |
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools` | `codex/studio-save-run-state-machine` | Dirty WIP; branch has no committed delta over `codex/studio-operation-state-completion` yet | Exclude from source integration until committed, parked, or explicitly deferred |
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream` | `codex/resource-runtime-proof` | Dirty `NOTE-TO-DRA.md` | Repair or park records before replaying resource proof claims |
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-systematic-skill-review` | `codex/systematic-skill-review-fixes` | Clean | Keep as separate docs/process stack unless literal single stack is required |
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-systematic-workstream-skill-framing` | `codex/systematic-evidence-workstream-skill` | Clean | Keep with systematic skill stack |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-foundation-architecture-packet` | `codex/foundation-architecture-packet` | Clean | Planning context; include only if reviewer ergonomics require it |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-authoring-surface-handoff-reference` | `codex/studio-sdk-authoring-surface-guards` | Dirty Earthlike config WIP | Unsafe parent/restack input until WIP is committed, parked, or classified |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective` | `codex/morphology-peer-review-repairs` | Clean | Replay after guards once dirty parent state is resolved |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-integration-stack-reference-frame` | `codex/integration-stack-reference-frame` | Clean before this record | Docs-only reference branch |

Dirty root WIP now includes Studio save/run state, map config save/deploy
status, run-in-game request/status/state tests, Vite run-in-game restart/deploy
path, `mods/mod-swooper-maps/package.json`, root `package.json`, the new
`docs/projects/civ7-direct-control/workstream/studio-save-run-state-machine/`
record directory, and the new `openspec/changes/studio-save-run-state-machine/`
slice. Treat that work as topmost or separate until its owning agent commits and
verifies it.

The authoring-surface guard worktree is dirty in:

- `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`

That WIP appears to include broader Earthlike hydrology/biome realism changes,
not just the two morphology peer-review thresholds. It must be classified by
intent before folding into the integration stack.

## Graphite Parentage View

The current `gt ls` view is one forest with several active branch trains:

- Main authoring/Studio line:
  `codex/firetuner-socket-studio-restart` to direct-control work, morphology
  ownership, authoring-surface alignment, `codex/studio-sdk-authoring-surface-guards`,
  and the root Studio save/run stack.
- Morphology side train:
  `codex/morphology-rough-land-owner` to
  `codex/morphology-live-readback-boundary` to
  `codex/morphology-peer-review-repairs`.
- Resource side train:
  `codex/resource-distribution-planning` through
  `codex/resource-runtime-proof`, based below the later authoring and morphology
  work.
- Systematic skill train:
  `codex/systematic-workstream-skill-framing` through
  `codex/systematic-skill-review-fixes`, above the resource train.
- Integration reference train:
  `codex/placement-authoring-surface-alignment` to
  `codex/studio-sdk-authoring-surface-guards` to
  `codex/integration-stack-reference-frame`.

Do not mutate topology until the dirty worktrees above are resolved or excluded.

## Conflict Model

### Textual Conflicts

- `codex/studio-sdk-authoring-surface-guards` versus
  `codex/morphology-peer-review-repairs` conflicts in
  `swooper-earthlike.config.json` and generated `swooper-earthlike.ts`.
- `codex/morphology-peer-review-repairs` versus
  `codex/resource-runtime-proof` conflicts in
  `mods/mod-swooper-maps/test/support/world-balance-stats.ts`, with semantic
  overlap in `world-balance-stats.test.ts`.

### Semantic Conflicts

- The resource train preserves valid corpus/group-planning/materialization and
  runtime-proof behavior but inherits older placement/config boundaries. Replay
  the behavior, not stale public config shapes.
- The morphology peer branch preserves rough-land ownership and ecology habitat
  behavior but its Earthlike config deltas were authored against an older raw
  step/op public shape.
- The guard branch is the current cleanup/guard layer, but not an immutable
  schema ceiling. Accepted behavior can require public-surface accommodation.
- The root Studio save/run branch is active WIP around operation overlap,
  save/deploy state, and run-in-game restart/deploy behavior. It is mostly
  orthogonal by file path but unsafe as an integration input.

### Generated Artifact Churn

`mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts` is downstream
output. Resolve source config and behavior first, then regenerate.

## Intent Classifications

### Authoring Surface Guards

Accepted intent:

- Standard recipe public config is semantic and recursively strict.
- Studio schema/default/ui metadata and generated SDK map entrypoints consume
  canonical public config envelopes.
- Raw public step/op envelopes and public `candidateResourceTypes` controls stay
  out of the authoring surface unless a later owner intentionally designs a new
  public contract.

### Morphology And Earthlike Realism

Accepted intent:

- Preserve morphology rough-land ownership and ecology habitat behavior.
- Preserve broad vegetation habitat admission using ecology classification
  signals.
- Translate old-shape Earthlike config deltas into the current semantic surface:
  `ecology-features.reefPlanning.minConfidence01 = 0.62` and
  `ecology-features.vegetationPlanning.rainforestMinConfidence01 = 0.28`,
  unless fresh evidence shows a broader public-surface change is intended.
- Do not revive stale raw Ecology step/op envelopes.

### Resource Distribution

Accepted intent:

- Preserve the 55-row official resource corpus, visible blocked/proxy/unassignable
  rows, four resource groups, group planning, materialization, typed assignment,
  diagnostics, and bounded runtime proof behavior.
- Preserve fail-hard mismatch behavior and warning-only proof labels where the
  source work declared them.
- Reconcile static blocked rows and runtime unassignable numeric IDs without
  hiding either proof class.
- Promote a dedicated `resources` stage only if the architecture gate is
  satisfied: real artifacts, trace identity, consumers, and verification
  boundaries. Otherwise keep transitional work inside the owning boundary while
  preserving behavior.

### Studio Save/Run State

Accepted intent, once clean:

- Save/deploy and Run in Game must be state-aware and must not overlap in ways
  that corrupt Studio, deploy, or runtime state.
- "Run in Game" owns game/runtime mutation; Save/Deploy owns persisted current
  config and generated/deployed script state.
- Process restart behavior needs explicit direct-control alignment, bounded
  status, and proof before it can support runtime claims.

Current disposition: topmost or separate only after the owning WIP is committed
and verified.

## Proposed Stack Order

This is the integration design to use after Gate 2 blockers are cleared.

1. `codex/studio-sdk-authoring-surface-guards`
   - Guard layer above `codex/placement-authoring-surface-alignment`.
   - Repair or park the current dirty Earthlike WIP before using this branch as
     a parent.
2. `codex/integrate-morphology-live-readback`
   - Replay `codex/morphology-live-readback-boundary` above guards if not already
     represented.
   - Preserve runtime-readback boundary records without overclaiming fresh proof.
3. `codex/integrate-morphology-peer-repairs`
   - Replay habitat-gate behavior and rough-land ownership repairs.
   - Translate the two Earthlike thresholds into the semantic public config.
   - Regenerate generated Swooper Earthlike output after source decisions.
4. `codex/repair-resource-runtime-proof-records`
   - Fix stale resource phase/next-packet records and dispose of `NOTE-TO-DRA.md`
     before depending on resource closure.
   - Keep proof labels scoped to the commit and runtime path that actually
     produced them.
5. `codex/replay-resource-corpus-expectations`
   - Restore corpus extraction, resource IDs/groups, blocked/proxy rows,
     expected legality/spread/diversity ranges, and confidence labels.
6. `codex/replay-resource-materialization-proof`
   - Restore typed intent reconciliation, `adapter.canHaveResource` assignment,
     diagnostics, fail-hard mismatches, unassignable IDs, and runtime telemetry.
   - Realign to the accepted public config and stage boundary.
7. `codex/integrate-world-balance-resource-stats`
   - Merge morphology rough/habitat expectations with resource distribution
     statistics in `world-balance-stats` support/tests.
8. Optional `codex/evaluate-resource-stage-boundary`
   - Add only if the architecture gate proves a dedicated resources stage is
     ready. Otherwise defer explicitly.
9. Topmost or separate `codex/studio-save-run-state-machine`
   - Include only after root WIP is clean, tests pass, operation overlap is
     resolved, process restart behavior is bounded, and deploy/runtime proof is
     current.
10. Separate docs/process stack for the systematic skill branches unless the
    user requires one literal stack.

## Validation Lanes

Run validations at the slice that owns the claim:

- Guard/public surface: focused config schema, compile-equivalence, Studio
  default/schema/ui metadata, generated SDK entrypoint guard tests, OpenSpec
  strict validation for changed specs.
- Morphology/Earthlike: ecology habitat planner tests, rough-land/morphology
  readback tests where applicable, world-balance stats tests, generated recipe
  regeneration checks.
- Resources: corpus contract tests, resource group/operation tests,
  `resource-placement-diagnostics`, `plan-ops`, resource statistics, and
  OpenSpec strict validation.
- Generated artifacts: regeneration command plus hash/source consistency checks;
  no hand conflict resolution in generated files.
- Runtime proof: only claim runtime behavior with branch, commit, deploy/control
  path, request id, response, log paths, timestamp/mtime bounds, parsed payload
  summary, and exact claim satisfied.
- Studio save/run: UI/server state tests, request validation, save/deploy/run
  overlap behavior, direct-control boundary checks, and bounded deploy/runtime
  proof if used for product claims.

## Current Stop Condition

Do not start source integration or restacking yet. The required blockers are:

1. Root `codex/studio-save-run-state-machine` WIP must be committed, parked, or
   explicitly excluded.
2. Authoring-surface guard dirty Earthlike config WIP must be committed, parked,
   or classified with an owner decision.
3. Resource `NOTE-TO-DRA.md` dirty record state must be repaired, parked, or
   excluded from closure claims.
4. Any active deploy/dev-server state that can mutate generated/deployed
   artifacts must be stopped or named as protected external state.
5. Gate 2 commands must be re-run immediately before any mutation.

Proof label for this record: read-only audit and design record only. No source
integration, generated artifact regeneration, runtime proof, Graphite submit, or
PR action has been performed by this record.
