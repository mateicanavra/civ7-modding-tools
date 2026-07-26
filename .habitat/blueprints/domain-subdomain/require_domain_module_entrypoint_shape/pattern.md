---
level: error
---
# Require Domain Module Entrypoint Shape

A semantic module `index.ts` is a declaration-only public barrel. It exposes
the module contract from `contract.ts` as its default export and may add only
explicit named exports from the module's artifact catalog or model atoms and
policy. Operations, rules, strategies, and the executable router remain behind
their owning boundaries.

```grit
language js(typescript)

predicate lacks_module_contract_entrypoint($body) {
  ! $body <: contains `export { default } from "./contract.js"`
}

or {
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/index\.ts$",
    lacks_module_contract_entrypoint($body)
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/index\.ts$",
    $body <: some $statement where {
      ! $statement <: or {
        `export { default } from "./contract.js"`,
        `export { $exports } from $source` where {
          $source <: r"^[\"']\./(?:artifacts/index|model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*))\.js[\"']$"
        },
        `export type { $exports } from $source` where {
          $source <: r"^[\"']\./model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js[\"']$"
        }
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/index.ts
export { default } from "./contract.js";
export { computePlateMotion } from "./ops/compute-plate-motion/index.js";

// @filename: mods/example-mod/src/domain/geology/modules/lithosphere/index.ts
export { default as router } from "./router.js";

// @filename: mods/example-mod/src/domain/geology/modules/projection/index.ts
export { default } from "./contract.js";
export * from "./artifacts/index.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/index.ts
export { default } from "./contract.js";
export { artifacts } from "./artifacts/index.js";
export { EVENT_TYPE, type TectonicEvent } from "./model/atoms/index.js";
export { resolvePlateActivity } from "./model/policy/plate-activity.js";
```
