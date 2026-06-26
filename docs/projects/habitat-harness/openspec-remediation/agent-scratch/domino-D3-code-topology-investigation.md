# D3 Code Topology Investigation: Workspace Graph Integration Authority

## Superseding Framing Applied

D3 is not accepted as a partial repair around `biome-ci`. The `biome-ci` failure
is the live falsifier for the complete domain problem: Habitat currently has
multiple graph-truth authorities, so a target can be represented as executable
even when its owner project, target, or alias dependency does not resolve in the
current Nx graph.

Acceptance requires the complete Workspace Graph Integration authority contract:
one owner for project/root/target/alias/aggregate/refusal graph truth; one graph
state model consumed by Nx target inference, classify, verify target planning,
and tests; and falsifying validation that proves missing project/target/alias
states cannot pass through a no-op wrapper or a compatibility DTO.

Historical scratch review is provenance only. It is not current guidance and
does not lower the D3 bar.

## Verdict

**Current D3 is not accepted.**

The current source topology still has three independent graph authorities:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:17`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:257`
  owns `OWNER_ROOTS`, target-name defaults, aggregate target construction, alias
  dependency parsing, and no-op alias wrappers.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/nx-projects.ts:21`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/nx-projects.ts:52`
  owns Nx graph metadata reads, owning-project lookup, and target-presence
  checks, but not aliases, aggregate/workspace targets, or graph-refusal states.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:196`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:211`
  and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:1032`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:1071`
  own classify target DTOs and local `check`/`test`/workspace target projection,
  while verify separately owns affected target names at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:614`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:729`.

The updated OpenSpec `proposal.md`, `design.md`, and spec text now point toward
the right complete boundary, especially
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:55`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:233`
and
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:3`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:109`.
But D3 is not acceptance-ready until the tasks and validation handoff carry the
same complete contract and the implementation write set is enforced as one graph
authority, not as local repairs.

## Canonical Owner Boundary

The exact owner is **Workspace Graph Integration**.

It owns the full graph-truth boundary because the natural seam is not "Biome",
"classify", "verify", or "plugin". The seam is where Habitat converts current Nx
workspace graph facts plus Habitat rule graph declarations into target facts:
project ownership, owner roots, target availability, aggregate/workspace gates,
alias dependencies, and graph-refusal states. That boundary protects the complete
solution because every consumer can ask one authority the same question:

> Given the current workspace graph and Habitat graph declarations, what target
> facts exist, which are unavailable, which aliases are valid, and which graph
> states are refusals?

Forbidden local authorities after D3:

- `plugin.js` may emit inferred Nx targets, but may not own owner-root maps,
  target-name policy, or alias dependency parsing.
- `nx-projects.ts` may adapt Nx metadata, but may not own target availability or
  classify-oriented target truth independently.
- `command-engine.ts` may project command JSON, but may not hard-code project
  targets, workspace gates, verify target lists, or graph refusal semantics.
- Tests may build fixtures, but fixture shapes must exercise the Workspace Graph
  contract rather than duplicating a separate project/target model.

## Current Topology Map

`plugin.js` is the live Nx target inference surface. It creates:

- graph-owned workspace targets: `biome:format`, `biome:check`, `biome:ci`,
  `boundaries`, `grit:check`, `generated:check`, and `habitat:check:all` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:29`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:181`;
- rule alias targets via `aliasRuleTarget` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:190`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:197`;
- owner-local `habitat:check` targets at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:240`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:255`.

`nx-projects.ts` is a narrower live graph reader. It calls
`createProjectGraphAsync()` and flattens project metadata at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/nx-projects.ts:21`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/nx-projects.ts:38`.
It can answer "which project owns this path?" and "does this target name exist
on this project?", but it cannot currently answer "is this alias valid?" or "is
this aggregate target a workspace gate rather than a project target?"

`command-engine.ts` consumes `nx-projects.ts` for classify, but then adds local
target interpretation. `classifyPathWithProjects` builds required target output
at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:846`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:876`.
`projectTargets` hard-codes only `check` and `test`; `workspaceTargets` hard-codes
`bun run lint`. Verify separately hard-codes `build,check,test,boundaries,biome:ci,grit:check,generated:check`
and shells out to `nx affected` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:722`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:729`.

`graph.ts` is only a command wrapper over `runGraph` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/graph.ts:15`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/graph.ts:20`.
`runGraph` creates a temporary `nx graph --file` output and parses JSON at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:799`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:815`,
but malformed graph JSON or graph-read failure are not first-class graph facts.

## False-Green Alias Hazard

The falsifier is still live in current source behavior.

