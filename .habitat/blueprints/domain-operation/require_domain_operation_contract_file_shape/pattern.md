---
level: error
---
# Require Domain Operation Contract File Shape

Operation contract files own the operation schema envelope. They may compose
reusable domain primitives, artifact schemas, and policy constants, but they
must not outsource their contract envelope to `config.ts` bags, sibling or
cross-domain operation contracts, shared type buckets, recipe/stage authoring
surfaces, or runtime operation constructors.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $body <: contains `export default defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    ! $body <: contains `const $contract = defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $body <: contains `const $contract = defineOp({ $..., input: $input, $..., output: $output, $..., strategies: $strategies, $... })`,
    ! $body <: contains `export default $contract`
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|@civ7/map-policy|(?:\.\./\.\./)?artifacts/.*\.artifact\.js|(?:\.\./\.\./)?model/(?:schemas|policy)(?:/.*)?\.js)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|@civ7/map-policy|(?:\.\./\.\./)?artifacts/.*\.artifact\.js|(?:\.\./\.\./)?model/(?:schemas|policy)(?:/.*)?\.js)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|@civ7/map-policy|(?:\.\./\.\./)?artifacts/.*\.artifact\.js|(?:\.\./\.\./)?model/(?:schemas|policy)(?:/.*)?\.js)[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|@civ7/map-policy|(?:\.\./\.\./)?artifacts/.*\.artifact\.js|(?:\.\./\.\./)?model/(?:schemas|policy)(?:/.*)?\.js)[\"']?$"
  },
  `createOp($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$"
  },
  `createStage($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { DemoConfigSchema } from "../demo-shared/config.js";

export default defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: DemoConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import type { SelectResourceSitesInput } from "../select-resource-sites/contract.js";

export default defineOp({
  kind: "compute",
  id: "morphology/plan-ridges",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: MountainsConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/contract.ts
import { HydrologyConfigSchema } from "../../model/config.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "hydrology/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: HydrologyConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/contract.ts
import type { PlotEffectKey } from "@mapgen/domain/ecology/types.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "hydrology/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: HydrologyConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/adjust-resource-support/contract.ts
import { FoundationContract } from "@mapgen/domain/foundation/ops/compute-plates-tensors/contract.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "resources/adjust-resource-support",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: Type.Object({}) },
});

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/contract.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const InputSchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/contract.ts
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

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/contract.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import DemoContract from "./contract.js";

export const demo = createOp(DemoContract, {});
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as DemoArtifactSchema } from "../../artifacts/demo.artifact.js";
import { DemoPrimitiveSchema } from "../../model/schemas/demo.schema.js";
import { DEMO_POLICY } from "../../model/policy/demo-policy.js";

const StrategySchema = Type.Object(
  {
    primitive: DemoPrimitiveSchema,
    policy: Type.Literal(DEMO_POLICY),
  },
  { additionalProperties: false }
);

export default defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({ demo: DemoArtifactSchema }, { additionalProperties: false }),
  output: Type.Object({ demo: DemoArtifactSchema }, { additionalProperties: false }),
  strategies: { default: StrategySchema },
});

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

const DemoContract = defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: { default: Type.Object({}, { additionalProperties: false }) },
});

export default DemoContract;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import DemoContract from "./contract.js";

export const demo = createOp(DemoContract, {});

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.test.ts
import { DemoConfigSchema } from "./config.js";

export const fixture = DemoConfigSchema;
```
