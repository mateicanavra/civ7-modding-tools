---
level: error
---
# Prohibit Ecology Fudge Terms And Legacy Generator Surfaces

Ecology, hydrology, and placement planning source must not reintroduce
probabilistic fudge tokens, local runtime RNG helpers, or legacy generator
surfaces.

```grit
language js(typescript)

or {
  contains r"\brollPercent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/ecology|recipes/standard/stages/(?:ecology|ecology-pedology|ecology-biomes|ecology-features|map-ecology))/.*\.(?:ts|json)$"
  },
  contains r"\bcoverageChance\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/ecology|recipes/standard/stages/(?:ecology|ecology-pedology|ecology-biomes|ecology-features|map-ecology))/.*\.(?:ts|json)$"
  },
  contains r"\b[Cc][Hh][Aa][Nn][Cc][Ee]\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/ecology|recipes/standard/stages/(?:ecology|ecology-pedology|ecology-biomes|ecology-features|map-ecology))/.*\.(?:ts|json)$"
  },
  contains r"\b[Mm][Uu][Ll][Tt][Ii][Pp][Ll][Ii][Ee][Rr]\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/ecology|recipes/standard/stages/(?:ecology|ecology-pedology|ecology-biomes|ecology-features|map-ecology))/.*\.(?:ts|json)$"
  },
  contains r"\bcreateLabelRng\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\brng\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\b[Bb][Aa][Nn][Dd][Pp][Aa][Ss][Ss]\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\brampUp01\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\brampDown01\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\bwindow01\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\b[Bb][Oo][Nn][Uu][Ss]\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\b[Pp][Ee][Nn][Aa][Ll][Tt][Yy]\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\bminScore01\b.*[<>]=?|[<>]=?.*\bminScore01\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/ecology/ops/(?:classify-biomes/(?:layers|rules)|features-plan-(?:vegetation|wetlands|reefs|ice)/strategies)/.*\.ts$",
    not { $filename <: r".*\.schema\.ts$" }
  },
  contains r"\bcreateLabelRng\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\brng\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\brollPercent\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\bcoverageChance\b" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\baddNaturalWonders\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\bgenerateResources\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"\bgenerateDiscoveries\s*\(" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"natural-wonder-generator\.js" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"resource-generator\.js" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  },
  contains r"discovery-generator\.js" where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology/ops/plan-lakes|domain/placement|recipes/standard/stages/(?:map-hydrology/steps|map-rivers/steps|placement))/.*\.ts$"
  }
}
```
