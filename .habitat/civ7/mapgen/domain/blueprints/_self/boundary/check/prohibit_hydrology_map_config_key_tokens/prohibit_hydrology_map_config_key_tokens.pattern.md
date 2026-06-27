---
level: error
---
# Prohibit Hydrology Map Config Key Tokens

Map source must not retain legacy hydrology bag or step-id config keys.

```grit
language js(typescript)

or {
  `climate: $value`,
  `"climate-baseline": $value`,
  `"climate-refine": $value`,
  `lakes: $value`,
  `rivers: $value`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/maps/.*\.ts$"
}
```
