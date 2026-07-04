---
level: error
---
# Require Domain Model Schema And Policy Owner Shape

Domain model schemas and policy are reusable primitives, not renamed config
bags. Schema files may define reusable TypeBox fragments. Policy files may
define semantic constants and functions. Neither owner may contain operation
envelopes or stage authoring composition.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:config\.ts|config/.*\.ts)$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/schemas/.*\.ts$",
    $source <: r"^[\"']?.*(?:/ops/|/recipes/|/stages/|@civ7/map-policy|@civ7/types|base-standard|adapter).*[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/policy/.*\.ts$",
    $source <: r"^[\"']?.*(?:/ops/|/recipes/|/stages/|@civ7/map-policy|@civ7/types|base-standard|adapter).*[\"']?$"
  },
  `defineOp($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$"
  },
  `createStage($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$"
  },
  `createOp($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$"
  },
  `export const $name = Type.Object($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/schemas/.*\.ts$",
    $name <: r".*(?:Input|Output|Contract|Config)Schema$"
  },
  `Type.Object($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/policy/.*\.ts$"
  },
  `TypedArraySchemas.$method($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/policy/.*\.ts$"
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$",
    $body <: contains `knobsSchema: $value`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$",
    $body <: contains `public: $value`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/model/(?:schemas|policy)/.*\.ts$",
    $body <: contains `compile: $value`
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/model/config/plate.config.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const PlateConfigSchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/config.ts
export const legacyConfig = {};

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/compute-crust.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const ComputeCrustInputSchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/stage-public.schema.ts
export const stagePublic = {
  knobsSchema: {},
  public: {},
  compile: () => ({}),
};

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/plate.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";
import ComputeCrustContract from "../ops/compute-crust/contract.js";

export const PlateSchema = Type.Object({ contract: ComputeCrustContract });

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/resource.schema.ts
import { RESOURCE_CLASSES } from "@civ7/map-policy";

export const ResourceClassSchema = RESOURCE_CLASSES;

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/policy/plate-activity.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const PlateActivitySchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/policy/stage-public.ts
export const stagePublic = {
  knobsSchema: {},
  public: {},
  compile: () => ({}),
};
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/plate-activity.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const PlateActivitySchema = Type.Object(
  {
    intensity: Type.Number({ minimum: 0, maximum: 1 }),
  },
  { additionalProperties: false }
);

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/schemas/index.ts
export * from "./plate-activity.schema.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/model/policy/plate-activity.ts
export const PLATE_ACTIVITY_OROGENY_MULTIPLIER = 1.25;

export function resolvePlateActivityOrogenyMultiplier(value: number): number {
  return value * PLATE_ACTIVITY_OROGENY_MULTIPLIER;
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineOp({
  kind: "compute",
  id: "foundation/compute-crust",
  input: Type.Object({}),
  output: Type.Object({}),
  strategies: { default: Type.Object({}) },
});
```
