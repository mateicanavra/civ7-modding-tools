# Source-Limited Rainfall

**Goal:** Coherent wet/dry regions whose forcing reaches basins, rivers and
ecology without manufacturing atmospheric supply from dry land or terrain.
**Status:** Architecture scope approved for implementation on 2026-10-09.
The provisional numerical scheme is unexecuted and not admitted for production.
**Owner:** Swooper Physics, Hydrology's Climate module.

## Why This Is The Next Product Story

The [deficit pilot](annual-land-response-owner-decision.md#completed-deficit-pilot)
is closed with zero gain. That does not disprove land-water coupling or select
another temperature fit. Current source inspection instead exposes a useful
upstream relationship decision: land moisture is injected from temperature
alone; fixed-pass transport does not debit rainfall; later rainfall synthesis
adds coastal, relief and noise terms; returned humidity is encoded rainfall.
These are explicitly empirical approximations, not a violation of an existing
promise of atmospheric mass conservation.

They are insufficient for the stronger proposed interpretation that warm dry
regions emerge from source availability and upstream rain depletion. Repair
that relationship for hydrology first, holding the thermal backbone fixed.
Do not make resolving every annual temperature residual a prerequisite.

Real evaporation/transpiration depends on water availability as well as
atmospheric demand; rain-shadow behavior involves moist-air ascent and the
subsequent leeward regime. Those processes motivate this abstraction, not its
coefficient values or exact equations. See [USGS evapotranspiration](https://www.usgs.gov/water-science-school/science/evapotranspiration-and-water-cycle?page=0)
and [Smith and Barstad's orographic model](https://journals.ametsoc.org/view/journals/atsc/61/12/1520-0469_2004_061_1377_altoop_2.0.co_2.xml).
The latter distinguishes moisture influx, advection and fallout and documents
the limits of simple upslope estimates; it does not prescribe this scheme.

## Current Authority And Vintages

All paths in this section are under
`plugins/mod/map/swooper-physics/src/`.

| Owner | Actual responsibility |
| --- | --- |
| Climate `compute-evaporation-sources` | Temperature-only land supply; marine SST/ice/wind scaling |
| Climate `transport-moisture` | Receiver-gather normalized proxy; source reinjection, retention and clamping; explicitly not a mass budget |
| Climate `compute-precipitation` | Post-transport empirical rain and rainfall-derived humidity |
| Climate baseline step | Seasonal/weather-member orchestration at the final prescribed SST coupling vintage, then annual publication |
| Hydrography network step | Dry runoff from baseline P/wetness; finite wet footprints from baseline P and mean seasonal D |
| Climate refine step | Post-network ecological climate; currently adds river/basin bonuses to rain and recomputes D from annual adjusted temperature |

Dry runoff does not presently consume D. Wet basin accounting replaces
submerged dry runoff with direct P-D; it must not add both. Refined ecological
rainfall is not the baseline supply that produced the basin network. Preserve
these distinctions in comparisons and repair the meaning of any changed
handoff explicitly.

The baseline artifact's description that D is zero on original water is stale:
the operation computes all cells and baseline publishes those values unchanged.
Correct that description with the affected contract work; do not silently zero
water demand and thereby alter wet-footprint behavior.

## Alternatives And Recommendation

| Alternative | Benefit | Limit |
| --- | --- | --- |
| A: Honest empirical proxy | Cheapest: retain texture synthesis, remove misleading humidity/budget interpretations, tune source-supported rainfall contrasts | Cannot represent upstream depletion causing downstream dryness; receiver-gather and independent rain bonuses remain an attribution limit |
| B: Lean source-limited moisture account | One coupled transition supplies, transports and rains out admitted model water; useful causal wet/dry differences | Changes forcing contracts and needs calibration; accounting correctness alone does not establish Earthlike weather |

Recommend B because the desired product relationship is source and terrain
control of downstream water, not merely plausible rainfall colors. This is not
a recommendation for a complete water or energy cycle. The strongest argument
for A is lower cost and fewer changed contracts. If B cannot demonstrate a
useful early procedural contrast within the player-path budget, prefer the
explicit proxy rather than expanding B into a climate simulator.

## Bounded Causal Design

```mermaid
flowchart LR
  A[Final seasonal atmosphere and initial external-water mask] --> B[Marine moisture supply]
  B --> C[Bounded transport and rainout]
  C --> D[Baseline model precipitation and wetness]
  D --> E[Dry runoff and finite basins]
  E --> F[Surface wetness and ecology]
  D --> F
  classDef physical fill:#dff2e4,stroke:#287247,color:#142d1c
  classDef consumer fill:#e5edf8,stroke:#356b9d,color:#172e45
  class A,B,C,D physical
  class E,F consumer
```

- Keep radiation, temperature, pressure, winds, currents, SST iterations and
  seasonal/weather-member selection unchanged. No new thermal feedback or fit.
- Unbounded marine source eligibility is the admitted initial topography's
  `externalWaterMask`, not every cell where initial `landMask` is zero. Finite
  initial inland pockets have zero local source in this slice. Existing prescribed
  SST/ice fields remain upstream inputs; this does not redesign ocean geography.
- Use one cohesive Climate operation for the coupled moisture transition,
  with private source, transport and rainout rules. Replace the superseded
  production choreography; do not retain a fallback or competing strategy lane.
- Use explicit model water per unit grid area per representative interval,
  not metres, millimetres, physical years or independently conserved Earth
  surface mass. Existing basin unit tile area remains the model convention.
- Define one integration horizon H and subdivide it into N fixed passes.
  Allocate source, transport and extraction rates over H; increasing N must
  not inject N complete sources, create N times the rain or multiply travel
  distance. Freeze grid-spacing/transfer scaling with selected map dimensions
  so resolution is not a hidden climate knob.
- Initialize atmospheric storage to zero, or declare and account for any
  other initial stock. Transfer a donor-bounded fraction over shared hex
  adjacency, retaining the remainder. Wrap X; unavailable bounded-Y shares
  stay at the donor unless an explicit boundary flux is recorded.
- Rainout occurs within each pass. Extraction cannot exceed available stock;
  subsequent transport consumes the residual. Coast, relief, convergence and
  seeded variation may modulate extraction, not add water independently.
  Do not treat the existing gather interpolator as a conservative transfer.
- First story: land re-evaporation is exactly zero. This is an explicit
  omission, not a terrestrial equilibrium claim. It avoids an invented soil
  store and spending the same deposited water twice. Future recycling requires
  gross P, actual land E and net land delivery/storage accounting; dry runoff
  could not continue consuming gross P as though recycled water remained there.
- Account for marine supply, atmospheric storage, precipitation and any
  declared boundary loss. Do not clamp away unrecorded overflow. This ledger
  qualifies the atmospheric model only, not a conserved full water cycle.
- Preserve float model P through dry runoff and finite-basin input. Derive
  the Civ7 byte/color rainfall codec separately, recording its quantization/
  clipping residual. No cast around existing byte-only contracts.
- Keep potential demand an explicitly empirical demand index initially;
  preserve its seasonal reduction and disclose its rainfall-derived wetness
  modifier. Do not call it actual ET or independently measured air humidity.
  Any independent atmospheric-moisture diagnostic has a distinct meaning.
- Keep river wetness only in the existing effective surface-moisture channel,
  not atmospheric P; remove duplicated riparian rainfall boosts rather than
  relocating every old bonus. Delete terrain-only enclosed-basin rainfall.
  No new lake-body wetness law is admitted here. Resolved lakes do not rerun
  or rewrite their own baseline forcing.

### Common Quantity And Reduction Contract

Choose the model-water unit as one existing empirical rainfall-index equivalent
per unit tile area over one representative interval. H represents that same
interval; atmospheric storage and integrated deposition are model amounts,
while source/extraction rates are integrated with `H/N`. Normalize accumulated
P to the declared interval before baseline publication. Express D over exactly
that interval in the same index-equivalent units before wet-basin P-D; the
byte codec is not the P/D unit conversion. Freeze this normalization and source
amplitude before execution. Changing H or pass count cannot silently rescale
basin supply relative to D. This preserves an empirical closure, not actual ET.

For each weather member, derive empirical surface wetness from float model P
as `clamp01(P / 200)`, without routing through the byte codec. Average member P
and member wetness independently within the phase, then compute phase D using
that phase's temperature and averaged wetness. Apply calendar weights to phase
P, wetness and D for annual publication. Do not compute D from annual-mean
temperature or move the nonlinear wetness clamp after member averaging.
This retains the existing causal reduction order while deliberately removing
byte quantization from forcing. Refined ecological D retains its separate
annual-temperature vintage; its response is measured, not assumed identical.

### Selected Numerical Scheme

The following closes the initial technical choice, not its empirical
calibration or implementation review. Use one first-order split transition:
exact local source/rainout, then conservative donor scatter. Initialize stock
q and deposited P to zero independently for every weather member. H is exactly
one representative interval, not a physical year or a settling horizon.

| Quantity | Initial choice | Meaning |
| --- | --- | --- |
| Marine source amplitude E0 | 300 | Model-water units per unit tile area per interval |
| Background extraction k0 | 1.2 | Fractional extraction rate per interval |
| Added ascent extraction k1 | 4.0 | Maximum additional fractional rate per interval |
| Reference transport speed V0 | 20 | Reference projected edge lengths per interval at maximum encoded speed |
| Terrain-gradient reference G0 | 300 | Existing model-relief units per reference projected edge length, not metres |
| Integration | H=1; nominal N=64 | dt=H/N; rates do not change with N |

E0 and G0 are distinct quantities despite their equal initial numbers. These
are provisional product choices, not fitted Earth rates or conversions of the
incumbent rainfallScale, retention or advection coefficients.

For encoded wind u,v, let s=min(1,hypot(u,v)/127). Retain the recognizable
existing marine temperature/ice/wind factors, but give their amplitude the
declared source unit:

```text
theta = clamp01((prescribedSST + 10) / 42)
e = E0 * wetnessScale * externalWaterMask * theta
       * (seaIceMask == 1 ? 0.08 : 1) * (0.65 + 0.35*s)
```

Prescribed SST is the existing final coupling vintage. The current baseline
already passes oceanThermal.sstC and seaIceMask for every weather member;
require those inputs rather than carrying the old optional thermal fallback
into the new operation. wetnessScale multiplies supply once, never extraction,
publication or rainfall
again. Land and finite initial inland water have e=0. No coast, noise or
convergence rainfall bonus is retained; convergence can concentrate admitted
stock through transport instead. Retire the old moisture-stage knob mappings
that changed numerical pass count, coast radius or independent rain gains;
preserve upstream thermal/current/wind mappings. Do not emulate obsolete
coefficients through a compatibility lane.

Use the SDK's downwind bracketHexNeighborDirectionsOddQ and canonical cached
direction vectors. The legacy names implement odd-R row-parity geometry.
Normalize the two direction vectors to unit length; their barycentric weights
w0+w1=1 give b=w0*n0+w1*n1 and rho=length(b), with sqrt(3)/2 <= rho <= 1.
For width W, freeze h=84/W and donor rates:

```text
a[j,k] = V0*s[j]*w[j,k] / (h*rho[j])
f[j,k] = dt*a[j,k]
```

Calm cells have zero transfer. The rho correction preserves the resolved
vector direction and speed, rather than slowing oblique flow. Standard 84x54
has full-speed mean center displacement 20 tile-edge lengths; Huge 106x66 has
25.238. Expected hop count is displacement/rho, not exactly that displacement.
Normalized zonal reach is the same; normalized meridional reach differs by
about 3.25% because the aspect ratios differ. This is a declared planar
convention, not spherical Earth distance or a hard plume-length limit.

Require dt*sum_k(a[j,k]) <= 1 for every donor. Select
N=max(64,ceil(2*V0/(h*(sqrt(3)/2)))) to retain a one-half worst-case export
margin on larger widths. N=64 for both named sizes; their maximum outgoing
fractions are approximately 0.361 and 0.456. Refinement changes N only, not
source, rainout, transport speed or horizon. An inadmissible explicit test
resolution is refused, not rescued by clipping a transfer fraction.

Compute net-inflow terrain ascent at the landing land cell using the same
actual incoming donor rates, before dt or stock is applied. Define Z as ground
elevation minus seaLevel on initial land, zero on external water, and undefined
on other initial water. This uses the admitted external surface, not its bed.

```text
A[i] = max(0, sum over incoming j->i: a[j,i] * (Z[i] - Z[j]))
uplift[i] = clamp01(A[i] / (V0*G0))
k[i] = k0 + k1*uplift[i]
```

Only initial land receives added ascent extraction. Skip undefined-height
edges without renormalizing. Take the positive part after the signed sum:
uniform wind along a planar contour must not create ascent merely because the
bracket uses two rays. The first coastal plateau cell recognizes a rise from
the external sea surface even when its downwind terrain is flat. Common datum
shifts and changes to marine bathymetry leave this rule unchanged.

This is a net-inflow terrain-ascent proxy, not resolved parcel ascent. Under
varying winds, uphill and downhill incoming-capacity contributions can cancel
regardless of their different moisture contents; incoming transport capacity
can also exist without much stock. Keep that limitation visible rather than
introducing parcel tracking or another solver.

For each cell, integrate dq/dt=e-k*q locally, then scatter its residual:

```text
z = k*dt
r = -expm1(-z)
psi = 1 - r/z
rain = q*r + e*dt*psi
qResidual = q*(1-r) + e*dt*(1-psi)
P += rain
```

At k=0 use rain=0 and qResidual=q+e*dt. For 0<z<1e-4 evaluate
psi=z/2-z*z/6+z*z*z/24-z*z*z*z/120 to avoid cancellation; otherwise use the
expm1 expression. Do not clip away negative roundoff as unrecorded rain.
Send f[j,k]*qResidual to each valid neighbor and retain the remaining stock.
Wrap X; missing Y shares stay at the donor with no directional renormalization.
Accumulate directional aliases on narrow grids and double-buffer stock so
received water cannot travel again during that pass. Last-pass arrivals remain
atmospheric storage, not forced precipitation. Landing-cell ascent acts on
new arrivals in the next pass: a declared first-order splitting delay.

Use owned Float64 stock/deposition scratch and precomputed member-local rates,
geometry and local decay/source coefficients; do not evaluate exponentials
inside the pass loop. Publish Float32 P and derive member wetness from that
published float product. Avoid per-pass Float32 stock rounding. Temporary arrays remain
operation-local, not new artifacts. Pulse/zero-extraction controls exercise
the private transition kernel; production still starts with zero stock.

### Precision And Decisive Controls

For M equal-unit-area tiles, define Q=initialStock+H*sum(e), boundary loss B=0,
and epsilon64=Q-sum(P64)-finalStock. Record the separate signed publication
residual r32=sum(P32-P64). Then the raw published ledger residual is
epsilon64-r32. If stock is also rounded for diagnostics, record its own
residual. Neither precipitation nor boundary loss may be defined as whatever
number closes the ledger; byte rounding/clipping is a third, separate account.

Freeze the Float64 engineering guard as gamma(K)*Q, where
gamma(K)=K*2^-53/(1-K*2^-53) and K=64*N+4*M+16 is the conservative initial
mass-update/reduction budget. Audit that count against the actual loop before
execution; changing the margin requires a documented arithmetic reason, not
a failing result. The raw Float32 ledger adds the sum of half-ULPs of published
values, including subnormal rounding. Equivalently, add back measured r32 and
apply the Float64 guard. This is a roundoff guard, not an error allowance for
the physical approximation or an unconditional proof about JavaScript libm;
the analytic controls must qualify the local formula on the selected runtime.
Ledger/oracle readback belongs in tests and studies, not fatal instrumentation
in the ordinary baseline recipe.

Use the existing focused operation tests for six discriminator groups:

- Zero stock/source stays exactly zero despite warm land, ridges or inland
  pockets; closed finite water is not an unbounded marine source.
- Calm constant source/extraction matches q(H)=e*(1-exp(-k*H))/k and
  P=e*H-q(H), independently of N, including the k=0 limit and small z.
- A declared pulse with no source/rain preserves stock and the prescribed
  centroid under uniform interior wind, for both parities and oblique rays.
  Pure-east variance is L-L*L/N, L=V0*s/h: numerical spreading is expected,
  not missing water. Use an unclipped private-kernel fixture for this oracle.
- Flat/ridge and coastal-plateau/reversed-wind cases discriminate windward
  extraction and downstream depletion; along-contour wind gives no added
  planar ascent. Datum shifts and marine-bed changes preserve the result.
- Variable wind, narrow-grid aliases, the X seam and outward Y flow preserve
  nonnegative stock and the account. Missing shares remain at their donor;
  no boundary-induced redirection or invented inland surface is accepted.
- At fixed H and rates, N=64/128/256 on predeclared smooth manufactured
  inputs with nonzero Q must satisfy
  D128,256 <= 0.7*D64,128 + roundoffGuard for L1 P differences, and keep
  D64,128 below 1% of Q. Apply the same test to stock
  distribution; verify center displacement independently and
  report graph-distance quantile reach, not the farthest nonzero tail.
  Sharp fronts retain exact budget/positivity and reported spreading rather
  than inheriting a false universal 1% spatial-error promise.

The L1/contraction limits are provisional numerical acceptance choices, not
Earth accuracy margins. The four paired procedural cases remain the separate
product discriminator. Existing rainfall-saturation and river-hierarchy
requirements remain unchanged; no number here waives them or establishes
Earth rainfall skill. No tests, simulation, fitting or candidate execution
have yet qualified this selected scheme.

## SDK And Ownership

Use the existing Climate module contract/router, leaf-local `defineOp` and
semantic `createStrategy` binding. Rules own computation; the current baseline
step composes operations over declared seasonal/weather samples and publishes
the consumer product. Numerical passes are invocation-local, not artifacts,
new steps or a second registry.

Keep the existing pre-network and post-network immutable publication
boundaries. A cohesive baseline consumer bundle may include model P and its
derived codec, with explicit field meanings; ADR-022 does not require one
artifact per temporary array. Forward readonly inputs through current SDK
admission and allocate only owned working/output storage. No type casts,
custom generic builder, mutable ambient field or Core redesign is needed.

Authority: [operation contracts](../../system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md),
[artifacts](../../system/libs/mapgen/reference/ARTIFACTS.md) and
[the physical facet](../../../.agents/skills/civ7-mapgen-workstream/references/facet-physics.md).

## Deliverables And Sequencing

One existing worktree and Graphite lineage; merge each qualified layer before
building the next. The following are complete product units, not empty branches.

1. **Owner and contract slice.** Review the selected numerical specification
   above, including its provisional coefficients, quantity meanings and
   manufactured falsifiers. Following architecture approval, implement the
   coupled operation and its focused
   manufactured controls together. No production recipe switch yet.
2. **End-to-end candidate slice.** Wire the operation and float forcing through
   baseline, runoff and finite basins; move ecological wetness out of P and
   retire replaced paths. Preserve seasonal mean D and explicit refined
   vintage. Run the four existing paired procedural cases immediately after
   owner controls, before a large study bank. Publish causal maps and network/
   biome contrasts, not only global averages. After focused definition and
   realization checks, produce an early Huge Earthlike candidate native
   contrast/gallery through the existing run/controller path. Label it as
   candidate evidence, not adopted climate or universal navigation proof.
3. **Product calibration and visible qualification.** If the product signal
   survives, use the admitted procedural/coherence controls and retained stress
   maps, with Earth geography as a fixed-input diagnostic only. Run full owner
   checks and unchanged collateral studies, then fresh
   Huge Earthlike native captures and bounded relevant gameplay qualification.
   Thermal residual closure remains a separate requirement.

There is no admitted empirical Earth precipitation/reference-conversion fixture
in this packet. The existing [Earth calibration plan](earth-calibration.md)
still describes independent forcing/units and coupled hydrology skill as E2/E3
work; thermal observations and a fixed coastline are not rainfall truth.
Manufactured causal/accounting acceptance, procedural/player acceptance and
empirical Earth moisture skill are separate. This story can qualify the first
two without claiming the third or opening a rainfall-data research program.

Physics review and SDK review can run in parallel; implementation and adoption
are sequential. Native projection changes are out of scope unless correlated
readback identifies a new disagreement with the admitted forcing/network.

## Acceptance And Falsifiers

Use the current definition-owned study bank, metrics and ordinary map-size/
seed selection; no parallel framework. Before candidate execution, record the
exact config/build identities and a small expectation ledger with the existing
controls: Huge 106x66 seed 1018; Standard 84x54 seeds 1018, 1 and 42, each using
the corresponding fixed map/game seed pair.

| Claim | Required discriminator |
| --- | --- |
| Supply is source-limited | Zero source/initial stock gives zero P; every extraction and donor transfer is bounded; Float64 oracle and magnitude-scaled Float32 ledger margin |
| Terrain changes downstream moisture | Same prescribed wind/source over flat versus ridge terrain; windward rain and downstream depletion; reversing wind reverses the contrast, without rain from zero stock |
| No hidden iteration/geometry source | Fixed-H N refinement checks P and transport-reach stability as well as accounting; variable winds; calm, wrap-X and bounded-Y cases; nonnegative stock |
| Correct consumers | Exact baseline float P reaches dry runoff/wet basins; no doubled submerged runoff or refined wetness feedback; deterministic codec residual |
| Useful procedural change | Paired P, wetness, runoff, basin area/head/outlet, discharge, river hierarchy and biome maps; coherent drier interiors/rain shadows where forcing supports them, without quotas |
| No collateral regression | Existing topology, lake/head conservation, ecology legality, starts and deterministic guards; unchanged pre-moisture baseline thermal/pressure/wind/current/SST fields for identical upstream inputs |
| Player-path cost | Bounded passes/storage; complete maximum-size generation stays within the 30-60 s expectation on the qualified runtime, not a per-operation allowance |

Freeze numerical margins from arithmetic precision and the independent oracle,
not from a failing candidate. Keep existing scientific requirements intact;
do not substitute numerical budget closure for Earth calibration. No new
precise Earth rainfall/river-density target is established by this design.
Retain the incumbent's known thermal inadequacy explicitly. An unchanged known
failure is not a newly introduced moisture regression; do not erase it, call it
resolved, or make its complete repair a prerequisite to every hydro improvement.
New collateral harm remains a refusal.

Paired maps hold the same upstream geography/configuration/seeds and thermal
backbone. Downstream erosion, final terrain, water footprints and river classes
may legitimately respond to changed forcing; measure them rather than demand
byte identity. Conservation and head guards apply to each map's own resolved
truth, not the incumbent's lake footprint.
Existing rainfall-dependent albedo/cryosphere processing and final ecological
temperature may legitimately respond. Holding the thermal backbone fixed does
not demand identity of those downstream products.

Stop or redesign if the manufactured contrast is absent/reversed, source
accounting fails, the four paired maps lose useful wet regions or basin/network
integrity, or cost exceeds the whole-map budget. Do not rescue failure with
rainfall floors, biome quotas, a hidden terrain carve, an expanded solver or
another thermal residual family. Source limitation is necessary for this
chosen causal interpretation, not sufficient for good gameplay or Earth skill.

A too-dry first map refuses that exact provisional parameterization; it does
not alone disprove source limitation. Separate an overall supply-scale error
from a wrong source/terrain response or inadequate reach. Any subsequent
calibration must be prospectively bounded: name the rates being changed, a
small candidate budget, meaningful wet/dry supply-demand and basin/network
outcomes, and unchanged independent challenges from the existing study bank.
Preserve the initial failed receipt and distinguish the retuned candidate.
No automatic retuning, indefinite sweep or wider soil/ocean/energy ownership
is admitted by this packet.

In particular, prefer the cheaper proxy if zero recycling and admitted ocean
supply cannot preserve useful wet regions while producing source/terrain-led
dry contrasts across the four paired cases, or if doing so would require soil,
ocean or energy state outside this slice. Do not extend the model merely to
avoid that decision.

## Scope And Review Boundary

No prognostic soil, groundwater, full energy balance, new ocean model,
metre codec, vegetation feedback, seasonal lake evolution or new Civ engine.
No production changes or new experiment accompany this planning packet.
Human architecture review approved the model-unit moisture account, zero
first-slice land recycling and float forcing cutover on 2026-10-09. This
authorizes the scoped implementation and qualification sequence, not a claim
that the moisture or thermal gap is fixed or that the candidate is deployable.

Independent read-only physics and SDK geometry/accounting reviews found no
blocking contradiction in the selected numerical scheme. They confirmed the
quantity, CFL, incoming-ascent, split-ordering and publication-residual
relationships, while retaining the finite-window/zero-recycling product risk.
Those reviews supported the approved architecture decision; they are not
implementation proof, simulation results or production admission.
