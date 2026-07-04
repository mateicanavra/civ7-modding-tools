---
level: error
---
# Require Operation Contract File Shape

Operation contract files own the operation schema envelope. They may compose
reusable domain primitives, artifact schemas, and policy constants, but they
must not outsource their contract envelope to `config.ts` bags or recipe/stage
authoring surfaces.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    ! $body <: contains `defineOp($definition)`
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\./config|\.\./[^/]+/config|(?:\.\./){2,}config|@mapgen/domain(?:/[^/]+)?/config)\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\.\./\.\./model/config|@mapgen/domain/[^/]+/model/config)\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\.\./[^/]+/contract|@mapgen/domain/[^/]+/ops/[^/]+/contract)\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\.\./\.\./shared/|\.\./\.\./types|@mapgen/domain/[^/]+/types)\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?.*recipes/.*[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\./config|\.\./[^/]+/config|(?:\.\./){2,}config|@mapgen/domain(?:/[^/]+)?/config|\.\./[^/]+/contract|@mapgen/domain/[^/]+/ops/[^/]+/contract)\.js[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\./config|\.\./[^/]+/config|(?:\.\./){2,}config|@mapgen/domain(?:/[^/]+)?/config|\.\./[^/]+/contract|@mapgen/domain/[^/]+/ops/[^/]+/contract)\.js[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/contract\.ts$",
    $source <: r"^[\"']?(?:\./config|\.\./[^/]+/config|(?:\.\./){2,}config|@mapgen/domain(?:/[^/]+)?/config|\.\./[^/]+/contract|@mapgen/domain/[^/]+/ops/[^/]+/contract)\.js[\"']?$"
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
import { DemoConfigSchema } from "./config.js";

export default defineOp({
  kind: "compute",
  id: "foundation/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: DemoConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MountainsConfigSchema } from "../mountains-shared/config.js";

export default defineOp({
  kind: "compute",
  id: "morphology/plan-ridges",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: MountainsConfigSchema },
});

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/contract.ts
import { HydrologyConfigSchema } from "@mapgen/domain/hydrology/config.js";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "hydrology/demo",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: HydrologyConfigSchema },
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

// @filename: mods/mod-swooper-maps/src/domain/resources/ops/adjust-resource-support/contract.ts
import type { SelectResourceSitesInput } from "../select-resource-sites/contract.js";
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

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import DemoContract from "./contract.js";

export const demo = createOp(DemoContract, {});

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.test.ts
import { DemoConfigSchema } from "./config.js";

export const fixture = DemoConfigSchema;
```
