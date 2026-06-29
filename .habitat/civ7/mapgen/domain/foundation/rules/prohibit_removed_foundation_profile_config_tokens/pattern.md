---
level: error
---
# Prohibit Removed Foundation Profile Config Tokens

Foundation surfaces must not retain removed profile/config token names.

```grit
language js(typescript)

or {
  contains r"\bdirectionality\b",
  contains r"\bfoundation\.dynamics\b",
  contains r"\bfoundation\.config\b",
  contains r"\bfoundation\.seed\b",
  contains r"\bfoundation\.diagnostics\b",
  contains r"\blithosphereProfile\b",
  contains r"\bmantleProfile\b",
  contains r"\bpotentialMode\b",
  contains r"\btangentialSpeed\b",
  contains r"\btangentialJitterDeg\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation|recipes/standard/stages/foundation(?:-[^/]+)?|maps)/.*\.(?:ts|json)$"
}
```
