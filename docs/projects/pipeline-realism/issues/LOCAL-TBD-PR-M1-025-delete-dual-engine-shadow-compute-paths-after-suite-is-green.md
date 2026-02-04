id: LOCAL-TBD-PR-M1-025
title: Delete dual-engine shadow compute paths after suite is green
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-017, LOCAL-TBD-PR-M1-020]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Once determinism + correlation gates are green, remove any metrics-only “shadow compute” paths used during transition (dual engine, comparison-only artifacts/layers), leaving exactly one authoritative pipeline path.

## Deliverables
- Delete comparison-only compute paths:
  - remove any code that computes legacy outputs “just for diagnostics” after cutover is complete (e.g. dual-read belts, legacy motion projections computed only for delta layers).
- Delete comparison-only visualization layers:
  - remove old-vs-new delta emissions that exist solely to support the transition once the gating suite is green.
  - keep only the stable, semantic tuning layers (D08r taxonomy) and the D09r validation suite.
- Ensure there is exactly one authoritative path per artifact boundary:
  - no runtime flags to switch between “legacy” and “new” engines remain in the standard recipe once this issue is done.

## Acceptance Criteria
- The pipeline has no shadow/dual paths:
  - there is no longer a “compute both and compare” mode in standard recipe execution (unless explicitly scoped to a dev-only recipe).
- The gating suite remains green after deletion:
  - determinism suite (`LOCAL-TBD-PR-M1-017`) passes,
  - correlation gates (`LOCAL-TBD-PR-M1-020`) pass.
- No lingering “just in case” toggles exist:
  - grep-based guard(s) prevent reintroducing dual-engine switches.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Run the determinism + gating suite:
  - the determinism suite added by `LOCAL-TBD-PR-M1-017` must pass without any shadow-path assistance.
- Add/extend a “no dual-engine” guard:
  - recommended home: `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` or a new `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-017`
  - `LOCAL-TBD-PR-M1-020`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (likely location for any “compare legacy vs new” belt outputs; delete once gates pass)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` (legacy tile projection path; ensure it isn’t retained solely for comparison emissions)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts` (debug dump path; ensure removed comparison layers don’t linger as “required”)
- `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts` (remove/adjust expectations for transition-only delta layers)
- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts` (enforce that only the new driver posture exists post-cleanup)

### References
- docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md
- docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md

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

- During M1 we intentionally introduce temporary “comparison”/dual-read plumbing to de-risk cutover:
  - dual-read Morphology inputs (`LOCAL-TBD-PR-M1-014`),
  - correlation diagnostics and delta layers for tuning/gating (`LOCAL-TBD-PR-M1-020`),
  - potentially legacy motion/morphology computations run in parallel for comparison.

### Proposed Change Surface

- Delete anything that exists only for transition-time confidence once the suite proves the new spine is correct.
- Keep only:
  - stable, semantic viz layer taxonomy (D08r),
  - and the D09r validation suite as the correctness authority.

### Pitfalls / Rakes

- Keeping shadow paths “for safety” that slowly diverge and become a second engine.
- Removing shadow paths before gates are strong enough (must ensure `LOCAL-TBD-PR-M1-017` + `LOCAL-TBD-PR-M1-020` are genuinely meaningful).

### Wow Scenarios

- **One spine, no ghosts:** the only way the pipeline runs is through the new causal spine, and the validation suite makes that confidence feel earned.
