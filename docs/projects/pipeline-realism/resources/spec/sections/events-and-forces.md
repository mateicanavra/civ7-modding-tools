# Events And Forces (D06r)

## Purpose

Define the **maximal, deterministic** tectonic event mechanics for the Foundation evolution loop and the **mandatory** emission of era-resolved force fields consumed by downstream stages (especially Morphology).

This section is normative for D06r and binds three surfaces into one contract:
- events (causal surface)
- era fields (consumable surface)
- provenance updates (audit surface)

## Event Model (Truth, Mesh Space)

### Canonical Event Record

Events are authored/computed in mesh space and are keyed by `(eraIndex, eventIndex)`.

Required per-event fields:
- `eraIndex: u8` (0 = oldest)
- `eventType: u8` (enumeration below)
- `plateA: i16`, `plateB: i16` (plate ids; `-1` for intraplate events)
- `polarity: i8` (`-1, 0, +1`; only meaningful for subduction)
- `seedCellCount: u32`
- `seedCellStart: u32` (offset into a flat `seedCells[]` array)
- `intensityUplift: u8` (0..255)
- `intensityRift: u8` (0..255)
- `intensityShear: u8` (0..255)
- `intensityVolcanism: u8` (0..255)
- `intensityFracture: u8` (0..255)
- `driftU: i8`, `driftV: i8` (`-127..127`; deterministic per-event drift direction)

Required event invariants:
- `seedCells[]` contains valid mesh cell indices.
- `(plateA, plateB)` ordering is canonical (`plateA <= plateB`) for boundary events.
- `eventType` is consistent with segment regime classification when the event is boundary-derived.

## Event Types (Required)

Event types are the minimum typed vocabulary required by provenance and force emission.

| `eventType` | Name | Meaning |
| --- | --- | --- |
| `1` | `convergence_subduction` | Convergent boundary with stable polarity indicating overriding vs subducting side. |
| `2` | `convergence_collision` | Convergent boundary without polarity (continental collision or polarity unknown). |
| `3` | `divergence_rift` | Divergent boundary emitting extension and ridge volcanism. |
| `4` | `transform_shear` | Transform boundary emitting shear and fracture. |
| `5` | `intraplate_hotspot` | Mantle upwelling-driven volcanic source away from boundaries. |

## Per-Era Evolution Loop (Events -> Fields -> Provenance)

For each era (oldest -> newest), Foundation runs:
1. Build/update event set for the era from boundary segments and mantle forcing.
2. Emit era fields by diffusing event intensities into mesh cells under fixed budgets.
3. Update provenance using the emitted boundary fields and the winning event attribution per cell.

This loop is the sole source of:
- `artifact:foundation.tectonicHistory` era fields + rollups
- `artifact:foundation.tectonicProvenance` scalars and per-era tracer history (as specified in D04r)
- `artifact:foundation.tectonics` newest-era snapshot used for projection to `artifact:foundation.plates`

## Emitted Era Fields (Required Channels)

The emitted fields match the maximal D04r contract and are stored per era:
- `boundaryType` (BOUNDARY_TYPE)
- `convergentMask`, `divergentMask`, `transformMask` (0/1)
- `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture` (0..255)

## Force Emission And Diffusion Budgets (Normative)

### Fixed Budgets

Budgets are fixed constants to keep evolution bounded and testable.

- `EVENT_SEED_DRIFT_STEPS_PER_ERA = 2`
- `EMISSION_RADIUS_UPLIFT = 12` mesh-neighbor steps
- `EMISSION_RADIUS_RIFT = 10` mesh-neighbor steps
- `EMISSION_RADIUS_SHEAR = 8` mesh-neighbor steps
- `EMISSION_RADIUS_VOLCANISM = 7` mesh-neighbor steps
- `EMISSION_RADIUS_FRACTURE = 10` mesh-neighbor steps
- `EMISSION_DECAY_UPLIFT = 0.45`
- `EMISSION_DECAY_RIFT = 0.55`
- `EMISSION_DECAY_SHEAR = 0.70`
- `EMISSION_DECAY_VOLCANISM = 0.85`
- `EMISSION_DECAY_FRACTURE = 0.65`

### Emission Kernel

For a cell `i` at integer mesh-neighbor distance `d` from an event seed corridor, the per-channel contribution is:
- `influence(d, decay) = exp(-d * decay)` for `d <= radius`, else `0`
- `value = clamp_u8(intensity * influence(d, decay))`

The event corridor is the set of `seedCells[]` after deterministic drift:
- drift step: each drift step selects the neighbor with maximal dot product along `(driftU, driftV)` with wrap-aware deltas
- drift is applied `EVENT_SEED_DRIFT_STEPS_PER_ERA` times per seed cell

### Attribution ("Winning Event") Rule

For each era and cell, each channel uses a max-influence attribution rule:
- compute `score = intensity * influence(distance, decay)` for each event affecting the cell
- choose the event with the maximum `score`
- set the channel value to that event's `value`

