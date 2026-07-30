---
level: error
---
# Require Domain Module Contract Aggregate Shape

A semantic module `contract.ts` is the direct declarative aggregate for its
leaf operation contracts. It imports each operation contract from the
operation's canonical leaf, composes the exact `ops` record inline in one
`defineDomainSubdomain` call, and exposes only that module contract.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts"`
  },
  program(statements=$body) where {
    ! $body <: contains `import $operation from $source` where {
      $source <: r"^[\"']\./ops/[a-z0-9]+(?:-[a-z0-9]+)*/contract\.js[\"']$"
    }
  },
  program(statements=$body) where {
    ! $body <: contains `const $contract = defineDomainSubdomain({ id: $id, ops: { $ops } })`
  },
  program(statements=$body) where {
    $body <: contains `const $contract = defineDomainSubdomain({ id: $id, ops: { $ops } })`,
    ! $body <: contains `export default $contract`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts"`,
        `import $operation from $source` where {
          $source <: r"^[\"']\./ops/[a-z0-9]+(?:-[a-z0-9]+)*/contract\.js[\"']$"
        },
        `const $contract = defineDomainSubdomain({ id: $id, ops: { $ops } })`,
        `export default $contract`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/geology/modules/tectonics/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import computeMotion from "./ops/compute-motion/contract.js";

const tectonics = defineDomainSubdomain({
  id: "tectonics",
  ops: { computeMotion },
});

export default tectonics;
export { computeMotion };
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/geology/modules/tectonics/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import computeMotion from "./ops/compute-motion/contract.js";

const tectonics = defineDomainSubdomain({
  id: "tectonics",
  ops: { computeMotion },
});

export default tectonics;
```
