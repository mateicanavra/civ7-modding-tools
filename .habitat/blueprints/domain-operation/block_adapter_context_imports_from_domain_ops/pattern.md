---
level: error
---
# Block Setup And Context Authority From Domain Ops

Domain ops accept explicit projected values, not adapter, MapSetup, or MapContext authority.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `import $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `export { $exports } from $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `export * from $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",
    $source <: r".*@civ7/adapter.*",
    ! $source <: r".*@civ7/adapter[a-zA-Z0-9_-].*"
  },
  `MapContext` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  },
  `ExtendedMapContext` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  },
  `MapSetup` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  },
  `$context.adapter` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import type { AdapterShape } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export { getRules } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export * from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const ctx: MapContext = input.context;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const legacyCtx: ExtendedMapContext = input.context;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const setup: MapSetup = input.setup;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
context.adapter.run();

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
ctx.adapter.run();
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
context.value.run();

// @filename: plugins/mod/map/swooper-physics/src/domain/world/model/policy/habitat.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/model/policy/habitat.ts
context.adapter.run();

// @filename: plugins/mod/map/other-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { getRules } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.tsx
import { getRules } from "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { notAdapter } from "@civ7/adapterish/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const source = "@civ7/adapter/civ7";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const input = { width: 80, height: 50 };

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
context["adapter"].run();

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
await import("@civ7/adapter/civ7");
```
