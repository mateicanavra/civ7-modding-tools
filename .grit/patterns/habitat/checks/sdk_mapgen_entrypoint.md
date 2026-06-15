---
level: error
---
# SDK MapGen Entrypoint

General SDK APIs stay runtime-neutral; mapgen bindings are explicit opt-in.

```grit
language js(typescript)

or {
  `import $imports from "./mapgen"` where {
    $filename <: r".*packages/sdk/src/index\.ts$"
  },
  `import $imports from "./mapgen/index.js"` where {
    $filename <: r".*packages/sdk/src/index\.ts$"
  },
  `export * from "./mapgen"` as $export where {
    $filename <: r".*packages/sdk/src/index\.ts$",
    ! $export <: includes "export type"
  },
  `export * from "./mapgen/index.js"` as $export where {
    $filename <: r".*packages/sdk/src/index\.ts$",
    ! $export <: includes "export type"
  },
  `import $imports from "@civ7/adapter/civ7"` where {
    $filename <: r".*packages/sdk/src/.*\.ts$",
    ! $filename <: includes "packages/sdk/src/mapgen/"
  },
  `import $imports from "@civ7/adapter/civ7"` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/sdk/src/index.ts
export * from "./mapgen";
```

```typescript
// @filename: packages/sdk/src/index.ts
export * from "./mapgen";
```

## Ignores fixture

```typescript
// @filename: packages/sdk/src/index.ts
export { createSdk } from "./authoring/index.js";

// @filename: packages/sdk/src/mapgen/create.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;
```
