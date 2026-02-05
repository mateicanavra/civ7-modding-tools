# Scratch — diag-toolkit-and-spike (master)

This folder holds append-only scratchpads used to produce:
- `docs/projects/pipeline-realism/resources/research/SPIKE-m1-realism-miss-dump-driven-diagnosis-2026-02-05.md`
- `docs/projects/pipeline-realism/plans/PLAN-no-legacy-foundation-morphology-refactor-2026-02-05.md`

## Snapshot (current ground truth)

Deterministic probe (`106×66 seed=1337`) shows:
- `morphology-coasts.landmass-plates` landmask components: **434**; largestLandFrac **~0.256**
- `foundation.crustTiles.type` stats: `min=max=1` (uniform / saturated)

Repro:
- `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-baseline`
- `bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDir>`
- `bun run --cwd mods/mod-swooper-maps diag:list -- <runDir> --dataTypeKey foundation.crustTiles.type`

## Invariants the next plan must enforce

- `foundation.crust.type` and `foundation.crustTiles.type` are **non-degenerate** (both 0 and 1 exist for earthlike; no `min=max`).
- Provenance resets trigger at a non-trivial rate (avoid “age dominates everything forever”).
- Morphology landmask coherence is measured and gated by:
  - connected components count,
  - largest component fraction,
  - sensitivity/hamming between meaningful A/B config changes.

