---
level: error
---
# Prohibit Sibling Stage Private Step Imports

Stage code must not import, re-export, or dynamically load another stage's
private `steps/` modules. A stage may import its own immediate `./steps/`
surface; family and sibling modules must consume an admitted stage or domain
surface instead of reaching downward. Recipe-stage topology admits TypeScript
owner modules with canonical `.ts` names and rejects `.tsx`; this boundary rule
therefore does not invent a second file-kind policy.

```grit
language js(typescript)

or {
  import_statement(source=$source),
  `export { $exports } from $source`,
  `export type { $exports } from $source`,
  `export * from $source`,
  `import($source)`
} where {
  or {
    $source <: r"^[\"']?(?:\.\./)+steps/.+[\"']?$",
    $source <: r"^[\"']?(?:\./|\.\./)+(?:[^/]+/)+steps/.+[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/index.ts
import { ShapeSurfaceStep } from "../terrain/steps/shape-surface/step.js";

export const value = ShapeSurfaceStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/index.ts
import { SharedStep } from "../../steps/shared/step.js";

export const parentReach = SharedStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/steps/shape-surface/step.ts
export const ShapeSurfaceStep = {};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/steps/assemble/step.ts
import { ShapeSurfaceStep } from "../../../terrain/steps/shape-surface/step.js";

export const nestedValue = ShapeSurfaceStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/steps/assemble/step.ts
import { DeepStep } from "../../../../family/terrain/steps/deep/step.js";

export const deepRelativeReach = DeepStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/viz.ts
import { config as shapeSurfaceConfig } from "../terrain/steps/shape-surface/config.js";

export const importedConfig = shapeSurfaceConfig;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/steps/assemble/step.ts
import type { SurfaceOutput } from "../../../terrain/steps/shape-surface/types.js";

export type ImportedOutput = SurfaceOutput;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/index.ts
import "../terrain/steps/shape-surface/step.js";

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/log.ts
import { ShapeSurfaceStep } from "../terrain/steps/shape-surface/step.js";

export const loggedStep = ShapeSurfaceStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/index.ts
export { ShapeSurfaceStep } from "../terrain/steps/shape-surface/step.js";

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/assembly/index.ts
const dynamicStep = import("../terrain/steps/shape-surface/step.js");

export const loadStep = () => dynamicStep;

// @filename: mods/alternate-mod/src/recipes/alternate-recipe/stages/output/index.ts
import { RenderStep } from "../render/steps/render/step.js";

export const outputStep = RenderStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/steps/shape-surface/step.ts
export const ShapeSurfaceStep = {};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/steps/shape-surface/config.ts
export const config = {};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/steps/shape-surface/types.ts
export interface SurfaceOutput {
  value: number;
}
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/index.ts
import { ShapeSurfaceStep } from "./steps/shape-surface/step.js";

export const value = ShapeSurfaceStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/index.ts
import { AnotherShapeStep } from "./steps/another-shape/step.js";

export const secondLocalValue = AnotherShapeStep;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/steps/shape-surface/step.ts
export const ShapeSurfaceStep = {};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/index.ts
import { contract } from "./contract.js";

export const stageContract = contract;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/index.ts
import terrain from "@mapgen/domain/terrain";

export const domainContract = terrain;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/world/terrain/index.ts
import helper from "../world/stepstore/helper.js";

export const stepstore = helper;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/terrain/index.ts
import helper from "../world/stepsish/helper.js";

export const stepsish = helper;

```
