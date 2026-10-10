# Start Resource Coherence

## Intent And Boundary

Close start placement against the resource plan that actually exists on the
resolved surface. Preserve the current radius-four, floor-two, gap-two support
contract, habitat/policy admission, physical water, terrain, and resource gains.
Every admitted player remains accounted for. This is a placement-owner change,
not a new resource-capacity proxy, water repair, or scientific target change.

The retained water-owner arm is the baseline: 57 direct captures and 57 public
evaluator cases under one source/runtime pin in
`water-owner-cohort-20261001`. Its evidence root is
`<user-home>/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration`.

## Witnesses

| Case | Existing Final Support | Diagnosis |
| --- | --- | --- |
| Earthlike Standard/1337 | `1,2,5,2,5,4,6,3`; gap 5 | Seat 0 at plot 3146 has only one distinct policy-and-habitat-admitted radius-four resource plot, 3482. Three resource types share that one plot. Floor two is impossible at this seat. |
| Earthlike Huge/1234 | `7,7,6,7,6,9,7,7,9,4`; gap 5 | Seat 9 at plot 679 has 32 distinct admitted plots but only hides and wild game. Existing same-type spacing blocks every extra site there. Raw habitat capacity would overstate usable support. |

These are the only Earthlike floor/equity/support-shortfall failures among the
57 retained adjusted plans. Desert Mountains Huge/1538316415 independently
has selected seats with distinct admitted capacities `0,1,1,1`; it supplies an
adversarial held-configuration case rather than justification to widen habitat.

The current downstream inputs use final exposure, final coast, final landmasses,
and current engine legality. No stale-landmask caller defect was established.
The start owner instead scores planned resources at radius one, normalizes that
signal by the mapwide maximum, and applies it only as a soft component. Its
full-status admission never establishes the radius-four resource contract.

Replaying the existing support operation from retained artifacts is exactly
deep-equal to both Earthlike adjusted plans. A Standard/1337 seat-only probe
replaces plot 3146 with existing island-cluster candidate 791 and obtains
`3,3,5,3,5,4,4,3`, gap two, no shortfalls, two moves, and no additions. A
Huge/1234 replacement of seat 9 with candidate 891 reduces the terminal gap
to three, not two. A one-seat or floor-only change is therefore not evidence
that the whole bank is solved.

The candidate replay uses planned wonder anchors because native footprint
readback was not retained. It reproduces the exact selected seats, but admits
one extra Standard and three extra Huge candidates. Candidate alternatives
still require the full recipe's current wonder-footprint admission; this probe
does not waive that boundary.

## Owner Design

Use the existing `placement/plan-starts` operation and its selection ladder.
Count distinct, exact planned resource plots at the same support radius as
the resource owner. Select jointly from bounded count bands whose lower edge
is at least the support floor and whose width is at most the equity tolerance.
Reuse the existing regional allocation, spacing ladder, and fairness machinery
over those resource-backed candidate pools; do not implement a second seat
selector. Select the strongest feasible result by completed player seating,
existing rung/spacing guarantees, and candidate quality, with deterministic
ties. Both the regular pool and quality-relaxed reserve obey the same resource
band. No count-band admission promises capacity from unplaced alternatives.
Requested homeland allocation is computed once from all floor-supported,
tier-admitted regular candidates, bounded by their regional count and the
existing physical spacing ceiling. A balance bias cannot create a normal
request for an intrinsically unsupported homeland using its old land
population. Every resource band receives fresh mutable seat identities with
that same immutable requested allocation. Band-local candidate capacity then
limits realization through the existing selection ladder and recorded regional
relaxation; it does not redefine requests before ranking its own compliance.

A complete resource band establishes planned-site floor and equity only. The
unchanged ladder may still use a quality, region, or spacing relaxation; its
existing degraded statuses, achieved spacing, flags, and fairness evidence
remain authoritative. Complete seating with supported resources is not proof
of full-status placement or strong playability. Spacing and fallback-rate
targets must pass independently in the final recipe evaluation.

The unchanged resource support owner runs after this selection. Since selected
starts already meet its floor and gap, it need not manufacture or relocate
resources to rescue an infeasible start. Candidate quality, water/wonder
exclusion, player identity, region evidence, and spacing remain independently
enforced. Former seats may legitimately move; preserving formerly selected
seats is not a reason to introduce a legacy branch or to execute resource
support from inside the start owner.

