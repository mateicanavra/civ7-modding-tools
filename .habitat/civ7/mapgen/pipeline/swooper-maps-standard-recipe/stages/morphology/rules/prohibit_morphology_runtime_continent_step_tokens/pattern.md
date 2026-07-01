---
level: error
---
# Prohibit Morphology Runtime Continent Step Tokens

Morphology step implementation files must not reintroduce runtime continent
identifiers or direct landmass marking calls.

```grit
language js(typescript)

or {
  contains r"\bwestContinent\b",
  contains r"\beastContinent\b",
  contains r"\bLandmassRegionId\b",
  contains r"\bmarkLandmassId\s*\("
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/.*\.ts$"
}
```

