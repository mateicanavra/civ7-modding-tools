# Earth-Calibrated Periodic Thermal Response

## Decision And Boundary

The next climate domino replaces Earthlike's instantaneous shifted-latitude
temperature response with daily solar geometry and an explicitly empirical
periodic response. It is not a new energy-balance simulator. The existing
quantized terrain, winds and spatial SST iteration do not supply physical
altitude, velocity, heat capacity or elapsed seasonal time.

Use the frozen [monthly response discriminator](../../../plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/response-study.md)
without refitting its holdout. Annual geographic coefficients and the complex
annual/semiannual response coefficients have separate meanings. The latter
are temperature response per dimensionless solar forcing, not inferred heat
capacities. The fixture is geographically uneven low-relief inland reanalysis;
it is not an ocean, global-mean or far-southern calibration.

The change is explicitly selected by the Earthlike configuration. Other
authored profiles retain their existing strategy until separately qualified.
Selection is ordinary operation configuration, never a map-name conditional.
Existing circulation migration and moisture-latitude heuristics are not solar
geometry and must not be silently retuned with it.

## Causal Ownership

- Climate's radiative operation owns true-latitude daily-mean top-of-atmosphere
  forcing, its annual mean and two Fourier harmonics. Its new strategy names
  the dimensionless quantity `q`; the diagnostic `I = 4q` adapter is retired
  from this production path rather than relabeled as physical forcing.
- Climate's thermal operation owns the periodic response, one application of
  model-relief lapse, prescribed SST override, clipping and thermal means.
  It returns the same phase family at sea-level and ground datums. Pressure
  consumes the former; evaporation and demand consume the latter. No second
  instantaneous temperature computation may survive in the Earthlike path.
- Climate-owned calibration data names the pinned reference and fit protocol.
  Do not additionally subtract the legacy continental-cooling intercept; it
  is already included in the empirical inland intercept. Temperature knobs
  apply an explicit annual offset, not hidden changes to fitted spatial gain
  or seasonal response.
- The baseline step composes operations, performs the existing fixed coupling
  schedule and publishes artifacts. Numerical phase generation, solar
  integration, harmonic response and seasonal aggregation belong in domain
  operations/rules, not additional closures inside the 819-line step.
- Publication stays `thermalField` baseline into refinement's final
  `climateIndices`. These are successive causal products, not parallel
  competing temperatures. No Core blueprint or artifact policy is weakened.

## Sampling And Datums

The radiative and thermal contracts gain explicit tagged legacy/periodic
branches. Legacy strategies remain their declared defaults and retain numerical
arithmetic and iteration order; callers gain tags mechanically. Every strategy
refuses the other input branch, and recipe admission refuses a mismatched solar,
thermal or sampling selection. Root input/output unions stay inline in their
operation contracts. Only cohesive harmonic/phase subentities become model
atoms; neither whole operation envelopes nor artifact-shaped aliases do.

A narrow Climate sampling operation owns phase plans, normalized weights,
observation indices, stable phase identities and the existing circulation and
moisture latitude frames. Climate aggregation operations own atmospheric and
moisture reductions and rounding. They do not call sibling operations. The
step composes them, retaining the existing coupling and paired-weather schedule.

Use `T = a + b * mean(q) + Re(G1 * Q1 * exp(i phase) +
G2 * Q2 * exp(2i phase))`, with cosine/sine represented as
`Q = cosine - i * sine`. An equinox-relative production phase is valid only
when forcing and output phases use the same origin. Gains are not rotated a
second time. The fixed monthly study calendar remains unchanged evidence.

Three numerical responsibilities are separate:

1. Solar mean and Fourier coefficients use 384 midpoint phases, independently
   qualified against 192/768 and a denser reference.
2. Atmosphere, moisture and demand use 24 equal-weight endpoint phases `j/24`.
   Qualify 12/24/48 (96 where unresolved), first without weather transients, then
   with the existing paired-weather mechanism. Shared phases retain identical
   weather salts across resolutions; array indices are not phase identities.
3. Clipped annual ground temperature uses a separate dense cycle integral,
   initially 384 samples, with clipping/extreme-case convergence checks.

