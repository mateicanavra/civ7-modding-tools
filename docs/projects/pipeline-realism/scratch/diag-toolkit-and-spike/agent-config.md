# Scratch — Config / presets / propagation audit

## Principle

Treat “no downstream change” as a dataflow problem until proven otherwise:
- config may not reach `standardRecipe.compile(...)`,
- compile may normalize/overwrite,
- step may ignore config,
- op may normalize away amplitude,
- downstream may not consume the changed field.

## Diagnostics harness

Use:
- `diag:dump --override '{...}'` (deep merge at root config)
- `diag:diff --prefix foundation.` to confirm upstream fields move
- `diag:diff --dataTypeKey morphology.topography.{elevation,landMask}` to confirm downstream sensitivity

## Known footgun class (to explicitly test)

- “Knob changes are visible in some Foundation layers but do not move `crust.type` (and therefore do not move continent-scale behavior).”