`plugin.js` defines the default canonical Biome target name as `biome:ci` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:34`.
`dependencyForTarget` then parses the first colon as a project/target separator
at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:182`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:189`.
For `biome:ci`, that emits `projects: ["biome"], target: "ci"`.

The `biome-ci` rule path uses that string at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:208`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:212`.
`aliasRuleTarget` sets `command: 'node -e ""'` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:190`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:195`.

Review command evidence:

- `nx show project @habitat/cli --json` reports
  `habitat:rule:biome-ci` with `command: "node -e \"\""` and
  `dependsOn: [{ "projects": ["biome"], "target": "ci" }]`.
- `nx run @habitat/cli:habitat:rule:biome-ci --skip-nx-cache`
  exits 0 after Nx prints that `dependsOn` is misconfigured and the project
  pattern matches no projects, then runs the no-op wrapper.

This is not a special-case bug. It proves the graph authority boundary is wrong:
alias dependency validity is represented as string parsing plus an executable
wrapper, not as a typed graph state that can refuse unresolved dependencies.

## Tests: What Is Covered And Missing

Current tests cover inventory, not complete graph authority.

- `classify.test.ts` injects a synthetic `NxProjectMetadataReader` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/classify.test.ts:5`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/classify.test.ts:66`.
  It verifies project ownership, `check`/`test` target availability, and
  unavailable `test` output at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/classify.test.ts:112`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/classify.test.ts:149`.
  It does not model alias targets, aggregate targets, malformed graph reads, or
  unresolved alias dependencies.
- `enforcement-surface.test.ts` imports `createNodesV2` and checks inferred
  target names at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/enforcement-surface.test.ts:260`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/enforcement-surface.test.ts:297`.
  Its helper returns only target names at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/enforcement-surface.test.ts:375`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/enforcement-surface.test.ts:389`.
  It does not inspect `dependsOn` validity or prove wrapper execution is blocked
  on unresolved dependencies.
- `biome-closure.test.ts` verifies canonical Biome target commands exist at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/biome-closure.test.ts:88`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/biome-closure.test.ts:108`
  and that one registry row uses `ownerTool: "biome"` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/biome-closure.test.ts:110`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/biome-closure.test.ts:122`.
  It does not prove `habitat:rule:biome-ci` depends on the canonical Biome target.
- `verify-proof.test.ts` tests stream bounding and cache-state parsing at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/verify-proof.test.ts:24`
  through
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/verify-proof.test.ts:105`.
  It pins hard-coded verify targets, not a graph-derived verify target plan.

## P1 Findings

### P1-1: D3 source topology still has no singular Workspace Graph authority

`plugin.js`, `nx-projects.ts`, and `command-engine.ts` each own different slices
of graph truth. That is the root state-space defect. The complete D3 solution
must collapse these into one Workspace Graph Integration owner, not coordinate
three partial authorities with conventions.

Required move: create the canonical Workspace Graph contract/service boundary and
make `plugin.js`, `nx-projects.ts`, `command-engine.ts`, verify planning, and
tests consume it. The owner-root map, target-name policy, alias dependency
declarations, aggregate targets, available/unavailable targets, and graph
refusals all belong there.

### P1-2: Alias dependency validity is represented as colon-split strings plus a no-op executable

`dependencyForTarget` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:182`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js:189`
turns target names containing `:` into fake project dependencies. `aliasRuleTarget`
then makes the wrapper executable regardless of whether dependency resolution
is valid. This keeps the impossible state representable: "runnable alias with
unresolved dependency."

Required move: alias targets must be closed graph states. A valid alias target
must carry a resolved dependency project/target pair; missing project or missing
target must become a graph refusal before wrapper execution. There is no
acceptable partial repair that fixes only `biome-ci` while leaving colon parsing
as an alias dependency mechanism.

### P1-3: Classify and verify project target facts are compatibility DTOs, not graph-state authority

`ClassifiedTarget` and `UnavailableClassifiedTarget` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:196`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:211`
can express a project target and a missing project target, but cannot express
alias targets, aggregate/workspace targets, malformed graph JSON, Nx read
failure, Nx daemon failure, or unresolved alias dependency. `projectTargets`,
`workspaceTargets`, and `verifyAffectedTargets` then rebuild separate local
truths.

Required move: introduce complete graph facts first, then project legacy classify
JSON and verify output from those facts under D0 compatibility rules.

### P1-4: Current task handoff still lowers the bar relative to the complete design

`proposal.md` and `design.md` now describe a full Workspace Graph boundary, but
`tasks.md` still says only "Define graph metadata ownership and target alias
policy", "Separate resolved project metadata", and "Make target availability a
graph fact" at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:12`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:17`.
Its validation list at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:18`
through
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md:24`
does not require the complete falsifying graph tests from the design.

Required move: synchronize `tasks.md`, phase record, and review ledger with the
full authority contract in `design.md` and the spec. The execution checklist
must not allow an implementation agent to stop at a biome alias fix or a
classify DTO tweak.

## P2 Findings

### P2-1: Tests inspect target names more than target dependency semantics

The existing plugin tests prove target names are present, but not whether alias
dependencies resolve to current Nx projects and targets. This lets the live
`habitat:rule:biome-ci` dependency defect survive.

Required repair: add `workspace-graph.test.ts` and strengthen
`enforcement-surface.test.ts` to assert complete target facts, including
`dependsOn` shape and refusal cases for injected missing project and missing
target aliases.

### P2-2: `runGraph` turns graph JSON into command output, not graph-read states

`runGraph` can return a spawn failure or throw on `JSON.parse`, but D3 needs
malformed graph JSON, Nx read failure, and Nx daemon failure as first-class graph
refusal states. Otherwise graph read failure can bypass the same target-fact
model classify and verify need.

Required repair: graph-read state belongs in the Workspace Graph service. The
`graph` command can render it, but must not own it.

### P2-3: Verify currently plans from hard-coded target strings

`verifyAffectedTargets` hard-codes a target list in `command-engine.ts`, separate
from plugin-emitted targets. That means verify can drift from the graph authority
D3 is supposed to create.

Required repair: verify target planning should consume D3 aggregate/workspace
target facts. D12 owns final receipt schema, but D3 owns whether the verify
target plan is graph-valid.

### P2-4: D0 and D2 remain implementation blockers, not optional citations

`proposal.md` and `design.md` correctly say source implementation is blocked
until D0 and D2 live facts exist. `tasks.md:10` still says "Re-run or cite the
required dependency gates: D0, D2", which reads weaker than the source
implementation blocker.

Required repair: make the task gate explicit: D3 implementation may not edit
source until concrete D0 rows cover D3-touched public surfaces and D2
implementation facts cover consumed rule graph projections.

## Required Write Set

Required complete D3 implementation write set:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/workspace-graph-contract.js`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/workspace-graph.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/nx-projects.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/graph.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/verify.ts`
  only if needed to delegate to graph-owned verify planning
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/index.ts`
  only if D0 explicitly accepts public export impact
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/workspace-graph.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/enforcement-surface.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/classify.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/verify-proof.test.ts`
  or adjacent verify planning tests
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/commands/habitat-commands.test.ts`
  only for public command compatibility behavior

