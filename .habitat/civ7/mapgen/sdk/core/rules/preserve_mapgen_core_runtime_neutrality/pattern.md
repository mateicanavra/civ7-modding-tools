---
level: error
---
# Preserve MapGen Core Runtime Neutrality

`mapgen-core` production source stays independent from Civ7 runtime APIs.

This Grit predicate owns static import and re-export edges. The pinned TypeScript
grammar presents runtime `import()` and `typeof import()` queries through the same
match abstraction, so dynamic-import enforcement remains outside this predicate
rather than rejecting compile-time import-type queries.

```grit
language js(typescript)

or {
  import_statement(source=$source) as $import where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $import <: contains import_clause()
  },
  `import {} from $source` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$"
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    $import <: r"^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s*(?:,|from\b)"
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $import <: includes "import type",
    $import <: contains namespace_import()
  },
  import_statement(source=$source) as $import where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $import <: includes "import type",
    $import <: contains import_specifier() as $specifier where {
      ! $specifier <: includes "type "
    }
  },
  `export { $exports } from $source` as $export where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $export <: includes "export type",
    $export <: contains export_specifier() as $specifier where {
      ! $specifier <: includes "type "
    }
  },
  `export {} from $source` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$"
  },
  `export * from $source` as $export where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $export <: includes "export type"
  },
  `export * as $namespace from $source` as $export where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$",
    $source <: r"^[\"']?(?:@civ7/adapter(?:/.+)?|/base-standard/.+)[\"']?$",
    ! $export <: includes "export type"
  },
  `GameplayMap` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `TerrainBuilder` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `ResourceBuilder` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `FeatureBuilder` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `AreaBuilder` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `MapConstructibles` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `GameInfo` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  `createCiv7Adapter` where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  },
  contains r"engine\s+as\s+unknown" where {
    $filename <: r".*packages/mapgen-core/src/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/mapgen-core/src/core/gameplay-map.ts
GameplayMap.getGridWidth();

// @filename: packages/mapgen-core/src/engine/terrain-builder.ts
TerrainBuilder.setTerrainType(0, 0, 1);

// @filename: packages/mapgen-core/src/core/resource-builder.ts
ResourceBuilder.setResourceType(0, 0, 1);

// @filename: packages/mapgen-core/src/core/feature-builder.ts
FeatureBuilder.setFeatureType(0, 0, 1);

// @filename: packages/mapgen-core/src/engine/area-builder.ts
AreaBuilder.recalculateAreas();

// @filename: packages/mapgen-core/src/core/constructibles.ts
MapConstructibles.addConstructible(0, 0, 1);

// @filename: packages/mapgen-core/src/engine/game-info.ts
GameInfo.Terrains.lookup("TERRAIN_GRASS");

// @filename: packages/mapgen-core/src/core/adapter-value.ts
import { EngineAdapter } from "@civ7/adapter";

export const adapter = EngineAdapter;

// @filename: packages/mapgen-core/src/engine/civ7.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const create = createCiv7Adapter;

// @filename: packages/mapgen-core/src/core/adapter-mapgen.ts
import { snapshotEngineHeightfield } from "@civ7/adapter/mapgen";

export const snapshot = snapshotEngineHeightfield;

// @filename: packages/mapgen-core/src/core/base-standard.ts
import { GameplayMap as BaseGameplayMap } from "/base-standard/maps/gameplay-map.js";

export const gameplayMap = BaseGameplayMap;

// @filename: packages/mapgen-core/src/engine/base-side-effect.ts
import "/base-standard/maps/gameplay-map.js";

// @filename: packages/mapgen-core/src/core/adapter-side-effect.ts
import "@civ7/adapter";

// @filename: packages/mapgen-core/src/core/adapter-empty-import.ts
import {} from "@civ7/adapter";

// @filename: packages/mapgen-core/src/core/base-empty-import.ts
import {} from "/base-standard/maps/gameplay-map.js";

// @filename: packages/mapgen-core/src/core/adapter-mixed.ts
import { EngineRuntime, type EngineAdapterType } from "@civ7/adapter";

export const mixedRuntime = EngineRuntime;
export type MixedAdapter = EngineAdapterType;

// @filename: packages/mapgen-core/src/core/adapter-type-first-mixed.ts
import { type EngineAdapterType, EngineRuntime } from "@civ7/adapter/mapgen";

export const typeFirstRuntime = EngineRuntime;
export type TypeFirstAdapter = EngineAdapterType;

// @filename: packages/mapgen-core/src/core/adapter-default.ts
import adapter from "@civ7/adapter";

export const defaultAdapter = adapter;

// @filename: packages/mapgen-core/src/core/adapter-namespace.ts
import * as adapter from "@civ7/adapter/mapgen";

export const namespaceAdapter = adapter;

// @filename: packages/mapgen-core/src/core/adapter-reexport.ts
export { EngineRuntime, type EngineAdapterType } from "@civ7/adapter";

// @filename: packages/mapgen-core/src/core/adapter-type-first-reexport.ts
export { type EngineAdapterType, EngineRuntime } from "@civ7/adapter/mapgen";

// @filename: packages/mapgen-core/src/core/adapter-export-all.ts
export * from "@civ7/adapter";

// @filename: packages/mapgen-core/src/core/adapter-export-namespace.ts
export * as adapter from "@civ7/adapter/mapgen";

// @filename: packages/mapgen-core/src/core/base-reexport.ts
export { GameplayMap } from "/base-standard/maps/gameplay-map.js";

// @filename: packages/mapgen-core/src/core/adapter-empty-reexport.ts
export {} from "@civ7/adapter/mapgen";

// @filename: packages/mapgen-core/src/core/base-empty-reexport.ts
export {} from "/base-standard/maps/gameplay-map.js";

// @filename: packages/mapgen-core/src/core/base-export-all.ts
export * from "/base-standard/maps/gameplay-map.js";

```

