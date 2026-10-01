# Relief Coherence

Executable protocol: [relief-coherence.study.ts](relief-coherence.study.ts).
Measurements: `sample.metrics.relief.coherence`, from the closed capture.

## Cohort And Gates

| Configurations | Sizes | Map/game seed pairs |
| --- | --- | --- |
| `swooper-earthlike` | Standard (84 x 54), Huge (106 x 66) | 1/1, 42/42, 1018/1018 |

The six cases retain the existing Earthlike size/seed axes without expanding
relief accounting to the two stress profiles. They use `STANDARD_INTEGRITY_TARGET` per sample and
`RELIEF_COHERENCE_COHORT_TARGET` for exact unique coverage, disjoint land-group
accounting, and valid diagnostic populations. No height, relief, coast, lapse,
rainfall, or uphill-river goodness thresholds are introduced.

## Measurement Semantics

- Planned classes are disjoint, with precedence mountain, foothill,
  rough-land hill, other modeled land. Observed land uses the mock observation's
  mountain, hill, flat, and other terrain identifiers. Each view has its own land
  denominator; planned lakes may still belong to modeled land.
- All heights use Morphology elevation in **model units**, not meters or native
  rendered height. Above-sea height subtracts the captured finite sea-level
  datum. Radius-one local relief is the maximum absolute difference to a unique
  same-view land neighbor. `localProminenceProxy` is elevation minus their mean;
  it is not summit/saddle prominence. Isolated tiles have null neighbor statistics.
- Hex adjacency follows the shared legacy-named OddQ helpers, whose actual
  implementation is odd-row offset, X-wrapped and Y-clipped. Undirected
  mountain/comparison edges occur once, directed mountain to comparison land.
  Planned other-land edges exclude foothills and rough-land hills; observed
  other-land edges include flat and other terrain. Signed contrast is mountain
  minus comparison height; above/equal/below counts preserve inversion shares.
- Coastal proxies exclude lake tiles as land-side endpoints. Water neighbors
  are classified independently by the planned and observed lake masks. Planned
  nonlake water is marine; observed marine water additionally requires coast or
  ocean terrain. Other observed water (including navigable rivers) remains a
  separate class, never silently called marine. Land adjacency retains all
  seven nonempty combinations of lake, marine, and other water; `both` means
  lake and marine only. Edges partition into those three types. Signed edge
  contrast is land minus water height. These are **not native cliff flags**.
- All planned-lake tiles, not only river sources, retain overlap with disjoint
  planned terrain classes and volcano masks. This exposes basin-water versus
  landform sequencing evidence without changing either planner.
- Temperature association demeans both elevation and surface temperature among
  finite modeled-land pairs within each row. Rows with fewer than two pairs are
  excluded. The slope is degrees C per model elevation unit; Pearson and slope
  are null for insufficient pairs or constant residual fields.
- Wind-aligned gradient follows the precipitation vector strategy's geometric
  estimator over all physical neighbors, dotted with unit wind direction.
  Within each modeled-land row, baseline and refined rainfall are separately
  demeaned. Uphill, downhill, near-zero (absolute gradient <= 1e-9), calm, and
  unscored noncalm tiles form a complete partition. Associations use scored
  noncalm pairs. This is association, not rainfall causation or an isolated
  measurement of the orographic contribution.
- Authored river sources have positive river class. `flowDir` is a receiver
  **plot index**, not a compass slot. `-1` is terminal; self, nonneighbor, and
  out-of-range receivers are invalid. Physical and conditioned-routing deltas
  are **receiver minus source**, so positive means uphill. Nonfinite routing
  edges remain in the valid-receiver count but are excluded from paired drops.
  Uphill counts retain planned and observed source-terrain classes and the
  neither/planned-only/observed-only/both source-lake overlap. They do not imply
  that a conditioned route is physically downhill. Existing Hydrology network
  summaries remain authoritative for river-network structure.
- Every representative list is capped at five, ranked by the named magnitude
  then ascending plot index (edges: source then receiver), and retains relevant
  heights, relief, or paired drops. Relative high-altitude/low-relief candidates
  are the group's upper height quartile intersected with its lower local-relief
  quartile, using sorted index `floor((n-1)*q)`. These are relative descriptive
  representatives, **not fitted goodness thresholds or bad-mountain labels**.
  Highest-above-sea representatives are ranked directly without quantile gates.
  Empty summaries are null.

## Reading The Evidence

The normal evaluator reports only target observations. To inspect the diagnostic
values, capture the study's scenarios with `captureStandardMapScenario`, then
call `measureStandardMapCapture` and read `metrics.relief.coherence`. Keep any
full baseline in an external run artifact rather than expanding the study report
schema. Headless measurements do not establish native engine or rendered proof.
