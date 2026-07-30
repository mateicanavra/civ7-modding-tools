---
level: error
---
# Prohibit Recipe Imports In Domain Source

Domain source must not import recipe modules; recipes compose domain surfaces,
not the reverse.

```grit
language js(typescript)

or {
  import_statement(source=$source),
  `export { $exports } from $source`,
  `export type { $exports } from $source`,
  `export * from $source`,
  `import($source)`
} where {
  $source <: r"^[\"']?(?:@mapgen/recipes?(?:/|[\"'])|@swooper/recipes(?:/|[\"'])|[^\"']+/recipes(?:/|[\"'])|(?:\.\./)+recipes(?:/|[\"'])).*"
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/classify/index.ts
import recipe from "../../../../../../recipes/example/recipe.js";

export const value = recipe;

// @filename: plugins/mod/map/another-mod/src/domain/hydrology/index.ts
export * from "@mapgen/recipes/alternate";

// @filename: plugins/mod/map/example-mod/src/domain/morphology/index.ts
export async function loadRecipe() {
  return import("../../../recipes/example/recipe.js");
}
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/classify/index.ts
import { publicDomain } from "@mapgen/domain/ecology";

export const value = publicDomain;

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/classify/index.ts
import { lookalike } from "@mapgen/recipes-extra/example";

export const lookalikeValue = lookalike;

```
