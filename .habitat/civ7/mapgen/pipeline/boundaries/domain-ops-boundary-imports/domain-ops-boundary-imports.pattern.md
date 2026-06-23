---
level: error
---
# Domain Ops Boundary Imports

Domain ops do not cross into adapter/context ownership.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `import $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `ExtendedMapContext` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `$context.adapter` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import type { AdapterShape } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export { getRules } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export * from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const ctx: ExtendedMapContext = input.context;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context.adapter.run();

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
ctx.adapter.run();
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context.value.run();

// @filename: mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts
context.adapter.run();

// @filename: mods/other-mod/src/domain/ecology/ops/demo/index.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.tsx
import { getRules } from "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { notAdapter } from "@civ7/adapterish/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const source = "@civ7/adapter/civ7";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context["adapter"].run();

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("@civ7/adapter/civ7");
```
