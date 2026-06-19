# Phase Record: D3 Workspace Graph Boundary

## State

- Status: implementation-start preconditions closed; source implementation in
  progress; not implementation-complete.
- Worktree: `$REPO_ROOT` from `$REMEDIATION_DIR/context.md`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH` from `$REMEDIATION_DIR/context.md`.
- Source packet: `$D3_SOURCE_PACKET`.
- Negative control review: `$D3_NEGATIVE_REVIEW`.
- OpenSpec change: `$D3_CHANGE`.

## Objective

Specify the complete Workspace Graph Integration authority contract: current Nx
graph read states, project/target facts, dependency declaration kinds, resolved
dependency relationships, aggregate workspace targets, graph refusals/errors,
classify/check/verify consumer projections, false-green prevention, and
downstream D4/D7/D12 handoffs.

## Current Gate

Design/specification gate closed. Source implementation is now unblocked by
`workstream/implementation-start-inventory.md`, which cites concrete D0 rows and
live D2 graph projection facts.

## Dependency State

| Dependency | Status | D3 handling |
| --- | --- | --- |
| D0 command surface inventory | concrete matrix submitted in PR #1832 | D3 cites stable `surface_id` rows in `workstream/implementation-start-inventory.md`; D3 does not reopen D0 from this layer. |
| D2 rule registry metadata contract | source implementation submitted in PR #1837 | D3 consumes live `ruleGraphFacts`/graph projection implementation facts recorded in `workstream/implementation-start-inventory.md`. |

## Completion Gates

- [x] Negative D3 review imported into `review-disposition-ledger.md`.
- [x] Complete Workspace Graph ontology and state model recorded in `design.md`.
- [x] Dependency declaration topology for same-project, explicit-project,
      aggregate/workspace, and multi-dependency relationships recorded.
- [x] Canonical graph module boundary, write set, and protected paths recorded in `design.md`.
- [x] False-green alias prevention and injected-alias falsifier recorded in proposal/design/spec/tasks.
- [x] Classify/check/verify consumer contracts and D0 compatibility handling recorded.
- [x] D0/D2 design-vs-implementation dependency handling recorded.
- [x] D4/D7/D12 graph facts and non-claims recorded in downstream ledger.
- [x] Fresh D3 rereview accepts the repaired packet for design/specification.
- [x] Implementation-start inventory cites D0 public-surface rows and D2 live
      graph projection facts before source edits.

## Validation Results Recording Contract

Implementation validation results must use this shape:

| Gate ID | Command or check | Expected status | Actual status | Cache/freshness stance | Non-claims | Blocker disposition |
| --- | --- | --- | --- | --- | --- | --- |
| D3-GRAPH-UNIT | `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts` | closed graph states and refusal bad cases pass | pending | fresh test run | does not prove Nx command execution | pending |
| D3-PLUGIN | `bun run --cwd $HABITAT_TOOL test -- test/lib/enforcement-surface.test.ts` | plugin target inference consumes graph contract and rejects unresolved aliases | pending | fresh test run | does not prove classify JSON compatibility | pending |
| D3-CLASSIFY | `bun run --cwd $HABITAT_TOOL test -- test/lib/classify.test.ts` and `bun run habitat classify $HABITAT_TOOL/src/plugin.js --json` | classify distinguishes available/unavailable/aggregate/refusal states | pending | fresh command/test run | does not prove D4 orientation closure | pending |
| D3-INVENTORY | full-domain graph inventory oracle named by implementation | every Habitat-owned owner root, aggregate/workspace target, `habitat:check` target, `habitat:rule:*` alias target, dependency declaration kind, resolved dependency relationship, unavailable project target, and graph refusal bad case is emitted from Workspace Graph module | pending | fresh test run | does not prove command execution success | pending |
| D3-DEPENDENCY-KINDS | `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts` dependency-kind cases | same-project dependency resolution, same-project missing-target refusal, explicit-project dependency resolution, aggregate/multi-dependency resolution, and aggregate child-dependency failure pass | pending | fresh test run | does not prove Nx command execution | pending |
| D3-NX-SHOW | `nx show project @internal/habitat-harness --json` | `habitat:rule:biome-ci` depends on the real Habitat Biome target, not `projects:["biome"]` | pending | fresh command run | does not prove dependency executed | pending |
| D3-ALIAS-RUN | `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` | dependency execution evidence exists or command fails before wrapper execution | pending | cache disabled; daemon disabled | does not prove Biome semantics | pending |
| D3-VERIFY | verify target-plan unit or command test named by implementation | verify plan derives from D3 target facts | pending | fresh test run | does not close D12 receipt schema | pending |
| D3-OPENSPEC | `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` and `bun run openspec:validate` | exit 0 | pending | fresh command run | structural validation only | pending |
| D3-DIFF | `git diff --check` | exit 0 | pending | fresh command run | whitespace only | pending |

## Non-Claims

- D3 implementation-start records do not implement Habitat source changes.
- D3 does not reopen D0 matrix rows; D3 cites stable `surface_id`s and preserves
  current runtime behavior unless this packet explicitly changes it.
- D3 does not own D7 check diagnostics or D12 receipt schema.
- D3 graph target availability does not prove target success.
