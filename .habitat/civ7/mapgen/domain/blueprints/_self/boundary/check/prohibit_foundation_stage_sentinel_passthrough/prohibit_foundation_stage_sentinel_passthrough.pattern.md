---
level: error
---
# Prohibit Foundation Stage Sentinel Passthrough

Foundation stage entrypoints must not restore studio step sentinel passthrough tokens.

```grit
language js(typescript)

or {
  contains "FOUNDATION_STUDIO_STEP_CONFIG_IDS",
  contains "FOUNDATION_STEP_IDS",
  contains "advancedRecord[stepId]",
  contains "__studioUiMetaSentinelPath"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation-(?:lithosphere|mantle|orogeny|projection|tectonics)/index\.ts$"
}
```
