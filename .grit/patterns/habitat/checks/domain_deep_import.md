---
level: error
---
# Domain Deep Import

Recipe and map source must use public domain surfaces, not deep internals.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import x from "@mapgen/domain/foundation/ops/private";

export const value = x;
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import x from "@mapgen/domain/foundation/ops/private";

export const value = x;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import foundation from "@mapgen/domain/foundation/ops";

export const value = foundation;
```
