---
level: error
---
# Require Recipe Step Authoring Shape

Recipe step source modules publish their named authoring value. `config.ts`
exports a `*StepContract` created by `defineStep`; `step.ts` exports a `*Step`
created by `createStep`. Recipe and stage composition own stage identity, so
step authors must not supply legacy `phase` or `stageId` properties. Default
exports remain forbidden so composition names the value it consumes. The
literal step id must equal its immediate source directory so identity has one
filesystem and runtime spelling. Each owned module contains exactly one
authoring call, eliminating shadow contracts and executables.

Meaningful JSDoc for these consumed exports is owned by the generic MapGen
export-documentation authority rather than duplicated here.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/config\.ts$",
    ! $body <: contains `export const $contract = defineStep($args)`
  },
  `export const $contract = defineStep($args)` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/config\.ts$",
    ! $contract <: r"^[A-Z][A-Za-z0-9]*StepContract$"
  },
  `export const $contract = defineStep($args)` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/([^/]+)/config\.ts$"($step_id),
    ! $args <: `{ $..., id: "$step_id", $... }`
  },
  `defineStep({ $..., phase: $_, $... })` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/config\.ts$"
  },
  `defineStep({ $..., stageId: $_, $... })` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/config\.ts$"
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/config\.ts$",
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `defineStep($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/step\.ts$",
    ! $body <: contains `export const $step = createStep($contract, $implementation)`
  },
  `export const $step = createStep($contract, $implementation)` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/step\.ts$",
    ! $step <: r"^[A-Z][A-Za-z0-9]*Step$"
  },
  `createStep($_, { $..., phase: $_, $... })` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/step\.ts$"
  },
  `createStep($_, { $..., stageId: $_, $... })` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/step\.ts$"
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/step\.ts$",
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `createStep($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  or {
    `export default $value`,
    `export { $..., $value as default, $... }`,
    `export { $..., $value as default, $... } from $source`,
    `export { $..., default, $... } from $source`
  } where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/(?:config|step)\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/missing-contract/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

const MissingStepContract = defineStep({ id: "missing-contract" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/bad-contract-name/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const contract = defineStep({ id: "bad-contract-name" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/directory-id/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const DirectoryIdStepContract = defineStep({ id: "different-id" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/nonliteral-id/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

const stepId = "nonliteral-id";
export const NonliteralIdStepContract = defineStep({ id: stepId });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/duplicate-contract/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const DuplicateContractStepContract = defineStep({ id: "duplicate-contract" });
export const AlternateDuplicateContractStepContract = defineStep({ id: "duplicate-contract" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/stray-contract/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const StrayContractStepContract = defineStep({ id: "stray-contract" });
const AlternateContract = defineStep({ id: "stray-contract" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/legacy-phase/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const LegacyPhaseStepContract = defineStep({
  id: "legacy-phase",
  phase: "gameplay",
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/authored-stage/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const AuthoredStageStepContract = defineStep({
  id: "authored-stage",
  stageId: "ecology",
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/missing-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { MissingStepContract } from "./config.js";

const MissingStep = createStep(MissingStepContract, { run: () => undefined });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/bad-step-name/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { BadStepNameStepContract } from "./config.js";

export const step = createStep(BadStepNameStepContract, { run: () => undefined });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/duplicate-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { DuplicateStepStepContract } from "./config.js";

export const DuplicateStepStep = createStep(DuplicateStepStepContract, { run: () => undefined });
export const AlternateDuplicateStepStep = createStep(DuplicateStepStepContract, {
  run: () => undefined,
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/stray-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { StrayStepStepContract } from "./config.js";

export const StrayStepStep = createStep(StrayStepStepContract, { run: () => undefined });
const AlternateStep = createStep(StrayStepStepContract, { run: () => undefined });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/legacy-phase/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { LegacyPhaseStepContract } from "./config.js";

export const LegacyPhaseStep = createStep(LegacyPhaseStepContract, {
  phase: "gameplay",
  run: () => undefined,
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/authored-stage/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { AuthoredStageStepContract } from "./config.js";

export const AuthoredStageStep = createStep(AuthoredStageStepContract, {
  stageId: "ecology",
  run: () => undefined,
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/default-contract/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

const DefaultContractStepContract = defineStep({ id: "default-contract" });
export default DefaultContractStepContract;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/default-step/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { DefaultStepStepContract } from "./config.js";

const DefaultStep = createStep(DefaultStepStepContract, { run: () => undefined });
export default DefaultStep;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/aliased-default/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

export const AliasedDefaultStepContract = defineStep({ id: "aliased-default" });
export { AliasedDefaultStepContract as default };

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/forwarded-default/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { ForwardedDefaultStepContract } from "./config.js";

export const ForwardedDefaultStep = createStep(ForwardedDefaultStepContract, {
  run: () => undefined,
});
export { default } from "./legacy-step.js";
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot-biomes/config.ts
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/** Declares the stable inputs and outputs of biome projection. */
export const PlotBiomesStepContract = defineStep({ id: "plot-biomes" });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot-biomes/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { PlotBiomesStepContract } from "./config.js";

/** Projects classified biome evidence through the Civ7 adapter. */
export const PlotBiomesStep = createStep(PlotBiomesStepContract, { run: () => undefined });

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot-biomes/helpers.ts
export default function projectBiome() {}

// @filename: mods/mod-swooper-maps/test/recipes/standard/stages/ecology/steps/plot-biomes/step.ts
export default {};
```
