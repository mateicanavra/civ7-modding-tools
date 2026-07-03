---
level: error
---
# Prohibit Hydrology Climate Intervention Tokens

Hydrology source and stages must not author narrative climate intervention tokens.

```grit
language js(typescript)

or {
  contains "climate.swatches",
  contains "climate.story"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology|recipes/standard/stages/hydrology-(?:climate-baseline|hydrography|climate-refine))/.*\.ts$"
}
```
