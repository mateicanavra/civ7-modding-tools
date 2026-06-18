# D3 Final Code/Topology Review: Workspace Graph Boundary

## Verdict

Accepted for design/specification only.

The repaired D3 packet now satisfies the complete Workspace Graph Integration
acceptance standard for code/topology design. It names the Workspace Graph module
as the single graph authority, makes dependency declaration kinds first-class,
sets a bounded source write set and protected set, and turns the current
`habitat:rule:biome-ci` false green into a required falsifier rather than a
reduced solution boundary.

D3 is not implementation-complete and is not source-implementation-ready. The
current Habitat source still contains the false-green topology and duplicate
graph truth that D3 is designed to remove. Source work remains blocked until
concrete D0 public-surface rows and D2 graph projection implementation facts
exist.

## Evidence Read

- Re-read the active negative-control note in `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D3-review.md:1`, which supersedes any historical wording that lowered D3 to a `biome-ci`-only fix.
- Re-read the D3 proposal, design, spec, tasks, and all workstream files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary`.
- Re-read `docs/projects/habitat-harness/openspec-remediation/context.md` and the packet index.
- Re-checked current graph-related source topology in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`.

Commands run:

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`: passed.
- `bun run openspec:validate`: passed, 249 items.
- `git diff --check`: passed.
- `nx show project @internal/habitat-harness --json`: still shows `habitat:rule:biome-ci` depends on `{"projects":["biome"],"target":"ci"}`.
- `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`: still exits 0 after Nx reports the dependency misconfiguration.

## Acceptance Basis

D3 now has a concrete code/topology owner boundary. The design introduces the
Workspace Graph module and assigns `workspace-graph-contract.js`,
`workspace-graph.ts`, `nx-projects.ts`, `plugin.js`, and `command-engine.ts`
clear authority/consumer roles in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:74`.
The source write set and protected paths are explicit in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:319`.

D3 now models the full dependency topology, not only the `biome-ci` falsifier.
`TargetDependencyDeclaration` covers same-project target dependency, explicit
project target dependency, aggregate/workspace dependency, and multi-dependency
target relationship in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:182`.
The constraints require same-project normalization, explicit project/target
resolution, aggregate/multi child resolution, graph refusal for unresolved
aliases, and no `node -e ""` projection until dependencies resolve in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:204`.
The topology table ties those kinds to current `plugin.js` shapes in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:281`.

The spec now makes the same contract normative. It rejects duplicate target truth
and requires a full graph inventory in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:3`.
It requires same-project resolution/refusal, canonical `biome-ci` resolution,
explicit project resolution, aggregate child resolution, missing project/target
refusal, no first-colon parsing, and closed dependency kinds in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:44`.
It also requires one validation path for plugin inference, classify, and verify
in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:94`.

The implementation tasks are no longer a vague biome repair. They require the
Workspace Graph contract, removal of plugin-local owner roots/dependency parsing,
canonical `biome-ci`, same-project `nx-boundaries`, and aggregate/multi
`generated:check` topology in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:10`.
They require plugin migration away from unresolved no-op wrappers in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:27`.
Task 4.6 closes the unresolved-alias representation rule rather than leaving an
implementation-time decision: withhold runnable aliases by default, expose
graph-refusal classify/verify states, and use a command-facing failing
graph-refusal target only when a concrete D0 row covers that public behavior in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:34`.
The tasks also require classify/verify migration away from local target
authority in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:36`,
and validation gates for inventory, alias execution, same-project, aggregate,
multi-dependency, graph read, and daemon failure cases in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:52`.

## Current Source Topology

The current source remains a live falsifier, not acceptance evidence for
implementation. `plugin.js` still owns `OWNER_ROOTS` and target-name defaults in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:17`
and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:29`.
It still defines `dependencyForTarget` with first-colon parsing in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:182`,
still projects aliases through `node -e ""` in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:190`,
and still routes `biome-ci`, grit, generated, and `rule.nxTarget` alias shapes
locally in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:203`.

`nx-projects.ts` still reads graph metadata and owns `findOwningProject` /
`projectHasTarget` helpers in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts:21`.
`command-engine.ts` still carries classify target DTOs, hard-coded verify target
names, and local project/workspace target construction in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:196`,
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:614`,
and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:1032`.

That source state is exactly what D3 now requires later implementation to
replace.

## Findings

### P1

None.

### P2

None.

### P3-1: Proposal uses one lowering-prone phrase for D12 facts

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/proposal.md:93`
says D12 may consume D3 graph-read and "target-execution facts" for verify
handoff receipt design.

This is non-blocking because the repaired design/spec/workstream files otherwise
hold the boundary correctly: D3 provides target-plan, availability, dependency
resolution, and graph-read/refusal facts; D12 owns receipt schema, and D3 graph
target availability does not prove target success. The safer wording would be
"target-plan and dependency-resolution facts" to avoid suggesting D3 proves
execution success.

## Design/Specification Acceptance

D3 can be accepted for design/specification only from this code/topology review.
The packet now names the canonical graph service/module boundary, complete
dependency declaration model, plugin/classify/verify consumer topology, write
set, protected set, safe refactor path, and falsifying validation gates needed to
prevent duplicate graph truth, colon-split alias parsing, no-op wrapper false
greens, and implementation-time authority decisions.

D3 cannot be accepted as implementation-complete. The current source and live Nx
behavior still false-green `habitat:rule:biome-ci`, and that remains required
future validation evidence.

## Required Write-Set And Source-Topology Repairs For Later Implementation

No additional D3 packet repair is required by this final code/topology review
before design/spec acceptance.

Later source implementation must perform the repairs already specified by the
packet:

- Add `$HABITAT_TOOL/src/lib/workspace-graph-contract.js` as the plain ESM owner
  of owner roots, graph-owned target names, aggregate declarations, dependency
  declaration kinds, and validation helpers.
- Add `$HABITAT_TOOL/src/lib/workspace-graph.ts` as the typed graph service for
  graph read state, target facts, dependency resolution, and graph refusals.
- Migrate `$HABITAT_TOOL/src/plugin.js` to consume the contract and emit alias
  wrappers only after dependency declarations resolve.
- Demote `$HABITAT_TOOL/src/lib/nx-projects.ts` to a compatibility adapter or
  projection-only layer; it must not remain target-availability authority.
- Migrate `$HABITAT_TOOL/src/lib/command-engine.ts` classify and verify target
  planning to consume Workspace Graph states instead of local arrays.
- Add focused tests for workspace graph state, plugin inference, classify,
  verify/command behavior, full graph inventory, same-project dependencies,
  explicit project dependencies, aggregate/multi dependencies, and graph
  refusal bad cases.
- Keep `$HABITAT_TOOL/src/rules/rules.json`, D4/D7/D12 packet bodies, generated
  output, lockfiles, and unrelated domains protected unless a later accepted
  prerequisite explicitly authorizes a change.
