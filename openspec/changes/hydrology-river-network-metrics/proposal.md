## Why

The current physical benchmarks exercise useful tiny fixtures, but product-scale
maps can still pass local tests while producing sparse or physically weak river
networks. Generated-map hydrology needs metrics that reflect watershed
structure, upstream area, stream hierarchy, aridity, lakes, and outlet behavior.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/earthlike-visible-river-acceptance/workstream/physical-grounding.md`
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`

## What Changes

- Publish generated-map diagnostics for basin id, upstream contributing area,
  stream-order proxy, mouth type, slope class, and ephemeral/perennial proxy.
- Add seed-matrix hydrology oracles beyond `riverClassShare > 0`.
- Predeclare physical ranges and no-signal exceptions before tuning.

## Requires

- Existing hydrology hydrography artifacts.
- Current fixture benchmark suite.

## Enables Parallel Work

- Navigable projection coherence can target major trunks from richer metrics.
- Studio can display more useful river summaries.

## Affected Owners

- `mods/mod-swooper-maps/src/domain/hydrology/**`
- `mods/mod-swooper-maps/src/dev/diagnostics/**`
- `mods/mod-swooper-maps/test/**`
- Hydrology docs/OpenSpec records

## Forbidden Owners

- No Civ adapter/runtime authoring.
- No Studio UI implementation.
- No direct tuning from current output without declared ranges.

## Stop Conditions

- Metrics are backfilled from a single current seed and treated as physical
  truth.
- Arid/no-signal maps fail only because they lack visible navigable rivers.

## Verification Gates

- Fixture drainage invariants still pass.
- Generated seed-matrix tests assert acyclic drainage, terminal legality,
  downstream discharge monotonicity, minor/major hierarchy, and lake/sink
  coherence.
- OpenSpec strict validation.
