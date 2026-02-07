id: LOCAL-TBD
title: Surface full pipeline visualization layers in MapGen Studio
state: planned
priority: 2
estimate: 16
project: mapgen-studio
milestone: null
assignees: [codex]
labels: [pipeline, viz]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Surface full mapgen pipeline layers in the visualizer, add mocks for engine-dependent inputs, and document coverage.

## Deliverables
- Expanded visualization surface that covers the full pipeline (foundation → morphology → hydrology → ecology → placement/gameplay).
- Engine-dependent inputs mocked with explicit code comments and optional UI note when applicable.
- Updated layer catalog documentation (if it is the correct place to record new surfaced layers).
- Validation that runner + viz remain deterministic and browser-safe.

## Acceptance Criteria
- All pipeline stages that emit or can emit visualization layers are surfaced in the MapGen Studio visualizer.
- Placement stage UI labels read “Gameplay” (presentation-only; no domain rename).
- Engine-dependent inputs are mocked 1:1 where possible; deviations are called out in code comments.
- No new worker bundle regressions or import cycles.
- React best practices applied to avoid unnecessary effects and derived state pitfalls.

## Testing / Verification
- `bunx turbo run build --filter=mapgen-studio`
- `bun run lint`
- `bun run test`
- `bun run deploy` (or documented deploy alternative if missing)
- Manual smoke: browser run, layer visibility toggles, internal/debug layer handling, dump replay.

## Dependencies / Notes
- Builds on the App.tsx refactor stack (RFX-01..RFX-05).
- If `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` is the canonical catalog, it should be updated alongside code changes.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)
- Scratch space for exploration notes or prompts. Do not sync this section to Linear.
- Include a Quick Navigation table so humans can jump back to the public sections.

### Effort Estimate (complexity × parallelism)
- **Complexity:** high (full pipeline coverage + mocks + UI surfacing with determinism constraints)
- **Parallelism:** low (shared runner/viz surfaces and layer catalog; safest as linear stack)
- **Score:** 16 (high complexity, low parallelism)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
- [Research Plan](#research-plan)
- [Research Findings](#research-findings)
- [Implementation Decisions](#implementation-decisions)

### Research Plan
**Phase 1 (spike):**
- Inventory pipeline artifacts/fields and existing viz emissions per stage.
- Identify engine-dependent inputs (mock adapter no-ops) and define 1:1-ish mock fallbacks.
- Decide where to emit viz layers (stage steps vs shared helpers) and note any doc gaps.

**Phase 2 (post-spike research plan):**
- [x] Enumerate exact viz layer IDs + groups per stage (foundation/morphology/hydrology/ecology/map-*/placement).
- [x] Define mock projection strategy for engine-owned steps (coasts/elevation/rivers/lakes/biomes/features/placement).
- [x] Decide layer visibility defaults (contract vs internal/debug) and any “Gameplay” relabeling.
- [x] Decide where the viz layer catalog should live (issue doc vs new project doc).
- [x] Review React best-practice guidance (`you-might-not-need-an-effect`, `escape-hatches`) and list target refactors.

### Master Plan (Fractal)
1) **Research Plan** (done): determine layer contract + mock strategy + React guidance targets.
2) **Implementation Plan**: execute stacked branches to emit all pipeline viz layers + mocks (per stage).
3) **Cleanup/Polish Plan**: update docs + JSDoc/comments + React refinements + verification.

### Implementation Plan (Branch Map)
- [x] **PV-00 Docs/Plan**: finalize issue doc plans + add `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`.
- [x] **PV-01 Morphology viz**: emit morphology-pre/mid/post layers (topography, routing, substrate, coastline metrics, landmasses, volcanoes) + map-morphology projections.
- [x] **PV-02 Hydrology viz**: emit climate baseline/refine + hydrography layers; add map-hydrology projection overlays (pipeline-owned).
- [x] **PV-03 Ecology viz**: emit pedology, resource basins, biome classification, feature intents; prefer artifact-driven viz over map-ecology engine projections.
- [x] **PV-04 Gameplay viz**: emit placement/gameplay layers (region slots, start sectors, start positions); label “Gameplay” in viz UI.
- [x] **PV-05 React & UX cleanup**: apply `you-might-not-need-an-effect` + `escape-hatches` fixes with minimal behavior change.
- [x] **PV-06 Tests & docs sync**: add real-path viz layer tests; ensure layer catalog matches implementation.

