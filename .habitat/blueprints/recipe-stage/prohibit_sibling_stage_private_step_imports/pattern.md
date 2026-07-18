---
level: error
---
# Prohibit Sibling Stage Private Step Imports

Stage code must not import another stage's private `steps/` modules.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
  $source <: r"^[\"']?.*\.\./[^/]+/steps/.*[\"']?$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import { FooStep } from "../b/steps/foo/step.js";

export const value = FooStep;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/step.ts
export const FooStep = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/local/step.ts
import { FooStep } from "../../../b/steps/foo/step.js";

export const nestedValue = FooStep;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/config.ts
import { FooStepContract } from "../b/steps/foo/config.js";

export const importedContract = FooStepContract;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/local/step.ts
import type { StepOutput } from "../../../b/steps/foo/types.js";

export type ImportedOutput = StepOutput;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import "../b/steps/foo/step.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/step.ts
export const FooStep = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/config.ts
export const FooStepContract = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/types.ts
export interface StepOutput {
  value: number;
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import { FooStep } from "./steps/foo/step.js";

export const value = FooStep;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/foo/step.ts
export const FooStep = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import { contract } from "./contract.js";

export const stageContract = contract;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import { plan } from "@mapgen/domain/ecology/ops";

export const domainPlan = plan;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import helper from "../b/stepstore/foo.js";

export const stepstore = helper;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import helper from "../b/stepsish/foo.js";

export const stepsish = helper;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
export { FooStep } from "../b/steps/foo/step.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
const dynamicStep = import("../b/steps/foo/step.js");

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.tsx
import { FooStep } from "../b/steps/foo/step.js";

export const tsxStep = FooStep;

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/stages/a/index.ts
import { FooStep } from "../b/steps/foo/step.js";

export const browserTestStep = FooStep;

// @filename: mods/mod-swooper-maps/test/stages/a/index.ts
import { FooStep } from "../b/steps/foo/step.js";

export const testStageStep = FooStep;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/a/index.ts
import { FooStep } from "../b/steps/foo/step.js";

export const mapStageStep = FooStep;

// @filename: packages/mapgen-core/src/recipes/standard/stages/a/index.ts
import { FooStep } from "../b/steps/foo/step.js";

export const packageStageStep = FooStep;
```
