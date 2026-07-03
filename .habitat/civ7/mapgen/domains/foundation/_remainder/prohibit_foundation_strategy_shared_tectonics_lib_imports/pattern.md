---
level: error
---
# Prohibit Foundation Strategy Shared Tectonics Lib Imports

Decomposed foundation tectonics strategies must not import shared `lib/tectonics` modules directly.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonic-history-rollups|tectonics-current|tracer-advection|tectonic-provenance)/strategies/.*\.ts$",
  $source <: r".*lib/tectonics/.+"
}
```