These are candidate numerical resolutions, not a claim of measured convergence
or extra physical tuning parameters. The two/four observation modes select
exact subsets `[6,18]` or `[0,6,12,18]` of the 24 endpoint samples and cannot
change any annual field. Keep visualization arrays at two/four entries; supply
the full integration evidence and its explicit sampling metadata separately to
rainfall metrics. Annual amplitudes also use the integration samples. Legacy
strategies retain their original sampling and metric semantics.

Pressure's centering field is the weighted mean of the exact sea-level samples
used by its atmosphere evaluations and annual aggregation, not the dense ground
thermal mean. Compute `sea = clamp(raw)` and `ground = clamp(raw + lapse)`
independently. Never reconstruct sea-level temperature from clipped ground or
apply lapse to an already clipped sea-level value. Preserve authored bounds
and report clipping's effect on annual means, including extrema between
observation phases. Relief
lapse remains per model elevation unit and is applied once. Physical relief
scale and hypsometry are a following calibration question, not a hidden lapse
increase to force biome diversity.

The existing SST operation remains a prescribed annual ocean field, with zero
seasonal ocean anomaly for this bounded change. Before the first periodic
atmosphere evaluation, initialize it with zero currents and the actual water
and shelf masks. Periodic thermal input requires SST, even with zero coupling,
so the inland fit is never used to initialize marine temperatures. Legacy
initialization is unchanged. Its coupling passes are spatial
fixed-point iterations. The final atmosphere still consumes the final SST
without advancing it again. Do not add unidentifiable maritime damping on top
of the inland fitted gains. A future directional exchange model needs matched
monthly SST and coastal/inland evidence plus a wind-reversal discriminator.

## Acceptance

Qualify production solar geometry at equinox, polar day/night and global
quarter-solar-constant mean; phase/sign recovery; numerical quadrature
convergence; zero tilt; hemispheric reversal; and non-Earth tilt extrapolation
without claiming it is Earth-validated. Replay the unchanged training and
held-out monthly/annual evidence through the production thermal response with
the study's admitted harmonic coefficients. Separately measure the production
solar representation delta: the frozen study fits monthly means through
calendar-weighted QR, whereas production integrates continuous Fourier forcing.
With unchanged coefficients the preliminary maximum monthly prediction delta
is 0.00524 C. Do not demand bitwise-identical errors from these distinct
projections or refit to conceal the difference.

Verify observation-count independence, clipping between samples, sea-level
versus ground lapse, prescribed ocean temperatures, final coupling vintage and
single thermal publication. Replace old assertions equating annual climate to
two/four snapshots with independent integrated-cycle checks, not permissive
tolerances. Run pinned Earth-coast and aquaplanet controls, then held-seed/size
generated maps and the full unmodified coherence bank. Explain residual
failures at their causal owner rather than changing vegetation targets.

This design follows the user's delegated continuation. Its prerequisites are
the complete basin coordinator and accepted reference fixtures; neither the
reference study alone nor an improved screenshot closes the workstream.

## Implemented Boundary And Qualification

The tagged operations, sampling/reduction extraction, prescribed first SST,
single periodic thermal family per coupling vintage, annual publication and
independent observation subsets are implemented. Earthlike explicitly selects
the periodic path. Seven other profiles retain every previous setting, with
only the three complete legacy/default operation envelopes added for canonical
admission. No artifact blueprint or admission rule was relaxed.

Independent public-operation tests reproduce the frozen monthly reference:
the held-out monthly RMSE remains 3.57295 C without refitting. The separate
continuous-solar representation delta stays below 0.006 C. Solar and clipped
thermal primitives pass dense-reference and extreme-case checks; these do not
by themselves qualify the coupled climate.

Retained research lives under the discoverable Civ user-data location documented
in [LOCAL-VIEWERS](../../process/LOCAL-VIEWERS.md):
`VisualAtlas/huge-1018/earth-calibration/`.

- `periodic-legacy-parity-20260929-v3.json`: seven legacy Huge/1018 maps match
  all 84 captured upstream field hashes exactly. The replay explicitly applies
  the already-qualified reef admission migration and new default envelopes,
  then checks equality with each current authored configuration.
