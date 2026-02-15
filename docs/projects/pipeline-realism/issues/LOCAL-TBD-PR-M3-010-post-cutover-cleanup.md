id: LOCAL-TBD-PR-M3-010
title: Post-cutover cleanup: split plot-effects score ops + stabilize viz categories/colors + keep presets in sync
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-009]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Split plot-effects scoring into dedicated compute ops (snow/sand/burned), refactor placement to consume score arrays, and make plot-effects viz categorical mapping stable with explicit colors.

## Deliverables
- Add dedicated plot-effects score ops:
  - `ecology/plot-effects/score/snow`
  - `ecology/plot-effects/score/sand`
  - `ecology/plot-effects/score/burned`
- Refactor `ecology/plot-effects/placement` to:
  - consume the score arrays (plus minimal masks/inputs)
  - perform deterministic top-coverage selection
  - use seeded RNG only as a tie-break for exact-equal scores
- Refactor map-ecology plot-effects step to orchestrate: score ops -> placement op -> apply.
- Stabilize plot-effects viz categories:
  - replace dynamic `valueByKey` mapping with a stable key -> integer mapping
  - provide explicit `meta.categories` entries with `value`, `label`, and `[r,g,b,a]` color tuples
- Keep default preset/config in sync (earthlike):
  - `$MOD/src/maps/configs/swooper-earthlike.config.json`
  - `$MOD/src/presets/standard/earthlike.json`
- Update tests meaningfully for the new ops and viz categories.

## Acceptance Criteria
- [ ] No chance/multiplier logic in plot-effects planning:
  - no probabilistic gating
  - seeded randomness only for tie-break ordering on exact equal scores
- [ ] New score ops validate and are wired into the map-ecology plot-effects step.
- [ ] Plot-effects viz uses stable category mapping with explicit colors (no dynamic category assignment).
- [ ] Earthlike preset/config remain aligned for plot-effects configuration.

## Testing / Verification
- Slice gates:
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
  - `bun run build`
  - `timeout 20s bun run dev:mapgen-studio` (exit `124` OK if it started; fail only on early crash)
- Determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-010`
  - rerun with same args yields identical outputs per `diag:diff` (empty)

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-009`
- This is a cleanup slice: deletions are a feature (no dual paths/wrappers/shims).

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

