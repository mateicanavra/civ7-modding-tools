---
level: error
---
# Prohibit Foundation Decomposed Ops Legacy Internal Imports

Decomposed foundation tectonics ops must not import legacy `compute-tectonic-history` internals.

```grit
language js(typescript)

or {
  import_statement(source=$source),
  `export { $exports } from $source`,
  `export * from $source`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonic-history-rollups|tectonics-current|tracer-advection|tectonic-provenance)/.*\.ts$",
  $source <: r".*compute-tectonic-history/(?:lib|contract)(?:\.js)?.*"
}
```