OpenSpec/packet write set before source implementation:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/review-disposition-ledger.md`
- downstream realignment ledger only to record exact D4/D7/D12 facts and
  non-claims after the D3 contract is accepted.

Protected set:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/rules.json`
  until D2 implementation facts authorize graph projection changes.
- Generated artifacts, lockfiles, and unrelated Civ/MapGen source.
- D4/D7/D12 packet bodies except dependency/non-claim realignment entries.

## Required Validation Repairs

The validation suite must prove the complete authority boundary, not just the
`biome-ci` symptom.

Required tests and commands:

- Unit: Workspace Graph builds owner roots, target-name policy, aggregate target
  declarations, alias dependency declarations, and all target/refusal states from
  one contract.
- Unit: injected missing-project alias becomes `graph-refusal:
  unresolved-alias-dependency` before wrapper execution.
- Unit: injected missing-target alias becomes `graph-refusal:
  unresolved-alias-dependency` before wrapper execution.
- Unit: malformed graph JSON, Nx read failure, and Nx daemon failure become graph
  refusal states.
- Unit: `plugin.js` consumes the shared contract and cannot introduce local
  owner-root maps, colon-split dependency parsing, or target names outside the
  Workspace Graph authority.
- Unit: classify projects legacy JSON from Workspace Graph facts and distinguishes
  available project targets, unavailable project targets, alias targets,
  aggregate/workspace targets, and graph refusals.
- Unit: verify target planning consumes graph facts rather than a local
  hard-coded list.
- Command: `nx show project @habitat/cli --json` must show
  `habitat:rule:biome-ci` depends on the canonical Biome target on
  `@habitat/cli`, not `projects: ["biome"], target: "ci"`.
- Command: `NX_DAEMON=false nx run @habitat/cli:habitat:rule:biome-ci --skip-nx-cache`
  must either execute/record the canonical dependency or fail before wrapper
  execution. A clean no-op wrapper success remains a failed D3 gate.
- Command: `bun run habitat classify tools/habitat/src/plugin.js --json`
  must preserve D0-compatible output while projecting from graph facts.
- Command: `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
  and `bun run openspec:validate` must pass after the tasks/spec/ledger are
  synchronized.

## Wording Audit

Unsafe wording to remove or avoid:

- "Fix `biome-ci`" as the implementation objective.
- "Alias-only repair" or any formulation that allows colon-split alias
  dependencies to survive.
- "Classify target availability" as the whole packet; D3 also owns owner roots,
  aggregate targets, aliases, graph reads, verify target planning, and refusal
  states.
- "Re-run or cite D0/D2" as sufficient for source implementation.
- "No fake target aliases" without the stronger rule: aliases are valid only
  when all dependency project/target pairs resolve in the current graph.

Safe wording:

- "D3 accepts only a complete Workspace Graph Integration authority boundary."
- "The `biome-ci` failure is the live falsifier, not the scope."
- "Plugin target inference, classify, verify planning, and tests consume one
  graph-fact authority."
- "Unresolved graph states are refusals, not runnable commands."

## Non-Claims

- This investigation does not implement source code.
- This investigation does not accept D3.
- This investigation does not treat the current false-green `biome-ci` command
  as the whole problem.
- This investigation does not authorize edits outside the scratch doc.
- Passing current tests or OpenSpec validation would not prove D3 acceptance
  unless the full authority contract and falsifying validation above are present.
