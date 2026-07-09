---
level: error
---
# Prohibit Scoped Ecology Runtime Tokens

Selected ecology runtime planning directories must not reintroduce local RNG
helpers, score gates, or fuzzy weighting terminology.

```grit
language js(typescript)

contains r"(?:\bcreateLabelRng\b|\brng\s*\(|\b[Bb][Aa][Nn][Dd][Pp][Aa][Ss][Ss]\b|\brampUp01\s*\(|\brampDown01\s*\(|\bwindow01\s*\(|\b[Bb][Oo][Nn][Uu][Ss]\b|\b[Pp][Ee][Nn][Aa][Ll][Tt][Yy]\b|\bminScore01\b.*[<>]=?|[<>]=?.*\bminScore01\b)" where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
  not { $filename <: r".*\.schema\.ts$" }
}
```
