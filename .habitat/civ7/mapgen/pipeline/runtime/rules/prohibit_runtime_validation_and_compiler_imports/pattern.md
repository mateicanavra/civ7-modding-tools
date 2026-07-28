---
level: error
---
# Prohibit Runtime Validation And Compiler Imports

Runtime layers do not import TypeBox or compiler validation helpers.

```grit
language js(typescript)

or {
  `import $imports from "@sinclair/typebox/value"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@sinclair/typebox/compiler"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/compiler/normalize"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/authoring/validation"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/authoring/op/validation-surface"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@sinclair/typebox/value"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@sinclair/typebox/compiler"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/compiler/normalize"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/validation"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/op/validation-surface"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
import { Value } from "@sinclair/typebox/value";

export const value = Value;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/compile-value/step.ts
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const compiler = TypeCompiler;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/compile-value/helpers/runtime.ts
import { TypeCompiler as RuntimeTypeCompiler } from "@sinclair/typebox/compiler";

export const runtimeTypeCompiler = RuntimeTypeCompiler;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/normalize-value/step.ts
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

export const normalize = normalizeStrict;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/validate-value/step.ts
import { runValidated } from "@swooper/mapgen-core/authoring/validation";

export const validation = runValidated;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/validation-surface/step.ts
import { validationSurface } from "@swooper/mapgen-core/authoring/op/validation-surface";

export const surface = validationSurface;

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/strategies/balanced/index.ts
import { Value as StrategyValue } from "@sinclair/typebox/value";

export const strategyValue = StrategyValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/value-type/step.ts
import type { ValueError } from "@sinclair/typebox/value";

export type RuntimeValueError = ValueError;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/value-side-effect/step.ts
import "@sinclair/typebox/value";

// @filename: plugins/mod/map/alternate-mod/src/recipes/alternate-recipe/stages/world/projection/steps/read-value/step.ts
import { Value as OtherValue } from "@sinclair/typebox/value";

export const otherValue = OtherValue;

```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/config.ts
import { Value as ConfigValue } from "@sinclair/typebox/value";

export const configValue = ConfigValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/config.ts
import { Value as StepConfigValue } from "@sinclair/typebox/value";

export const stepConfigValue = StepConfigValue;

// @filename: plugins/mod/map/example-mod/test/ecology/value.test.ts
import { Value as TestValue } from "@sinclair/typebox/value";

export const testValue = TestValue;

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/contract.ts
import { Value as OpContractValue } from "@sinclair/typebox/value";

export const opContractValue = OpContractValue;

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
import { Value as OpIndexValue } from "@sinclair/typebox/value";

export const opIndexValue = OpIndexValue;

// @filename: plugins/mod/map/example-mod/src/maps/sample/stages/ecology/biomes/steps/read-value/step.ts
import { Value as MapValue } from "@sinclair/typebox/value";

export const mapValue = MapValue;

// @filename: packages/mapgen-core/src/engine/value.ts
import { Value as PackageValue } from "@sinclair/typebox/value";

export const packageValue = PackageValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.tsx
import { Value as TsxValue } from "@sinclair/typebox/value";

export const tsxValue = TsxValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
import { Value as RootValue } from "@sinclair/typebox";

export const rootValue = RootValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
import { Value as AliasValue } from "typebox/value";

export const aliasValue = AliasValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
import { Value as LookalikeValue } from "@sinclair/typebox/value-extra";

export const lookalikeValue = LookalikeValue;

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
export { Value } from "@sinclair/typebox/value";

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/read-value/step.ts
const dynamicValue = import("@sinclair/typebox/value");
```
