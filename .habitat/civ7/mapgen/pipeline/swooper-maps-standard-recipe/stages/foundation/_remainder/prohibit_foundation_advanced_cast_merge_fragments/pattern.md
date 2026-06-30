---
level: error
---
# Prohibit Foundation Advanced Cast Merge Fragments

Foundation stage indexes must not retain wrapper-only advanced cast/merge or
studio sentinel fragments.

```grit
language js(typescript)

or {
  contains r"const mantleOverrideValues = \(advanced\?\.mantleForcing \?\? \{\}\) as",
  contains r"const budgetsOverrideValues = \(advanced\?\.budgets \?\? \{\}\) as",
  contains r"const meshOverrideValues = \(advanced\?\.mesh \?\? \{\}\) as",
  contains r"typeof mantleOverrideValues\.",
  contains r"typeof budgetsOverrideValues\.",
  contains r"typeof meshOverrideValues\.",
  contains r"\bFOUNDATION_STUDIO_STEP_CONFIG_IDS\b",
  contains r"\b__studioUiMetaSentinelPath\b",
  contains r"\badvancedRecord\s*\[\s*stepId\s*\]",
  contains r"\bFOUNDATION_STEP_IDS\b"
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation(?:-[^/]+)?/index\.ts$"
}
```
