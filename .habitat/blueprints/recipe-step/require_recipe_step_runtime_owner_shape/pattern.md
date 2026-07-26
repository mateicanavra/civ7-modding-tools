---
level: error
---
# Require Recipe Step Runtime Owner Shape

Every recipe-step `step.ts` imports its local `config` contract and publishes
one semantically named `<Name>Step = createStep(config, ...)` executable.
Recipe and stage composition retain stage identity. Local helpers may support
execution, but only erased type and interface declarations may join the
canonical runtime export. Runtime callbacks name the admitted value
`stepConfig` (or `_stepConfig` when unused), keeping it distinct from the
imported static `config` owner. When the closed step leaf owns optional
`viz.ts`, the sibling import is meaningful only through the executable's
first-class `viz` facet.

```grit
language js(typescript)

predicate is_noncanonical_step_config_binding($binding) {
  ! $binding <: r"^_?stepConfig$"
}

or {
  program(statements=$body) where {
    or {
      ! $body <: contains `import { $..., createStep, $... } from "@swooper/mapgen-core/authoring"`,
      ! $body <: contains `import { config } from "./config.js"`,
      ! $body <: contains `export const $step = createStep(config, $implementation)` where {
        $step <: r"^[A-Z][A-Za-z0-9]*Step$"
      }
    }
  },
  program(statements=$body) where {
    $body <: contains import_statement(source=$source) where {
      $source <: r"^[\"']\./viz\.js[\"']$"
    },
    ! $body <: contains `export const $step = createStep(config, { $..., viz: $viz, $... })`
  },
  `export const $name = $value` where {
    or {
      ! $name <: r"^[A-Z][A-Za-z0-9]*Step$",
      ! $value <: `createStep(config, $_)`
    }
  },
  export_statement(declaration=$declaration) where {
    $declaration <: or {
      function_declaration(),
      class_declaration(),
      enum_declaration()
    }
  },
  or {
    `export let $name = $value`,
    `export var $name = $value`,
    `export namespace $name { $body }`,
    `export default $value`,
    `export { $exports }`,
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  },
  `run: ($context, $runtime_config, $ops, $deps) => $body` as $callback where {
    $callback <: within `createStep(config, $implementation)`,
    is_noncanonical_step_config_binding($runtime_config)
  },
  `run: async ($context, $runtime_config, $ops, $deps) => $body` as $callback where {
    $callback <: within `createStep(config, $implementation)`,
    is_noncanonical_step_config_binding($runtime_config)
  },
  `normalize: ($runtime_config, $context) => $body` as $callback where {
    $callback <: within `createStep(config, $implementation)`,
    is_noncanonical_step_config_binding($runtime_config)
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/missing-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

const SimulateWeatherStep = createStep(config, { run: () => undefined });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/generic-step-name/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const step = createStep(config, { run: () => undefined });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/reexported-type/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const ReexportedTypeStep = createStep(config, { run: () => undefined });
export type { ExternalEvidence } from "./evidence.js";

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/shadowed-config/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const ShadowedConfigStep = createStep(config, {
  run: (context, config, ops, deps) => undefined,
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/mixed-config-identity/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const MixedConfigIdentityStep = createStep(config, {
  normalize: (options, context) => options,
  run: (context, options, ops, deps) => undefined,
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/detached-viz/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { projectWeather } from "./viz.js";

export const DetachedVizStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => projectWeather(context),
});
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/simulate-weather/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export interface WeatherStepEvidence {
  readonly observed: boolean;
}

export type WeatherStepId = "simulate-weather";

/** Simulates weather from the admitted atmospheric inputs. */
export const SimulateWeatherStep = createStep(config, {
  normalize: (stepConfig, context) => stepConfig,
  run: (context, stepConfig, ops, deps) => undefined,
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/observe-weather/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/** Observes weather without reading authored configuration. */
export const ObserveWeatherStep = createStep(config, {
  run: (context, _stepConfig, ops, deps) => undefined,
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/climate/steps/visualize-weather/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { projectWeather } from "./viz.js";

/** Simulates weather and exposes its authored visualization projection. */
export const VisualizeWeatherStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => undefined,
  viz: ({ result, dimensions }) => projectWeather(result, dimensions),
});
```
