---
level: error
---
# Prohibit Legacy Compute Tectonics Token

Foundation surfaces must not reference the retired monolithic `computeTectonics` token.

```grit
language js(typescript)

contains r"\bcomputeTectonics\b" where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation|recipes/standard/stages/foundation(?:-[^/]+)?|maps)/.*\.(?:ts|json)$"
}
```
