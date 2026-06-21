## Design

### Two root causes, one bug class

The floating-island bug class has two independent root causes. This change is
the canonical fix for both, consolidating PR #1811:

1. **Late-injected land has no coast ring.** `morphology-features/islands`
   stamps island peaks after `coastlineMetrics` is computed; the Civ7 coast
   policy seeds buffer expansion from existing coast (not land), so isolated
   peaks get no shallow ring and the no-water-drift policy enforces land on deep
   ocean. Fixed by a coast-ring safety net in `plotCoasts` (promote any ocean
   tile adjacent to land → coast). This is PR #1811's still-valid contribution.

2. **The adjacency model is mislabeled.** mapgen-core computes odd-Q adjacency;
   the engine uses odd-R. The one-neighbor-per-tile difference is why the
   odd-Q coast ring left exactly one notch per isolated island, and why every
   other adjacency-derived surface is subtly misaligned with the engine. This is
   the root the user asked to fix.

Cause 2 is the model defect. Cause 1's safety net is preserved but recomputed
with the corrected adjacency; the Moore-8 superset that PR #1811 used to dodge
cause 2 is removed once cause 2 is fixed at the model.

### Engine convention (evidence)

`docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md`
establishes, and this workstream re-verified directly:

- Firaxis debug dumpers shift **odd rows** east (`map-debug-helpers.js`:
  `if (iY % 2 == 1) str += " "` in `dumpContinents`/`dumpTerrain`/`dumpElevation`/
  `dumpRainfall`). Row-offset = odd-R.
- `DirectionTypes` is E/W + four vertical diagonals, **no N/S** → pointy-top.
- Base map scripts never hand-roll offsets; they loop
  `0..DirectionTypes.NUM_DIRECTION_TYPES` and call
  `GameplayMap.getAdjacentPlotLocation(loc, dir)` (`map-utilities.js`,
  `elevation-terrain-generator.js`, `resource-generator.js`,
  `volcano-generator.js`). **The engine owns the neighbor math in native code —
  there is no JS offset table to copy.** The model must hardcode the offsets and
  pin them with a live probe.

### Predicted offset table (confirm via live probe)

Engine grid = redblob **odd-R** (odd rows shifted east), data coords, `+x` wraps:

```
y even row neighbors (dx,dy): (-1,0) (1,0) (0,-1) (0,1) (-1,-1) (-1,1)   // diagonals on WEST column
y odd  row neighbors (dx,dy): (-1,0) (1,0) (0,-1) (0,1) ( 1,-1) ( 1,1)   // diagonals on EAST column
selector: (y & 1)
```

Contrast with the current (wrong) odd-Q table, keyed on `x & 1`, whose diagonal
pairs are north/south (`(-1,-1),(1,-1)` for even-x; `(-1,1),(1,1)` for odd-x).
Note: the correct odd-R diagonals are **not** the odd-Q arrays re-keyed by `y`
(that yields an incoherent lattice); the diagonal pair itself changes from a
north/south split to a west/east split. The live probe (Task 1) is the gate that
confirms this exact table before any behavioral commit.

### Fix surface (four definitions, one model)

| File | Current | Correct |
|---|---|---|
| `mapgen-core/.../neighborhood/hex-oddq.ts` | `OFFSETS_*` keyed `x&1`, north/south diagonals | odd-R table keyed `y&1`, west/east diagonals |
| `mapgen-core/.../grid/hex-space.ts` `projectOddqToHexSpace` | `hy = y*HEX_HEIGHT + (x&1?HALF_HEX_HEIGHT:0)` (column shift) | `hx = x*HEX_WIDTH + (y&1?HALF_HEX_WIDTH:0)`, `hy = y*HEX_HEIGHT` (row shift) |
| `hex-space.ts` `oddqToCube` | `z=y-(x-(x&1))/2; xCube=x` | `oddrToCube`: `q=x-(y-(y&1))/2; r=y; xCube=q; zCube=r` |
| `hex-space.ts` `hexDistanceOddQPeriodicX` | uses `oddqToCube` | uses `oddrToCube`; periodic-X wrap unchanged |
| `mapgen-core/.../grid/vector-field.ts` | duplicate `OFFSETS_*` keyed `x&1` + `projectOddqToHexSpace` | import canonical table + projection (dedup); direction vectors follow |
| `civ7-map-policy/src/policy-grid.ts` `forEachHexNeighborOddQ` | separate re-impl keyed `x&1` | odd-R neighbors keyed `y&1` (match canonical) |

Consumers `components.ts` (flood fill, distance field) and `flow-routing.ts`
(steepest-descent receiver) call the primitives and follow automatically; verify
no inlined offset assumptions.

`HEX_WIDTH = √3`, `HEX_HEIGHT = 1.5` (pointy-top spacings) are already correct;
only the offset axis was wrong. Add `HALF_HEX_WIDTH = HEX_WIDTH/2`;
`HALF_HEX_HEIGHT` becomes unused for projection.

### Rename strategy

The functions are named `...OddQ` but will compute odd-R. Leaving the name is a
fresh mislabel. Sequence to keep the diff reviewable:

- Commit A — mechanical rename `OddQ` → `OddR` across all symbols and ~call
  sites (identifier-only; bodies still compute old math; tests stay green). For
  `projectOddqToHexSpace`/`oddqToCube` the rename and math are coupled, so their
  bodies change in Commit B.
- Commit B — correct the math in the renamed primitives (offset selector,
  projection axis, cube conversion). Small, focused, behavior-changing.
- Commit C — vector-field/policy-grid dedup + canonical alignment.
- Commit D — coast-ring consolidation (odd-R ring, remove Moore-8 widening).

### Direction-index semantics

`forEachHexNeighbor*WithDirection` returns a direction index `0..5`, and
`vector-field` maps that index to a hex-space direction vector. The index→vector
mapping must stay self-consistent: because the direction vectors are derived from
the same projection and offset order, correcting both together preserves
consistency. Vector-field direction semantics are mod-internal (used for
divergence/curl of wind/current fields); the engine consumes per-tile rainfall/
terrain, not direction vectors, so only the **neighbor set** must match the
engine — but the set must be exact for flow routing.

### Evidence policy and stop/reframe conditions (investigation-design)

- **Evidence standard: audit-grade.** Static evidence pins odd-R direction; the
  live `getAdjacentPlotLocation` probe is the verifying authority for the exact
  table and is required before the behavioral commit.
- **Authority on conflict:** live engine probe > base-script static evidence >
  audit doc > model code.
- **Stop/reframe:** if the probe contradicts the predicted table, halt and
  re-derive (do not migrate to a guessed table). If the migration shifts per-tile
  land/water truth, halt (scope breach). If the live render still notches, the
  fix is incomplete — do not claim closure.
- **Proof classes stay separate:** unit tests, dump stats, golden deltas,
  OpenSpec validation, and live in-game render are distinct claims; closure
  requires the live render (MockAdapter cannot prove this class).

### PR #1811 disposition

PR #1811 (`agent-A-fix-island-coast-ring`) is superseded. Its coast-ring step is
re-authored here with corrected adjacency; its Moore-8 widening is dropped. After
this change lands, PR #1811 should be closed (not merged) and the coast-ring
contribution attributed here. The user's primary checkout currently carries the
PR #1811 branch with local `latest-juicy` edits; the handoff notes the rebase.
