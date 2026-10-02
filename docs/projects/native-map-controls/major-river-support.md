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

## Native Finalization Discriminator

The fresh normal Huge1018 run completes generation, but final readback contains
420 MINOR and 246 NAV sources instead of the intended 358 MINOR and 308 NAV.
All 666 source identities survive. The 62 class substitutions exactly match
the NAV terrain mismatches. They comprise 34 newly supported sources and 28
previously major sources; the other 28 newly supported sources survive as NAV.
The intended source rows match the qualified portable bank exactly.

The existing app-owned `full-map-maintenance` diagnostic repeats the authentic
Earthlike recipe, stock cutoff ten, both seeds 1018, twelve players and
Exploration. Its additive source observations locate the first difference:
all 666 dry classes match immediately before authentic call 8,
`finalizeRivers(false,25,2,2)`. Immediately afterward, precisely those 62 NAV
classes are MINOR. Subsequent validation, areas, water caches, wet-height
preservation and final-height cliff generation change none of the source
classes or source terrain. The 39 authentic wet declarations remain separate
from the dry-source census. No production observer, physics change or replay
was added for this experiment.

This locates an engine projection rule, not a discharge-classification defect.
It does not yet establish which finalizer setting or native topology rule is
responsible. Discriminate the two native minima independently on the same
complete map: retain aesthetics disabled and percent 25, change only upstream
minimum to zero, then only length minimum to zero, and use both zero only to
test their interaction. Keep every physical artifact, dry/wet declaration,
elevation request, ordinary call order and once-only finalization identical.
Admit a production tuple only after complete final source/class parity and
collateral checks; do not rewrite rivers afterward, carve terrain or waive
the parity expectation. PR #2245 remains unmerged during this qualification.

All three declared minima arms now complete on the exact same Huge1018 map:
`[false,25,2,0]`, `[false,25,0,2]` and `[false,25,0,0]`. Each preserves the
entire final parity payload, all 36 paired phase payloads, physical-lake
observations, 705 dry/wet declarations, first 6,996-height request and observed
generation setup exactly. The same 62 sources are demoted in every arm. Thus
neither minimum nor their interaction explains this case, and no production
minimum change is selected. Arm evidence is retained in
`river-source-authored-{upstream,length,minima}-1018-v28-20261002/`.

Ordinary in-game Restart is not a same-seed discriminator: its first test
completed the physical recipe with newly randomized map/game seeds, and the
private observer correctly refused the mismatched setup. The exact-seed arms
use the existing saved-start owner after returning visibly to the main menu,
without quitting the application. The unmatched run and actual earlier
pre-generation session crashes remain separate evidence, not water failures.

The current full shore census reads all 246 final observed NAV sources in all
six native directions, using seven bounded read-only requests. It finds 215
NAV-to-ordinary-water edges, including 69 native-lake receiver edges. Three
directed marine edges retain true cliff flags: `(88,14)->(89,14)` EAST,
`(88,14)->(88,13)` SOUTHEAST, and `(94,19)->(95,18)` SOUTHEAST. The earlier three
chosen false-flag edges were not a full census. Heights and cliff flags are
observations, not navigation outcomes or a physical cliff threshold. Evidence:
`supported-river-native-shore-census-20261002/`.

The next source-backed rival was declaration order, not another threshold:
Firaxis's authored Earth table predominantly declares the downstream receiver
before its upstream source, whereas our declarations are raster-ordered.
This is a hypothesis about native projection state, not an established API
requirement. Any discriminator must preserve every declaration, its class and
direction, the baseline finalization tuple, every physical artifact, heights
and authentic call order.

The private `authored-downstream` arm now completes at the same Huge1018 setup
with the baseline `[false,25,2,2]` tuple. Every one of the 705 declarations is
delivered once, including all 39 wet sources; all 546 internal declaration
dependencies are delivered receiver-before-source with original-ordinal ready
ties. Native adjacency resolves the same receiver, direction, class and wet
identity as the qualified portable projection for every declaration. The full
final parity payload, all 36 authentic before/after payloads and complete
165-cell physical-lake observation are exactly unchanged from baseline.
Ordering is therefore nonselected for this case, not a production repair.
Evidence: `river-source-authored-downstream-1018-v29-20261002/`.

The updated app fixture and tests pass the full owning graph: 28 tasks,
371 tests and 55,859 assertions, including both app TypeScript checks and
policy admission. The intervention remains test-only; no production tuple,
delivery order, terrain, source membership or physical field is changed.
The remaining discriminator concerns native channel geometry and supported
realization, not an assumed difference in geographic direction or write order.
Major discharge support and actual vessel navigability remain separate claims.

Frozen baseline evidence:
`river-source-maintenance-phase-scripting-20261002.log`,
`river-source-maintenance-phase-proof-20261002.json`,
`river-source-maintenance-observer-deploy-20261002.receipt.json` and
`river-source-maintenance-observer-live-r2-20261002.receipt.json`.
The diagnostic script SHA is
`3fb3d6b2eaef41582955bcb5814b4afc3652c82adef5330a67b0f222a4596616`.
The earlier session transition crashed before generation; its uncertain
lifecycle receipt and native crash report remain separate from this passed
fresh-main-menu experiment.

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
