---
level: error
---
# Prohibit Ecology Fudge Tokens

Ecology planning source must not reintroduce probabilistic fudge terminology.

```grit
language js(typescript)

contains r"\b(?:rollPercent|coverageChance|[Cc][Hh][Aa][Nn][Cc][Ee]|[Mm][Uu][Ll][Tt][Ii][Pp][Ll][Ii][Ee][Rr])\b" where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/ecology|recipes/standard/stages/(?:ecology|ecology-pedology|ecology-biomes|ecology-features|map-ecology))/.*\.(?:ts|json)$"
}
```
