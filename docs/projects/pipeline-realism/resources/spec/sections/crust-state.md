# Crust State (D05r Canonical Variables)

## Target Contract Summary

D05r defines the canonical crust truth state for the Foundation evolutionary engine and the deterministic derived crust drivers published to downstream consumers.

Posture:
- Foundation crust truth is mesh-first and evolves across eras.
- Only a small, fixed set of state variables is updated by events.
- All consumer-facing crust drivers are deterministic derivations from truth state.

## Truth State Variables (Mesh Space)

Let `C = cellCount`.

Truth state (per mesh cell):

- `maturity: Float32Array` (length `C`, values `0..1`)
  - `0` = basaltic oceanic lid
  - `1` = mature cratonic continental crust
- `thickness: Float32Array` (length `C`, values `0..1`)
  - normalized crustal thickness proxy (isostasy + strength driver)
- `thermalAge: Uint8Array` (length `C`, values `0..255`)
  - normalized thermal age since last new-basalt reset (rift / seafloor creation / consumption reset)
- `damage: Uint8Array` (length `C`, values `0..255`)
  - accumulated mechanical weakening from rifting/fracture/shear; deterministically heals

Truth invariants:
- all truth arrays are defined for every cell, every run
- truth state is updated only by the event hooks defined below

## Derived Crust Drivers (Mesh Space)

Foundation publishes the following derived fields for consumers (and for backwards-compatible contract mapping to `artifact:foundation.crust` in `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`):

- `type: Uint8Array` (length `C`)
  - `0=oceanic`, `1=continental`
- `age: Uint8Array` (length `C`)
  - aliases `thermalAge` (normalized thermal age), not provenance age
- `buoyancy: Float32Array` (length `C`, `0..1`)
- `baseElevation: Float32Array` (length `C`, `0..1`)
- `strength: Float32Array` (length `C`, `0..1`)

### Canonical Derivations

Constants:
- `MATURITY_CONTINENT_THRESHOLD = 0.55`
- `MATURITY_CRATON_THRESHOLD = 0.85`
- `THERMAL_AGE_DELTA_PER_ERA = floor(255 / (ERA_COUNT_TARGET - 1))`

Baseline constants (current implementation, D05r cutover):
- `OCEANIC_BASE_ELEVATION = 0.32`
- `OCEANIC_AGE_DEPTH = 0.22`
- `MATURITY_BUOYANCY_BOOST = 0.45`
- `THICKNESS_BUOYANCY_BOOST = 0.25`
- `STRENGTH_BASE_MIN = 0.45`
- `STRENGTH_MATURITY_MIN = 0.5`
- `STRENGTH_THICKNESS_MIN = 0.55`

Basaltic lid initialization (t=0):
- `maturity = 0`, `thermalAge = 0`, `damage = 0`
- `thickness = basalticThickness01` (profile default: `0.25`)
- strength scalars: `yieldStrength01` (default `0.55`) and `mantleCoupling01` (default `0.6`)
- `riftWeakening01` (default `0.35`) reserved for event-driven weakening in later slices

Type:
- `type[i] = (maturity[i] >= MATURITY_CONTINENT_THRESHOLD) ? 1 : 0`

Strength (monotone, bounded, deterministic):
- `strengthBase = strengthFromThermalAge(thermalAge[i])` (monotone increasing)
- `strengthComp = strengthFromMaturity(maturity[i])` (monotone increasing)
- `strengthThk = strengthFromThickness(thickness[i])` (monotone increasing)
- `strengthDamage = (255 - damage[i]) / 255` (monotone decreasing in `damage`)
- `strength[i] = clamp01(strengthBase * strengthComp * strengthThk * strengthDamage)`

Buoyancy and base elevation (bounded, deterministic):
- `buoyancy[i] = clamp01(buoyancyFromMaturityAndThickness(maturity[i], thickness[i]) - subsidenceFromThermalAge(thermalAge[i]))`
- `baseElevation[i] = clamp01(isostasyFromBuoyancy(buoyancy[i], thickness[i]))`

## Event Update Rule Hooks (Mesh Space)

Crust truth updates are driven by:
- mantle forcing (D02r) via derived stress/velocity/upwelling classification, and
- boundary segments + regimes (D04r) via convergent/divergent/transform classification and polarity/intensity.

All event hooks are bounded and deterministic and run once per era.

### Required Hooks

All hooks take a `mask` that identifies affected cells and an `intensity` in `0..1` (or `0..255` where noted).

#### `onRift(spreadingRate, mask)`

Resets to new basaltic crust at spreading centers:
- `maturity = 0`
- `thickness = THICKNESS_OCEANIC_NEW`
- `thermalAge = 0`
- `damage = max(damage, RIFT_DAMAGE_SEED)`

#### `onSubductionOverriding(subductionRate, polarity, arcMask)`

