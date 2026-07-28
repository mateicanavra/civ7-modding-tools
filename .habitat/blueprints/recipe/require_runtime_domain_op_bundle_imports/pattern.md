---
level: error
---
# Require Runtime Domain Router Imports

Recipe runtime modules must import executable domain routers, not declaration-only contract roots.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*plugins/mod/map/[^/]+/src/recipes/.*/recipe\.ts$",
  $source <: r"^[\"']?(?:@mapgen/domain/|(?:\.\./)+domain/)[a-z0-9]+(?:-[a-z0-9]+)*(?:/index\.js)?[\"']?$"
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-default/recipe.ts
import ecology from "@mapgen/domain/ecology";

export const recipe = ecology;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-named/recipe.ts
import { ECOLOGY_OPS } from "@mapgen/domain/ecology";

export const named = ECOLOGY_OPS;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-namespace/recipe.ts
import * as foundation from "@mapgen/domain/foundation";

export const namespaceValue = foundation;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-type/recipe.ts
import type { FoundationDomain } from "@mapgen/domain/foundation";

export type RuntimeDomain = FoundationDomain;

// @filename: plugins/mod/map/swooper-physics/src/recipes/browser-test/recipe.ts
import foundation from "@mapgen/domain/foundation";

export const browserRecipe = foundation;

// @filename: plugins/mod/map/other-mod/src/recipes/standard/recipe.ts
import hydrology from "@mapgen/domain/hydrology";

export const otherModRecipe = hydrology;

// @filename: plugins/mod/map/example-mod/src/recipes/standard/recipe.ts
import morphologyContract from "../../domain/morphology/index.js";

export const relativeContract = morphologyContract;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/nested/recipe.ts
import morphology from "@mapgen/domain/morphology";

export const nestedRecipe = morphology;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-side-effect/recipe.ts
import "@mapgen/domain/ecology";

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-single-quote/recipe.ts
import placement from '@mapgen/domain/placement';

export const singleQuoteRecipe = placement;
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
import ecology from "@mapgen/domain/ecology/router";

export const recipe = ecology;

// @filename: plugins/mod/map/example-mod/src/recipes/standard/recipe.ts
import morphology from "../../domain/morphology/router.js";

export const relativeRouter = morphology;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
import config from "@mapgen/domain/ecology/config.js";

export const configValue = config;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
import privateRule from "@mapgen/domain/ecology/rules/private";

export const privateValue = privateRule;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/not-recipe.ts
import ecologyRoot from "@mapgen/domain/ecology";

export const notRecipeValue = ecologyRoot;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.tsx
import ecologyTsx from "@mapgen/domain/ecology";

export const recipeTsxValue = ecologyTsx;

// @filename: plugins/mod/map/swooper-physics/src/maps/standard/recipe.ts
import mapRecipe from "@mapgen/domain/ecology";

export const mapRecipeValue = mapRecipe;

// @filename: packages/mapgen-core/src/recipes/standard/recipe.ts
import packageRecipe from "@mapgen/domain/ecology";

export const packageRecipeValue = packageRecipe;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/foundation/tectonics/steps/example/config.ts
import contractDomain from "@mapgen/domain/foundation";

export const contractValue = contractDomain;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
export { ECOLOGY_OPS } from "@mapgen/domain/ecology";

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
export * from "@mapgen/domain/ecology";

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
const dynamicDomain = import("@mapgen/domain/ecology");

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
import trailingSlash from "@mapgen/domain/ecology/";

export const trailingSlashValue = trailingSlash;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-prefixed/recipe.ts
import prefixed from "virtual:@mapgen/domain/placement";

export const prefixedRecipe = prefixed;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-relative-lookalike/recipe.ts
import relativeLookalike from "../@mapgen/domain/placement";

export const relativeLookalikeRecipe = relativeLookalike;

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard-protocol-lookalike/recipe.ts
import protocolLookalike from "node:@mapgen/domain/placement";

export const protocolLookalikeRecipe = protocolLookalike;
```
