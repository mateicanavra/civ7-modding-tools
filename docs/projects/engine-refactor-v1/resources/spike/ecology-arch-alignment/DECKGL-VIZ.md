# agent-deckgl.md

## Objective

Inventory Ecology-related visualization emissions and identify the Deck.gl/Studio compatibility surface (keys + conventions) that must not break during an ecology refactor.

## Where To Start (Pointers)

- Canonical viz posture: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Studio renderer: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- Ecology truth stage step emissions:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
- Map ecology (engine projection) emissions:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`

## Findings (Grounded)

### A) Ecology truth stage viz emissions (dataTypeKey inventory)

All ecology stage emissions currently use `spaceId: "tile.hexOddR"`.

- `ecology.biome.vegetationDensity` (scalar field variants)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.effectiveMoisture` (scalar field variants)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.surfaceTemperature` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.aridityIndex` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.freezeIndex` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.groundIce01` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.permafrost01` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.meltPotential01` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- `ecology.biome.treeLine01` (grid f32)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`

- `ecology.biome.biomeIndex` (grid u8 categorical w/ explicit categories)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`
  - Note: this is emitted after in-place refinement.

- `ecology.pedology.soilType` (grid u8 categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts`
- `ecology.pedology.fertility` (scalar field variants)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts`

- `ecology.resourceBasins.resourceBasinId` (grid u16 categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts`

- `ecology.featureIntents.featureType` (points; categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

### B) map-ecology (engine projection) viz emissions

All map-ecology stage emissions currently use `spaceId: "tile.hexOddR"`.

- `map.ecology.biomeId` (grid u8 categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
- `map.ecology.temperature` (grid u8)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`

- `map.ecology.featureType` (grid i16 categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`

- `map.ecology.plotEffects.plotEffect` (points u16 categorical)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`

- Debug overlays emitted by features apply:
  - `debug.heightfield.terrain` (grid u8; meta.role = physics vs engine)
  - `debug.heightfield.landMask` (grid u8; meta.role = physics vs engine)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`

### C) Studio deck.gl rendering posture (relevant bits)

- Tile spaces are explicitly supported: `tile.hexOddR` and `tile.hexOddQ`.
  - Studio transforms tile coordinates into render coordinates based on `spaceId`.
  - `apps/mapgen-studio/src/features/viz/deckgl/render.ts` (`isTileSpace`, `tileCenter`, `boundsForTileGrid`, etc.)

- Studio’s key selectors group by `dataTypeKey` and `spaceId` (plus kind/role/variant).
  - Breaking `dataTypeKey` or `spaceId` breaks viewer continuity and any saved selections.

## Compatibility Surface (Must Not Break)

Hard invariants for a behavior-preserving refactor:

- Keep `dataTypeKey` strings stable for existing ecology layers.
- Keep `spaceId` stable (`tile.hexOddR`) unless we deliberately migrate with a compatibility story.
- Keep layer `kind` stable (`grid`, `points`) for each key.
- Keep `meta.palette` semantics stable where specified (categorical vs scalar).
- Keep categorical category definitions stable where explicitly emitted (notably `ecology.biome.biomeIndex`).
- Keep debug keys stable (`debug.heightfield.*`) if we consider them part of the diagnostics contract.

## Open Questions

- Do we consider `debug.heightfield.*` part of the public-ish observability surface, or can these evolve more freely?
- If we split steps/ops, do we want more granular `dataTypeKey`s (e.g., per-feature intent layers) or keep the existing consolidated keys for continuity?

## Suggested Refactor Shapes (Conceptual Only)

- Treat viz emissions as a first-class contract: each step retains responsibility for emitting the same `dataTypeKey`s even if underlying ops/modules move.
- If we pursue more granular “one feature = one op” planning, still aggregate to current `ecology.featureIntents.featureType` for compatibility (additional layers can be additive).
