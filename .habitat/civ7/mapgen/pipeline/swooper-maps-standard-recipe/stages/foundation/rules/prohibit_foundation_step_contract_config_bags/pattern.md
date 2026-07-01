---
level: error
---
# Prohibit Foundation Step Contract Config Bags

Foundation recipe step contracts must not depend on root config-bag imports or schemas.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r".*@mapgen/domain/config.*"
  },
  `FoundationConfigSchema`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation(?:-[^/]+)?/.*contract\.ts$"
}
```
