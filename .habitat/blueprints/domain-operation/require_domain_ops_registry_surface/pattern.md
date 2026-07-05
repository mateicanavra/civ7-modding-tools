---
level: error
---
# Require Domain Ops Registry Surface

Domain `ops/index.ts` files own only the operation implementation registry.
They import operation entrypoints, assemble the `implementations` object, and
export it as default. Operation symbols are consumed through the domain ops
object, not as named registry exports.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    ! $body <: contains `import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    ! $body <: contains `import type { contracts } from "./contracts.js"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    ! $body <: contains `const implementations = { $... } as const satisfies DomainOpImplementationsForContracts<typeof contracts>`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    ! $body <: contains `export default implementations`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $body <: some bubble {
      $statement where {
        ! $statement <: or {
          `import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring"`,
          `import type { contracts } from "./contracts.js"`,
          `import $name from $source` where {
            $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$"
          },
          `const implementations = { $... } as const satisfies DomainOpImplementationsForContracts<typeof contracts>`,
          `export default implementations`
        }
      }
    }
  },
  `const implementations = { $entries } as const satisfies DomainOpImplementationsForContracts<typeof contracts>` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $entries <: some bubble {
      pair(key=$key, value=$value)
    }
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    ! $import <: contains import_clause()
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    $import <: contains named_imports()
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    $import <: contains namespace_import()
  },
  `import type { $imports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$"
  },
  spread_element() where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  method_definition() where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export { $exports }` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$",
    $source <: r".+"
  },
  `export const $name = $value` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export function $name($params) { $body }` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export type $name = $value` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  },
  `export interface $name { $body }` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/index\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeBaseTopography from "./compute-base-topography/index.js";
import { helperLogic } from "./compute-base-topography/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  computeBaseTopography: helperLogic(),
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export { DEFAULT_ELEVATION_SCALE } from "./compute-base-topography/rules/index.js";

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/index.ts
export const helper = 1;

// @filename: mods/mod-swooper-maps/src/domain/placement/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planNaturalWonders from "./plan-natural-wonders/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  planNaturalWonders,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export { planNaturalWonders };

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMesh, { helper } from "./compute-mesh/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  computeMesh,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import * as computeMesh from "./compute-mesh/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  computeMesh,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { Helper } from "./compute-mesh/index.js";
import type { contracts } from "./contracts.js";

const implementations = {} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import "./compute-thermal-state/index.js";
import type { contracts } from "./contracts.js";

const implementations = {} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMesh from "./compute-mesh/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  computeMesh: computeMesh(),
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planAquaticResources from "./plan-aquatic-resources/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  planAquaticResources,
  ...helperImplementations,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planAquaticResources from "./plan-aquatic-resources/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  planAquaticResources() {
    return planAquaticResources();
  },
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/resources/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import adjustResourceSupport from "./adjust-resource-support/index.js";
import type { contracts } from "./contracts.js";

const implementations = {
  adjustResourceSupport,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/adjust-resource-support/index.ts
export const adjustResourceSupport = {};
```
