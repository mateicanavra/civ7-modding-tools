# Expectation And Strategy Ledger

Pre-declared **before** the behavioral migration so the adjacency delta is judged
honestly, not retrofitted to the result. The model change alters the adjacency
graph by exactly one neighbor per tile; expectations describe what should and
should not move.

| Surface | Expected behavior after odd-R correction | Condition | Evidence strength | Owner | Strategy/artifact | Local stats gate | Runtime proof |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Per-tile land/water truth | **Unchanged** (hard invariant) | any seed | high | Morphology | land/water mask totals | exact equality vs pre-migration | terrain readback |
| Coastless land on deep ocean | **0** under engine (odd-R) adjacency, corrected 6-neighbor ring, no Moore-8 | stable seed matrix | high | plotCoasts coast ring | `policyCoastMask`, `landAdjacentCoastRing` trace | exposed-land count = 0 under odd-R | live render: no notch |
| Coast tile count | Slightly **lower** than the Moore-8 ring (no corner over-promotion); near the original odd-Q ring level | per map | medium | coast ring | coast/ocean histogram | within a small band of odd-Q-ring baseline | terrain readback |
| Connected components (islands/lakes/landmasses) | Counts may shift by adjacency only; totals stay plausible; no land/water reclassification | seed matrix | medium | components/landmask | component counts, sizes | bounded drift, documented | — |
| Distance-to-mask fields | Small per-tile shifts (±1) where the off-by-one neighbor changed BFS frontier | seed matrix | medium | components / policy-grid | distance histograms | bounded; no structural inversion | — |
| Flow / drainage routing | **Receivers become engine-adjacent**; rivers may re-route on tiles where the phantom neighbor had been the outlet; river products stay coherent (no fragmentation regression) | wet seed matrix | medium-high | flow-routing / drainage | receiver graph, basin/terminal metrics, river-network metrics | acyclic, no fragmentation regression vs baseline | live river visibility (separate slice) |
| Climate vector fields (divergence/curl) | Recompute from corrected projection; precipitation/current patterns shift slightly but stay physically coherent | seed matrix | medium | vector-field consumers | divergence/curl test fixtures | fixtures pass under corrected projection | — |
| Resource / start spacing | Hex distances change by ≤1 on affected pairs; legality/spacing gates still satisfied | seed matrix | medium | placement/resources | spacing/legality counters | no new illegal/too-close placements | — |
| Shipped-map identity (config hashes) | **Unchanged** (config not touched) | shipped maps | high | maps | configHash/envelopeHash | exact equality | — |

## Strategy Rules

- Do not tune any config to absorb the adjacency delta; the delta is the point.
- Land/water truth equality is a hard gate; any drift halts the migration
  (scope breach).
- Treat flow/drainage routing as the highest-risk consumer; require an explicit
  before/after on river products, not just "tests pass".
- Golden/stat baselines that shift do so because the graph was wrong before;
  update them only after confirming the new value is the engine-aligned one, and
  record the rationale.
- Closure proof is the live render; local stats and the dump prove the authored
  surface, not the rendered engine surface.