### Cleanup & Polish Plan
- Add inline code comments for non-1:1 mocks (optionally a small UI hover note where helpful).
- Update VIZ layer catalog doc to match actual layer IDs, groups, visibility, and mock notes.
- Run required verification + manual smoke; record results in this issue doc.

### Verification Log
- `bun run --cwd packages/mapgen-core build` (required for downstream builds).
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted a `spawn` warning from loaders.gl).
- `bun run lint`
- `bun run test`
- `bun run deploy` (missing script in repo; no-op)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

**PV-02 Hydrology**
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted `spawn` warning from loaders.gl)
- `bun run lint`
- `bun run test`
- `bun run deploy` (missing script in repo)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

**PV-03 Ecology**
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted `spawn` warning from loaders.gl)
- `bun run lint`
- `bun run test`
- `bun run deploy` (missing script in repo)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

**PV-04 Gameplay**
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted `spawn` warning from loaders.gl)
- `bun run lint`
- `bun run test`
- `bun run deploy` (missing script in repo)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

**PV-05 React/UX**
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted `spawn` warning from loaders.gl)
- `bun run lint`
- `bun run test`
- `bun run deploy` (missing script in repo)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

**PV-06 Tests/Docs**
- Added real-path viz emission test via standard recipe run (captures emitted layer IDs).
- Shared standard recipe test config moved to `mods/mod-swooper-maps/test/support/standard-config.ts`.
- `bunx turbo run build --filter=mapgen-studio` (worker bundle check passed; Vite emitted `spawn` warning from loaders.gl)
- `bun run lint`
- `bun run test` (includes new `viz-emissions` test)
- `bun run deploy` (missing script in repo)
- `timeout 15 bun run dev:mapgen-studio` (Vite started; manual browser smoke still required)

### Research Findings
- Existing viz layers only in `foundation` steps; all other stages currently emit no viz.
- Core artifact surfaces to visualize:
  - Morphology: topography (elevation/seaLevel/landMask/bathymetry), routing (flowDir/flowAccum/basinId), substrate (erodibilityK/sedimentDepth), coastline metrics, landmasses, volcanoes.
  - Hydrology: climate field (rainfall/humidity), seasonality amplitudes, wind/current fields, climate indices, cryosphere fields, diagnostics, hydrography (runoff/discharge/riverClass/sink/outlet/basinId).
  - Ecology: biome classification fields, pedology (soilType/fertility), resource basins (plots/intensity), feature intents (vegetation/wetlands/reefs/ice).
  - Map/Gameplay: landmass region slots, engine terrain/feature/biome fields after map-morphology/map-ecology/map-hydrology/placement.
- Engine-dependent / mock-sensitive inputs:
  - `buildElevation`, `generateLakes`, `addNaturalWonders`, `generateResources`, `addFloodplains`, `generateSnow`, `storeWaterData`, and placement apply calls in the mock adapter are no-ops.
  - `syncHeightfield` pulls from adapter; mock currently returns flat elevations unless we inject a fallback.
  - Plan: add explicit mock fallbacks where no-op yields empty/flat fields (with code comments noting non-1:1).
- Doc gap: `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` not present in repo; need to decide whether to create/update a catalog file or document in issue+stage docs.

### Spike redo #3 — Engine override confirmation (Jan 30, 2026)
**Goal:** Re-validate “should/should not” engine ownership with file evidence.

**Evidence (breadcrumbs):**
- Map‑morphology is adapter‑heavy (terrain/elevation/coasts/volcanoes), but all of these are projections over existing artifacts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` uses `adapter.buildElevation()` then `syncHeightfield(context)` (engine-derived heightfield), but canonical topography already exists in morphology artifacts.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` and `plotMountains.ts`/`plotVolcanoes.ts` write terrain/feature via adapter only (projection).
  - `packages/civ7-adapter/src/mock-adapter.ts` implements `buildElevation()` as **no‑op** and `expandCoasts()` as simple adjacency; therefore adapter‑only outputs are not trustworthy for viz in mock mode.
- Map‑hydrology rivers/lakes are adapter calls in map‑hydrology:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.ts` calls `adapter.modelRivers(...)` then `syncHeightfield(context)`.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts` calls `adapter.generateLakes(...)`.
  - `packages/civ7-adapter/src/mock-adapter.ts` `generateLakes()` is **no‑op**; `modelRivers()` is a best‑effort stub. This reinforces pipeline‑owned hydrography as the viz truth.
