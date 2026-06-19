---
level: error
---

# Relative Domain Imports

Recipe and map source must use named domain public surfaces, not relative
paths into local `src/domain/**`.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/maps/[^/]+\.tsx?$",
    $source <: r"^[\"']?\.\./domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/maps/[^/]+\.tsx?$",
    $source <: r"^[\"']?\.\./domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){4}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){5}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/[^/]+\.tsx?$",
    $source <: r"^[\"']?(?:\.\./){6}domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/maps/[^/]+\.tsx?$",
    $source <: r"^[\"']?\.\./domain/[^\"']+[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { isAnyRiverClass } from "../../../../domain/hydrology/index.js";

export const value = isAnyRiverClass;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/climateRefine.ts
import { isMajorRiverClass } from "../../../../../domain/hydrology/index.js";

export const major = isMajorRiverClass;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/type-only.ts
import type { OfficialResourceType } from "../../../../domain/resources/lib/corpus/types.js";

export type Value = OfficialResourceType;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/register.ts
import "../../../../domain/hydrology/register.js";

// @filename: mods/mod-swooper-maps/src/maps/demo.ts
import * as hydrology from "../domain/hydrology/index.js";

export const value = hydrology;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/export-named.ts
export { isAnyRiverClass } from "../../../../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/maps/export-star.ts
export * from "../domain/resources/index.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { isAnyRiverClass } from "@mapgen/domain/hydrology";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { hydrologyArtifacts } from "../hydrology/artifacts.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { helper } from "../../../../domains/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { helper } from "../../../../domainish/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { sameStageDomain } from "../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/demo.ts
import { sameStageDomain } from "../../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/demo/index.ts
import { sameStageDomain } from "../../../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { isAnyRiverClass } from "../../../hydrology/index.js";

// @filename: mods/mod-swooper-maps/test/ecology/demo.test.ts
import { isAnyRiverClass } from "../src/domain/hydrology/index.js";

// @filename: packages/mapgen-core/src/recipes/demo.ts
import { isAnyRiverClass } from "../../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
const source = "../../../../domain/hydrology/index.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
await import("../../../../domain/hydrology/index.js");
```
```
