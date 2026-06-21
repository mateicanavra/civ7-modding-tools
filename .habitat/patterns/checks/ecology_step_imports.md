---
level: error
---
# Ecology Step Imports

Active ecology recipe stages compose through public ecology domain surfaces.
Retired ecology wrapper directories must not regain source files.

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
  },
  contains r"." where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:ecology/steps|ecology-features-score|ecology-ice|ecology-reefs|ecology-wetlands|ecology-vegetation)/.*"
  }
}
```
