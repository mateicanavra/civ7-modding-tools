---
level: error
---
# Require Domain Contract Roots In Step Config Modules

Recipe `StepContract` definitions in `config.ts` import only domain contract
roots, not runtime or private domain files.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/config\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/config\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/config\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/default-import/config.ts
import ecology from "@mapgen/domain/ecology/ops";

export const contract = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/named-import/config.ts
import { ecologyOps } from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/namespace-import/config.ts
import * as ecologyOps from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/type-import/config.ts
import type { EcologyOps } from "@mapgen/domain/ecology/ops";

export type Contract = EcologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/side-effect-import/config.ts
import "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/named-export/config.ts
export { ecologyOps } from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/type-export/config.ts
export type { EcologyOps } from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/star-export/config.ts
export * from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/config-import/config.ts
import { ecologyConfig } from "@mapgen/domain/ecology/config.js";

export const contract = ecologyConfig;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/ops-tail/config.ts
import { buildPlan } from "@mapgen/domain/ecology/ops/build-plan";

export const contract = buildPlan;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/ops-by-id/config.ts
import { opsById } from "@mapgen/domain/ecology/ops-by-id";

export const contract = opsById;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/rules-import/config.ts
import { ecologyRule } from "@mapgen/domain/ecology/rules/private";

export const contract = ecologyRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/strategies-import/config.ts
import { ecologyStrategy } from "@mapgen/domain/ecology/strategies/private";

export const contract = ecologyStrategy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/shared-import/config.ts
import { shared } from "@mapgen/domain/ecology/shared/private";

export const contract = shared;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/types-import/config.ts
import type { EcologyType } from "@mapgen/domain/ecology/types.js";

export type Contract = EcologyType;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/private-import/config.ts
import { privateValue } from "@mapgen/domain/ecology/private";

export const contract = privateValue;

// @filename: mods/mod-other/src/recipes/standard/stages/ecology/steps/private-import/config.ts
import { ecologyOps } from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.ts
import ecology from "@mapgen/domain/ecology";

export const contract = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.tsx
import tsxEcology from "@mapgen/domain/ecology/ops";

export const tsxContract = tsxEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/source-prefix/config.ts
import { sourcePrefixEcology } from "not-a-real-prefix@mapgen/domain/ecology/ops";

export const sourcePrefixContract = sourcePrefixEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/source-relative/config.ts
import { sourceRelativeEcology } from "../../@mapgen/domain/ecology/ops";

export const sourceRelativeContract = sourceRelativeEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/source-protocol/config.ts
import { sourceProtocolEcology } from "virtual:@mapgen/domain/ecology/ops";

export const sourceProtocolContract = sourceProtocolEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/not-config/notconfig.ts
import { filenameLookalikeEcology } from "@mapgen/domain/ecology/ops";

export const filenameLookalikeContract = filenameLookalikeEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/__tests__/config.ts
import { recipeTestEcology } from "@mapgen/domain/ecology/ops";

export const recipeTestContract = recipeTestEcology;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/ecology/steps/plot/config.ts
import mapEcology from "@mapgen/domain/ecology/ops";

export const mapContract = mapEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/recipe.ts
import recipeEcology from "@mapgen/domain/ecology/ops";

export const recipe = recipeEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/contract.ts
import stageEcology from "@mapgen/domain/ecology/ops";

export const stageContract = stageEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts/contract/ecology.contract.ts
import artifactEcology from "@mapgen/domain/ecology/ops";

export const artifactContract = artifactEcology;

// @filename: mods/mod-swooper-maps/mod/recipes/standard/stages/ecology/steps/plot/config.ts
import generatedEcology from "@mapgen/domain/ecology/ops";

export const generatedContract = generatedEcology;

// @filename: packages/example/src/contract.ts
import packageEcology from "@mapgen/domain/ecology/ops";

export const packageContract = packageEcology;
```
