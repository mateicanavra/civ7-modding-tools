---
level: error
---
# Domain Deep Import Tests

Mod and package tests should exercise domain APIs through public surfaces unless
an explicit architecture decision owns a deeper internal test reach.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*(?:mods/mod-swooper-maps/test|packages/[^/]+/test)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/ops[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/ops/index\.js[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/config\.js[\"']"
  },
  `import $source` where {
    $filename <: r".*(?:mods/mod-swooper-maps/test|packages/[^/]+/test)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/ops[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/ops/index\.js[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/config\.js[\"']"
  },
  `export { $exports } from $source` where {
    $filename <: r".*(?:mods/mod-swooper-maps/test|packages/[^/]+/test)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/ops[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/ops/index\.js[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/config\.js[\"']"
  },
  `export * from $source` where {
    $filename <: r".*(?:mods/mod-swooper-maps/test|packages/[^/]+/test)/.*\.tsx?$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/ops[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/ops/index\.js[\"']",
    ! $source <: r".*@mapgen/domain/[^/]+/config\.js[\"']"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import { privateRule } from "@mapgen/domain/ecology/rules/private.js";

export const value = privateRule;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import type { PrivateStrategy } from "@mapgen/domain/morphology/strategies/private.js";

export type Strategy = PrivateStrategy;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import * as privateRules from "@mapgen/domain/ecology/rules/private.js";

export const namespaceValue = privateRules;

// @filename: packages/example/test/domain-public-surface.test.ts
import "@mapgen/domain/ecology/rules/private.js";

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import privateOp from "@mapgen/domain/hydrology/ops/private/index.js";

export const op = privateOp;

// @filename: packages/example/test/domain-public-surface.test.ts
import { DeepType } from "@mapgen/domain/ecology/types.js";

export const typeRef = DeepType;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
export { privateRule } from "@mapgen/domain/ecology/rules/private.js";

// @filename: packages/example/test/domain-public-surface.test.ts
export * from "@mapgen/domain/narrative/overlays/index.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import ecology from "@mapgen/domain/ecology";

export const root = ecology;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import ecologyOps from "@mapgen/domain/ecology/ops";

export const ops = ecologyOps;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import ecologyOpsIndex from "@mapgen/domain/ecology/ops/index.js";

export const opsIndex = ecologyOpsIndex;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
import { EcologyConfigSchema } from "@mapgen/domain/ecology/config.js";

export const config = EcologyConfigSchema;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { privateRule } from "@mapgen/domain/ecology/rules/private.js";

export const recipeSource = privateRule;

// @filename: tools/habitat-harness/test/lib/grit-apply.test.ts
import { privateRule } from "@mapgen/domain/ecology/rules/private.js";

export const harnessFixture = privateRule;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
const source = "@mapgen/domain/ecology/rules/private.js";

export const sourceString = source;

// @filename: mods/mod-swooper-maps/test/domain/public-surface.test.ts
const loaded = await import("@mapgen/domain/ecology/rules/private.js");

export const dynamicLoaded = loaded;
```
