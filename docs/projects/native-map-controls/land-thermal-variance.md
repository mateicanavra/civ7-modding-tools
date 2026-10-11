# Land Thermal Variance

The remaining Earthlike thermal-structure failure is measured, not an inference
from the aggregate test log or the old profile experiment. The retained baseline
study ran the exact four `earthlike/climate-structure` cases without changing
forcing, relief, coefficients, classifier thresholds or study expectations.
The later [producer-phase pair](#completed-producer-phase-pair) is complete:
its mixed outcome did not establish better playable climate. The experimental
candidate remains disabled; neither another fit nor a target amendment is
selected, and the regional thermal requirement remains open.

## Retained Baseline Measurements

| Case | Within-Row Land Temperature RMS C | Row-Biome Dominance |
| --- | ---: | ---: |
| Huge1018 | 0.14935597 | 0.74427481 |
| Standard1018 | 0.12778222 | 0.77579092 |
| Standard1 | 0.18130853 | 0.75327511 |
| Standard42 | 0.16326509 | 0.74609929 |

All four fail the authored 1 C floor and pass the 8 C ceiling. Standard1018
and Standard1 exceed the 0.75 dominance target. These are generated-product
checks, not observational Earth accuracy thresholds.

Temperature uses every original modeled land tile, including planned freshwater,
and pools cell deviations from each land-row mean. Biome dominance excludes
planned lakes and qualifies rows with at least twenty terrestrial cells. The
diagnostic reproduces both actual metric populations and values exactly.

## Causal Budget

The test-owned replay invokes the actual solar, sampling, thermal and refinement
operations. Complete thermal output equals published `thermalField` byte-for-byte;
the final albedo output equals `climateIndices.surfaceTemperatureC`. Demand,
water-budget and cryosphere replays also reproduce all five final climate-index
arrays exactly. There is no second temperature implementation or production
observer added for this study.

| Case | Relief Lapse RMS C | Albedo Departure RMS C |
| --- | ---: | ---: |
| Huge1018 | 0.10813649 | 0.10338472 |
| Standard1018 | 0.09964702 | 0.08765118 |
| Standard1 | 0.17848359 | 0.06151021 |
| Standard42 | 0.11931624 | 0.11537132 |

Clipping is exactly inactive on every land tile. The frozen periodic forcing
is row-only after removing lapse, to Float32 precision. Lapse and albedo have
small negative covariance, but both spatial contributions are already small;
cancellation does not explain the order-of-magnitude shortfall. Including
numerical residue and all pairwise covariances closes variance within
`8.68e-17 C^2`; residue RMS is below `4.25e-7 C`.

Generated within-row relief standard deviation is 15.33-27.46 **model units**.
Foundation supplies normalized geological proxies and Morphology remaps them
into quantized relief. Neither producer establishes metres. Increasing lapse
until this study passes would therefore invent a unit conversion, not recover
one. Earlier [stagewise relief evidence](thermal-coherence.md#relief-units-are-a-separate-calibration-question)
also rejects erosion, margin processing and clipping as the observed thin-tail
cause in its held cases.

## Separate Biome Axis

Desert, stable biome index7, dominates the leading excess rows. Standard1018
row16 has 48/51 desert cells at mean17.136 C, temperature SD0.139 C, effective
moisture mean149.92 with SD27.35, and mean aridity0.304. The classifier's current
moisture boundaries `[90,188,228,252]` and aridity shift at0.20 place most of
that population in an arid category despite significant moisture variation.

This is consistent with the actual classification mechanism, not an isolated
ablation of category smoothing. Thermal variation alone is not assured to fix
biome dominance. Keep moisture/category allocation, aridity shifting and edge
refinement as separate candidate causes; do not repair them with biome quotas
or assume every individually dominant row violates the global weighted target.

## Next Discriminator

The [fixed-height source-latitude comparison](earth-thermal-reference.md#source-latitude-variance-follow-through)
now measures those populations with source Gaussian-row grouping, original
land weights and frozen response. Known height reduces row-demeaned error
variance by 74.0% globally but only 10.8% in the original low-relief cohort;
the latter retains 2.0809 C annual and 2.5186 C monthly residual RMS. This
separates height-supplied variation from unexplained low-relief variation.
It does not uniquely identify maritime exchange. A
directional thermal-exchange design needs matched monthly SST, coastal/inland
air and wind evidence, plus an explicit driving vintage because phase winds
are themselves downstream of thermal pressure. No new production strategy,
physical-height convention or fixture-fed procedural branch is selected here.

## Reproduction

Evidence lives at `earth-calibration/land-thermal-variance-20260930/` in the
documented VisualAtlas user-data root. `run-study.mjs`, `analysis.mjs`,
`analysis.test.ts` and `verify-evidence.mjs` retain complete compressed arrays,
source/runtime inventories and strict output destinations. The existing owning
definition's `runAdmittedOperationForTest` pattern is used for diagnostics;
production callers still consume finite recipe contracts and public artifacts.

Root reran five Bun tests (23 assertions) and the evidence verifier. Two complete
runs match all 48 captured field hashes and all four compressed evidence files;
all twenty final climate-index arrays replay exactly. Actual executed
source/runtime inventory SHA-256:
`1ee51fb96487daeb69332890341c784cb6bbdbce6d932bf03be7bb9f61269b31`.
The receipt retains the coordinator's earlier declared revision separately
from that measured inventory; it is not a whole-checkout Git identity claim.
An independent eight-file read found no actionable defect in metric populations,
causal vintages, covariance accounting or interpretation. It did not rerun the
tests/verifier; those remain root-owned proof. Covariance closure alone is an
algebraic identity, while exact operation replay, row-only raw forcing and
negligible residue supply the independent attribution guards.
No native Civ7 comparison or final calibration acceptance is claimed.

## Prospective Regional Qualification

Accepted prospective qualification meaning for the next thermal candidate,
within the existing workstream; not a verified model or executable target change.
Earth is a calibration resource and diagnostic proxy for a coherent, playable
procedural world, not an exact-reproduction authority. This does not accept an
algorithm, change any executable target, read reference outcomes, or reinterpret
earlier failed experiments. Historical results in this document and earlier
scientific refusals retain their original meaning.

### What Is Worth Shipping

A useful regional response makes equal-latitude, equal-height land differ for
an explicit upstream geographic or physical reason, with coherent annual and
seasonal behavior. It must survive different Earthlike seeds and sizes and reach
all affected downstream consumers in the declared schedule, while deliberately
held fields remain exact. A final-atmosphere intervention may correctly retain
SST2. More temperature spread, less biome banding or more features alone does
not establish that result. No universal warmer-drier annual ordering is assumed.
Current moisture information does not select the historical deficit statistic,
a maritime scalar, or any other response law.

### Three Qualification Boundaries

| Boundary | Required Meaning | Failure Disposition |
| --- | --- | --- |
| Hard owner and numerical controls | Single artifact authority; finite aligned arrays; correct datum, clipping, calendar and consumer vintages; deterministic nonmutation; justified numerical error bounds | Reject the candidate at its owner; no scientific score or attractive map rescues it |
| Fixed-Earth scientific comparison | Retain source, split, geography and weights; report annual/monthly, regional, seasonal, bias, clipping and low-relief results against the frozen comparator | Preserve the old screen and verdict; a scientifically adverse tradeoff requires explicit review, not automatic product acceptance or veto |
| Procedural Earthlike outcome | Causal regional response plus unchanged climate, water, ecology, resource and start/playability protections across the existing cohorts, then qualified native proof | Reject unexplained new regressions; an inherited unmet target stays open, never becomes a pass by averaging or omission |

The historical strict-improvement margin greater than `2e-4 C` and per-group
collateral budget of `1e-4 C` are a conservative near-Pareto selection screen
on a simplified Earth fixture. They are not justified Earth observational
uncertainty or product effect-size thresholds. Keep that screen unchanged and
reported. Do not confuse its selection budgets with actual Float32 publication
or solver-equivalence tolerances: those numerical controls remain hard gates.

Prospectively, scientific screen failure is a review trigger rather than an
unconditional product veto. Review must identify the exact affected population,
season, bias and magnitude; explain the physical simplification or tradeoff;
and show the corresponding reproducible procedural benefit and collateral
results. Unexplained concentration, wrong-direction or broadly adverse responses
are not excused by global RMSE or one attractive map. Physically justified
regional concentration is disclosed and assessed, not categorically refused.
No convenient replacement tolerance is selected here. Before any candidate
outcomes are inspected, freeze its mechanism, signed regime expectations,
scientific comparison and decision rule. Any later amendment must be explicit
and prospective; old scores remain.

### Existing Owners And Minimal Proof

Use the current executable
[Earthlike climate-structure study](../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.ts):
Huge1018 and Standard1018/1/42, retaining each sample and its integrity checks.
The authored [thermal bounds](../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/hydrology.ts)
remain `1-8 C`; the inherited floor failure is unwaived. Seasonal/annual
rainfall-codec saturation, exposed-land biome structure, the eight-seed ecology
cohort and existing placement/resource cohorts remain protected. Populations
and aggregation come from their current executable owners, not old prose or
a new private bank. The [current study catalog](../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/catalog.ts)
owns selection.

The variance floor cannot prove geography: row permutation or sign reversal
can preserve it while reversing a physical relationship. Reuse the existing
climate measurement fixture to falsify those decoys with the candidate's
separately declared signed regime check. Preserve the existing row-only,
missing-population, datum, water, clipping and composition controls. A future
disabled-response control must recover the incumbent exactly. Add only the
focused owner tests needed for the selected mechanism, not another harness.

Keep baseline phase sea-level temperature for pressure distinct from phase
ground temperature for demand and the annual thermal datum. The unchanged
incumbent integral and enabled annual proxy have different declared meanings.
Retain the actual two ocean updates and three thermal vintages unless a separate
causal-order design is reviewed. Unrounded P, member-reduced W and phase-derived
demand keep their separate meanings; native rainfall bytes are not physics.
Later lakes, rivers and plant-water opportunity do not become upstream thermal
inputs. Finite-water conservation and all existing legality, seating, spacing,
resource/habitat and explicit-degradation guards remain in force.

Focused owner controls precede the relevant existing cohorts; only surviving
candidates proceed to the ordinary regression graph, source-aligned before/after
diagnostics, Civ CLI native readback and bounded gameplay where affected. Images
are required only for claims about rendering, not as a universal experiment gate.
Complete maximum-size generation retains the `30-60 s` player budget.
Scientific proxy, portable artifact, installed build, screenshot and gameplay
proof stay separate. Native water taxonomy/render questions remain independent
and open.

The [producer-phase candidate](#producer-phase-candidate) below subsequently
completed its [fixed procedural pair](#completed-producer-phase-pair), without
production adoption. The qualification decision alone did not admit a fit,
solver, observational scoring or bank run. A bounded owner improvement may ship
honestly with declared inherited failures. The current targets remain unwaived; completing
the regional thermal goal requires meaningful regional coherence and satisfaction
of the current product contract, or an evidence-justified prospective target
amendment with history intact. The amplitude floor is not an immutable physical
law. No target amendment is selected here, and numerical difference alone does
not complete the goal.

## Seasonal Regional Candidate

This section preserves the original continuous candidate B and its proof scope.
The [producer-phase candidate](#producer-phase-candidate) supersedes its temporal
representation; it does not inherit its coefficient or qualification. The failed
continuous-curve qualification and failed event-aware repair remain historical
refusals, not passes for the new observable.

The original opt-in candidate is one lagged, phase-aware land climatic-limitation
anomaly inside `compute-thermal-state`. The incumbent remains the zero-gain
comparator. A year-round offset from an annual summer-deficit summary was not
selected: it would persist into cold/dark seasons without a supported seasonal
mechanism. This candidate is an empirical approximation, not soil storage,
actual evapotranspiration, latent-heat accounting or an energy-conserving exchange.

Freeze original land and the provisional final-SST2 integration-phase
precipitation P and binary64 potential demand D. Periodically linearly
interpolate P/D evidence, then evaluate the exact daily solar geometry and
unchanged incumbent ground curve at each requested or annual midpoint phase:

```text
r = 0 if P >= D; otherwise 1 - P/D, for D > 0
a = clamp01((bounded incumbent ground temperature - tMinC) / (tMaxC - tMinC))
g = daily Q * a, on original land with positive demand; otherwise zero
row reference = sum_original_land(g*r) / sum_original_land(g), empty zero
delta temperature = gainC * g * (r - row reference)
```

The activity-weighted row reference anchors the existing zonal climatology; it
is not nonlocal physical heat transfer. Raw row anomalies sum to zero before
clipping. A warm wet receiver may cool relative to an active deficit-bearing
row. All-wet or uniform-limitation rows have no anomaly. Cold ground, polar
darkness and original water cannot become active through their neighbors.
The ground gate is evaluated before Float32 publication, with one existing
elevation lapse. A corrected temperature crossing the gate threshold does not
recursively change that one-shot gate.

Enabled admission requires strictly positive D at every original-land source
knot. The D=0 inactive branch is discontinuous and is not hidden with an epsilon;
unsupported enabled inputs are refused. The current Earthlike demand parameters
have a positive lower bound of 9.5 model units before rounding. P/D are empirical
commensurate model quantities, Q/r/a/g dimensionless, and gainC Celsius per index
unit. No meter, millimeter or observed-temperature interpretation is implied.
Enabled annual raw/clipping diagnostics must remain finitely representable in
Float32; an unrepresentable result is refused, not repaired with a gain cap or
correction clipping.

Add delta to raw sea-level response before independent sea/ground bounds and
one lapse. The same rule drives phase samples and the dense 384-midpoint annual
ground integral; the annual result is not a sparse sample mean or annual-plus-
mean-offset shortcut. Exact solar geometry has one shared lawful owner, not a
copied response-specific solar formula.

The operation-private `rules/thermal-curve.ts` owns the coherent periodic and
seasonal curve evaluation consumed by `rules/periodic-response.ts`; validation,
integration and publication remain in the latter. This internal composition
does not promote one-consumer algorithms into shared model policy or expose a
public diagnostic API.

### Schedule And Disabled Control

Positive gain explicitly requires the existing two ocean updates, followed by
one additional final thermal/atmosphere/moisture pass at held SST2:

```text
SST0 -> atmosphere0 -> SST1 -> atmosphere1 -> SST2
     -> provisional atmosphere/P/W/D -> frozen driver
     -> corrected atmosphere/P/W/D -> final publications -> refinement
```

Both ocean updates remain unchanged. Only the corrected final pressure,
wind/current, moisture/demand and thermal vintage is published. There is no
third ocean update, recursive predictor, water debit, or later river/lake/plant
water feeding this upstream response. The step composes existing operations;
the anomaly mathematics stays in the thermal owner with row-sized working data.

Complete authored configurations require the explicit `regionalResponse.gainC`
selector. The three retained maps receive only `gainC: 0`; all preceding values
and source bytes remain exact after removing that addition. This is an approved
complete-config migration, not optional/default-object admission or a second
configuration lane. At zero gain the extra pass and regional input are absent,
retaining every incumbent coupling setting and operation schedule.

Focused mechanical controls cover aligned inputs, unsupported zero demand,
near-zero demand, weighted centering, cold ground, polar darkness, wet/singleton/
empty rows, knots/wrap, clipping, single lapse and final consumer vintages.
Permanent tests use public domain operations. Exact private binary64 helper
witnesses stay outside Git; they do not widen the product's diagnostic payload
or excuse test imports across domain boundaries.
Independent refinement of one frozen crossing/wrap driver compares 384/768/1536
midpoints to 24,576 under the current owner's `0.003 C` margin. That witness
does not certify every gain or a resampled moisture producer. Supported source
calendars and requested sample forms are checked separately.

An unchanged-source synthetic comparator matches all ordered operation inputs,
configs and outputs, four publications and the returned observation across
observation modes 2/4, tilts 0/18 and coupling counts 1-4. It preserves typed
bytes and alias relationships without a tolerance. Real thermal, solar,
sampling, reduction and demand owners are exercised; stubbed transport/ocean,
whole-recipe Earthlike runtime, scientific accuracy and native play are not
certified by that control.

## Producer-Phase Candidate

The seasonal producer provides separately salted atmosphere samples, not a
resolved weather trajectory. Each phase has two antithetic weather members;
different phase salts do not establish statistically independent observations.
No current production consumer requires P/D between these phases. Pressure and
demand use the integration calendar; the two/four observation phases are subsets
of that calendar. The new candidate therefore evaluates the regional response
directly at the frozen producer phases, with no P/D interpolation, harmonic
reconstruction, nearest-phase fallback or new integrator.

The spatial hypothesis remains a warm/illuminated, activity-centered original-
land response to modeled relative climatic limitation. Frozen P and D retain
their actual provenance. At weather-member level W is `clamp(P/200)`; phase P
and W are reduced separately, and phase demand uses the actually reduced W.
It is not reconstructed from mean P. These are empirical model quantities,
not soil storage, actual evapotranspiration or an energy-conserving heat exchange.

Enabled requested phases must exactly match the producer calendar, in order,
with the existing admitted weights. Arbitrary requested thermal phases remain
valid for the unchanged disabled response. A future consumer that needs
arbitrary corrected phases requires a separately reviewed representation;
scientific monthly observations do not silently restore continuous B.

### Annual Observable

Keep the dense incumbent annual ground calculation. Define the new annual
publication as an explicitly bounded seasonal statistical departure from that
baseline, not the integral of an unrepresented corrected continuous curve:

```text
C(x) = clamp(x, existing thermal minC, existing thermal maxC)
b[j] = incumbent raw ground temperature at producer phase j
d[j] = producer-phase raw regional anomaly
A0, R0 = dense incumbent clipped and raw ground means

annualProxy = C(A0 + sum_j w[j] * (C(b[j] + d[j]) - C(b[j])))
rawAnnualProxy = R0 + sum_j w[j] * d[j]
annualClippingDeltaC = annualProxy - rawAnnualProxy
```

Annual terms are computed before Float32 publication. The final aggregate bound
is part of the model: two different averaging measures can otherwise produce a
result outside the thermal bounds even when every corrected phase is bounded.
The delta includes inherited clipping, phase clipping changes and aggregate
saturation. It is not a continuous-cycle clipping integral. Directly averaging
corrected phase temperatures would instead change the incumbent annual datum
even at zero departure; that alternative is not selected.

Cells with an exactly zero anomaly at every producer phase preserve the exact
incumbent annual/raw/delta publications. In real arithmetic this is the same
formula; the explicit identity avoids re-clamping tiny dense-accumulation drift
at non-binary bounds. A weighted cancellation alone is not an inert response.

Sea-level and ground phase samples still add the anomaly before their independent
bounds and one lapse. Pressure centering uses the exact published sea-level
samples; phase demand uses the ground samples. Zero gain and inert responses
preserve the incumbent exactly, and original water retains prescribed SST.

### Causal And Proof Boundaries

Retain both ocean updates and the provisional/frozen/corrected final-SST2 pass
described above. Refreshed phase P/W/D feed the baseline annual water publication
and hydrographic network. Later albedo-adjusted annual temperature recomputes
ecological PET against completed hydrography; that is not the baseline mean of
phase demand. Later local-water opportunity never becomes the upstream predictor.

The finite departure uses a separately implemented scalar arithmetic reference,
with direct producer-phase anomalies, nonuniform weights, independent clipping
and aggregate saturation. The unchanged dense incumbent calculation retains its
independent owner qualification. The new finite statistic does not borrow the
continuous candidate's integration allowance or retrospectively pass its failures.
One meaning contrast keeps annual P/D summaries equal but places limitation in
warm/illuminated versus cold/dark phases. A larger spread alone cannot pass it.

All three authored map gains remain zero. Owner arithmetic, consumer composition,
scientific geographic benefit, procedural adequacy, installation and gameplay are
distinct claims. No new gain, scientific comparison, cohort or production adoption
is selected by this owner change. A subsequent comparison must prospectively name
a compatible observable and report numerical indeterminacy where its uncertainty
cannot discriminate tiny score differences. The thermal requirement stays open.

### Completed Producer-Phase Pair

The complete offline Standard1018 pair used canonical Standard size (`84 x 54`),
map/game seeds `1018/1018` and eight player identities. Gain zero was compared
with the prospectively fixed diagnostic gain `6 C`, not a fitted coefficient or
playable default. Physics qualification base
`ae8fc94d790a769fb45c60584e47304f69f53a93` and actual source for both arms
`ff7b40a7beca64ac2621f6ce07fc5f2f8485a327` remain distinct: the latter adds
only the diagnostics filename repair. The subsequent behavior-preserving
classifier clarification at `984268a43b4c87538e0c82429dd9f8ccc2aaa38f`
([PR #2366](https://github.com/mateicanavra/civ7-modding-tools/pull/2366))
does not replace either frozen pair identity.

All 36 exact holds, nine mechanism checks and 49 existing sample-integrity
expectations pass in both arms. The annual land departure is geographically
organized but modest: RMS `0.1998 C`, with range `-0.474` to `+0.642 C`.
Within-row variation rises `0.13276 -> 0.21034 C`, still below the unchanged
`1 C` floor. Row-biome dominance does not improve (`0.53496 -> 0.53700`),
rainforest features fall `29 -> 22`, and starts/resource support move in mixed
directions while their existing requirements still pass. This is one complete
procedural pair, not a full cohort, Earth calibration or native qualification.
It does not demonstrate better playable climate.

The classifier's tropical transitions were reviewed and retained as an
intentional, uncalibrated empirical climate-habitat envelope. Atmospheric context
and local plant support keep their distinct meanings; the rule does not compute
temperature. See the [Ecology owner reference](../../system/libs/mapgen/reference/domains/ECOLOGY.md).
Mechanical agreement and classifier retention do not authorize thermal gain.
Close this experimental line for now, retain its drafts and evidence, and keep
the candidate disabled. No next coefficient, solver, fit or cohort is selected.
Further thermal work needs a concrete repeatable mismatch from qualified-build
feedback or a separately justified discriminator. The regional requirement and
procedural protections remain explicit and unwaived.
