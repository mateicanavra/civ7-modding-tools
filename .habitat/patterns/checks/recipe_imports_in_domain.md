---
level: error
---
# Recipe Imports In Domain

Domain source must not import recipe modules; recipes compose domain surfaces,
not the reverse.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r".*(?:mod-swooper-maps/recipes(?:/|[\"'])|@mapgen/recipes(?:/|[\"'])|@mapgen/recipe(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
  },
  `import $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r".*(?:mod-swooper-maps/recipes(?:/|[\"'])|@mapgen/recipes(?:/|[\"'])|@mapgen/recipe(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r".*(?:mod-swooper-maps/recipes(?:/|[\"'])|@mapgen/recipes(?:/|[\"'])|@mapgen/recipe(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r".*(?:mod-swooper-maps/recipes(?:/|[\"'])|@mapgen/recipes(?:/|[\"'])|@mapgen/recipe(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r".*(?:mod-swooper-maps/recipes(?:/|[\"'])|@mapgen/recipes(?:/|[\"'])|@mapgen/recipe(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import recipe from "../../../../../recipes/standard/recipe.js";

export const value = recipe;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import type { RecipeShape } from "../../../../../recipes/standard/stages/ecology/types.js";

export type Value = RecipeShape;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import "../../../../../recipes/standard/stages/ecology/setup.js";

// @filename: mods/mod-swooper-maps/src/domain/hydrology/config.ts
import { standardRecipe } from "mod-swooper-maps/recipes/standard";

export const value = standardRecipe;

// @filename: mods/mod-swooper-maps/src/domain/hydrology/config.ts
import { recipe } from "@mapgen/recipes/standard";

export const aliasValue = recipe;

// @filename: mods/mod-swooper-maps/src/domain/morphology/index.ts
export { standardRecipe } from "mod-swooper-maps/recipes/standard";

// @filename: mods/mod-swooper-maps/src/domain/resources/index.ts
export * from "@mapgen/recipes/browser-test";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export async function loadRecipe() {
  return import("../../../../../recipes/standard/recipe.js");
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { publicDomain } from "@mapgen/domain/ecology";

export const value = publicDomain;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { publicOps } from "@mapgen/domain/ecology/ops";

export const opsValue = publicOps;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { helper } from "../../lib/shared.js";

export const helperValue = helper;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { lookalike } from "@mapgen/recipes-extra/standard";

export const lookalikeValue = lookalike;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { lookalike } from "../../../../../recipes-extra/standard.js";

export const relativeLookalike = lookalike;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.tsx
import recipe from "../../../../../recipes/standard/recipe.js";

export const component = recipe;

// @filename: mods/other-mod/src/domain/ecology/ops/demo/index.ts
import recipe from "../../../../../recipes/standard/recipe.js";

export const other = recipe;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import recipe from "../recipe.js";

export const recipeLayer = recipe;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const source = "../../../../../recipes/standard/recipe.js";

export const sourceOnly = source;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("../../../../../recipes-extra/standard/recipe.js");

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
await import("../recipe.js");
```
