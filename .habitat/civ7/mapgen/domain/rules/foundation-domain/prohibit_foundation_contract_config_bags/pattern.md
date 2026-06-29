---
level: error
---
# Prohibit Foundation Contract Config Bags

Foundation contracts must not depend on root config-bag imports or schemas.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r".*@mapgen/domain/config.*"
  },
  `FoundationConfigSchema`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation/ops/.*/contract|recipes/standard/stages/foundation(?:-[^/]+)?/.*contract)\.ts$"
}
```
