# Downstream Realignment Ledger - Map Bundle Runtime Imports Wrapped-Test

| Surface | Prior state | Action | Status |
| --- | --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | `arch-test-map-bundle-runtime-imports` used a raw `bun test` detect command. | Routed the rule through `nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static` and added `nxTarget` metadata. | aligned |
| `mods/mod-swooper-maps/package.json` | No dedicated Nx target owned the map-bundle runtime-import architecture test. | Added `test:architecture-map-bundle-runtime-imports` with dependency on `build`. | aligned |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Map-bundle wrapped-test proof existed only as aggregate context from neighboring rows. | Added a row-specific wrapped-test disposition and proof summary. | aligned |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Map-bundle appeared as aggregate wrapped-test context, not a row-owned proof checkpoint. | Added row-specific proof matrix entry. | aligned |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Historical map-bundle failures were superseded by current green aggregate evidence, but no row-specific proof section existed. | Added row-specific package target, inventory, wrapper, aggregate, and baseline proof rows. | aligned |
