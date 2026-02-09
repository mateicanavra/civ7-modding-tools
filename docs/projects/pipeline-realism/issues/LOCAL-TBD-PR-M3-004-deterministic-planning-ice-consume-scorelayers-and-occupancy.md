id: LOCAL-TBD-PR-M3-004
title: Deterministic planning: ice (consume scoreLayers + occupancy; publish intents + snapshot)
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
- Replace ice planning with a deterministic planner op that consumes `artifact:ecology.scoreLayers` and the occupancy snapshot chain, then publishes `featureIntents.ice` and `occupancy.ice`.

## Deliverables
- `ecology-ice` stage:
  - step `plan-ice`
  - op `ops.planIce`
  - publishes:
    - `artifact:ecology.featureIntents.ice`
    - `artifact:ecology.occupancy.ice`

## Acceptance Criteria
- [ ] No chance knobs or probabilistic gating remain in ice planning.
- [ ] Planner only uses seeded randomness as a *tie-breaker* (equal-score tiles), never as a gate.
- [ ] Planner respects occupancy:
  - never claims reserved tiles
  - never claims already-occupied tiles
- [ ] Placements are sorted deterministically before publishing (stable viz/diag).

## Testing / Verification
- Build+tests:
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-ice`
  - rerun and `diag:diff` is empty
- Static scan:
  - `rg -n \"rollPercent|chance\\b|jitter|multiplier\\b\" mods/mod-swooper-maps/src/domain/ecology/ops | cat`

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
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/plan-ice/**
    notes: Existing chance-based logic must be deleted and replaced with deterministic planning.
  - path: docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/CONTRACTS.md
    notes: Ice planner contract is locked here.
```

