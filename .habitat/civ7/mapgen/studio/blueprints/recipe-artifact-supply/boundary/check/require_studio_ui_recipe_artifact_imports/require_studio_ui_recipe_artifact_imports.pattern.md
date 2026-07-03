---
level: error
---
# Require Studio UI Recipe Artifact Imports

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
import standardRecipe from "mod-swooper-maps/recipes/standard";

export const value = standardRecipe;

// @filename: apps/mapgen-studio/src/recipes/standard-runtime.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const namedValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-namespace.tsx
import * as standardRecipe from "mod-swooper-maps/recipes/standard";

export const namespaceValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-type.ts
import type { StandardRecipe } from "mod-swooper-maps/recipes/standard";

export type TypeValue = StandardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/browser-test-runtime.tsx
import browserTestRecipe from "mod-swooper-maps/recipes/browser-test";

export const browserTestValue = browserTestRecipe;

// @filename: apps/mapgen-studio/src/recipes/side-effect.ts
import "mod-swooper-maps/recipes/standard";

export const sideEffect = true;

// @filename: apps/mapgen-studio/src/browser-runnerish/recipeRuntime.ts
import standardRuntimePathLookalike from "mod-swooper-maps/recipes/standard";

export const pathLookalike = standardRuntimePathLookalike;

// @filename: apps/mapgen-studio/src/serverish/recipeRuntime.ts
import browserTestPathLookalike from "mod-swooper-maps/recipes/browser-test";

export const serverPathLookalike = browserTestPathLookalike;
```

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import standardRecipe from "mod-swooper-maps/recipes/standard";

export const value = standardRecipe;

// @filename: apps/mapgen-studio/src/recipes/standard-runtime.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const namedValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-namespace.tsx
import * as standardRecipe from "mod-swooper-maps/recipes/standard";

export const namespaceValue = standardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/standard-type.ts
import type { StandardRecipe } from "mod-swooper-maps/recipes/standard";

export type TypeValue = StandardRecipe;

// @filename: apps/mapgen-studio/src/features/recipes/browser-test-runtime.tsx
import browserTestRecipe from "mod-swooper-maps/recipes/browser-test";

export const browserTestValue = browserTestRecipe;

// @filename: apps/mapgen-studio/src/recipes/side-effect.ts
import "mod-swooper-maps/recipes/standard";

export const sideEffect = true;

// @filename: apps/mapgen-studio/src/browser-runnerish/recipeRuntime.ts
import standardRuntimePathLookalike from "mod-swooper-maps/recipes/standard";

export const pathLookalike = standardRuntimePathLookalike;

// @filename: apps/mapgen-studio/src/serverish/recipeRuntime.ts
import browserTestPathLookalike from "mod-swooper-maps/recipes/browser-test";

export const serverPathLookalike = browserTestPathLookalike;
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/App.tsx
import artifacts from "mod-swooper-maps/recipes/standard-artifacts";

export const value = artifacts;

// @filename: apps/mapgen-studio/src/recipes/browser-test-artifacts.ts
import browserTestArtifacts from "mod-swooper-maps/recipes/browser-test-artifacts";

export const browserTestArtifactValue = browserTestArtifacts;

// @filename: apps/mapgen-studio/src/recipes/standard-map-configs.ts
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";

export const configs = standardMapConfigs;

// @filename: apps/mapgen-studio/src/recipes/source-suffix.ts
import suffixLookalike from "mod-swooper-maps/recipes/standard-artifacts";

export const suffix = suffixLookalike;

// @filename: apps/mapgen-studio/src/recipes/source-prefix.ts
import prefixLookalike from "virtual:mod-swooper-maps/recipes/standard";

export const prefix = prefixLookalike;

// @filename: apps/mapgen-studio/src/recipes/source-relative.ts
import relativeLookalike from "../mod-swooper-maps/recipes/standard";

export const relative = relativeLookalike;

// @filename: apps/mapgen-studio/src/recipes/re-export.ts
export { standardRecipe } from "mod-swooper-maps/recipes/standard";

// @filename: apps/mapgen-studio/src/browser-runner/recipeRuntime.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const recipeRuntime = standardRecipe;

// @filename: apps/mapgen-studio/src/browser-runner/nested/recipeRuntime.ts
import browserTestRecipe from "mod-swooper-maps/recipes/browser-test";

export const nestedRecipeRuntime = browserTestRecipe;

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const recipeService = standardRecipe;

// @filename: apps/mapgen-studio/src/server/nested/recipeDag.ts
import browserTestRecipe from "mod-swooper-maps/recipes/browser-test";

export const nestedRecipeService = browserTestRecipe;

// @filename: apps/mapgen-studio/src/App.js
import jsRecipe from "mod-swooper-maps/recipes/standard";

export const jsValue = jsRecipe;

// @filename: apps/mapgen-studio/src/App.jsx
import jsxRecipe from "mod-swooper-maps/recipes/standard";

export const jsxValue = jsxRecipe;

// @filename: apps/other-studio/src/App.tsx
import otherAppRecipe from "mod-swooper-maps/recipes/standard";

export const otherAppValue = otherAppRecipe;

// @filename: packages/mapgen-studio-helper/src/App.ts
import packageRecipe from "mod-swooper-maps/recipes/standard";

export const packageValue = packageRecipe;
```
