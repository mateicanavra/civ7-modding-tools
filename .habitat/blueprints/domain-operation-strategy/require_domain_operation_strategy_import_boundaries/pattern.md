---
level: error
---
# Require Domain Operation Strategy Import Boundaries

The strategy root aggregates implementations only. Each leaf config owns one
semantic id and authored config schema, with no executable behavior and no
dependency on its operation contract. Each leaf implementation binds that
strategy definition to the local operation contract, owns optional
configuration normalization and deterministic execution, and may
compose private algorithm vocabulary and rules owned by the same operation.
Semantic policy comes from the nearest module or domain model owner. Both leaf
roles may consume dependencies from ancestor model owners,
regardless of how deeply an operation is nested; the domain-model structure law
owns the allowed children beneath `model/`. Cross-domain dependencies must
name the exact public model owner; whole domain contract roots, private sibling
operations, and cross-domain interiors remain forbidden. Both
roles may consume shared map policy. Among MapGen Core surfaces, configs use
only authoring contracts; implementations may also use the public Core root,
authoring, and library computation surfaces. The package export map and
TypeScript own exact entrypoint validity inside those classes. Every admitted
strategy file exposes one default authority and no named or re-exported
surface. Parent operation
type-boundary authority owns the separate prohibition on deriving working types
from operation input/output envelopes.

```grit
language js(typescript)

predicate disallowed_strategy_implementation_aggregate_dependency($source) {
  ! $source <: r"^[\"']?\./[a-z0-9]+(?:-[a-z0-9]+)*/index\.js[\"']?$"
}

predicate disallowed_strategy_config_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core/authoring/contracts|@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/model/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*)\.js|(?:\.\./){4,}model/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*)\.js)[\"']?$"
}

predicate disallowed_strategy_implementation_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/(?:model|modules/[a-z0-9]+(?:-[a-z0-9]+)*/model)/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*)\.js|@swooper/mapgen-core(?:/authoring(?:/contracts)?|/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|\./config\.js|\.\./\.\./contract\.js|\.\./\.\./rules/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){4,}(?:(?:[a-z0-9]+(?:-[a-z0-9]+)*/)?(?:model|modules/[a-z0-9]+(?:-[a-z0-9]+)*/model))/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*)\.js)[\"']?$"
}

or {
  program(statements=$body) where {
    ! $body <: contains `export default $value`
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
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
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/config\.ts$",
    disallowed_strategy_config_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    disallowed_strategy_implementation_dependency($source)
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*/strategies/[a-z0-9]+(?:-[a-z0-9]+)*/index\.ts$",
    $source <: r"^[\"']?(?:\./config|\.\./\.\./contract)\.js[\"']?$",
    ! $import <: `import $binding from $source`
  },
  `import($source)`
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { recipe } from "../../../../../../recipes/standard/recipe.js";
import OperationContract from "../../contract.js";
import strategyDefinition from "./config.js";

export default createStrategy(OperationContract, strategyDefinition, { run: () => recipe });

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { adapter } from "@civ7/adapter";

export default adapter;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { executePlan } from "@swooper/mapgen-core/compiler/normalize";

export default executePlan;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import otherContract from "../../../classify-surface/contract.js";

export default otherContract;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { privateRule } from "../../../classify-surface/rules/private-rule.js";

export default privateRule;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { privateHelper } from "../../../../private/helper.js";

export default privateHelper;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { otherStrategy } from "../other-strategy/index.js";

export default otherStrategy;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/config.ts
import OperationContract from "../../contract.js";

export default OperationContract;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
import { plateDriven } from "./plate-driven/index.js";

export default [plateDriven] as const;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/config.ts
export const StrategySchema = Type.Object({});

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
const strategy = createStrategy(OperationContract, strategyDefinition, { run: (input) => input });
export const plateDriven = strategy;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
export { localRule } from "../../rules/local-rule.js";

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
export async function loadRecipe() {
  return import("../../../../../../recipes/standard/recipe.js");
}

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
type ReliefArtifact = Static<
  typeof import("../../../../artifacts/index.js").artifacts.relief.schema
>;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { ShapeReliefInput } from "../../contract.js";

const leakedEnvelope: ShapeReliefInput = {};
export default leakedEnvelope;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
export { recipeStrategy } from "../../../../../../recipes/standard/strategy.js";
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { GLOBAL_RELIEF_CAP } from "@civ7/map-policy";
import { RIVER_CLASS } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { LAKE_POLICY } from "@mapgen/domain/hydrology/modules/hydrography/model/policy/lakes.js";
import OperationContract from "../../contract.js";
import strategyDefinition from "./config.js";
import { computeRelief } from "../../rules/compute-relief.js";
import { normalizeRelief } from "../../rules/index.js";
import { TileClassSchema } from "../../../../model/atoms/tile-class.schema.js";
import { MOUNTAIN_POLICY } from "../../../../model/policy/mountain-policy.js";
import { WORLD_POLICY } from "../../../../../../model/policy/world-policy.js";
import { RIVER_CLASS as RELATIVE_RIVER_CLASS } from "../../../../../../../hydrology/modules/hydrography/model/policy/river-class.js";

export default createStrategy(OperationContract, strategyDefinition, {
  normalize: (config) => ({ ...config, strength: normalizeRelief(config.strength) }),
  run: (input, config) =>
    computeRelief(
      input,
      config.strength +
        GLOBAL_RELIEF_CAP +
        MOUNTAIN_POLICY +
        WORLD_POLICY +
        RIVER_CLASS +
        RELATIVE_RIVER_CLASS +
        LAKE_POLICY,
      TileClassSchema,
      clamp01,
      forEachHexNeighborOddQ
    ),
});

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/config.ts
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

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
import plateDriven from "./plate-driven/index.js";

export default [plateDriven] as const;

```
