---
level: error
---
# Prohibit Milestone Prefixed Standard Recipe Tag Catalog Names

Standard recipe tag catalog names must name the owning concern, not a milestone.

```grit
language js(typescript)

`$catalog_name` where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/.*\.ts$",
  $catalog_name <: r"M[0-9]+_[A-Z0-9_]*TAGS|M[0-9]+_CANONICAL_[A-Z0-9_]*"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/tags.ts
export const M1_TAGS = {
  terrain: "effect:engine.terrainApplied",
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts
export const M2_CANONICAL_EFFECT_TAGS = {
  engine: "effect:engine.biomesApplied",
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/tags.ts
const localName = M3_SOME_OWNER_TAGS;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/tags.ts
export const STANDARD_ENGINE_EFFECT_TAGS = {
  terrain: "effect:engine.terrainApplied",
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: "effect:map.elevationBuilt",
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/tags.ts
export const PLACEMENT_PRODUCT_EFFECT_TAGS = new Set();

// @filename: mods/mod-swooper-maps/src/recipes/experimental/tags.ts
export const M1_TAGS = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/tags.tsx
export const M1_TAGS = {};

// @filename: mods/other-mod/src/recipes/standard/tags.ts
export const M1_TAGS = {};
```