A resource count is executable evidence, not hypothetical capacity. Do not
derive a new Habitat field, equate type/plot pairs with distinct sites, ignore
same-type spacing, manufacture resources, or use intensity as a new admission
gate. Existing demand/site/support operations retain resource authority.

Authoring details to review with the SDK reviewer:

1. `adjust-resources` currently owns the authored radius/floor/gap values. A
   supported placement-stage `public`/`compile` mapping can preserve today's
   per-step authored surface and forward those values once into start
   planning. Compose exact existing step schemas; expose no duplicate knobs
   and publish no configuration-as-truth artifact.
2. Forward exact planned resource indices and the small support requirement
   value into the existing start operation. Select the radius/floor/gap part
   of the existing resources-owned settings atom, not an operation or artifact
   payload. No resource algorithm extraction, cross-module support execution,
   new operation, proxy artifact, or additional selection engine is needed.

There is no acceptance by cohort pass count. If no admitted seat set can meet
the product contract, preserve every player and publish explicit typed
degradation/refusal through the existing product boundary. Do not label such
seats full, relax habitat or floors silently, or hide scientific failure.

### Stable Requests Across Resource Bands

This refines the original band-local quota-ceiling decision above. The
homeland design's D2 allocation precedes selection; D4 records failed regional
realization as relaxation. Restricting allocation separately for each support
band instead makes regional success incomparable. Standard Earthlike seed
`1340` has globally supported regional capacities `1166/70` before the basin
repair and `1165/70` after it; both apportion eight requests as `6/2`. A
resource-rich `10..12` band has capacity `87/0` and previously redefined its
request as `8/0`, outranking a balanced `3..5` band realizing `7/1` against
`6/2`. Those eight regional successes satisfy a different request, not the
shared homeland obligation.

Keep the existing ordering: complete seating, hard spacing, achieved balance,
regional compliance, then candidate quality and support tie-breaks. The
`10..12` band must now record its two east-to-west reassignments. Each band's
selection-region mutations remain local to that attempt; the original requested
region and player identity remain stable. Quality-relaxed reserve admission,
under-capacity top-up and lawful refusal retain their existing meanings. No
fertility threshold, score gain, resource-site manufacture, policy knob or
second selector is introduced. Full operation replay, including reserve
rungs, and the unchanged cohort decide whether this owner correction repairs
the observed downstream loss.

The implemented correction passes 45 focused tests with 828 assertions and
source/test TypeScript. Both new stable-request discriminators fail against
the previous implementation and pass against the correction; the existing
balanced regional-preference guard remains unchanged. Complete operation
replay retains all fifteen bands, including reserve admission, and exactly
reproduces the admitted operation output with immutable input and deterministic
repeat. Current basin-corridor input selects `3..5`: requests `6/2`, realization
`7/1`, all eight legal freshwater seats at spacing at least six, support
`[3,4,3,3,3,3,5,3]`, balanced gap `0.08265420482797337` and fertility advantage
`1.1796923673994837`. One east-to-west move remains explicitly degraded. The
preceding qualified input retains exactly its former seats and measurements.
Independent SDK review is aligned. Fresh owner graph, full unchanged bank and
native realization are separate subsequent admission gates; focused success
does not waive them.

The normal 122-task owner check/build graph subsequently passes. The complete
22-study, 57-scenario public evaluator closes the new placement-fertility
failure with no new failures; all 4,430 expectation identities, descriptions and
comparators remain byte-identical to the preceding qualified bank. Its sole
retained failure is the unchanged independent within-row thermal requirement,
not a placement waiver. Full Huge 1018 capture also preserves all 38 model
fields, projection, resources and seats against the basin-only arm. This
establishes portable admission of the owner correction, not native movement.

## Acceptance And Proof

- Exact baseline replay of Standard/1337 and Huge/1234 before modifying the
  owner; retain seeds, config, resource intent and eligibility fields.
- Both witnesses satisfy realized floor two, gap at most two, no support
  shortfalls, and complete player seating after a full recipe replay. Native
  resource outcomes, rather than the planning proxy alone, decide success.
- Physical, climate, habitat, and resource source artifacts retain their
  scientific meanings and collateral holds. Feasible former seats may move as
  the intentional gameplay repair; no legacy selection branch or blanket
  radius/score retuning is introduced.