- Map‑ecology (biomes/features/effects) writes engine types only:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts` and `features/apply.ts` set engine biomes/features.
  - Mock adapter’s `designateBiomes()`/`addFeatures()` are no‑ops (only effect tags), so engine biomes/features aren’t a reliable source for viz in mock runs.
- Placement apply is gameplay‑owned and adapter‑driven, but placement artifacts already exist for visualization:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts` calls adapter to place wonders/resources/floodplains, assign starts, and record outputs.
  - Mock adapter no‑ops for wonders/resources/floodplains/discoveries; only start positions can be deterministically derived from placement logic.
  - `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts` defines `map.landmassRegionSlotByTile` as the gameplay projection we can visualize (independent from engine IDs).

**Conclusion (re-affirmed):**
- **Pipeline‑owned for viz/mock**: map‑morphology, map‑hydrology, map‑ecology projections should derive from pipeline artifacts (topography/hydrography/ecology), not adapter outputs.
- **Engine‑owned gameplay**: placement apply stays engine‑owned for actual gameplay, but **viz can surface placement inputs/outputs**, and mock projections for engine‑only placements should be explicitly labeled as non‑1:1.

### Research Findings (Phase 2 — viz layer contract draft)
**Morphology (pipeline artifacts)**
- `morphology.topography.elevation` (grid, i16)
- `morphology.topography.landMask` (grid, u8)
- `morphology.topography.bathymetry` (grid, i16)
- `morphology.routing.flowDir` (grid, i32; debug)
- `morphology.routing.flowAccum` (grid, f32)
- `morphology.routing.basinId` (grid, i32; debug)
- `morphology.substrate.erodibilityK` (grid, f32)
- `morphology.substrate.sedimentDepth` (grid, f32)
- `morphology.coastlineMetrics.coastalLand` (grid, u8)
- `morphology.coastlineMetrics.coastalWater` (grid, u8)
- `morphology.coastlineMetrics.distanceToCoast` (grid, u16)
- `morphology.landmasses.landmassIdByTile` (grid, i32; plate-id coloring)
- `morphology.volcanoes.volcanoMask` (grid, u8)
- `morphology.volcanoes.points` (points; value=strength01)

**Map‑morphology (projection overlays for viz/mock)**
- `map.morphology.mountains.mountainMask` (grid, u8)
- `map.morphology.mountains.hillMask` (grid, u8)
- `map.morphology.mountains.orogenyPotential` (grid, u8/ f32)
- `map.morphology.mountains.fracturePotential` (grid, u8/ f32)
- `map.morphology.coasts.coastalLand` (grid, u8) + `map.morphology.coasts.coastalWater` (grid, u8)
- `map.morphology.volcanoes.points` (points; value=strength01) [if not reusing morphology layer]

**Hydrology**
- `hydrology.climate.rainfall` (grid, u8)
- `hydrology.climate.humidity` (grid, u8)
- `hydrology.climate.seasonality.rainfallAmplitude` (grid, u8)
- `hydrology.climate.seasonality.humidityAmplitude` (grid, u8)
- `hydrology.wind.windU` / `hydrology.wind.windV` (grid, i8; debug)
- `hydrology.current.currentU` / `hydrology.current.currentV` (grid, i8; debug)
- `hydrology.climate.indices.surfaceTemperatureC` (grid, f32)
- `hydrology.climate.indices.pet` (grid, f32)
- `hydrology.climate.indices.aridityIndex` (grid, f32)
- `hydrology.climate.indices.freezeIndex` (grid, f32)
- `hydrology.cryosphere.snowCover` (grid, u8)
- `hydrology.cryosphere.seaIceCover` (grid, u8)
- `hydrology.cryosphere.albedo` (grid, u8)
- `hydrology.cryosphere.groundIce01` (grid, f32)
- `hydrology.cryosphere.permafrost01` (grid, f32)
- `hydrology.cryosphere.meltPotential01` (grid, f32)
- `hydrology.climate.diagnostics.rainShadowIndex` (grid, f32; debug)
- `hydrology.climate.diagnostics.continentalityIndex` (grid, f32; debug)
- `hydrology.climate.diagnostics.convergenceIndex` (grid, f32; debug)
- `hydrology.hydrography.runoff` (grid, f32)
- `hydrology.hydrography.discharge` (grid, f32)
- `hydrology.hydrography.riverClass` (grid, u8; categories)
- `hydrology.hydrography.sinkMask` (grid, u8)
- `hydrology.hydrography.outletMask` (grid, u8)
- `hydrology.hydrography.basinId` (grid, i32; debug)

