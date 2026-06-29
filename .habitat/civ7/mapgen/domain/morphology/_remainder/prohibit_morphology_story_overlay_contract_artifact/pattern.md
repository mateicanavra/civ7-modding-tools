---
level: error
---
# Prohibit Morphology Story Overlay Contract Artifact

Morphology step contracts must not depend on story overlay artifacts.

```grit
language js(typescript)

contains r"artifact:storyOverlays" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/steps/.*contract\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo.contract.ts
export const dependency = "artifact:storyOverlays";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/demo.ts
export const dependency = "artifact:storyOverlays";
```
