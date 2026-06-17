---
level: error
---
# Domain Ops Projection Effects

Domain ops should not encode map projection/effect dependency keys.

```grit
language js(typescript)

or {
  `"artifact:map.$suffix"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `"effect:map.$suffix"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const key = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const effectKey = "effect:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const singleQuotedKey = 'artifact:map.foo';

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const dependencies = ["artifact:map.foo"];

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const dependencyRecord = { "artifact:map.foo": true };

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import projectedArtifact from "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export { projectedArtifact } from "effect:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("artifact:map.foo");
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const key = "artifact:terrain.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const ownedArtifact = "artifact:ecology.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const ownedEffect = "effect:ecology.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const noSuffix = "artifact:map";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const prefixLookalike = "artifact:mapper.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts
export const nonOpKey = "artifact:map.foo";

// @filename: mods/other-mod/src/domain/ecology/ops/demo/index.ts
export const otherModKey = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.tsx
export const tsxKey = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/demo.ts
export const recipeKey = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const templateKey = `artifact:map.foo`;
```
