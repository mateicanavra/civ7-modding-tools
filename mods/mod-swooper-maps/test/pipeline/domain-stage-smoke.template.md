# Domain Stage Smoke Test Template

Copy this file to:

`mods/mod-swooper-maps/test/pipeline/<domain>-stage-smoke.test.ts`

Then replace the placeholders and follow the steps below. This template is intentionally narrow: it verifies that a refactored domain stage is wired correctly and that its key artifacts/effects are satisfied.

## Required invariants

- Use deterministic env (`env.seed = 0`, fixed dimensions).
- Use a deterministic adapter RNG: `createMockAdapter({ rng: () => 0 })`.
- Use canonical field/effect tags from `mods/mod-swooper-maps/src/recipes/standard/tags.ts` and artifact ids from the stage-owned `artifacts.ts`.
- Assert fields/effects are satisfied via `STANDARD_TAG_DEFINITIONS` where applicable.

## Skeleton (copy into the `.test.ts` file)

```ts
import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";

import { STANDARD_ENGINE_EFFECT_TAGS } from "../../src/recipes/standard/tags.js";
import { artifacts as __STAGE__Artifacts } from "../../src/recipes/standard/stages/__STAGE__/artifacts/index.js";
import { buildStandardRecipeDefaultConfig } from "../../src/recipes/standard/artifacts.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";

const env = {
  seed: 0,
  dimensions: { width: 4, height: 3 },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

describe("__DOMAIN__ stage smoke", () => {
  it("runs __STAGE__ and satisfies key artifacts/effects", () => {
    const adapter = createMockAdapter({
      width: env.dimensions.width,
      height: env.dimensions.height,
      rng: () => 0,
    });
    const ctx = createExtendedMapContext(env.dimensions, adapter, env);
    initializeStandardRuntime(ctx, env);

    const config = structuredClone(buildStandardRecipeDefaultConfig());
    expect(() => standardRecipe.run(ctx, env, config, { log: () => {} })).not.toThrow();

    expect(ctx.artifacts.get(__STAGE__Artifacts.__ARTIFACT_KEY__.id)).toBeTruthy();
    expect(ctx.effects.has(STANDARD_ENGINE_EFFECT_TAGS.engine.__EFFECT_KEY__)).toBe(true);
  });
});
```

Notes:

- Start from `buildStandardRecipeDefaultConfig()` and mutate only the domain behavior under test, or use an admitted complete shipped config when the test targets shipped behavior.
- For a full reference, see `mods/mod-swooper-maps/test/standard-run.test.ts`.
