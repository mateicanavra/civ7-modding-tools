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

## Implementation Prerequisites Later

- [x] Concrete D0 matrix rows exist for every D3-touched public or durable surface.
- [x] D2 graph projection implementation facts exist where D3 consumes live registry graph declarations.
- [x] Implementation branch starts from the approved implementation stack and is clean before source edits.
- [ ] Source changes stay inside the approved D3 write set.
- [ ] Protected paths are untouched or the packet is amended and rereviewed.

## Implementation Closure Later

- [ ] Workspace Graph unit tests cover every graph state and bad-case refusal.
- [ ] Workspace Graph dependency tests cover same-project dependency resolution, same-project missing-target refusal, explicit project dependency resolution, aggregate/multi-dependency resolution, and aggregate child-dependency failure.
- [ ] Full-domain graph inventory oracle covers every Habitat-owned graph surface and dependency declaration kind, and fails unmanaged target/alias surfaces.
- [ ] Plugin target inference tests prove aliases require resolved dependencies.
- [ ] Classify tests prove available/unavailable/aggregate/refusal facts remain D0-compatible.
- [ ] Verify target-plan tests prove verify consumes D3 graph facts without closing D12 receipt schema.
- [ ] `nx show project @internal/habitat-harness --json` shows corrected `habitat:rule:biome-ci` dependency.
- [ ] `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` records dependency execution evidence or fails before wrapper execution.
- [ ] No colon-split dependency parser or duplicate owner-root map remains in D3-owned code.
- [ ] Graphite layer is clean, reviewable, and does not proceed past unresolved packet approval.

## Non-Claims

- D3 implementation-start records do not implement TypeScript or JavaScript source.
- D3 source implementation is unblocked by `workstream/implementation-start-inventory.md`;
  implementation closure remains open until source, validation, review, and repair complete.
- D3 design repair does not prove public compatibility, downstream safety, runtime behavior, Graphite readiness, or product completion.
