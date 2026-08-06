# Civ7 Direct Control Migration Router

Scope: `packages/civ7-direct-control/**`

This package is frozen migration corpus, not an architecture owner. Do not add
new behavior, exports, callers, compatibility facades, retries, transports, or
abstractions here.

Classify existing behavior through
`docs/projects/civ7-capability-realization/CORPUS.md`:

- provider-neutral external capability contracts move to their resource owner;
- concrete Tuner/window acquisition and release move to providers;
- foundational Civ7 interpretation and native `{app,game,map,ui}` operations
  move to `services/civ7-control`;
- actor-facing gameplay policy moves to `services/civ7-play`;
- bounded host filesystem/process effects move to qualified app adapters;
- caller projections move to their CLI/API plugin owner;
- unconsumed convenience surfaces and the aggregate facade are deleted.

Current tests are parity evidence only. Preserve them until the exact target
proof exists, then move or delete them according to the frozen proof corpus.
Generated outputs, Civ7 logs, deployed Mods trees, and current imports never
grant this package continuing ownership.

Until the package is deleted, its compatibility checks remain:

- `nx run control-direct:test`
- `nx run control-direct:check`
- `nx run control-direct:build`
