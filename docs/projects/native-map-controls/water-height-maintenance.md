# Inland Water Height Maintenance

The wet-outlet authoring correction is accepted. V11 establishes that native
lake classification prevents the measured inland-water height loss and repairs
the visible cliff-ring defect without physical grading. V12 rejects removing
the size limit globally: it also reclassifies the ocean. It does not reject a
bounded map-scoped cutoff. Qualifying that simpler classification policy is
the next discriminator; late height reapplication remains an alternative, not
the selected repair. Neither general production policy nor actual naval
traversal is yet qualified.

## Bounded Connectivity Controls

V13/V14 are now paired native observations, following the source-tested Tiny
diagnostics. The existing app-owned river probe admits
`water-connectivity-cutoff-5` and `water-connectivity-cutoff-10`. Each contains
translated 5/6-cell basins joined to the exterior ocean by ordinary COAST
tiles, dry NAV, dry MINOR, or no outlet. Isolated 4/5/6/9/10/11-cell controls
distinguish strict from inclusive size comparison. Only NAV receives the
already-qualified wet outlet write; this does not invent MINOR wet semantics.

The existing MapInUse-scoped database component selects Tiny's cutoff before
generation, and numeric map metadata must agree before mutation. Every existing
checkpoint records terrain/river class plus row-batched native water, lake,
height, area and ocean-connectivity observations. Authored player landmass
regions are labeled separately from water connectivity. Native call failures
are retained as unavailable evidence, never negative classification results.

The focused source suite passes 32 tests (26,287 assertions), including legacy
probe preservation and generated manifest scope. That source proof establishes
fixture structure and build routing only; the live observations below establish
the tested classification and height behavior, not ship passage.

### Paired Native Results

Both successful live runs completed all nine checkpoints, 342 row batches per
run, 30 ordered writes and two wet NAV writes, with zero write failures or
unavailable grid observations. The four deployed diagnostic files matched the
retained build before each launch. Exact proof IDs, revisions, fixture hash and
fresh run windows were checked. The built JavaScript differs only at the
registration line selecting the proof and arm; native map metadata differs only
at cutoff. The exterior marine geometry is held fixed.

| Control | Cutoff 5 | Cutoff 10 |
| --- | --- | --- |
| 5/6-cell basin connected by ordinary COAST strait | Nonlake, height 0 | Identical |
| NAV, MINOR or no-river 5-cell basin | Lake, height 322 retained | Identical |
| NAV, MINOR or no-river 6-cell basin | Nonlake, 322 -> 194 -> 66 | Lake, height 322 retained |
| Isolated 4/5-cell body | Lake, height 572 retained | Identical |
| Isolated 6/9/10-cell body | Nonlake, 572 -> 444 -> 316 | Lake, height 572 retained |
| Isolated 11-cell body | Nonlake, 572 -> 444 -> 316 | Identical |

The tested size rule is **inclusive** at both boundaries. Across every cell and
checkpoint, terrain, river class, water flag, native area ID, area-water flag
and authored player landmass region agree between runs. Exactly 43 cells switch
from nonlake to lake at cutoff10. Their initial heights agree, then classification
preserves 128 native units at river finalization and another 128 at terrain
validation. No new wet cells are created and the marine controls are unchanged.

NAV-connected lakes retain a separate water area and lake identity while their
area's ocean-access flag becomes true after `storeWaterData`. MINOR and closed
lake controls do not gain that flag. Conversely, isolated nonlake controls can
already report ocean-connected at initialization. Therefore
`AreaBuilder.isAreaConnectedToOcean` is not a literal path-of-water-tiles test,
and neither it nor a river ocean flag proves ship passage. These observations
support the user's ordinary-water-strait versus river-connector distinction
without conflating marine classification, river access and vessel movement.

Evidence lives under
`earth-calibration/native-water-connectivity-20260929/` in the documented
VisualAtlas root. The bounded Bun analyzer and comparison retain raw logs,
builds, per-cell observations and the two successful live receipts. Comparison
receipt SHA-256:
`7cd7e6b0dacc997cde5a8b73e307844207545adbaa24f5d603cae4fc8941dcf4`.
The first attempt timed out returning the previous Huge game to the menu before
test generation; it is retained separately and excluded from native outcomes.

### Cutoff Policy Boundary

A cutoff should cover intended native lake components without swallowing
protected non-lake water components. The tested ordinary-water component rule,
not the mere presence of a river outlet, determines the useful size comparison.
The paired experiment does not yet select a universal 40/100 cap or establish
that one threshold separates those sets on every generated map.