- `periodic-convergence-20260929/receipt.json`: twenty flat-Earth-coast and
  aquaplanet runs at 12/24/48/96 phases, with weather amplitude 0/14 and paired
  2/4-observation controls. All annual, integration-array and integration-plan
  comparisons for observation independence are exact. Inputs and source are
  unchanged within the run. Full integration fields, clipping effects,
  configuration and runtime identity are retained, not just screenshots.
- The capture protocol is v2: periodic exact-pole solar registration, dense
  annual thermal authority, weighted atmospheric/moisture integration, and
  2/4 observation subsets are labeled separately. Legacy metadata preserves
  its original arithmetic semantics. Step observations are not new artifacts.

**24 atmospheric phases remain provisional.** The coupled study found a real
ocean-transport discontinuity. With weather disabled, aquaplanet SST differs by
11.36 C maximum between 24 and 96 phases. Forced Earth water-only P99 difference
is 2.880 C; including land zeros conceals part of that error. The 48-to-96
difference is not consistently smaller, so 96 is not established truth either.
Do not increase phase count or refit temperature coefficients to conceal this.

Actual-operation vintage tracing isolates the first cause: the initialized SST
and shared-phase atmosphere/current fields are identical, but small differences
in reduced current direction make the existing top-two-ranked donor selection
switch between nonadjacent upcurrent neighbors with finite weight. On the
zero-weather aquaplanet, cell (80,8) changes from current (-80,-1) to (-82,1),
switching a roughly one-third-weight donor north/south and changing the first SST
update by 12.28 C. Both weights exceed the old secondary-donor cutoff. A coastal
Earth witness additionally renormalizes a near-zero surviving water projection
to full-speed transport. These are numerical transport problems, not evidence
against the independently qualified inland thermal response.

The next domino therefore qualifies and repairs ocean transport before relief
calibration or river-density tuning. Preserve the witnessed operator inputs,
test axial and near-axis directions, no-current limits, blocked coasts and
bounded constant-field transport, then repeat the same coupled study. Keep
physical current speed/time claims out of the numerical repair unless their
units and input authority have actually been established.

The unchanged full coherence bank still reports eleven calibration failures,
but their membership changed: Earthlike rainforest presence now passes while
row biome dominance newly fails. Eight legacy-profile identity failures,
Earthlike within-row thermal variation and forest presence remain. This is not
a green climate acceptance or permission to weaken ecological expectations.

The final owning proof (`periodic-owning-proof-20260929.log` in the same
research directory) ran both definition and realization `check`, `test`,
`build` and `check:policy` targets in one Nx graph. Types, builds and policy
passed without exceptions. Definition tests passed 979/980; the sole failing
test is the aggregate coherence bank with the eleven expectations above.
Realization tests passed 175/175. No tolerance or study expectation was relaxed.
The periodic implementation is reviewable independently of the unresolved
coupled-climate qualification; it is not the completed Earth benchmark.

## Ocean Transport Correction

The next independently reviewed change is a correction inside the existing
`latitude-current-advection` operation, not a second competing strategy. Choose
the adjacent angular rays enclosing the opposite current vector from all six
geometric directions before filtering by water. Their cross-product weights
are nonnegative, sum to one, and approach a single donor continuously at each
sector boundary. A blocked or off-map donor returns its own weight to the
receiving tile. Do not rerank remaining water neighbors or renormalize them to
full transport. Exact zero current retains self for advection.

Retire only the ocean `secondaryWeightMin` option and its eight authored
selectors. The independent moisture option remains unchanged. Preserve the
existing SST initialization, pass count, diffusion and shelf response, and ice
classification. The operation remains a direction-only numerical transport:
positive current rescaling has no effect, and zero/nonzero magnitude remains a
separate model limitation. Convex sampling establishes local bounds, not
global heat conservation or a physical speed/time interpretation.

Acceptance covers both row parities, integer current vectors on both sides of
all sector boundaries, horizontal direction sign, zero current, contrasting
blocked/self temperatures, bounded Y, wrapped X and narrow-grid aliases. Replay
the retained aquaplanet (80,8) and Earth coast (47,4) witnesses. Repeat the same
20-run coupled comparison and quantify changes in all seven legacy profiles;
the preceding exact legacy parity applies to the periodic extraction, not to
this intentional shared-operation repair. Keep coefficients and study targets
fixed. A smaller error is evidence of improvement, not automatic qualification
of a phase count.

