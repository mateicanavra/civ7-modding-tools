---
level: error
---
# Require Domain Module Router Binding Shape

A semantic module `router.ts` is the direct executable aggregate for its leaf
operation implementations. It imports the module contract and each operation
implementation from their canonical leaves, binds the exact implementation
record inline with `createDomainSubdomainRouter`, and exposes only that router.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring"`
  },
  program(statements=$body) where {
    ! $body <: contains `import contract from "./contract.js"`
  },
  program(statements=$body) where {
    ! $body <: contains `import $operation from $source` where {
      $source <: r"^[\"']\./ops/[a-z0-9]+(?:-[a-z0-9]+)*/index\.js[\"']$"
    }
  },
  program(statements=$body) where {
    ! $body <: contains `const $router = createDomainSubdomainRouter(contract, { $implementations })`
  },
  program(statements=$body) where {
    $body <: contains `const $router = createDomainSubdomainRouter(contract, { $implementations })`,
    ! $body <: contains `export default $router`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring"`,
        `import contract from "./contract.js"`,
        `import $operation from $source` where {
          $source <: r"^[\"']\./ops/[a-z0-9]+(?:-[a-z0-9]+)*/index\.js[\"']$"
        },
        `const $router = createDomainSubdomainRouter(contract, { $implementations })`,
        `export default $router`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/geology/modules/tectonics/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeMotion from "./ops/compute-motion/index.js";

const tectonics = createDomainSubdomainRouter(contract, { computeMotion });
export default tectonics;
export { computeMotion };
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/geology/modules/tectonics/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeMotion from "./ops/compute-motion/index.js";

const tectonics = createDomainSubdomainRouter(contract, { computeMotion });
export default tectonics;
```
