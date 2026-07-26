---
level: error
---
# Require Domain Module Contract Aggregate Shape

A semantic module `contract.ts` binds its singular operation-contract registry
into one canonical `defineDomainSubdomain` authority. Constituent operation
contracts are never re-exported.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts"`
  },
  program(statements=$body) where {
    ! $body <: contains `import $ops from "./ops/contract.js"`
  },
  program(statements=$body) where {
    ! $body <: contains `const $contract = defineDomainSubdomain($args)`
  },
  program(statements=$body) where {
    $body <: contains `const $contract = defineDomainSubdomain($args)`,
    ! $body <: contains `export default $contract`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts"`,
        `import $ops from "./ops/contract.js"`,
        `const $contract = defineDomainSubdomain($args)`,
        `export default $contract`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

const tectonics = defineDomainSubdomain({ id: "tectonics", ops });
export default tectonics;
export { ops };
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

const tectonics = defineDomainSubdomain({ id: "tectonics", ops });
export default tectonics;
```
