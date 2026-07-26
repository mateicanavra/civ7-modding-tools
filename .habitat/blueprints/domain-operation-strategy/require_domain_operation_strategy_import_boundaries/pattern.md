---
level: error
---
# Require Domain Operation Strategy Import Boundaries

Strategy implementations compose one local operation contract, type-only local
algorithm vocabulary, and local rules with atoms or policy owned by their
semantic module or domain model. The default contract value binds
`createStrategy`; strategies do not project shared types from its input or
output envelope. Legacy root operations can reach only their root model;
direct-module operations may also reach that module's model. Their other
dependencies are limited to shared map policy and the public MapGen Core root,
authoring, and library owner classes. The package export map and TypeScript own
the exact entrypoints inside those classes. Strategy barrels may point only to
named sibling strategy modules.

```grit
language js(typescript)

predicate disallowed_root_strategy_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/authoring|/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|\.\./contract\.js|\.\./types\.js|\.\./rules/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){3}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js)[\"']?$"
}

predicate disallowed_module_strategy_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/authoring|/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|\.\./contract\.js|\.\./types\.js|\.\./rules/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){3}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){5}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){4}[a-z0-9]+(?:-[a-z0-9]+)*/model/atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)[\"']?$"
}

predicate disallowed_strategy_barrel_dependency($source) {
  ! $source <: r"^[\"']?\./[a-z0-9]+(?:-[a-z0-9]+)*\.js[\"']?$"
}

predicate is_contract_envelope_name($value) {
  $value <: r"(?:Contract|contract)$"
}

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/ops/[^/]+/strategies/[^/]+\.ts$",
    ! $filename <: r".*/strategies/index\.ts$",
    disallowed_root_strategy_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/strategies/[^/]+\.ts$",
    ! $filename <: r".*/strategies/index\.ts$",
    disallowed_module_strategy_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*/strategies/index\.ts$",
    disallowed_strategy_barrel_dependency($source)
  },
  `export { $exports } from $source` where {
    ! $filename <: r".*/strategies/index\.ts$"
  },
  `export type { $exports } from $source` where {
    ! $filename <: r".*/strategies/index\.ts$"
  },
  `export * from $source` where {
    ! $filename <: r".*/strategies/index\.ts$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*/strategies/index\.ts$",
    disallowed_strategy_barrel_dependency($source)
  },
  `export type { $exports } from $source` where {
    $filename <: r".*/strategies/index\.ts$",
    disallowed_strategy_barrel_dependency($source)
  },
  `export * from $source` where {
    $filename <: r".*/strategies/index\.ts$",
    disallowed_strategy_barrel_dependency($source)
  },
  import_statement(source=$source) as $import where {
    ! $filename <: r".*/strategies/index\.ts$",
    $source <: r"^[\"']?\.\./types\.js[\"']?$",
    ! $import <: contains import_clause()
  },
  import_statement(source=$source) as $import where {
    ! $filename <: r".*/strategies/index\.ts$",
    $source <: r"^[\"']?\.\./types\.js[\"']?$",
    $import <: r"^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s*(?:,|from\b)"
  },
  import_statement(source=$source) as $import where {
    ! $filename <: r".*/strategies/index\.ts$",
    $source <: r"^[\"']?\.\./types\.js[\"']?$",
    ! $import <: includes "import type",
    $import <: contains namespace_import()
  },
  import_statement(source=$source) as $import where {
    ! $filename <: r".*/strategies/index\.ts$",
    $source <: r"^[\"']?\.\./types\.js[\"']?$",
    ! $import <: includes "import type",
    $import <: contains import_specifier() as $specifier where {
      ! $specifier <: includes "type "
    }
  },
  import_statement(source=$source) as $import where {
    ! $filename <: r".*/strategies/index\.ts$",
    $source <: r"^[\"']?\.\./contract\.js[\"']?$",
    ! $import <: `import $contract from $source`
  },
  `OpTypeBagOf<$value>`,
  `AdmittedOperationInput<$value>`,
  `AdmittedOperationOutput<$value>`,
  `$contract["input"]` where {
    is_contract_envelope_name($contract)
  },
  `$contract["output"]` where {
    is_contract_envelope_name($contract)
  },
  `$contract.input` where {
    is_contract_envelope_name($contract)
  },
  `$contract.output` where {
    is_contract_envelope_name($contract)
  },
  `import($source)`
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { recipe } from "../../../../../../recipes/standard/recipe.js";

export const plateDrivenStrategy = createStrategy({ run: () => recipe });

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { adapter } from "@civ7/adapter";

export const leakedAdapter = adapter;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { executePlan } from "@swooper/mapgen-core/compiler/normalize";

export const leakedCompiler = executePlan;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import otherContract from "../../classify-surface/contract.js";

export const siblingContract = otherContract;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { privateRule } from "../../classify-surface/rules/private-rule.js";

export const siblingPrivateRule = privateRule;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { privateHelper } from "../../../private/helper.js";

export const unrelatedImplementation = privateHelper;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { otherStrategy } from "./other-strategy.js";

export const hiddenStrategyComposition = otherStrategy;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
export { localRule } from "../rules/local-rule.js";

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
export async function loadRecipe() {
  return import("../../../../../../recipes/standard/recipe.js");
}

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
type ReliefArtifact = Static<
  typeof import("../../../artifacts/index.js").artifacts.relief.schema
>;

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { ShapeReliefInput } from "../contract.js";

export const leakedEnvelope: ShapeReliefInput = {};

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import ShapeReliefContract from "../contract.js";

export type ShapeReliefOutput = ShapeReliefContract["output"];

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
export { recipeStrategy } from "../../../../../../recipes/standard/strategy.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven.ts
import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { GLOBAL_RELIEF_CAP } from "@civ7/map-policy";
import Contract from "../contract.js";
import type { ReliefSeed } from "../types.js";
import { computeRelief } from "../rules/compute-relief.js";
import { normalizeRelief } from "../rules/index.js";
import { TileClassSchema } from "../../../model/atoms/tile-class.schema.js";
import { MOUNTAIN_POLICY } from "../../../model/policy/mountain-policy.js";
import type { MeshField } from "../../../../mesh/model/atoms/mesh-field.schema.js";
import { WORLD_POLICY } from "../../../../../model/policy/world-policy.js";

export const plateDrivenStrategy = createStrategy(Contract, "plate-driven", {
  run: ({ input }) =>
    computeRelief(
      input as ReliefSeed,
      normalizeRelief(GLOBAL_RELIEF_CAP + MOUNTAIN_POLICY + WORLD_POLICY),
      TileClassSchema,
      clamp01,
      forEachHexNeighborOddQ
    ),
});

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/index.ts
export { plateDrivenStrategy } from "./plate-driven.js";
export type { PlateDrivenOptions } from "./plate-driven.js";
```
