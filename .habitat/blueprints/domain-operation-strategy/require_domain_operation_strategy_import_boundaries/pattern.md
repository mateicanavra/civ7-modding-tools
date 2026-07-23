---
level: error
---
# Require Domain Operation Strategy Import Boundaries

Strategy aggregates compose the default authorities of their semantic leaves.
Each leaf contract owns one semantic id and config schema, with no executable
behavior and no dependency on its operation contract. Each leaf implementation
binds that default strategy contract to the default local operation contract,
owns optional configuration normalization and deterministic execution, and may
compose type-only private algorithm vocabulary and local rules. Both leaf roles
may consume atoms or policy owned by their semantic module or domain model.
Only ancestor model owners are reachable, regardless of how deeply an operation
is nested. Both roles may consume shared map policy. Contracts use only MapGen
Core's authoring-contract surface; implementations may also use the public Core
root, authoring, and library computation surfaces. The package export map and
TypeScript own exact entrypoint validity inside those classes. Every admitted
strategy file exposes
one default authority and no named or re-exported surface. Parent operation
type-boundary authority owns the separate prohibition on deriving working types
from operation input/output envelopes.

```grit
language js(typescript)

predicate disallowed_strategy_contract_aggregate_dependency($source) {
  ! $source <: r"^[\"']?\./[a-z0-9]+(?:-[a-z0-9]+)*/contract\.js[\"']?$"
}

predicate disallowed_strategy_implementation_aggregate_dependency($source) {
  ! $source <: r"^[\"']?\./[a-z0-9]+(?:-[a-z0-9]+)*/index\.js[\"']?$"
}

predicate disallowed_strategy_contract_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core/authoring/contracts|(?:\.\./){4,}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js)[\"']?$"
}

predicate disallowed_strategy_implementation_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/authoring(?:/contracts)?|/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|\./contract\.js|\.\./\.\./contract\.js|\.\./\.\./types\.js|\.\./\.\./rules/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){4,}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js)[\"']?$"
}

or {
  program(statements=$body) where {
    ! $body <: contains `export default $value`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  import_statement(source=$source) where {
    $filename <: r".*/strategies/contract\.ts$",
    disallowed_strategy_contract_aggregate_dependency($source)
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/contract\.ts$",
    ! $import <: `import $binding from $source`
  },
  import_statement(source=$source) where {
    $filename <: r".*/strategies/index\.ts$",
    disallowed_strategy_implementation_aggregate_dependency($source)
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/index\.ts$",
    ! $import <: `import $binding from $source`
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/[^/]+/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/contract\.ts$",
    disallowed_strategy_contract_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/[^/]+/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    disallowed_strategy_implementation_dependency($source)
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?(?:\./contract|\.\./\.\./contract)\.js[\"']?$",
    ! $import <: `import $binding from $source`
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?\.\./\.\./types\.js[\"']?$",
    ! $import <: contains import_clause()
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?\.\./\.\./types\.js[\"']?$",
    $import <: r"^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s*(?:,|from\b)"
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?\.\./\.\./types\.js[\"']?$",
    ! $import <: includes "import type",
    $import <: contains namespace_import()
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?\.\./\.\./types\.js[\"']?$",
    ! $import <: includes "import type",
    $import <: contains import_specifier() as $specifier where {
      ! $specifier <: includes "type "
    }
  },
  `import($source)`
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { recipe } from "../../../../../../recipes/standard/recipe.js";
import Contract from "../../contract.js";
import strategyContract from "./contract.js";

export default createStrategy(Contract, strategyContract, { run: () => recipe });

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { adapter } from "@civ7/adapter";

export default adapter;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { executePlan } from "@swooper/mapgen-core/compiler/normalize";

export default executePlan;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import otherContract from "../../../classify-surface/contract.js";

export default otherContract;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { privateRule } from "../../../classify-surface/rules/private-rule.js";

export default privateRule;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { privateHelper } from "../../../../private/helper.js";

export default privateHelper;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { otherStrategy } from "../other-strategy/index.js";

export default otherStrategy;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/contract.ts
import OperationContract from "../../contract.js";

export default OperationContract;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
import { plateDriven } from "./plate-driven/index.js";

export default [plateDriven] as const;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/contract.ts
export const StrategySchema = Type.Object({});

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
const strategy = createStrategy(Contract, strategyContract, { run: (input) => input });
export const plateDriven = strategy;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
export { localRule } from "../../rules/local-rule.js";

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
export async function loadRecipe() {
  return import("../../../../../../recipes/standard/recipe.js");
}

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
type ReliefArtifact = Static<
  typeof import("../../../../artifacts/index.js").artifacts.relief.schema
>;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { ShapeReliefInput } from "../../contract.js";

const leakedEnvelope: ShapeReliefInput = {};
export default leakedEnvelope;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
export { recipeStrategy } from "../../../../../../recipes/standard/strategy.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { GLOBAL_RELIEF_CAP } from "@civ7/map-policy";
import Contract from "../../contract.js";
import strategyContract from "./contract.js";
import type { ReliefSeed } from "../../types.js";
import { computeRelief } from "../../rules/compute-relief.js";
import { normalizeRelief } from "../../rules/index.js";
import { TileClassSchema } from "../../../../model/atoms/tile-class.schema.js";
import { MOUNTAIN_POLICY } from "../../../../model/policy/mountain-policy.js";
import { WORLD_POLICY } from "../../../../../../model/policy/world-policy.js";

export default createStrategy(Contract, strategyContract, {
  normalize: (config) => ({ ...config, strength: normalizeRelief(config.strength) }),
  run: (input, config) =>
    computeRelief(
      input as ReliefSeed,
      config.strength + GLOBAL_RELIEF_CAP + MOUNTAIN_POLICY + WORLD_POLICY,
      TileClassSchema,
      clamp01,
      forEachHexNeighborOddQ
    ),
});

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/contract.ts
import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
import { TileClassSchema } from "../../../../model/atoms/tile-class.schema.js";
import { MOUNTAIN_POLICY } from "../../../../model/policy/mountain-policy.js";

export default defineStrategy({
  id: "plate-driven",
  config: Type.Object({
    tileClass: TileClassSchema,
    strength: Type.Number({ default: MOUNTAIN_POLICY.defaultStrength }),
  }),
});

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
import plateDriven from "./plate-driven/index.js";

export default [plateDriven] as const;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/contract.ts
import plateDrivenContract from "./plate-driven/contract.js";

export default [plateDrivenContract] as const;
```
