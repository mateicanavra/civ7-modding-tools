# Corpus Ledger — Hex Adjacency Consumers (blast radius)

The model defect lives in four primitive definitions; ~95 call sites consume
them. Call sites do **not** change logic (they call the primitives), but their
outputs shift once the model is corrected. This ledger is the coverage map for
the downstream-realignment audit (Task 7).

## Canonical primitive definitions (the fix surface)

| Symbol(s) | File | Defect |
| --- | --- | --- |
| `OFFSETS_ODD/EVEN`, `forEachHexNeighborOddQ`, `getHexNeighborIndicesOddQ`, `forEachHexNeighborOddQWithDirection`, `getHexRadiusIndicesOddQ` | `packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts` | offsets keyed `x&1`, north/south diagonals |
| `projectOddqToHexSpace`, `oddqToCube`, `hexDistanceOddQPeriodicX` | `packages/mapgen-core/src/lib/grid/hex-space.ts` | column-parity vertical shift; odd-q cube |
| duplicate `OFFSETS_*`, `getHexNeighborDirectionVectorsOddQ`, `bestHexNeighborDirectionIndexOddQ`, `estimateDivergenceOddQ`, `estimateCurlZOddQ` | `packages/mapgen-core/src/lib/grid/vector-field.ts` | second copy of odd-q offsets keyed `x&1` |
| `forEachHexNeighborOddQ`, `computeHexDistanceToMask` | `packages/civ7-map-policy/src/policy-grid.ts` | third re-impl keyed `x&1` |

Intermediate consumers (follow the primitives; verify no inlined offsets):
`components.ts` (`collectMaskComponentsOddQ`, `computeMaskDistanceFieldOddQ`),
`flow-routing.ts` (`selectFlowReceiver`).

## Call-site categories and sensitivity

| Category | Representative sites | Exact-set sensitive? | Notes |
| --- | --- | --- | --- |
| Coastline / water classification | `recipes/.../map-morphology/steps/plotCoasts.ts`; `recipes/.../morphology-coasts/steps/ruggedCoasts.ts`; `domain/morphology/ops/compute-coastline-metrics/strategies/default.ts` | OR-reduction (coast ring); set-sensitive (metrics) | The notch lived here; coast ring consolidated in Task 4 |
| Connected components / landmask labeling | `domain/morphology/ops/compute-landmask/strategies/default.ts`; `compute-landmasses`; `compute-belt-drivers/deriveFromHistory.ts`; `components.ts` | set-sensitive | island/lake/landmass segmentation; verify counts only shift via adjacency, not land/water truth |
| Distance fields / BFS | `components.ts` `computeMaskDistanceFieldOddQ`; `policy-grid.ts` `computeHexDistanceToMask`; `mountains-shared/rules/computeDistanceToMask.ts` | set-sensitive | distance-to-coast / -mountain gradients |
| Rivers / flow / drainage | `flow-routing.ts` `selectFlowReceiver`; `compute-flow-routing`; `hydrology/.../compute-drainage-routing`; `compute-river-network-metrics` | **exact-set critical** | steepest-descent picks one receiver; phantom neighbor → wrong outlet. Highest-risk consumer |
| Climate vector fields | `vector-field.ts`; `compute-atmospheric-circulation`; `compute-precipitation/strategies/vector.ts`; `compute-ocean-surface-currents`; `transport-moisture`; `climateBaseline.ts` | exact direction-vector | divergence/curl of wind/current; internal but must stay self-consistent |
| Resources / starts | `placement/ops/plan-starts/strategies/default.ts`; `plan-natural-wonders`; `resources/.../select-resource-sites`, `adjust-resource-support`, `derive-habitat-fields`, `resource-legality.ts` | set + distance | spacing/exclusion zones; hex distance |
| Morphology / topology | `mountains-shared/rules/isStrictLocalMaximumHex.ts`; `plan-ridges`; `plan-rough-lands`; `compute-base-topography`; `compute-geomorphic-cycle` | set-sensitive | peak detection, ridge spacing, erosion neighbors |
| Foundation / plates | `foundation/ops/compute-plates-tensors/lib/project-plates.ts` | projection | stress tensor interpolation in hex space |
| Ecology / pedology | `ecology-features/steps/score-layers`; `ecology-pedology/steps/pedology` | set-sensitive | biome/soil neighbor propagation |
| Diagnostics / live-parity | `dev/diagnostics/placement-metrics.ts`, `surface-delta-context.ts`, `live-parity.ts`; `scripts/live/verify-resource-delta-feasibility.ts` | tooling | `live-parity.ts` hosts the Task 1 probe and the closure parity check |

## Coverage obligations

- Verify the live probe (Task 1) before any behavioral commit.
- Re-run the highest-risk consumer (flow/drainage routing) explicitly: confirm
  receivers are engine-adjacent and basins do not fragment differently in a way
  that breaks river products.
- Confirm `square-3x3.ts` (Moore-8) remains test-only and is not a production
  adjacency path after the coast-ring superset is removed.
