---
level: error
---
# Prohibit Ambient RNG In Authored Generation

Authored map-domain and recipe source must not acquire ambient randomness,
invoke Civ7 generators outside the step engine capability, or reach into
MapGen's private RNG implementation.

```grit
language js(typescript)

predicate is_authored_map_source($filename) {
  $filename <: r".*plugins/mod/map/[^/]+/src/(?:domain|recipes/[^/]+)/.*\.ts$"
}

or {
  `$receiver.getRandomNumber($args)` where {
    is_authored_map_source($filename)
  },
  `Math.random($args)` where {
    is_authored_map_source($filename)
  },
  `$receiver.$method($args)` where {
    is_authored_map_source($filename),
    $method <: r"^(?:generateLakes|designateBiomes|addFeatures|generateSnow|generateResources|generateOfficialResources|generateDiscoveries|generateOfficialDiscoveries|assignStartPositions|chooseStartSectors)$",
    ! $receiver <: `deps.engine`
  },
  import_statement(source=$source) where {
    is_authored_map_source($filename),
    $source <: r"^[\"']?@swooper/mapgen-core/lib/rng[\"']?$"
  }
}
```
