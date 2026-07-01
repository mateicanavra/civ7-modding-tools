---
level: error
---
# Prohibit Foundation Op Contract Config Bags

Foundation operation contracts must not depend on root config-bag imports or schemas.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r".*@mapgen/domain/config.*"
  },
  `FoundationConfigSchema`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/[^/]+/contract\.ts$"
}
```

