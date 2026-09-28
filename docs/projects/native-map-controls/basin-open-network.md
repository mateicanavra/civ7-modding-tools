# Certified Open Basin Network

## Scope

`hydrology/compute-open-basin-network` with `certified-sill-spill` constructs
one bounded stationary network candidate. It is registered in Hydrography but
**not activated in Standard**. It changes no ground, climate, recipe/config,
lake acceptance, or native admission. There are no policy knobs, floors,
negative-flow clamps, seed retries, alternate outlets, or fallback solvers.
See [basin design](basin-design.md), [geometry](basin-geometry.md), and the
[single-pool budget law](basin-water-budget.md).

The operation admits only a fully certified open forest whose actual routed
body ledgers remain nonnegative. This is not a general coordinator for closed
pools, partially saturated siblings, outlet-free terrain, or competing
stationary branches.

## Input And Result

Inputs are original Int16 ground, original binary marine mask, exact upstream
basin geometry, attributed local dry-land runoff, baseline Uint8 precipitation,
and baseline Float32 potential demand. The shared geometry schema is unchanged.
Runoff is explicitly `number[]`: each supplied value retains its precision,
with no silent Float32 conversion or reconstruction from rainfall/humidity.
A caller widening a Float32 source must preserve those values, not pretend
they are the earlier double-precision formula. Marine runoff must be zero.

All fluxes use rainfall-index times unit tile area per representative interval.
Runoff must be local, not accumulated; baseline precipitation and demand are
separate forcing owners. Their attribution and canonical upstream geometry
provenance are orchestration preconditions. Runtime admission validates shape,
cardinality, finite nonnegative forcing, binary mask, raw adjacency and
nonascending ground, acyclicity, leaf labels, nested catchment partitions,
hypsometry, and recorded spill endpoint/height consistency. It does not rerun
the geometry solver or independently prove minimal-saddle optimality.

Malformed input throws before any support decision. A well-formed input
outside the bounded domain returns `status: unsupported` with one typed
witness and no `plan`. Witnesses distinguish an outlet-free root, an
uncertified node response, admitted external land-edge terminal, disconnected
wet footprint, shared equal-level wet body, cyclic candidate, or negative
actual body outflow. A negative-body witness retains the exact signed ledger;
it is not a clipped or partially admitted solution.

A supported result publishes strict wet mask, water surface, adjacent
receivers, explicit marine terminal types, root body IDs, dry-only discharge,
mixed-body ledgers and exact outlets/connectors, node certificates, marine
exit fluxes, and global conservation evidence. All flux outputs remain Number
precision. Zero entries in `dryDischarge` on wet/marine cells are sentinels,
not allocations of body flow to individual wet tiles.

## Certification And Routing

Each node is evaluated with the shared single-pool budget policy using its
exact raw catchment, attained floor/merge height, finite spill, and zero
incoming overflow. Every node must reach the sill with positive balance
without encountering an earlier nonpositive cohort. This is sufficient
raw-catchment forcing support; it is not yet proof of the routed endpoint.
The operation and the existing budget operation use one policy implementation,
not operation-to-operation calls or duplicated budget formulas.

For a root with spill height `S`, wet cells are exactly its catchment cells
with `ground < S`. Ground-equal sill cells stay dry. Water surface is `S` on
those strict wet cells and original ground everywhere else.

Begin with raw receivers. Follow raw receivers from the recorded spill's
inside endpoint until first entering that root's wet footprint. Every
preceding connector cell must be dry, inside the root catchment, and exactly
at `S`. Reverse only that connector path toward the recorded outside endpoint.
All other dry local receivers remain unchanged, including every upland local
receiver above the sill.

The wet footprint must be connected. A BFS orients its internal connectivity
toward the one wet outlet. Distinct roots touching as one equal-level wet
body are explicitly unsupported rather than pretending they are independent
reservoirs. The complete cell graph is checked for adjacent nonascending dry
ground links, nonascending water surface, acyclicity, and eventual termination
at original marine water. No surface conditioning is performed.

Each strict wet body is then contracted to one mixed node. Dry cells carry
their local runoff plus actual incoming discharge. Bodies use the same shared
budget policy at their already attained sill, summing actual incoming overflow
and wet precipitation minus wet demand. Internal BFS branches never accumulate
signed wet-cell flux. A quotient cycle would expand to a cell cycle because
every body entry reaches its sole outlet; both graphs are checked explicitly.

Reversing a dry sill connector may cause its upstream runoff to bypass that
body, even though those uplands keep their local raw receivers. Therefore raw
node certificates are not blindly transferred to the final routing. Every
actual body outflow is independently required to be nonnegative, including
zero, without a positivity tolerance. The final ledger checks:

```text
sum(dry local runoff) + sum(wet precipitation)
  = sum(wet demand) + sum(marine exit discharge)
```

Only this accumulation comparison uses an operation-count-derived floating
roundoff bound. It cannot turn negative body flux into an admitted outflow.

## Discriminating Evidence

A global priority-flood reconstruction of the full-spill surface passed exact
surface and acyclic-routing checks yet failed three of 43 retained forcing
cases. In Earthlike Huge seed 1018 with dry baseline forcing, it diverted two
ground-69 uplands from a spill-66 four-cell body. The hot case lost incoming
runoff `105.276938` and produced body outflow `-61.686279`. Preserving raw
uplands and using the recorded outlet instead gives `43.590659`. Temperate
and cold variants fail and recover in the same way.

The recorded-sill prototype passed all 43 retained cases and a subsequent
unchanged Earthlike seed 0 through 31 sweep in Standard and Huge. The sweep
stopped on first unsupported input by construction; none occurred. Together
the captures cover 85 distinct physical maps, not universal seed support.
The public operation replayed all 105 distinct forcing cases with exact
receiver, footprint, connector, and body-flux parity across 3,778 body
evaluations; repeated results and inputs were unchanged.

A necessary counterexample remains rejected. On the cylindrical profile
`[-1, 1, 2, 0, 3, -1]`, with endpoint marine cells, raw catchment `[3, 2]`
contains a pit at 0 and a dry sill at 2. Supply `20.5` only at the dry sill
and wet demand `10` only at the pit yield positive raw cohort balances
`20.5` and `10.5`. The actual outward route makes the sill supply join
downstream of the wet body, whose ledger is `-10`. Global scalar conservation
alone would miss this failure. The operation returns a negative-body witness
and no plan.

## Verification And Boundary

Focused tests exercise marine-only and dry-coast maps, nested basins, mixed
positive/negative wet-cell forcing, supplied double precision, explicit sill
reversal, nonmonotone first-cohort rejection, dry/outlet-free/edge refusal,
determinism, immutability, conservation, malformed geometry/forcing, and varied
finite hex-grid hierarchies. Existing geometry and single-pool budget fixtures
remain unchanged and pass after shared schema/policy extraction.

Independent review found no actionable behavioral defect. The owner proof
passes 755 tests across 195 files, source/test/tools TypeScript checks, and
Habitat policy. The focused geometry/budget/network set passes 47 tests with
17,548 assertions. Shared runtime schemas retain exact pre-extraction shape.

The implementation is preparatory. Native whole-body admission, post-water
exposed landforms, final recipe orchestration, production lake acceptance,
and general closed/partial basin coordination remain separate work. No
captured count or lake-area ratio becomes an acceptance threshold here.