This correction stays as a separate reviewable commit in the periodic
integration PR because it directly completes that PR's coupled-climate
qualification. No empty branch, policy exception, hidden extra parameter, or
production-step computation is introduced to work around the numerical bug.

The adjacent moisture `vector-advection` strategy independently contains
ranked positive-dot donor selection, its own secondary cutoff, and a latitude
fallback when no primary donor is admitted, including calm wind. Those are
source-confirmed analogous mechanisms, not yet a measured explanation of the
remaining rainfall or biome failures. Keep that operation unchanged during the
ocean ablation. Before final climate acceptance, discriminate its exact-axis,
near-axis, calm-wind and bounded-edge behavior through public operation tests;
retain or repair it according to the resulting causal evidence rather than
silently applying the ocean patch everywhere.

### Geometric Repair Results

`periodic-ocean-repair-20260929/receipt.json` retains the repeated twenty-run
cohort and frozen-driver witnesses. The entire numerical source and exact
imported fixtures remained stable. Compiled settings, registration and input
fields match the previous run except the explicitly retired ocean cutoff.
Two/four-observation annual fields, integration arrays and metadata remain
exact; land annual temperature and clipping fields are unchanged.

The coastal witness's first-update 48-to-96 temperature difference fell from
4.24656 C to 0.001812 C; the aquaplanet witness's 24-to-96 difference fell from
12.27649 C to 1.31477 C. This establishes removal of the abrupt ranked-donor
defect, not resolution-independent coupled climate.

| Arm | 24-to-96 water SST MAE / P99 / max C | 48-to-96 water SST MAE / P99 / max C |
| --- | --- | --- |
| Earth coast, weather 0 | 0.03251 / 0.33559 / 2.14073 | 0.02183 / 0.19714 / 1.56372 |
| Earth coast, weather 14 | 0.03976 / 0.40948 / 1.92820 | 0.03236 / 0.26099 / 2.80668 |
| Aquaplanet, weather 0 | 0.07864 / 0.70976 / 2.85480 | 0.04365 / 0.36825 / 1.88112 |
| Aquaplanet, weather 14 | 0.11928 / 1.24998 / 4.89147 | 0.06354 / 0.41437 / 1.75493 |

Earth land rainfall resolution differences are at most 3-4 index units for
24-to-96 and 2-3 for 48-to-96. Intentional old-to-new rainfall changes reach
32-37 units. Coefficients and acceptance targets were not retuned. Residual
tails keep sampling qualification open; 96 is a comparison, not truth.

`ocean-stencil-seven-profile-20260929/receipt.json` repeats all seven legacy
Huge/1018 profiles. Elevation, land mask, sea level, lake mask and flow receivers
remain bitwise exact. River classification hashes change on six profiles,
despite unchanged total river and lake populations; Latest Juicy shifts one
net tile from minor to major. All seven climate hashes change. Original-land
temperature summaries are unchanged; original-water mean temperatures decrease
by 0.028-0.529 C. The old full arrays were not retained, so unavailable per-cell
differences are explicitly not inferred from summary or net population deltas.
New compressed arrays round-trip all 84 field hashes. This shared operation
repair intentionally does not claim legacy climate parity.

Independent review found no actionable issues. Focused tests pass 35 cases /
2,790 assertions, and an independent public-operation sweep agrees exactly
with a trigonometric oracle for all 65,536 signed-byte vectors at both row
parities. The owning definition/realization graph passes types, builds and
Habitat policy; realization tests pass 175/175, definition tests 989/990.
The aggregate study now reports twelve expectations: Earthlike forest presence
recovers; Shattered Ring atoll presence and Mountains of Time Earthlike forest
presence newly fail; the other ten prior failures remain. These ecological
changes are not waived or attributed to the independent temperature fit.
`ocean-stencil-owning-proof-20260929.log` retains the complete graph result.
The numerical rule shrank from 195 to 178 lines; the 860-line climate step was
unchanged by this repair.

## Moisture Transport Follow-Through

Fifty-four unsaturated public-operation cases in
`moisture-vector-discriminators-20260929/receipt.json` reproduce the analogous
ranked-axis bias and isolate the cutoff jump. They also establish that calm
wind triggers full zonal movement chosen by latitude, and a bounded-edge miss
can override an available aligned donor with that same fallback. The fallback
was deliberately authored in February and its trigger broadened in the June
odd-R correction; removing it is an explicit semantic change, not claimed
backwards compatibility. These fixtures do not establish its share of the
whole-map rainfall or biome failures.

