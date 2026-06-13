---
level: error
---
# Recipe Runtime Domain Ops

Recipe runtime modules must import domain runtime op bundles, not contract roots.

```grit
language js(typescript)

`import $imports from $source` where {
  $filename <: r".*mods/[^/]+/src/recipes/.*/recipe\.ts$",
  $source <: r".*@mapgen/domain/[^/]+$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import ecology from "@mapgen/domain/ecology";

export const recipe = ecology;
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import ecology from "@mapgen/domain/ecology";

export const recipe = ecology;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import ecology from "@mapgen/domain/ecology/ops";

export const recipe = ecology;
```
