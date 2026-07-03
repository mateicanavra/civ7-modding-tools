---
level: error
---
# Cutover Source Guardrails

Runtime source must not retain shim, shadow, comparison, dual-path, or legacy
stage-token surfaces after a cutover.

```grit
language js(typescript)

or {
  contains r"\bdualRead",
  contains r"\bdual[-_ ]?engine",
  contains r"\bdual[-_ ]?path",
  contains r"\bshadow(?:Path|Compute|Layer|Mode|Toggle|Bridge)",
  contains r"\bcompare(?:Layer|Layers|Mode|Toggle|Only|Path)",
  contains r"\bcomparison(?:Layer|Layers|Mode|Toggle|Only|Path)",
  contains r"\bshim(?:med|ming|s)?\b",
  contains r"\bcompat(?:ibility)?[-_ ]?(shim|bridge)\b",
  contains r"\btransitional[-_ ]?(shim|bridge)\b",
  contains r"\"hydrology-pre\"",
  contains r"\"hydrology-core\"",
  contains r"\"hydrology-post\"",
  contains r"\"narrative-pre\"",
  contains r"\"narrative-mid\"",
  contains r"\"narrative-post\""
} where {
  $filename <: r".*mods/mod-swooper-maps/src/(?:domain|recipes/standard|maps)/.*\.(?:ts|json)$"
}
```
