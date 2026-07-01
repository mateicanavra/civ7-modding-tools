---
level: error
---
# Prohibit Morphology Overlay Implementation Reads

Morphology non-contract step implementation files must not read overlay
implementation modules.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology[^/]*/steps/.*\.ts$",
    not { $filename <: r".*contract\.ts$" },
    $source <: r"^[\"']?\./overlays\.js[\"']?$"
  },
  `readOverlay($arg)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology[^/]*/steps/.*\.ts$",
    not { $filename <: r".*contract\.ts$" }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo.ts
import { readOverlay } from "./overlays.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo.contract.ts
import { readOverlay } from "./overlays.js";
```
