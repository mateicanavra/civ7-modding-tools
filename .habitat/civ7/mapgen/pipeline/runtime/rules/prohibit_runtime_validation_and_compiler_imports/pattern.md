---
level: error
---
# Prohibit Runtime Validation And Compiler Imports

Runtime layers do not import TypeBox or compiler validation helpers.

```grit
language js(typescript)

or {
  `import $imports from "@sinclair/typebox/value"` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@sinclair/typebox/compiler"` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/compiler/normalize"` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/authoring/validation"` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@swooper/mapgen-core/authoring/op/validation-surface"` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `import $imports from "@sinclair/typebox/value"` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@sinclair/typebox/compiler"` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/compiler/normalize"` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/validation"` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/op/validation-surface"` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
import { Value } from "@sinclair/typebox/value";

export const value = Value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/compiler/step.ts
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const compiler = TypeCompiler;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/compiler/helpers/runtime.ts
import { TypeCompiler as RuntimeTypeCompiler } from "@sinclair/typebox/compiler";

export const runtimeTypeCompiler = RuntimeTypeCompiler;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/normalize/step.ts
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

export const normalize = normalizeStrict;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/validation/step.ts
import { runValidated } from "@swooper/mapgen-core/authoring/validation";

export const validation = runValidated;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/validation-surface/step.ts
import { validationSurface } from "@swooper/mapgen-core/authoring/op/validation-surface";

export const surface = validationSurface;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
import { Value as StrategyValue } from "@sinclair/typebox/value";

export const strategyValue = StrategyValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value-type/step.ts
import type { ValueError } from "@sinclair/typebox/value";

export type RuntimeValueError = ValueError;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value-side-effect/step.ts
import "@sinclair/typebox/value";

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/value/step.ts
import { Value as OtherValue } from "@sinclair/typebox/value";

export const otherValue = OtherValue;

```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
import { Value as ConfigValue } from "@sinclair/typebox/value";

export const configValue = ConfigValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.ts
import { Value as StepConfigValue } from "@sinclair/typebox/value";

export const stepConfigValue = StepConfigValue;

// @filename: mods/mod-swooper-maps/test/ecology/value.test.ts
import { Value as TestValue } from "@sinclair/typebox/value";

export const testValue = TestValue;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/contract.ts
import { Value as OpContractValue } from "@sinclair/typebox/value";

export const opContractValue = OpContractValue;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
import { Value as OpIndexValue } from "@sinclair/typebox/value";

export const opIndexValue = OpIndexValue;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/ecology/steps/value/step.ts
import { Value as MapValue } from "@sinclair/typebox/value";

export const mapValue = MapValue;

// @filename: packages/mapgen-core/src/engine/value.ts
import { Value as PackageValue } from "@sinclair/typebox/value";

export const packageValue = PackageValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.tsx
import { Value as TsxValue } from "@sinclair/typebox/value";

export const tsxValue = TsxValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
import { Value as RootValue } from "@sinclair/typebox";

export const rootValue = RootValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
import { Value as AliasValue } from "typebox/value";

export const aliasValue = AliasValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
import { Value as LookalikeValue } from "@sinclair/typebox/value-extra";

export const lookalikeValue = LookalikeValue;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
export { Value } from "@sinclair/typebox/value";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/value/step.ts
const dynamicValue = import("@sinclair/typebox/value");
```
