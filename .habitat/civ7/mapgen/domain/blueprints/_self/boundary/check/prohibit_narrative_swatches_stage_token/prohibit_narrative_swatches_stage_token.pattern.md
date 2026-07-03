---
level: error
---
# Prohibit Narrative Swatches Stage Token

Standard recipe, maps, and tests must not reference the retired `narrative-swatches` stage token.

```grit
language js(typescript)

contains "\"narrative-swatches\"" where {
  $filename <: r".*mods/mod-swooper-maps/(?:src/(?:recipes/standard|maps)|test)/.*\.ts$"
}
```
