---
level: error
---
# Require Domain Operation Contract File Shape

Operation contract files own the complete operation input/output envelopes.
Those two root schemas are direct inline `Type.*(...)` expressions that may
compose smaller atoms and policy from the nearest module or domain model; they
never borrow a complete artifact schema or export detached `InputSchema` /
`OutputSchema` authorities. Strategy configuration belongs to each semantic
strategy leaf definition, imported directly from
`./strategies/<semantic-id>/config.js`, not to a detached `StrategySchema` in
the operation contract. Contract files expose only their singular default
`defineOp` authority and must not outsource their envelope to root `config.ts`
bags, sibling or cross-domain operation contracts, shared type buckets,
recipe/stage authoring surfaces, or runtime operation constructors.

This law enforces direct input/output ownership plus the singular
authority, dependency, export, and constructor boundary across the operation
corpus. The strategy topology rule separately requires direct semantic leaf
definitions; this rule admits exactly that parent-to-leaf dependency.

```grit
language js(typescript)

predicate is_inline_type_schema($value) {
  $value <: `Type.$constructor($args)`
}

predicate disallowed_operation_contract_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|@civ7/map-policy|type-fest|\./strategies/[a-z0-9]+(?:-[a-z0-9]+)*/config\.js|\.\./\.\./model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){4}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){3}[a-z0-9]+(?:-[a-z0-9]+)*/model/atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)[\"']?$"
}

or {
  program(statements=$body) where {
    ! $body <: contains `export default defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    ! $body <: contains `const $contract = defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`
  },
  program(statements=$body) where {
    $body <: contains `const $contract = defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    ! $body <: contains `export default $contract`
  },
  program(statements=$body) where {
    $body <: contains `export default defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    or {
      ! is_inline_type_schema($input),
      ! is_inline_type_schema($output)
    }
  },
  program(statements=$body) where {
    $body <: contains `const $contract = defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    or {
      ! is_inline_type_schema($input),
      ! is_inline_type_schema($output)
    }
  },
  export_statement() as $export where {
    ! $export <: `export default $value`
  },
  import_statement(source=$source) where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/contract\.ts$",
    disallowed_operation_contract_dependency($source)
  },
  `export { $exports } from $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/contract\.ts$",
    disallowed_operation_contract_dependency($source)
  },
  `export * from $source` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/contract\.ts$",
    disallowed_operation_contract_dependency($source)
  },
  `import($source)` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/contract\.ts$",
    disallowed_operation_contract_dependency($source)
  },
  `createOp($args)`,
  `createStage($args)`
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/foundation/modules/geology/ops/detached-envelope/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

const InputSchema = Type.Object({ sampleCount: Type.Integer({ minimum: 1 }) });
const OutputSchema = Type.Object({ acceptedCount: Type.Integer({ minimum: 0 }) });

export default defineOp({
  kind: "compute",
  id: "foundation/detached-envelope",
  input: InputSchema,
  output: OutputSchema,
  strategies: { measured: Type.Object({}) },
});

// @filename: plugins/mod/map/example-mod/src/domain/foundation/modules/geology/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { DemoConfigSchema } from "../demo-shared/config.js";

export default defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { measured: DemoConfigSchema },
});

// @filename: plugins/mod/map/example-mod/src/domain/terrain/modules/relief/ops/plan-ridges/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import type { SelectResourceSitesInput } from "../select-resource-sites/contract.js";

export default defineOp({
  kind: "compute",
  id: "morphology/plan-ridges",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { "orogenic-range-growth": MountainsConfigSchema },
});

// @filename: plugins/mod/map/example-mod/src/domain/foundation/modules/geology/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts } from "../../artifacts/index.js";

const Contract = defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({ evidence: artifacts.demo.schema }),
  output: Type.Object({}),
  strategies: { measured: Type.Object({}) },
});

export default Contract;

// @filename: plugins/mod/map/example-mod/src/domain/foundation/modules/geology/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

const Contract = defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { measured: Type.Object({}) },
});

export type DemoInput = Static<typeof Contract.input>;
export default Contract;

// @filename: plugins/mod/map/example-mod/src/domain/climate/modules/thermal/ops/demo/contract.ts
import { HydrologyConfigSchema } from "../../model/config.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "climate/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { "water-budget": HydrologyConfigSchema },
});

// @filename: plugins/mod/map/example-mod/src/domain/climate/modules/thermal/ops/demo/contract.ts
import type { PlotEffectKey } from "@mapgen/domain/biosphere/types.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "climate/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { "water-budget": HydrologyConfigSchema },
});

// @filename: plugins/mod/map/example-mod/src/domain/economy/modules/resources/ops/adjust-resource-support/contract.ts
import { TerrainContract } from "@mapgen/domain/terrain/modules/relief/ops/compute-surface/contract.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "economy/adjust-resource-support",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { "support-equity": Type.Object({}) },
});

// @filename: plugins/mod/map/example-mod/src/domain/biosphere/modules/vegetation/ops/demo/contract.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const InputSchema = Type.Object({});

// @filename: plugins/mod/map/example-mod/src/domain/biosphere/modules/vegetation/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import DemoDefinition from "./config.js";

const stray = { input: Type.Object({}), output: Type.Object({}), strategies: {} };
const sentinel = defineOp({
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: {},
});
const DemoContract = defineOp(DemoDefinition);
export default DemoContract;

// @filename: plugins/mod/map/example-mod/src/domain/biosphere/modules/vegetation/ops/demo/contract.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import DemoContract from "./contract.js";

export const demo = createOp(DemoContract, {});
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/foundation/modules/geology/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import type { NonEmptyTuple } from "type-fest";
import measuredDefinition from "./strategies/measured/config.js";

const DemoContract = defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({
    samples: Type.Unsafe<NonEmptyTuple<number>>(
      Type.Array(Type.Number(), { minItems: 1 })
    ),
  }, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: [measuredDefinition],
});

export default DemoContract;

// @filename: plugins/mod/map/example-mod/src/domain/geology/modules/tectonics/ops/measure-drift/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PlateEventSchema } from "../../model/atoms/plate-event.schema.js";
import { GridBoundsSchema } from "../../../mesh/model/atoms/grid-bounds.schema.js";
import measuredDefinition from "./strategies/measured/config.js";

export default defineOp({
  kind: "compute",
  id: "geology/measure-drift",
  input: Type.Object({
    events: Type.Array(PlateEventSchema),
    bounds: GridBoundsSchema,
  }),
  output: Type.Object({
    acceptedEvents: Type.Array(PlateEventSchema),
    rejectedCount: Type.Integer({ minimum: 0 }),
  }),
  strategies: [measuredDefinition],
});

```

The strategy topology rule owns the requirement that `measuredDefinition`
comes from `strategies/measured/config.ts`; this contract rule admits that
direct dependency while continuing to reject root config bags and unrelated
operation surfaces.
