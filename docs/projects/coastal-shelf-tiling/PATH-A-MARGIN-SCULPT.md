# Path A: Continental-Margin Sculpt (datum-free physical shelf)

Status: landed (user-approved 2026-06-22). Re-baseline pass: 4 guards re-blessed; 1 downstream
product-identity failure surfaced and reported (see "Open findings").

This is the implementation record for the physical continental shelf. It replaces the prior
nearshore-bathymetry QUANTILE shelf (which was a statistical output-fudge over a floating
sea-level datum) with a GENERATED margin morphology written into absolute elevation BEFORE sea
level is solved, plus a trivial gradient-break read of that morphology.

## (a) Mechanism

### Where it sits
- New op: `compute-sculpt-continental-margin`
  (`mods/mod-swooper-maps/src/domain/morphology/ops/compute-sculpt-continental-margin/`).
  Wired as step `sculptContinentalMargin` in the `landmass-plates` step of the `morphology-coasts`
  stage (`src/recipes/standard/stages/morphology-coasts/index.ts`, public key `continentalMargin`
  → `SculptContinentalMarginConfigSchema`). Runs AFTER base topography, BEFORE the sea-level solve.
- Shelf read: `compute-shelf-mask` default strategy
  (`src/domain/morphology/ops/compute-shelf-mask/strategies/default.ts`) now reads a seabed-GRADIENT
  break (`breakGradient` / `breakGradientScale`) instead of the removed `shallowQuantile` /
  `breakDepth*` keys. Relocated to the post-features `morphology-shelf` stage (R3).

### Datum-free profile (apron → break → slope → abyss)
The op writes a continental-margin profile in absolute engine int16 elevation. Endpoints are DERIVED
from the hypsometric scale, NOT magic depths (see `rules/index.ts`):
- `deriveBreakElevation`  = `(oceanicHeight + reliefSpan*breakCrustFraction) * elevationScale`
- `deriveOceanicFloor`    = `oceanicHeight * elevationScale`
- `deriveApronAnchorCeiling` = `(oceanicHeight + reliefSpan*apronTopCrustFraction) * elevationScale`

`reliefSpan = continentalHeight − oceanicHeight`. The three relief datums
(`oceanicHeight` / `continentalHeight` / `elevationScale`) are SINGLE-SOURCED from
`compute-base-topography` and threaded in as op INPUTS (`Relief` in `rules/index.ts`), never
duplicated as config — so endpoints re-derive against the active map's real hypsometry and move 1:1
with it.

- **Apron** (over submerged CONTINENTAL crust): `evaluateApronTarget` shoals from the break
  elevation UP to the per-seed shore anchor across the apron length L. **WRITE-TOWARD** (blended via
  `apronBlendStrength`, raise-only) so it actually imprints instead of being killed by the deep
  oceanic base.
- **Slope** (over OCEANIC crust): `evaluateSlopeTarget` descends from the break to the oceanic floor
  over `L / BREAK_SLOPE_RATIO` hops (`BREAK_SLOPE_RATIO = 4`), then flat abyss. **CARVE-DOWN** (min
  with existing), bounded below by the real oceanic floor. Slope 4× steeper than the apron ⇒ the
  break is a readable knee.
- **Apron length scale** (`computeApronLengthScale`): physical multiplicative postures on
  `baseApronLengthTiles` — active (convergent/transform, high closeness) ⇒ narrow
  (`activeApronFactor` < 1); rift ⇒ narrow (`riftApronFactor` < 1); passive ⇒ wide
  (`passiveApronFactor` > 1), further widened by crust age (`ageApronGain`) and buoyancy
  (`buoyancyApronGain`). Ratios, not output-tuned counts.

### Gradient-break classifier (the read)
`compute-shelf-mask` reads the SCULPTED terrain: a water tile is pre-break (gentle apron) when its
steepest bathymetry drop to any water neighbour is below `breakGradient` (= `breakGradient *
breakGradientScale`, floored at 0.5), post-break otherwise. A gradient is a DIFFERENCE of adjacent
bathymetry, so the unsolved-at-sculpt-time sea-level datum cancels — the read never references a
datum, a depth quantile, or a depth band. The shelf is then the pre-break water connected to shore
by BFS (no tile-distance cap; excludes deep isolated gentle pockets). Shoreline-adjacent water is
always seeded so active margins still get a shelf start.

### Two-strategy decision (landmass-ring proven infeasible = datum trap)
The shelf was deliberately built as a gradient read of generated morphology rather than as a
landmass-distance ring band. A ring/quantile band is a DATUM TRAP: it can only be defined relative
to a waterline (how deep / how far is "shelf"), which re-introduces the floating sea-level datum the
whole Path A exists to remove. The crust-type + seabed-gradient formulation is datum-independent and
physically grounded, which is why it was chosen.

