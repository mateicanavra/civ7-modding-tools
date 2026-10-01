# Relief And Climate Coherence

## Decision And Scale

The authorized question is whether the authored terrain, gameplay terrain
classes, climate response, coast transitions, and drainage describe the same
landscape. The first change is measurement, not a new mountain quota or a
retrospective adjustment of height to match terrain labels.

The definition owner is `plugins/mod/map/swooper-physics`; measurements live
under the standard recipe's existing relief family. Physical elevation is an
integer model quantity, not meters. The native conversion's factor of ten is
display calibration, not a physical unit conversion. A neighboring hex is the
spatial support of the initial roughness and prominence diagnostics; no
kilometer or true summit-prominence claim follows from that support.

Baseline cohort: shipped `swooper-earthlike` and `mountain-patch`, Standard and
Huge, map/game seed pairs 1/1, 42/42, and 1018/1018: twelve cases. Scenario
provenance includes configuration identity and player identity; investigation
receipts additionally retain the admitted configuration and its digest. The
mountain-focused identity is a counterexample to overfitting Earthlike, not a
second identity to recalibrate automatically.

## Hypotheses And Alternatives

Modeled: tectonic relief, erosion, mountain and foothill intent, rough-land
hills, thermal response, precipitation transport, and conditioned drainage.
Approximated: all spatial and temporal scales, native vertical display, and
discrete gameplay classes. Absent from the old study bank: joint measurements
of these fields. Separate terrain counts and elevation maxima cannot establish
their coherence.

The leading concern is a coupling gap: mountain and foothill planning uses
tectonic provenance and proximity, while final height also reflects subsequent
physical processes. The competing explanation is legitimate landscape
diversity: a high plateau can be flat, a low range can be rugged, and a mountain
pass should remain passable. Elevation rank alone cannot choose between them.

| Alternative | Benefit | Risk | Initial disposition |
| --- | --- | --- | --- |
| Joint diagnostics before changes | Separates systematic mismatch from useful exceptions | Does not itself improve a map | Selected |
| Reclassify every tile by altitude | Simple ordering | Destroys plateaus, low rugged ranges, and passes | Rejected |
| Raise terrain to match mountain labels | Immediate visual agreement | Reauthors climate and drainage to satisfy a projection | Rejected |
| Couple landform planning to measured final relief | Can remove demonstrated contradictions at the physical owner | Can overfit one scale or erase useful gameplay abstractions | Conditional on study |

The falsifier for a planner defect is that the apparent inversions are primarily
plateaus, intentional passes, coast/water comparisons, or insufficient local
support rather than a repeatable mismatch in rugged land.

## Pre-Declared Measurements

These are neutral measurements, not empirical success thresholds fitted after
seeing the maps. Empty populations remain unavailable, not zero.

| Relationship | Measurement | Interpretation boundary |
| --- | --- | --- |
| Class and relief | Disjoint planned and observed class groups; height above sea, maximum neighbor difference, signed height minus neighbor mean | The last is a local prominence proxy, not summit prominence |
| Mountain transitions | Unique mountain-to-foothill and mountain-to-other-land edges, signed contrast and representative extremes | Lower mountain neighbors are evidence to inspect, not automatic defects |
| Plateaus | Highest land examples with their accompanying local relief and classes | High does not imply steep |
| Coastal transitions | Coastal-land relief and boundary-height drops; lake adjacency distinguished from marine | Cliff exposure proxy, not native cliff readback |
| Thermal response | Land-only within-row residual temperature/elevation slope and correlation | Controls latitude rows, not every confounder; degrees C per model unit |
| Orographic response | Wind-aligned local gradient and row-demeaned baseline/refined rainfall populations | Association, not proof of rain-shadow causation; calm separate |
| Drainage and terrain | Physical versus conditioned receiver slopes, uphill river links by class, lake/class overlaps | Conditioned spill routing is not proof of an open land channel |

At most five deterministic representative plots or edges accompany each
diagnostic, sorted with explicit index tie-breaking. They support visual and
source inspection without turning screenshots into the primary metric.

## Hold Criteria And Decision Rule

