---
level: error
---
# Prohibit Misplaced Projection Adapter Calls

Projection adapter calls stay in their owning map projection steps, while upstream physics stages consume authored artifacts instead of reading engine projection state.

```grit
language js(typescript)

or {
  `$adapter.buildElevation($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/buildElevation\.ts$"
  },
  `$adapter.generateLakes($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$"
  },
  `$adapter.stampLakes($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes\.ts$"
  },
  `$adapter.modelRivers($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers\.ts$"
  },
  `$adapter.getElevation($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(foundation|morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline|hydrology-hydrography|hydrology-climate-refine|ecology-pedology|ecology-biomes|ecology-features)/.*\.ts$"
  },
  `$adapter.isCliffCrossing($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(foundation|morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline|hydrology-hydrography|hydrology-climate-refine|ecology-pedology|ecology-biomes|ecology-features)/.*\.ts$"
  },
  `tile.hexOddR` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/demo.ts
context.adapter.buildElevation();

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/demo.ts
context.adapter.generateLakes();

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/demo.ts
context.adapter.stampLakes(width, height, mask);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/demo.ts
context.adapter.modelRivers(1, 5, terrain);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.ts
context.adapter.getElevation(x, y);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/features.ts
context.adapter.isCliffCrossing(a, b);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts
const space = tile.hexOddR;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/buildElevation.ts
context.adapter.buildElevation();

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts
context.adapter.stampLakes(width, height, mask);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts
context.adapter.modelRivers(1, 5, terrain);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/buildElevation.ts
context.adapter.getElevation(x, y);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts
const space = "tile.hexOddQ";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.tsx
context.adapter.generateLakes();

// @filename: mods/other-mod/src/recipes/standard/stages/map-rivers/steps/demo.ts
context.adapter.generateLakes();
```
