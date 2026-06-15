# Review Disposition — Effect-Native Habitat Core

## Source Reviews

- Sequencing/workstream review agent: accepted.
- Habitat parity review agent: accepted.
- Effect-idiom review agent: accepted.
- H8 parity reassessment agent: accepted.
- Effect/Nx generator boundary review agent: accepted.
- OpenSpec split/granularity review agent: accepted where consistent with H8
  host-boundary evidence; superseded where it recommended merging Nx
  generators/migrations back into command programs.
- Formal authority/H8 parity lane: accepted.
- Formal OpenSpec shape/task readiness lane: accepted.
- Formal Effect architecture/lifecycle lane: accepted.
- Formal Nx generator/migration boundary lane: accepted.
- Formal proof/closure lane: accepted.
- Formal information-design/future-DRA lane: accepted.

## Dispositions

### Parent vs Implementation Scope

Accepted. `habitat-effect-native-core` is now the parent/design change. The full
implementation is split into named child changes, each with its own future
OpenSpec artifacts and closure gates.

### H7/H8 Closure

Accepted. Implementation was blocked until H7 and H8 closed. Both are now
closed locally, and this parent design still does not mutate H1-H8
implementation state.

### Phase Record Shape

Accepted. The phase record now records branch/stack state, dirty ownership,
protected writes, evidence, decisions, stop-condition status, validation, and
next action.

### Spec Detail Level

Accepted. Exact service inventory and package versions remain in design/tasks.
The split spec deltas state behavior/process requirements: adapter lifecycle,
injectable Effect capability boundaries, contract parity, hook/generated-zone
mutation policy, Nx generator/migration host boundaries, and runtime proof
obligations.

### Check Exit Semantics

Accepted. The spec now allows non-zero exit when enforced rules fail or when no
valid report can be produced, while preserving JSON stdout isolation.

### Resource Publish Carve-Out

Accepted. H7's resource-publish gitlink behavior is now the explicit
non-formatter carve-out for hook mutation policy.

### Grit Parity

Accepted. The design now pins full-check scan roots/options/env/parser/projection
and distinguishes the staged hook scan.

### Baseline Authoring

Accepted. The spec and design now include `--expand-baseline` selected-rule
writes, sorted/newline formatting, no report emission, no-merge-base behavior,
and rule-introduction integrity semantics.

### Generated-Zone Policy Path

Accepted. The generated-zone design distinguishes map artifact snapshot/restore
from the policy-table check-only gate and requires final worktree cleanliness.

### H8 Parity

Accepted. The command-program child scope now owns `classify` path and diff
semantics only. Unsupported-kind refusal, pattern generator baseline/rule-pack
entry, generated project probes, and migration run-file semantics are owned by
`habitat-effect-nx-generators-migrations`.

### Stdout/Stderr Matrix

Accepted. The test strategy now names `fix --dry-run`, `graph --json`,
`check --output`, filtered checks, staged checks, unknown hook exit 2, and
verify check-fail ordering.

### Platform Dependency Peers And Bun Dev Path

Accepted with additional evidence. A temp Bun install of the proposed packages
completed without peer warnings, and a minimal `NodeContext.layer` run succeeded
under Bun. The first implementation child must repeat this proof in-repo before
manifest edits.

### Error Model

Accepted. Expected external/tool/input failures use tagged errors; internal
report-schema failures remain defects surfaced by the adapter.

### Nested Habitat CLI In Hooks

Accepted. The design now requires migrated hooks to call internal check/rule
programs rather than spawning another Habitat CLI process.

### Clock Abstraction

Accepted. The design uses Effect `Clock`/`TestClock` directly and avoids a
Habitat-specific clock wrapper unless a later child proves added semantics.

### H8 Generator And Migration Boundary

Accepted. H8 generators and migrations are not oclif command programs. The
parent split now includes `habitat-effect-nx-generators-migrations`, and the
design/specs require Nx factory adapters, Nx `Tree` backed writes, local
migration run-file semantics, and explicit CJS/ESM bridge selection.

### H8 Classify Contract

Accepted. The command-program spec now pins H8 path, workspace path, literal
diff, `.diff`/`.patch` file, and four-path matrix behavior, including
`requiredTargets`, `rulesInScope`, and diff schema version `1`.

### H8 Project Generator Parity

Accepted. The Nx generator spec now pins supported kind output, taxonomy
spelling normalization, unsupported-kind refusal, non-empty root refusal,
package scripts/exports/files/engine, tsconfig, source/test stubs, README, and
zero-new-baseline proof.

### H8 Pattern Generator And Migration Proof

Accepted. The Nx generator/migration spec now pins native Grit pattern output,
empty locked baseline, `grit-check` rule-pack entry, duplicate artifact
refusal, native Grit fixture proof, local run-file package
`./tools/habitat-harness`, and `--skip-install` migration execution.

### Multi-Spec Split

Accepted. The deleted singular `habitat-harness` delta is replaced by seven
child-aligned spec directories: runtime substrate, process/baselines,
check orchestration, command programs, Nx generators/migrations, hooks, and
generated verifier.

### OpenSpec Validation Shape

Accepted. The split must validate with `bun run openspec -- validate
habitat-effect-native-core --strict` and `bun run openspec:validate`; any
missing requirement keyword or stale spec pointer blocks closure.

### Formal Review: Closure Overclaim And Future Child Tasks

Accepted. The task ledger now separates completed parent split work from future
child changes, removing unchecked future child drafting tasks from the parent
completion count. The parent can close only after the split revision is
committed via Graphite and the worktree is clean.

### Formal Review: Nx Factory Lifecycle Stop Condition

Accepted. The proposal now stops on generator/migration-scoped runtime, fiber,
process, or resource leakage beyond the Nx factory promise/callback, not only
leakage beyond oclif `Command.run()`.

### Formal Review: Classify Deletion Diff Parity

Accepted. The command-program spec now matches H8 parser behavior: literal
`/dev/null` markers are ignored, but paths collected from `diff --git ... b/*`
remain classified, including deletion diffs.

### Formal Review: Reporter And Runtime Boundaries

Accepted. Pure report stringification, schema validation, and human rendering
remain plain. Command adapters own stdout/stderr and `--output` writes, or
delegate only the file write to a narrow output-file capability. Runtime bridge
and layer assembly are adapter concerns, not core services available to
reusable Habitat programs.

### Formal Review: CJS Factory Metadata Parity

Accepted. The Nx generator/migration spec and design now preserve current
source CJS factory metadata paths. The child implementation may use CJS
factories that import implementation code or a deliberately small
CJS-compatible pure core, but it may not move metadata to built factory files
under this parent contract.

### Formal Review: Verification Gate Taxonomy

Accepted. The proposal now separates parent closure gates from future child
implementation gates and states that OpenSpec validation proves artifact shape
only for this parent.
