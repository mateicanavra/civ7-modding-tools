---
level: error
---
# Prohibit Foundation Tectonics Rules Reexport Shims

Decomposed foundation tectonics rules indexes must not re-export shared
lib/tectonics modules.

```grit
language js(typescript)

`export { $exports } from $source` where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/[^/]+/rules/index\.ts$",
  $source <: r".*lib/tectonics/.*"
}
```
