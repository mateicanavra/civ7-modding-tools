---
level: error
---
# Prefer Civ7 Preset Dimensions In MapGen Behavior Tests

Product and domain behavior tests should select one of Civ7's static map-size
presets. A literal custom grid is appropriate only when dimensions are the
controlled fixture, such as bounds, wrap or seam behavior, local topology,
exact cardinality, or dimension behavior. This advisory reports the syntax and
leaves those causal exceptions for review rather than encoding file allowlists.

```grit
language js(typescript)

predicate numeric_literal($value) {
  $value <: r"^-?(?:[0-9][0-9_]*(?:\.[0-9_]+)?|\.[0-9_]+)$"
}

or {
  `{ $..., width: $width, $..., height: $height, $... }` where {
    numeric_literal($width),
    numeric_literal($height)
  },
  `{ $..., height: $height, $..., width: $width, $... }` where {
    numeric_literal($width),
    numeric_literal($height)
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/test/domains/morphology/topography.test.ts
const dimensions = { width: 80, height: 54 } as const;

// @filename: mods/mod-swooper-maps/test/domains/foundation/mesh.test.ts
const reversedDimensions = { height: 3, width: 4 };

// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/wrap.test.ts
const setup = { dimensions: { width: 1, height: 1 }, seed: 11 };
```

## Ignores fixture

```typescript
// A total static preset is the ordinary behavior-test input.
const dimensions = TINY_MAP_SIZE.dimensions;

// Projecting a selected preset remains dynamic rather than a literal custom grid.
const setup = {
  dimensions: { width: preset.dimensions.width, height: preset.dimensions.height },
};

// Local variables do not claim a literal custom grid at this object boundary.
const dimensionsFromFixture = { width, height };
```
