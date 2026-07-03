---
level: error
---
# Prohibit Map Morphology Legacy Plate Driver Dependencies

Map-morphology mountain plotting source must not depend on retired plate-driver
surfaces.

```grit
language js(typescript)

or {
  contains r"\bfoundationPlates\b",
  contains r"\bfoundationArtifacts\.plates\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains\.ts$"
}
```

