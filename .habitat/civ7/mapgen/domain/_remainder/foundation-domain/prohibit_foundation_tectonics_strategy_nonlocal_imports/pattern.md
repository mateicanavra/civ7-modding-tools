---
level: error
---
# Prohibit Foundation Tectonics Strategy Nonlocal Imports

Decomposed foundation tectonics strategies may import only core authoring,
their local contract, and local rules.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:compute-era-plate-membership|compute-era-tectonic-fields|compute-hotspot-events|compute-segment-events|compute-tectonic-history-rollups|compute-tectonics-current|compute-tracer-advection|compute-tectonic-provenance)/strategies/default\.ts$",
  ! $source <: r"^[\"']?@swooper/mapgen-core/authoring[\"']?$",
  ! $source <: r"^[\"']?\.\./contract\.js[\"']?$",
  ! $source <: r"^[\"']?\.\./rules/.*[\"']?$"
}
```
