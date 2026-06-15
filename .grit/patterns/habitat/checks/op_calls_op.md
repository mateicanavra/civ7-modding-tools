---
level: error
---
# Op Calls Op

Domain op runtime entrypoints must not compose sibling ops or import the domain
ops barrel.

```grit
language js(typescript)

`import $imports from $source` where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/index\.ts$",
  $source <: r".*(?:\.\./[^/]+/index\.js|@mapgen/domain/[^/]+/ops(?:/index\.js)?)[\"']"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import computeMesh from "../compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import type { ComputeMeshTypes } from "../compute-mesh/index.js";

export type Value = ComputeMeshTypes;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import * as foundationOps from "@mapgen/domain/foundation/ops";

export const value = foundationOps;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import { computeMesh } from "@mapgen/domain/foundation/ops/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/plan-rivers/index.ts
import rivers from '@mapgen/domain/hydrology/ops';

export const value = rivers;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import "../compute-mesh/index.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import ComputeCrustContract from "./contract.js";

export const value = ComputeCrustContract;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import { defaultStrategy } from "./strategies/index.js";

export const value = defaultStrategy;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import { helper } from "./rules/index.js";

export const value = helper;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import helper from "../../lib/tectonics/shared.js";

export const value = helper;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import privateOp from "@mapgen/domain/foundation/ops/private";

export const value = privateOp;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import privateOp from "@mapgen/domain/foundation/ops-by-id";

export const value = privateOp;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
import computeMesh from "./compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/rules/index.ts
import computeMesh from "../compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.tsx
import computeMesh from "../compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/other-mod/src/domain/foundation/ops/compute-crust/index.ts
import computeMesh from "../compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/demo.ts
import foundationOps from "@mapgen/domain/foundation/ops";

export const value = foundationOps;

// @filename: mods/mod-swooper-maps/test/foundation/op-calls-op.test.ts
import computeMesh from "../src/domain/foundation/ops/compute-mesh/index.js";

export const value = computeMesh;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export { computeMesh } from "../compute-mesh/index.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
await import("../compute-mesh/index.js");

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
const source = "../compute-mesh/index.js";
```
