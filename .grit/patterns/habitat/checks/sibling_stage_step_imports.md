---
level: error
---
# Sibling Stage Step Imports

Stage code must not import another stage's private `steps/` implementation.

```grit
language js(typescript)

`import $imports from $source` where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
  $source <: r".*\.\./[^/]+/steps/.*"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import step from "../b/steps/foo/index.js";

export const value = step;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/index.ts
export default {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/local/index.ts
import siblingStageStep from "../../b/steps/foo/index.js";

export const nestedValue = siblingStageStep;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/config.ts
import { contract } from "../b/steps/foo/contract.js";

export const importedContract = contract;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/local/index.ts
import type { StepOutput } from "../../b/steps/foo/types.js";

export type ImportedOutput = StepOutput;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/index.ts
export default {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/contract.ts
export const contract = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/types.ts
export interface StepOutput {
  value: number;
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import step from "./steps/foo/index.js";

export const value = step;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/foo/index.ts
export default {};

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
export { default as step } from "../b/steps/foo/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
const dynamicStep = import("../b/steps/foo/index.js");

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.tsx
import stepTsx from "../b/steps/foo/index.js";

export const tsxStep = stepTsx;

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/stages/a/index.ts
import browserStep from "../b/steps/foo/index.js";

export const browserTestStep = browserStep;

// @filename: mods/mod-swooper-maps/test/stages/a/index.ts
import testStep from "../b/steps/foo/index.js";

export const testStageStep = testStep;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/a/index.ts
import mapStep from "../b/steps/foo/index.js";

export const mapStageStep = mapStep;

// @filename: packages/mapgen-core/src/recipes/standard/stages/a/index.ts
import packageStep from "../b/steps/foo/index.js";

export const packageStageStep = packageStep;
```
