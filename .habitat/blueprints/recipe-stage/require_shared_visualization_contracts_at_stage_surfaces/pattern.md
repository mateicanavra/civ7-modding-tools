---
level: error
---
# Require Shared Visualization Contracts At Stage Surfaces

Shared visualization contracts are stage surfaces, not `steps/` hubs. Import
boundaries are owned separately; this rule asserts only the shared owner.

```grit
language js(typescript)

program(statements=$body) where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/viz\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts
export const viz = {};

```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/viz.ts
export const viz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust/step.ts
import { privateViz } from "./viz.js";

export const crust = privateViz;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust/step.ts
import { stageViz } from "../../../hydrology/viz.js";

export const crust = stageViz;

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/stages/foundation/steps/demo/viz.ts
export const browserTestViz = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/demo/viz.tsx
export const componentViz = {};

// @filename: packages/mapgen-core/src/stages/foundation/steps/demo/viz.ts
export const packageViz = {};
```
