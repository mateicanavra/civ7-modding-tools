---
level: error
---
# Control oRPC Contract Ownership

Control-oRPC contracts stay transport-pure and keep module-local schemas private.

```grit
language js(typescript)

or {
  `import $imports from "@civ7/direct-control"` where {
    $filename <: r".*packages/civ7-control-orpc/src/modules/.*/contract\.ts$"
  },
  `export const $schema = $_` where {
    $filename <: r".*packages/civ7-control-orpc/src/modules/.*/contract\.ts$",
    $schema_name = text($schema),
    $schema_name <: r"^Civ7[A-Za-z0-9]+(?:Input|Result|Output)Schema$|^Civ7[A-Za-z0-9]+StandardSchema$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*packages/civ7-control-orpc/src/index\.ts$",
    $source <: r"^\./modules/[^/]+/contract$",
    $exports <: contains `Civ7$moduleSchema`
  }
}
```

## Matches fixture

```typescript
// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { session } from "@civ7/direct-control";

export const contract = session;
```

```typescript
// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { session } from "@civ7/direct-control";

export const contract = session;
```

## Ignores fixture

```typescript
// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { schema } from "./schema.js";

export const contract = schema;
```
