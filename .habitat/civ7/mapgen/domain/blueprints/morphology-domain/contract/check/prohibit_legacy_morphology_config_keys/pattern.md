---
level: error
---
# Prohibit Legacy Morphology Config Keys

Map source and standard-run tests must not reintroduce legacy morphology config
keys.

```grit
language js(typescript)

or {
  contains r"\blandmass\s*:" where {
    $filename <: r".*mods/mod-swooper-maps/(?:src/maps/.*|test/standard-run\.test\.ts)$"
  },
  contains r"\boceanSeparation\s*:" where {
    $filename <: r".*mods/mod-swooper-maps/(?:src/maps/.*|test/standard-run\.test\.ts)$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export const config = { landmass: "legacy" };
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export const config = { landmass: "legacy" };
```
