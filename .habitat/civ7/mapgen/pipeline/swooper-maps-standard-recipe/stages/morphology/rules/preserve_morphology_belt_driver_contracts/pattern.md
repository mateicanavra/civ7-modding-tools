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
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `foundationProjectionArtifacts.crustTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `foundationProjectionArtifacts.tectonicHistoryTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `foundationProjectionArtifacts.tectonicProvenanceTiles`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$",
    ! $body <: contains `morphologyTerrainArtifacts.beltDrivers`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/features/steps/mountains/config\.ts$",
    ! $body <: contains `morphologyTerrainArtifacts.beltDrivers`
  },
  `foundationProjectionArtifacts.plates` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$"
  },
  or {
    `foundationProjectionArtifacts.tectonicHistoryTiles`,
    `foundationProjectionArtifacts.tectonicProvenanceTiles`,
    `foundationProjectionArtifacts.plates`
  } where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology/features/steps/mountains/config\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts
const artifacts = {
  requires: [foundationProjectionArtifacts.plates],
  provides: [morphologyTerrainArtifacts.baseTopography],
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts
const artifacts = {
  requires: [foundationProjectionArtifacts.tectonicHistoryTiles],
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts
const artifacts = {
  requires: [
    foundationProjectionArtifacts.crustTiles,
    foundationProjectionArtifacts.tectonicHistoryTiles,
    foundationProjectionArtifacts.tectonicProvenanceTiles,
  ],
  provides: [morphologyTerrainArtifacts.beltDrivers],
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts
const artifacts = {
  requires: [morphologyTerrainArtifacts.beltDrivers],
};
```
