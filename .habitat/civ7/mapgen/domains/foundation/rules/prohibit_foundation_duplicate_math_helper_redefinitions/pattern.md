---
level: error
---
# Prohibit Foundation Duplicate Math Helper Redefinitions

Foundation tectonics modules must not redeclare canonical clamp helper functions.

```grit
language js(typescript)

or {
  `function $name($args): $returnType { $body }` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonics-current|tectonic-history-rollups|tracer-advection|tectonic-provenance)/strategies/.*|compute-(?:plate-motion|tectonic-segments|plate-graph)/index\.ts|compute-plates-tensors/lib/project-plates\.ts)$",
    $name <: r"^(?:clampByte|addClampedByte|clamp01|clampInt8|normalizeToInt8)$"
  },
  `function $name($args) { $body }` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonics-current|tectonic-history-rollups|tracer-advection|tectonic-provenance)/strategies/.*|compute-(?:plate-motion|tectonic-segments|plate-graph)/index\.ts|compute-plates-tensors/lib/project-plates\.ts)$",
    $name <: r"^(?:clampByte|addClampedByte|clamp01|clampInt8|normalizeToInt8)$"
  }
}
```
