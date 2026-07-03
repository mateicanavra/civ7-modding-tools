---
level: error
---
# Ensure Map Policy Dependency Independence

`@civ7/map-policy` owns pure resource-derived policy facts. Its source must not
import adapter, MapGen, mod, Studio, or base-standard implementation surfaces.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*packages/civ7-map-policy/src/.*\.ts$",
    $source <: r".*(?:@civ7/adapter(?:/|[\"'])|@swooper/mapgen-core(?:/|[\"'])|mod-swooper-maps(?:/|[\"'])|mapgen-studio(?:/|[\"'])|/base-standard/).*"
  },
  `import $source` where {
    $filename <: r".*packages/civ7-map-policy/src/.*\.ts$",
    $source <: r".*(?:@civ7/adapter(?:/|[\"'])|@swooper/mapgen-core(?:/|[\"'])|mod-swooper-maps(?:/|[\"'])|mapgen-studio(?:/|[\"'])|/base-standard/).*"
  },
  `export { $exports } from $source` where {
    $filename <: r".*packages/civ7-map-policy/src/.*\.ts$",
    $source <: r".*(?:@civ7/adapter(?:/|[\"'])|@swooper/mapgen-core(?:/|[\"'])|mod-swooper-maps(?:/|[\"'])|mapgen-studio(?:/|[\"'])|/base-standard/).*"
  },
  `export * from $source` where {
    $filename <: r".*packages/civ7-map-policy/src/.*\.ts$",
    $source <: r".*(?:@civ7/adapter(?:/|[\"'])|@swooper/mapgen-core(?:/|[\"'])|mod-swooper-maps(?:/|[\"'])|mapgen-studio(?:/|[\"'])|/base-standard/).*"
  },
  `import($source)` where {
    $filename <: r".*packages/civ7-map-policy/src/.*\.ts$",
    $source <: r".*(?:@civ7/adapter(?:/|[\"'])|@swooper/mapgen-core(?:/|[\"'])|mod-swooper-maps(?:/|[\"'])|mapgen-studio(?:/|[\"'])|/base-standard/).*"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/civ7-map-policy/src/demo.ts
import { adapter } from "@civ7/adapter/civ7";

// @filename: packages/civ7-map-policy/src/demo.ts
import type { Recipe } from "@swooper/mapgen-core";

// @filename: packages/civ7-map-policy/src/demo.ts
import "mod-swooper-maps/recipes/standard";

// @filename: packages/civ7-map-policy/src/demo.ts
export { studio } from "mapgen-studio/server";

// @filename: packages/civ7-map-policy/src/demo.ts
export * from "/base-standard/maps/map-globals.js";

// @filename: packages/civ7-map-policy/src/demo.ts
await import("@swooper/mapgen-core/authoring");
```

## Ignores fixture

```typescript
// @filename: packages/civ7-map-policy/src/demo.ts
import { TerrainClass } from "./types.js";

// @filename: packages/civ7-map-policy/src/demo.ts
import type { PolicyGrid } from "./policy-grid.js";

// @filename: packages/civ7-map-policy/test/demo.ts
import { adapter } from "@civ7/adapter/civ7";

// @filename: packages/civ7-map-policy/src/demo.ts
const source = "@swooper/mapgen-core";
```
