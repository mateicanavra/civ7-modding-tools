---
level: error
---
# Prohibit Adapter Access Outside Projection Boundaries

Physics and planning stages consume authored artifacts. Only `map-*` projection stages and the terminal Placement stage may access the engine adapter.

```grit
language js(typescript)

`$owner.adapter` where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
  ! $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(map-[^/]+|placement)/.*\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.ts
context.adapter.setRainfall(x, y, rainfall);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/features.ts
const adapter = context.adapter;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/project-rainfall.ts
context.adapter.setRainfall(x, y, rainfall);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts
context.adapter.modelRivers(1, 5, terrain);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/assign-starts/index.ts
context.adapter.getAliveMajorIds();

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.tsx
context.adapter.modelRivers(1, 5, terrain);

// @filename: mods/other-mod/src/recipes/standard/stages/map-rivers/steps/demo.ts
context.adapter.modelRivers(1, 5, terrain);
```
