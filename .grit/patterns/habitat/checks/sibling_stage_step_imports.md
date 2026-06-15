---
level: error
---
# Sibling Stage Step Imports

Stage code must not import another stage's private `steps/` implementation.

```grit
language js(typescript)

`import $imports from $source` where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
  $source <: r".*\.\./[^/]+/steps/.*"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import step from "../b/steps/foo/index.js";

export const value = step;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/index.ts
export default {};
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import step from "../b/steps/foo/index.js";

export const value = step;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/b/steps/foo/index.ts
export default {};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/index.ts
import step from "./steps/foo/index.js";

export const value = step;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/a/steps/foo/index.ts
export default {};
```
