---
level: error
---
# Prohibit Hydrology Narrative Domain Imports

Hydrology domain and stages must not import narrative domain internals.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology|recipes/standard/stages/hydrology-(?:climate-baseline|hydrography|climate-refine))/.*\.ts$",
  $source <: r".*@mapgen/domain/narrative/.+"
}
```