No confirmed runtime cutoff setter was found in the inspected shipped scripts,
embedded declarations, generated API declarations or adapter. The qualified
mechanism is the map-scoped, pre-generation `Maps` database update used here.
Our production entrypoint captures map metadata before the recipe runs, while
actual lake sizes are produced later. Assigning to a returned `GameInfo` row is
not an admitted native update. An exact per-seed maximum therefore needs a
qualified pre-start computation path; it is not currently a free runtime fix.
A bounded map/size policy can use the demonstrated database path, but modified
metadata must have truthful custom setup admission. Keep official-preset
validation strict, as the earlier V10 refusal demonstrated.

### Playable Restoration And Iteration

The latest normal mod was deployed after the paired test and Huge Earthlike
successfully loaded with `ToT_NoModsExceptMaps`, both seeds 1018 and its saved
12-player count. The built/deployed script SHA-256 is
`b2b2b7383d39166f4a95d2b5c7a388409fc372e4abc966b4fa7d33e6548c5abb`.
Fresh completion and runtime identity passed; native Huge cutoff remains 10.
The retained `restore-{deploy.log,live.log,scripting.log,map-info.json}` files
separate this playable latest-code handback from final calibration acceptance.

For an already registered mod, deploy changed files and restart/regenerate the
game while leaving the Civ application open. Full application restarts are not
a normal deployment requirement; reserve them for newly introduced mod
registration or demonstrated recovery needs. The first menu-transition timeout
did not justify the repeated process restarts used during this investigation.
The launcher uses the same `engine.call("exitToMainMenu")` as shipped Firaxis
automation; the retained timeout does not yet establish its underlying cause.

## Current Discriminator

All values below are native units, not model metres. The production whole-map
read and the original atlas agree; the issue predates the wet-outlet repair.
These are the original atlas body labels, not the cell-based physical body IDs
used by the later current-source replay.

| Body | Native lake | Post elevation setter | Final water | Final NAV receiver |
| --- | --- | ---: | ---: | ---: |
| 42 | yes | 260 | 260 | 388 |
| 56 | yes | 460 | 460 | 588 |
| 63 | no | 110 | 0 | 238 |
| 67 | no | 230 | 0 | 358 |
| 69 | no | 530 | 18 | 658 |

The observation-only V9 replay now attributes the whole loss. Body69 is 530
after the setter, 402 after river finalization, then 274, 146 and 18 after the
three subsequent terrain validations. All 17 observed native calls have paired
before/after records; none failed. Bodies42/56 remain 260/460 throughout.
Cliff generation, area recalculation and water-cache writes do not change these
heights. Treat 128 as an observation, never an invented correction constant.

## Shipped Source And Classification

The installed 1.5 resources expose the following sequence:

- `Base/modules/base-standard/maps/EarthMaps/Earth_Huge.js:30`: paint explicit
  elevation, generate cliffs, paint rivers, then use the common feature helper
  with procedural elevation/rivers disabled and aesthetic validation false.
- `Base/modules/base-standard/scripts/common-generation.js:49`: validate,
  recalculate areas, finalize authored rivers, then validate again and cache water.
- `Base/modules/base-standard/maps/continents.js:150`: create lakes before
  native elevation/rivers, with further validation after rivers and features.
- `Base/modules/base-standard/data/maps.xml:107`: Huge has
  `LakeSizeCutoff="10"`. Bodies63/67/69 contain 17/16/15 cells, respectively.
  These are exactly the 48 accepted inland-water cells that Civ reports as
  non-lake and whose height drifts. Smaller control bodies remain native lakes.

No separate JavaScript waterfall construction or navigable-cliff connector was
found in those shipped paths. Native rendering internals are not visible here.
V11 below now confirms the classification cause and visual repair. It does not
establish naval traversal or a general production cutoff.

## Classification Ablation

Use the official `MapInUse` criterion documented in
`apps/docs/official/guides/modinfo-files.mdx:209` to gate one diagnostic-only
game database update: Huge cutoff10 (control) versus20 (treatment). This keeps
the actual map-size identity and every other Huge field fixed. It does not
modify official resources, production config, or the normal map's Huge row.
The builder owns the generated XML; never hand-edit deployed files.

Before the first wrapped native call, require the live map-info cutoff to match
the arm. A criterion that fails to activate is an invalid attempt, not a negative
result. Reuse the observation-only tracing around the exact same canonical
recipe, intended elevations, dry and wet river declarations and maintenance.

