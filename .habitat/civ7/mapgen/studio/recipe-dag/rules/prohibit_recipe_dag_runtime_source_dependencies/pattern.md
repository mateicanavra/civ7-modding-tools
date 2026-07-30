---
level: error
---
# Prohibit Recipe DAG Runtime Source Dependencies

The Studio recipe-DAG service and its studio contract source consume contract metadata, not runtime recipe implementation or recipe authoring helpers.

```grit
language js(typescript)

or {
  `import $imports from "@swooper/swooper-physics/standard"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "@swooper/swooper-physics/standard/artifacts"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "@swooper/swooper-physics/standard/map-config"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `import $imports from "@swooper/swooper-physics/catalog"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `"src/recipes/standard/recipe.js"` where {
    $filename <: r".*apps/mapgen-studio/src/server/recipeDag/service\.ts$"
  },
  `"recipe.js"` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  },
  `createRecipe` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  },
  `createStage` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  },
  `createStep` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  },
  `collectOperations` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  },
  `implementArtifactModules` where {
    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/studio-contracts/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import standardRecipe from "@swooper/swooper-physics/standard";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import configs from "@swooper/swooper-physics/standard/map-config";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
const sourcePath = "src/recipes/standard/recipe.js";

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
const runtime = "recipe.js";

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
const helper = createStep;

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
const operations = collectOperations(domain);

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
const helper = implementArtifactModules;
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { sources } from "@swooper/swooper-physics/standard/dag";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
import { buildRecipeDag } from "@swooper/mapgen-core/authoring/recipe-dag";

// @filename: apps/mapgen-studio/src/server/recipeDag/service.ts
const contract = "../standard/contract-manifest.js";

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
import { standardStageContractManifest } from "../standard/contract-manifest.js";

// @filename: plugins/mod/map/swooper-physics/src/recipes/studio-contracts/index.ts
const helper = "createRecipe";

// @filename: plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts
createRecipe(definition);

// @filename: apps/mapgen-studio/src/server/recipeDag/service.tsx
import standardRecipe from "@swooper/swooper-physics/standard";
```
