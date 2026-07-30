---
level: error
---
# Block Engine Runtime Imports From Domain Ops

Domain ops do not import engine runtime entrypoints as values.

```grit
language js(typescript)

import_statement(source=$source) as $import where {
  $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",
  $source <: r".*(?:@swooper/mapgen-core/engine|@mapgen/engine)[\"']?$",
  ! $import <: includes "import type",
  ! $import <: includes "import { type",
  ! $import <: includes "import {type"
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const runtime = EngineRuntime;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/climate/ops/estimate-rainfall/strategies/bulk-flux/index.ts
import EngineRuntime from "@mapgen/engine";

export const defaultRuntime = EngineRuntime;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/terrain/ops/shape-relief/index.ts
import * as engine from "@swooper/mapgen-core/engine";

export const namespaceRuntime = engine;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/materials/ops/distribute-deposits/index.ts
import "@mapgen/engine";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/settlement/ops/rank-sites/index.ts
import { EngineRuntime, type EngineShape } from "@swooper/mapgen-core/engine";

export const mixedRuntime = EngineRuntime;
export type MixedShape = EngineShape;
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import type { EngineShape } from "@swooper/mapgen-core/engine";

export type Shape = EngineShape;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { type EngineShape } from "@mapgen/engine";

export type InlineShape = EngineShape;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine-extra";

export const lookalike = EngineRuntime;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/model/policy/habitat.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const nonOpRuntime = EngineRuntime;

// @filename: plugins/mod/map/other-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const otherModRuntime = EngineRuntime;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.tsx
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const tsxRuntime = EngineRuntime;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export { EngineRuntime } from "@swooper/mapgen-core/engine";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const source = "@swooper/mapgen-core/engine";

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
await import("@swooper/mapgen-core/engine");
```
