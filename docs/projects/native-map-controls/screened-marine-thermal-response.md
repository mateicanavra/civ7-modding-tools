# Screened Marine Thermal Response

## Intent And Decision

Design the next bounded thermal candidate, not another temperature texture or a
completed calibration claim. The annual component discriminator is sealed
**NONSELECTION**: the represented incident-radiation family fails a held region,
and the represented signed-transport family fails held regions/seasons. Surviving
incoming-net/downward-longwave association does not supply an independent
procedural radiation driver. The 112-arm resolution screen also does not erase
the observed persistent contrast within its disclosed remapping surrogate.

The smallest currently executable candidate is a **screened marine anomaly
response** inside the existing periodic thermal owner. Its actual procedural
driver is the carried, prescribed external-ocean SST relative to the incumbent
row response, transmitted through the finite-ground geometry. This is a reduced
empirical relaxation/exchange law, not computed downward longwave, W/m2,
physical diffusivity, heat capacity, elapsed-time transport, or a global energy
budget. Calling the incumbent relaxation "radiative" describes its solar-response
origin; it does not make this extension a gray-radiation atmosphere model.

Select this bounded *candidate for discrimination*, not a nonzero coefficient
or production implementation. Acquire/admit exact SST support, freeze the
controls/gates below before outcomes, and test the one coefficient externally.
An unsupported coefficient, failed held guard, or missing SST support retains
NONSELECTION. Do not revive a rejected family by changing its old gates.

| Alternative | Actual Missing Responsibility | Decision For This Domino |
| --- | --- | --- |
| Full coupled radiative state | Distinct atmospheric temperature/optical state, dimensional surface fluxes and storage closure | Not supplied by today's moisture proxies; larger owner/schedule design |
| Time-resolved thermal transport | Distinct evolving thermal states, admitted velocity/time/length and transient covariance | Strongest unresolved rival; not disproved by the monthly carrier screen |
| Screened marine anomaly response | One response length on an explicitly normalized model grid | Smallest available driver; test before enlarging the atmosphere |

