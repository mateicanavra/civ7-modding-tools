id: LOCAL-TBD-PR-M3-007
title: Deterministic planning: vegetation (joint resolver over vegetation score layers)
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
- Replace vegetation feature planning with a deterministic joint-resolver planner op that consumes vegetation score layers and occupancy and emits vegetation intents without random gating.

## Deliverables
- `ecology-vegetation` stage:
  - step `plan-vegetation`
  - op `ops.planVegetation`
  - publishes:
    - `artifact:ecology.featureIntents.vegetation`
    - `artifact:ecology.occupancy.vegetation`

## Acceptance Criteria
- [ ] No chance knobs/probabilistic gating remain in vegetation planning.
- [ ] Planner consumes the shared score store (no recomputing "scores" inside planning).
- [ ] Selection across vegetation features is codified in the planner op (joint resolver), not in the step.
- [ ] Seeded randomness allowed only as a tie-breaker (equal scores).
- [ ] Placements are deterministically ordered before publishing.

## Testing / Verification
- Build+tests:
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-vegetation`
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
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: Legacy step planning entrypoint; in M3 it is replaced by dedicated planner stages.
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/**
    notes: Legacy multi-feature planning logic (M2 split); M3 replaces with score->plan joint resolver.
```

