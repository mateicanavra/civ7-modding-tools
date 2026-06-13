---
level: error
---
# MapGen Core Runtime Civ7

`mapgen-core` core/engine source stays independent from Civ7 runtime APIs.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$",
    $source <: r"^(?:@civ7/adapter(?:/civ7)?|/base-standard/.+)$"
  },
  `import $source` where {
    $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$",
    $source <: r"^/base-standard/.+"
  },
  `GameplayMap.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `TerrainBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `ResourceBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `FeatureBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `AreaBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `MapConstructibles.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `GameInfo.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: packages/mapgen-core/src/core/demo.ts
GameplayMap.getGridWidth();
```

```typescript
// @filename: packages/mapgen-core/src/core/demo.ts
GameplayMap.getGridWidth();
```

## Ignores fixture

```typescript
// @filename: packages/mapgen-core/src/core/demo.ts
export const pure = 1;
```
