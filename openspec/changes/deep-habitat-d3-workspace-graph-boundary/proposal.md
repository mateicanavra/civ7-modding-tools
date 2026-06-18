# Proposal: D3 Workspace Graph Boundary

## Summary

Design the D3 Workspace Graph Boundary as the single Habitat authority for Nx
project ownership, target availability, workspace gates, and rule-target alias
dependency declarations. This packet repairs the current false-green alias hazard where
`habitat:rule:biome-ci` can pass while its `dependsOn` project pattern resolves
no project.

D3 is design/specification work only. It does not implement source changes, and
it does not make D3 implementation-ready until concrete D0 public-surface rows
and D2 graph projection implementation facts exist.

## Authority

- Context/router fixture: `$REMEDIATION_DIR/context.md`.
- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Source domino packet: `$D3_SOURCE_PACKET`.
- Negative control review: `$D3_NEGATIVE_REVIEW`.
- D0 accepted design/specification: `deep-habitat-d0-command-surface-inventory`.
- D2 accepted design/specification: `deep-habitat-d2-rule-registry-metadata-contract`.
- Current Habitat Toolkit code and command behavior as present-state evidence only.

## Product Scenario

An agent asks Habitat which repo checks are relevant for a path or a change. The
answer must reflect current Nx graph truth. A command must not appear runnable
when its project, target, dependency declaration, or dependency relationship
cannot be resolved.

## Problem Statement

Current target authority is split:

- `$HABITAT_TOOL/src/plugin.js` creates Nx targets and alias wrappers.
- `$HABITAT_TOOL/src/lib/nx-projects.ts` reads project/target metadata.
- `$HABITAT_TOOL/src/lib/command-engine.ts` builds classify and verify
  target output from an incomplete local target model that does not own alias
  dependencies, aggregate workspace gates, or graph read failures.

The live falsifier is `habitat:rule:biome-ci`: the plugin parses `biome:ci` as
`projects: ["biome"], target: "ci"`, even though `biome` is not an Nx project.
Nx can warn that the pattern matches no projects while the alias wrapper exits
0 through `node -e ""`. D3 exists to make that state impossible.

That falsifier is not the whole D3 scope. The same code path also emits
same-project target dependencies such as `{ target: "boundaries" }`, explicit
project target dependencies, aggregate/workspace dependencies, and
multi-dependency targets such as `generated:check`. D3 must model and validate
all of those declaration kinds through one graph authority.

## What Changes

- D3 defines a closed graph state model before source implementation:
  available project target, unavailable project target, alias target with
  resolved dependency, aggregate/workspace target, and graph refusal states.
- D3 establishes the Workspace Graph module as the owner of owner roots, target
  names, dependency declaration construction, dependency-kind normalization,
  graph reads, and graph-read failures.
- `plugin.js`, `nx-projects.ts`, `command-engine.ts`, and graph-focused tests
  must consume that owner boundary rather than carrying local graph truth.
- Falsifying validation must include an injected missing-project alias and a
  cache-disabled alias run or dependency-execution record. A no-op wrapper
  success is failure when dependency resolution fails.

## What Does Not Change

- D3 does not redesign rule registry metadata beyond consuming D2 graph
  projections.
- D3 does not own D7 structural enforcement aggregation or diagnostic
  semantics. D3 still owns every graph-backed check invocation surface it
  exposes through Nx target inference.
- D3 does not own verify receipt schema; it provides graph target facts that D12
  may record later.
- D3 does not own D4 orientation wording, D7 enforcement aggregation, or D12
  handoff receipt semantics.

## Requires

- D0 accepted design/specification. Source implementation remains blocked until
  concrete D0 matrix rows exist for classify JSON, verify output, Nx inferred
  targets, root scripts, package exports, and docs/examples touched by D3.
- D2 accepted design/specification. Source implementation remains blocked until
  D2 graph projection implementation facts exist for rule graph declarations and
  alias target intent.

## Enables

- D4 may consume D3 project ownership and target availability facts for
  orientation/routing design.
- D7 may consume D3 target facts for enforcement execution planning design.
- D12 may consume D3 graph-read, target-plan, and dependency-resolution facts
  for verify handoff receipt design.

## Consumer Scope

| Consumer | D3 role | Non-claim |
| --- | --- | --- |
| `habitat classify` | Direct Workspace Graph service consumer for project ownership, target facts, unavailable targets, and graph refusals. | D3 does not own D4 prose/orientation presentation. |
| `habitat check` CLI | Non-goal for direct graph reads; it consumes D3 only through Nx-inferred `habitat:check` and `habitat:rule:*` target surfaces. | D3 does not rewrite D7 check aggregation or diagnostics. |
| `habitat verify` | Direct consumer for verify target plan availability and graph-read refusal states; D12 owns receipt schema and handoff wording. | D3 does not close D12 receipt semantics. |
| Nx plugin target inference | Direct Workspace Graph contract consumer for owner roots, target names, aggregate gates, dependency declarations, and resolved dependency relationships. | D3 does not invent generated-output or protected-zone policy. |

## Stop Conditions

- `habitat:rule:biome-ci` can pass while its dependency project/target is
  unresolved.
- Same-project target dependencies, explicit project dependencies,
  aggregate/workspace dependencies, or multi-dependency relationships are not
  first-class D3 declarations validated against the Workspace Graph snapshot.
- Alias dependencies are still parsed from colon-delimited strings.
- `plugin.js` and classify retain separate owner-root or target-authority maps.
- Graph read errors collapse into generic command success or generic command
  failure without a graph refusal state.
- D3 artifacts leave classify/check/verify consumer scope, write set, or
  validation oracle to implementation-time inference.

## Verification Gates

- `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts`
- `bun run --cwd $HABITAT_TOOL test -- test/lib/enforcement-surface.test.ts`
- `bun run --cwd $HABITAT_TOOL test -- test/lib/classify.test.ts`
- `nx show project @internal/habitat-harness --json`
- `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`
- `bun run habitat classify $HABITAT_TOOL/src/plugin.js --json`
- Workspace Graph unit coverage for same-project, explicit-project, aggregate,
  and multi-dependency declaration resolution/failure
- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
- `bun run openspec:validate`
- `git diff --check`

The alias run passes only if it records real dependency execution for the
canonical Habitat Biome target or fails before wrapper execution. A successful
no-op wrapper without resolved dependency execution is a failed D3 validation.
