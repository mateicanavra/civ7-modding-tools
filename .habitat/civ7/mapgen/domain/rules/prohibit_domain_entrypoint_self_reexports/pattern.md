---
level: error
---
# Prohibit Domain Entrypoint Self Reexports

Domain root entrypoints must not re-export deep `@mapgen/domain/<domain>` surfaces.

```grit
language js(typescript)

or {
  `export * from $source`,
  `export { $exports } from $source`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/index\.ts$",
  $source <: r".*@mapgen/domain/[^/]+/.+"
}
```