Predeclared movement: precisely 48 cells become native lakes, repeated height
loss stops, and the large-body outlet cliff defect improves visually. Hold
physical fields, all dry heights/terrain/river classes, original ocean, and the
existing lake controls. V11 meets these comparisons; the nonmatching normal
map's cutoff10 is separately verified after V12 below.

This tests a classification cause; cutoff20 is not yet a qualified universal
lake policy. V11 passes its causal and visual comparisons. V12 rejects removing
the size boundary globally, not bounded classification. The earlier inference
that this made maintenance reapplication preferable was too strong.

## Bounded Whole-Map Replay

V15 adds the predeclared cutoff40 arm to the existing app-owned diagnostic,
with explicit signed-32-bit seed metadata for paired Huge42 and Huge1018.
It changes only diagnostic native classification and truthful setup admission;
the procedural recipe, operation configuration, physical lake geometry,
elevation encoding and ordered river declarations are unchanged. Off seed1018,
the retained focus coordinates are labeled coordinate controls rather than
reusing seed1018's body IDs or hydraulic roles. Legacy V9/V11/V12 observations
remain covered by exact digest tests. The focused suite passes 59 tests and
27,479 assertions; the app-owned graph passes 187 tests, typecheck and Habitat.

The admitted Huge42 stock10/cutoff40 pair completes all 17 before/after
maintenance observations and reads all 6,996 native cells with bounded chunks.
Before comparison, a current-source portable replay uses the captured native
initial setup and actual map seed. All logged elevation intents, accepted wet
cells/body IDs and ordered river declarations must match exactly before its
original marine mask is admitted as a model witness. This is not a claim that
every portable model value has been observed inside Civ.

| Huge42 Guard | Measured Result |
| --- | --- |
| Intended and post-setter native elevations | All 6,996 exact between arms |
| Ordered river writes | All 656 exact: 618 dry, 38 wet |
| Accepted lake cells | All 224 remain water and become/remain native lakes |
| Larger lake bodies | 15/33/14 cells retain native heights 270/330/300, instead of final 0 |
| Original model marine cells | All 4,397 preserve baseline lake identity and native height |
| Terrain, biome, features, resources, rainfall, fertility and river class | Zero changes |
| Native area/region/landmass identity and partition | Zero changes |

Exactly 62 accepted cells change final lake identity and retain their initial
setter height. Eleven original model-water cells were already native lakes;
preserving their baseline identity is intentional, not reclassifying them as
ocean to make the comparison pass. All 55 portable contract-provided artifacts
also match between the admitted replays. Final projected river parity has zero
missing/extra/wrong-class writes or terrain mismatches. These numeric results
support bounded classification without terrain grading or another height pass;
they do not prove rendered world-space height, naval traversal, universal
cutoff coverage or production adoption.

Evidence is retained in `earth-calibration/bounded-lake-cutoff-20260930/` under
the documented VisualAtlas root. The independent Bun comparison has 14 tests
and 40 assertions, including retained V9/V11 replay and negative admission
cases. Huge42 comparison receipt SHA-256:
`b1ce0405e66b6d00cba3564d6e59b0a3ab7a0bda3ef094073c98cfc3cee57467`.
Retained build/installation receipts, raw scripting logs, fresh live receipts
and native full-grid captures are separate from the comparison result.

The same treatment then passes the unchanged Huge1018 holdout. All 6,996
intended/post-setter elevations, 693 ordered declarations (656 dry, 37 wet),
203 accepted lake cells in 55 physical bodies and 55 provided portable
artifacts agree between arms. Exactly 48 cells change lake identity and retain
their initial setter heights: 16/15/17-cell bodies preserve 230/530/110 rather
than falling to 0/18/0. All 4,276 original model marine cells preserve baseline
classification and height, including one pre-existing native lake. Every other
native field and area/region/landmass partition is unchanged; final river
parity has zero missing/extra/wrong-class writes or terrain mismatches.
All twelve admission/preservation guards pass, with no unavailable evidence.
Huge1018 comparison receipt SHA-256:
`ddbe45b0ef8d76fe90361c4b9d2f1c053c2e53fc2f57605f81df2f487ede0992`.
This extends numeric preservation to the second held map; it does not turn
two Huge maps into a universal lake policy or establish ship movement.