**Ecology**
- `ecology.biome.biomeIndex` (grid, u8; categories)
- `ecology.biome.vegetationDensity` (grid, f32)
- `ecology.biome.effectiveMoisture` (grid, f32)
- `ecology.biome.surfaceTemperature` (grid, f32)
- `ecology.biome.aridityIndex` (grid, f32)
- `ecology.biome.freezeIndex` (grid, f32)
- `ecology.biome.groundIce01` (grid, f32)
- `ecology.biome.permafrost01` (grid, f32)
- `ecology.biome.meltPotential01` (grid, f32)
- `ecology.biome.treeLine01` (grid, f32)
- `ecology.pedology.soilType` (grid, u8; categories)
- `ecology.pedology.fertility` (grid, f32)
- `ecology.resourceBasins.<resourceId>` (points; value=intensity)
- `ecology.featureIntents.vegetation|wetlands|reefs|ice` (points; value=feature id)

**Map / Gameplay (projection + placement)**
- `gameplay.landmassRegionSlotByTile` (grid, u8) → show “Gameplay” group label in UI
- `gameplay.startPositions` (points; value=player id) from placement `assignStartPositions` output
- Engine‑owned placements (wonders/resources/discoveries/floodplains/snow): no canonical positions in pipeline; need deterministic mock selection if we want map layers (see mock strategy below).

**Mock strategy notes**
- Coasts/elevation/rivers/lakes/biomes/features can be derived from artifacts; do not rely on mock adapter no-ops.
- Placement apply outputs are engine‑owned; we can visualize starts from `assignStartPositions` (pipeline logic) and consider deterministic mock placement for wonders/resources/discoveries (explicitly non‑1:1).

**Visibility defaults (draft)**
- **Debug:** morphology routing flowDir/basinId, hydrology wind/current, hydrology climate diagnostics, hydrography basinId, map‑morphology orogeny/fracture.
- **Default:** all primary pipeline fields (topography, climate, hydrography, ecology, landmass regions, starts).

**React best‑practice notes (from official docs)**
- Avoid Effects for deriving state from props or other state; compute during render or via memoization instead.
- Use Effects as “escape hatches” only for syncing with external systems (imperative APIs, subscriptions, timers, DOM).
- If state resets in response to another state change, prefer keying, conditional rendering, or derived values over effects.
### Spike Report — Engine Override “Should/Should Not”
**Objective**: Decide which map stages should be pipeline‑owned vs engine‑owned for visualization and mocks, based on existing artifact truth and adapter behavior.

**Map seed / breadcrumbs**
- Pipeline truth via artifacts/fields (publish in stages): `mods/mod-swooper-maps/src/recipes/standard/stages/**`
- Engine calls (map‑morphology, map‑hydrology, map‑ecology, placement): `mods/mod-swooper-maps/src/recipes/standard/stages/**/steps/*`
- Mock adapter behavior: `packages/civ7-adapter/src/mock-adapter.ts`
- Core invariant: climate buffers are canonical; engine readback removed: `packages/mapgen-core/src/core/types.ts`

**Findings (grounded)**
- Many “map-*” steps call `context.adapter.*` (terrain, biomes, features, rivers, lakes, placement) even when pipeline artifacts already carry the canonical data. See adapter usage scan in map stages: `mods/mod-swooper-maps/src/recipes/standard/stages/**/steps/*`.
- Mock adapter is no‑op for terrain/elevation/lakes/resources/placement, so relying on adapter for viz yields empty/flat results: `packages/civ7-adapter/src/mock-adapter.ts`.
- Climate buffers are canonical; engine readback has been removed (explicit throw): `packages/mapgen-core/src/core/types.ts` (syncClimateField).

**Spike redo (full pass) — evidence & refinements**
- Map-morphology still depends on adapter writes for terrain/coasts/elevation (`plotCoasts.ts`, `buildElevation.ts`, `plotMountains.ts`, `plotVolcanoes.ts`), but the *truth* already exists in Morphology artifacts (`artifact:morphology.topography`, `artifact:morphology.volcanoes`) and should be used for viz/mock projections.
- Map-hydrology uses adapter for rivers/lakes (`plotRivers.ts`, `lakes.ts`); Hydrology hydrography is explicitly the canonical pipeline surface (`artifact:hydrology.hydrography`) and engine rivers/lakes are projection-only.
- Map-ecology writes engine biomes/features/plot effects even though Ecology artifacts already include classification + intents; adapter’s role is to project into engine fields for gameplay, not to define canonical truth.
- Placement apply is gameplay/engine-owned, but placement *inputs* and *outputs* are defined as artifacts (`artifact:placementInputs`, `artifact:placementOutputs`) and can be visualized/mocked without engine.

