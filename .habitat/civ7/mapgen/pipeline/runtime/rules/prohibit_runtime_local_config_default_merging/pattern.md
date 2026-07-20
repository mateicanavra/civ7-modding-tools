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
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `Value.Default($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `$value ?? {}` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `Value.Default($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
const config = input.config ?? {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/helpers/runtime.ts
const helperConfig = input.config ?? {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const config = opConfig ?? {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
const config = strategyConfig ?? {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const schema = Value.Default(schemaNode);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts
const config = stageConfig ?? {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.ts
const config = input.config ?? {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.tsx
const config = input.config ?? {};

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot/step.ts
const config = input.config ?? {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const config = input.config ?? { fallback: true };

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const config = input.config || {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const schema = defaults.Value.Default(schemaNode);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const source = "config ?? {}";
```