The initial target-mod reconciliation crash occurred before generation and is
excluded. Two cutoff40 activation attempts retained cutoff10 and refused before
mutation; a graceful application reload was needed for the newly introduced
database ActionGroup registration. The successful Huge42 live receipt completes
at `2026-09-30T15:15:40.929Z` on build1311346. Ordinary registered JavaScript
deployment still uses in-game restart. See the separate
[Tuner boundary audit](tuner-runtime-boundary.md) rather than attributing these
distinct lifecycle failures to hydrology or request size.

The normal Earthlike map was restored after these observations. Fresh live
completion at `2026-09-30T15:44:25.077Z` confirms Huge, both seeds1018, ten
players and normal cutoff10. Built and installed script SHA-256:
`5dcd4760d88a8f06541955d46e1c9eac86f3475f88183da1238d2155822827f1`.
The `normal-earthlike-restored-fresh-{live,scripting}.log` receipts in the same
directory distinguish playable latest code from the diagnostic treatment.

## Bounded Classification First

The user's cutoff20 wide-network image represents a successful treatment, not
an observed overfill. All initial height inputs and post-setter observations
hold. The same 48 existing wet cells keep their original post-setter heights
110/230/530 instead of falling to 0/0/18. No extra land becomes water, no lake
footprint grows, and all other recorded surface fields remain unchanged. This
does not independently establish physical bed depth or naval passage, but
there is no measured defect in V11 that warrants rejecting its visual repair.

The reason not to adopt 20 as the final universal value is coverage, not
overfilling: the retained Huge42 map contains a 33-cell physical lake. Nor is
the engine's classification input proven to equal raw wet connected components
or native area IDs. The `MapInUse` mechanism is qualified and scopes the
database update to the selected map script; it is still a map-size-wide
threshold, not a per-body override. Normal restored Earthlike still uses 10.

The retained component census adds a concrete discriminator:

| Cohort | Largest intended wet component | Original model-water component sizes |
| --- | ---: | --- |
| Huge1018 | 17 | 1, 88, 109, 395, 3683 |
| Huge42 | 33 | 1, 10, 68, 4318 |
| Standard1018 | 17 | 134, 2658 |

Intended physical bodies and wet components are one-to-one in these samples,
with no component mixing intended wet cells and original model water. That is
not a general invariant. Existing tiny original-water components may already
be native lakes; preserve their baseline identity rather than demanding every
original-water cell be non-lake. The interior range 34-67 separates sampled
intended components from original-water components above the stock ten-cell
class, but is only a candidate range: an 88-cell original-water component has
native area partitions of 30/31/27, proving those partitions are not the raw
water graph. Only a native run qualifies the actual classifier outcome.

The stock10/cutoff40 comparisons now pass on Huge42 and Huge1018 as recorded
above. Forty lies inside the candidate range and is not an authored default
chosen from one screenshot. Next extend to Standard1018 and retained whole-map
size/body cohorts before selecting product policy. Require exact
physical/intended-write parity, native coverage of accepted lake footprints,
preserved original marine classification/heights, and unchanged unrelated
features/resources/terrain, then inspect the same wide and outlet views.
Do not shrink lakes, regenerate until a seed fits, or add a seed-failure gate.

Lake classification has gameplay consequences beyond rendering: shipped
`terrain.xml` includes `IN_LAKE` feature eligibility. Treat any feature change
as a measured policy consequence requiring review, not automatically a reason
to hide it or a claim of perfect parity. Traversal retains its independent
era-qualified test. Admit modified map metadata truthfully as custom rather
than weakening official-preset admission.

If bounded classification satisfies the selected supported regimes, prefer
the native classification control over a new compensating height pass. If
lake and marine regimes cannot be separated reliably, or intended gameplay
categories conflict, return to height maintenance with that concrete evidence.
V12 alone does not establish either failure.

The offline census script and hashed JSON are retained beside the Earth census
under `huge-1018/earth-calibration/lake-cutoff-component-census.{mjs,json}` in
the documented VisualAtlas root. Syntax, assertions, current config equality
and deterministic replay pass. The census alone did not qualify native
classification; the subsequent paired Huge42/Huge1018 observations now do so
at the bounded scope above. Standard, closed/below-sea controls and actual
era-qualified movement remain separate follow-through.
Independent design review confirms that V11 supplies no overfill evidence and
that rejecting V12 does not establish preference for reapplication.

### Ring Footprint Counterexample

