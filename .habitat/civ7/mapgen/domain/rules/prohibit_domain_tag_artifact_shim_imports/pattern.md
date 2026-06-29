---
level: error
---
# Prohibit Domain Tag Artifact Shim Imports

Source must not import retired `@mapgen/domain/tags` or `@mapgen/domain/artifacts` shims.

```grit
language js(typescript)

or {
  import_statement(source=$source),
  `export * from $source`,
  `export { $exports } from $source`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/.*\.ts$",
  $source <: r".*@mapgen/domain/(?:tags|artifacts)[\"']?$"
}
```
