---
level: error
---
# MapGen Core Runtime Civ7

`mapgen-core` core/engine source stays independent from Civ7 runtime APIs.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$",
    $source <: r"^(?:@civ7/adapter(?:/civ7)?|/base-standard/.+)$"
  },
  `import $source` where {
    $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$",
    $source <: r"^/base-standard/.+"
  },
  `GameplayMap.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `TerrainBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `ResourceBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `FeatureBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `AreaBuilder.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `MapConstructibles.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" },
  `GameInfo.$member` where { $filename <: r".*packages/mapgen-core/src/(?:core|engine)/.*\.ts$" }
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
```

## Ignores fixture

```typescript
// @filename: packages/mapgen-core/src/core/demo.ts
export const pure = 1;

// Current predicate gap: intended forbidden import classes do not report under
// the existing import-source regex.
// @filename: packages/mapgen-core/src/core/adapter-value.ts
import { EngineAdapter } from "@civ7/adapter";

export const adapter = EngineAdapter;

// @filename: packages/mapgen-core/src/engine/civ7.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const create = createCiv7Adapter;

// @filename: packages/mapgen-core/src/core/base-standard.ts
import { GameplayMap as BaseGameplayMap } from "/base-standard/maps/gameplay-map.js";

export const gameplayMap = BaseGameplayMap;

// @filename: packages/mapgen-core/src/engine/base-side-effect.ts
import "/base-standard/maps/gameplay-map.js";

// @filename: packages/mapgen-core/src/core/type-edge.ts
import type { EngineAdapter as EngineAdapterType } from "@civ7/adapter";

export type CoreAdapter = EngineAdapterType;

// @filename: packages/mapgen-core/src/authoring/demo.ts
import { EngineAdapter } from "@civ7/adapter";

export const authoringAdapter = EngineAdapter;

// @filename: packages/mapgen-core/src/adapter/demo.ts
import { createCiv7Adapter } from "@civ7/adapter/civ7";

export const adapterCreate = createCiv7Adapter;

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