The current-source Shattered Ring Huge1337 stock10/cutoff40 pair is admitted
but fails complete accepted-lake coverage and height retention. The 19-, 27-
and 38-cell bodies retain 1250, 1210 and 1180 native units respectively at 40.
One separate 252-cell body remains nonlake and falls from 1180 to 668 in both
arms. Every missing coverage cell and remaining maintenance-height change is
in that body. It has no ordinary-water adjacency to marine or another body.

The physical hydraulic group is not the native classification footprint:
three bodies share physical head 33 and a 318-member component, including
27 dry junctions, but the smaller bodies qualify independently. All original
4,877 marine cells remain nonlake at 0. Only the 84 repaired cells change lake
flag and elevation; all 13 unrelated native readback facts and all 55 portable
artifacts hold. The complete physical identities, Number heads, declarations,
post-setter arrays and maintenance schedule agree. Intermediate focus points
are outside accepted lakes, so this pair does not attribute the 252-cell loss
to individual maintenance calls. Receipt:
`earth-calibration/bounded-lake-cutoff-20260930/ring-huge1337-stock10-vs40-current-20261001.json`,
SHA256 `3a52d07ce15c63ef432b9325ec44f60cb2213fa39b936dab1dba92e0419aceab`.

Predeclare one cutoff 252 diagnostic arm on the identical Ring/Huge/1337 setup,
using the existing catalog, public preset and whole-map fixture. Predict that
the existing 252-cell footprint becomes native lake and retains 1180, the other
111 accepted cells remain unchanged, and original marine identity/height,
physical artifacts, ordered writes and unrelated facts hold. Compare against
the sealed stock10 arm and retain 40 as the intermediate negative control.
Failure at 252 is a discriminator, not permission to enlarge the cap until it
passes. This does not prove an exact 251/252 boundary or select product policy.

The predeclared 252 arm passes all 14 guards. The 252-cell body becomes native
lake and retains 1180; the other 111 accepted cells retain their intended
heights. Against stock10, exactly 336 cells change native lake flag and height;
all 13 unrelated native facts and all 55 portable artifacts hold. All 4,877
original marine cells remain nonlake at 0. The full-grid capture is complete,
stable at turn1, and joined to the proof and fresh completed log, not inferred
from the authored footprint. Receipt:
`earth-calibration/bounded-lake-cutoff-20260930/ring-huge1337-stock10-vs252-current-20261001.json`,
SHA256 `07be2e7fa9f77bc11c62452f0177c858eda98e26ff4b29968b92a66a3cb2f040`.
This confirms a class-dependent height-preservation lever in this member, not
a universal cap, exact classifier boundary, shoreline appearance or navigation.

The candidate separation interval for this sample is 252 through 4876. It does
not overlap the earlier Earthlike component-census interval 34 through 67.
Counts alone do not qualify those cross-map native outcomes, but they prevent
claiming a universal 40 or 252 policy. Per-seed footprints are available after
physical generation; the qualified database control is selected before it.
Investigate direct native controls and maintenance sequencing rather than
inventing a second generator, clipping lakes, adding map-type exceptions or
reviving retired water algorithms. Closed below-sea encoding and era-qualified
ship movement retain their separate discriminators.

### Refreshed Native Source

The installed 1.5.0.43 build1311346 snapshot is now materialized through the
resource/API owner and published as resource commit
`9f6b93e129d47faf96ed6814f652560e7b7573d0`. Its source snapshot SHA256 is
`53565e40b47ecb374555868508a639175f8d64d793661c182c03dfc0620de391`.
All 18 relevant map/elevation/control source files and maps are byte-identical
to the previous snapshot; independent checks match 20 actual installed files.
The changed age-transition code handles Earth resources/district cleanup;
its `storeWaterData()` call remains. Current source adds no qualified direct
per-body lake classifier, water-head setter or numeric sea datum control.
This bounded source finding does not exhaust undocumented native exports.

A separate read-only `game inspect` on the current Tuner realm enumerates
`TerrainBuilder`, `AreaBuilder` and `MapRivers`. The exposed own/prototype
members add no per-body lake-classification, water-head or sea-datum setter.
Native function `length:0` and `[native code]` do not establish signatures.
Retained observation:
`earth-calibration/bounded-lake-cutoff-20260930/current-native-water-api-inspection-20261001.json`.
This closes the obvious exported-control alternative for these three roots,
not every possible engine root or a proof that another native control cannot
exist.

Generated API and policy provenance are regenerated through their owners.
No preset, table value or map selection is manually rewritten. This refresh
does not retroactively qualify save/reload or age-transition height durability.

