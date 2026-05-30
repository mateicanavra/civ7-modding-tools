## Wetland Physics

Shared substrate may expose only named physical invariants derived from
`landMask`, `elevation`, `seaLevel`, `riverClass`, `discharge`, `sinkMask`, and
coastal adjacency:

- `lowlandMask`: land whose elevation is close to sea level.
- `floodplainMask`: lowland land near a river with a meaningful flow signal.
- `intertidalCoastMask`: low coastal land adjacent to water.
- `sinkBasinMask`: lowland sink/drainage-basin land.
- `hydromorphicMask`: `floodplainMask OR intertidalCoastMask OR sinkBasinMask`.
- `wellDrainedMask`: land that is not hydromorphic.

Feature-specific predicates remain with the owning wet feature ops:

- `FEATURE_MARSH`: `hydromorphicMask = 1` plus existing temperate/moist/fertile
  suitability; generic humid highland is not eligible.
- `FEATURE_TUNDRA_BOG`: `hydromorphicMask = 1` plus cold/freeze-compatible
  suitability.
- `FEATURE_MANGROVE`: `intertidalCoastMask = 1` plus warm/coastal suitability;
  inland river adjacency is not eligible.
- `FEATURE_OASIS`: arid isolated water signal from the existing isolated-river
  substrate and aridity score; it is not a generic wetland floodplain.
- `FEATURE_WATERING_HOLE`: arid or semi-arid isolated water signal with
  fertility context; it is not a marsh/bog/mangrove alias.

## Owner Shape

Feature substrate may expose named eligibility fields only when multiple
wetland score ops share a real invariant. Feature-specific schemas and scoring
remain beside owning op contracts.

## Review Lanes

- Physics: wetland classes match real-world expectations at map resolution.
- Architecture: substrate fields are named invariants, not config buckets.
- Gameplay: wetlands add texture without dominating land features.
- Adversarial: no fallback, chance thinning, or broad shared schema dumping
  ground.
