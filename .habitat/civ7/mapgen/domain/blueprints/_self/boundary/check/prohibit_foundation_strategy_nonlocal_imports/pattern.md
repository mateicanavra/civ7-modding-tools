---
level: error
---
# Prohibit Foundation Strategy Nonlocal Imports

Decomposed foundation tectonics strategies may import only authoring helpers, their local contract, or local rules.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonic-history-rollups|tectonics-current|tracer-advection|tectonic-provenance)/strategies/.*\.ts$",
  ! $source <: r"^[\"']@swooper/mapgen-core/authoring[\"']$",
  ! $source <: r"^[\"']\.\./contract\.js[\"']$",
  ! $source <: r"^[\"']\.\./rules/[^\"']+[\"']$"
}
```
