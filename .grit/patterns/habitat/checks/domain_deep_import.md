---
level: error
---
# Domain Deep Import

Recipe and map source must use public domain surfaces, not deep internals.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import x from "@mapgen/domain/foundation/ops/private";

export const value = x;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { byId } from "@mapgen/domain/foundation/ops-by-id";

export const lookup = byId;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import "@mapgen/domain/foundation/ops/private/register.js";

export const sideEffectLoaded = true;

// @filename: mods/mod-swooper-maps/src/maps/demo.ts
import * as privateRules from "@mapgen/domain/hydrology/rules/private";

export const rules = privateRules;

// @filename: mods/mod-swooper-maps/src/maps/demo.ts
import type { PrivateStrategy } from "@mapgen/domain/morphology/strategies/private";

export type Strategy = PrivateStrategy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.tsx
import { privateOp } from "@mapgen/domain/resources/ops/private";

export const component = privateOp;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export { privateRule } from "@mapgen/domain/ecology/rules/private";

// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export * from "@mapgen/domain/placement/ops/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export { byId } from "@mapgen/domain/foundation/ops-by-id";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export type { PrivateStrategy } from "@mapgen/domain/morphology/strategies/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/__tests__/deep-import.test.ts
import { privateOpForRecipeTest } from "@mapgen/domain/foundation/ops/private";

export const recipeTestValue = privateOpForRecipeTest;

// @filename: mods/mod-swooper-maps/src/maps/__type_tests__/deep-import.test.ts
import type { PrivateRuleForMapTest } from "@mapgen/domain/hydrology/rules/private";

export type MapTestRule = PrivateRuleForMapTest;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import foundation from "@mapgen/domain/foundation/ops";

export const value = foundation;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import foundationRoot from "@mapgen/domain/foundation";

export const root = foundationRoot;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import config from "@mapgen/domain/foundation/config.js";

export const cfg = config;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import lookalike from "@mapgen/domain/foundation/ops-by-identity";

export const lookalikeValue = lookalike;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import extra from "@mapgen/domain/foundation/ops-by-id-extra";

export const extraValue = extra;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import nested from "@mapgen/domain/foundation/ops-by-id/private";

export const nestedValue = nested;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import prefixLookalike from "not-a-real-prefix@mapgen/domain/foundation/ops/private";

export const prefixLookalikeValue = prefixLookalike;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import protocolLookalike from "https://example.test/@mapgen/domain/foundation/ops/private";

export const protocolLookalikeValue = protocolLookalike;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/private.ts
import privateOp from "@mapgen/domain/foundation/ops/private";

export const domainValue = privateOp;

// @filename: test/domain-deep-import.test.ts
import privateOpForExternalTest from "@mapgen/domain/foundation/ops/private";

export const externalTestValue = privateOpForExternalTest;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import relativeDomain from "../../../../domain/foundation/ops/private/index.js";

export const relativeValue = relativeDomain;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
const source = "@mapgen/domain/foundation/ops/private";

export const sourceOnly = source;
```
