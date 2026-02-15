# Hydrology Lakes Deterministic Cutover Audit (Slice S3 readiness)

## 1. Random lake generation entry points (current behavior)
- **File:** `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`
- **Summary:** This step is the only place the pipeline talks to `context.adapter.generateLakes`. It reads `artifact:hydrology.hydrography.sinkMask`/`outletMask` for visualization, computes `tilesPerLake` via `tilesPerLakeMultiplier * Math.max(10, (runtime.mapInfo.LakeGenerationFrequency ?? 5) * 2)`, calls the Civ adapter, then immediately invokes `context.adapter.storeWaterData()` so engine caches flip to the new lakes. `runtime.mapInfo` comes from `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`, which in turn calls `adapter.lookupMapInfo()` (typed in `packages/civ7-adapter/src/types.ts` and populated by base Civ maps such as `.civ7/outputs/resources/Base/modules/base-standard/data/maps.xml`). The base script relies on the engine RNG inside `generateLakes` to place lakes, so the pipeline currently just nudges the frequency by `HydrologyLakeinessKnob` (`few/normal/many`) via `HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER` before handing control back to the engine.
- **Concrete S3 cut point:** Replace or wrap this `generateLakes` call with a deterministic stamper that consumes the same `sinkMask`/`outletMask` arrays. Keep the `tilesPerLake` calculus for tuning fallbacks, but the stamping logic needs to be driven by our hydrology flags rather than Civ’s RNG. The `storeWaterData` call should remain in place after the new stamping so cached water tables stay aligned. On S3 cutover we should cut the adapter call and instead emit lake terrain based on the hydrology-derived basin sinks and outlets before the downstream visualization/placement steps run.

## 2. Hydrology artifacts that unlock deterministic lake planning
- **Primary artifact:** `artifact:hydrology.hydrography` defined in `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`. It publishes typed arrays `runoff` (Float32), `discharge` (Float32), `riverClass` (Uint8), `sinkMask`/`outletMask` (Uint8), and an optional `basinId` (Int32). These buffers are the canonical hydrology truth; engine rivers/lakes remain projection-only.
- **Computation trail:** `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.ts` derives `flowDir` from topography (`artifact:morphology.topography` → `elevation`/`landMask`) via `selectFlowReceiver`, feeds it to `accumulateDischarge`, and publishes the artifact alongside the `projectRiverNetwork` output. `accumulateDischarge` (default strategy in `mods/mod-swooper-maps/src/domain/hydrology/ops/accumulate-discharge/strategies/default.ts`) takes `rainfall`, `humidity`, `landMask`, and `flowDir`, produces `runoff` and `discharge`, and marks `sinkMask` when a tile’s flow target is invalid or off-map, `outletMask` when it drains into ocean/boundary, and leaves `receiver` indexes for basin accumulation. The base Morphology routing op (`mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/strategies/default.ts`) already emits `flowDir`, `flowAccum`, and placeholder `basinId`, so the hydrology stage receives deterministic drainage topology.
- **Concrete S3 cut point:** Use the published `sinkMask`/`outletMask` arrays (plus eventual `basinId` once populated) to deterministically mark the tiles that should become lakes. The best place is immediately after `deps.artifacts.hydrography.publish()` in the `hydrology-hydrography` stage, where the masks are freshest. From there, we can either publish a `lakeMask` artifact for later stages or invoke a new stamping helper that sets the engine terrain directly before the `map-hydrology` stage would have called `generateLakes`. This leaves upstream logic untouched and keeps the stage boundary clean for S3 cutover.

## 3. Lake-frequency knobs / fudges in the current map-hydrology path
- **Knob definition:** `HydrologyLakeinessKnob` is defined (with semantics `few|normal|many`) in `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts`. It is described as a projection-only bias and, per the domain docs (`docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`), is limited to `map-hydrology` stage.
- **Multiplier mapping:** The knob-to-number mapping lives in `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts` as `HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER` (`few=1.5`, `normal=1.0`, `many=0.7`). The map-hydrology stage index file (`mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`) exposes this knob schema to the recipe, and the `lakes` step uses it during `normalize` to inflate/deflate `tilesPerLakeMultiplier` before computing `tilesPerLake`. The `MapInfo` value `LakeGenerationFrequency` (typed in `packages/civ7-adapter/src/types.ts` and sourced from `.civ7/outputs/resources/Base/modules/base-standard/data/maps.xml`) provides the base per-map frequency that the knob scales.
- **Concrete S3 cut point:** When we move to deterministic stamping, we still need a way to express `few/normal/many`. Reinterpret the knob multiplier as a tuning factor on the hydrology `basin` size thresholds (e.g., how aggressively we convert saddles into lakes or how large a contiguous sink cluster must be before we mark open water). The place to plug this in is the new deterministic stamper (probably close to the same normalization chain as today) so `lakeiness` still results in more/less lakes even though the engine RNG is retired.