The accepted correction makes the vector strategy honor the supplied
phase/weather-member wind. Circulation remains the owner of latitude belts;
the transport consumer no longer substitutes a second wind interpretation.
Use adjacent geometric rays, exact-zero self, and unavailable bounded-Y share
at self. Unlike ocean transport, moisture crosses both land and water. Preserve
the existing `(local + advection * priorDonor) * retention` recurrence,
initialization, clamping, pass count and direction-only interpretation. Calm
means no advection, not no humidity change under continuing source injection.
Retire only this strategy's cutoff and all eight matching authored fields.
The separate cardinal strategy and its latitude input remain unchanged.

Extract the now-shared angular bracket into the existing Core grid/vector
primitive owner: canonical direction slots and normalized weights only, with
no dimensions, masks, latitude, donor values or transport law. Zero/nonfinite
vectors have no bracket; finite extreme inputs must not yield invalid weights.
Preserve ordinary signed-byte arithmetic exactly. Ocean and moisture keep
their own donor admission and scalar evolution. Move the moisture numerical
loop into its operation rules and leave the strategy as a binding; no new
algorithm belongs in a recipe step.

Gate this change on independent Core angular/edge/extreme tests, exact replay
of the already-corrected ocean operator, quantitative unsaturated moisture
fixtures, unchanged cardinal behavior, strict removed-option rejection and
all-eight canonical configuration admission. A focused held Earth-coast
24/96-phase comparison must preserve thermal/pressure/wind/current/SST fields
exactly while measuring moisture, rainfall and demand changes. Run the full
unchanged product study bank and owning Core/definition/realization graph;
do not tune around new failures. The separately identified coupled-SST tails
still need their actual causal-vintage discriminator, not a guessed speed law.

### Moisture Repair Results

The correction and shared Core geometry are implemented. Independent review
found no actionable issue. Exhaustive signed-byte tests preserve the corrected
ocean's raw weights at both parities; independent angular and extreme-exponent
checks cover the generic primitive. Public moisture tests cover axis/sector
continuity, calm and bounded-edge self shares, wrapped/narrow grids, source
recurrence, input nonmutation, unchanged cardinal behavior and removed-option
refusal. The numerical rule is 67 lines and its strategy binding is 27; the
860-line baseline step remains unchanged.

`periodic-moisture-repair-20260929/receipt.json` retains twelve exact ocean
SST/ice replays, all fifty-four passing unsaturated moisture fixtures, and
three Earth-coast smoke captures. All fixture expected-value errors are zero;
the six cardinal fixtures and zero-pass control remain exact. The former
bounded-edge cutoff witness now changes humidity from 0.046999 to 0.046785
across wind `[-127,36]` to `[-127,37]`, rather than 0.080345 to 0.056000.
Calm cases match self-retention at every tested latitude. This proves the
specified behavior, not a physical moisture mass budget.

At 24/96 phases, land annual rain changes by MAE 1.673/1.665 and maxima 21/20
encoded units; humidity MAE is 2.133/2.108 with maximum 26. Demand MAE is
0.2015/0.2018 in its existing model units. Thermal, pressure, wind, current,
SST, ice and clipping fields remain byte-exact. Two/four observations again
leave annual fields, integration arrays and metadata unchanged. All captures
are retained losslessly with compressed and uncompressed hashes, and source
identity remained stable. This three-run smoke is not renewed full coupled
resolution qualification.

`moisture-stencil-seven-profile-20260929/receipt.json` repeats the seven legacy
Huge/1018 maps against their retained post-ocean full fields. Elevation, land
mask and sea level remain exact as required. Lake mask, flow receivers,
temperature, pressure and winds also remain exact as measured downstream
outcomes, not assumed invariants. Rainfall changes on 465-1,612 cells per map;
refined-rainfall MAE is 0.136-0.481 encoded units and maximum delta 35. River
classification changes on 0/19/2/16/14/17/10 cells for Desert Mountains,
Shattered Ring, Sundered Archipelago, Mountains of Time Earthlike, Latest
Juicy, Mountain Patch and Mountains of Time Original respectively. Total
river-tile and lake counts are unchanged. All retained fields and 115/118
available per-map scalar metrics are compared; no unavailable old discharge,
humidity, demand or body-ledger arrays are invented. These profiles use the
legacy sink-budget strategy, not the complete Earthlike basin coordinator.
All values are finite, source identity is stable, and fourteen new compressed
artifacts pass hash verification. Historical compiled plans were unavailable;
the proof instead verifies reversible cutoff-only config migration and exact
current compilation of migrated versus current authored configurations.

