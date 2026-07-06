---
level: error
---
# Require Morphology Public Surface Imports

Consumer source must use morphology public surfaces, not deep morphology
internals. Allowed morphology sub-surfaces are `ops`, `artifacts`,
`model/schemas`, and `model/policy`; retired config facades are not public
composition surfaces.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/morphology/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/morphology/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/morphology/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/morphology/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*\.ts$",
    ! $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/morphology/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/morphology/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import { build } from "@mapgen/domain/morphology/mountains";

// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export { build } from "@mapgen/domain/morphology/landmass";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import config from "@mapgen/domain/morphology/config.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import { build } from "@mapgen/domain/morphology";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import ops from "@mapgen/domain/morphology/ops";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import policy from "@mapgen/domain/morphology/model/policy/coast-knob-policy.js";

// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/index.ts
import internal from "@mapgen/domain/morphology/ops/private";
```
