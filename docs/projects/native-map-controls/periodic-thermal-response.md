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
