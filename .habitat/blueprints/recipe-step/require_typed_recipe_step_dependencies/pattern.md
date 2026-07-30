---
level: error
---
# Require Typed Recipe Step Dependencies

A recipe-step `config.ts` selects dependencies only through its top-level
`defineStep` `requires` and `provides` lists. Data dependencies use the exact
owning `Artifact` authority. Payload-free transaction dependencies use an owned
typed `CompletionId` constant. A string literal erases either authority.

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
// @filename: plugins/mod/map/example-mod/src/recipes/sample/stages/water/rivers/steps/plot-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";

export const config = defineStep({
  id: "plot-rivers",
  requires: ["completion:map.elevation-built"],
  provides: ["artifact:hydrology.projected-rivers"],
});
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/sample/stages/water/rivers/steps/plot-rivers/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring";
import { artifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

export const config = defineStep({
  id: "plot-rivers",
  requires: [STANDARD_COMPLETIONS.elevationBuilt, artifacts.riverNetwork],
  provides: [STANDARD_COMPLETIONS.riversPlotted, artifacts.projectedNavigableRivers],
});

// @filename: plugins/mod/map/example-mod/src/recipes/sample/stages/water/rivers/steps/plot-rivers/step.ts
const diagnostic = "completion:map.elevation-built";
```
