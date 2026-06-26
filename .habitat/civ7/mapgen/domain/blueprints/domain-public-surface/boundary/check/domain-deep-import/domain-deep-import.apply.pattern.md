---
level: none
---
# Deep Import To Public Surface

Mechanically rewrites domain ops deep imports to the public ops surface.

```grit
language js(typescript)

or {
  `import type $imports from "@mapgen/domain/$domain/ops/$tail"` => `import type $imports from "@mapgen/domain/$domain/ops"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$"
  },
  `import $imports from "@mapgen/domain/$domain/ops/$tail"` as $import => `import $imports from "@mapgen/domain/$domain/ops"` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$",
    ! $import <: `import type $type_imports from "@mapgen/domain/$domain/ops/$tail"`
  }
}
```

## Rewrites recipe domain ops deep imports

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { demoOp } from "@mapgen/domain/ecology/ops/private-op";
import type { DemoInput } from "@mapgen/domain/ecology/ops/private-types";

export const demo = (input: DemoInput) => demoOp(input);
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { demoOp } from "@mapgen/domain/ecology/ops"
import type { DemoInput } from "@mapgen/domain/ecology/ops"

export const demo = (input: DemoInput) => demoOp(input);
```
