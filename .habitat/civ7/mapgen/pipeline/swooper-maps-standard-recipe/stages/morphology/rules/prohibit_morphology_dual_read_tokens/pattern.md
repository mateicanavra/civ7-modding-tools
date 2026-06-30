---
level: error
---
# Prohibit Morphology Dual Read Tokens

Morphology coasts step source must not reintroduce dual-read migration tokens.

```grit
language js(typescript)

or {
  contains r"\bmorphology\.dualRead\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/.*\.ts$"
  },
  contains r"\bdualRead\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/demo.ts
const value = morphology.dualRead;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/demo.ts
const value = morphology.dualRead;
```
