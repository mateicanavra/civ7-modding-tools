---
level: error
---
# Require Standard Recipe Map Effect Name Suffixes

Standard recipe `effect:map.*` tag-contract names must stay in the current
projected map outcome suffix families: `Projected`, `Plotted`, `Built`, or
`ParityCaptured`.

```grit
language js(typescript)

`"effect:map.$suffix"` where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/tag-contracts\.ts$",
  not { $suffix <: r"[a-z][a-zA-Z0-9]*(?:Projected|Plotted|Built|ParityCaptured)$" }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: "effect:map.landmassApplied",
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: "effect:map.landmassRegionsPlotted",
  rainfall: "effect:map.rainfallProjected",
  elevation: "effect:map.elevationBuilt",
  parity: "effect:map.sourceParityCaptured",
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/other.ts
export const external = "effect:map.landmassApplied";
```