## Ignores fixture

```typescript
// @filename: packages/mapgen-core/src/core/demo.ts
export const pure = 1;

// @filename: packages/mapgen-core/src/core/type-edge.ts
import type { EngineAdapter as EngineAdapterType } from "@civ7/adapter";

export type CoreAdapter = EngineAdapterType;

// @filename: packages/mapgen-core/src/core/inline-type-edge.ts
import { type EngineAdapter as EngineAdapterType } from "@civ7/adapter";

export type InlineCoreAdapter = EngineAdapterType;

// @filename: packages/mapgen-core/src/core/type-subpath-edge.ts
import type { EngineHeightfieldSnapshot } from "@civ7/adapter/mapgen";

export type CoreEngineHeightfieldSnapshot = EngineHeightfieldSnapshot;

// @filename: packages/mapgen-core/src/core/inline-types-edge.ts
import {
  type EngineAdapter as EngineAdapterType,
  type EngineHeightfieldSnapshot,
} from "@civ7/adapter/mapgen";

export type CoreAdapterTypes = EngineAdapterType & EngineHeightfieldSnapshot;

// @filename: packages/mapgen-core/src/core/type-reexport-edge.ts
export type { EngineAdapter as EngineAdapterType } from "@civ7/adapter";

// @filename: packages/mapgen-core/src/core/inline-type-reexport-edge.ts
export { type EngineHeightfieldSnapshot } from "@civ7/adapter/mapgen";

// @filename: packages/mapgen-core/src/core/type-import-query-edge.ts
export type AdapterModule = typeof import("@civ7/adapter/mapgen");

// @filename: packages/mapgen-core/test/core/demo.ts
import { EngineAdapter as TestAdapter } from "@civ7/adapter";

export const testAdapter = TestAdapter;

// @filename: packages/mapgen-core/src/core/demo.tsx
import { EngineAdapter as TsxAdapter } from "@civ7/adapter";

export const tsxAdapter = TsxAdapter;

// @filename: packages/other/src/core/demo.ts
GameplayMap.getGridWidth();

// @filename: packages/mapgen-core/src/core/source-lookalike.ts
import { EngineAdapter as LookalikeAdapter } from "@civ7/adapterish";

export const lookalikeAdapter = LookalikeAdapter;

// @filename: packages/mapgen-core/src/core/base-lookalike.ts
import { MapLike } from "/base-standardish/maps/gameplay-map.js";

export const baseLookalike = MapLike;

// @filename: packages/mapgen-core/src/core/global-name-lookalike.ts
export interface GameplayMapLike {
  getGridWidth(): number;
}

export const TerrainBuilderName = "TerrainBuilder";
```
