---
level: error
---
# Enforce Adapter-Only Base-Standard Imports

Runtime `/base-standard/` imports belong only in `@civ7/adapter`.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*packages/.*\.ts$",
    ! $filename <: includes "packages/civ7-adapter/",
    $source <: r".*/base-standard/.+"
  },
  `import $source` where {
    $filename <: r".*packages/.*\.ts$",
    ! $filename <: includes "packages/civ7-adapter/",
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

// @filename: packages/example/src/types.ts
import type { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/runtime.d.ts
import { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/source-prefix.ts
import { TerrainBuilder } from "Base/modules/base-standard/maps/map-globals.js";
```

## Ignores fixture

```typescript
// @filename: packages/civ7-adapter/src/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/demo.tsx
import "/base-standard/maps/map-globals.js";

// @filename: apps/example/src/demo.ts
import "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/source-lookalike.ts
import "base-standard/maps/map-globals.js";

// @filename: packages/example/src/string-lookalike.ts
const source = "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/export-from.ts
export { GameplayMap } from "/base-standard/maps/map-globals.js";

// @filename: packages/example/src/dynamic.ts
await import("/base-standard/maps/map-globals.js");
```