The single owning Core/definition/realization Nx graph passes types, builds
and Habitat policy. Core tests pass 369/369; realization tests pass 175/175;
definition tests pass 1000/1001. The only failing test is the unchanged study
bank, now with eleven expectations: Mountains of Time Earthlike forest
presence recovers; the other eleven expectations from the ocean proof remain.
No new expectation fails and none was relaxed. The complete graph log is
`moisture-stencil-owning-proof-20260929.log` in the research directory. These
operator repairs do not close the ecological calibration or native water work.

## Weak-Current Thermal Amplification

The remaining SST tails now have a separate causal discriminator, not an
inference from the final current field. Four actual-step prefixes in
`periodic-residual-vintage-20260929/receipt.json` reproduce the repaired final
SST exactly while retaining the actual two driving current vintages, raw
weighted means, rounded vectors and thermal inputs. Reciprocal cell/one-ring
transplants and two common-S1 counterfactuals retain all other inputs. Shared
phase winds/currents and coarse-subsampled annual reductions agree exactly
under common SST; tiny Earth pressure differences come from Float32 thermal
centering. This is not phase-key drift.

At Earth cell 4596, the second driving current changes from `[0,-1]` to
`[-1,-1]` between 48 and 96 phases. Changing only that cell reproduces 2.80650 C
of the observed 2.80668 C SST change. At aquaplanet cells 5290 and 1793, weak
vectors likewise rotate and produce roughly five-degree single-cell responses.
The current SST rule moves a full donor share for any nonzero vector, even
though the current producer encodes relative strength. Angular interpolation
is now continuous away from zero; discarding that strength is a different
problem.

The common-S1 control attributes Earth4596's change to 2.76124 C of resolution
response plus 0.04544 C further feedback. Aqua5290 divides into -1.27713 C and
-3.61434 C, and Aqua1793 into -0.35827 C and -4.43354 C. These are path-specific
counterfactual differences, not a linear physical decomposition. Earth's
seasonal vectors largely cancel; both aquaplanet witnesses have weak phase
currents too. Moving transport ahead of annual aggregation would not by itself
remove the weak-current full-strength response.

### Bounded Strength Correction

Honor the supplied relative strength inside the existing ocean operation:
`alpha = min(1, hypot(U, V) / I8_VECTOR_MAX_ABS)` and
`advected = self + alpha * (geometricDonor - self)`, followed by the unchanged
diffusion. This is an explicit dimensionless consumer policy. The producer
encodes components against `maxSpeed` but clamps each component, so radial
saturation at 127 is a new, stated policy rather than an existing norm bound.
It is not a velocity in m/s, an elapsed timestep, or conservative heat flux.
Do not change producer quantization, phase reduction, coefficients, source
temperature, pass count, ice classification or moisture transport in this
ablation. No new knob or competing strategy is needed.

The alternative of more phases alone leaves the incorrect small-vector limit;
phase-wise thermal transport is a larger closure choice and does not resolve
the weak aquaplanet phase currents. The bounded correction has independent
design review and is the next implementation under the delegated calibration
scope. Acceptance requires zero/full-strength endpoint controls, proportional
one-pass weak response, radial saturation, finite convex bounds, blocked shares
and diffusion separation; repeat the actual causal witnesses, the same twenty
coupled runs, seven-profile collateral and unchanged product study bank.
Improved stability does not automatically validate Earth SST or any sampling
count. Qualify those outcomes separately rather than fitting this blend to the
observed temperature deltas.

### Strength Correction Results

