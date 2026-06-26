# Legacy Source Check

This component contains the native `.mjs` source-check rule runtime and rule
modules that used to live inside the Habitat SDK service model.

These files were moved here because they are authored enforcement artifacts, not
service implementation. They remain transitional: pattern-backed checks should
move to packet-local `<packet>.pattern.md` files under
`.habitat/**/blueprints/<blueprint>/<category>/check/<packet>/` and execute
through `grit-check`.

Current integration note: remaining `source-check` rule records are legacy
compatibility. The loader should either be rewired to the accepted authority
resolver or disappear when those records are converted to `grit-check`.
