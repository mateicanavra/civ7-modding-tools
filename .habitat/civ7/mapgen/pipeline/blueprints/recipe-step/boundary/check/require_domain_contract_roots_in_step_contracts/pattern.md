---
level: error
---
# Require Domain Contract Roots In Step Contracts

Step contracts import only domain contract roots, not runtime or private domain files.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/(?:.*/)?(?:contract|[^/]+\.contract)\.ts$",
    $filename <: not r".*/(?:__tests__|__type_tests__)/.*",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/(?:.*/)?(?:contract|[^/]+\.contract)\.ts$",
    $filename <: not r".*/(?:__tests__|__type_tests__)/.*",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/(?:.*/)?(?:contract|[^/]+\.contract)\.ts$",
    $filename <: not r".*/(?:__tests__|__type_tests__)/.*",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/default.contract.ts
import ecology from "@mapgen/domain/ecology/ops";

export const contract = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/named.contract.ts
import { ecologyOps } from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/namespace.contract.ts
import * as ecologyOps from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/type.contract.ts
import type { EcologyOps } from "@mapgen/domain/ecology/ops";

export type Contract = EcologyOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/side-effect.contract.ts
import "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/named-export.contract.ts
export { ecologyOps } from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/type-export.contract.ts
export type { EcologyOps } from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/star-export.contract.ts
export * from "@mapgen/domain/ecology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.contract.ts
import { ecologyConfig } from "@mapgen/domain/ecology/config.js";

export const contract = ecologyConfig;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/ops-tail.contract.ts
import { buildPlan } from "@mapgen/domain/ecology/ops/build-plan";

export const contract = buildPlan;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/ops-by-id.contract.ts
import { opsById } from "@mapgen/domain/ecology/ops-by-id";

export const contract = opsById;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/rules.contract.ts
import { ecologyRule } from "@mapgen/domain/ecology/rules/private";

export const contract = ecologyRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/strategies.contract.ts
import { ecologyStrategy } from "@mapgen/domain/ecology/strategies/private";

export const contract = ecologyStrategy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/shared.contract.ts
import { shared } from "@mapgen/domain/ecology/shared/private";

export const contract = shared;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/types.contract.ts
import type { EcologyType } from "@mapgen/domain/ecology/types.js";

export type Contract = EcologyType;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/private.contract.ts
import { privateValue } from "@mapgen/domain/ecology/private";

export const contract = privateValue;

// @filename: mods/mod-other/src/recipes/standard/stages/ecology/steps/plot/contract.ts
import { ecologyOps } from "@mapgen/domain/ecology/ops";

export const contract = ecologyOps;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.ts
import ecology from "@mapgen/domain/ecology";

export const contract = ecology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.tsx
import tsxEcology from "@mapgen/domain/ecology/ops";

export const tsxContract = tsxEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/source-prefix.contract.ts
import { sourcePrefixEcology } from "not-a-real-prefix@mapgen/domain/ecology/ops";

export const sourcePrefixContract = sourcePrefixEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/source-relative.contract.ts
import { sourceRelativeEcology } from "../../@mapgen/domain/ecology/ops";

export const sourceRelativeContract = sourceRelativeEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/source-protocol.contract.ts
import { sourceProtocolEcology } from "virtual:@mapgen/domain/ecology/ops";

export const sourceProtocolContract = sourceProtocolEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/notacontract.ts
import { filenameLookalikeEcology } from "@mapgen/domain/ecology/ops";

export const filenameLookalikeContract = filenameLookalikeEcology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/__tests__/contract.ts
import { recipeTestEcology } from "@mapgen/domain/ecology/ops";

export const recipeTestContract = recipeTestEcology;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/ecology/steps/plot/contract.ts
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

// @filename: mods/mod-swooper-maps/mod/recipes/standard/stages/ecology/steps/plot/contract.ts
import generatedEcology from "@mapgen/domain/ecology/ops";

export const generatedContract = generatedEcology;

// @filename: packages/example/src/contract.ts
import packageEcology from "@mapgen/domain/ecology/ops";

export const packageContract = packageEcology;
```
