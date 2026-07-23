---
level: error
---
# Require Recipe Step Config Owner Shape

Every recipe-step `config.ts` publishes one literal local
`config = defineStep(...)` contract. The literal step id equals its immediate
source directory, while recipe and stage composition retain stage identity.
Local helpers may support authoring, but only erased type and interface
declarations may join the canonical runtime export.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    or {
      ! $body <: contains `import { $..., defineStep, $... } from "@swooper/mapgen-core/authoring/contracts"`,
      ! $body <: contains `export const config = defineStep($args)`
    }
  },
  `export const config = defineStep($args)` where {
    $filename <: r".*/steps/([^/]+)/config\.ts$"($step_id),
    ! $args <: `{ $..., id: "$step_id", $... }`
  },
  `export const $name = $value` where {
    or {
      ! $name <: r"^config$",
      ! $value <: `defineStep($_)`
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
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/missing-config/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

const config = defineStep({ id: "missing-config" });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/wrong-id/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const config = defineStep({ id: "different-id" });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/named-contract/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const NamedContract = defineStep({ id: "named-contract" });

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/reexported-type/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const config = defineStep({ id: "reexported-type" });
export type { ExternalInput } from "./input.js";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/atmosphere/steps/simulate-weather/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export interface WeatherStepInput {
  readonly seed: number;
}

export type WeatherStepId = "simulate-weather";

/** Declares the stable inputs and outputs of weather simulation. */
export const config = defineStep({ id: "simulate-weather" });
```
