---
level: error
---
# Prohibit Foundation Projection Legacy Motion Source

Foundation projection source must not read legacy plateGraph motion fields.

```grit
language js(typescript)

or {
  `plateGraph.plates[$index]`,
  `$value.velocityX`,
  `$value.velocityY`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/projection\.ts$"
}
```