### Closed Water Lower-Bound Discriminator

The existing app-owned probe selector gains one diagnostic-only stock-Tiny
arm, `water-closed-lower-bound`. Four translated isolated 2x2 COAST bodies
have identical complete dry-shore geometry and native wet/shore requests
`(0,129)`, `(0,128)`, `(0,127)` and `(-1,128)`. Stock Tiny metadata, including
cutoff6 and four players, stays unchanged; there is no database treatment.
An immediate post-setter observation precedes the ordinary initial water cache,
followed by the same nine maintenance checkpoints. Native adjacency/readbacks
qualify the authored shores and requested-value acceptance independently.

This separates native wet-request handling and the observed dry-land floor
from physical below-sea lake encoding. The source-only projection regression
explicitly records that the current policy collapses accepted lake relief below
and at the physical datum to native128 on either modeled land mask. That is a
loss of physical distinctions, not a native acceptance claim or a completed
repair. The experiment may falsify a direct lower-bound encoding; it must not
introduce readback gates, compensating offsets, a second height law or any
instrumentation into the ordinary physics recipe.

The arm passes its owning types/tests/Habitat graph and loads without a full
application restart. The closed app topology refused a separate fixture file;
the controls now extend the existing `water-connectivity.fixture.ts` instead,
without weakening the law or creating a parallel harness. Existing5/10
geometry/native-call semantics hold; rebuilt source identities are fresh, while
archived proofs remain immutable.

All 143 analysis admission checks pass across ten checkpoints, 38 complete
rows each and a stable final 2,280-cell native capture. The four requested
wet/shore pairs respectively read back `(1,129)`, `(0,128)`, `(0,128)` and
`(0,128)` immediately after the setter. Each observed body is a four-cell
COAST lake with its own four-cell water area, no ocean connection and a
complete ten-cell dry shore qualified by native adjacency. All eight logged
full-grid fields hold through every later checkpoint; the 444-cell marine
area remains nonlake at0. Receipt:
`earth-calibration/bounded-lake-cutoff-20260930/water-closed-lower-bound-20261001-analysis.json`,
SHA256 `87bbef459a493c695b8549fc3262ea4477251ece697ab2b719ebaad9917ea173`.

Zero native lake height is valid here, so water height alone cannot classify
lake versus sea. The wet request is not direct water-head authorship: wet0
with shore129 becomes1 before any subsequent maintenance. The shore127
request already reads128, and wet-1 already reads0. This separates the initial
projection loss from the later nonlake maintenance defect. It does not
distinguish ignored input from internal clamping/recomputation or establish a
universal prohibition on negative native water. Preserve physical below-sea
truth; do not raise physical terrain, add an offset or alter cutoff to hide
this bounded native limitation.

## Alternative Height-Lifecycle Repair

Keep the initial canonical height write: native feature legality and wonder
planning already consume it, and shipped Earth writes before rivers/wonders.
The last explicit validator is in `placement/prepare-placement-surface`, after
wonder placement, not in `plot-rivers`. The candidate repair therefore belongs
after that step's coast restoration and before its area/cache refresh, with
cliffs rebuilt from the settled surface. Do not mutate the terminal observer
or use an observation trace to steer native writes.

The exact setter input remains unselected. Native readbacks are not proven
safe inputs to a second bulk setter: water leveling is class-dependent, and
native wonders can legitimately change footprint elevations (the retained
Redwood case is 638 -> 598). Neither blindly merging current readbacks nor
reapplying every canonical value is a qualified preservation policy.

Any adoption of this alternative must qualify that conversion, retain protected
feature/wonder geometry, and compare the complete pre-write, post-write,
post-maintenance and completed-game surfaces with stock cutoff10. Hold the
physical arrays, 693 river declarations, marine classification, dry NAV
geometry and unaffected features/resources. Require retained water heights
and repaired shorelines; test actual ship passage separately. Reuse the
canonical elevation projection, not a compensating 128 offset, a per-seed
cutoff, lake clipping or a new seed-failure gate.

If a discontinuity remains after height preservation, compare MINOR versus
NAV cliff treatment as a separate arm. A real impassable drop may warrant
non-navigable classification; the measured engine-created drop does not
justify physical outlet grading. No candidate height-lifecycle change is
implemented or claimed successful in this diagnostic slice.

### Original-Input Replay Discriminator