## (b) Verification results
- **Apron imprints with a real break**: write-toward apron + carve-down slope produce a readable
  knee; `compute-shelf-mask` records `shelfBreakDepthByTile` where the gradient steepens.
- **Passive > active width**: `passiveApronFactor` (1.5, +age/buoyancy gains) vs `activeApronFactor`
  (0.4) ⇒ passive margins carry visibly wider aprons.
- **Island-decoupled**: shelf is connectivity-from-shore over the gradient apron, not a
  landmass-distance ring, so islands do not stamp a uniform halo.
- **Water% on intent**: apron stays submerged via raise-only + the local submerged-continental
  anchor + the `targetWaterPercent` solver intent (empirically verified 0 sea-level crossings);
  the anchor ceiling is NOT relied on as a hard guarantee.
- **Endpoints move 1:1 with hypsometry**: datums are inputs, so a change in
  oceanic/continental/scale relief shifts break/floor/ceiling proportionally — no constant tuned to
  a number.

Re-baseline guards (all attributable to the approved op, re-blessed to approved output, no physics
tuned to a target):
1. `standard-authoring-surface-guards` — added public key `continentalMargin` to `STANDARD_PUBLIC_KEYS`.
2. `standard-recipe-artifact-guards` — regenerated `STANDARD_RECIPE_CONFIG_SCHEMA` (git-ignored
   `dist/`) via `bun run build:studio-recipes` (bundle → gen schema → gen:maps autopublish).
3. `world-balance-stats` — shattered-ring `reefMax` 0.032 → 0.04 (shelf retracts coast band; reef
   share 0.0307 → 0.0389 of water at seed 1018 / 106×66). Dated inline comment.
4. `ecology-baseline-fixtures` — regenerated `ecology-artifacts-fingerprints.v1.json` (8 of 13
   morphology-elevation-downstream artifacts; latitude-driven ice/base/resourceBasins byte-identical;
   viz-keys unchanged).

## (c) OPEN FINDING — drowned continental platforms

> **Investigated and handed off** → see
> [`../crust-relief/FOUNDATION-CRUST-RELIEF.md`](../crust-relief/FOUNDATION-CRUST-RELIEF.md).
> Verdict: NOT a config tweak. Root cause is a dense unimodal continental-crust buoyancy hump centred
> on sea level (config scaling is cancelled by the sea-level solver); the fix reshapes the
> distribution in `compute-crust-evolution`. The summary below stands.

On earthlike, ~50% of continental crust is SUBMERGED FLAT (bathymetry median ≈ −5), forming roughly
half of all coast tiles. This is a **FOUNDATION crust-relief characteristic**, NOT the shelf sculpt:
continental crust baseline sits at/near sea level, so large tracts of continental crust drown as
flat shallow platforms regardless of the margin profile. The sculpt op only shapes the
apron→break→slope transition; it does not (and by design should not, to stay datum-free) decide
whether bulk continental crust is above or below the solved waterline.

The fix belongs to a separate **base-topography / foundation workstream**: give continental crust
more relief so platforms either EMERGE (islands / mountains) or DROP to basins, rather than hovering
as flat drowned shelf. Candidate levers live in `compute-base-topography`
(`oceanicHeight` / `continentalHeight` / `elevationScale` and the crust-relief rules) and in
foundation crust-buoyancy/maturity calibration (see task #21 histograms, task #20 sea-level/waterline
artifact). Tracking: tasks #20, #22.

### Surfaced downstream failure (reported, NOT masked)
`world-balance-stats` "shipped map identities" now fails on **sundered-archipelago cold reefs**:
`FEATURE_COLD_REEF` dropped from 11 (parent) to 0 after the physical-break op, while
`requireColdReefs` asserts > 0. Confirmed attributable to the approved op via a stash-revert A/B
probe at seed 1018 / 106×66:
- parent (op stashed): sundered REEF=16 / COLD_REEF=11 / ATOLL=6; earthlike COLD_REEF=134.
- with op: sundered REEF=24 / COLD_REEF=0 / ATOLL=9; earthlike COLD_REEF=14 (still > 0, passes).

So cold-reef habitat (cold + shallow shelf) contracts globally under the retracted shelf, and on the
already-marginal sundered-archipelago it reaches exactly 0. This is the SAME mechanism as the
drowned-platform finding (less coherent cold shallow SHELF at high latitude) and is NOT a placement
bug. It was left UNCHANGED rather than weakened, because removing a per-map feature-presence product
guarantee is a product decision beyond the 4 sanctioned re-baseline guards and warrants explicit
sign-off (parallel to the global-coastline sign-off). Likely resolved by the same foundation
crust-relief work that fixes drowned platforms (restoring coherent cold shelf), or by an explicit
decision to drop the cold-reef guarantee for archipelago maps.
