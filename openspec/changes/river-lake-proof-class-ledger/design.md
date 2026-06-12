## Design

Define proof as a set of labeled claims, not one status.

Required labels:

- `exact-authorship`: Studio-visible config, generated/deployed script, Civ
  setup, runtime seed/dimensions, and logs are the same run.
- `hydrology-truth`: discharge, flow direction, river class, sinks/outlets, and
  lake intent meet physical/network oracles.
- `projection-plan`: map-rivers selected a navigable trunk subset from planned
  major rivers.
- `terrain-readback`: live terrain rows match projected navigable terrain.
- `metadata-readback`: Civ river metadata agrees with intended metadata claims.
- `studio-visible`: Studio layers and summaries expose the relevant surfaces.
- `civ-rendered`: screenshots centered on sampled live river tiles show visible
  rivers.
- `lake-final`: accepted lakes remain water/lake classified at final placement.
- `floodplain-active`: an active floodplain-producing seed has live floodplain
  feature evidence.
- `product-acceptance`: all required proof labels plus reviewer disposition.

Each label has `pass`, `fail`, `unresolved`, or `out-of-scope`, plus evidence
links. Top-level proof status may summarize transport/exact-authorship only, but
product acceptance must read the labeled claims.

## Review Lanes

- Product proof-boundary review.
- Runtime parity review.
- Studio status-vocabulary review.
- Closure-ledger review.
