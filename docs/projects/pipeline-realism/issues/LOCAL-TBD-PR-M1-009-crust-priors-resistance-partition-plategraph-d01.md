id: LOCAL-TBD-PR-M1-009
title: Crust priors + resistance partition -> plateGraph (D01)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-006, LOCAL-TBD-PR-M1-005]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Compute crust-first resistance priors and perform resistance-aware plate partitioning (D01), producing an authoritative `artifact:foundation.plateGraph`.

## Deliverables
- Implement the D01 ordering posture (crust priors before plates):
  - crust/lithosphere priors (from `LOCAL-TBD-PR-M1-006`) must exist before partitioning,
  - plate partition must respect resistance fields (avoid bisecting stable/strong regions without explicit justification).
- Emit/maintain `artifact:foundation.plateGraph` as the authoritative partition output:
  - cell→plate assignment,
  - per-plate metadata needed by later motion/events (role/kind/seed/motion placeholders if needed).
- If partitioning requires additional “auxiliary truth” artifacts (e.g., resistance fields or diagnostics), publish them explicitly (no hidden shared state).

## Acceptance Criteria
- The plate graph is derived from crust priors/resistance (not from “plateCount-only Voronoi”):
  - changing the resistance field produces a measurable change in partition output,
  - while deterministic seeds preserve replay stability.
- Partition validity guards exist:
  - no degenerate sliver plates beyond defined thresholds,
  - contiguity policy is explicit (either enforced or explicitly waived with rationale).
- Any legacy partition path is either removed or explicitly bridged with a deletion target (`LOCAL-TBD-PR-M1-023..025`).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Extend/replace existing partition tests to match the new semantics:
  - existing anchors for partition sanity: `mods/mod-swooper-maps/test/foundation/m11-polar-plates-policy.test.ts`
- Add a determinism + resistance sensitivity test:
  - same inputs => same partition,
  - changed resistance field => different partition (within expected bounds).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-006`
  - `LOCAL-TBD-PR-M1-005`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md
- docs/system/libs/mapgen/reference/domains/FOUNDATION.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

Today’s plate partition exists and is mesh-first, but is not driven by mantle forcing and does not follow the basaltic-lid posture:
- op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`
- tests: `mods/mod-swooper-maps/test/foundation/m11-polar-plates-policy.test.ts`

### Proposed Change Surface

Expected implementation touchpoints:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/*`
  - incorporate resistance priors from the new crust/lithosphere state.
- downstream consumers (segments/history) that assume specific plateGraph motion fields today:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/*`

### Pitfalls / Rakes

- Partition becomes “resistance-aware” only nominally (resistance computed but not used meaningfully).
- The new partition invalidates downstream assumptions (plate IDs/roles) without updating tests/validation, causing misleading failures later (especially in event/provenance logic).

### Wow Scenarios

- **Cratons don’t get bisected:** stable strong lithosphere regions persist through partitioning and become the seeds of long-lived continental cores once events/provenance begin to accumulate.
