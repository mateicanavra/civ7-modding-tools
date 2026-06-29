---
level: error
---
# Prohibit Foundation Rules Tectonics Shim Reexports

Foundation decomposed tectonics rules must not re-export shared `lib/tectonics` modules as shims.

```grit
language js(typescript)

or {
  `export { $exports } from $source`,
  `export * from $source`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-(?:era-plate-membership|era-tectonic-fields|hotspot-events|segment-events|tectonic-history-rollups|tectonics-current|tracer-advection|tectonic-provenance)/rules/.*\.ts$",
  $source <: r".*lib/tectonics/.+"
}
```
