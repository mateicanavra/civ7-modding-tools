# Legacy Source Check

This component contains the native `.mjs` source-check rule runtime and rule
modules that used to live inside the Habitat SDK service model.

These files were moved here because they are authored enforcement artifacts, not
service implementation. They remain transitional: pattern-backed checks should
move to subject-local `<subject>.pattern.md` files under
`.habitat/**/{boundaries,structure,capabilities,contracts}/<subject>/` and
execute through `grit-check`.

Current integration note: `tools/habitat/src/service/model/source-check`
still references the old `.habitat/tooling/components/legacy-source-check`
loader paths for remaining `source-check` rule records. This hierarchy pass
does not repair that runtime path. The loader should either be rewired to the
accepted authority resolver or disappear when those records are converted to
`grit-check`.
