# Expectation And Strategy Ledger

| Corpus row/group | Expected behavior | Condition | Evidence strength | Architecture owner | Strategy/artifact | Local stats gate | Runtime proof | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Impassable ridge mountains | Planned `4-9%`, warn outside `3-12%`; final non-volcano `4-10%` | Earthlike stable seed matrix, land-relative | medium, Civ-scaled from physical mountain definitions | Morphology ridges; map projection readback | `morphology.mountains.mountainMask`; non-volcano final terrain | planned/final/non-volcano shares and components | terrain readback via direct-control map grid | proposed |
| Hills and rough land | Planned `12-24%`, final `10-24%`, hard fail below `8%` | Earthlike land tiles | medium-high, based on Hammond relief classes and Civ terrain abstraction | Morphology rough-land op plus foothills | `morphology.mountains.hillMask`, `foothillMask`, `roughLandMask` | planned/final hill share, hill components, distance-to-ridge/boundary/coast | terrain readback via direct-control map grid | local owner implemented; target-map runtime proof unresolved |
| Total rough terrain | `18-32%` land | mountains plus hills | medium | Morphology terrain intent | ridge + rough-land masks | rough share and flat-to-rough ratio | terrain readback | proposed |
| Final flat terrain | `55-78%`, hard fail above `85%` | Earthlike land tiles after projection/hydrology | medium | Morphology plus map/hydrology projection | final terrain histogram | final flat share and flatland basin budget | terrain readback | proposed |
| Volcanoes | Regime-correlated sparse points; volcano mountains excluded from ridge proof | active volcanic regimes | medium | Morphology volcanoes; map projection | `morphology.volcanoes` entries with `kind` | counts by `subductionArc`/`rift`/`hotspot`; final volcano terrain separation | feature and terrain readback | partly modeled |
| Coast/shelf | Coast and ocean as projection/readback, not rough-land truth | shoreline/shelf water | medium | Morphology coast metrics plus map projection | `coastlineMetrics.shelfMask`, terrain histogram | coast/ocean/lake/shelf budgets | water/coast terrain readback | partly modeled |
| Lakes/rivers | lakes `1-6%`, warn above `8%`; rivers are hydrology topology | post-hydrology | medium | Hydrology | `hydrology.lakePlan`; engine lake projection; river modeling | lake share, component, drift, river topology | hydrology/terrain readback | modeled |
| Engine elevation/cliffs | no success claim until read back after `buildElevation()` | live runtime or engine-backed adapter | high for boundary, low for band until baseline | Map/elevation projection and direct-control proof | `effect:map.elevationBuilt`; readback artifact or runtime payload | elevation percentiles, local relief, coast-distance profile | `GameplayMap.getElevation`, `isCliffCrossing` bounded sample | live surface observed; target-map product proof unresolved |
| Downstream features/resources | Hill/mountain/flat/coast legality remains balanced after rough-land changes | after terrain changes | high from official legality tables | Ecology/Placement/Resources | feature/resource legality artifacts | invalid surface count, per-family counts, hill-resource candidates | GameInfo plus feature/resource readback | pending |

## Strategy Rules

- Do not loosen hill thresholds as the primary fix unless the candidate set is
  already broad enough to satisfy the expected band.
- Do not add manual output-control knobs that bypass Foundation/Morphology
  causes.
- Do add a Morphology-owned rough-land operation if the hill gap remains after
  stats isolate ridge foothills from non-foothill hills.
- Do keep `map-*` stages as projection/readback owners only.
- Do preserve cliffs as engine-owned/readback-only even after direct-control
  captures `isCliffCrossing` samples; runtime readback proves the engine surface,
  not Morphology truth ownership.
