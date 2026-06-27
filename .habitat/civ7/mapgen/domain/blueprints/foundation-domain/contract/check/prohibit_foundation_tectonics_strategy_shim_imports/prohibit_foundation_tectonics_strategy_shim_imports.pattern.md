---
level: error
---
# Prohibit Foundation Tectonics Strategy Shim Imports

Foundation tectonics strategies must not import shared lib/tectonics shims.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:compute-era-plate-membership|compute-era-tectonic-fields|compute-hotspot-events|compute-segment-events|compute-tectonic-history-rollups|compute-tectonics-current|compute-tracer-advection|compute-tectonic-provenance)/strategies/default\.ts$",
  $source <: r".*(?:domain/foundation/lib/tectonics/|lib/tectonics/).*"
}
```
