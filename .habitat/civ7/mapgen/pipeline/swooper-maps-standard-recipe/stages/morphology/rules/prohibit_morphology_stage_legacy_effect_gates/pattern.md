---
level: error
---
# Prohibit Morphology Stage Legacy Effect Gates

Morphology stages must not use retired engine landmass or coastlines effect gates.

```grit
language js(typescript)

contains r"(?:landmassApplied|coastlinesApplied|effect:engine\.landmassApplied|effect:engine\.coastlinesApplied)" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/.*\.ts$"
}
```