**Should be pipeline‑owned (override OK)**
- **Map‑morphology projection** (viz/mock): derive coasts/continents/mountains/volcano masks from `topography`, `coastlineMetrics`, `volcanoes`, and `plotMountains` plan output; avoid adapter‑only effects (engine is projection, not truth).
- **Map‑hydrology projection** (viz/mock): derive rivers/lakes from hydrography + topography (e.g., riverClass, discharge) instead of `adapter.modelRivers`/`generateLakes`.
- **Map‑ecology projection** (viz/mock): drive biomes/features/plot‑effects from ecology artifacts + feature intents; do not depend on adapter in mock path.
  - **Plot coasts / terrain stamping**: OK to pipeline‑own for viz/mock (explicit user requirement); treat adapter as gameplay-only projection.

**Should remain engine‑owned (gameplay, not viz truth)**
- **Placement apply**: natural wonders/resources/discoveries/start placements are engine/gameplay‑critical; for viz/mock we should synthesize deterministic placeholders, but keep adapter calls for gameplay runtime.
- **Engine maintenance** (`validateAndFixTerrain`, `recalculateAreas`, `stampContinents`, `storeWaterData`): keep for gameplay; in mock/viz they remain no‑ops with explicit comments.

**Open decisions**
- Whether to apply pipeline overrides only in browser‑runner/viz (mock) or also in gameplay runtime steps.
- Where to document the new viz layer catalog (no existing `VIZ-LAYER-CATALOG.md` found).

