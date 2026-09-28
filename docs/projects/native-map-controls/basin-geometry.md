# Drainage Basin Geometry

`hydrology/compute-drainage-basins` is a pure geometry operation. Registering
it does not select it in Standard, replace priority-flood routing, publish a
lake plan, or alter `hydrography.basinId`. Ground and land-mask buffers are
read-only inputs. The operation has no breach threshold, relief adjustment,
rainfall conversion, evaporation model, or native-water admission policy.

## Algorithm

The reference is [Barnes et al. (2020), sections 3.4 and 5](https://esurf.copernicus.org/articles/8/431/2020/).
The alternative flat/catchment algorithm is adapted to the existing Civ7
odd-row hex adjacency (the helper's `OddQ` name is historical). X wraps and
Y is bounded. Equal-height connected land is one plateau. Each plateau uses
the lowest adjacent descending endpoint, with destination/source cell-index
ties, or one minimum pit. An adjacent breadth-first tree drains the plateau
to that endpoint or pit. Level water also admits drainage. Explicitly enabled
north/south edge exits take precedence on their plateau; no exterior exit is
inferred when that policy is disabled. These raw receivers never climb ground.

Raw catchments retain one lowest `max(z[a], z[b])` saddle per adjacent leaf
pair, with canonical undirected cell-index ties. A height-sorted union-find
constructs the depression containment forest. Equal-height saddle components
are processed together as multifurcations, avoiding zero-depth binary parents.
Components that reach an already external catchment terminate their tree
instead of incorporating that lower, already drained terrain into a fictitious
larger lake. A tied external batch uses a deterministic outward breadth-first
tree. The external overflow dependencies are acyclic, including on ties.

This is a comparison-sort implementation, not the paper's radix-queue linear
time implementation. Sorting plateaus, saddle edges, and leaf membership is
bounded by `O(N log N)` on the fixed-degree grid; storage is `O(N)`. Traversals
are iterative. The existing priority-flood heap conditions an escape surface
and is deliberately not reused as depression/storage identity.

## Output Meaning

- `plateauId` names the minimum index of each equal-height land component.
- `rawReceiver` is raw terrain drainage, not the final river receiver graph.
- `leafId` names raw pit catchments. Sentinel `0` combines marine water and
  directly external-draining land; it is not a storage node or a legacy
  terminal-catchment identity. Node `id` is its array index plus one.
- `nodes` and `roots` form a containment forest. A leaf starts at its floor;
  a merge starts at `baseElevation`, the common child-spill level. A root with
  `spill: null` is genuinely outlet-free, with no finite capacity/escape level
  asserted. A root with a spill exits to a directly or indirectly external
  catchment. A spill retains both adjacent endpoints and the actual receiving
  raw leaf, not merely the exterior sentinel.
- Sibling spill endpoints are geometric connections, not directed land-flow
  instructions. Siblings can overflow into each other before their parent
  fills. The containment forest must not be confused with this adjacency or
  with final, budget-resolved receivers.
- `catchmentCells[cellStart:cellEnd]` is the entire node's contributing land,
  including uplands above its sill. A node's child ranges partition its range.
  Cells occur once globally in leaf order, sorted by elevation then index
  inside each leaf. `externalCatchmentCells` contains the remaining land;
  neither array contains marine cells.
- `hypsometry[hypsometryStart:hypsometryEnd]` contains exact ground-height,
  tile-count bins for the node's land. Leaf bins are height-sorted. Merge ranges
  concatenate child histograms; they are not globally sorted or cumulative.
  Shared ranges avoid quadratic duplication in deeply nested landscapes.

For a level `h`, inundated area is the sum of `cellCount` with `elevation < h`.
Storage in tile-area times ground-height units is
`V(h) = sum(cellCount * max(0, h - elevation))`. These are geometric model
units, not a conversion from a rainfall index or a real-world volume. The
footprint is the node's cells strictly below `h`, not the whole catchment.
Cells exactly at the level have zero depth, although an equal-height sill
provides topographic connectivity. Query a merge only at or above its base.
To avoid counting children twice, its additional storage is
`V(h) - V(baseElevation)`; children own the storage below the merge level.

## Boundaries And Proof

All admitted mask-water is treated as marine/external by this operation. Do
not pass a post-lake water mask to reinterpret inland storage as ocean. Raw
plateau drainage deliberately selects one deterministic exit rather than
splitting runoff between multiple equivalent outlets. Cell areas are uniform
tile units. No spherical area correction or below-grid shoreline interpolation
is claimed.

Focused fixtures cover flats, nested storage, already-drained receiving
valleys, competing/coastal saddles, the wrap seam, closed maps, explicit edge
policy, ties, terrain immutability, nonoverlapping storage, and independent
sublevel-set connectivity. These support geometry only. Supply/loss,
fill-spill-merge water state, final river routing, native admission, and recipe
activation remain separate work.
