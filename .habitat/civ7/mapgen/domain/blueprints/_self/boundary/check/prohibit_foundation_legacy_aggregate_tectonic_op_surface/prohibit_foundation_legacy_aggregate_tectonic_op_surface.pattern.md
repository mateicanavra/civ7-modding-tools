---
level: error
---
# Prohibit Foundation Legacy Aggregate Tectonic Op Surface

Foundation op public surfaces must not reintroduce the legacy aggregate tectonic-history operation.

```grit
language js(typescript)

contains r"\bcomputeTectonicHistory\b|compute-tectonic-history/(?:contract|index)\.js" where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:contracts|index)\.ts$"
}
```