Gray-radiation research demonstrates that radiative feedback can be modeled
without making humidity a radiation proxy, but still uses distinct atmospheric
state and a dimensional surface energy/storage equation. It does not validate
this proposed law or its coefficient. See
[Frierson, Held and Zurita-Gotor (2006)](https://www.gfdl.noaa.gov/bibliography/related_files/dmwf0601.pdf).

## Authority, Units And Vintage

`compute-thermal-state` owns the complete periodic temperature response, its
two datums, independent clipping and dense annual integration. Ocean circulation
owns the prescribed annual SST. Pressure and wind remain independently owned
products downstream of each thermal pass. Moisture remains after the final
thermal/atmosphere vintage. No sibling operation is called from an operation,
and no recipe step computes response coefficients or heat exchange.

| Input Or State | Meaning And Support |
| --- | --- |
| `solarByRow` | Existing dimensionless daily-solar harmonics and equinox phase convention; frozen empirical response coefficients |
| `externalWaterMask` | Required authoritative external-ocean declaration, not the complement of initial land; X-periodic/Y-exterior under the current water owner |
| Nonexternal cells | All finite ground, including initially wet cells; carrier of the finite-ground atmospheric thermal proxy |
| `sstC` | Carried prescribed annual external-ocean temperature in Celsius, from the existing SST/current iteration vintage |
| Response length `ell` | Fraction of normalized model-grid X circumference; no generated km, m/s, diffusivity, or elapsed time |
| Elevation/lapse | Existing quantized model relief and one unchanged Celsius-per-model-unit lapse, not a measured metres-to-Celsius law |
| Initial `landMask` | Immutable historical atmosphere geometry, still used by existing pressure, ocean, evaporation and precipitation callers where already prescribed |
| Final exposure/lake bodies | Downstream hydrological truth; not an upstream thermal input or new feedback dependency |

The thermal input should use `externalWaterMask` instead of `landMask` for its
own external-prescription/finite-response distinction. Carried SST at a finite
initially wet cell is **not** an ocean boundary or donor. Finite initially wet
cells receive the same finite-ground response as other finite cells. The
operation remains an atmospheric/surface-temperature proxy, not a claim that
every finite cell is finally dry.

No finite-water heat capacity, water-depth dependence, lake temperature state,
seasonal storage, ice thermodynamics or transient evaporation cooling is modeled
by this candidate. Prescribed annual marine SST also has no seasonal anomaly.
Representing those responsibilities would require an explicit additional state
and schedule, not reading final lake/exposure artifacts during baseline climate.
Keep the current initial atmosphere forcing vintage elsewhere; do not silently
turn this bounded thermal change into a full hydrology/atmosphere coupling.

## One Periodic Response

Let `B_y(phi)` be the frozen incumbent raw sea-level row response with its mean,
annual cosine/sine and semiannual cosine/sine coefficients. Let `delta` be the
departure from that response. External marine cells prescribe
`delta_j(phi) = sstC_j - B_y(j)(phi)`.

For every finite-ground cell, solve the screened graph equation:

```text
delta_i + a * sum_{j in N(i)} (delta_i - delta_j) = 0
a = (2 / 3) * (ell * width)^2
rawSea_i(phi) = B_y(i)(phi) + delta_i(phi)
```

`N(i)` reuses the existing odd-row hex neighbors (`getHexNeighborIndicesOddQ`
has the legacy name), with wrapped X and clipped Y. Deduplicate aliased neighbors
and omit self edges on narrow grids. Each undirected edge occurs once in each
endpoint equation. Use one fixed edge coefficient; do not renormalize by the
reduced degree at Y boundaries. Missing Y faces are no-flux faces. The factor
`2/3` is the regular unit-hex Laplacian normalization; the grid spacing is
`1/width` in the declared model coordinates. This is not a spherical Earth
operator or a claim of physical generated longitude/area.

This exchanges **departures from the already calibrated row response**, not
total meridional heat. It intentionally does not add a second transport of the
incumbent latitude gradient. Its relaxation sink/source is implicit in the
empirical baseline. It therefore cannot claim global heat conservation or infer
separate exchange and relaxation rates: only their length-ratio combination
`ell` is identifiable here.

Linearity permits five solves with the same matrix: mean, annual cosine/sine,
semiannual cosine/sine. Marine mean boundary is `sstC - B.mean`; each marine
seasonal boundary is the negative corresponding `B` coefficient. Evaluate the
resulting single finite-cell harmonic family at requested phases and at the
existing independent 384-point annual quadrature. External cells still publish
the prescribed constant SST. Apply one positive-above-datum relief lapse only
to finite ground, then clip sea and ground independently exactly as today.
Pressure's center remains the weighted mean of its exact admitted sea samples,
not a reconstructed annual-ground temperature.

Use a private, deterministic matrix-free conjugate-gradient solve with diagonal
preconditioning, zero initial departure and row-major reductions in the thermal
owner, not a generic SDK solver or new dependency. The finite matrix is a strictly diagonally
dominant M-matrix with diagonal margin at least one. Require every harmonic's
absolute infinity-norm residual at most `1e-8 C`; this bounds the corresponding
solution error by `1e-8 C`. Retain Float64 work arrays until the existing f32
publication. Cap at four times the finite-cell count, with at least one attempt;
reaching the cap is a numerical refusal with the residual in its error, never a
partially converged scientific result. Skip an identically zero right-hand side
exactly. A direct
tiny-matrix oracle and an independent external reconstruction decide the method
before production authoring; solver passes are not physical time steps.

### Zero Control

`ell=0` returns the finite-ground baseline exactly. No external driver also
gives `delta=0`, even at positive `ell`. An external annual SST equal to `B.mean`
has zero *annual* boundary anomaly, but still contrasts with the seasonal land
harmonics: it is not an all-phase zero driver. Test zero anomalies for all five
coefficients separately in the private mathematical oracle.

The new domain-corrected zero arm and the historical incumbent are distinct
where initial wet is finite. Those cells intentionally stop receiving an
unqualified SST override, even at zero exchange. Exact historical-output
equivalence applies where `initial land == !external water`, including the
original all-land reference receivers. Preserve and report this domain
correction separately from the fitted response; do not add a legacy branch to
make a whole-map exact-zero claim false. Tests must explicitly show that changing
SST values only at finite initially wet cells changes neither solve nor output.

## Unchanged Schedule

```text
fixed solar + initial geometry + external declaration
  -> initialize carried annual SST
  -> [thermal(response from carried SST) -> pressure -> wind/current -> SST] x existing passes
  -> final thermal(response from final carried SST) -> final pressure/wind/current
  -> evaporation -> transported moisture -> precipitation/weather reduction -> demand
  -> thermalField -> climateIndices
```

Do not add an SST advance after the final atmospheric recomputation, a moisture
return edge, extra weather-member state, or a response pass outside the thermal
operation. Weather members continue sharing the phase thermal state. The
current SST coupling passes are prescribed model relaxation passes, not annual
time integration. This candidate must pass their convergence controls without
changing their count, current forcing, pressure gain, or wind gain.

## Exact Reference SST Support

Use only these explicit NOAA PSL OI.v2 files, not a mutable `sst.ltm.nc` alias,
the distinct `new/` product, marine 2 m air, or reanalysis skin temperature:

- `https://psl.noaa.gov/thredds/fileServer/Datasets/noaa.oisst.v2/sst.ltm.1991-2020.nc`
- `https://psl.noaa.gov/thredds/fileServer/Datasets/noaa.oisst.v2/icec.ltm.1991-2020.nc`
- `https://psl.noaa.gov/thredds/fileServer/Datasets/noaa.oisst.v2/lsmask.nc`

The SST product is analyzed monthly bulk SST in `degC`, not a direct observation
at every cell. Its 12 fields cover 1991-2020, on 180 north-to-south rows at
`89.5..-89.5` and 360 columns at `0.5..359.5`. Each month has a
`valid_yr_count`; the product's low minimum-valid-input rule makes a finite value
alone inadequate evidence of full climatology support. Require all 12 counts
to equal 30 for every admitted donor. Verify coordinates, scale/offset,
climatology bounds and month labels from bytes before joining to the existing
Earth calendar. See the
[exact SST metadata](https://psl.noaa.gov/thredds/dodsC/Datasets/noaa.oisst.v2/sst.ltm.1991-2020.nc.html).

The matching ice field is percent, not a fraction, and also supplies monthly
valid-year counts. Primary open-water donor admission requires all 12 counts
equal 30 and all 12 ice climatological values exactly zero. This qualifies the
represented climatology, not unobserved submonthly ice absence. Do not clamp or
recode nonzero/missing ice to zero. See the
[matching ice metadata](https://psl.noaa.gov/thredds/dodsC/Datasets/noaa.oisst.v2/icec.ltm.1991-2020.nc.html).

Mask admission is mandatory: the analysis contains land infill without SST
meaning. The source mask is one for sea and zero for land; direct primary
OPeNDAP point probes on 2026-10-01 returned one at `(0.5 N,180.5 E)` and zero
at `(29.5 N,20.5 E)`. Recheck these controls against downloaded bytes; preserve
the whole mask and its metadata. External-ocean support is its wrapped-X sea
component reaching either Y boundary, before ice/validity filtering. Do not
reclassify unsupported/icy sea as finite ground or admit disconnected inland
water as ocean. See the
[mask metadata](https://psl.noaa.gov/thredds/dodsC/Datasets/noaa.oisst.v2/lsmask.nc.html).

OI.v2 includes ship/buoy and bias-adjusted satellite SST, and sea-ice-derived
synthetic SST in icy areas. The latter is not observed open-water SST. The
source paper also distinguishes calibrated bulk SST from retrieved skin
temperature. Therefore keep an ice-free primary driver and a separately labeled
full analyzed-SST sensitivity; neither source skin nor marine air is an SST
replacement. See [Reynolds et al. (2002)](https://ftp.emc.ncep.noaa.gov/cmb/sst/papers/oiv2pap/oiv2.pdf)
and the [NOAA CPC land-infill warning](https://ftp.cpc.ncep.noaa.gov/wd52dg/data/indices/Readme.index.htm).

### Registration And Missing Boundary Support

Conservatively remap actual marine SST area to the existing 94x192 Gaussian
reference cells using longitude-interval overlap and exact latitude-band area
weights. Marine values never cross the land mask during remapping. Use the
existing Gaussian quadrature/band edges, not midpoint-latitude approximations.
Normalize a marine target over its actual marine overlap, report its area and
qualified fraction, and require *all contributing marine overlaps* to pass the
primary donor admission. Existing NCEP land remains finite ground. A source
water cell with no connected OI.v2 marine overlap is finite initially wet, not
an invented ocean donor. Retain those mask-disagreement counts. Source ocean
connectivity uses four-face adjacency on the native latitude/longitude mask,
with X wrap and clipped Y, before registration or ice filtering.

Freeze the following registration; none of it is a new physical generated-map
longitude contract. At the native reference arm, source cell `(row,column)`
maps one-to-one to the same cell ID on an abstract 94x192 odd-row hex graph.
Its model coordinates are `(column + 0.5*(row & 1))/192` and
`sqrt(3)*row/(2*192)`. Actual Gaussian latitude and longitude remain source
observation/support labels, not claimed regular-hex Earth coordinates. Gaussian
area-band edges are the existing cumulative quadrature weights in `sin(lat)`.

For product-grid registration, fix north/south support to `+80/-80 degrees`.
Reuse the current sampling owner's endpoint-inclusive latitude centers
`80 - 160*row/(height-1)`. Geographic support edges are `+80`, midpoints of
successive centers, and `-80`, transformed with `sin(latitude*pi/180)`, exactly
as in the prior resolution screen's `targetMuEdges`. Longitude centers are
`360*column/width`, with wrapped half-cell footprints, phase zero and **no
geographic longitude stagger**. The abstract graph still has its odd-row
offset; these geographic support labels do not claim a spherical hex embedding.
Reuse the prior resolution screen's circular/latitude overlap machinery.
Project the native admitted external-area fraction; greater than one half is
external and a tie is finite. Do not rederive connectivity after remapping:
the source external declaration remains authoritative when a narrow strait
disappears at coarse support. Record every resulting mask/support change.

Register solved departures back over each receiver's original Gaussian area
footprint, retaining all 547 identities. Add that receiver's original `B` and
its one unchanged source-height diagnostic lapse, then evaluate/clip/integrate.
This isolates response resolution from a second solar/lapse recalibration.
Report finite-overlap and direct marine-overlap departure contributions
separately, before summing; mixed marine contribution is not finite-ground
thermal response. Include a mixing-only control with the direct marine
contribution but zero finite departure. Product-size held within-row improvement
must beat that control as well as zero, so coarse water aliasing cannot select
the mechanism. No second receiver selection or coefficient fit is introduced.
If a receiver footprint overlaps an unsupported external cell in the primary
no-flux arm, its direct-marine departure is unavailable. Retain that receiver
identity with an explicit unavailable resolution prediction; do not renormalize
finite overlap, substitute zero, or borrow full-arm SST. Required unavailable
receiver predictions make that resolution qualification unavailable, not a
pass. The full analyzed-SST arm may still be reported separately.

On the source-only primary operator, an unsupported external face is no-flux:
omit that face, never replace its temperature with land air, zero Celsius,
nearest water, or an observed land residual. Keep unsupported external identity
outside the finite carrier. This source-support restriction is **not** a new
production mask or option. Run the separate full analyzed-SST arm on the full
external domain with the same coefficient; every donor there still requires
12 complete SST year counts, and icy donors are labeled as ice-informed.
Qualification requires both arms' original-cohort error guards. Improvement
only after admitting ice-informed/missing support does not select the candidate.

All 411 original receivers and 136 separate added coasts remain outcome
identities in both arms, including locations near unsupported marine support.
Publish per-receiver unsupported-boundary influence using a **coverage-only full
external-face operator** at the frozen length: include qualified and unsupported
external faces, prescribe one at unsupported external cells and zero at qualified
external cells. This is not the primary no-flux matrix, which would give those
omitted faces zero influence by construction. The dimensionless influence is
a source-coverage diagnostic, not a correction, imputation or fitted gain.
Report error changes by that influence and source-mask disagreement.
Insufficient regional support or sensitivity reversal remains withholding or
rejection, not permission to drop inconvenient receivers. Full analyzed-SST
admission failure stops this bounded attempt; no alternate SST family is added.

## Executable Discriminator Contract

The next external evidence directory is
`earth-screened-marine-response-20261001` beneath the existing calibration root.
Create a frozen `BRIEF.md` and `protocol.json` before acquiring scientific files
or evaluating candidates. Copy the coefficient grid, populations, controls,
metrics and gates below verbatim into that protocol; hash both. No new repository
extractor dependency, build, production source write or live run is needed.

1. Acquire the three explicit files serially, at most 8 MiB of scientific
   payload. Keep URL, status, headers, bytes, SHA256 and failure bodies; stop on
   redirect, 429, incomplete payload, cap or admission failure. Existing Earth
   raw files, cohort and prior evidence remain immutable. Use the already
   admitted Python/HDF5 runtime for extraction; do not install a toolchain.
2. Extract `sst`, `icec`, `mask`, counts, coordinates, bounds and every relevant
   attribute without packing assumptions. Output native donor/support arrays
   and conservative registration weights with exact source indices. Independently
   recompute representative equatorial, coastal, polar/icy, disconnected-water,
   mask-disagreement and missing-count controls from raw files.
3. Pin the current thermal rule/policy and exact Earth fixtures. Emit the
   historical incumbent and domain-corrected zero predictions before fitting;
   those predictions are frozen comparators, not adjustable intercepts.
4. Evaluate only `ell = [0,1/128,1/96,1/64,1/48,1/32,1/24,1/16,1/12,1/8]`.
   No fitted offset, annual/seasonal gain, lapse, clipping bound, row demeaning,
   coast multiplier or noise. No adaptive grid enlargement after held outcomes.
   Primary fit minimizes Gaussian-weighted annual squared error on the original
   196 training identities, subject to no worse training row-mean error. Ties
   choose the smaller length. A minimum at zero selects no response; a minimum
   at the largest endpoint is an unresolved scale, not permission to extrapolate.
5. Freeze the chosen nonzero length before observing 215 held outcomes or added
   coast outcomes. Run identical prediction/error tables for zero, primary and
   full analyzed-SST arms. Independently reconstruct the matrix, solution,
   phases, dense annual integration and metrics without importing the candidate
   operator. Repeat runs must be byte-identical under one source/runtime pin.

This is executable-ready specification, not a claim that those acquisition,
extraction, response or verification programs already ran. The directory's
planned receipts are `source-admission.json`, `controls.json`, `fit.json`,
`predictions.json`, `metrics.json`, `independent-reconstruction.json`,
`REPORT.md` and `SEAL.json`. Record unsupported support and every failed gate
alongside successes; retain the frozen protocol hash in every receipt.

### Populations And Metrics

Join original identities from the pinned 411-cell monthly fixture, not a new
coast or temperature selection. Preserve train absolute-latitude bands
`[0,15),[30,45),[60,75)` and held bands `[15,30),[45,60)` with the exact
196/215 labels. Reuse the January pilot's `cohort.json` identity/region/distance
ledger: original 411 comprises 18 coastal (`<=250 km`), 252 transition and
141 interior (`>750 km`); the distinct 136 added immediate-coast receivers
comprise 119 coastal and 17 transition. These physical source-distance labels
are analysis strata only, never generated model distances or fit inputs.

Retain the six original region labels: North America, South America,
Europe/Africa/west Asia, southern Africa, northern Asia/Pacific and southern
Asia/Australia. Southern Africa currently has no receivers. Recenter only
diagnostic contrasts within exact source-row/signed-height-bin strata and
within the reported region, not using another region's mean. Raw prediction
and total/row-mean error are **never** recentered. Use existing Gaussian weights
and 1991-2020 month-day weights, including leap-year contribution; monthly
candidate values are interval means of the same harmonic family, not a phase
chosen after inspection.

For every represented population report raw annual RMSE, Gaussian-weighted
signed bias, weighted RMSE of each source row's mean error, within-row centered
error RMS, predicted/observed within-row spread, monthly RMSE, four seasonal
RMSEs and distinct receiver counts. Report height-controlled contrast sign
agreement descriptively. It is not the old advection-family gate for this new
law. Keep original, added-coast, interior, transition and coastal results
separate; do not pool added coastal cells into training or declare all-land
accuracy from this Northern-Hemisphere-heavy low-relief cohort.

### New Gates, Frozen Before Outcomes

Numerical comparison tolerance is `1e-4 C`, consistent with the existing
response reconstruction scale. It is not an estimated observational uncertainty
or a permissible scientific degradation budget. Strict improvement must exceed
`2e-4 C` in RMSE; report its full size, not just a boolean. No unmeasured
uncertainty allowance is invented to excuse a failed guard.

- **Nonzero identification:** a nonzero, nonendpoint training minimum beats
  zero in annual total and within-row error. Leave each supported original
  training region out in turn; all refits remain nonzero/nonendpoint and within
  a factor two of the selected length. A region is supported with at least
  eight distinct training receivers; unavailable regions remain unavailable.
- **Actual-site versus geometry controls:** at fixed selected length, compare
  row-mean external SST (geometry-only maritime contrast) and ten deterministic
  rotations of qualified marine SST among the sorted external donors in each
  source row, by `floor(k*n/11)`, `k=1..10`. Masks/support/row SST distributions
  stay fixed; duplicate or zero rotations are reported unavailable. The actual
  SST arrangement must beat zero, row-mean SST and every available rotation in
  training and original-held annual within-row error. A tie does not identify
  actual SST geography. Require at least eight receivers with distinct nonzero
  actual-driver predictions in each primary identified population.
- **Annual original-held:** raw annual total RMSE and within-row error improve;
  row-mean RMSE and absolute aggregate bias do not worsen versus zero. Apply
  the same gates separately to the primary and full analyzed-SST arms with the
  single frozen length. Numerical agreement never substitutes for improvement.
- **Regional and distance collateral:** no annual total/row-mean error worsening
  in any original-held region or held interior/transition/coastal stratum with
  at least eight distinct receivers. Added coasts are held collateral: annual
  total/row-mean error must not worsen, globally and in every supported region.
  Unsupported strata are not passes and cannot support a broad qualification.
- **Seasonal collateral:** original-held monthly RMSE and each DJF/MAM/JJA/SON
  total RMSE do not worsen; every supported region-season combination also does
  not worsen. The unchanged annual marine boundary may fail this guard. A
  separately labeled observed-monthly-SST oracle may diagnose the missing
  seasonal boundary, but cannot fit `ell`, replace the annual arm or authorize
  a seasonal SST production contract.
- **Zero/linearity:** exact finite-ground zero response; historical exact control
  on matching domains; no-external/all-land zero; positive and negative donor
  perturbations with correct sign, homogeneity/superposition before clipping,
  maximum-principle bounds and no fabricated source on disconnected ground.
- **Resolution:** use the identical frozen length in the separate ladders
  `84x54 -> 168x108 -> 336x216` and
  `106x66 -> 212x132 -> 424x264`. Standard and Huge have different normalized
  Y extents/aspect ratios and are cross-size collateral, not successive
  discretizations of one domain. Conservatively register masks/driver fields
  and retain all original receiver identities with mixed-marine contributions
  labeled separately. Require the nonzero identification and held
  annual/seasonal guard directions at both product sizes, including the
  mixing-only control. Within each ladder, refinement differences must
  decrease, and the 2x-to-4x receiver response RMS must be below `0.05 C`.
  This is a preregistered
  discretization budget, not physical Earth accuracy or a fitted variance goal.
  Narrow grids, Y boundaries and X-seam translations have independent tests.
- **Lapse/clipping/annual:** exactly one existing lapse; below-datum finite
  ground has zero positive-height lapse; highland and original q1/q10 controls
  retain their disclosed model-unit assumptions. Reconstruct 384/768/1536-point
  dense clipped annual values within `1e-4 C`. Annual unclipped finite-cell mean
  equals its solved mean plus lapse; seasonal clipping rectification is reported
  separately and may not explain the identified annual response. Preserve
  independent sea/ground clipping and the exact prescribed marine endpoint.
- **Schedule/owner collateral:** unchanged solar, relief, external declaration,
  current/SST settings, coupling count, pressure/wind operation owners, moisture
  order and artifact lineage. No moisture feedback, invented physical wind unit,
  source residual input, or gain tuning. New mean/seasonal thermal values may
  propagate; unchanged pressure/wind meaning does not promise old values.

The existing generated initial-land within-row `1 C` expectation remains
unchanged but is not part of coefficient fitting. After source qualification,
run actual-operation Earth geometry, flat-height, no-ocean/aquaplanet and held
Standard/Huge controls, then the existing complete retained public evaluator
under one fresh graph/source pin. Separate external SST response, initial-finite
domain correction, lapse and clipping contributions at their declared vintages.
No generated variance pass compensates failed original-held temperatures,
seasonal distortion, water/SST instability or weaker playability.

## Smallest Conditional Source Change

Only after the frozen screen selects a stable nonzero coefficient and receives
independent physics/SDK review:

1. Update the inline `compute-thermal-state/contract.ts` input: require
   `externalWaterMask`, remove its old ambiguous `landMask`, and describe `sstC`
   as prescribed external-only annual state. Keep existing complete output
   shape/model tag. No detached operation types, new algorithm/strategy lane,
   artifact bundle or registry.
2. Extend `rules/periodic-response.ts` with the one screened response and private
   owner-local numerical helper if needed. Keep the one phase/dense integration
   implementation and independent datums. Store the qualified length and its
   empirical/support receipt alongside the existing owner policy, not as a new
   authored warmth knob. Existing lapse, offset and bounds settings remain.
3. Change climate-baseline's thin thermal call to forward the declared
   topography external mask at every existing carried/final SST pass. Do not
   recompute external identity in the step or change other historical-mask
   callers as an accidental part of this patch.
4. Add focused thermal numerical/domain tests, explicit finite-initially-wet
   tests, baseline forwarding/schedule tests and a small pinned qualified
   reference fixture. Update only changed caller fixtures. `thermalField`,
   `pressureField`, `windField`, `baselineClimateField` and `climateIndices`
   keep their existing publication shapes and the single thermal lineage.

This conditional boundary is three production responsibilities: thermal
contract, thermal rule/calibration policy and one recipe forwarding call. It
does not authorize ocean, pressure/wind, moisture, hydrology, Ecology or metric
tuning. Root coordinates fresh dependency proof and the full evaluator only
after source changes stabilize; no mixed-vintage builds or native claims.

## Strongest Counter-Hypothesis And Stop

Persistent inland contrast may require distinct transient thermal states,
circulation/cloud effects or finite storage rather than a symmetric SST anomaly
screen. Equal annual SST donors can still have different air-temperature climates;
isotropic anomaly exchange omits advective direction, seasonal ocean state and
transient covariance. A smooth geometry-driven response may add convincing
variance while moving row means or seasonal amplitudes in the wrong direction.
The exact-SST, shuffled/row-mean controls, held interior/region/season guards and
resolution tests are aimed at that counter-hypothesis, not merely obtaining
`1 C` somewhere on the generated map. SST and air analyses can share modeling
or observational assumptions; successful held prediction would qualify this
reduced approximation, not identify a unique Earth causal mechanism.

If zero wins, the scale is unidentifiable, held directions fail, or only the
monthly-SST oracle works, stop this candidate with the failed guards intact.
The next design would then explicitly own seasonal ocean/finite storage or
time-resolved atmospheric transport; no free gain, humidity/emissivity proxy,
clipping trick, observed land residual or extra thermal artifact is the bridge.
No source experiment or production patch has yet qualified this candidate.

## References And Verification Boundary

Evidence root:
`/Users/mateicanavra/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration`.
Read `ncep-1991-annual-component-discriminator-attempt3-20261001/REPORT.md`
and `SEAL.json`, and `earth-thermal-resolution-screen-20261001/REPORT.md`,
`NEXT-DESIGN.md`, `INDEPENDENT-SCIENTIFIC-RECEIPT.json`. Preserve their original
nonselection/proof boundaries. The provisional annual-local-energy brief is
superseded by the complete annual screen, not retroactively converted to a win.

Related living design:
[Periodic Thermal Response](periodic-thermal-response.md),
[Earth Thermal Reference](earth-thermal-reference.md),
[Land Geography Investigation](land-geography-investigation.md),
[Climate Artifact Lineage](climate-artifact-lineage.md), and
[External Water Ownership](external-water-ownership.md).
Authoring follows the Earth relief/climate and MapGen SDK simplicity stewards,
the operation/artifact authority blueprints and truth-before-projection policy.

This design was checked against current owners/call scheduling, the retained
population ledger, explicit SST/ice/mask primary metadata and three small direct
primary data probes. That is not full SST-file admission, model execution,
scientific selection, build/test proof, independent review or native validation.
Only this project supporting document was added; production source is held.

Skills used: solution-design, domain-design.