## 4. Tests that will need coverage work for deterministic lake stamping
1. **`mods/mod-swooper-maps/test/map-hydrology/lakes-store-water-data.test.ts`**
   - **Current assurance:** Confirms `map-hydrology/steps/lakes.run()` calls `generateLakes` then `storeWaterData` and that cached water tables flip from land to water.
   - **Why it must change:** Once `generateLakes` is replaced with deterministic stamping, the test should assert that the new stamper honors `sinkMask`/`outletMask` (e.g., lake tiles align with hydrology sinks) and still refreshes cached water via `storeWaterData` or equivalent. There should probably be a new mock that tracks a stamp API instead of the old `generateLakes` invocation.
2. **`mods/mod-swooper-maps/test/hydrology-knobs.test.ts`**
   - **Current assurance:** Validates compilation of hydrology knobs, that `lakeiness` multiplies `tilesPerLakeMultiplier`, and that river knobs adjust length percentiles.
   - **Why it must change:** The deterministic path must still honor `lakeiness`, but the test should evolve to verify the new stamp configuration (e.g., knob remaps to basin-size thresholds or `lakeMask` coverage) instead of just engine-multiplier math. It may also need to cover the new artifact contract if we start publishing a `lakeMask`/`lakeIntent` artifact.
3. **Implicit surface coverage tests (future):** Any test suite that exercises `hydrology/ops/accumulate-discharge` or `hydrology-hydrography` should be extended to cover that `sinkMask`/`outletMask` are deterministic and that they feed into the stamping path. For example, a regression test could seed a small grid, run the hydrology ops, and verify that the deterministic stamper writes the same lake footprint every time given the same inputs and knob.

## Risk list
1. **Dual pipeline confusion:** The engine still exposes `generateLakes`, and tons of code (including scenario assets) assumes the engine generates lakes at runtime. If we don’t keep the adapter call as a fallback or we double-run stamping (engine + deterministic), we risk misaligned caches or duplicate water tiles. S3 needs a clear handoff where the deterministic stamper replaces the engine call rather than running alongside it.
2. **Knob semantics mismatch:** `lakeiness` currently only scales `tilesPerLake`. When we pivot to hydrology data, failing to reinterpret the knob in terms of basin thresholds or number-of-sinks could make the knob behave like a no-op or worse, produce wildly different lake counts per knob setting, breaking player expectations and existing automation coverage.
3. **Cache/inventory drift:** The `storeWaterData` call after the old `generateLakes` was brittle but essential. The deterministic stamper must still trigger either `storeWaterData` or an equivalent cache sync; otherwise downstream `isWater()` calls (e.g., placement or rendering) will read stale land masks and produce weird start sectors or feature placements.
4. **Test coverage gap:** If we only adjust knobs/tests that target the old engine call, we risk shipping S3 without automated guards that ensure deterministic stamping stays aligned with hydrology artifacts. The new stamping logic should have a small regression test (mock hydrology data inputs → deterministic lake mask) so we can detect divergence early.
5. **Hydrography artifact consumption lag:** The `hydrology-hydrography` stage currently treats `sinkMask`/`outletMask` as purely diagnostic. If we repurpose them for stamping without formalizing the artifact contract (schema/validation), future pipeline shuffles (e.g., splitting hydrography or removing viz dumps) might break the deterministic stamp silently. S3 should lock the artifact schema to include `lakeMask` or a direct `lakeIntent` overlay.

## Implementation Log (2026-02-14)

### Landed in working branch
- Added new deterministic hydrology op:
  - `src/domain/hydrology/ops/plan-lakes/*`
  - consumes `landMask + elevation + sinkMask`
  - outputs `lakeMask + plannedLakeTileCount + sinkLakeCount`
- Wired new op into hydrology domain contract/runtime registry:
  - `src/domain/hydrology/ops/contracts.ts`
  - `src/domain/hydrology/ops/index.ts`
