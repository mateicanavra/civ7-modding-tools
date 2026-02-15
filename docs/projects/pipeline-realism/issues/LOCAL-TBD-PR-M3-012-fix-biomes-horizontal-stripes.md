id: LOCAL-TBD-PR-M3-012
title: Bugfix: biomes horizontal stripe banding (grassland/tundra/rainforest dominate) + downstream fallout
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism, bug]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-011]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Investigate and fix a biomes banding bug where only a few biomes dominate in large horizontal stripes; ensure downstream ecology calcs consume correct, non-banded climate layers.

## Deliverables
- Root cause identified (wiring/indexing/artifact consumption) with a minimal fix.
- Add a regression test that would fail under the banding bug and pass with the fix.
- Confirm downstream ecology (vegetation/wetlands/reefs/ice/plot-effects) consumes the correct artifacts post stage split (no silent fallbacks).

## Acceptance Criteria
- [ ] Biomes output no longer exhibits map-wide horizontal stripe domination for fixed seeds.
- [ ] Climate truth layers (temp/moisture/aridity/freeze) are verified non-banded, and biomes correctly reflect them.
- [ ] Determinism preserved (repeat run for fixed seed is identical via `diag:diff`).

## Testing / Verification
- Repro + determinism:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-012`
  - rerun and `diag:diff` is empty
- Targeted tests (to be defined once the fix is localized):
  - `bun --cwd mods/mod-swooper-maps test test/ecology`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-011` (do not start implementation until the docs sweep is closed).

### Investigation Checklist
- Verify upstream climate layers (temperature/moisture/aridity/freeze) are not already banded.
- Check typed-array indexing (`idx = y * width + x`) everywhere; banding often indicates swapped/incorrect indexing.
- Confirm biomes stage is consuming the right artifacts post stage split (no silent fallback to latitude bands).
- Confirm noise/humidity sources are wired and not constant.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

