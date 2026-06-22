# Legacy Source Check

This component contains the native `.mjs` source-check rule runtime and rule
modules that used to live inside the Habitat SDK service model.

These files were moved here because they are authored enforcement artifacts, not
service implementation. They remain transitional: pattern-backed checks should
move to `.habitat/patterns/checks/*.md` and execute through `grit-check`.

Current integration note: `tools/habitat-harness/src/service/model/source-check`
still loads these modules for remaining `source-check` rule records. The loader
should disappear when those records are converted to `grit-check`.
