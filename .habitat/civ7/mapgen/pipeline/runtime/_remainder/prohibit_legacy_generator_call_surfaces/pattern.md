---
level: error
---
# Prohibit Legacy Generator Call Surfaces

Hydrology and placement planning source must not reintroduce legacy official
generator calls.

```grit
language js(typescript)

contains r"\b(?:addNaturalWonders|generateResources|generateDiscoveries)\s*\(" where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
}
```
