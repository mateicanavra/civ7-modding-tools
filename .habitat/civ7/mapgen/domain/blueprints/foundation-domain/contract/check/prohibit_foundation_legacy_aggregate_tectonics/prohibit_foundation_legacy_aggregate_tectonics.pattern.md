---
level: error
---
# Prohibit Foundation Legacy Aggregate Tectonics

Foundation tectonics surfaces must not expose the retired aggregate
`computeTectonicHistory` operation.

```grit
language js(typescript)

`computeTectonicHistory` where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation/index|recipes/standard/stages/foundation-tectonics/steps/tectonics\.contract)\.ts$"
}
```
