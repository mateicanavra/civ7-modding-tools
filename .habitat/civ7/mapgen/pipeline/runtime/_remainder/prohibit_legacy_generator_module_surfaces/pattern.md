---
level: error
---
# Prohibit Legacy Generator Module Surfaces

Hydrology and placement planning source must not reintroduce legacy official
generator module path tokens.

```grit
language js(typescript)

contains r"(?:natural-wonder-generator|resource-generator|discovery-generator)\.js" where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
}
```
