---
level: error
---
# Prohibit Hydrology Placement Rng And Chance Tokens

Hydrology and placement planning source must not reintroduce local RNG or
chance helper tokens.

```grit
language js(typescript)

contains r"(?:\bcreateLabelRng\b|\brng\s*\(|\brollPercent\b|\bcoverageChance\b)" where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
}
```
