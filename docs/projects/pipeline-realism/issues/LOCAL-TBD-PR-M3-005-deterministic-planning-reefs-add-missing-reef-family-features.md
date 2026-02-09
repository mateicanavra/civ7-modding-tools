id: LOCAL-TBD-PR-M3-005
title: Deterministic planning: reefs (consume scoreLayers + occupancy; add missing reef-family features)
state: planned
priority: 2
estimate: 16
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-003]
blocked: [LOCAL-TBD-PR-M3-008, LOCAL-TBD-PR-M3-009]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement a deterministic reef-family planner that consumes the shared score store and occupancy and emits reef-family intents without chance-based gating.

## Deliverables
- `ecology-reefs` stage:
  - step `plan-reefs`
  - op `ops.planReefs`
  - publishes:
    - `artifact:ecology.featureIntents.reefs`
    - `artifact:ecology.occupancy.reefs`
- Reef-family features are all first-class in M3:
  - `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ATOLL`, `FEATURE_LOTUS`

## Acceptance Criteria
- [ ] No chance knobs/probabilistic gating remain in reef planning.
- [ ] Planner respects occupancy chain and only claims allowed tiles.
- [ ] Feature availability is determined by deterministic constraints (shoreline, temperature, depth masks), not randomness.
- [ ] Placement ordering and tie-breaking are deterministic (seeded tie-breaks only for exact ties).

## Testing / Verification
- Build+tests:
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-reefs`
  - rerun and `diag:diff` is empty
- Static scan:
  - `rg -n \"rollPercent|chance\\b|multiplier\\b\" mods/mod-swooper-maps/src/domain/ecology/ops | cat`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-003`
- Blocks: integration and deletion issues.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Breadcrumbs

```yaml
files:
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/**
    notes: Current reef planning op surface to replace; ensure cold reefs/atolls/lotus are actually produced.
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: Current monolithic orchestration site that will be replaced by the dedicated planner stages.
  - path: mods/mod-swooper-maps/src/domain/ecology/types.ts
    notes: Reef feature keys inventory (must match scoreLayers).
```
