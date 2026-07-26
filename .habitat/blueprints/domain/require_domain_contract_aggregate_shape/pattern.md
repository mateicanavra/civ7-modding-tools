---
level: error
---
# Require Domain Contract Aggregate Shape

A domain `contract.ts` composes direct semantic-module contracts into one
canonical `defineDomain` authority. Constituent module contracts remain private
inputs and are never re-exported as alternate public contract authorities.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import { defineDomain } from "@swooper/mapgen-core/authoring/contracts"`
  },
  program(statements=$body) where {
    ! $body <: contains `const $contract = defineDomain($args)`
  },
  program(statements=$body) where {
    $body <: contains `const $contract = defineDomain($args)`,
    ! $body <: contains `export default $contract`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineDomain } from "@swooper/mapgen-core/authoring/contracts"`,
        `import $module from $source` where {
          $source <: r"^[\"']\./modules/[a-z0-9]+(?:-[a-z0-9]+)*/contract\.js[\"']$"
        },
        `const $contract = defineDomain($args)`,
        `export default $contract`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/contract.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import tectonics from "./modules/tectonics/contract.js";

const geology = defineDomain("geology", { tectonics });
export default geology;
export { tectonics };

// @filename: mods/example-mod/src/domain/climate/contract.ts
import thermal from "./modules/thermal/contract.js";

export default thermal;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/contract.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import tectonics from "./modules/tectonics/contract.js";

const geology = defineDomain("geology", { tectonics });
export default geology;
```
