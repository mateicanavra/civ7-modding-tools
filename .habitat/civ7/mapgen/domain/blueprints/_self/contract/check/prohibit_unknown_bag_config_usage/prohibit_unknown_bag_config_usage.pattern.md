---
level: error
---
# Prohibit Unknown Bag Config Usage

Domain source must not use unknown-bag config escape hatches.

```grit
language js(typescript)

or {
  contains "UnknownRecord",
  contains "INTERNAL_METADATA_KEY"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$"
}
```
