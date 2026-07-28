---
level: error
---
# Prohibit Runtime-Local Config Default Merging

Runtime recipe steps and domain ops must not hide config normalization behind
local empty-object merge/default syntax.

```grit
language js(typescript)

or {
  `$value ?? {}` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `Value.Default($args)` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `$value ?? {}` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*\.ts$"
  },
  `Value.Default($args)` where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
const config = input.config ?? {};

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/helpers/runtime.ts
const helperConfig = input.config ?? {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const config = opConfig ?? {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/strategies/balanced/index.ts
const config = strategyConfig ?? {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const schema = Value.Default(schemaNode);
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/index.ts
const config = stageConfig ?? {};

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/config.ts
const config = input.config ?? {};

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.tsx
const config = input.config ?? {};

// @filename: apps/not-a-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
const config = input.config ?? {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const config = input.config ?? { fallback: true };

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const config = input.config || {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const schema = defaults.Value.Default(schemaNode);

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const source = "config ?? {}";
```
