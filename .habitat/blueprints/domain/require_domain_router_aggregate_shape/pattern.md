---
level: error
---
# Require Domain Router Aggregate Shape

A domain `router.ts` binds its local contract to the executable routers of its
direct semantic modules. It exposes one default runtime authority and contains
no operation implementations, helpers, or alternate exports.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import { createDomainRouter } from "@swooper/mapgen-core/authoring"`
  },
  program(statements=$body) where {
    ! $body <: contains `import contract from "./contract.js"`
  },
  program(statements=$body) where {
    ! $body <: contains `import $module from $source` where {
      $source <: r"^[\"']\./modules/[a-z0-9]+(?:-[a-z0-9]+)*/router\.js[\"']$"
    }
  },
  program(statements=$body) where {
    ! $body <: contains `const $router = createDomainRouter(contract, { $... })`
  },
  program(statements=$body) where {
    $body <: contains `const $router = createDomainRouter(contract, { $... })`,
    ! $body <: contains `export default $router`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { createDomainRouter } from "@swooper/mapgen-core/authoring"`,
        `import contract from "./contract.js"`,
        `import $module from $source` where {
          $source <: r"^[\"']\./modules/[a-z0-9]+(?:-[a-z0-9]+)*/router\.js[\"']$"
        },
        `const $router = createDomainRouter(contract, { $... })`,
        `export default $router`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/router.ts
import { createDomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import tectonics from "./modules/tectonics/router.js";

const geology = createDomainRouter(contract, { tectonics });
export default geology;
export { tectonics };

// @filename: mods/example-mod/src/domain/weather/router.ts
import { createDomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import climate from "./climate/router.js";

const weather = createDomainRouter(contract, { climate });
export default weather;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/router.ts
import { createDomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import tectonics from "./modules/tectonics/router.js";

const geology = createDomainRouter(contract, { tectonics });
export default geology;
```
