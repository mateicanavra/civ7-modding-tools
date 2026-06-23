---
level: error
---
# Control oRPC Contract Ownership

Control-oRPC contracts stay transport-pure and keep module-local schemas private.

```grit
language js(typescript)

or {
  `import $imports from "@civ7/direct-control"` where {
    $filename <: r".*packages/civ7-control-orpc/src/modules/.*/contract\.ts$"
  },
  `export const $schema = $_` where {
    $filename <: r".*packages/civ7-control-orpc/src/modules/.*/contract\.ts$",
    $schema_name = text($schema),
    $schema_name <: r"^Civ7[A-Za-z0-9]+(?:Input|Result|Output)Schema$|^Civ7[A-Za-z0-9]+StandardSchema$"
  },
  `export { $moduleSchema } from $source` where {
    $filename <: r".*packages/civ7-control-orpc/src/index\.ts$",
    $source <: r"^[\"']?\./modules/[^/]+/contract[\"']?$",
    $module_schema = text($moduleSchema),
    $module_schema <: r"^Civ7[A-Za-z0-9]+(?:Input|Result|Output|Standard)Schema$"
  },
  `export { $moduleSchema as $alias } from $source` where {
    $filename <: r".*packages/civ7-control-orpc/src/index\.ts$",
    $source <: r"^[\"']?\./modules/[^/]+/contract[\"']?$",
    $module_schema = text($moduleSchema),
    $module_schema <: r"^Civ7[A-Za-z0-9]+(?:Input|Result|Output|Standard)Schema$"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { session } from "@civ7/direct-control";

export const contract = session;

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import type { DirectControlSession } from "@civ7/direct-control";

export type DemoSession = DirectControlSession;

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
export const Civ7DemoInputSchema = Type.Object({});

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
export const Civ7DemoResultSchema = Type.Object({});

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
export const Civ7DemoOutputSchema = Type.Object({});

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
export const Civ7DemoStandardSchema = toStandardSchema(Civ7DemoInputSchema);

// @filename: packages/civ7-control-orpc/src/index.ts
export { Civ7DemoInputSchema } from "./modules/demo/contract";

// @filename: packages/civ7-control-orpc/src/index.ts
export { Civ7DemoOutputSchema as DemoOutputSchema } from "./modules/demo/contract";
```

## Ignores fixture

```typescript
// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { schema } from "./schema.js";

export const contract = schema;

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
const Civ7DemoInputSchema = Type.Object({});
const Civ7DemoResultSchema = Type.Object({});
const Civ7DemoStandardSchema = toStandardSchema(Civ7DemoInputSchema);

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
export const Civ7DemoStatusSchema = Type.Union([Type.Literal("ready")]);

// @filename: packages/civ7-control-orpc/src/modules/demo/procedures/current.ts
import type { DirectControlSession } from "@civ7/direct-control";

export type DemoSession = DirectControlSession;

// @filename: packages/civ7-control-orpc/src/context.ts
import type { DirectControlSession } from "@civ7/direct-control";

export type DemoSession = DirectControlSession;

// @filename: packages/civ7-control-orpc/src/index.ts
export { Civ7ControllerBridgeRequestSchema } from "./bridge/controller-ingress";

// @filename: packages/civ7-control-orpc/src/index.ts
export { Civ7DemoStatusSchema } from "./modules/demo/contract";

// @filename: packages/civ7-control-orpc/src/index.ts
export { Civ7DemoInputSchema } from "./modules/demo";

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.tsx
import { session } from "@civ7/direct-control";

export const contract = session;

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
import { session } from "@civ7/direct-control/testing";

export const contract = session;

// @filename: packages/civ7-control-orpc/src/modules/demo/contract.ts
const directControl = import("@civ7/direct-control");

export const contract = directControl;
```
