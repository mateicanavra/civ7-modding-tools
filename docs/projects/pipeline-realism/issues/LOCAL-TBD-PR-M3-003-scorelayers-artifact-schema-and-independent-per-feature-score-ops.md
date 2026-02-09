id: LOCAL-TBD-PR-M3-003
title: ScoreLayers: artifact schema + independent per-feature score ops (all ecology features)
state: planned
priority: 1
estimate: 16
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-002]
blocked: [LOCAL-TBD-PR-M3-004, LOCAL-TBD-PR-M3-005, LOCAL-TBD-PR-M3-006, LOCAL-TBD-PR-M3-007, LOCAL-TBD-PR-M3-008, LOCAL-TBD-PR-M3-009]
related_to: [LOCAL-TBD-PR-M2-005, LOCAL-TBD-PR-M2-006]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the dedicated truth score stage that publishes `artifact:ecology.scoreLayers` (all feature keys) and `artifact:ecology.occupancy.base`, with strict score-independence posture.

## Deliverables
- `ecology-features-score` stage exists with one step `score-layers` that publishes:
  - `artifact:ecology.scoreLayers` (single shared score store)
  - `artifact:ecology.occupancy.base` (reserved/available tile mask)
- Score ops exist for every feature key in the packet inventory:
  - vegetation: `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`, `FEATURE_SAVANNA_WOODLAND`, `FEATURE_SAGEBRUSH_STEPPE`
  - wet: `FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`
  - reef: `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ATOLL`, `FEATURE_LOTUS`
  - ice: `FEATURE_ICE`

## Acceptance Criteria
- [ ] `artifact:ecology.scoreLayers` schema-validated and contains *every* feature layer (typed arrays sized `width*height`).
- [ ] Score independence enforced:
  - no score op reads another feature's score layer
  - cross-feature preferences are encoded in planners only
- [ ] Scores are normalized suitability 0..1 (no chance knobs, no multipliers that gate existence).
- [ ] `artifact:ecology.occupancy.base` correctly marks permanently reserved tiles deterministically (ocean/deep water/cliff/etc as defined by the packet).

## Testing / Verification
- Build+tests:
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-scores`
  - rerun same command and `diag:diff` shows identical score layers
- Static rails (exact patterns may evolve, but posture is required):
  - `rg -n \"rollPercent|coverageChance|chance\\b|multiplier\\b\" mods/mod-swooper-maps/src/domain/ecology/ops | cat`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-002`
- Blocks: all planner issues.
- Related: M2 compute substrate provides shared fields; reuse where possible, but do not reintroduce mega-ops.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Breadcrumbs (likely touch points)

```yaml
files:
  - path: mods/mod-swooper-maps/src/domain/ecology/types.ts
    notes: FeatureKey inventory (must match scoreLayers keys).
  - path: mods/mod-swooper-maps/src/domain/ecology/ops
    notes: Add/replace score ops per feature.
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/vegetation-score-*
    notes: Existing vegetation scoring ops already match the "independent score layer" posture; reuse them as the canonical vegetation layers in `artifact:ecology.scoreLayers`.
  - path: packages/mapgen-core/src
    notes: Artifact schema plumbing / TypeBox helpers / validation surfaces.
```
