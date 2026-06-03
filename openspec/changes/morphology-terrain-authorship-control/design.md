## Frame

Future state: Swooper Earthlike has evidence-scoped control over terrain
morphology. Terrain classes, relief structure, volcanoes, engine
elevation/cliff readback, and downstream feature/resource implications are
owned, measured, and proved at the correct boundary.

Hard core: terrain truth belongs in Foundation/Morphology-derived artifacts and
dedicated Morphology operations. Map stages project or read back engine state;
they do not create terrain truth. Hydrology may mutate terrain for lakes and
navigable rivers, but that mutation is recorded as projection/readback evidence.

Falsifier: if a stable seed matrix can satisfy mountain share while hills stay
below the predeclared rough-land band, final flats remain above the flat-budget
cap, or cliffs/elevation are unmeasured after `buildElevation()`, the workstream
has not delivered terrain morphology control.

## Diagnosis

The current Earthlike failure is caused by under-authored rough land. The
foothill op accepts candidates only near ridge skirts or strong deformation and
uses boundary/uplift-heavy scoring. Config caps are not the bottleneck: seed
`1018` targeted hundreds of possible hill tiles but admitted only two
candidates because most non-mountain land had zero driver score. Projection is
not the primary cause because `plotMountains` directly stamps the planned
mountain and hill masks.

Competing hypotheses dispositioned:

- Projection erases hills: rejected for the current failure; planned hills are
  already near-zero.
- Hill caps are too low: rejected for the scout matrix; targets are high enough
  but candidates are missing.
- Volcanoes prove relief: rejected; `plotVolcanoes` stamps
  `TERRAIN_MOUNTAIN` and `FEATURE_VOLCANO` separately from ridge truth.
- Existing tests catch this: rejected; available tests can pass with mountains
  alone and no meaningful hill/rough-land band.

## 2026-06-03 Orogenic Province Update

The current post-foundation tuning slice extends the earlier rough-land diagnosis
from terrain share to terrain morphology. The product unit is now an orographic
province: a long mountain-region footprint that may contain peaks, hills,
foothills, valleys, forests, resources, and settlement-capable basins.

Additional findings and dispositions:

- Studio/game coordinate mismatch: accepted. Standard recipe visualization
  layers were emitted as `tile.hexOddR`, while generation helpers and live Civ7
  readback use row-major odd-q topology. The standard recipe now emits
  `tile.hexOddQ`, and a guard test rejects odd-r standard-layer regressions.
- Mountain range length under-realization: accepted. The prior planner could
  satisfy range intent with short, curled peak clusters. Range length is now
  represented by `rangeSystemLengthTiles`, Large maps use it as the baseline,
  and the ridge op grows a province axis before width/peak dilation.
- Output-shaped public controls: rejected. Public mountain authorship now uses
  compact physical knobs (`tectonicActivity`, `rangeSystemSpacingTiles`,
  `rangeSystemLengthTiles`, `provinceRadiusTiles`, `ridgeWidthTiles`,
  `foothillExtentTiles`, `interiorHighlandExpression`,
  `terrainTextureFractalMix`, `erosionMaturity`,
  `tectonicSignalSensitivity`) and resolves them to internal executable
  mountain config.
- Resource bottom-row line: accepted as tie-order pathology. Resource placement
  now uses seed-keyed tile-local micro-suitability and hash tie-breaks instead
  of plot-index order for broad ties.

## Corpus Summary

The full corpus is recorded in `workstream/corpus-ledger.md`. Control classes:

- Directly authorable through `TerrainBuilder`: terrain, biome, feature,
  landmass region id, rainfall, plot tags, plus validation/build/model effects.
- Indirectly influenced: engine elevation and cliff crossings after terrain,
  water, and `buildElevation()` effects; resources and feature legality through
  downstream placement surfaces.
- Engine-owned/readback-only: `GameplayMap.getElevation(...)`,
  `GameplayMap.isCliffCrossing(...)`, live water/lake/area classification,
  visibility, owner/unit/city summaries.
- Out of scope: generated `mod/` hand edits, caller-local tuner sockets, and
  Studio setup-write behavior not yet proven.

## Expected Earthlike Bands

Ranges below are predeclared for Swooper Earthlike stable seed matrices before
rough-land implementation. Percentages are land-relative unless stated
otherwise and should be computed on both planned truth and final terrain where
that surface exists.

