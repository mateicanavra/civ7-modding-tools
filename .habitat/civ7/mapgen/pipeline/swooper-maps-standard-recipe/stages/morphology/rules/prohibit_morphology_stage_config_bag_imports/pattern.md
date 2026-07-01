---
level: error
---
# Prohibit Morphology Stage Config Bag Imports

Morphology stage files must not reach into the domain config bag.

```grit
language js(typescript)

or {
  `import { $imports } from "@mapgen/domain/config"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import type { $imports } from "@mapgen/domain/config"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import $default from "@mapgen/domain/config"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import * as $namespace from "@mapgen/domain/config"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import "@mapgen/domain/config"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import { $imports } from "@mapgen/domain/config.js"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import type { $imports } from "@mapgen/domain/config.js"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import $default from "@mapgen/domain/config.js"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import * as $namespace from "@mapgen/domain/config.js"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" },
  `import "@mapgen/domain/config.js"` where { $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/demo.ts
import { config } from "@mapgen/domain/config";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/demo.ts
import { config } from "@mapgen/domain/config";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/demo.ts
import type { Config } from "@mapgen/domain/config.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/demo.ts
import { config } from "@mapgen/domain/config";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/demo.ts
import { MorphologyShelfWidthKnobSchema } from "@mapgen/domain/morphology/config.js";
```