### Spike redo #2 (explicit re-run) — “should override engine” inventory
**Map seed (entry points)**
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` → stage order (foundation → morphology-pre/mid/post → hydrology-climate-baseline/hydrography/refine → ecology → map-morphology/map-hydrology/map-ecology → placement)
- `mods/mod-swooper-maps/src/recipes/standard/stages/**/artifacts.ts` → canonical pipeline truth
- `mods/mod-swooper-maps/src/recipes/standard/stages/**/steps/*` → engine projection calls
- `packages/civ7-adapter/src/mock-adapter.ts` → mock adapter no-op surface

**Breadcrumbs**
- `map-morphology/steps/plotCoasts.ts` → adapter terrain writes + expandCoasts; uses `artifact:morphology.topography`
- `map-morphology/steps/plotMountains.ts` → adapter terrain writes; uses plan masks from ops + `artifact:morphology.topography`
- `map-morphology/steps/plotVolcanoes.ts` → adapter terrain + feature writes; uses `artifact:morphology.volcanoes`
- `map-morphology/steps/buildElevation.ts` → adapter `buildElevation()` + `syncHeightfield` (adapter readback)
- `map-hydrology/steps/plotRivers.ts` → adapter `modelRivers`; references `artifact:hydrology.hydrography` but doesn’t project from it
- `map-hydrology/steps/lakes.ts` → adapter `generateLakes`
- `map-ecology/steps/plotBiomes.ts` → adapter biome writes from `artifact:ecology.biomeClassification`
- `placement/steps/placement/apply.ts` → adapter placement calls (wonders/resources/floodplains/starts/discoveries)
- `packages/civ7-adapter/src/mock-adapter.ts` → no-ops for `buildElevation`, `generateLakes`, `storeWaterData`, `addNaturalWonders`, `generateResources`, `addFloodplains`, `generateDiscoveries`, `assignAdvancedStartRegions` (terrain/biome/feature writes *do* mutate mock arrays)

**Updated should/should-not**
- **Override OK (viz/mock, pipeline-owned):**
  - Map‑morphology projections: derive coastlines/mountains/volcano masks/elevation from Morphology artifacts + ops plans (do not depend on adapter buildElevation/expandCoasts).
  - Map‑hydrology projections: derive river/lake overlays from `artifact:hydrology.hydrography` + topography (engine rivers/lakes are projection-only).
  - Map‑ecology projections: derive biome/feature/plot‑effect overlays from Ecology artifacts (adapter is gameplay projection).
  - **Explicit user request**: treat `plotCoasts` as pipeline‑owned for viz/mock (adapter should not be the only source).
- **Engine‑owned (gameplay runtime, not viz truth):**
  - Placement apply outputs (wonders/resources/discoveries/starts) remain engine‑owned for gameplay; for viz/mock we should synthesize deterministic placeholders.
  - Engine maintenance calls (`validateAndFixTerrain`, `recalculateAreas`, `stampContinents`, `storeWaterData`) remain gameplay‑only; mock path should not rely on their outputs.

**Remaining open question**
- Whether to record the viz layer contract in a new project doc vs the issue doc (no `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` found).

### Implementation Decisions
### Create project-level viz layer catalog doc
- **Context:** `VIZ-LAYER-CATALOG.md` is referenced but missing; we need a stable, shareable contract beyond the issue doc.
- **Options:** Keep catalog in issue doc only; add new `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`.
- **Choice:** Add `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`.
- **Rationale:** Keeps a canonical, project-scoped contract that survives this issue and can be referenced by future work.
- **Risk:** Low; new doc must stay in sync with implementation.

### Keep layerIds stable; use labels/groups for “Gameplay”
- **Context:** Placement is becoming “Gameplay”, but domain IDs should remain stable.
- **Options:** Rename layerIds/stepIds to `gameplay.*`; keep `placement.*` IDs and change labels/groups.
- **Choice:** Keep `placement.*` IDs and label/group as “Gameplay” in viz presentation/meta.
- **Rationale:** Avoids contract churn while still presenting the desired UX label.
- **Risk:** Low; relies on UI/meta path to show “Gameplay” consistently.

### Emit biomeIndex after refine step
- **Context:** `biome-edge-refine` mutates `biomeIndex` in place after `biomes` publishes the artifact.
- **Options:** Dump `biomeIndex` in `biomes` (pre-refine) or after `biome-edge-refine` (post-refine).
- **Choice:** Dump `ecology.biome.biomeIndex` after `biome-edge-refine`.
- **Rationale:** Ensures the visualized biome index matches the final, refined field used downstream.
- **Risk:** Low; only affects viz timing for one layer.

### Feature intents layer uses FEATURE_PLACEMENT_KEYS categories
- **Context:** Feature intent placements are point lists with string feature ids; viz expects numeric values.
- **Options:** Separate layers per category; single layer with numeric mapping; omit values and show generic points.
- **Choice:** Single `ecology.featureIntents.featureType` layer with `u16` values mapped from `FEATURE_PLACEMENT_KEYS` (plus sorted unknowns).
- **Rationale:** Keeps layer contract stable while preserving feature-type distinction and deterministic ordering.
- **Risk:** Low; unknown feature ids will appear with extra categories but still deterministic.

### Resource basin ids projected from basin lists
- **Context:** Resource basins are stored as lists of plot indices + intensities (no grid field).
- **Options:** Emit no viz; emit intensity points only; derive a per-tile basin id grid.
- **Choice:** Derive `ecology.resourceBasins.resourceBasinId` by projecting basin plot indices into a grid.
- **Rationale:** Enables simple basin visualization without introducing new artifacts or engine dependencies.
- **Risk:** Low; overlapping basins will overwrite ids, but basin lists are expected to be disjoint.

### Prefer artifact-driven ecology viz over map-ecology engine projections
- **Context:** Map-ecology steps apply engine biomes/features but mock adapter implementations are no-ops.
- **Options:** Emit projection overlays from map-ecology steps; rely on ecology artifacts for viz.
- **Choice:** Use ecology artifacts (biome classification + feature intents) as viz sources; skip engine projection layers.
- **Rationale:** Preserves determinism and avoids adapter-dependent outputs in browser runs.
- **Risk:** Low; map-ecology engine fields remain unvisualized for now.

### Placement viz surfaces region slots + starts; no mock wonders/floodplains yet
- **Context:** Placement plan outputs do not include explicit wonder/floodplain positions; apply step delegates placement to the engine.
- **Options:** Generate synthetic placement points (mock); only emit deterministic placement grids/starts; delay until placement ops expose positions.
- **Choice:** Emit region slots, start-sector grid, and start positions; defer mock wonder/floodplain points.
- **Rationale:** Keeps visualization deterministic and avoids speculative placements without source positions.
- **Risk:** Medium; some gameplay layers remain unvisualized until placement ops expose positions or mocks are added.
