---
level: error
---
# Prohibit RNG Callback State In Ops

Domain ops must not accept ambient RNG callbacks or use RNG state through options/context.

```grit
language js(typescript)

or {
  contains "RngFunction",
  contains "options.rng",
  contains r"\bctx\.rng\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/.*\.ts$"
}
```
