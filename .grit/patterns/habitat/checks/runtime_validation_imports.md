---
level: error
---
# Runtime Validation Imports

Runtime layers do not import TypeBox or compiler validation helpers.

```grit
language js(typescript)

or {
  `import $imports from "@sinclair/typebox/value"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `import $imports from "@sinclair/typebox/compiler"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/compiler/normalize"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/validation"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `import $imports from "@swooper/mapgen-core/authoring/op/validation-surface"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
import { Value } from "@sinclair/typebox/value";

export const value = Value;
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
import { Value } from "@sinclair/typebox/value";

export const value = Value;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);
```
