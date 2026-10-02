# Stationary Basin Water Budget

## Scope And Contract

`hydrology/compute-basin-water-budget` answers one already identified active
pool's stationary supply/loss response. It is registered with Hydrography but
is not activated in Standard. It consumes no engine state, calls no other
operation, changes no ground, and publishes no lake plan or receiver graph.
See [basin design](basin-design.md) and [basin geometry](basin-geometry.md).

The input is a nonempty collection of unique active catchment cell records:
cell identity, original ground, attributed local land runoff `R`, baseline
precipitation `P`, and baseline potential demand `PET`. It also receives
external incoming overflow, an attained floor/merge level, and either a finite
outward sill at or above that level or `null` for an outlet-free pool. Ground
and levels must be finite; fluxes must be finite and nonnegative. Cell IDs are
nonnegative safe integers. Empty or duplicate catchments and invalid spans are
rejected, as are nonfinite aggregate fluxes. Rows retain double precision and
need not be sorted; the operation never mutates them.

All fluxes are rainfall-index times unit tile area per representative interval.
Local runoff must have an attributed source and must not already contain
accumulated upstream discharge. Incoming overflow must be external to these
cells. Attribution is an orchestration precondition, not something a numeric
scalar can prove. Likewise, geometry must establish the active pool and its
connectivity; numeric cell records alone cannot certify them. `PET` is baseline empirical demand, not calibrated real-world
open-water evaporation. No conversion into terrain storage, fill time, or
seasonal simulation is performed.

## Response Convention

For active catchment `C`, the wet footprint at level `h` is strictly
`W(h) = {c in C : ground(c) < h}`. The budget is:

```text
B(h) = incoming + sum(C minus W(h), R) + sum(W(h), P - PET)
```

Ground-equal cells form atomic cohorts. Crossing one replaces its dry runoff
with direct precipitation minus demand, so the jump is `sum(P - PET - R)`.
That jump may have either sign. The implementation sorts by ground then cell
ID and scans cohorts, rather than binary-searching an unproved monotone budget.
Compensated prefix precipitation/demand and suffix runoff sums avoid repeatedly
scanning cells or subtracting large wet runoff from total runoff. Runtime is
`O(n log n)` and storage is `O(n)` for `n` active cells. Ties and summation order
are independent of input row order.

The explicit closure convention chooses the first nonpositive response above
the attained state, hence the lowest-extent branch. It does not claim a unique
equilibrium or select a later recovering positive branch.

| Response | Meaning |
| --- | --- |
| `dry` | Real catchment, empty wet footprint, zero incoming plus local runoff. No hypothetical wet-cell precipitation is activated. |
| `closed`, `exact-balance` | First exactly zero footprint; returns the complete unchanged-footprint level interval, not an invented scalar height. |
| `subtile` | First positive-to-negative cohort jump retains an empty strict lower footprint and a bounded positive unresolved residual. |
| `closed`, `shoreline-quantization` | Same jump convention with a nonempty retained wet footprint. |
| `open` | No earlier closure before the finite sill; exports exactly `B(sill)`. |
| `infeasible-attained-state` | `B(attainedLevel) < 0`; records shortfall without silently retreating or manufacturing balance. |
| `no-stationary-solution` | Outlet-free positive balance persists after the last cohort; no artificial level cap or exported water. |

After an exact-zero cohort at `z`, its footprint persists on `(z, next]`.
An initially balanced attained state instead admits `[attained, next]`, which
can be a singleton. `next` is the next cohort or finite sill, whichever comes
first. An unbounded upper endpoint is `null`, exclusive, not `Infinity`.
There is no epsilon that converts a nonzero flux into closure.

A balanced interval can include the finite sill. Its `closed` classification
names the selected zero-export response, not proof of a uniquely below-sill
water level. If the supplied attained level already equals the sill, that
known connection instead returns `open` with nonnegative overflow, including
zero. A negative balance there remains infeasible. The cohort exactly at the
sill stays dry in every case.

At a positive-to-negative jump at `z`, retain `W(z)`, return scalar level `z`,
and retain `unresolvedResidual = B_before > 0`. The result includes both full
flux ledgers, cohort IDs, and `jumpMagnitude = B_before - B_after`; the residual
is bounded by that jump. The mathematical inequality is strict, but a tiny
negative upper balance relative to the lower balance can round the reported
double-precision jump to the residual itself; both signed balances are retained.
It is not evaporation, downstream discharge,
or a demonstrated storage rate. For every dry/closed/subtile/open response:

```text
incoming + dryRunoff + wetPrecipitation
  = wetDemand + overflow + unresolvedResidual
```

The diagnostic no-solution response instead retains `unresolvedSurplus`; its
fully wet footprint and unbounded `evaluatedLevels` are evidence, not an
admitted lake. The infeasible response retains `shortfall`; it provides no
overflow/residual fields that could be mistaken for a physically closed ledger.

## Verification And Remaining Work

Focused fixtures cover deep open pools, dry uplands, dry and subtile states,
nonmonotone recovery, strict finite-sill ties, whole-cohort ties, attained wet
states, exact-zero finite/unbounded intervals, infeasibility, outlet-free
surplus, deterministic permutations, immutability, invalid forcing, and direct
algebraic accounting over varied cohorts. These prove a preparatory primitive,
not final network conservation or native behavior.

The independent review found no actionable defects. Geometry plus budget
fixtures pass 36 tests / 4,059 assertions, including schema and JSON-roundtrip
checks for every result variant. The owning Nx check/test/policy graph passes
25 tasks and 744 definition tests / 35,185 assertions; receipt:
`/tmp/civ7-basin-water-budget-check.log`. These counts include existing tests,
not additional native or full-network coverage.

The unresolved owner is Hydrography orchestration: resolve incoming overflow
against unsaturated siblings, merge saturated components, partition active
catchments without counting child supply twice, and only then derive outward
receivers and final water bodies. Raw reciprocal sibling spill pointers are
not a topological order. No coordinator or fast path is supplied here. Existing
lake acceptance guards, full-body native admission, baseline demand calibration,
and production activation remain separate gates.
