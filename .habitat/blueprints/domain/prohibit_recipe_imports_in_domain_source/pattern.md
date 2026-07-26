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
// @filename: mods/example-mod/src/domain/ecology/ops/demo/index.ts
import recipe from "../../../../../recipes/example/recipe.js";

export const value = recipe;

// @filename: mods/another-mod/src/domain/hydrology/index.ts
export * from "@mapgen/recipes/alternate";

// @filename: mods/example-mod/src/domain/morphology/index.ts
export async function loadRecipe() {
  return import("../../../recipes/example/recipe.js");
}
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/ecology/ops/demo/index.ts
import { publicDomain } from "@mapgen/domain/ecology";

export const value = publicDomain;

// @filename: mods/example-mod/src/domain/ecology/ops/demo/index.ts
import { lookalike } from "@mapgen/recipes-extra/example";

export const lookalikeValue = lookalike;

```
