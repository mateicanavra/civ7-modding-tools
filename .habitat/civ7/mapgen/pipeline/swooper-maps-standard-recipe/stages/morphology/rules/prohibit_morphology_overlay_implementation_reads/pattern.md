---
level: error
---
# Prohibit Morphology Overlay Implementation Reads

Morphology step runtime modules must not read overlay implementation modules.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology[^/]*/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" },
    $source <: r"^[\"']?(?:\.\.?/)+overlays\.js[\"']?$"
  },
  `readOverlay($arg)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology[^/]*/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo/step.ts
import { readOverlay } from "./overlays.js";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo/helpers/runtime.ts
import { readOverlay as readNestedOverlay } from "../overlays.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo/config.ts
import { readOverlay } from "./overlays.js";
```
