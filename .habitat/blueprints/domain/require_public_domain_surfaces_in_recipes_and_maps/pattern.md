---
level: error
---
# Require Public Domain Surfaces In Recipes

Recipe source must use public domain surfaces, not deep domain internals.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops|ops/index\.js|config\.js)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops|ops/index\.js|config\.js)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops|ops/index\.js|config\.js)[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/shared/private";

export const value = rule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import privateOps from "@mapgen/domain/foundation/ops/private";

export const opsValue = privateOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { byId } from "@mapgen/domain/foundation/ops-by-id";

export const lookup = byId;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export { privateRule } from "@mapgen/domain/ecology/rules/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { isAnyRiverClass } from "../../../../domain/hydrology/index.js";

export const relativeValue = isAnyRiverClass;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/climateRefine.ts
import { isMajorRiverClass } from "../../../../../domain/hydrology/index.js";

export const major = isMajorRiverClass;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import foundation from "@mapgen/domain/foundation";

export const rootValue = foundation;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import ops from "@mapgen/domain/foundation/ops";

export const opsValue = ops;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import config from "@mapgen/domain/foundation/config.js";

export const configValue = config;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import opsIndex from "@mapgen/domain/foundation/ops/index.js";

export const opsIndexValue = opsIndex;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/private.ts
import privateOp from "@mapgen/domain/foundation/ops/private";

export const domainValue = privateOp;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
const source = "../../../../domain/hydrology/index.js";

export const sourceOnly = source;
```
