---
level: error
---
# Require Domain Entrypoint Shape

A domain root `index.ts` is a declaration-only public barrel. It exposes the
domain contract from `contract.ts` as its default export and may add only
explicit named re-exports from the domain's `model/` or `modules/` owners.
Contract composition belongs in `contract.ts`; router composition belongs in
`router.ts`.

```grit
language js(typescript)

predicate lacks_domain_contract_entrypoint($body) {
  ! $body <: contains `export { default } from "./contract.js"`
}

or {
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/index\.ts$",
    lacks_domain_contract_entrypoint($body)
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/index\.ts$",
    $body <: some $statement where {
      ! $statement <: or {
        `export { default } from "./contract.js"`,
        `export { $exports } from $source` where {
          $source <: r"^[\"']\./(?:model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/index)\.js[\"']$"
        },
        `export type { $exports } from $source` where {
          $source <: r"^[\"']\./(?:model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/index)\.js[\"']$"
        }
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import thermal from "./modules/thermal/contract.js";

const domain = defineDomain("weather", { thermal });
export default domain;

// @filename: mods/alternate-mod/src/domain/terrain/index.ts
import contract from "./contract.js";

export default contract;

// @filename: mods/example-mod/src/domain/settlement/index.ts
export { default } from "./contract.js";
export { executeSettlement } from "./modules/build-settlement/ops/build/index.js";

// @filename: mods/example-mod/src/domain/ocean/index.ts
export { default } from "./contract.js";
export { OceanCellSchema } from "./model/atoms/index.js";

// @filename: mods/example-mod/src/domain/ecology/index.ts
export { default } from "./contract.js";
export { default as router } from "./router.js";

// @filename: mods/example-mod/src/domain/resources/index.ts
export { default } from "./contract.js";
export * from "./modules/demand/index.js";

// @filename: mods/example-mod/src/domain/geology/index.ts
export { default } from "./contract.js";
export { executeSettlement } from "./modules/build-settlement/ops/build/index.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/index.ts
export { default } from "./contract.js";

// @filename: mods/alternate-mod/src/domain/resources/index.ts
export { default } from "./contract.js";
export {
  ResourceFamilySchema,
  type ResourceSymbol,
} from "./model/atoms/index.js";
export type { ResourcePolicy } from "./model/policy/resource-policy.js";
export {
  default as demand,
  type DemandContract,
} from "./modules/demand/index.js";
```
