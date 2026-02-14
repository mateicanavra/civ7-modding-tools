id: LOCAL-TBD-PR-M4-002
title: foundation ops boundaries
state: planned
priority: 1
estimate: 16
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, foundation]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M4-001]
blocked: [LOCAL-TBD-PR-M4-003]
related_to: [LOCAL-TBD-PR-M4-005]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Decompose Foundation mega-ops and enforce step-owned orchestration so op contracts are atomic, truthful, and no-op-calls-op.

## Deliverables
- Decomposition plan for `compute-tectonic-history` into focused op units with step-layer orchestration.
- Contract updates removing passed-but-unused inputs and dead/inert strategy surfaces.
- Explicit op boundary for `plate-topology` (step no longer owns compute internals).
- Rules/strategy factoring map for affected operations.

## Acceptance Criteria
- [ ] `compute-tectonic-history` op-calls-op pattern is eliminated in target plan and mapped to new op contracts.
- [ ] Dead config/strategy fields are removed from plan-level contract surfaces.
- [ ] `plate-topology` is modeled as op-boundary work item, not step-local compute.
- [ ] Verification commands exist for op-calls-op scan and dead-surface scan.

## Testing / Verification
- `rg -n "computeTectonicSegments\.run|op-calls-op|passed-but-unused|dead" docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md`
- `rg -n "compute-tectonic-history|compute-plate-topology" docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md`
- Planned scan command: `rg -n "\.run\(" mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M4-001`
- Blocks: `LOCAL-TBD-PR-M4-003`
- Related: `LOCAL-TBD-PR-M4-005`
- Paper trail: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Path map
```yaml
files:
  - path: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
    notes: mega-op split source
  - path: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
    notes: remove drifted/unused inputs
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
    notes: orchestration ownership target
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts
    notes: step-local compute extraction target
```

### Prework Findings (Complete)
1. Decomposition target op list and boundary rationale are already captured in spike agent B output.
2. Contract drift items to remove are captured in spike agent D output.