The existing connectivity fixture now admits a stock-Tiny control V16 and
original-request replay V17. Both select the public 60x38, four-player,
cutoff6 setup with seeds 1018/1019; neither introduces a database treatment.
They share every original terrain request, height, 30 river declarations,
start and finalization argument. Both retain the nine base checkpoints and
observe the same additional slot immediately after the genuine
`after-validate` capture and before area/water-cache refresh. Only V17 invokes
one additional bulk setter there. Its Number-array input is copied from the
original requests before the first setter, never constructed from readbacks.

The primary prediction is that the isolated eleven-cell nonlake body's
initial572 -> finalized444 -> validated316 sequence recovers to572 after
replay and remains there through subsequent refresh. All native classification,
terrain, original marine/dry heights, river classes and area/connectivity
observations are collateral comparisons, not assumed invariants. In
particular, the replay sees finalized NAV terrain that the first setter did
not; non-idempotent dry/NAV changes would reject blind whole-map replay.

This fixture is a discriminator, not a second projection law or a production
recipe observer. No offset, new validation/finalization, retry, cutoff change,
readback-as-input policy or wonder-preservation claim is introduced. Existing
5/10 connectivity and lower-bound controls retain their native call sequence.
Source tests qualify request equality, slot ordering and failure behavior;
native retention, collateral geometry and later product suitability must be
measured separately before a repair is selected.

Numerical evolution stays with C3. The probe must not introduce a second river
solver or move calculations into steps. Independent review, focused tests and
the owning app graph precede native use. The stock Exploration Cog movement
control remains separate and uses the ordinary Advanced Start grant, not a
debug-created Galley.

## V9 Verification

The app check/test graph passed (156 tests, 20,486 assertions), and the native
Huge1018 ten-player run completed through the owning live verifier. Built and
deployed diagnostic script SHA256:
`13cc0d9153e228324c69a2cb66fc95d0e2f96210a68f5c35af5d85fa0d388bd8`.
Retained raw proof lives under the documented VisualAtlas root at
`huge-1018/native-wet-outlet-ab/v9-{proof.json,live.log,scripting.log}`.
The [stack consolidation](stack-consolidation.md) changes review boundaries,
not this runtime result.

## First Treatment Attempt

V10 confirms that the documented map criterion activates: the captured native
Huge row contained cutoff20. Generation then refused before terrain generation
because the ordinary setup projector labeled that modified row `civ7-preset`,
whose admission correctly requires the exact official cutoff10. This attempt
is excluded from hydraulic or visual comparisons. Raw refusal and the failed
live verifier are retained as `v10-refused-scripting.log` and `v10-live.log`.

The corrected diagnostic declares the existing `custom` selection shape while
retaining the real native row, dimensions, capacity and option evidence. It
must verify that cutoff is the only changed official Huge field. Normal preset
admission stays unchanged; no forged cutoff10 is supplied to the recipe. The
new revision must still prove identical physical arrays and river/elevation
intents before attributing any native difference to classification.

V11's owning check/test graph passed (161 tests, 20,840 assertions), including
the unchanged official-preset refusal and truthful custom-selection admission.
The diagnostic build and deployment agree for script, modinfo, database XML
and proof manifest; `v11-install-identity.json` retains all four digests. Script
SHA256: `f1886458ff09db182c6f626c7436b5c1a0c18a16c5f7f2c728acc4accec83c6a`.
The native outcome is recorded separately below.

## V11 Outcome

The native Huge1018 run passed. Independent replay of the raw log verifies all
17 paired maintenance calls, 693 ordered intents (656 dry plus 37 wet), all 6,996
intended heights and the complete post-setter native array against V9. Only
the expected captured cutoff and truthful selection kind change in setup.
Area recalculation #2 makes bodies 63/67/69 native lakes; subsequent finalization
and validation preserve their post-setter heights 110/230/530. Controls 42/56
remain 260/460.

A coherent whole-map read finds exactly 48 lake-classification and 48 elevation
changes, all belonging to those three bodies. The other 6,948 plots, including
all 4,276 original-marine cells, hold their primary fields. Terrain, river fields,
water, biomes, features, resources, rainfall, fertility and area/region/landmass
IDs have zero collateral changes. These claims are retained separately from
the successful live verifier in `v11-independent-comparison.json`.

Six fresh captures show the repaired large-body shorelines plus unchanged
small-lake controls and the maximum-zoom neighborhood. Most decisively, body69's
artificial cliff ring disappears and its NAV outlet meets the water surface.
No physical terrain grading was performed. This is visual continuity, not
naval traversal. The phone viewer's `#lake-classification` section retains the
matched before/after images and capture receipts.

