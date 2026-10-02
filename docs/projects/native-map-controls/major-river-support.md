# Major River Support And Reference Density

## Question And Boundary

The user asked whether the apparent abundance of navigable heads is physical,
native projection, or a density policy. Compare the admitted C3 pipeline with
the pinned Firaxis Huge Earth source before changing thresholds. Neither an
authored Civ Earth river count nor an unknown model discharge unit is a
scientific Earth navigability measurement.

This owner repair does not alter drainage, basin storage, lake heads or
erosion. Its class-sensitive downstream consumers must be qualified; it is not
a reason to compensate for Foundation or land temperature in native projection.

## Baseline Observation

The actual `project-river-network` operation replays the frozen current-main
Huge captures exactly with their authored controls. Inputs are immutable.
No cutoff or density control is adjusted.

| Reference Or Seed | Terrestrial Tiles | Major River Tiles | Major Tiles Per 100 Terrestrial Tiles | Major Tiles Below Their Own Discharge Threshold |
| --- | ---: | ---: | ---: | ---: |
| Firaxis authored Huge Earth | 3,158 | 194 | 6.14 | Not measured |
| C3 Huge 2 | 2,499 | 216 | 8.64 | 45 |
| C3 Huge 1018 | 2,556 | 320 | 12.52 | 74 |
| C3 Huge 1234 | 1,700 | 242 | 14.24 | 59 |

The Firaxis source contains 396 unique river source declarations: 194 NAVIGABLE
and 202 MINOR, with no duplicate source plots. These are script declarations,
not completed-native observations. Its terrestrial denominator comes from the
source terrain before river painting. The procedural denominator is resolved
exposed land, excluding certified wet bodies. Both grids are `106x66`, but
latitude, geographic area, coastline and climate are not equivalent. The table
therefore establishes a comparison worth studying, not a target percentage.

The retained Earthlike authoring uses minor/major discharge percentiles
`0.74/0.88`. The previous operation first finds sufficiently strong endpoints, then
promotes each endpoint's strongest upstream minor path without rechecking the
major threshold along that path. Thus a major label does not currently imply
that the source meets the major threshold. The measured 45/74/59 promoted
sources make that distinction concrete; they do not explain every visual
disconnection or prove that the selected thresholds are physically calibrated.

Owner:
`plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/project-river-network/strategies/discharge-percentiles/index.ts`.

## Next Discriminator

After rejecting the upstream candidate, discriminate direct nested discharge
classification at this same operation. Hold its inputs, threshold population,
percentiles and minimum thresholds exactly. Every eligible positive dry source
is major precisely when it meets the major threshold, otherwise minor when it
meets the minor threshold. Remove endpoint selection and upstream growth rather
than maintain another corridor-building algorithm beside the admitted network.
Minor tributaries may feed a major trunk without becoming tile-wide navigable
rivers themselves. All supported tributaries remain classified, including a
dry outlet separated by a wet hydraulic component. Do not carve terrain or
suppress a source at native projection to conceal the class.

Predeclare these guards before running the candidate:

- Exact immutable drainage, discharge, lake heads and climate inputs.
- Every major source meets the existing major threshold; every class still
  refers to a legal positive-discharge edge.
- Existing minor-threshold network membership (all class-positive sources) is
  unchanged and major membership stays nested within it. Individual sources
  may change between minor and major. No new class or materialization fallback
  is introduced.
- No discharge-supported trunk segment is lost because an endpoint selector
  ignores a tributary or a finite wet-body transition.
- Full retained study membership, conservation, placement and projection
  requirements remain unchanged. Keep native behavior separate from intent.
- Compare held Earthlike seeds and both sizes. Inspect source density and
  complete-network views, not one favorable head photograph.

The direct classification repair passes the unchanged qualification below;
the baseline observation alone did not select it. The remaining difference
from Firaxis Earth must be attributed to
actual climate, geography and authored scale policy, not eliminated by fitting
one count. Dimensional channel-width or hydraulic navigation claims require
their own admitted physical units.

## Qualification

The unchanged complete bank generates all fifty-seven scenarios and retains
all 4,430 expectations, with zero newly failed expectations. The original
within-row temperature and savanna expectations remain failed and are not
waived. Across every case, sixteen physical fields are byte-identical,
including initial/final elevation, sea datum, masks, lake footprint, complete
hydraulic budget/discharge ledger, principal flow, temperature, rainfall,
pressure and wind. Class-sensitive effective moisture, biome and vegetation
outputs legitimately change; they are measured rather than asserted identical.

Four retained actual-owner replays establish unchanged any-river membership,
immutable inputs, zero unsupported major sources and no omitted supported
sources. No threshold or percentile changes are included.

| Case | Previous Major Tiles | Supported Major Tiles | Weak Sources Demoted To Minor | Strong Sources Previously Omitted |
| --- | ---: | ---: | ---: | ---: |
| Huge 2 | 216 | 301 | 45 | 130 |
| Huge 1018 | 320 | 308 | 74 | 62 |
| Huge 1234 | 242 | 205 | 59 | 22 |
| Standard 1018 | 187 | 203 | 42 | 58 |

The retained `0.88` percentile gives approximately twelve major sources per
hundred terrestrial tiles in these cases. This is explicit map-relative
authoring policy, not proof of an Earth navigability density. Firaxis source
comparison is about six per hundred on its different geography. Lowering the
count is a separate authoring/calibration decision, not this correctness fix.

The nine focused classification tests and five body-aware tests pass.
Independent physical-boundary/SDK review finds no source defect or extra
authoring machinery. The definition suite passes 1,181 tests with its one
retained science aggregate failure; 319 realization tests pass. The final
definition/realization/Studio check, build and deployment graph passes.
That graph also exposes and repairs missing hillslope and channel-incision
schema descriptions; the repair changes metadata only, not defaults or
computation. Studio's complete regenerated metadata check and all 412 tests
pass. The final owner check/build/deployment graph passes all 41 tasks.

Current qualification is portable and deployed, not a new native movement
claim. The prior C3 lake-passage proof retains its separate installed build.
Evidence: `river-supported-qualified-native-bank-20261002/`,
`river-supported-qualification-20261002.json`,
`river-support-owner-proof-20261002.log` and
`river-support-formatted-metadata-owner-proof-20261002.log`,
`river-support-schema-final-owner-proof-20261002.log` and
`river-support-studio-final-test-20261002.log`.

## Evidence

Research user-data root:
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/`.

- `foundation-column-baseline-native-bank-20261002/`: all 57 current-main
  scenario inputs, source/target pins, measured samples and field digests; four
  retained full captures. All 22 studies retain their original requirements.
- `current-major-river-support-audit-20261002.json`: exact actual-owner replay,
  thresholds, coordinates/discharge of every under-threshold major source,
  reference provenance and interpretation limits.
- `audit-current-major-river-support-20261002.mjs`: read-only replay and source
  census, with no recipe execution, source editing or native mutation.

The checked-in fixture remains
`test/recipes/swooper-physics-standard/fixtures/earth/earth-huge.json`
under the Swooper definition. Its SHA-256 is
`b07db6239e2bb4f6ce5a112335cc52194cf245fd8387f12aa3001817af31b4ca`.