- Overlapping seat radii count each actual plot once for each seat; several
  types admitted at one plot do not create multiple resources. Shared sites
  must be evaluated jointly, not as independent seat capacity.
- Out-of-grid integer indices are ignored without 32-bit coercion. In
  particular, `0` and `4294967296` cannot fabricate two sites at plot zero.
- Same-type spacing, cross-type clearance, exclusions, count ranges, region
  minima, qualifying-landmass density, and unchanged move/add budgets remain
  authoritative. Feasible support transfers and infeasible seat admission
  get distinct tests.
- A resource-free/under-capacity map retains every player as explicit lawful
  refusal/degradation, with no fabricated eligibility or hidden fallback.
- Run focused start/support operation tests, placement materialization and
  config compilation tests, source/test types, then the existing 57-case
  public evaluator with fresh dependencies. Compare held physical/climate
  artifacts and actual placement outcomes, not only target booleans.
- Review the actual patch against `mapgen-sdk-simplicity-steward` before
  sealing. No new harness, SDK registry, live execution, or target waiver.

## Current Verification

The unmodified focused support/start tests passed 39 tests and 862 assertions
in `water-owner-placement-leaf-20261001.log`. Retained-data admission scans and
the exact support-operation replays above ran without source edits or builds.

The implemented owner, compile forwarding, and materialization boundary pass
53 focused tests with 921 assertions in
`start-resource-coherence-leaf-20261001.log`. Source TypeScript and test
TypeScript pass; test diagnostics are retained in
`start-resource-coherence-test-types-20261001.log`. New tests cover both retained
owner-input witnesses, overlapping/deduplicated sites, out-of-grid integer
identity, zero-supported-region quota, an individually supported population
with no complete equity band, actionable materialization refusal, and exact
forwarding from the one authored support contract. Both witness tests also
assert at least six tiles of achieved spacing; they do not assert that every
selected seat retains its old region or full status.

A provisional source-operation replay over all 57 retained plans, before the
final integer-identity and quota guards, found complete seating and exact
planned-site floor/gap compliance. This uses anchor-only wonder observations
and is not full-recipe or native-placement proof. Some source-replay seats
retain explicit region/quality/spacing degradation; the aggregate planned-site
result does not waive those independent placement gates. Final
57-case evaluation and pinned capture followed a fresh owner graph after
both start-resource coherence and the external-water Y-boundary correction
stabilized. All three public floor/equity/shortfall expectations now pass;
the public evaluator retains only the independent thermal and relief
expectations. Source/runtime pins remain stable through both execution passes,
all 3,192 captured artifacts reconstruct exactly, and all 28 held upstream
owners agree. The immutable v1 water-owner capture is not overwritten.
The current receipt is
`water-start-owner-cohort-v2-20261001/capture/receipt.json`, SHA256
`e8cb9c05496b70db18d8720fb79fd511bfec4413dc98bb3a6b4661e43c984ede`.

Independent final SDK review is aligned, with no open finding after the exact
integer-identity correction. The owning Nx check and its 22 dependencies pass.
Full generated cohort proof still does not establish native resource placement,
vessel movement or complete scientific calibration.

The final graph passes all 271 Civ realization tests. Definition tests pass
1,106 with one aggregate failure retaining the two independent thermal and
relief expectations. Studio passes 411 tests but initially rejects the explicit
placement public schema's six missing descriptions. The supported SDK schema
composition now supplies those descriptions without changing configuration
values or algorithms; the focused Studio schema suite passes both tests and
the fresh definition check passes. Evidence is retained in
`water-start-final-graph-20261001.log` and
`start-public-schema-metadata-check-20261001.log`. This fixes authoring metadata,
not a scientific expectation.

An additional exact saved-setup replay uses Huge Earthlike, seeds 1018/1018 and
all twelve player IDs. Every seat is unique, full and regional; there are no
unseated players or resource-support shortfalls. Realized support counts are
`[5,4,3,3,5,3,5,3,3,4,3,5]`: the minimum is three against the held floor two,
and the gap is two against the held tolerance two. Resource additions and
moves are zero. Every non-placement published artifact is byte-identical to
the pinned ten-player v2 capture. The receipt is
`relief-owner-causal-20261001/exact12/receipt.json`, SHA256
`2c4bf3b141a06168cdab77bffbd6edab36d22fbd26497f022ffcebeb18b3864c`.
This is deterministic full-recipe mock proof, not a native runtime claim.
