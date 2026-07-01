---
level: error
---
# Prohibit Morphology Contract Legacy Plate Driver Dependencies

Morphology contracts must not depend on retired plate-driver artifacts.

```grit
language js(typescript)

or {
  contains r"mapArtifacts\.foundationPlates" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates\.contract\.ts$"
  },
  contains r"mapArtifacts\.foundation(?:TectonicHistoryTiles|TectonicProvenanceTiles|Plates)" where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains\.contract\.ts$"
  }
}
```

