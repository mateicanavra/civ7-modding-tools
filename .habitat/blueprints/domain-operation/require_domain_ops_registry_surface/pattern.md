---
level: error
---
# Require Domain Ops Registry Surface

Domain `ops/index.ts` files own only the operation implementation registry.
They derive the type of the singular default `ops/contract.ts` authority,
import operation entrypoints, assemble the `implementations` object, and export
it as default. Operation symbols are consumed through the module ops object,
not as named registry exports.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    ! $body <: contains `import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring"`
  },
  program(statements=$body) where {
    ! $body <: contains `type Contracts = typeof import("./contract.js").default`
  },
  program(statements=$body) where {
    ! $body <: contains `const implementations = { $... } as const satisfies DomainOpImplementationsForContracts<Contracts>`
  },
  program(statements=$body) where {
    ! $body <: contains `export default implementations`
  },
  program(statements=$body) where {
    $body <: some bubble {
      $statement where {
        ! $statement <: or {
          `import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring"`,
          `type Contracts = typeof import("./contract.js").default`,
          `import $name from $source` where {
            $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$"
          },
          `const implementations = { $... } as const satisfies DomainOpImplementationsForContracts<Contracts>`,
          `export default implementations`
        }
      }
    }
  },
  `const implementations = { $entries } as const satisfies DomainOpImplementationsForContracts<Contracts>` where {
    $entries <: some bubble {
      pair(key=$key, value=$value)
    }
  },
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    ! $import <: contains import_clause()
  },
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    $import <: contains named_imports()
  },
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$",
    $import <: contains namespace_import()
  },
  `import type { $imports } from $source` where {
    $source <: r"^[\"']?\./[^/]+/index\.js[\"']?$"
  },
  spread_element(),
  method_definition(),
  `export { $exports }`,
  `export { $exports } from $source`,
  `export * from $source`,
  `export const $name = $value`,
  `export function $name($params) { $body }`,
  `export type $name = $value`,
  `export interface $name { $body }`
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/terrain/modules/relief/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeBaseTopography from "./compute-base-topography/index.js";
import { helperLogic } from "./compute-base-topography/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  computeBaseTopography: helperLogic(),
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

export { DEFAULT_ELEVATION_SCALE } from "./compute-base-topography/rules/index.js";

// @filename: mods/example-mod/src/domain/resources/modules/sites/ops/index.ts
export const helper = 1;

// @filename: mods/example-mod/src/domain/placement/modules/wonders/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planNaturalWonders from "./plan-natural-wonders/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  planNaturalWonders,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

export { planNaturalWonders };

// @filename: mods/example-mod/src/domain/geology/modules/mesh/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMesh, { helper } from "./compute-mesh/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  computeMesh,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/geology/modules/mesh/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import * as computeMesh from "./compute-mesh/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  computeMesh,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/geology/modules/mesh/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { Helper } from "./compute-mesh/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/climate/modules/thermal/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import "./compute-thermal-state/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/geology/modules/mesh/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMesh from "./compute-mesh/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  computeMesh: computeMesh(),
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/resources/modules/sites/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planAquaticResources from "./plan-aquatic-resources/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  planAquaticResources,
  ...helperImplementations,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;

// @filename: mods/example-mod/src/domain/resources/modules/sites/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import planAquaticResources from "./plan-aquatic-resources/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  planAquaticResources() {
    return planAquaticResources();
  },
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/resources/modules/sites/ops/index.ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import adjustResourceSupport from "./adjust-resource-support/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  adjustResourceSupport,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
```
