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
// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import computeMesh from "../compute-mesh/index.js";

export const value = computeMesh;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import type { ComputeMeshTypes } from "../compute-mesh/index.js";

export type Value = ComputeMeshTypes;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import * as foundationOps from "@mapgen/domain/foundation/modules/tectonics/ops";

export const value = foundationOps;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import { computeMesh } from "@mapgen/domain/foundation/modules/tectonics/ops/index.js";

export const value = computeMesh;

// @filename: plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/plan-rivers/index.ts
import rivers from '@mapgen/domain/hydrology/modules/hydrography/ops';

export const value = rivers;

// @filename: plugins/mod/map/swooper-physics/src/domain/hydrology/modules/ocean/ops/plan-currents/index.ts
import hydrology from "@mapgen/domain/hydrology/ocean/router.js";

export const value = hydrology;

// @filename: plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify/index.ts
import ecologyOps from "@mapgen/domain/ecology/modules/biomes/ops";

export const value = ecologyOps;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import "../compute-mesh/index.js";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import "../index.js";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
export { computeMesh } from "../compute-mesh/index.js";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
export * from "@mapgen/domain/foundation/modules/tectonics/ops";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
export async function loadSiblingOp() {
  return import("../compute-mesh/index.js");
}
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import ComputeCrustContract from "./contract.js";

export const value = ComputeCrustContract;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import { defaultStrategy } from "./strategies/index.js";

export const value = defaultStrategy;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import { helper } from "./rules/index.js";

export const value = helper;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import helper from "../../lib/tectonics/shared.js";

export const value = helper;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import privateOp from "@mapgen/domain/foundation/modules/tectonics/ops/private";

export const value = privateOp;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
import privateOp from "@mapgen/domain/foundation/modules/tectonics/ops-by-id";

export const value = privateOp;

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
export { defaultStrategy } from "./strategies/index.js";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
export * from "@mapgen/domain/foundation/modules/tectonics/ops-by-id";

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
await import("./strategies/index.js");

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
await import("@mapgen/domain/foundation/modules/tectonics/ops/private");

// @filename: plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/ops/compute-crust/index.ts
const source = "../compute-mesh/index.js";
```
