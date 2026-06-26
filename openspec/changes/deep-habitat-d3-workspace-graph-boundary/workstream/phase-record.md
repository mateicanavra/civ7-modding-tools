# Phase Record: D3 Workspace Graph Boundary

## State

- Status: source implementation and boundary-review repairs validated locally;
  Graphite closure is represented by draft PR #1838 v3 for D3 packet handoff.
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

Design/specification gate closed. Source implementation was unblocked by
`workstream/implementation-start-inventory.md`, which cites concrete D0 rows and
live D2 graph projection facts. The D3 implementation now exists in source and
keeps `$HABITAT_TOOL/src/plugin.js` as a one-line compatibility adapter for the
D0/Nx path in `nx.json`/package exports while moving Nx plugin implementation,
rule alias mapping, target-definition construction, graph/service contracts,
and schemas into TypeScript and TypeBox modules.

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
| D3-GRAPH-UNIT | `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts test/lib/classify.test.ts test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts test/lib/enforcement-surface.test.ts -t "proves Habitat-owned Nx target inference\|Workspace graph\|Habitat classify\|verify receipt\|Habitat oclif commands" --reporter=verbose` | closed graph states, plugin inference, and refusal bad cases pass | pass: 5 files, 45 tests, 7 skipped | fresh test run after boundary-review repairs | does not prove broad Nx command execution | closed |
| D3-PLUGIN | `bun run --cwd $HABITAT_TOOL test -- test/lib/enforcement-surface.test.ts -t "proves Habitat-owned Nx target inference" --reporter=verbose` | plugin target inference consumes graph contract and rejects unresolved aliases | pass: focused plugin inference case | fresh test run | does not prove classify JSON compatibility | closed for D3 plugin inference |
| D3-PLUGIN-FULL | `bun run --cwd $HABITAT_TOOL test -- test/lib/enforcement-surface.test.ts --reporter=verbose` | full file passes | fail: generated-output freshness case exits `130` | fresh test run | failure is not a D3 graph-contract failure | residual existing generated-output freshness owner; not repaired in D3 |
| D3-CLASSIFY | `bun run habitat classify $HABITAT_TOOL/src/plugin.js` | classify distinguishes available/unavailable/aggregate/refusal states | pass; command emits JSON by default, `graphRefusals: []` for plugin path | fresh command/test run | does not prove D4 orientation closure | closed |
| D3-INVENTORY | graph inventory through `workspace-graph.test.ts`, classify tests, and `nx show project @internal/habitat-harness --json` | every Habitat-owned owner root, aggregate/workspace target, `habitat:check` target, `habitat:rule:*` alias target, dependency declaration kind, resolved dependency relationship, unavailable project target, and graph refusal bad case is emitted from Workspace Graph module | pass for D3-owned behavior | fresh test/command run | does not prove command execution success | closed |
| D3-DEPENDENCY-KINDS | `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts` dependency-kind cases | same-project dependency resolution, same-project missing-target refusal, explicit-project dependency resolution, aggregate/multi-dependency resolution, and aggregate child-dependency failure pass | pass as part of D3-GRAPH-UNIT | fresh test run | does not prove Nx command execution | closed |
| D3-NX-SHOW | `NX_DAEMON=false nx show project @internal/habitat-harness --json` | `habitat:rule:biome-ci` depends on the real Habitat Biome target, not `projects:["biome"]` | pass: depends on `@internal/habitat-harness:biome:ci`; all 16 `habitat:rule:*` aliases are inferred; `generated:check` uses generic `habitat check --tool file-layer` | daemon disabled | does not prove dependency executed | closed |
| D3-ALIAS-RUN | `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` | dependency execution evidence exists or command fails before wrapper execution | pass for falsifier: command invoked `@internal/habitat-harness:biome:ci` and failed inside Biome before wrapper execution | cache disabled; daemon disabled | does not prove Biome semantics | closed for false-green prevention; broad Biome drift remains outside D3 |
| D3-BUILD | `bun run --cwd $HABITAT_TOOL build`; `NX_DAEMON=false bun run build` | Habitat package builds; root build status recorded | Habitat package build passes after the TS plugin split; root build fails in existing MapGen config drift (`migrate:configs:check`, `gen:studio-recipes-types`) | fresh command run | root build failure is not caused by D3 source | residual MapGen config drift owner |
| D3-PACKAGE-FILES | `npm pack --dry-run --json` from `$HABITAT_TOOL` | plugin runtime imports are included in package file boundary | pass: `src/plugin.js`, `src/plugin/nx-plugin.ts`, `src/plugin/**`, `src/lib/workspace-graph/**`, `src/lib/workspace-graph-contract.ts`, and `src/rules/registry/**` are included; stale deleted plugin alias outputs are absent after clean/build | dry-run package inventory | does not publish package | closed |
| D3-VERIFY | focused verify receipt tests and command tests | verify plan derives from D3 target facts | pass as part of D3-GRAPH-UNIT | fresh test run | does not close D12 receipt schema | closed |
| D3-OPENSPEC | `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` and `bun run openspec:validate` | exit 0 | pass: D3 strict and full OpenSpec strict validate | fresh command run | structural validation only | closed |
| D3-DIFF | `git diff --check` | exit 0 | pass | fresh command run | whitespace only | closed |

## Non-Claims

- D3 does not reopen D0 matrix rows; D3 cites stable `surface_id`s and preserves
  current runtime behavior unless this packet explicitly changes it.
- D3 does not own D7 check diagnostics or D12 receipt schema.
- D3 graph target availability does not prove target success.
- D3 does not repair existing MapGen config drift, generated-output freshness
  drift, or broad Biome formatting drift outside the D3-touched write set.
