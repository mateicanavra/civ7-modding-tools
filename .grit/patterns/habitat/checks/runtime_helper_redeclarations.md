---
level: error
---
# Runtime Helper Redeclarations

Runtime layers use shared helpers from `@swooper/mapgen-core`.

```grit
language js(typescript)

or {
  `const clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function clamp01($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function clampChance($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function normalizeRange($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function rollPercent($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
function clamp01(value: number) {
  return value;
}
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
function clamp01(value: number) {
  return value;
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);
```
