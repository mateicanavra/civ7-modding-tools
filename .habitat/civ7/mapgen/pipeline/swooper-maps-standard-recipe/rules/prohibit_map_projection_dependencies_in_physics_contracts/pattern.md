---
level: error
---
# Prohibit Map Projection Dependencies In Physics Contracts

Standard recipe physics-stage contracts must not require map projection
artifacts or map projection effect tags.

```grit
language js(typescript)

or {
  `"artifact:map.$suffix"`,
  `"effect:map.$suffix"`,
  `MAP_PROJECTION_EFFECT_TAGS.map.$effect`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:foundation|foundation-mantle|foundation-lithosphere|foundation-tectonics|foundation-orogeny|foundation-projection|morphology-coasts|morphology-routing|morphology-erosion|morphology-features|morphology-shelf|hydrology-climate-baseline|hydrology-hydrography|hydrology-climate-refine|ecology-pedology|ecology-biomes|ecology-features)/.*contract\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics.contract.ts
export const dependencies = ["artifact:map.projected"];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains.contract.ts
export const effects = ["effect:map.mountainsPlotted"];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts
export const requires = [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted];
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics.contract.ts
export const dependencies = ["artifact:foundation.tectonics"];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.contract.ts
export const requires = [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted];
```
