---
level: error
---
# Prohibit Morphology Stage Config Facade Imports

Morphology stage files must not reach into root or morphology config facades.
Reusable morphology policy belongs under `@mapgen/domain/morphology/model/policy`;
operation contracts belong under `@mapgen/domain/morphology/ops`; stage authoring
helpers stay stage-local.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/(?:config(?:\.js)?|morphology/config\.js)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/(?:config(?:\.js)?|morphology/config\.js)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology(?:-[^/]+)?/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/(?:config(?:\.js)?|morphology/config\.js)[\"']?$"
  }
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

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/demo.ts
import { MorphologyShelfWidthKnobSchema } from "@mapgen/domain/morphology/config.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/demo.ts
import { config } from "@mapgen/domain/config";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/demo.ts
import { MORPHOLOGY_SHELF_WIDTH_MULTIPLIER } from "@mapgen/domain/morphology/model/policy/shelf-knob-policy.js";
```
