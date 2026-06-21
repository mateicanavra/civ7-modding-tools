# Design — Dominoes, Graphite Slices, Integration Points

> Full algorithm + rationale: `docs/projects/start-distribution-homeland-rebalance/design.md`.
> This file is the **sequencing control record**: how the dominoes map to
> Graphite branches, where each touches the pipeline, and the parallelism plan.

## Graphite stack (on top of the natural-wonders stack)

```
agent-A-natural-wonders-full-set-parity-suitability   (PR #1852, NW stack top)
└── start-dist-homeland-rebalance        S1  design + OpenSpec (this branch)
    └── start-dist-2-region-metric       S2  D0 region-balance metric + baseline   ┐ parallelizable
    └── start-dist-3-policy-primitives   S3  @civ7/map-policy src/starts/ + tests   ┘ (S2 ∥ S3)
        └── start-dist-4-partition       S4  D1 land-aware homeland partition
            └── start-dist-5-allocation  S5  D2 capacity-proportional allocation
                └── start-dist-6-dispersion  S6  D3 per-landmass quotas + farthest-point
                    └── start-dist-7-verify  S7  D4 reconciliation + ER1–ER4 + in-game + closure
```

Graphite is linear; S2 and S3 are dependency-independent and may be developed in
separate worktrees, then ordered into the stack before S4. The behavioral spine
S4→S5→S6 is sequential by data dependency and each slice monotonically improves
the D0 metric, so a regression is attributable to one slice.

## Complexity × parallelism (not effort/time)

| Slice | Coupling | Independently testable | Parallel lane |
|---|---|---|---|
| S2 metric | reads existing artifacts only; no behavior change | yes (diagnostics harness) | A |
| S3 primitives | pure functions, zero consumers yet | yes (unit tests, isolated) | B |
| S4 partition | one step (`plot-landmass-regions`) | yes (metric + step test) | spine |
| S5 allocation | `plan-starts` allocation + `runtime`/inputs wiring | yes (metric + plan-ops tests) | spine |
| S6 dispersion | selection ladder | yes (metric + ladder tests) | spine |
| S7 verify | diagnostics + closure | yes (full gate set + live) | tail |

## Integration points (where each domino plugs in)

- **D0 / S2** — `mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts`.
  Add region-balance metric ids (E-series) reading the published `plan-starts`
  output (`seats[].regionSlot`, `plotIndex`) + `landmasses` + `topography`.
- **S3 primitives** — `packages/civ7-map-policy/src/starts/{index,policy,partition,apportion,dispersion}.ts`;
  re-export from `packages/civ7-map-policy/src/index.ts`; export needed helpers
  from `src/policy-grid.ts`.
- **D1 / S4** — `plot-landmass-regions/index.ts:resolveSlotByTile` replaces the
  `centerX < width/2` loop with `balancedHemisphereSplit(...)`. Output artifact
  `map.landmassRegionSlotByTile` and engine `WEST`/`EAST` stamping unchanged.
- **D2 / S5** — `runtime.ts` stops fixing the per-region split; total `N` from
  `getAliveMajorIds()`. `plan-starts/strategies/default.ts` computes per-region
  capacity/ceilings from screened candidates and calls
  `apportionStartsByCapacity`; `seat-identity.ts buildSeatIdentities` takes the
  computed per-region counts instead of `playersWest/playersEast` from `MapInfo`.
- **D3 / S6** — `default.ts` builds per-landmass quotas (apportion within region)
  and `selection-ladder.ts` adds a farthest-point/dispersion term + quota
  constraint to the regional rung.
- **D4 / S7** — `default.ts:702-719` reconciliation becomes capacity-aware;
  evidence recorded; live run.

## Contracts touched

- `plan-starts` **input/output schema unchanged** on the region surface
  (decision log). Allocation is internal. If a future need forces an output
  field (e.g. per-region capacity for Studio), it is additive and recorded here.
- New `@civ7/map-policy` exports are additive (`kind:foundation`; `kind:mod` may
  import it — Nx boundary respected).

## Spec capability

Behavioral requirements land under the `mapgen-normalization-workstreams`
capability (`specs/mapgen-normalization-workstreams/spec.md`), consistent with
the placement-realignment series.
