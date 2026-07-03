---
level: error
---
# Prohibit Legacy Plate Driver And Plot Mountains Dependencies

Morphology contracts and plot-mountains source must not depend on retired plate
driver artifacts.

```grit
language js(typescript)

or {
  contains r"mapArtifacts\.foundationPlates" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates\.contract\.ts$"
  },
  contains r"mapArtifacts\.foundation(?:TectonicHistoryTiles|TectonicProvenanceTiles|Plates)" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains\.contract\.ts$"
  },
  contains r"\bfoundationPlates\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains\.ts$"
  },
  contains r"\bfoundationArtifacts\.plates\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains.contract.ts
const dependency = mapArtifacts.foundationPlates;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains.contract.ts
const dependency = morphologyArtifacts.beltDrivers;
```
