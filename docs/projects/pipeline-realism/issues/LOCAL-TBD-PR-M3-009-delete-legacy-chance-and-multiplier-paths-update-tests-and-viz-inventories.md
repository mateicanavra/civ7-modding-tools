id: LOCAL-TBD-PR-M3-009
title: Cleanup: delete legacy chance/multiplier paths; update tests + viz inventories (M3 no-fudging)
state: planned
priority: 2
estimate: 16
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-008]
blocked: []
related_to: [LOCAL-TBD-PR-M2-015]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Delete all remaining chance/multiplier based ecology logic and harden the test/viz inventory so the no-fudging posture cannot regress.

## Deliverables
- Legacy chance/multiplier paths deleted (not wrapped, not shimmed).
- `plot-effects` is deterministic (no `rollPercent`, no `coverageChance`), or its chance-based implementation is fully removed and replaced.
- Static scan gates and runtime invariants are updated to enforce:
  - no probabilistic gating
  - seeded randomness only for tie-breaking
- Viz inventories updated for the topology cutover and new truth artifacts.

## Acceptance Criteria
- [ ] `rg` scans for forbidden constructs in ecology truth planning are clean (allowlist only for tie-break helpers):
  - `rollPercent`, `coverageChance`, `chance`, `multiplier`
- [ ] Determinism suite: repeat run for fixed seeds is identical via `diag:diff`.
- [ ] Viz key inventory is explicitly documented/updated for M3 (no silent drift).

## Testing / Verification
- Build+tests:
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-final`
  - rerun and `diag:diff` is empty
- Static scan (tighten patterns/allowlist during implementation):
  - `rg -n \"rollPercent|coverageChance|chance\\b|multiplier\\b\" mods/mod-swooper-maps/src | cat`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-008`
- This is where we enforce "no legacy left": deletion is a feature.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Breadcrumbs (known violations to delete)

```yaml
known_violations:
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/strategies/default.ts
    notes: contains RNG-driven weight gating (`createLabelRng`, weights); forbidden in M3 stamping.
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/**
    notes: contains chance-based effect placement (`coverageChance`, `rollPercent`); must be replaced with deterministic planning.
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/**
    notes: contains multipliers/chances; replaced by deterministic wetlands planning.
```

