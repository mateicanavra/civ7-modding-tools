---
level: error
---
# Viz Contract Ownership

Shared visualization contracts are stage surfaces, not `steps/` hubs.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/viz\.ts$"
  },
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $resolved = resolve(path=$source),
    $resolved <: r".*/stages/[^/]+/steps/viz(?:\.js|\.ts)?$"
  },
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^\.\./",
    $resolved = resolve(path=$source),
    $resolved <: r".*/stages/[^/]+/steps/[^/]+/viz(?:\.js|\.ts)?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts
export const viz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
import { sharedViz } from "../steps/viz.js";

export const crust = sharedViz;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/erosion/index.ts
import { privateViz } from "../mesh/viz.js";

export const erosion = privateViz;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/viz.ts
export const viz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
import { stageViz } from "../viz.js";

export const crust = stageViz;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust/index.ts
import { privateViz } from "./viz.js";

export const crust = privateViz;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
import { privateViz } from "./mesh/viz.js";

export const crust = privateViz;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
import { stageViz } from "../../hydrology/viz.js";

export const crust = stageViz;

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/stages/foundation/steps/viz.ts
export const browserTestViz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.tsx
export const componentViz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
const source = "../mesh/viz.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts
const dynamicViz = import("../mesh/viz.js");

// @filename: packages/mapgen-core/src/stages/foundation/steps/viz.ts
export const packageViz = {};
```
