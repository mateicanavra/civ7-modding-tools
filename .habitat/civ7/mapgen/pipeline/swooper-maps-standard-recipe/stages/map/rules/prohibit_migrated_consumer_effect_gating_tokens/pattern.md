---
level: error
---
# Prohibit Migrated Consumer Effect Gating Tokens

The migrated map-hydrology consumer `StepContract` config module must not
depend on retired morphology or engine effect gates.

```grit
language js(typescript)

contains r"(?:STANDARD_ENGINE_EFFECT_TAGS\.engine\.(?:coastlinesApplied|landmassApplied)|morphologyArtifacts\.topography)" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes/config\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes/config.ts
const gate = STANDARD_ENGINE_EFFECT_TAGS.engine.coastlinesApplied;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/rivers/config.ts
const gate = STANDARD_ENGINE_EFFECT_TAGS.engine.coastlinesApplied;
```
