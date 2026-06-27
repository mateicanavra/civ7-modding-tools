---
level: error
---
# Prohibit Runtime Continent Contract Tokens

Morphology contract surfaces must not depend on runtime continent identifiers.

```grit
language js(typescript)

or {
  contains r"\bwestContinent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology/artifacts\.ts|(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/steps/.*(?:contract|artifacts)\.ts)$"
  },
  contains r"\beastContinent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology/artifacts\.ts|(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/steps/.*(?:contract|artifacts)\.ts)$"
  },
  contains r"\bLandmassRegionId\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology/artifacts\.ts|(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/steps/.*(?:contract|artifacts)\.ts)$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts
const region: LandmassRegionId = westContinent;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts
const region: LandmassRegionId = westContinent;
```
