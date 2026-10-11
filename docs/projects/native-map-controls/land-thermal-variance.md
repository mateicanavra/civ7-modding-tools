# Land Thermal Variance

The original Earthlike thermal-structure failure was measured, not inferred
from the aggregate test log or the old profile experiment. The baseline diagnosis
below retains its exact four `earthlike/climate-structure` cases and unchanged
forcing, relief, coefficients, classifier thresholds and study expectations.
The [completed regional and relief decisions](#completed-regional-and-relief-decisions)
distinguish that history from the subsequently adopted existing-control response.

## Historical Baseline Measurements

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
into quantized relief. Neither producer establishes metres. Treating a lapse
increase that passes this study as physical-height calibration would therefore
invent a unit conversion, not recover one. Earlier [stagewise relief evidence](thermal-coherence.md#relief-units-are-a-separate-calibration-question)
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

The earlier prospective qualification decision defines the boundaries for a
thermal candidate; it is not itself a verified model or executable target change.
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
remain `1-8 C`; the original floor failure was retained, not waived. Seasonal/annual
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
ground temperature for demand and the independent annual thermal integral.
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

The original next step was to select and review one source-grounded regional
mechanism under this contract. The completed dispositions below supersede that
experiment queue, not its qualification boundaries. No fit, solver, observational
scoring, bank run or production adoption follows from this contract alone.
A bounded owner improvement may ship honestly
with declared inherited failures. The current targets remain unwaived; completing
the regional thermal goal requires meaningful regional coherence and satisfaction
of the current product contract, or an evidence-justified prospective target
amendment with history intact. The amplitude floor is not an immutable physical
law. No target amendment is selected here, and numerical difference alone does
not complete the goal.

## Completed Regional And Relief Decisions

The producer-phase regional candidate remains disabled on its experimental
line and unmerged. Its Standard1018 diagnostic pair preserved integrity and
produced modest, organized response: within-row temperature variation changed
`0.13276 -> 0.21034 C`, still below the unchanged `1 C` floor, with mixed
downstream consequences. Better playable regional climate was not demonstrated.
This closes that candidate's discriminator, not the equal-height geographic
requirement; no further gain, fit, cohort or enablement follows automatically.

The adopted change is the existing Earthlike lapse control, `-0.0065 -> -0.15 C`
per model relief unit, tested production commit
`6c5c8a82e7d36c17371699104ec58b3830f0e06d` and merged through
[PR #2368](https://github.com/mateicanavra/civ7-modding-tools/pull/2368) at
`d51c56f221c83b0659b61060b36ab296e713b692` with the identical source tree.
This is an authored model-unit response, not a recovered SI lapse or Earth
calibration. Production includes no experimental regional solver. Shared
defaults, other profiles, offsets, targets, thresholds and placement policy hold.

The original four climate cases (Huge1018, Standard1018/1/42) and twenty
placement cases (Standard1337-1356) remain separate acceptance populations.
Both candidate studies pass unchanged targets and every sample-integrity check;
climate within-row temperature RMS spans `2.44141-4.49123 C` within `1-8 C`.
Production reproduces all 24 qualified candidate samples across 261,256 compared
leaves with zero substantive or schema differences, excluding only declared
configuration provenance and measured generation duration. Target/population
manifests and evaluations match apart from configuration provenance. Focused
tests, runtime compatibility and the normal 188-task check graph pass.

Cooling is substantial, not uniformly small. Standard1's original-land mean
temperature changes `12.916 -> 1.747 C` and vegetation density `0.2592 -> 0.1520`.
Its dominant biome changes from desert to snow; Huge1018 already has snow as
its dominant biome in both arms. Final water/layout can change, and explicit
unresolved water supply remains distinct from arithmetic conservation roundoff.
Passing cohorts do not establish fixed-lowland preservation, optimal calibration
or harmless collateral effects on every map.

Fresh native incumbent Standard1, candidate Standard1 and candidate Huge1018
each complete all 53 recipe steps. Ordinary feature attempts/applications are
`658/658`, `624/624` and `1157/1157`, with zero feature refusals. Candidate
configuration digest and aggregate feature counts, attempts and refusals match
the production samples, not a complete spatial census. Standard1 rainforest
changes `17 -> 0`, savanna `2 -> 0` and taiga `85 -> 185`. Three matched windows
retain 135 unique cells per arm with no omissions or probe errors, confirming
local tropical-to-temperate conversion rather than unexplained feature loss.

| Native Observation | Incumbent Standard1 | Candidate Standard1 | Candidate Huge1018 |
| --- | ---: | ---: | ---: |
| Resource refusals | 3 | 4 | 8 |
| Natural-wonder refusals | 1 | 2 | 3 |
| Lake-classification differences | 183 | 197 | 16 |

All three retain zero river-source/class/NAV-terrain mismatches and zero water
or final lake-water drift. Classification differences do not mean missing water.
Resource and wonder refusals are actual native projection shortfalls; their
paired increases are not full parity or proof of harmlessness for every start.
No complete final-grid census, campaign, founding bonus, movement-path, rendering
or navigation qualification is claimed. Operational receipts remain private.

The identical adopted tree retains the tested generated and installed artifact
bytes without requiring another generation. Adoption accepts this bounded
existing-control improvement, not the disabled regional experiment. Equal-height
geographic response, scientific calibration and native projection shortfalls
remain open; historical diagnoses, scientific refusals and qualification boundaries
retain their original meaning.
