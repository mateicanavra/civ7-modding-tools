---
level: error
---
# Require Typed Dependency Tag Constants

Standard recipe `StepContract` definitions in `config.ts` must use typed
dependency tag constants in top-level `requires` and `provides`; string literal
dependency keys drift from the owning tag surfaces.

```grit
language js(typescript)

or {
  `defineStep({ $props })` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/[^/]+/config\.ts$",
    $props <: some bubble {
      pair(key=`requires`, value=array($elements)) where {
        $elements <: some string()
      }
    }
  },
  `defineStep({ $props })` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/[^/]+/config\.ts$",
    $props <: some bubble {
      pair(key=`provides`, value=array($elements)) where {
        $elements <: some string()
      }
    }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: ["effect:map.elevationBuilt"],
  provides: [],
  schema: Type.Object({}),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [],
  provides: ['effect:map.riversPlotted'],
  schema: Type.Object({}),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    "effect:map.riversModeled",
  ],
  provides: [],
  schema: Type.Object({}),
});
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tags.js";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted],
  schema: Type.Object({}),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [],
  provides: [],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography],
    provides: [mapRiversArtifacts.projectedNavigableRivers],
  },
  schema: Type.Object({}),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [],
  provides: [],
  artifacts: {
    requires: ["artifact:hydrology.hydrography"],
    provides: ["artifact:map.rivers"],
  },
  schema: Type.Object({}),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/step.ts
const requires = ["effect:map.elevationBuilt"];

export const value = requires;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.tsx
export const contract = {
  requires: ["effect:map.elevationBuilt"],
};

// @filename: mods/other-mod/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
export const contract = {
  requires: ["effect:map.elevationBuilt"],
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
const helper = {
  requires: ["effect:map.elevationBuilt"],
};

export const value = helper;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts
const source = "effect:map.elevationBuilt";

export const value = source;
```
