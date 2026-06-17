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
  `export { $exports } from "./mapgen"` as $export where {
    $filename <: r".*packages/sdk/src/index\.ts$",
    ! $export <: includes "export type",
    ! $export <: includes "export { type",
    ! $export <: includes "export {type"
  },
  `export { $exports } from "./mapgen/index.js"` as $export where {
    $filename <: r".*packages/sdk/src/index\.ts$",
    ! $export <: includes "export type",
    ! $export <: includes "export { type",
    ! $export <: includes "export {type"
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

// @filename: packages/sdk/src/index.ts
export * from "./mapgen/index.js";

// @filename: packages/sdk/src/index.ts
import mapgen from "./mapgen";

// @filename: packages/sdk/src/index.ts
import { createMap } from "./mapgen/index.js";

// @filename: packages/sdk/src/index.ts
export { createMap } from "./mapgen";

// @filename: packages/sdk/src/index.ts
export { createMap as createRuntimeMap } from "./mapgen/index.js";

// @filename: packages/sdk/src/index.ts
export { createMap, type MapDefinition } from "./mapgen";

// @filename: packages/sdk/src/index.ts
export { createMap, type MapDefinition } from "./mapgen/index.js";

// @filename: packages/sdk/src/builders/runtime.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;

// @filename: packages/mapgen-core/src/authoring/maps.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;
```

## Ignores fixture

```typescript
// @filename: packages/sdk/src/index.ts
export * from "./builders";

// @filename: packages/sdk/src/index.ts
export type { MapDefinition } from "./mapgen";

// @filename: packages/sdk/src/index.ts
export type { MapDefinition } from "./mapgen/index.js";

// @filename: packages/sdk/src/index.ts
export { type MapDefinition } from "./mapgen";

// @filename: packages/sdk/src/index.ts
export { type MapDefinition } from "./mapgen/index.js";

// @filename: packages/sdk/src/index.ts
export { createSdk } from "./authoring/index.js";

// @filename: packages/sdk/src/mapgen/create.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;

// @filename: packages/sdk/src/mapgen/index.ts
export { createMap } from "./createMap.js";

// @filename: packages/sdk/src/builders/source-prefix.ts
import { createMap } from "@mateicanavra/civ7-sdk/mapgen";

export const create = createMap;

// @filename: packages/sdk/src/builders/string.ts
const source = "./mapgen";

// @filename: packages/sdk/src/builders/dynamic.ts
const source = await import("@civ7/adapter/civ7");

// @filename: packages/sdk/test/root.test.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;

// @filename: packages/sdk/src/builders/runtime.tsx
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapter = createCiv7Adapter;
```
