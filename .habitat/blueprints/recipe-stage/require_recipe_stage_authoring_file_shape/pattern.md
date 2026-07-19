---
level: error
---
# Require Recipe Stage Authoring File Shape

Recipe stage root files own authoring config. The stage `index.ts` must be the
positive authoring surface: it creates the stage and wires steps. Shared
standard-recipe public-config modules may own family-level schema and compile
helpers when several stages consume the same authoring rail. Domain modules
provide model schemas, model policy, artifacts, and public domain surfaces.
Stage-local helper bags such as `public-config.ts`, `knobs.ts`, and
binding/config mirrors are topology residue rather than destination authority.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $body <: contains `export default createStage({ $..., id: $id, $..., steps: $steps, $... } as const)`,
    ! $body <: contains `export default createStage({ $..., id: $id, $..., steps: $steps, $... })`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/[^/]+\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/(?:index|viz|log)\.ts$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring|@mapgen/domain/[^/]+/(?:model/(?:schemas|policy)(?:/.*)?|artifacts(?:/.*)?)|\./steps/[^/]+/step\.js|\./artifacts/index\.js|\./viz\.js|\./log\.js|\.\./(?:ecology|foundation|hydrology|placement|map-projection)-public-config\.js|\.\./\.\./contract-manifest\.js)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring|@mapgen/domain/[^/]+/(?:model/(?:schemas|policy)(?:/.*)?|artifacts(?:/.*)?)|\./steps/[^/]+/step\.js|\./artifacts/index\.js|\./viz\.js|\./log\.js|\.\./(?:ecology|foundation|hydrology|placement|map-projection)-public-config\.js|\.\./\.\./contract-manifest\.js)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring|@mapgen/domain/[^/]+/(?:model/(?:schemas|policy)(?:/.*)?|artifacts(?:/.*)?)|\./steps/[^/]+/step\.js|\./artifacts/index\.js|\./viz\.js|\./log\.js|\.\./(?:ecology|foundation|hydrology|placement|map-projection)-public-config\.js|\.\./\.\./contract-manifest\.js)[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$",
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring|@mapgen/domain/[^/]+/(?:model/(?:schemas|policy)(?:/.*)?|artifacts(?:/.*)?)|\./steps/[^/]+/step\.js|\./artifacts/index\.js|\./viz\.js|\./log\.js|\.\./(?:ecology|foundation|hydrology|placement|map-projection)-public-config\.js|\.\./\.\./contract-manifest\.js)[\"']?$"
  },
  `$domain.ops.$operation.input` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$"
  },
  `$domain.ops.$operation.output` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$"
  },
  `$domain.ops.$operation.config` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$"
  },
  `$domain.ops.$operation.strategies.$strategy` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/index\.ts$"
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
import { GeomorphicCycleConfigSchema } from "./public-config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "morphology-erosion", public: GeomorphicCycleConfigSchema });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";
import { morphology } from "@mapgen/domain/morphology";

export default createStage({
  id: "morphology-erosion",
  steps: {},
  knobsSchema: morphology.ops.computeErosion.strategies.default,
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export const stageId = "foundation-tectonics";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import StageDefinition from "./public-config.js";

const stray = { id: "morphology-erosion", steps: {} };
const sentinel = createStage({ id: "morphology-erosion", steps: {} });

export default createStage(StageDefinition);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts
import { PlacementPublicSchema } from "../placement-public-config.js";
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({ id: "placement", public: PlacementPublicSchema, steps: {} });

```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts
import { FoundationPlateActivityKnobSchema } from "@mapgen/domain/foundation/model/schemas/plate-activity.schema.js";
import { resolvePlateActivityOrogenyMultiplier } from "@mapgen/domain/foundation/model/policy/plate-activity.js";
import { createStage } from "@swooper/mapgen-core/authoring";
import { TectonicsStep } from "./steps/tectonics/step.js";

export default createStage({
  id: "foundation-tectonics",
  knobsSchema: FoundationPlateActivityKnobSchema,
  public: Type.Object({ activity: FoundationPlateActivityKnobSchema }),
  compile: ({ config }) => ({ tectonics: config }),
  steps: { tectonics: TectonicsStep },
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.ts
import { resolvePlateActivityOrogenyMultiplier } from "@mapgen/domain/foundation/model/policy/plate-activity.js";

export const TectonicsStep = { multiplier: resolvePlateActivityOrogenyMultiplier };

// @filename: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
import foundationTectonics from "./stages/foundation-tectonics/index.js";

export const stages = [foundationTectonics];
```
