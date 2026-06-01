# Implementation Record

## Status

Implemented and archived; Graphite submission follows this record.

## Evidence

- Architecture review disposition:
  - Accepted the stage split because `map-elevation` has an engine lifecycle
    boundary between accepted static lake water and river modeling, and
    `map-rivers` owns a separate post-elevation river materialization pass plus
    a separate `riverDensity` projection knob surface.
  - Repaired review findings before closure: `build-elevation` now consumes
    `artifact:map.hydrology.engineProjectionLakes` readback instead of raw lake
    intent; `noWaterDrift` moved out of a pseudo-stage helper directory into
    `projection-policies`; `adapter.modelRivers(...)` is guarded categorically;
    stage-owned engine snapshots are colocated with `map-hydrology`,
    `map-elevation`, and `map-rivers` artifact owners.
- Official resource evidence:
  - `.civ7/outputs/resources/Base/modules/base-standard/maps/continents.js`,
    `fractal.js`, and `continents-plus.js` all run lake generation before
    `TerrainBuilder.buildElevation()` and river modeling after elevation.
  - The official Fractal/Continents scripts in this snapshot do not consume a
    sea-level setup value in the map script path inspected for this bug.
- Focused projection/config gate:
  - `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/map-stamping.contract-guard.test.ts test/map-elevation/build-elevation-no-water-drift.test.ts test/map-rivers/plot-rivers-post-refresh.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/hydrology-knobs.test.ts test/config/maps-schema-valid.test.ts test/standard-recipe.test.ts`
  - Result: 31 pass, 0 fail, 1254 assertions.
- Focused world/stat gate:
  - `bun run --cwd mods/mod-swooper-maps test -- test/hydrology/plan-lakes.test.ts test/hydrology-knobs.test.ts test/ecology/feature-planner-policies.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/ecology/earthlike-balance-smoke.test.ts test/pipeline/seed-matrix-stats.test.ts test/pipeline/earth-metrics.test.ts test/pipeline/world-balance-stats.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/map-elevation/build-elevation-no-water-drift.test.ts test/map-rivers/plot-rivers-post-refresh.test.ts test/pipeline/map-stamping.contract-guard.test.ts`
  - Result: 40 pass, 0 fail, 1374 assertions.
- Type/build gates:
  - `bun run --cwd mods/mod-swooper-maps check` passed.
  - `bun run build` passed: 16 successful tasks, 16 total.
- Deploy/runtime gate:
  - `bun run --cwd mods/mod-swooper-maps deploy` passed.
  - Deployed map: `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`, mtime `2026-05-30 04:54:35 -0400`.
  - FireTuner `Network.restartGame()` returned `true`.
  - `Scripting.log` mtime `2026-05-30 04:55:34 -0400`; the fresh run created `MapGeneration` at `2026-05-30 04:55:33`, reached `[50/50] ok mod-swooper-maps.standard.placement.placement` at `2026-05-30 04:55:34`, and ended with `Destroying Context -  MapGeneration`.
  - Bounded log check after the deploy found no `TextEncoder`, `Uncaught`,
    `Error`, `Exception`, or stack failure lines in the inspected MapGeneration
    run.
- Archive/closure gate:
  - `bun run openspec -- archive align-map-terrain-materialization-order --yes`
    archived the change as `2026-05-30-align-map-terrain-materialization-order`
    and promoted the spec delta into `openspec/specs/mapgen-normalization-workstreams/spec.md`.