| Surface | Expected Civ7-scaled band | Reasoning |
| --- | ---: | --- |
| Planned ridge/impassable mountains | `4-9%` target, warn outside `3-12%` | Real mountain definitions cover roughly `12.4-30.5%` of land, but Civ7 `TERRAIN_MOUNTAIN` is impassable ridge/peak terrain, not the whole mountain-system footprint. |
| Final non-volcano mountains | `4-10%` target | Projection may add natural-wonder/volcano mountains; diagnostics must still isolate non-volcano ridge mountains. |
| Planned hills/rough land | `12-24%` target, hard fail below `8%` | Hammond-style landforms separate hills, low hills, breaks/foothills, escarpments, and low mountains from plains. Civ7 hills should carry this broader eroded/uplifted footprint. |
| Final hills | `10-24%` target, hard fail below `8%` | Final terrain may lose some planned hills to water/wonder/hydrology mutation, but it must remain the main rough-land expression. |
| Total rough terrain | `18-32%` target | Ridge mountains plus hills should be visibly broader than impassable mountains alone. |
| Final flat terrain | `55-78%` target, hard fail above `85%` | Earthlike maps need plains and basins, but continental interiors should not collapse into one broad flat class. |
| Lakes and rivers | Lakes `1-6%` target, warn above `8%`; navigable rivers topology/readback only | Inland water should be present but not a substitute for relief. River terrain is Hydrology/engine mutation, not Morphology terrain truth. |
| Volcanoes | Count by configured size budget and tectonic regime; `>=70%` in subduction/rift/hotspot regimes, `<20%` stable-shield-without-hotspot | Volcanism is a sparse point phenomenon; it can stamp mountain terrain but cannot satisfy ridge or rough-land bands. |
| Coasts/shelves | Coast/ocean as projection/readback budget, not land roughness | Continental shelves are shallow and coastal; their extent should be measured through coast/shelf projection, not Morphology rough-land truth. |
| Cliffs/elevation | No hard success band until first runtime baseline; must be read back after `buildElevation()` | Cliffs are engine-owned adjacency state. Morphology may influence them but cannot claim them from local truth artifacts alone. |
| Mountain province span | Large-map Swooper Earthlike target `~30` tiles for largest province span; peak spines may be discontinuous and shorter | The authored province is the mountain region, not a solid mountain tile output. Valleys and passes inside the region are expected. |

External references used for predeclaration:

- Nature Scientific Reports: global mountain area depends on definition and
  ranges from at least `12.4%` to `30.5%` of land
  (`https://www.nature.com/articles/s41598-021-84784-8`).
- USGS land-surface forms: flat plains, smooth plains, irregular plains,
  escarpments, low hills, hills, breaks/foothills, and low mountains are
  separated by slope and local relief
  (`https://www.usgs.gov/maps/terrestrial-ecosystems-land-surface-forms-conterminous-united-states`).
- USGS plateau term: plateaus are extensive elevated surfaces, often bounded by
  abrupt descent and dissected by valleys/high hills
  (`https://apps.usgs.gov/thesaurus/term-simple.php?code=832&thcode=3`).
- USGS volcano FAQ: roughly `1,350` potentially active volcanoes exist
  worldwide outside continuous ocean-floor spreading belts
  (`https://www.usgs.gov/faqs/how-many-active-volcanoes-are-there-earth?page=1`).
- National Geographic/NOAA: continental shelves are shallow coastal ocean
  surfaces and make up less than `10%` of ocean area
  (`https://education.nationalgeographic.org/resource/continental-shelf/`,
  `https://prod-01-alb-www-noaa.woc.noaa.gov/education/resource-collections/ocean-coasts/ocean-floor-features`).

## Architecture Strategy

One causal strategy owns the work:

1. Foundation tectonic history and provenance publish eras, crust, plate
   boundary regimes, shield stability, volcanism, and stress/uplift/rift
   signals.
2. Morphology computes landmask, landmasses, coastline/shelf metrics,
   topography, substrate, erosion/geomorphic cycle, belt drivers, ridges,
   foothills, volcanoes, and a new rough-land operation for rolling uplands,
   old highlands, plateaus, escarpments, basin rims, and craton relief.
3. Map projection stamps terrain and feature intent, records planned-vs-final
   drift, and leaves engine-only elevation/cliff state to readback surfaces.
4. Hydrology owns lakes, rivers, floodplain/navigable-river terrain mutation,
   and water readback.
5. Placement/ecology/resources consume final terrain legality and receive
   explicit downstream realignment gates when rough land changes.

## Implementation Slices

1. `morphology-terrain-authorship-control`:
   docs/OpenSpec/corpus/expectations/proof records; no behavior changes.
2. Terrain stats/readback slice:
   add non-volcano mountain separation, hill component structure, rough/flat
   budgets, volcano kind/regime counts, stage deltas, and local relief profile
   gates to world-balance stats.
3. Rough-land Morphology op slice:
   add an operation that consumes belt drivers, substrate, erosion, topography,
   hydrology context, crust/provenance, and age to produce non-foothill hills
   and rough terrain.
4. Earthlike range tuning slice:
   adjust Earthlike config only after slice 2 proves the failure and slice 3
   provides a causal surface.
5. Runtime readback slice:
   prove final terrain/elevation/cliffs through `@civ7/direct-control`; add a
   first-class cliff-crossing map field or a bounded approved read-only probe.
6. Downstream feature/resource realignment:
   re-run and adjust ecology/resource/natural-wonder gates affected by the new
   terrain distribution.

## Direct-Control Boundary

Use the committed package surface, not caller-local FireTuner commands:

- App UI: lifecycle/status/restart/Begin Game/autoplay.
- Tuner after Begin: map summary, bounded plot/grid reads, visibility,
  player/unit/city summaries, `GameInfo` rows, catalog/inspect, and
  validator-first actions only when approved.
- CLI/Studio paths: `civ7 game status`, `map`, `gameinfo`, `catalog`,
  `inspect`, `autoplay`, `restart --begin --wait-tuner --json`, plus Studio
  `GET /api/civ7/status`, `/map-summary`, and `/gameinfo`.

Runtime closure requires branch, commit, command/API path, request id, bounded
logs, parsed payload, terrain/elevation/cliff readback, and residual proof
boundaries.
