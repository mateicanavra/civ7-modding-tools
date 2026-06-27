---
level: error
---
# Prohibit Legacy Morphology Effect Gating Tokens

Morphology stages and standard tags must not use retired engine landmass or
coastlines effect gates.

```grit
language js(typescript)

contains r"(?:landmassApplied|coastlinesApplied|effect:engine\.landmassApplied|effect:engine\.coastlinesApplied)" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/(?:stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/.*|tags\.ts)$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/demo.ts
const gate = "effect:engine.landmassApplied";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/demo.ts
const gate = "effect:engine.landmassApplied";
```