- Added canonical artifact:
  - `artifact:hydrology.lakePlan` in `src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
- Updated hydrology-hydrography rivers step to publish lake plan:
  - `steps/rivers.contract.ts` and `steps/rivers.ts`
- Replaced map-hydrology lake projection behavior:
  - removed `generateLakes(...)` usage from `steps/lakes.ts`
  - deterministic `setTerrainType(..., TERRAIN_COAST)` stamping from `lakePlan.lakeMask`
  - retained `recalculateAreas()` and `storeWaterData()` ordering
  - parity drift now compares planned lake mask vs post-projection engine water mask
- Removed lake-frequency fudge surface:
  - dropped `HydrologyLakeinessKnobSchema` from `src/domain/hydrology/shared/knobs.ts`
  - removed `HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER` from `src/domain/hydrology/shared/knob-multipliers.ts`
  - removed `lakeiness` from `map-hydrology` stage knobs schema.

### Test updates completed
- Updated deterministic lake projection tests:
  - `test/map-hydrology/lakes-store-water-data.test.ts`
  - `test/map-hydrology/lakes-area-recalc-resources.test.ts`
- Added new hydrology unit coverage:
  - `test/hydrology-plan-lakes.test.ts`
  - includes sink->lake determinism and sink/outlet disjointness + sink-driven lake planning check.
- Updated knob/config compilation test:
  - `test/hydrology-knobs.test.ts` (removed lakeiness expectations, `lakes` now `{}`).

### Follow-up fixed while validating
- Resolved stale fixture/preset drift causing schema failures:
  - updated `test/support/standard-config.ts` map-ecology keys to step-id keys
  - updated `src/presets/standard/earthlike.json` map-ecology keys and removed `minScore01` legacy fields from ecology planners.
- Corrected op contract authoring style:
  - inlined plan-lakes schemas directly inside `defineOp(...)`
  - removed `additionalProperties` options from plan-lakes contract
  - replaced empty default strategy config with explicit physical control (`maxUpstreamSteps`).

## Regression Follow-up (2026-02-15, S3b lakes regression fix)

### Diagnosis (over-placement + runtime dry planned lakes)
- Deterministic lake planning defaulted to `maxUpstreamSteps: 1` in `plan-lakes` contract, which expands lake plans one drainage hop upstream from each sink.
- In low-relief or convergent routing patches this over-plans non-sink tiles (planned lake footprint > sink footprint).
- During runtime, `plotRivers` executes `validateAndFixTerrain()`, and engine-like validation can revert some non-sink stamped lake tiles back to land.
- Net effect: both reported symptoms are explained by the same root:
  1. over-placement in planning (too many planned lake tiles),
  2. non-filled runtime lakes (subset of planned tiles dry after validation).

### Call/data path trace used
- `hydrology-hydrography/rivers.ts` computes `flowDir` (`computeFlowDir -> selectFlowReceiver`), then calls:
  - `accumulateDischarge` to derive `sinkMask`,
  - `planLakes` with `sinkMask + flowDir` to derive `lakePlan`.
- `map-hydrology/lakes.ts` stamps `lakePlan.lakeMask` to `TERRAIN_COAST`.
- `map-hydrology/plotRivers.ts` runs `modelRivers -> validateAndFixTerrain -> defineNamedRivers` and then cache refresh.
- This confirms the runtime validation phase is downstream of deterministic stamping and can expose over-planned tiles as dry.

### Patch applied
- Changed `mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/contract.ts`:
  - `maxUpstreamSteps` default `1 -> 0` (sink-only by default).

### Regression tests added/updated
- Updated `mods/mod-swooper-maps/test/hydrology-plan-lakes.test.ts`:
  - new case asserting default config plans sink-only and does not include direct upstream tiles.
- Added `mods/mod-swooper-maps/test/map-hydrology/lakes-runtime-fill-drift.test.ts`:
  - reproduces an engine-like validation pass that drops a non-sink over-placed lake tile,
  - asserts that under default planning there are zero dry planned lakes after `lakes` + `plot-rivers`.

### Focused test run (pass)
- `bun run --cwd mods/mod-swooper-maps test test/hydrology-plan-lakes.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/map-hydrology/lakes-area-recalc-resources.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/plot-rivers-post-refresh.test.ts`
- Result: `7 passed, 0 failed`.
