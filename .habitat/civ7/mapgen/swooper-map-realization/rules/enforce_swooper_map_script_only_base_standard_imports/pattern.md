---
level: error
---
# Enforce Swooper Map-Script-Only Base-Standard Imports

Runtime `/base-standard/` imports belong only in the deployable Swooper
map-script realization. Generated `@civ7/api` declarations remain static
evidence rather than a runtime owner.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  },
  `import $source` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  },
  `export { $exports } from $source` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  },
  `export type { $exports } from $source` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  },
  `export * from $source` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  },
  `import($source)` where {
    $filename <: r".*(?:apps/.*|packages/.*|plugins/.*)\.tsx?$",
    ! $filename <: includes "apps/mods/map/swooper-physics/src/runtime/map-script/",
    ! $filename <: includes "packages/civ7-api/src/generated/",
    $source <: r".*/base-standard/.+"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/example/src/runtime.ts
import { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: apps/example/src/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: packages/civ7-adapter/src/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/types.ts
import type { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/runtime.d.ts
import { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/civ7-api/src/catalog.ts
import { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/source-prefix.ts
import { TerrainBuilder } from "Base/modules/base-standard/maps/map-globals.js";

// @filename: plugins/cli/topics/example/src/commands/example/runtime.ts
import { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/demo.tsx
import "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/export-from.ts
export { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/dynamic.ts
await import("/base-standard/maps/map-globals.js");
```

## Ignores fixture

```typescript
// @filename: apps/mods/map/swooper-physics/src/runtime/map-script/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: packages/civ7-api/src/generated/modules/map-globals.d.ts
import type { MapLike } from "/base-standard/maps/map-like.js";

// @filename: plugins/cli/topics/example/test/commands/example/runtime.test.ts
const source = "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/source-lookalike.ts
import "base-standard/maps/map-globals.js";

// @filename: packages/example/src/string-lookalike.ts
const source = "/base-standard/maps/map-globals.js";

```