Increases maturity and thickens volcanic arcs on the overriding side:
- `maturity += subductionMaturityIncrement(subductionRate) * (1 - maturity)^2` (logistic headroom)
- `thickness += thicknessFromArcAccretion(subductionRate)`
- `thermalAge = min(thermalAge, ARC_THERMAL_AGE_CAP)` (arc material is young)
- `damage = max(damage, ARC_DAMAGE_SEED)` (fractured belts)

#### `onSubductionConsumed(subductionRate, trenchMask)`

Resets consumed material to basaltic lid (Eulerian overwrite model):
- `maturity = 0`
- `thickness = THICKNESS_OCEANIC_NEW`
- `thermalAge = 0`
- `damage = max(damage, CONSUMED_DAMAGE_SEED)`

#### `onCollision(compressionRate, sutureMask)`

Thickens collisional belts and modestly increases maturity:
- `thickness += thicknessFromCollision(compressionRate)`
- `maturity += COLLISION_MATURITY_BOOST * (1 - maturity)`
- `damage = max(damage, COLLISION_DAMAGE_SEED)`

#### `onTransform(shearRate, faultMask)`

Accumulates damage along transforms:
- `damage += transformDamageIncrement(shearRate)` (u8-clamped)

#### `onPlume(plumeIntensity, hotspotMask)`

Creates thickened basaltic plateaus that later accrete:
- `maturity = min(maturity, PLUME_MATURITY_CAP)` (plateaus remain low-maturity)
- `thickness += thicknessFromPlume(plumeIntensity)`
- `thermalAge = 0` in hotspot core (new material)
- `damage = max(damage, PLUME_DAMAGE_SEED)`

#### `onHeal()`

Deterministic healing each era:
- `damage = max(0, damage - HEAL_DELTA_PER_ERA)`

### Per-Era Aging Rule

After events, apply:
- `thermalAge = min(255, thermalAge + THERMAL_AGE_DELTA_PER_ERA)`

## Hard Compute Bounds

Budgets are fixed, not data-dependent.

- Event application:
  - exactly one segment-driven corridor pass per era
  - exactly one whole-grid healing/aging pass per era
- Corridors are fixed-radius neighborhoods:
  - `ARC_RADIUS_CELLS = 4`
  - `RIFT_RADIUS_CELLS = 2`
  - `SUTURE_RADIUS_CELLS = 3`
  - `PLUME_RADIUS_CELLS = 3`

Complexity (per era):
- `O(S)` for segment iteration + fixed-radius writes
- `O(C)` for aging + healing + derived-field recomputation

## Required Invariants

### Range and monotonicity invariants

- `maturity ∈ [0,1]`, `thickness ∈ [0,1]`, `thermalAge ∈ [0,255]`, `damage ∈ [0,255]`
- `thermalAge` only changes by:
  - `+THERMAL_AGE_DELTA_PER_ERA` (aging), and
  - reset/cap rules under `onRift/onSubductionOverriding/onSubductionConsumed/onPlume`
- `maturity` only changes by:
  - positive increments under `onSubductionOverriding/onCollision`, and
  - reset/cap rules under `onRift/onSubductionConsumed/onPlume`

### Derived consistency invariants

- `type == 1` iff `maturity >= MATURITY_CONTINENT_THRESHOLD`
- `strength` is non-increasing in `damage` and non-decreasing in (`maturity`, `thickness`, `thermalAge`)
- `baseElevation` is non-decreasing in `buoyancy` for fixed `thickness`

### Distribution invariants (planet must contain both modes)

- At least `MIN_CONTINENT_FRACTION = 0.05` of cells satisfy `maturity >= MATURITY_CONTINENT_THRESHOLD`.
- At least `MIN_OCEAN_FRACTION = 0.30` of cells satisfy `maturity < MATURITY_CONTINENT_THRESHOLD`.
- At least `MIN_CRATON_FRACTION = 0.01` of cells satisfy `maturity >= MATURITY_CRATON_THRESHOLD`.

## Wow Scenario (D05r Contract Target)

Given D02r mantle forcing and D04r history/provenance:

- Subduction zones create long-lived arc belts that increase `maturity` behind trenches.
- Arc belts collide and weld into thick, high-maturity craton cores (`maturity >= 0.85`) with high `strength`.
- Rifting splits mature crust and creates young ocean basins with clean thermal-age gradients (`thermalAge` resets along rifts).
- Plume plateaus create thickened, low-maturity basaltic provinces that later accrete into continents as transitional material.

The wow factor is an emergent, coherent story in tile space:
- stable interiors, active margins, passive margins, and obvious basin-age structure.

## Mapping To Current Contract / Code

Current contract doc: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (`artifact:foundation.crust`).

Current schema anchor:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` defines `type/age/buoyancy/baseElevation/strength`.

D05r mapping:
- `age` is redefined as `thermalAge` (truth variable).
- `type/buoyancy/baseElevation/strength` are deterministic derivations from truth state (`maturity`, `thickness`, `thermalAge`, `damage`).

Downstream projections remain mesh-derived via `artifact:foundation.tileToCellIndex` as required by the Foundation posture.
