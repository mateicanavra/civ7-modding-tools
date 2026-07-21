---
level: error
---
# Require Recipe Stage Authoring File Shape

Every recipe-stage `index.ts` default-exports the stage value created by
`createStage`. Stage authoring composes public domain and local step surfaces;
it does not reach through the domain boundary to operation input, output,
configuration, or strategy members. The sibling structure rule owns filenames
and directory topology.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" },
    ! $body <: contains `export default createStage({ $..., id: $id, $..., steps: $steps, $... } as const)`,
    ! $body <: contains `export default createStage({ $..., id: $id, $..., steps: $steps, $... })`
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" },
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `createStage($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  `$domain.ops.$operation.input` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" }
  },
  `$domain.ops.$operation.output` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" }
  },
  `$domain.ops.$operation.config` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" }
  },
  `$domain.ops.$operation.strategies.$strategy` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" }
  },
  `$domain.ops.$operation.strategies[$strategy]` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)*index\.ts$",
    not { $filename <: r".*/(?:artifacts|steps)/.*" }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/ecology/biomes/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

export const stage = createStage({ id: "ecology-biomes", steps: {} });

// @filename: mods/example-mod/src/recipes/example/stages/foundation/tectonics/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

declare const domain: {
  ops: { tectonics: { strategies: { balanced: unknown } } };
};

export default createStage({
  id: "foundation-tectonics",
  knobsSchema: domain.ops.tectonics.strategies.balanced,
  steps: {},
});

// @filename: mods/example-mod/src/recipes/example/stages/hydrology/climate/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";

const shadow = createStage({ id: "shadow", steps: {} });
export default createStage({ id: "hydrology-climate", steps: { shadow } });
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/ecology/biomes/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";
import { BiomesStep } from "./steps/biomes/step.js";

export default createStage({
  id: "ecology-biomes",
  steps: { biomes: BiomesStep },
});

// @filename: mods/example-mod/src/recipes/example/stages/ecology/public.config.ts
export const EcologyPublicConfig = {};

// @filename: mods/example-mod/src/recipes/example/stages/ecology/artifacts/index.ts
export const artifacts = {};

// @filename: mods/example-mod/src/recipes/example/stages/ecology/biomes/steps/biomes/step.ts
export const BiomesStep = {};
```
