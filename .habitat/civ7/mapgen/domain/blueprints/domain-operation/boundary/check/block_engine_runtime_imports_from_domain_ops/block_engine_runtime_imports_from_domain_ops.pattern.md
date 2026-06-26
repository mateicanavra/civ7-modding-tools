---
level: error
---
# Block Engine Runtime Imports From Domain Ops

Domain ops do not import engine runtime entrypoints as values.

```grit
language js(typescript)

import_statement(source=$source) as $import where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
  $source <: r".*(?:@swooper/mapgen-core/engine|@mapgen/engine)[\"']?$",
  ! $import <: includes "import type",
  ! $import <: includes "import { type",
  ! $import <: includes "import {type"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const runtime = EngineRuntime;

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/strategies/default.ts
import EngineRuntime from "@mapgen/engine";

export const defaultRuntime = EngineRuntime;

// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/index.ts
import * as engine from "@swooper/mapgen-core/engine";

export const namespaceRuntime = engine;

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/demo/index.ts
import "@mapgen/engine";

// @filename: mods/mod-swooper-maps/src/domain/placement/ops/demo/index.ts
import { EngineRuntime, type EngineShape } from "@swooper/mapgen-core/engine";

export const mixedRuntime = EngineRuntime;
export type MixedShape = EngineShape;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import type { EngineShape } from "@swooper/mapgen-core/engine";

export type Shape = EngineShape;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { type EngineShape } from "@mapgen/engine";

export type InlineShape = EngineShape;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine-extra";

export const lookalike = EngineRuntime;

// @filename: mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const nonOpRuntime = EngineRuntime;

// @filename: mods/other-mod/src/domain/ecology/ops/demo/index.ts
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const otherModRuntime = EngineRuntime;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.tsx
import { EngineRuntime } from "@swooper/mapgen-core/engine";

export const tsxRuntime = EngineRuntime;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export { EngineRuntime } from "@swooper/mapgen-core/engine";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const source = "@swooper/mapgen-core/engine";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("@swooper/mapgen-core/engine");
```
