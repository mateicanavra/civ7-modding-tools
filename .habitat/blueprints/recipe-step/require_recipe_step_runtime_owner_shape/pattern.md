---
level: error
---
# Require Recipe Step Runtime Owner Shape

Every recipe-step `step.ts` imports its local `config` contract and publishes
one semantically named `<Name>Step = createStep(config, ...)` executable.
Recipe and stage composition retain stage identity. Local helpers may support
execution, but only erased type and interface declarations may join the
canonical runtime export.

```grit
language js(typescript)

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
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/missing-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

const SimulateWeatherStep = createStep(config, { run: () => undefined });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/generic-step-name/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const step = createStep(config, { run: () => undefined });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/reexported-type/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export const ReexportedTypeStep = createStep(config, { run: () => undefined });
export type { ExternalEvidence } from "./evidence.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/simulate-weather/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

export interface WeatherStepEvidence {
  readonly observed: boolean;
}

export type WeatherStepId = "simulate-weather";

/** Simulates weather from the admitted atmospheric inputs. */
export const SimulateWeatherStep = createStep(config, {
  run: () => undefined,
});
```
