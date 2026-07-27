---
level: error
---
# Require Typed Dependency Tag Constants

Recipe step definitions in `config.ts` author their complete dependency contract
through the top-level `requires` and `provides` arrays. Artifact dependencies use
the exact owning `Artifact` authority; effect dependencies use typed string
constants. Raw string literals, including `artifact:*` ids, discard their owning
authority and drift from the typed dependency surfaces.

```grit
language js(typescript)

or {
  `defineStep({ $props })` where {
    $props <: some bubble {
      pair(key=`requires`, value=array($elements)) where {
        $elements <: some string()
      }
    }
  },
  `defineStep({ $props })` where {
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
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";

export const config = defineStep({
  id: "plot-rivers",
  requires: ["effect:map.elevationBuilt"],
  provides: [],
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";

export const config = defineStep({
  id: "plot-rivers",
  requires: [],
  provides: ['effect:map.riversPlotted'],
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";

export const config = defineStep({
  id: "plot-rivers",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    "effect:map.riversModeled",
  ],
  provides: [],
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";

export const config = defineStep({
  id: "plot-rivers",
  requires: ["artifact:hydrology.hydrography"],
  provides: ["artifact:map.rivers"],
});
```

## Ignores fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { mapRiversArtifacts } from "../../map-rivers/artifacts.js";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tags.js";

export const config = defineStep({
  id: "plot-rivers",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    hydrologyHydrographyArtifacts.hydrography,
  ],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    mapRiversArtifacts.projectedNavigableRivers,
  ],
});

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/step.ts
const requires = ["effect:map.elevationBuilt"];

export const value = requires;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.tsx
export const contract = {
  requires: ["effect:map.elevationBuilt"],
};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.mts
export const contract = {
  requires: ["effect:map.elevationBuilt"],
};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
const helper = {
  requires: ["effect:map.elevationBuilt"],
};

export const value = helper;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/water/rivers/steps/project-rivers/config.ts
const source = "effect:map.elevationBuilt";

export const value = source;
```
