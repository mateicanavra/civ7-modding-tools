---
level: error
---
# Block Setup And Context Authority From Domain Ops

Domain ops accept explicit projected values, not adapter, MapSetup, or MapContext authority.

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
  `MapContext` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `ExtendedMapContext` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `MapSetup` where {
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
const ctx: MapContext = input.context;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const legacyCtx: ExtendedMapContext = input.context;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const setup: MapSetup = input.setup;

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
const input = { width: 80, height: 50 };

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context["adapter"].run();

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("@civ7/adapter/civ7");
```
