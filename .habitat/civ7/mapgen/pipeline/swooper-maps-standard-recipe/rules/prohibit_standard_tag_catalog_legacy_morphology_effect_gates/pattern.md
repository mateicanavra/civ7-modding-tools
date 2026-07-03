---
level: error
---
# Prohibit Standard Tag Catalog Legacy Morphology Effect Gates

The standard recipe tag catalog must not use retired engine landmass or
coastlines effect gates.

```grit
language js(typescript)

contains r"(?:landmassApplied|coastlinesApplied|effect:engine\.landmassApplied|effect:engine\.coastlinesApplied)" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/tags\.ts$"
}
```