The ocean-owned blend is implemented without a new option or changed input
shape. Exact zero/full-strength branches preserve their previous arithmetic;
all intermediate strengths blend before the unchanged diffusion. Independent
review found no actionable issue. Nineteen focused public-operation tests pass
2,240 assertions, and an independent one-pass oracle matches all 131,072
signed-byte/parity combinations exactly, including storage value -128. The
numerical rule is 161 lines; no recipe step, producer, reduction, moisture rule
or authored map envelope changed.

`periodic-ocean-strength-20260929/receipt.json` retains twenty repeated coupled
captures, four frozen causal-current replays, six single-cell transplants and
four actual first-current prefixes. The prefixes preserve initialization,
thermal samples, phase atmosphere/current fields and the first annual current
exactly. Two/four-observation controls remain exact. All 34 compressed artifacts
pass compressed/uncompressed hash verification and source identity is stable.

The Earth4596 single-cell transplant effect falls from 2.80650 to 0.04881 C;
Aqua5290 from -5.02998 to -0.68095 C; Aqua1793 from -5.33393 to -0.65589 C.
These are changes in controlled intervention responses, not claims that those
cells now match measured Earth SST.

| Arm | 24-to-96 water SST MAE / P99 / max C | 48-to-96 water SST MAE / P99 / max C |
| --- | --- | --- |
| Earth coast, weather 0 | 0.0242 / 0.2138 / 0.6101 | 0.0161 / 0.1177 / 0.3783 |
| Earth coast, weather 14 | 0.0302 / 0.2703 / 0.6769 | 0.0203 / 0.1509 / 0.3098 |
| Aquaplanet, weather 0 | 0.0362 / 0.3142 / 0.5321 | 0.0310 / 0.1516 / 0.5362 |
| Aquaplanet, weather 14 | 0.0802 / 0.6504 / 1.5210 | 0.0501 / 0.3882 / 1.2073 |

This is a material model correction, not merely a harmless rounding repair.
At 24 phases, old-to-new water SST MAE spans 0.759-1.438 C and maxima
9.304-11.255 C across the four arms. Earth changes one or two ice cells;
aquaplanet ice is unchanged. Annual land thermal/clipping fields remain exact.
The three retained post-moisture baselines isolate strength-only downstream
effects: forced Earth land rainfall MAE/max is 0.472/14 encoded units at 24
phases and 0.471/13 at 96. Other moisture comparisons are labeled combined
moisture-plus-strength effects because a strength-only old baseline is absent.
Neither smaller tails nor larger thermal changes automatically qualify a
phase count or establish physical SST accuracy.

`ocean-strength-seven-profile-20260929/receipt.json` compares all seven legacy
Huge/1018 maps against the complete post-moisture captures, with exact authored
configuration, compiled configuration and setup identity and no migration.
All retain their upstream relief, lake masks, flow receivers, routing elevation
and outlet masks; land temperatures are exact. Water final-temperature MAE is
0.426-1.178 C with a 10.133 C maximum. Refined rainfall MAE is 0.048-0.221
encoded units with maximum 27. Sundered Archipelago gains three river tiles
(179 to 182); the others retain their total counts while classifications
change. Biomes change on 3-53 cells per profile, with corresponding feature
and resource-placement changes. Latest Juicy cell (53,8) changes from navigable
river to flat as its river class changes from major to none; its drainage
receiver and upstream relief remain exact. This accounts for the profile's
single realized terrain change and navigable count 57 to 56. These downstream
effects are measured, not hidden behind an upstream-equality claim.

The collateral compares 36 typed fields plus all shared numeric capture and
metric scalars, preserves explicit sparse-key availability, and validates all
fourteen compressed artifacts. Values are finite and source identity is
stable. Standard captures still do not retain raw ocean SST or physical
runoff/discharge arrays; those unavailable comparisons are not invented. Native
projection and full Earthlike basin-coordinator replay remain separate gates.

The owning Core/definition/realization graph passes types, builds and policy;
Core tests pass 369/369, realization 175/175, definition 1005/1006. The sole
failing study-bank test reports twelve expectations: the eleven from the
moisture proof plus Earthlike `ecology-cohort/forest-presence`. This is the
eight-seed Standard cohort, not the seven-profile Huge collateral capture.
The original eleven-count summary was incorrect; the retained ocean-strength
log already contains this twelfth failure. No targets were relaxed. The log is retained as
`ocean-strength-owning-proof-20260929.log` in the research directory.
