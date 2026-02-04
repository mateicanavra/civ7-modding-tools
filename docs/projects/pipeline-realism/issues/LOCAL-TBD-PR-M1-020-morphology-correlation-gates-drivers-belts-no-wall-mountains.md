id: LOCAL-TBD-PR-M1-020
title: Morphology correlation gates: drivers -> belts (no wall mountains) + distribution checks
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-015, LOCAL-TBD-PR-M1-004]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add strict, quantitative correlation gates between the new drivers and Morphology belt outcomes, preventing regressions like wall-mountains or noise-driven belts.

## Deliverables
- Implement morphology correlation gates (using the shared harness from `LOCAL-TBD-PR-M1-004`) that validate:
  - belts correlate with driver corridors (history/provenance driven),
  - belts are not noise-only artifacts,
  - and belt distributions are plausible (coverage/width/continuity).
- Add explicit distribution checks (“no wall mountains”):
  - prevent long, 1-tile-wide ridges across the map,
  - enforce minimum corridor width quantiles for belt masks.

## Acceptance Criteria
- Correlation gates are:
  - deterministic,
  - run in CI (via the determinism suite `LOCAL-TBD-PR-M1-017`),
  - and fail loudly with actionable messages when violated.
- The gates can detect at least two failure modes:
  - belts appear where driver signals are absent (false positives / noise-driven),
  - belts fail to appear where drivers are strong (false negatives / broken coupling).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Extend existing Morphology correlation regression tests as a baseline:
  - `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`
- Add at least one “distribution” test that asserts:
  - the belt mask does not contain long 1-tile-wide runs,
  - and belt coverage stays within a reasonable envelope for a canonical seed case.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-015`
  - `LOCAL-TBD-PR-M1-004`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (current belt outputs + debug emissions; gates should target these outputs under new driver posture)
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges-and-foothills/contract.ts` (defines belt/mountain driver tensor surfaces + expected ranges)
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (baseline correlation gates to generalize)
- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts` (home for strict distribution/continuity guards that should never regress)
- `mods/mod-swooper-maps/test/pipeline/` (home for suite-level correlation gates that span driver→belt→viz)

### References
- docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md
- docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md

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

There are already “physics anchored” Morphology checks that enforce correlation between tectonic regime drivers and mountain density:
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`

This issue generalizes that posture into:
- suite-level gates for the new driver path, and
- explicit distribution/continuity checks (no wall mountains).

### Proposed Change Surface

Correlation gates should consume:
- driver tensors produced from `artifact:foundation.tectonicHistoryTiles` / `artifact:foundation.tectonicProvenanceTiles`
- the belt masks/outputs produced by Morphology (orogeny potential, mountain masks, etc.)

### Pitfalls / Rakes

- Overfitting gates to a single seed (false confidence). The canonical suite should include multiple cases.
- Gates that are too qualitative (“looks plausible”) instead of measurable ratios/quantiles.

### Wow Scenarios

- **Mountain regressions are instantly caught:** a tuning change that accidentally creates walls or noise belts fails with a distribution/correlation message that tells you what drifted.

### Implementation Decisions

- Correlation gate implemented in `mods/mod-swooper-maps/test/support/foundation-invariants.ts` and run in the determinism suite via `M1_FOUNDATION_GATES`.
- Gate replays `planRidgesAndFoothills` using the same driver tensors and fractal seeding as `plotMountains`:
  - `baseSeed = deriveStepSeed(env.seed, "morphology:planMountains")`
  - `fractalMountain = buildFractalArray(seed ^ 0x3d, grain 5)`
  - `fractalHill = buildFractalArray(seed ^ 0x5f, grain 5)`
- Driver correlation thresholds:
  - `DRIVER_SIGNAL_THRESHOLD = 30`
  - `DRIVER_STRONG_THRESHOLD = 80`
  - `DRIVER_MIN_TILES = 20`
  - `DRIVER_COVERAGE_MIN = 0.35` (strong drivers must produce mountains)
  - `MOUNTAIN_DRIVER_FRACTION_MIN = 0.6` (mountains must be mostly driver-aligned)
