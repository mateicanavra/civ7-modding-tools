---
level: error
---
# Require Domain Module Router Binding Shape

A semantic module `router.ts` binds its local contract to the implementation
registry owned by `ops/index.ts`. It exposes one default executable module and
contains no operation implementations, helpers, or alternate exports.

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
    ! $body <: contains `import implementations from "./ops/index.js"`
  },
  program(statements=$body) where {
    ! $body <: contains `const $router = createDomainSubdomainRouter(contract, implementations)`
  },
  program(statements=$body) where {
    $body <: contains `const $router = createDomainSubdomainRouter(contract, implementations)`,
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
        `import implementations from "./ops/index.js"`,
        `const $router = createDomainSubdomainRouter(contract, implementations)`,
        `export default $router`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

const tectonics = createDomainSubdomainRouter(contract, implementations);
export default tectonics;
export { implementations };

// @filename: mods/example-mod/src/domain/weather/modules/climate/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/implementations.js";

const climate = createDomainSubdomainRouter(contract, implementations);
export default climate;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

const tectonics = createDomainSubdomainRouter(contract, implementations);
export default tectonics;
```
