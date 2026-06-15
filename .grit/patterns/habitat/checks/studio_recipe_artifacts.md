---
level: error
---
# Studio Recipe Artifacts

MapGen Studio UI imports recipe artifacts, not runtime recipe modules.

```grit
language js(typescript)

or {
  `import $imports from "mod-swooper-maps/recipes/standard"` where {
    $filename <: r".*apps/mapgen-studio/src/.*\.tsx?$",
    ! $filename <: includes "apps/mapgen-studio/src/browser-runner/",
    ! $filename <: includes "apps/mapgen-studio/src/server/"
  },
  `import $imports from "mod-swooper-maps/recipes/browser-test"` where {
    $filename <: r".*apps/mapgen-studio/src/.*\.tsx?$",
    ! $filename <: includes "apps/mapgen-studio/src/browser-runner/",
    ! $filename <: includes "apps/mapgen-studio/src/server/"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import recipe from "mod-swooper-maps/recipes/standard";

export const value = recipe;
```

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import recipe from "mod-swooper-maps/recipes/standard";

export const value = recipe;
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import artifacts from "mod-swooper-maps/recipes/standard-artifacts";

export const value = artifacts;

// @filename: apps/mapgen-studio/src/browser-runner/recipeRuntime.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const recipeRuntime = standardRecipe;

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const recipeService = standardRecipe;
```
