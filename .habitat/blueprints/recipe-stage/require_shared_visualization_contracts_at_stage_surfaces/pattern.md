---
level: error
---
# Require Shared Visualization Contracts At Stage Surfaces

Recipe-root `viz.ts` owns semantic styles and palettes; stage and step `viz.ts`
own projection contracts at their narrowest reusable surface. A collection-wide
`steps/viz.ts` hub owns neither concern. Import boundaries are enforced separately;
this rule rejects only that ambiguous hub.

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
