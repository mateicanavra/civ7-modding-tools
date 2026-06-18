# Next Packet (zero-context continuation)

## Where this is

- Change: `mapgen-core-hex-oddr-adjacency-correction` (draft, PR #1812). Packet
  authored AND the behavioral fix is implemented, committed, and locally proven.
- Branch `agent-A-mapgen-core-hex-oddr-adjacency` (parent `main` b8387e3c2),
  2 commits: `fca702846` (packet) + `aa97c85c8` (fix).
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-A-mapgen-core-hex-oddr-adjacency`.
- DONE: live probe (odd-R confirmed exactly); four primitives corrected
  (hex-oddq, hex-space, vector-field, policy-grid); coast ring consolidated
  (odd-R, no Moore-8). Proof: tsc/biome clean; mapgen-core 103/0; mod 51/0;
  dump exposed-land = 0 under odd-R (46 under legacy odd-Q).
- OPEN: (1) live in-game render (closure gate; user relaunches with their
  latest-juicy configs); (2) `OddQ`->`OddR` rename (Task 2); (3) optional
  multi-seed delta sweep (Task 5.4).

## Rename scope (Task 2) — read before attempting

NOT a blind sed. ~25 distinct `*OddQ`/`*Oddq` identifiers span the grid lib AND
the mod domain (`forEachHexNeighborOddQ`, `getHexNeighborIndicesOddQ`,
`getHexRadiusIndicesOddQ`, `forEachHexNeighborOddQWithDirection`,
`projectOddqToHexSpace`, `oddqToCube`, `hexDistanceOddQPeriodicX`,
`getHexNeighborDirectionVectorsOddQ`, `bestHexNeighborDirectionIndexOddQ`,
`estimateDivergenceOddQ`, `estimateCurlZOddQ`, `computeHexNeighborDirectionVectorsOddQ`,
`collectMaskComponentsOddQ`, `computeMaskDistanceFieldOddQ`, `MaskComponentOddQ`,
`connectedComponentsLandOddQ`, `buildCoarseAverageHexOddQ`, `smoothFieldOddQ`,
`smoothFieldWaterOddQ`, `projectDivergenceFreeOddQ`, `elevationGradientOddQ`,
`computeDistanceFieldOddQ`, ...). **Do NOT rename the `hexOddQ` spaceId string
(`"tile.hexOddQ"`, 41 occurrences) — it is a studio renderer/viz-manifest
contract.** Rename per-identifier with word boundaries (longest-first to avoid
prefix collisions), update the `@swooper/mapgen-core/lib/grid` barrel + tests,
rebuild dists, and re-run mapgen-core + mod suites. Use the
`typescript-refactoring` skill. Optionally rename the file `hex-oddq.ts` ->
`hex-oddr.ts` and its import paths.

## The fix in one paragraph

mapgen-core models the grid as odd-Q (neighbor parity keyed `x&1`, north/south
diagonals). The Civ7 engine is odd-R (keyed `y&1`, west/east diagonals). They
differ by exactly one neighbor on every tile. Correct four primitive definitions
(`hex-oddq.ts`, `hex-space.ts`, `vector-field.ts`, `civ7-map-policy/policy-grid.ts`)
to the engine table, prove the table with a live `getAdjacentPlotLocation` probe,
rename `OddQ`→`OddR`, and consolidate the coast ring onto canonical adjacency
(dropping PR #1811's Moore-8 widening).

## Do next, in order

1. Pre-code review of this packet (rename strategy, PR #1811 disposition,
   expectation bands). The behavioral commit is gated on this.
2. Task 1 — live probe to pin the exact odd-R table. **Hard gate.** If the probe
   contradicts the predicted west/east-diagonal table, re-derive before coding.
3. Tasks 2–4 — mechanical rename, math correction, coast-ring consolidation.
4. Tasks 5–6 — local verification (tests, dump, expectations), then the live
   in-game render (closure-blocking).

## Hard constraints

- The MockAdapter shares the odd-Q model — it cannot prove the fix. Closure
  requires the live render. Do not claim closure from dump/tests alone.
- Do not migrate to a guessed table; the probe is the authority.
- Do not change per-tile land/water truth.
- Predicted table (confirm via probe), keyed `y&1`:
  - y even: `(-1,0)(1,0)(0,-1)(0,1)(-1,-1)(-1,1)`
  - y odd:  `(-1,0)(1,0)(0,-1)(0,1)(1,-1)(1,1)`

## PR #1811 disposition

- `agent-A-fix-island-coast-ring` (origin head `69976e6be`) is superseded. Its
  coast-ring step is re-authored here with corrected adjacency; its Moore-8
  widening is dropped. Close PR #1811 (do not merge) once this lands.
- The user's primary checkout is on `agent-A-fix-island-coast-ring` with
  uncommitted `latest-juicy` config/generated edits (serving the studio).
  Coordinate the rebase so those edits are preserved.
