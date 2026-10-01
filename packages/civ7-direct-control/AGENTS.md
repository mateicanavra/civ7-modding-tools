# Civ7 Direct Control Migration Router

Scope: `packages/civ7-direct-control/**`

This package is frozen migration corpus, not an architecture owner. Do not add
new behavior, exports, callers, compatibility facades, retries, transports, or
abstractions here.

Classify existing behavior through the normative
`docs/projects/civ7-capability-realization/{SOURCE-RECONCILIATION.md,
PUBLIC-SURFACE-DISPOSITION.md,WORKSTREAM.md}` packet. `CORPUS.md` is baseline
source evidence only; its old destination paths are superseded.

- provider-neutral Tuner contracts move to the resource and concrete connection,
  state, epoch, request/response, and release mechanics move to its provider;
- host apps bind selected Tuner access to the deployed controller's public
  client without regenerating mature operation bodies;
- typed native operations move to `services/civ7-controller` and execute inside
  Civ7 through the dedicated controller mod;
- actor-facing gameplay policy moves to `services/civ7-play`;
- generic window capture remains its own managed resource/provider and is used
  only by qualified diagnostic or app-observation paths;
- bounded host filesystem/process effects and raw JavaScript diagnostics move
  to qualified app adapters;
- caller projections move to their CLI/API plugin owner;
- unconsumed convenience surfaces and the aggregate facade are deleted.

Current tests are parity evidence only. Preserve their useful assertion until
the exact target proof exists, then reconstruct or delete it inside the selected
vertical; the frozen proof corpus's old target paths are not authority.
Generated outputs, Civ7 logs, deployed Mods trees, and current imports never
grant this package continuing ownership.

Until the package is deleted, its compatibility checks remain:

- `nx run control-direct:test`
- `nx run control-direct:check`
- `nx run control-direct:build`
