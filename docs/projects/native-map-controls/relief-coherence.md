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
