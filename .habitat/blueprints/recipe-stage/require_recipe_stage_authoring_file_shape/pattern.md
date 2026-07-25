---
level: error
---
# Require Recipe Stage Authoring File Shape

Every authored recipe-stage `index.ts` contains exactly one `createStage` call
and default-exports that value with a literal identity and step map.
That default is the module's only runtime export. Stage authoring consumes public
domain contracts rather than reaching through operation input, output,
configuration, or strategy members. Ordinary public configuration flows from
step schemas, bound operation configuration, and stage knobs. A rare full
public override is an inline `Type.Object(...)` in the concrete stage
definition, paired with its meaningful compiler rather than imported from a
parallel configuration assembly. The kind law rejects only syntactically
obvious no-op compilers; review remains responsible for judging whether a
nontrivial transform earns a full public override.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    or {
      ! $body <: contains `import { $..., createStage, $... } from "@swooper/mapgen-core/authoring"`,
      ! $body <: contains or {
        `export default createStage({ $..., id: "$id", $..., steps: $steps, $... } as const)`,
        `export default createStage({ $..., id: "$id", $..., steps: $steps, $... })`
      }
    }
  },
  program(statements=$body) where {
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `createStage($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  or {
    `$domain.ops.$operation.input`,
    `$domain.ops.$operation["input"]`,
    `$domain.ops.$operation.output`,
    `$domain.ops.$operation["output"]`,
    `$domain.ops.$operation.config`,
    `$domain.ops.$operation["config"]`,
    `$domain.ops.$operation.strategies.$strategy`,
    `$domain.ops.$operation.strategies[$strategy]`,
    `$domain.ops.$operation["strategies"].$strategy`,
    `$domain.ops.$operation["strategies"][$strategy]`
  },
  or {
    `createStage({ $..., public: $public, $... })` where {
      ! $public <: `Type.Object($_)`
    },
    `createStage({ $..., public: $public, $... } as const)` where {
      ! $public <: `Type.Object($_)`
    }
  },
  `createStage($definition)` where {
    $definition <: contains `compile: $_`,
    ! $definition <: contains `public: Type.Object($_)`
  },
  `createStage($definition)` where {
    $definition <: contains `public: Type.Object({})`,
    $definition <: contains or {
      `compile: () => ({})`,
      `compile: ($_parameters) => ({})`
    }
  },
  `createStage($definition)` where {
    $definition <: contains or {
      `compile: ({ $value }) => $value`,
      `compile: ({ $key: $value }) => $value`,
      `compile: ({ $value }) => ({ ...$value })`,
      `compile: ({ $key: $value }) => ({ ...$value })`
    }
  },
  export_statement(declaration=$declaration) where {
    $declaration <: or {
      lexical_declaration(),
      variable_declaration(),
      function_declaration(),
      class_declaration(),
      enum_declaration()
    }
  },
  or {
    `export namespace $name { $body }`,
    `export { $exports }`,
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/weather/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export const WeatherStage = createStage({ id: "atmosphere-weather", steps: {} });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/surface/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

const shadow = createStage({ id: "shadow", steps: {} });
export default createStage({ id: "terrain-surface", steps: { shadow } });

// @filename: mods/alternate-mod/src/recipes/alternate-recipe/stages/output/render/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";
import { OutputPublicConfig } from "./public.config.js";

export default createStage({
  id: "output-render",
  public: OutputPublicConfig,
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/nonliteral/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

const STAGE_ID = "terrain-nonliteral";
export default createStage({ id: STAGE_ID, steps: {} });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/aliased-constructor/index.ts
import { createStage as declareStage } from "@swooper/mapgen-core/authoring";

export default declareStage({ id: "terrain-aliased-constructor", steps: {} });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/local-public/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";

const TerrainPublicConfig = Type.Object({});
export default createStage({
  id: "terrain-local-public",
  public: TerrainPublicConfig,
  compile: () => ({}),
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/empty-public-compiler/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";

export default createStage({
  id: "terrain-empty-public-compiler",
  public: Type.Object({}),
  compile: () => ({}),
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/identity-public-compiler/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";

export default createStage({
  id: "terrain-identity-public-compiler",
  public: Type.Object({ profile: Type.String() }),
  compile: ({ config }) => config,
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/aliased-identity-public-compiler/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";

export default createStage({
  id: "terrain-aliased-identity-public-compiler",
  public: Type.Object({ profile: Type.String() }),
  compile: ({ config: authored }) => authored,
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/spread-public-compiler/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";

export default createStage({
  id: "terrain-spread-public-compiler",
  public: Type.Object({ profile: Type.String() }),
  compile: ({ config }) => ({ ...config }),
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/compiler-without-boundary/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export default createStage({
  id: "terrain-compiler-without-boundary",
  compile: () => ({ terrain: {} }),
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/geology/tectonics/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

declare const geology: {
  ops: { simulateTectonics: { strategies: { balanced: unknown } } };
};

export default createStage({
  id: "geology-tectonics",
  knobsSchema: geology.ops.simulateTectonics.strategies.balanced,
  steps: {},
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/geology/runtime-authority/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export async function loadStageState() {}
export function* iterateStageState() {}
export class StageRuntimeAuthority {}
export default createStage({ id: "geology-runtime-authority", steps: {} });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/geology/reexported-type/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export type { ExternalStageEvidence } from "./evidence.js";
export default createStage({ id: "geology-reexported-type", steps: {} });
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/weather/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { SimulateWeatherStep } from "./steps/simulate-weather/step.js";

const stageLabel = "Weather";

export interface WeatherStageMetadata {
  readonly label: string;
}

export type WeatherStageId = "atmosphere-weather";

export default createStage({
  id: "atmosphere-weather",
  public: Type.Object({
    climateProfile: Type.String({
      description: "Selects the authored climate profile compiled for this stage.",
    }),
  }),
  compile: ({ config }) => ({
    "simulate-weather": { profile: config.climateProfile },
  }),
  steps: { simulateWeather: SimulateWeatherStep },
  metadata: { label: stageLabel } satisfies WeatherStageMetadata,
});

```