Tie-break order is deterministic:
- higher `score`
- higher raw `intensity`
- lower `eventType` numeric id
- lower `eventIndex` (stable generation order)

This rule yields a continuous belt field while keeping per-cell values bounded without global renormalization.

## Per-Event State Changes (Required)

Events apply deterministic state updates during the era loop.

### Boundary Events (`convergence_*`, `divergence_rift`, `transform_shear`)

For cells where a boundary event wins the era attribution:
- update provenance `lastBoundaryEra = eraIndex`
- update provenance `lastBoundaryType = boundaryType`
- update provenance `lastBoundaryPolarity = polarity`
- update provenance `lastBoundaryIntensity = max(upliftPotential, riftPotential, shearStress, volcanism, fracture)`

### New Lineage Resets (Rifts, Hotspots, Arc Accretion)

Lineage resets are mandatory and are the only legal way to change `originEra`/`originPlateId`.

Reset triggers (deterministic):
- `divergence_rift`: cells with `riftPotential >= 160`
- `intraplate_hotspot`: cells with `volcanism >= 200` and `boundaryType == none`
- `convergence_subduction`: overriding-side arc corridor cells with `volcanism >= 170`

Reset updates:
- `originEra = eraIndex`
- `originPlateId = plate id associated with the reset source`
- `crustAge = 0` (normalized; full definition remains in D04r)

## Boundary Type And Masks (Derived From Emission)

Per era and cell:
- `boundaryType` is chosen from the winning boundary event class:
- `convergent` if winning event is `convergence_subduction` or `convergence_collision`
- `divergent` if winning event is `divergence_rift`
- `transform` if winning event is `transform_shear`
- `none` otherwise
- Masks are derived directly: `convergentMask = boundaryType == convergent`, `divergentMask = boundaryType == divergent`, `transformMask = boundaryType == transform`.

Invariant:
- if any of the three masks is `1`, `boundaryType != none`.

## Provenance Updates (D04r Alignment)

Per era:
- tracer advection runs with the fixed D04r budget `ADVECTION_STEPS_PER_ERA` and uses segment drift and boundary regime as the transport guide (see D04r).
- provenance scalars are updated from the emitted era fields and the winning event attribution per cell.

Required provenance invariants:
- `originEra <= lastBoundaryEra` when `lastBoundaryEra != 255`
- `crustAge == clamp_u8(round(255 * (newestEraIndex - originEra) / max(1, eraCount - 1)))`
- `lastBoundaryIntensity > 0` when `lastBoundaryEra != 255`

## Output Coupling (Morphology-First, Today)

The newest-era emitted fields must remain compatible with the current `artifact:foundation.plates` projection:
- `upliftPotential` and `riftPotential` must carry macro-scale signals used by Morphology's base landmass/topography shaping.
- `volcanism` must carry coherent ridge/arc/hotspot structure used by volcano planning.
- `boundaryType` must remain stable and continuous enough to support boundary-biased coastline ruggedness.

## Validation Invariants (Required, Pre-Render)

- Event determinism: same inputs produce identical event arrays and identical per-era emitted fields.
- Budget determinism: event drift uses exactly `EVENT_SEED_DRIFT_STEPS_PER_ERA` and emission uses the fixed radii/decays and max-influence attribution.
- Belt continuity: for convergent eras, at least 85% of non-zero `upliftPotential` cells belong to connected components of length >= 12 mesh-neighbor steps (component definition uses mesh neighbor graph).
- Volcanism coherence: arc volcanism is spatially adjacent to convergent belts and has an overriding-side bias when polarity is known.
- Provenance causality: any `originEra` reset implies a qualifying rift/hotspot/arc cell in that era under the thresholds defined above.

## Wow Scenario (Expected Outcome)

Scenario: "Subduction margin + back-arc rift + hotspot chain"

Expected mechanics:
- A long convergent margin produces a continuous uplift corridor with a volcanic arc biased to the overriding side.
- A later era activates a back-arc rift behind the convergent margin, resetting lineage in a basin corridor and emitting ridge volcanism.
- A mantle upwelling cell produces an intraplate hotspot chain that remains distinct from boundary volcanism.

Expected auditability:
- `lastBoundaryType/Polarity` separate arc volcanism from ridge volcanism.
- `originEra` resets form clean, contiguous corridors at rifts and localized patches at hotspots and arc accretion sites.
- Era rollups (`upliftTotal`, `upliftRecentFraction`, `lastActiveEra`) distinguish ancient belts from recent active margins without wall-mountains.

## Mapping (Contract -> Current Code Anchors)

- Current Foundation contract + artifacts:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- Current segment source (event seeds today):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`
- Current era diffusion implementation (to be replaced by event emission + budgets):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
- Projection into tile-space drivers consumed by Morphology:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`
- Current Morphology consumers of emitted forces:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/ruggedCoasts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.ts`
