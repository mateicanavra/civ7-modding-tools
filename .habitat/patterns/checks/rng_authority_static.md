---
level: error
---
# RNG Authority Static

Authored domain and standard recipe source must not call engine RNG, official
map generators, `Math.random`, or internal mapgen-core RNG helpers.

```grit
language js(typescript)

or {
  contains r"\.\s*getRandomNumber\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard)/.*\.ts$"
  },
  contains r"\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard)/.*\.ts$"
  },
  contains r"\bMath\s*\.\s*random\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard)/.*\.ts$"
  },
  contains r"\.\s*(?:generateLakes|designateBiomes|addFeatures|generateSnow|generateResources|generateOfficialResources|generateDiscoveries|generateOfficialDiscoveries|assignStartPositions|chooseStartSectors)\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard)/.*\.ts$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard)/.*\.ts$",
    $source <: r"^[\"']?@swooper/mapgen-core/lib/rng[\"']?$"
  }
}
```

The source-check implementation carries the one current exception for discovery
materialization while that generator remains vendor-owned.
