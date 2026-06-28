---
level: error
---
# Require Runtime Domain Op Bundle Imports

Recipe runtime modules must import domain runtime op bundles, not contract roots.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/[^/]+/src/recipes/.*/recipe\.ts$",
  $source <: r"^[\"']?@mapgen/domain/[^/]+[\"']?$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard-default/recipe.ts
import ecology from "@mapgen/domain/ecology";

export const recipe = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard-named/recipe.ts
import { ECOLOGY_OPS } from "@mapgen/domain/ecology";

export const named = ECOLOGY_OPS;

// @filename: mods/mod-swooper-maps/src/recipes/standard-namespace/recipe.ts
import * as foundation from "@mapgen/domain/foundation";

export const namespaceValue = foundation;

// @filename: mods/mod-swooper-maps/src/recipes/standard-type/recipe.ts
import type { FoundationDomain } from "@mapgen/domain/foundation";

export type RuntimeDomain = FoundationDomain;

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts
import foundation from "@mapgen/domain/foundation";

export const browserRecipe = foundation;

// @filename: mods/other-mod/src/recipes/standard/recipe.ts
import hydrology from "@mapgen/domain/hydrology";

export const otherModRecipe = hydrology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/nested/recipe.ts
import morphology from "@mapgen/domain/morphology";

export const nestedRecipe = morphology;

// @filename: mods/mod-swooper-maps/src/recipes/standard-side-effect/recipe.ts
import "@mapgen/domain/ecology";

// @filename: mods/mod-swooper-maps/src/recipes/standard-single-quote/recipe.ts
import placement from '@mapgen/domain/placement';

export const singleQuoteRecipe = placement;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import ecology from "@mapgen/domain/ecology/ops";

export const recipe = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import config from "@mapgen/domain/ecology/config.js";

export const configValue = config;

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import privateRule from "@mapgen/domain/ecology/rules/private";

export const privateValue = privateRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/not-recipe.ts
import ecologyRoot from "@mapgen/domain/ecology";

export const notRecipeValue = ecologyRoot;

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.tsx
import ecologyTsx from "@mapgen/domain/ecology";

export const recipeTsxValue = ecologyTsx;

// @filename: mods/mod-swooper-maps/src/maps/standard/recipe.ts
import mapRecipe from "@mapgen/domain/ecology";

export const mapRecipeValue = mapRecipe;

// @filename: packages/mapgen-core/src/recipes/standard/recipe.ts
import packageRecipe from "@mapgen/domain/ecology";

export const packageRecipeValue = packageRecipe;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/contract.ts
import contractDomain from "@mapgen/domain/foundation";

export const contractValue = contractDomain;

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
export { ECOLOGY_OPS } from "@mapgen/domain/ecology";

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
export * from "@mapgen/domain/ecology";

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
const dynamicDomain = import("@mapgen/domain/ecology");

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import trailingSlash from "@mapgen/domain/ecology/";

export const trailingSlashValue = trailingSlash;

// @filename: mods/mod-swooper-maps/src/recipes/standard-prefixed/recipe.ts
import prefixed from "virtual:@mapgen/domain/placement";

export const prefixedRecipe = prefixed;

// @filename: mods/mod-swooper-maps/src/recipes/standard-relative-lookalike/recipe.ts
import relativeLookalike from "../@mapgen/domain/placement";

export const relativeLookalikeRecipe = relativeLookalike;

// @filename: mods/mod-swooper-maps/src/recipes/standard-protocol-lookalike/recipe.ts
import protocolLookalike from "node:@mapgen/domain/placement";

export const protocolLookalikeRecipe = protocolLookalike;
```
