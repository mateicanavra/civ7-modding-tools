---
level: error
---
# Prohibit Cross-Op Runtime Calls

Domain op runtime entrypoints must not compose sibling ops or import the domain
ops barrel.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r"^[\"']?(?:\.\./(?:[^/]+/)?index\.js|@mapgen/domain/[^/]+/(?:[^/]+/)*(?:ops(?:/index\.js)?|router(?:\.js)?))[\"']?$"
  },
  `export { $exports } from $source` where {
    $source <: r"^[\"']?(?:\.\./(?:[^/]+/)?index\.js|@mapgen/domain/[^/]+/(?:[^/]+/)*(?:ops(?:/index\.js)?|router(?:\.js)?))[\"']?$"
  },
  `export * from $source` where {
    $source <: r"^[\"']?(?:\.\./(?:[^/]+/)?index\.js|@mapgen/domain/[^/]+/(?:[^/]+/)*(?:ops(?:/index\.js)?|router(?:\.js)?))[\"']?$"
  },
  `import($source)` where {
    $source <: r"^[\"']?(?:\.\./(?:[^/]+/)?index\.js|@mapgen/domain/[^/]+/(?:[^/]+/)*(?:ops(?:/index\.js)?|router(?:\.js)?))[\"']?$"
  }
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

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ocean/ops/plan-currents/index.ts
import hydrology from "@mapgen/domain/hydrology/ocean/router.js";

export const value = hydrology;

// @filename: mods/mod-swooper-maps/src/domain/ecology/biomes/ops/classify/index.ts
import ecologyOps from "@mapgen/domain/ecology/biomes/ops";

export const value = ecologyOps;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import "../compute-mesh/index.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
import "../index.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export { computeMesh } from "../compute-mesh/index.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export * from "@mapgen/domain/foundation/ops";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export async function loadSiblingOp() {
  return import("../compute-mesh/index.js");
}
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

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export { defaultStrategy } from "./strategies/index.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
export * from "@mapgen/domain/foundation/ops-by-id";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
await import("./strategies/index.js");

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
await import("@mapgen/domain/foundation/ops/private");

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
const source = "../compute-mesh/index.js";
```