The measurement-only layer must preserve generated terrain, climate, rivers,
lakes, placement, resources, starts, and determinism. It must pass the existing
integrity and product study bank unchanged. The new study checks exact cohort
coverage, class accounting, and valid diagnostic populations; it deliberately
does not invent relief-goodness bounds.

Before a behavioral change, append its specific mechanism, expected movement,
and hold criteria here. A passing neutral study establishes measurement
integrity, not a physically correct planet. A representative outlier alone
does not authorize broad retuning. Repeated evidence across seeds and scales,
a discriminating counterfactual, and an identified owner are required for a
change. Any new target must distinguish the intended improvement from simple
quota fitting.

Verification order: focused metric tests, type/build checks, twelve-case
baseline, existing product studies, independent physical interpretation,
bounded behavior comparison if justified, then realization/live checks for any
engine-facing change. Baseline acquisition composes the existing capture and
measurement functions; it does not create a second recipe runner or expand the
public study-report schema solely for this investigation.

## Scientific Anchors

- [USGS landform classification](https://store.usgs.gov/product/209151) combines
  local relief and slope rather than reducing landforms to absolute altitude.
  Its Earth-resolution units and numeric categories are not transplanted into
  this tile/model-unit study.
- [NOAA orographic glossary](https://forecast.weather.gov/glossary.php?word=orographic)
  describes terrain-forced lifting and cooling of moist air. Moisture supply
  matters: positive slope alone does not guarantee increased precipitation.
- [USGS map symbol guide](https://www.usgs.gov/ngp-standards-and-specifications/us-topo-cartographic-specifications-map-symbol-guide)
  distinguishes terrain height and slope representation. Native cliff flags
  require separate engine evidence, not inference from a coastal drop metric.

## Results And Amendments

### Baseline

The declared twelve cases completed through `captureStandardMapScenario` then
`measureStandardMapCapture`. Raw typed-array values, hashes, scenario identity
and complete family measurements are retained in
`/tmp/civ7-relief-baseline.json`; driver `/tmp/civ7-relief-baseline.ts` and log
`/tmp/civ7-relief-baseline.log`. This measurement layer changes no recipe
behavior. Fifteen focused tests (111 assertions), the two product-study tests,
and the definition/realization typecheck/build graph (28 tasks) passed.

Across the six Earthlike cases, mountain-to-foothill edges are lower on the
mountain side in 41.6-51.6% of comparisons. Signed mean contrast ranges from
-0.131 to +1.445 model units. Mountain radius-one relief means range
15.15-25.51, versus foothills 16.33-25.80 and rough-land hills 19.16-30.06.
These are potential coupling gaps, not a rule that every mountain must exceed
every neighbor. Huge seed 1018 has mountain local-contrast mean -0.066 and
foothill +0.392, providing a concrete neighborhood-inspection case.

Within-row temperature/elevation slopes are consistently negative in Earthlike
(-0.161 to -0.155 degrees C per model unit), with correlations below -0.995.
Wind-aligned terrain/rainfall associations are positive (baseline Pearson
0.132-0.395). These results support the implemented response directions, not
real-world calibration or independent proof of causality.

Physical-uphill river links remain 17.0-24.2% in Earthlike, dominated by ordinary
land rather than mountains. Planned lakes intersect 0-7 mountain cells per
case; one case also intersects a volcano. This supports explicit surface
precedence and basin resolution, not more projection clipping.

### Pre-Declared Noise Discriminator

Source review found that `tectonic-relief` groups labels by
`floor(x/fractalGrain), floor(y/fractalGrain)` but calls `createLabelRng` once
per tile. That helper advances per-label state on every call; it is not a
coordinate hash. Repeated labels therefore do not produce a fixed spatial
sample. With shipped amplitudes, crust noise spans approximately +/-18 model
units and arc noise +/-13 times boundary closeness before blending/erosion.

Before changing classification, compare the same twelve scenarios with only
those two additive noise amplitudes set to zero in temporary admitted configs.
Expect ordinary-land radius-one roughness and depression incidence to fall
if this is a material upstream driver. Inspect transitions and coast geometry
as well; do not presume their direction from that one mechanism. Existing
product guards are reported as collateral observations, not relaxed.

This is a counterfactual, not a proposal to remove all terrain variation. A
coherent-noise remedy must preserve meaningful texture, correct cylindrical
seams and deterministic sampling, and use the existing noise machinery where
possible. If the causal signal is small or absent, reject this explanation
rather than tune it until a desired mountain ordering appears. Physical
terrain and downstream climate cannot be exact HOLDs for this alternative;
the untouched Foundation/config inputs and product guard bounds are the
appropriate holds. No production behavior is authorized merely by this test.

### Noise Discriminator Result And Production Candidate

The same twelve scenarios completed with only the two additive terms disabled
(`/tmp/civ7-relief-noise-off.json`). In the six Earthlike cases, ordinary-land
mean radius-one relief fell from 15.72-26.90 to 6.22-18.70 model units;
physical-uphill river links fell from 78-164 to 6-26. Independently measured
finite depression roots fell from 76-155 to 6-13, with full-spill wet footprints
falling from 173-400 to 12-88 tiles. The mountain-focused counterpart showed the
same direction. These are paired causal comparisons, not calibrated Earth
scales or promises that every remaining depression should be filled.

Mountain-to-foothill mean height contrast did not consistently improve. Thus
the noise is a demonstrated driver of small pits and roughness, not a complete
explanation of terrain-class coherence. Representative Huge seed 1018 mountain
plots 4972 and 2627 are enclosed below all six neighbors, while plot 1466 borders
water and must not be classified as an enclosed pit from a mean contrast alone.
High nonmountain plot 2212 has neighbors at similar heights and is a legitimate
plateau/pass candidate rather than evidence for altitude-based classification.

Selected production candidate: repair the topography consumer using the
existing full-seed Perlin implementation with smooth cylindrical sampling.
Keep independent crust and boundary-arc fields, their existing amplitudes,
all tectonic terms, and authored map configurations. Do not change shared label
RNG semantics, substitute block-constant grain cells, or retain the zero-noise
ablation as a product strategy. Define grain as a spatial tile-scale length,
not a misleading higher-is-finer knob.

Before observing the candidate, require deterministic full-seed sampling,
horizontal periodicity, meaningful nonzero texture and locally smooth field
tests; expect fewer tiny pits and reduced routing lift across the declared
cohort. Run existing product guards without changing their bounds. Preserve
negative within-row altitude/temperature response and inspect mountain,
foothill, coastal, and plateau representatives separately. Coastline and
downstream climate identity are not holds when changing physical height.
No new mountain quota, lake cap, or river acceptance relaxation is part of this
candidate. Reevaluate basin demand after this upstream repair rather than
designing water storage around noise-created holes.

Independent measurement review found no blocking issues. Two diagnostic
conventions remain explicit: regressions with constant response return null,
and the neutral cohort target checks accounting rather than exhaustive capture
corruption. Independent basin-geometry review also found no blocking issues;
its sibling spill endpoints are not themselves a final routing DAG.

### Coherent Candidate And Downstream Couplings

The smooth-noise candidate retains the same admitted configs in all twelve
cases. Earthlike ordinary-land roughness falls to 7.87-19.77, depression roots
to 24-60, and physical-uphill river links to 39-102. Huge seed 1018 changes
from 155 to 55 roots and 153 to 94 uphill links. Temperature response remains
negative and wind/rainfall association positive. This supports the upstream
repair while leaving actual basin semantics and landform classification open.

The complete product bank exposed downstream assumptions; its guards are not
being relaxed. A local-gradient shelf flood had depended on noisy abyssal
roughness as a stopping barrier. Coherent Earthlike Huge 1018 keeps the median
physical water depth at 86 units while realized ocean share collapses from
51.16% to 7.15%. Cross-applying captured masks/heights isolates height smoothness,
not coastline movement, as the driver. Shelf admission must distinguish
continental support from oceanic abyss and must not propagate from every
island's required shoreline ring.

The `latest-juicy` variant also loses its last eligible rainforest-biome site, and Huge
Earthlike seed 7777 has 31.87% flat mountain-region interior against the existing
35% floor. These failures are investigated at their physical/classification
owners; neither a one-tile rainforest quota nor lowered identity bounds is
accepted as a remedy.

The selected shelf correction consumes the existing `foundation.crustTiles`
artifact, rather than publishing a duplicate apron mask. Only continental,
gentle water can seed or propagate shelf connectivity; immediate shoreline
coast is retained but cannot bridge that admission. This preserves continental
inland seas beyond the sculpted outer apron and stops an oceanic island from
flooding the smooth abyss. It does not claim that crust type alone proves
shallow depth or model island pedestals beyond their required coastal ring.

Official 1.5 resource tables confirm forest/rainforest-family features require
flat terrain, and rainforest requires the tropical native biome. All three
remaining `latest-juicy` rainforest-biome tiles are mountains/hills. Keeping
those restrictions is intentional. Its authored climate is dry despite the
map's name; do not infer a wet-map product promise from the name. Reevaluate
the rainforest regression after the upstream shelf correction, which also
feeds ocean thermal/climate behavior, before any biome calibration.

The corrected shelf candidate completed all 29 owned studies (96 scenarios,
7,023 expectations). All seven ocean-related failures from the noise-only
candidate are resolved; only the two `latest-juicy` rainforest expectations
and seed 7777's mountain-region flat-share floor remain. The same twelve-case
relief capture is saved as `/tmp/civ7-relief-coherent-shelf.json`, establishing
the physical/climate HOLD baseline for the next landform change. Twenty-one
focused noise/shelf/recipe tests pass (594 assertions). Independent source
review found no blocking noise or shelf issues. Full product acceptance is
not claimed while those three expectations remain failing.

### Relief-Supported Landform Candidate

After noise repair, the cohort still contains enclosed mountain minima and
flat mountain cells. Required final elevation is absent from ridge/foothill
inputs, and rough-land admission allows deformation/proximity to bypass actual
relief. Retain tectonic range intent, but make exposed terrain classes consume
the ground they describe.

Predeclare one bounded candidate: use shared radius-one land-neighbor upward
and downward relief; mountain admission requires at least 4 model units of
downward relief, hill admission at least 2 units of absolute relief. These are
explicit empirical classification-resolution floors, not real-world slope
angles, mountain definitions, or basin-breaching thresholds. Rank eligible
mountain candidates with downward-relief support and eligible hills with
absolute-relief support using the existing 16-unit rough-relief normalization.
Tectonic history/proximity still locates ranges; it cannot create rugged
terrain on a perfectly flat surface. Coverage floors and corridor promotion
must not bypass eligibility. Regional footprints can retain valleys/passes.

Do not require strict summits or positive mean prominence: a sloping mountain
can have higher neighbors. Exclude water-neighbor differences from this
admission, preserving the separate coastal-cliff diagnostic. The alternative
of altitude ranking is rejected because it would turn flat plateaus into
mountains and erase low rugged ranges. Raising physical height to fit labels
is also rejected.

Fixture gates: flat plateau, low rugged ridge, slope, pass, enclosed pit, coast,
datum shift, wrapped adjacency, immutable inputs, disjoint terrain classes,
and unfilled quotas when support is absent. Study the same twelve captures
plus the existing Huge relief cohort; hold physical elevation, land mask and
baseline climate exact. Class-conditioned relief and inspected transitions
should improve, without forcing every mountain/foothill edge to one sign.
Keep existing product bounds and report conflicts rather than retuning these
floors to a desired terrain count.

### Landform Comparison And Corridor Discriminator

The twelve relief-supported captures preserve every captured ground, coastline,
climate, drainage and lake field exactly. Only the five landform masks change.
Earthlike mountain local-contrast means improve from -0.352..0.278 to
1.421..2.737 model units. Mountain-to-foothill signed mean contrasts improve
from -0.802..1.643 to 2.952..6.188; every mountain-focused counterpart also
improves. These are cohort relationships, not a promise that every local edge
has one sign. Coverage does not bypass measured support: one mountain-focused
case leaves its former quota unfilled (350 to 333 mountain cells).

The full product bank resolves seed 7777's flat-interior failure but exposes a
connected-mountain-diameter regression: Huge Earthlike seeds 1018/2024/5050
have diameters 28/30/17, against the unchanged cohort floor 25. Seed comparison
was independently corrected to exclude ineligible neighboring candidates; this
fix does not remove the cohort failure. The exact eligible terrain graph spans
51/59/48, so the failure is not forced by the relief floor. Seed 5050 still has
a tectonic-region diameter 48 and eligible-within-region diameter 38.

Exact-input replay identifies a selection-order mechanism. Already traversed,
owned corridor cells stop promotion at a per-owner fair-share budget; later
generic widening can reject those cells at a neighboring owner's boundary.
One seed-5050 example has downward relief 24 and adequate tectonic support,
yet stays unexposed for this reason. That example diagnoses the mechanism;
it is not a special-case bridge rule or a license to join every range.

Predeclare a bounded candidate: retain the fair per-owner first pass, then
complete supported, already-owned corridor exposure using remaining global
budget before generic widening. Preserve identical relief/driver admission,
ground, regional ownership, and separation rules for unowned expansion.
Do not invent routes, promote flat passes, raise coverage, or change the
diameter guard. Test global caps, determinism, range diversity and legitimate
passes; rerun the three-seed discriminator and full product bank before
acceptance. Receipts before this candidate:
`/tmp/civ7-relief-relief-supported.json`,
`/tmp/civ7-spine-selection-analysis.json`, and
`/tmp/civ7-spine-replay-trace-5050.json`.

The corridor-completion experiment is rejected and removed. Although it keeps
global caps and all 18 range owners, cohort diameters become 29/23/21: one
previously passing case regresses and the original guard still fails. Exact
replay after removal restores 28/30/17 with zero mask differences. Its receipt
`/tmp/civ7-relief-corridor-completion.json` is rejected evidence, not a shipped
candidate. No extra corridor phase or fitted ranking remains.

### Explicit Orogeny Acceptance Amendment

Retire the hard `mountain-spine-diameter >=25` expectation; retain the measured
categorical span as a diagnostic. Do not lower the threshold to match seed
5050. This knowingly removes guaranteed peak-chain scale; it does not relabel
the old failing result as a pass or claim that all allocation gaps are passes.

The original `272b9af96f` guard required 30 to avoid local peak clusters.
`d7ceb780ac` reframed the intended object as a long, varied region with valleys
and passes, retained 25 as a residual peak-scale check, and added the regional
guards. The accepted
[recovery proposal](../../../openspec/changes/swooper-world-balance-recovery/proposal.md)
and [mountain-region specification](../../../openspec/changes/earthlike-mountain-region-visual-acceptance/specs/mapgen-normalization-workstreams/spec.md)
reject artificial mountain walls or spine optimization at the expense of
passable regions. Connected mountain terrain is ordinarily impassable in
Civ7; its two-sweep BFS span is neither regional geology nor a measurement of
transverse passage connectivity. Forcing it to 25 would impose a separate
movement-barrier goal absent from the user's physical-coherence request.

Retain all existing regional and terrain guards: region diameter >=38, size
>=450, nonmountain share >=65%, flat share >=35% and volume >=300, shoulders
>=25%, mountain share <=38%, and the separate coverage/diversity/flat-pocket
checks. Retain actual relief admission in every mountain/hill write path.
Independent physical/design review supports this narrower contract and rejects
another selection phase solely to repair the proxy. Target-only changes must
alter no generated output. Neither regional composition nor this amendment
proves native movement or improved chokepoints.

Budget/owner omissions remain distinguishable from physically unsupported
passes. Reopen selection design if repeated supported omissions demonstrably
degrade recognizable ranges or create implausible crossings, not merely because
an eligible graph can have a larger diameter. The study on the unamended
contract has exactly one failure among 7,023 expectations after Latest Juicy
is corrected; preserve that receipt as `/tmp/civ7-study-bank-coherent-neutral.json`.

### Latest Juicy Climate Owner Discriminator

Its authored baseline/refinement dryness was `dry/dry` despite sharing the
Earthlike identity that requires all five vegetation families. The map's name
is not evidence of intended wetness. After terrain correction, Huge 1018 has
only three rainforest-biome cells: two non-flat and one occupied by a legitimate
mangrove. Confidence is adequate; lowering feature thresholds or removing
wetlands would treat the symptom and violate habitat ownership.

The paired candidate changes only both dryness knobs to neutral `mix`, keeping
all biome/feature thresholds and identity guards. Huge 1018, Standard 1018,
Huge 42 and Standard 1 increase rainforest-biome habitat from 3/0/0/2 to
111/44/106/114 cells, and rainforest features from 0/0/0/2 to 47/14/36/48.
All five vegetation families remain present. All 12 unchanged identity checks
pass in all four candidates; all 51 integrity checks pass in all eight paired
runs. Maximum wetland share is 1.35% against the existing 8% bound.

All 13 captured authored terrain/mask hashes, wind and pressure remain exact;
projected lakes and realized land totals also remain unchanged. Downstream
navigable selection changes slightly, so realized terrain is not universally
byte-identical. The Huge 1018 biome histogram covers 2,676 cells, correctly
excluding 37 planned lakes from 2,713 modeled land cells. Receipt:
`/tmp/civ7-latest-juicy-dryness-paired.json`. This supports the two owner-level
config changes, not a wetness quota or wider retuning of other map identities.

### Accepted Relief Proof

The amended full bank passes all 29 studies, 96 scenarios and 7,022
expectations. This explicitly excludes the retired peak-chain requirement;
the unamended failure remains recorded above. The definition check, test and
Habitat policy graph passes 25 tasks, including 722 tests and 33,711 assertions.
Receipts: `/tmp/civ7-study-bank-coherent-final.json` and
`/tmp/civ7-relief-coherence-final-check.log`.

The normal Huge Earthlike map was rebuilt, deployed and loaded with map/game
seed 1018, ten players and saved configuration `ToT_NoModsExceptMaps`.
Generated/deployed script SHA-256:
`d72d47805ed72226a2d387418f4ed34eb7fac6b53f4ec4ea2035cf83e824032c`.
Fresh completion: 2026-09-28T08:07:43.765Z. This map uses the accepted relief
classification and baseline-demand refactor, but still uses the existing
production lake policy and native procedural river pass, not the forthcoming
basin-aware/authored-river replacement.

All 6,996 elevation writes were observed. Immediately after projection there
were zero non-lake mismatches; 45 accepted lake cells and one native lake had
engine-adjusted heights. Final readback adds one non-lake difference at
`(85,18)`, 778 to 788. A live public plot read finds natural-wonder feature 28
there, and live GameInfo identifies it as `FEATURE_VALLEY_OF_FLOWERS`. This
locates the exception on a native wonder; it does not prove which later
native operation changed it. Accepted lake classification and water drift
remain zero. Resources retain ten native legality rejections (including two
Cotton), two planned wonders are rejected, and eleven ordinary feature
placements are rejected. These are explicit realization shortfalls, not a
claim of perfect planned/native placement parity.

After data collection, Explore revealed all 6,996 cells. A lingering natural
wonder cinematic initially prevented verified camera focus; after dismissal,
the public appshot operation verified target coordinates and restored the HUD.
Inspected frames include the mountain/foothill transition at `(90,23)` and the
high marine coast at `(94,19)`. The latter visibly has steep cliffs and a river
reaching the elevated shore; a land-to-seabed numeric difference must not be
reported as exposed cliff height. Screenshots are visual corroboration for
this seed, not a substitute for the cohort or native navigation proof.
Receipts and frames: `/tmp/civ7-coherent-relief-native-{deploy.log,live.log,observations.json}`,
`/tmp/civ7-coherence-mountain-foothills.png`, and
`/tmp/civ7-coherence-high-coast.png`.

## Post-Water Coast Input Lineage

The October 1 water/Starts v2 public bank retains the flat-share expectation
at 0.35. Huge Earthlike 1018 has 405 flat cells in 1,168 exposed mountain-region
cells (0.3467465753), versus the accepted predecessor's 409/1,168. Ground,
initial land, final exposed land and province membership are identical. The
net loss is seven old flats selected as rough land, offset by three old rough
cells becoming flat, not four uniquely identifiable cells.

Bounded direct replays of the existing PlanRidges, PlanFoothills and
PlanRoughLands operations use the exact captured normalized configurations,
drivers, substrate, morphology routing, seed and derived fractals. The current
control reproduces every published mountains array exactly. Changing only
PlanRoughLands' coast distance to the retained pre-lake value reproduces the
predecessor rough mask exactly, including all 56 changed rough-mask bits, and
restores 409/1,168 flats. The rough target remains 193 in every arm; this is a
selection redistribution, not added terrain or a relaxed limit.

The first changed authoritative input is the coastline vintage. The
predecessor distance array is byte-identical to the still-published
`morphology.shelf.distanceToCoast`, not `baseCoastline`. Resolved lake shores
lower `coastInterior` in the existing rolling-upland, plateau and escarpment
terms. For example, tile 2333 changes distance 3 to 0, score 1 to
0.8986438513, and zero-based candidate rank 123 to 246; the fixed rough target
fills before reaching it. Tile 5574 changes score 1 to 0.9926462770 and is
instead excluded by the existing local-density rule after six nearby sites
have been selected. Six of the seven newly selected rough cells have unchanged
local scores but earlier global rank. Exact score/selector source was read-only
instrumented and its outputs checked against the direct operations; those
diagnostic traces are reconstructed, not claimed predecessor intermediate
arrays, which the older portable packet does not retain.

The separate observed-old/current river cross demonstrates a valid channel
response, not the flat-share cause. Old river candidates reproduce the old
peak and foothill masks but put a peak on tile 2103, now a class-2 physical
channel. Current channel reservation moves three peaks to three eligible
neighbors, with no net flat-count change. Removing all channel reservations
is neither old truth nor an acceptable repair.

The [accepted Surface Landforms design](basin-integration.md#surface-landforms)
explicitly holds original marine coast distance while final wetness controls
surface exposure and current rivers reserve blocking peaks. The repaired
mountains caller therefore uses the existing shelf distance for the rough-land
law, while retaining current `exposedLandMask` and river candidate exclusions.
Resolved shoreline remains authoritative for coastal projection and other
actual-water consumers. No relief law, budget, fraction, threshold, seed,
ground, water result or artifact producer changes, and no new coastline is
computed. A future modeled lake-driven geomorphic feedback would require its
own physical law and evidence rather than silently substituting present-day
lake proximity for the held upland reference.

Evidence is retained outside the repository at
`earth-calibration/relief-owner-causal-20261001/`: `BRIEF.md`,
`replay-admitted/receipt.json`, `observed-river-replay.json`, and
`selection-trace.json`. The first study-reader attempt passed extra ridge
diagnostic fields to foothill admission and stopped after one direct ridge
call; that stopped packet and reader correction are preserved separately.
There were no counterfactual outputs before that refusal and no recipe
executions in the direct owner study. Full cohort acceptance remains pending
the next fresh owner proof, including the unchanged thermal target.
The bounded repair passes 20 focused tests with 250 assertions and the owning
source/test TypeScript checks. A TEST-OWNED source caller replay against the
immutable current Huge 1018 artifact inputs confirms 409/1,168 flats and exact
equality to the held coast-only direct arm, without a public build or recipe
rerun.

The fresh v3 public proof now completes 115 executions: 57 full artifact
captures, 57 separate public evaluations and the exact saved twelve-player
case. All 4,430 original expectation identities and comparators are unchanged.
Flat share passes at `409/1,168 = 0.3501712328767123`; the only remaining
expectation failure is the unchanged within-row thermal response
`0.12980530053589956 < 1 C`. No new failures occur. All held physical,
climate and water artifacts and every compiled configuration value are
byte-identical to v2. Independent typed reconstruction verifies all 3,192
artifact payloads. The exact twelve-player case has twelve full, regional,
unique seats, minimum spacing nine, resource support minimum three against
floor two, support gap two and no shortfalls or adjustments.

The correction passes independent SDK/architecture review and the complete
owning check graph (37 tasks). The proof is retained at
`earth-calibration/water-start-relief-owner-cohort-v3-20261001/` in the
[Civ research user-data location](../../process/LOCAL-VIEWERS.md), with capture
receipt SHA256
`d56cb67df9d7f5deb43e189658a1243b0471ede550a582e9cca808d219d1144f`.
This closes the narrow landform-input defect, not complete scientific
calibration or native navigation. The new fourteen-image gallery predates
this relief correction and is not post-correction native proof.
