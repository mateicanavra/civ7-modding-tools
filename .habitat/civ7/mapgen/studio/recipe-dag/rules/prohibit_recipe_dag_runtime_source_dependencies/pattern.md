---
level: error
---
# Prohibit Recipe DAG Runtime Source Dependencies

The Studio recipe-DAG service and its studio contract source consume contract metadata, not runtime recipe implementation or recipe authoring helpers.

```grit
language js(typescript)

or {
  `import $imports from "mod-swooper-maps/recipes/standard"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "mod-swooper-maps/recipes/standard-artifacts"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "mod-swooper-maps/recipes/standard-map-configs"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "mod-swooper-maps/recipes/browser-test"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `"src/recipes/standard/recipe.js"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `"recipe.js"` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `"browser-test"` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `createRecipe` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `createStage` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `createStep` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `collectCompileOps` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `compileOpsById` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  },
  `implementArtifactModules` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/studio-contracts/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import standardRecipe from "mod-swooper-maps/recipes/standard";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import configs from "mod-swooper-maps/recipes/standard-map-configs";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
const sourcePath = "src/recipes/standard/recipe.js";

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
const runtime = "recipe.js";

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
const browser = "browser-test";

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
const helper = createStep;

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
const helper = implementArtifactModules;
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { sources } from "mod-swooper-maps/recipes/studio-contracts";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { buildRecipeDag } from "@swooper/mapgen-core/authoring/recipe-dag";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
const contract = "../standard/contract-manifest.js";

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
import { standardStageContractManifest } from "../standard/contract-manifest.js";

// @filename: mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
const helper = "createRecipe";

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
createRecipe(definition);

// @filename: apps/mapgen-studio/src/server/recipeDag/service.tsx
import standardRecipe from "mod-swooper-maps/recipes/standard";
```
