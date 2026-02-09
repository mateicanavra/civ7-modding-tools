id: LOCAL-TBD-PR-M3-006
title: Deterministic planning: wetlands + wet features (joint resolver; no disabled strategies)
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
- Implement a deterministic wetlands-family planner op that consumes wet-feature score layers, resolves intra-family conflicts explicitly, and publishes wetlands intents without probability gates or "disabled" toggles.

## Deliverables
- `ecology-wetlands` stage:
  - step `plan-wetlands`
  - op `ops.planWetlands`
  - publishes:
    - `artifact:ecology.featureIntents.wetlands`
    - `artifact:ecology.occupancy.wetlands`
- Wet-family features are first-class:
  - `FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`

## Acceptance Criteria
- [ ] No chance knobs/probabilistic gating remain in wet planning.
- [ ] No multipliers/bonuses used to gate existence.
- [ ] No "disabled strategy" or silent skip remains in the runtime path.
- [ ] Planner respects occupancy chain and only claims allowed tiles.
- [ ] Selection among wet-feature candidates is codified inside the planner op (joint resolver), not in the step.

## Testing / Verification
- Build+tests:
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-wetlands`
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
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/**
    notes: Current chance/multiplier-based wet placement logic must be deleted and replaced.
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/strategies/default.ts
    notes: Evidence of current "chances/multipliers" posture that is forbidden in M3.
```

