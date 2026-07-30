---
level: error
---
# Require Studio UI Recipe Artifact Imports

MapGen Studio UI imports recipe artifacts, not runtime recipe modules.

```grit
language js(typescript)

or {
  `import $imports from "@swooper/swooper-physics/standard"` where {
    $filename <: r".*apps/mapgen-studio/src/.*\.tsx?$",
    ! $filename <: includes "apps/mapgen-studio/src/browser-runner/",
    ! $filename <: includes "apps/mapgen-studio/src/server/"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import standardRecipe from "@swooper/swooper-physics/standard";

export const value = standardRecipe;

// @filename: apps/mapgen-studio/src/recipes/standard-runtime.ts
import { standardRecipe } from "@swooper/swooper-physics/standard";

export const namedValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-namespace.tsx
import * as standardRecipe from "@swooper/swooper-physics/standard";

export const namespaceValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-type.ts
import type { StandardRecipe } from "@swooper/swooper-physics/standard";

export type TypeValue = StandardRecipe;

// @filename: apps/mapgen-studio/src/recipes/side-effect.ts
import "@swooper/swooper-physics/standard";

export const sideEffect = true;

// @filename: apps/mapgen-studio/src/browser-runnerish/recipeRuntime.ts
import standardRuntimePathLookalike from "@swooper/swooper-physics/standard";

export const pathLookalike = standardRuntimePathLookalike;

```

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import standardRecipe from "@swooper/swooper-physics/standard";

export const value = standardRecipe;

// @filename: apps/mapgen-studio/src/recipes/standard-runtime.ts
import { standardRecipe } from "@swooper/swooper-physics/standard";

export const namedValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-namespace.tsx
import * as standardRecipe from "@swooper/swooper-physics/standard";

export const namespaceValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-type.ts
import type { StandardRecipe } from "@swooper/swooper-physics/standard";

export type TypeValue = StandardRecipe;

// @filename: apps/mapgen-studio/src/recipes/side-effect.ts
import "@swooper/swooper-physics/standard";

export const sideEffect = true;

// @filename: apps/mapgen-studio/src/browser-runnerish/recipeRuntime.ts
import standardRuntimePathLookalike from "@swooper/swooper-physics/standard";

export const pathLookalike = standardRuntimePathLookalike;

```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import artifacts from "@swooper/swooper-physics/standard/artifacts";

export const value = artifacts;

// @filename: apps/mapgen-studio/src/recipes/standard-map-configs.ts
import { standardMapConfigs } from "@swooper/swooper-physics/standard/map-config";

export const configs = standardMapConfigs;

// @filename: apps/mapgen-studio/src/recipes/source-suffix.ts
import suffixLookalike from "@swooper/swooper-physics/standard/artifacts";

export const suffix = suffixLookalike;

// @filename: apps/mapgen-studio/src/recipes/source-prefix.ts
import prefixLookalike from "virtual:@swooper/swooper-physics/standard";

export const prefix = prefixLookalike;

// @filename: apps/mapgen-studio/src/recipes/source-relative.ts
import relativeLookalike from "../@swooper/swooper-physics/standard";

export const relative = relativeLookalike;

// @filename: apps/mapgen-studio/src/recipes/re-export.ts
export { standardRecipe } from "@swooper/swooper-physics/standard";

// @filename: apps/mapgen-studio/src/browser-runner/recipeRuntime.ts
import { standardRecipe } from "@swooper/swooper-physics/standard";

export const recipeRuntime = standardRecipe;

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { standardRecipe } from "@swooper/swooper-physics/standard";

export const recipeService = standardRecipe;

// @filename: apps/mapgen-studio/src/App.js
import jsRecipe from "@swooper/swooper-physics/standard";

export const jsValue = jsRecipe;

// @filename: apps/mapgen-studio/src/App.jsx
import jsxRecipe from "@swooper/swooper-physics/standard";

export const jsxValue = jsxRecipe;

// @filename: apps/other-studio/src/App.tsx
import otherAppRecipe from "@swooper/swooper-physics/standard";

export const otherAppValue = otherAppRecipe;

// @filename: packages/mapgen-studio-helper/src/App.ts
import packageRecipe from "@swooper/swooper-physics/standard";

export const packageValue = packageRecipe;
```
