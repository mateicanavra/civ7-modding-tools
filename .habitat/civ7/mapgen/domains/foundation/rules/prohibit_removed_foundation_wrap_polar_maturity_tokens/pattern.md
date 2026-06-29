---
level: error
---
# Prohibit Removed Foundation Wrap Polar Maturity Tokens

Foundation surfaces must not retain removed wrap, polar, or maturity token names.

```grit
language js(typescript)

or {
  contains r"\bwrap_x\b",
  contains r"\bwrap_y\b",
  contains r"\benvironment_wrap\b",
  contains r"\bpolarBandFraction\b",
  contains r"\bpolarBoundary\b",
  contains r"\bupliftToMaturity\b",
  contains r"\bageToMaturity\b",
  contains r"\bdisruptionToMaturity\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation|recipes/standard/stages/foundation(?:-[^/]+)?|maps)/.*\.(?:ts|json)$"
}
```
