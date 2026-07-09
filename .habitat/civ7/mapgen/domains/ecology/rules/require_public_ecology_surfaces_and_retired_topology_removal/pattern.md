---
level: error
---
# Require Public Ecology Surfaces And Retired Topology Removal

Active ecology recipe stages compose through public ecology domain surfaces.
Retired ecology wrapper directories are guarded by the standard stage topology rule.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:ecology-biomes|ecology-features|ecology-pedology|map-ecology)/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/ecology/(?:ops|rules)(?:$|/).*"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:ecology-biomes|ecology-features|ecology-pedology|map-ecology)/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/ecology/(?:ops|rules)(?:$|/).*"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:ecology-biomes|ecology-features|ecology-pedology|map-ecology)/.*\.ts$",
    $source <: r"^[\"']?@mapgen/domain/ecology/(?:ops|rules)(?:$|/).*"
  }
}
```
