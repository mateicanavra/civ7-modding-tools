---
level: error
---
# Recipe Domain Surface

Recipes may import only the domain root, `/ops`, or `/config.js` public surfaces.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: includes "/ops",
    ! $source <: includes "/config.js"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: includes "/ops",
    ! $source <: includes "/config.js"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: includes "/ops",
    ! $source <: includes "/config.js"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/rules/private";

export const value = rule;
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/rules/private";

export const value = rule;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import config from "@mapgen/domain/foundation/config.js";

export const value = config;
```