### Physical Surface Cross-Check

The user's follow-up distinguishes a retained native level from a faithful
physical water surface. The writer supplies submerged ground, not the physical
`waterSurface` array: `128 + round(max(0, ground - seaLevel) * 10)`.
That source fact alone does not prove wrong leveling. A complete body census
now verifies that all 55 bodies / 203 wet cells in V11 are flat and exactly
equal `round((physical spillElevation - seaLevel) * 10)`, without the land
floor of 128. Model sea level is 11. Every minimum physical shoreline and outlet
receiver ground equals the corresponding spill elevation. V11 preserves all
post-setter wet heights; V9 subsequently changes 48.

| Body | Wet cells | Physical ground range | Physical surface | V11 water | Dry outlet receiver |
| --- | ---: | --- | ---: | ---: | ---: |
| 42 | 5 | 31-36 | 37 | 260 | 388 |
| 56 | 1 | 56 | 57 | 460 | 588 |
| 63 | 17 | 15-21 | 22 | 110 | 238 |
| 67 | 16 | 30-33 | 34 | 230 | 358 |
| 69 | 15 | 58-63 | 64 | 530 | 658 |

Thus cutoff 20 did not merely preserve unexplained heights: the native water
numbers agree with the physical spill surfaces under the observed encoding.
The land/water readback offset 128 is not by itself a geometric waterfall.
This is numerical equivalence, not proof that `getElevation` equals rendered
world Z or that closed/below-sea-level lakes behave identically. Initial V9
and V11 full native arrays are identical; the cutoff changes later preservation.
The original marine intent is 0; 4,275 cells remain 0, while one preexisting
native-lake cell at plot 976 remains 10. It is not an ocean reclassification.

Retained evidence is `earth-calibration/lake-surface-projection-census.{mjs,json}`
under the VisualAtlas root, including source/receipt hashes and all 55 records.
Root replay passes its assertions. The existing elevation-contract fixture's
wet-input versus shoreline-height controls can qualify causal leveling: vary
wet inputs at fixed shore, then shore height and a low outlet. Do not invent
a compensating height constant or replace the native setter before those
controls demonstrate a real mismatch.

## Generalization Discriminator

The shipped Earth Huge database has 34 isolated all-COAST components, none larger
than 10 cells, and one 3,767-cell OCEAN-containing marine component. Its plot
schema has no separate lake override. The read-only census with database hash
and method lives in `native-shipped-lake-census.json`; it is not native binary
behavior proof. Shipped JavaScript separates isolated COAST from water reaching
OCEAN, but that does not establish the engine classifier's rule.

V12 therefore changes only the diagnostic cutoff to the Huge cell count 6996.
This tests whether OCEAN terrain independently preserves marine identity when
size no longer excludes it. A changed marine lake flag is a valid negative
experimental result, not a reason to reject or alter the map. This is not a
production recommendation. V9 and V11 remain independently selectable. If the
marine guard fails, reject this policy rather than hiding it with a chosen
constant, clipping physical lakes or adding a seed-failure gate.

V12 passed independent review and the owning check/test graph (167 tests,
21,197 assertions). Built and deployed script, modinfo, XML and proof match;
`v12-install-identity.json` retains all four digests.

## V12 Outcome And Restoration

The treatment activated and generation completed, but the marine HOLD failed:
all 4,276 original-marine cells now report native lake, including all 3,383
OCEAN tiles. Exactly 4,275 newly classified cells rise from native height 0 to 10;
the remaining marine cell was already a lake. Marine cells also account for
319 feature removals and 25 resource changes. Nonmarine primary fields and
area partition membership hold, although numeric area IDs also renumber there.
This is a valid negative result, not failed experiment admission.

Independent replay selected only V12's proof and fresh log window, excluding
older V11 records. All 17 paired calls, 693 intents, intended heights and the
complete post-setter native array match V11. The inland controls retain their
heights. The trace does not isolate the exact call that changes marine heights.
Retained proof: `v12-independent-comparison.json`, `v12-scripting.log`,
`v12-native-surface.json` and `v12-live.log`.

The normal Huge Earthlike map was subsequently restored through its owning
live verifier. With the diagnostic mod still installed but its map criterion
not selected, actual native Huge cutoff is 10. `v12-normal-restore-live.log`,
`v12-normal-map-info.json` and `v12-normal-scripting.log` retain this successful
nonmatching-map guard. The rejected unlimited cutoff is not production policy.
