---
level: error
---
# Restrict Recipes To Public Domain Surfaces

Recipes may import only the domain root, `/ops`, or `/config.js` public surfaces.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops|config\.js)[\"']?$",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id[\"']|rules/.+|strategies/.+)"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops|config\.js)[\"']?$",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id[\"']|rules/.+|strategies/.+)"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops|config\.js)[\"']?$",
    ! $source <: r".*@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id[\"']|rules/.+|strategies/.+)"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/shared/private";

export const value = rule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-named.ts
import { buildRule } from "@mapgen/domain/foundation/shared/private";

export const named = buildRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-namespace.ts
import * as strategy from "@mapgen/domain/foundation/shared/private";

export const namespaceValue = strategy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-type.ts
import type { PrivateRule } from "@mapgen/domain/foundation/types.js";

export type DemoRule = PrivateRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-side-effect.ts
import "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export.ts
export { buildRule } from "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export-type.ts
export { type PrivateRule } from "@mapgen/domain/foundation/types.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export-star.ts
export * from "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/__tests__/demo.test.ts
import testRule from "@mapgen/domain/foundation/shared/private";

export const testValue = testRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo/steps/build/contract.ts
import contractRule from "@mapgen/domain/foundation/shared/private";

export const contractValue = contractRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-ops-lookalikes.ts
import opsPrivate from "@mapgen/domain/foundation/ops-private";
import privateOpsPath from "@mapgen/domain/foundation/private/ops";

export const opsLookalikes = [opsPrivate, privateOpsPath];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-config-tail.ts
import privateConfig from "@mapgen/domain/foundation/config.js/private";

export const privateConfigValue = privateConfig;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-config-lookalikes.ts
import configPrivate from "@mapgen/domain/foundation/config.js-private";
import privateConfigPath from "@mapgen/domain/foundation/private/config.js";

export const configLookalikes = [configPrivate, privateConfigPath];
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/shared/private";

export const value = rule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-named.ts
import { buildRule } from "@mapgen/domain/foundation/shared/private";

export const named = buildRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-namespace.ts
import * as strategy from "@mapgen/domain/foundation/shared/private";

export const namespaceValue = strategy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-type.ts
import type { PrivateRule } from "@mapgen/domain/foundation/types.js";

export type DemoRule = PrivateRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-side-effect.ts
import "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export.ts
export { buildRule } from "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export-type.ts
export { type PrivateRule } from "@mapgen/domain/foundation/types.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-export-star.ts
export * from "@mapgen/domain/foundation/shared/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/__tests__/demo.test.ts
import testRule from "@mapgen/domain/foundation/shared/private";

export const testValue = testRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo/steps/build/contract.ts
import contractRule from "@mapgen/domain/foundation/shared/private";

export const contractValue = contractRule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-ops-lookalikes.ts
import opsPrivate from "@mapgen/domain/foundation/ops-private";
import privateOpsPath from "@mapgen/domain/foundation/private/ops";

export const opsLookalikes = [opsPrivate, privateOpsPath];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-config-tail.ts
import privateConfig from "@mapgen/domain/foundation/config.js/private";

export const privateConfigValue = privateConfig;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-config-lookalikes.ts
import configPrivate from "@mapgen/domain/foundation/config.js-private";
import privateConfigPath from "@mapgen/domain/foundation/private/config.js";

export const configLookalikes = [configPrivate, privateConfigPath];
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import config from "@mapgen/domain/foundation/config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-root.ts
import foundation from "@mapgen/domain/foundation";

export const rootValue = foundation;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-ops.ts
import ops from "@mapgen/domain/foundation/ops";

export const opsValue = ops;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-ops-tail.ts
import privateOps from "@mapgen/domain/foundation/ops/private";

export const privateOpsValue = privateOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-ops-by-id.ts
import opsById from "@mapgen/domain/foundation/ops-by-id";

export const opsByIdValue = opsById;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-config-tail.ts
import rulesPrivate from "@mapgen/domain/foundation/rules/private";

export const rulesValue = rulesPrivate;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo-strategies-tail.ts
import strategiesPrivate from "@mapgen/domain/foundation/strategies/private";

export const strategiesValue = strategiesPrivate;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.tsx
import tsxRule from "@mapgen/domain/foundation/shared/private";

export const tsxValue = tsxRule;

// @filename: mods/mod-swooper-maps/src/maps/standard/demo.ts
import mapRule from "@mapgen/domain/foundation/shared/private";

export const mapValue = mapRule;

// @filename: mods/other-mod/src/recipes/standard/stages/demo.ts
import otherModRule from "@mapgen/domain/foundation/shared/private";

export const otherModValue = otherModRule;

// @filename: mods/mod-swooper-maps/src/domain/foundation/__tests__/demo.ts
import domainTestRule from "@mapgen/domain/foundation/shared/private";

export const domainTestValue = domainTestRule;
```
