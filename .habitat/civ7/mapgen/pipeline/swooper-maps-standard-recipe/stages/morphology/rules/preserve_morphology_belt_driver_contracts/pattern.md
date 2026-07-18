---
level: error
---
# Preserve Morphology Belt Driver Contracts

Morphology coasts derive belt drivers from the canonical Standard foundation
tile products. Mountain planning consumes the Morphology-owned belt-driver
artifact rather than rebuilding a direct Foundation dependency.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `standardArtifacts.foundationCrustTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `standardArtifacts.foundationTectonicHistoryTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `standardArtifacts.foundationTectonicProvenanceTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `morphologyArtifactModules.beltDrivers`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config\.ts$",
    ! $body <: contains `morphologyArtifacts.beltDrivers`
  },
  `standardArtifacts.foundationPlates` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config\.ts$"
  },
  or {
    `standardArtifacts.foundationTectonicHistoryTiles`,
    `standardArtifacts.foundationTectonicProvenanceTiles`,
    `standardArtifacts.foundationPlates`
  } where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts
const artifacts = {
  requires: [standardArtifacts.foundationPlates],
  provides: [morphologyArtifacts.topography],
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts
const artifacts = {
  requires: [standardArtifacts.foundationTectonicHistoryTiles],
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts
const artifacts = {
  requires: [
    standardArtifacts.foundationCrustTiles,
    standardArtifacts.foundationTectonicHistoryTiles,
    standardArtifacts.foundationTectonicProvenanceTiles,
  ],
  provides: [morphologyArtifactModules.beltDrivers],
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts
const artifacts = {
  requires: [morphologyArtifacts.beltDrivers],
};
```
