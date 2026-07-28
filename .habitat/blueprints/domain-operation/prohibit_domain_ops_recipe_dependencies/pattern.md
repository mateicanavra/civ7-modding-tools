---
level: error
---
# Prohibit Domain Operation Recipe Dependencies

A domain operation consumes its admitted contract data and domain model. Recipe projection
artifacts and completion ids represent runtime orchestration, so importing or naming either inside
an operation would reverse that ownership and couple reusable domain behavior to one recipe.

```grit
language js(typescript)

or {
  `"artifact:map.$suffix"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  },
  `"completion:$suffix"` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const key = "artifact:map.foo";

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const singleQuotedKey = 'artifact:map.foo';

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const dependencies = ["artifact:map.foo"];

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import projectedArtifact from "artifact:map.foo";

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const completion = "completion:map.foo";
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export const ownedArtifact = "artifact:ecology.foo";

// @filename: plugins/mod/map/example-mod/src/recipes/sample/stages/ecology/steps/project/step.ts
export const recipeProjection = "artifact:map.foo";

// @filename: plugins/mod/map/example-mod/src/recipes/sample/stages/ecology/steps/project/step.ts
export const recipeCompletion = "completion:map.foo";
```
