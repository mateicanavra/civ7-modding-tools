---
level: error
---
# Prohibit Foundation Legacy Plate Kinematics

The compute-plate-graph contract must not retain legacy plate kinematics fields.

```grit
language js(typescript)

or {
  contains r"\bvelocityX\b",
  contains r"\bvelocityY\b",
  contains r"\brotation\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract\.ts$"
}
```
