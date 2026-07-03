---
level: error
---
# Prohibit Runtime Continent Step Tokens

Morphology and hydrology step implementation files must not reintroduce runtime
continent identifiers or direct landmass marking calls.

```grit
language js(typescript)

or {
  contains r"\bwestContinent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline/steps)/.*\.ts$"
  },
  contains r"\beastContinent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline/steps)/.*\.ts$"
  },
  contains r"\bLandmassRegionId\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline/steps)/.*\.ts$"
  },
  contains r"\bmarkLandmassId\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features|hydrology-climate-baseline/steps)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts
markLandmassId(tile, westContinent);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts
markLandmassId(tile, westContinent);
```
