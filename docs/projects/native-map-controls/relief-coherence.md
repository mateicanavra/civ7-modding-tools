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
provenance includes the full configuration digest and player identity. The
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

No baseline result or behavioral remedy is asserted by this declaration.
Record acquisition identity, distributions, representative outliers,
counterfactuals, and decisions here after verification.
