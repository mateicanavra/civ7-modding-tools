---
level: error
---
# Prohibit Domain Ops Projection Effect Dependencies

Domain ops should not encode map projection/effect dependency keys.

```grit
language js(typescript)

or {
  `"artifact:map.$suffix"` where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  },
  `"effect:map.$suffix"` where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const key = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const effectKey = "effect:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const singleQuotedKey = 'artifact:map.foo';

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const dependencies = ["artifact:map.foo"];

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const dependencyRecord = { "artifact:map.foo": true };

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import projectedArtifact from "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export { projectedArtifact } from "effect:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
await import("artifact:map.foo");
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const key = "artifact:terrain.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const ownedArtifact = "artifact:ecology.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const ownedEffect = "effect:ecology.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const noSuffix = "artifact:map";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const prefixLookalike = "artifact:mapper.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/model/policy/habitat.ts
export const nonOpKey = "artifact:map.foo";

// @filename: mods/other-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const otherModKey = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.tsx
export const tsxKey = "artifact:map.foo";

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/biosphere/ecology/steps/estimate-habitat/step.ts
export const recipeKey = "artifact:map.foo";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const templateKey = `artifact:map.foo`;
```
