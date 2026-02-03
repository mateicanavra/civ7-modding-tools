# Product Report: Coasts By Erosion (Greenfield)

## Problem Statement

We need to project Morphology truth into Civ7's gameplay terrain in a way that:
- Produces a *sensible and tunable* shallow-water band (`TERRAIN_COAST`) for gameplay systems (resources, reefs, etc.).
- Is deterministic and derived from our own generation truth (plates, crust/shelf, sea level, erosion), not Civ's stochastic helpers.
- Avoids "no-water-drift" failures (engine-side helpers must not change land/water classification relative to Morphology truth).

## Constraints

- Civ7 terrain semantics:
  - `TERRAIN_COAST` and `TERRAIN_OCEAN` are both water terrains; they mainly differ in gameplay rules and content tables.
  - `TERRAIN_COAST` should represent shallow/nearshore waters (shelf/neritic analogue), not "any water near land forever."
- Determinism:
  - Coast placement must be stable for a given seed/config and not depend on Civ's runtime RNG helpers like `expandCoasts`.
- Truth posture:
  - Physics truth is `artifact:morphology.topography` (including `landMask`, `seaLevel`, `bathymetry`) plus derived coastline metrics (`artifact:morphology.coastlineMetrics`).
  - Map projection steps must not backfeed engine state into physics truth.

## What Coast Tiles Are For (Civ7 Gameplay)

At minimum, `TERRAIN_COAST` must exist in adequate quantity and continuity for:
- Marine resource placement that targets `TERRAIN_COAST` specifically (e.g. crabs/turtles-type resources).
- Coast-only features (e.g. reefs) and coast-adjacent rules in content tables.

This implies a 1-tile ring is often too thin, especially around large continents, and can under-produce eligible placement sites.

## Greenfield Semantic Definition (Target)

Define shallow water as a *Morphology-derived shelf band* around landmasses:

- Land: `landMask=1` -> `TERRAIN_FLAT` (or other land terrains in later steps).
- Water:
  - Shallow shelf water -> `TERRAIN_COAST`
  - Deep water -> `TERRAIN_OCEAN`

Shallow shelf water must be:
- Deterministic.
- Derived from Morphology truth (not engine helpers).
- Tied to plausible drivers:
  - distance to coastline (nearshore)
  - bathymetry (shallow vs deep)
  - plate/crust context (active vs passive margin; shelf width differences)

## Candidate Models (Options)

Option A: Distance-band shelf (simple, Civ-friendly)
- Rule: `COAST` iff `water && distanceToCoast <= N`.
- Pros: deterministic, easy to tune, matches Civ mental model of "coasts near land."
- Cons: ignores bathymetry and shelf geology; can over-widen in narrow straits unless capped carefully.

Option B: Bathymetry shelf (geologic, physically motivated)
- Rule: `COAST` iff `water && bathymetry >= -D` (shallow).
- Pros: shelf emerges from the physical surface; naturally produces variable widths.
- Cons: depends on bathymetry scale/units being stable; can produce offshore shallow banks.

Option C: Hybrid shelf (recommended baseline)
- Rule: `COAST` iff `water && distanceToCoast <= N && bathymetry >= -D`.
- Pros: nearshore guarantee + physical plausibility; prevents far-off "coast banks"; easy to tune.
- Cons: introduces two knobs; requires selecting defaults per map size/style.

Option D: Margin-aware hybrid (recommended target)
- Start from Option C.
- Make `N` and/or `D` vary by tectonic context:
  - Passive margins (divergent) -> wider, shallower shelves (larger `N` and/or larger `D`).
  - Active margins (convergent/transform) -> narrower shelves (smaller `N` / smaller `D`).
- Pros: best alignment with plate story; produces distinct Atlantic vs Pacific analogues.
- Cons: more complexity; needs careful determinism and tuning.

## Recommendation

Two-step target:

1. Ship Option C (Hybrid shelf) as the default deterministic replacement for Civ `expandCoasts`.
2. Upgrade to Option D (Margin-aware hybrid) once we have a small tuning harness and visuals proving it behaves as intended.

Rationale:
- Option C gives immediate gameplay-correct "enough coast" without Civ randomness.
- Option D is where "coasts by erosion + plates/shelves" actually becomes visible and differentiated.

## High-Level Solution Design

### Data Inputs (already available)
- `artifact:morphology.topography`:
  - `landMask` (u8)
  - `seaLevel` (number)
  - `bathymetry` (i16, <=0 in water)
- `artifact:morphology.coastlineMetrics`:
  - `coastalWater` (u8)
  - `distanceToCoast` (u16)
- Plate context (already computed in Morphology mid):
  - `artifact:foundation.plates.boundaryType`
  - `artifact:foundation.plates.boundaryCloseness`
- Crust context (already computed upstream):
  - `artifact:foundation.crustTiles.type`, `baseElevation`, etc.

### New Derived Product (suggested)
- `artifact:morphology.shelf` (new):
  - `shelfMask` (u8; 1 if shallow shelf water)
  - `shelfDepthClass` (optional; u8 for debug/tuning)
  - `shelfWidthClass` (optional; u8 for debug/tuning)

### Projection Rule
In `map-morphology/plot-coasts`:
- If `landMask==1`: write `TERRAIN_FLAT`
- Else if `shelfMask==1` (or hybrid rule computed inline): write `TERRAIN_COAST`
- Else: write `TERRAIN_OCEAN`

No engine helpers needed for coast creation.

## Guardrails / Invariants

- Coast stamping must never flip land/water classification:
  - It may only choose between `TERRAIN_COAST` and `TERRAIN_OCEAN` for water tiles.
- Any engine helper that can change `GameplayMap.isWater` is a drift risk:
  - If we keep calling such helpers (e.g. `validateAndFixTerrain`, `buildElevation`, `generateLakes`), we must treat any resulting land/water changes as either:
    - integration failures (fail-fast), or
    - gameplay-only mutations that get synced into a separate runtime buffer (and never backfed into Morphology truth).

## Success Metrics (Acceptance)

- Determinism: same seed/config yields same coast mask and same count of coast tiles.
- Coverage: coast tiles should be a stable multiple of coastline length (enough for resources/reefs).
- Style: passive margins show broader shelves than active margins (once Option D is implemented).
- No drift: `assertNoWaterDrift` never fails in `map-morphology` steps.

## Next Actions (Implementation Plan, High Level)

1. Define coast semantics formally (choose Option C defaults for `N` and `D`).
2. Add a Morphology-mid "shelf classification" step (or extend rugged-coasts to compute it) and publish `artifact:morphology.shelf`.
3. Update `plot-coasts` to use `shelfMask`.
4. Add viz layers for `shelfMask` and shelf classes for tuning (MapGen Studio).
5. Add tests:
  - shelfMask determinism
  - shelfMask never includes land tiles
  - projection never calls Civ coast expansion helpers

