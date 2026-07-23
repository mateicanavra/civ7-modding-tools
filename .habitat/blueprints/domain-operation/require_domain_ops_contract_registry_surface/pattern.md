---
level: error
---
# Require Domain Ops Contract Registry Surface

An `ops/contract.ts` file privately assembles operation contracts into one
canonical default registry. Individual operation contracts remain private
inputs and are never re-exported as parallel authorities.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `const contracts = { $... } as const`
  },
  program(statements=$body) where {
    ! $body <: contains `export default contracts`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import $contract from $source` where {
          $source <: r"^[\"']\./[a-z0-9]+(?:-[a-z0-9]+)*/contract\.js[\"']$"
        },
        `const contracts = { $... } as const`,
        `export default contracts`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/contract.ts
import ComputeMotionContract from "./compute-motion/contract.js";

const contracts = { computeMotion: ComputeMotionContract } as const;
export default contracts;
export { ComputeMotionContract };

// @filename: mods/example-mod/src/domain/climate/ops/contract.ts
export const contracts = {} as const;
export default contracts;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/contract.ts
import ComputeMotionContract from "./compute-motion/contract.js";

const contracts = { computeMotion: ComputeMotionContract } as const;
export default contracts;
```
