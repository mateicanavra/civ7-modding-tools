## Reef Physics

The reef-family predicates use source fields already available to
`ecology-features`: `landMask`, `surfaceTemperature`, `bathymetry`,
`coastalWater`, `shelfMask`, and `distanceToCoast`.

- `FEATURE_REEF`: water tile, warm tropical/subtropical temperature, shallow
  shelf bathymetry, and coastal/shelf structure (`shelfMask = 1` and near-coast
  water by `distanceToCoast`).
- `FEATURE_COLD_REEF`: water tile, cold temperature, deep or shelf-edge
  bathymetry, and not a warm shallow reef relabeling.
- `FEATURE_ATOLL`: water tile, warm temperature, shallow shelf/bank bathymetry,
  isolated from existing land coast (`distanceToCoast` above the atoll
  isolation threshold and `coastalWater = 0`).
- `FEATURE_LOTUS`: exact Civ7 feature id; water tile, warm temperature,
  shallow calm near-land water (`coastalWater = 1`) and distinct from coral reef
  and atoll habitats.

These predicates are categorical habitat gates. Numeric defaults may be tuned
inside owning reef op contracts, but the code must not alias one reef-family
feature to another or use probability thinning to compensate for broad scores.

## Owner Shape

Reef-specific eligibility belongs beside reef scoring/planning ops. The
reef-family planner policy only rejects weak-positive scores; reef ops decide
what counts as reef habitat.

## Review Lanes

- Physics: habitat rules match real-world expectations at map resolution.
- Architecture: reef truth remains Ecology-owned.
- Gameplay: coastal water remains readable and navigable.
- Adversarial: no chance thinning, no map special case, no projection truth
  logic.
