# Closure Checklist: D3 Workspace Graph Boundary

## Design Readiness

- [x] Proposal cites controlling authority, source packet, negative review, D0, and D2.
- [x] Design records current diagnosis, target ontology, graph state model, plugin/service validation data flow, owner boundary, write set, protected paths, public compatibility map, safe refactor sequence, validation oracle, and downstream handoffs.
- [x] Design and spec model dependency declaration kinds for same-project target dependency, explicit project target dependency, aggregate/workspace dependency, and multi-dependency target relationships.
- [x] Spec delta uses normative requirements and scenarios for singular graph authority, full-domain graph inventory, closed target facts, dependency declaration resolution, shared plugin/service validation, consumer scope, D0/D2 blockers, and downstream graph fact consumption.
- [x] Tasks are ordered implementation steps with exact source blockers, write set, deletion checks, validation gates, and stop conditions.
- [x] Review ledger imports the D3 negative control findings and records repair evidence.
- [x] Downstream realignment names D4, D7, and D12 graph facts and non-claims.
- [x] Closure state rejects `biome-ci`-only acceptance because it fails the complete Workspace Graph Integration contract; `biome-ci` remains only a mandatory falsifier.
- [x] Fresh final D3 rereview has no accepted unresolved P1/P2 findings.
- [x] OpenSpec validation passes for `deep-habitat-d3-workspace-graph-boundary`.
- [x] Full OpenSpec validation passes.
- [x] Packet index is updated only after final D3 rereview acceptance.

## Implementation Prerequisites

- [x] Concrete D0 matrix rows exist for every D3-touched public or durable surface.
- [x] D2 graph projection implementation facts exist where D3 consumes live registry graph declarations.
- [x] Implementation branch starts from the approved implementation stack and is clean before source edits.
- [x] Source changes stay inside the approved D3 write set.
- [x] Protected paths are untouched or the packet is amended and rereviewed.

## Implementation Closure

- [x] Workspace Graph unit tests cover every graph state and bad-case refusal.
- [x] Workspace Graph dependency tests cover same-project dependency resolution, same-project missing-target refusal, explicit project dependency resolution, aggregate/multi-dependency resolution, and aggregate child-dependency failure.
- [x] Full-domain graph inventory oracle covers every Habitat-owned graph surface and dependency declaration kind, and fails unmanaged target/alias surfaces.
- [x] Plugin target inference tests prove aliases carry explicit Nx dependency declarations and cannot succeed through a no-op wrapper without dependency execution.
- [x] Classify tests prove available/unavailable/aggregate/refusal facts remain D0-compatible.
- [x] Verify target-plan tests prove verify consumes D3 graph facts without closing D12 receipt schema.
- [x] `nx show project @internal/habitat-harness --json` shows corrected `habitat:rule:biome-ci` dependency.
- [x] `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` records dependency execution evidence or fails before wrapper execution.
- [x] No colon-split dependency parser or duplicate owner-root map remains in D3-owned code.
- [x] Graphite layer is clean, reviewable, and does not proceed past unresolved packet approval.

## Implementation Evidence

- Habitat source JS in the D3 Nx path is reduced to a one-line `$HABITAT_TOOL/src/plugin.js` compatibility adapter for the D0/Nx path referenced by `nx.json` and the package export. The one-line registry JS compatibility re-export was deleted.
- Nx plugin implementation, rule alias mapping, and target construction live in TypeScript under `$HABITAT_TOOL/src/plugin/nx-plugin.ts`, `$HABITAT_TOOL/src/rules/registry/graph.ts`, and `$HABITAT_TOOL/src/plugin/target-definitions.ts`.
- Workspace graph source is TypeScript-owned under `$HABITAT_TOOL/src/lib/workspace-graph.ts`, `$HABITAT_TOOL/src/lib/workspace-graph/`, and `$HABITAT_TOOL/src/lib/workspace-graph-contract.ts`.
- D3 schema and DTO contracts are TypeBox-first. Runtime parsing uses TypeBox `Value`; exported TS types derive from schemas.
- `src/plugin/nx-plugin.ts` validates registry/options/target definitions through TypeBox and emits alias wrappers with explicit Nx `dependsOn` declarations instead of using package JSON target inventory as dependency authority.
- Rule alias facts are owned once by `$HABITAT_TOOL/src/rules/registry/graph.ts` and consumed by both plugin inference and classify/verify graph projections.
- The workspace `lint` classify aggregate is declared in the shared target-name contract as a D0-compatible workspace projection; it is not claimed as an inferred Nx plugin target.
- `$HABITAT_TOOL/package.json` includes the TS modules the plugin imports at runtime.
- The generated target is generic Habitat `file-layer`; host-specific generated-zone policy remains outside D3.
- Focused package validation passes: `bun run --cwd $HABITAT_TOOL check`, `bun run --cwd $HABITAT_TOOL build`, D3 graph/classify/verify/command behavioral tests, focused plugin inference test, `nx show project @internal/habitat-harness --json`, D3 strict OpenSpec, and full OpenSpec strict validation.
- Broad root validation still has pre-existing non-D3 residuals: MapGen config drift blocks `NX_DAEMON=false bun run build`; generated-output freshness blocks the full enforcement-surface test; broad Biome drift makes the alias execution gate fail inside `@internal/habitat-harness:biome:ci` after proving the wrapper no longer false-greens.
- Graphite closure is limited to the D3 source/record write set after final validation and boundary-review repairs; D3 is submitted through draft PR #1838 v3.

## Non-Claims

- D3 does not repair MapGen config drift, generated-output freshness drift, or broad Biome formatting drift outside the D3-touched write set.
- D3 does not close D4 orientation, D7 diagnostics/execution, D10 host policy, or D12 receipt/handoff work.
- D3 does not reopen D0 or D2. It consumes the D0 public-surface rows and D2 graph facts already cited in the implementation-start inventory.
