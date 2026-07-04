---
level: error
---
# Require Stage Authoring Owner Shape

Recipe stages own authoring config. The stage file and stage-local helpers may
compose public schemas, knobs, and compile mappings. Domain modules provide
model schemas and policy; domain `config.ts` facades and recipe-wide
`*-public-config.ts` bags are not destination authority.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $body <: contains `createStage($definition)`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+-public-config\.ts$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain(?:/[^/]+)?/config\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/ops/.*/config\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?(?:\./|\.\./).*ops/.*/config\.js[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain(?:/[^/]+)?/config\.js[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/ops/.*/config\.js[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?(?:\./|\.\./).*ops/.*/config\.js[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain(?:/[^/]+)?/config\.js[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/ops/.*/config\.js[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?(?:\./|\.\./).*ops/.*/config\.js[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain(?:/[^/]+)?/config\.js[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/ops/.*/config\.js[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/.*\.ts$",
    $source <: r"^[\"']?(?:\./|\.\./).*ops/.*/config\.js[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^[\"']?\.\./[^/]*public-config\.js[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^[\"']?\.\./[^/]*public-config\.js[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^[\"']?\.\./[^/]*public-config\.js[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^[\"']?\.\./[^/]*public-config\.js[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts
import { FoundationPlateActivityKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "foundation-tectonics", steps: {} });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts
import { GeomorphicCycleConfigSchema } from "@mapgen/domain/morphology/ops/compute-geomorphic-cycle/config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "morphology-erosion", public: GeomorphicCycleConfigSchema });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts
import { GeomorphicCycleConfigSchema } from "../../../domain/morphology/ops/compute-geomorphic-cycle/config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "morphology-erosion", public: GeomorphicCycleConfigSchema });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts
import { PlacementPublicSchema } from "../placement-public-config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "placement", public: PlacementPublicSchema, steps: {} });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology-public-config.ts
import { Type } from "@swooper/mapgen-core/authoring";

export const EcologyPublicSchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts
export const stageId = "foundation-tectonics";
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts
import { FoundationPlateActivityKnobSchema } from "@mapgen/domain/foundation/model/schemas/plate-activity.schema.js";
import { resolvePlateActivityOrogenyMultiplier } from "@mapgen/domain/foundation/model/policy/plate-activity.js";
import { createStage } from "@swooper/mapgen-core/authoring";
import { TectonicsPublicSchema } from "./public-config.js";

export default createStage({
  id: "foundation-tectonics",
  knobsSchema: FoundationPlateActivityKnobSchema,
  public: TectonicsPublicSchema,
  compile: ({ config }) => ({ tectonics: config }),
  steps: {},
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/public-config.ts
import { Type } from "@swooper/mapgen-core/authoring";

export const TectonicsPublicSchema = Type.Object({});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics.ts
import { resolvePlateActivityOrogenyMultiplier } from "@mapgen/domain/foundation/model/policy/plate-activity.js";

export const multiplier = resolvePlateActivityOrogenyMultiplier;

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import foundationTectonics from "./stages/foundation-tectonics/index.js";

export const stages = [foundationTectonics];
```
