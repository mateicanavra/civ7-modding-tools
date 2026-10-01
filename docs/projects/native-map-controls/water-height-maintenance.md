# Inland Water Height Maintenance

The wet-outlet authoring correction is accepted. Native classification and
water-height retention are separate projection concerns. V11 qualifies bounded
classification on the measured cohort; V12 rejects an unlimited cutoff, and the
Ring counterexample prevents selecting one arbitrary global cap. V20 now
qualifies restoring original wet elevation requests while retaining exact
current native dry heights, including later wonder edits. The preparation-owner
repair now passes its authentic area/cache transaction on fresh Huge Earthlike
evidence. Classification policy, universal feature protection, cliff
reconstruction and actual naval traversal remain separately unqualified.

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

### Stock-Tiny Replay Result

Both arms now complete in Civ7 with stock cutoff6, all eleven checkpoints,
30 river writes, six-file installed/build identity and stable 2,280-cell final
observations. Every logged field agrees before the replay slot. Exactly thirty
final elevation values differ: isolated bodies9/10/11 lose572 -> 444 -> 316 in
the control, while replay restores572 and retains it through area/cache,
fertility and starts. Water and native nonlake identity are unchanged.

All fourteen other final native facts hold on every cell. The 444 original
marine cells remain zero; fourteen NAV cells on authored dry land retain their
graded160-450 requests; 1,719 other dry cells hold. Existing lake controls,
ordinary-COAST straits, NAV/MINOR outlets, connectivity observations and native
river objects also hold. This qualifies this synthetic original-input replay,
not universal setter idempotence, feature preservation or naval movement.

The initial reader refusal is retained: both archived bundles include stale,
unreferenced `config/lake-cutoff.xml`. Existence is not activation; the revised
reader pins that file and requires absent manifest references/actions/criteria
and actual stock6 metadata. Separately, the builder now declares `config/*.xml`
as an exclusive set using the existing public file-plan helper. A transition
test materializes cutoff then stock plans and proves stale XML removal and
repeat currentness. The immutable native archives are not cleaned retroactively.

The independently audited comparison rejoined469,680 values from the raw logs
and final capture. Evidence under `earth-calibration/bounded-lake-cutoff-20260930/`:
`water-stock6-original-replay-20261001-analysis-v2.json` SHA256
`12179ed6fb8180f7bce19f8ca061c14372b2d64dde6bfa57c92accb31e7438d0`;
audit SHA256
`41793fbd211084afd75dece11b31fdad561c2a4c76f23970487b38825a1b6b01`.

Next qualify a generated-map preservation pair after authentic recipe success,
including actual wonder-modified terrain and NAV grades. These synthetic NAV
cells already matched original requests, so their unchanged values cannot
prove preservation of legitimate later edits. Cliff flags may also precede
the final height loss: restoring a number is not yet a visual cliff repair.
Keep a further cliff-generation treatment and era-qualified movement separate.

The V18/V19 discriminator belongs in the existing realization fixture, not the
ordinary physical recipe. Its wrapper executes the authentic recipe once and
only then invokes equal before/after observation slots. V18 observes without
writing; V19 adds one bulk setter using a fresh copy of the protected actual
first-setter Number array, captured before that authentic call. No readback
becomes input and no validation, cliffs, area/cache refresh or retry is added.
Retain complete original, before and after elevation arrays; feature, terrain,
river, water and lake rows; the existing call sequence; and final tooling
readback. Resolve native protected feature footprints from the current run,
not remembered coordinates. A cohort without an actual later native edit
cannot establish its preservation.

This is intentionally a post-recipe preservation discriminator, not the final
`prepare-placement-surface` internal repair slot. The current SDK exposes
observation through trace/facets, not an execution hook at that slot. Do not
steer writes through observers, clone the recipe, count validators as a proxy
for step identity, or add a generic SDK hook merely for this experiment.
The experiment can reject unsafe whole-map replay before a production repair
is selected. It does not itself repair cliffs or prove navigation.

### V18/V19 Generated-Map Preservation Result

The Earthlike Huge1018 pair uses stock cutoff 10, ten players and 6,996 cells.
V18's selected evidence is a successful repeat from its exact archived
five-file bundle, with that repeat's own installation, live and scripting
records. V19 retains its original successful run and a later complete public
controller capture of that game. Both complete captures exactly match their
respective original captures across all fifteen per-cell facts and feature
bindings. Original archives and the failed V18 process attempt remain intact;
the latter is excluded from successful generation evidence. This is a measured
same-input repeat, not a shared-epoch claim: client-local connection epochs do
not establish cross-process identity.

All 560 reader admission guards pass, including original and repeated actual
installation inventories and complete 191-object river captures. The six-field
pre-replay grids match; control changes nothing. Replay changes exactly fifty
elevations, with no change to the other five immediate fields or fourteen
other final native facts. Both arms' 191 river objects and 659 plot entries
match exactly.

| Observed footprint | Cells | Native height before replay | After replay |
| --- | ---: | ---: | ---: |
| Physical body 1643, pool 39 | 16 | 0 | 230 |
| Physical body 3384, pool 57 | 15 | 18 | 530 |
| Physical body 3899, pool 3 | 17 | 0 | 110 |
| `FEATURE_KILIMANJARO`, cell 2945 `(83,27)` | 1 | 788 | 688 |
| `FEATURE_KILIMANJARO`, cell 3052 `(84,28)` | 1 | 788 | 778 |

The 48 water cells regain their first-write native heights, not their original
request values, and all remain `lake=false`: classification is not repaired.
The other 155 accepted physical-lake cells retain their native lake identity.
At Kilimanjaro, replay removes two later native height edits while retaining
feature ID 35; the third footprint cell 2946 remains 788. All 4,276 wet cells
outside accepted physical lakes and all 310 dry native NAV cells hold their
captured facts. Those NAV heights already matched their original requests,
so this does not test preservation of a later NAV height mismatch.

The frozen reader has a classification limitation: none of the 48 raw
`GameInfo.Features` rows contains the `NaturalWonder` property it tests. Its
zero natural-wonder group is therefore not absence or preservation proof.
The exact Kilimanjaro ID binding and height changes remain valid. Redwood has
no actual footprint in this run, leaving its historical protection trigger
unqualified.

This rejects blind whole-array post-recipe replay as a preservation-safe
repair. It does not select a production solution or qualify the separate
internal `prepare-placement-surface` slot. Any proposal there still needs a
designed and tested conversion from authoritative wet intent to correct
projected setter input, preserving legitimate dry feature and NAV edits.
Cliff reconstruction, later maintenance and actual traversal remain separate
proof obligations.

Sealed evidence is under
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/bounded-lake-cutoff-20260930/`.
The reader pins 49 inputs, including the archived source and both capture
generations. Receipt `water-original-post-recipe-huge1018-20261001-analysis-v3.json`
SHA256: `d99c149147c6094b3abb2070ba4b577d55487fa396b5c0fc84820ebdde51100a`.
Reader `analyze-water-original-post-recipe-20261001-v3.mjs`
SHA256: `f28919faa376ae2e433b21a89a0df730b34e689234561f6c333346c24f7505fc`.
Both remain frozen, including the explicitly bounded classification limitation.

### V20 Native Dry-Retention Discriminator

Independent review selects one smaller follow-through in the existing fixture:
retain each current native dry elevation in the added bulk setter request,
while every native-wet input remains the protected original caller request.
Select on native water, never the lake flag. This explicitly tests retention
of native projection edits; no native value becomes physical artifact truth,
and native wet readbacks are never used as setter inputs. No fallback to blind
original replay is admitted if the required complete snapshot is unavailable.

Use fresh V18 control and V20 treatment runs built from the same current
fixture source, Earthlike catalog configuration, official Huge preset,
map/game seeds 1018/1018, ten players and stock cutoff 10. The authentic recipe
still runs exactly once, and the added setter still runs only after success.
V20 adds no cutoff change, validation, cliff generation, area/cache refresh,
new execution hook or physical computation. Preserve the sealed V18/V19
archives separately.

The prediction is exactly 48 water-height recoveries, preserving both later
Kilimanjaro edits, all dry NAV elevations and every other captured native
fact/river object. A different result rejects or narrows this hypothesis;
it is not normalized away. Source tests separately exercise dry feature and
NAV edits, negative/below-floor/fractional inputs, detached arrays, and
unavailable/nonfinite/incomplete/mismatched observations before mutation.
Those tests qualify caller construction, not native setter idempotence.

A passed V20 pair would justify designing this conversion at the actual
surface-preparation owner, whose canonical dependency is after wonder
placement. It would not qualify that internal slot, later maintenance,
protected wet-feature edits, native lake classification or naval traversal.
Keep cliff reconstruction separate: current wonder stamping can depend on
native cliff edges, so moving the sole cliff generation after preparation is
not an innocuous order cleanup.

The app-only implementation is independently reviewed. The two focused suites
pass 125 tests and 41,167 assertions; the full realization suite passes 266
tests and 48,848 assertions. Owning types, policy, boundaries, dead-code and
hygiene checks pass. The existing exact elevation snapshot and raw native
boolean reads are sufficient; no SDK extension or global setting is added.
These results qualify the constructed request and lifecycle, not the pending
native outcome.

### V20 Native Result And Production Follow-Through

The fresh Huge Earthlike V18/V20 pair passes 421 admission guards and all 15
predeclared prediction checks. Both arms use stock cutoff10, independent
map/game seeds1018/1018, ten players and source revision
`8d1501b13b76dfc98bdafffdbae151fa66aadb0d`. Across all 6,996 cells, the logged
native elevation and raw boolean water inputs agree exactly with the independent
before-replay grids; independently reconstructed requests match the emitted
digest. Each installed five-file bundle matches its archived bytes.

Exactly 48 wet cells recover their first-write native heights: physical bodies
1643/3384/3899 retain 230/530/110 across 16/15/17 cells instead of 0/18/0. All
48 remain native nonlake. All 2,517 dry cells hold their heights and other facts,
including the demonstrated Kilimanjaro edits at (83,27) and (84,28): their
current height788 is retained instead of replaying original requests688/778.
The other fourteen final facts have no changes, all 155 accepted native-lake
cells and 4,276 outside-accepted wet controls hold, and the complete 191 native
river objects / 659 plot entries match exactly. No extra maintenance is added.

Evidence is sealed under the documented VisualAtlas root in
`earth-calibration/bounded-lake-cutoff-20260930/`, with fresh
`water-dry-{control,treatment}-huge1018-20261001-*` inputs. Analysis receipt
`water-dry-retention-huge1018-20261001-analysis.json` SHA-256:
`75ee23eec8bd061823364745d04ee30d80dcadd9b91c1a8e226c92d5c72ae3b8`.
Reader SHA-256:
`6dc35312aa10cfaac39755900ffd4725a173234327373c1588e4e5c4d83f0501`.
Source revision labeling and capture chronology remain operator authority;
client-local connection epochs are not shared game identities. One initial
deployment-directory mistake and refused lifecycle attempt are retained
separately and excluded, not substituted into successful-run fields.

This closes dry setter idempotence on the measured cohort, not universal
feature protection: Redwood is absent, later dry NAV mismatches are unexercised,
and no wet-feature height-mismatch trigger is present. Native classification,
cliffs and actual naval movement remain separate. The production candidate
reuses `projectStandardElevation` and the existing accepted-lake artifact,
selects wet-original/dry-current after terrain validation/coast restoration,
then uses the existing area/cache refresh. No physical artifact, recipe order,
SDK surface, cutoff or global setting changes. Available mock snapshots remain
valid for deterministic execution, not native proof; production does not copy
the fixture's native-only admission. Qualify that actual slot and subsequent
maintenance before declaring the water repair shipped.

### Existing Preparation Owner Candidate

The candidate is implemented in `prepare-placement-surface`, after the
manifest's existing natural-wonder completion. It uses the existing projection
helper and `projectedLakes` artifact to create a detached canonical elevation
request before native mutation. After the existing terrain validation and
wrapped coast restoration, it retains exact current native heights on dry
plots and canonical requests on wet plots, then performs the existing area
recalculation and water-cache write. The original elevation write, authored
river finalization, cliff generation and recipe order are unchanged.

Current elevation must be available with the actual map dimensions and cell
count; current water reads must be booleans and every current height finite.
These are necessary input checks for the whole-array setter, not physical
parity instrumentation or Earth-fixture admission. An invalid input refuses
before that write, with no fallback to stale heights or a legacy recipe.
Available mock snapshots remain supported. No new domain operation, artifact,
SDK abstraction, configuration property or cutoff is introduced.

Focused tests exercise canonical wet requests despite lowered readbacks,
exact dry preservation including signed/fractional heights and later feature
edits, immutable physical inputs, coast restoration, mutation order, and
unavailable/malformed native inputs. Generation coverage uses all eight current
catalog configurations and the existing selectable size/seed setup; it now
expects the original write and this maintenance write, with one unchanged
cliff-generation call. The focused run passes 41 tests and 492 assertions.
The fresh 37-task owning graph passes types, Habitat, boundaries, dead-code and
hygiene. The realization suite passes 266 tests / 48,848 assertions; the
definition suite passes 1,068 tests and retains one study-bank aggregate
failure with its same three scientific expectations (within-row thermal
variation, biome-row dominance and pressure zonal RMS). None is weakened or
attributed to this projection-only repair. The initially interrupted graph's
two new-test TypeScript errors were repaired using the existing complete
feature payload and ES2022 array methods, without SDK/configuration changes.
The complete recheck is retained as
`earth-calibration/water-prepare-owner-recheck-20261001.log`.

### Authentic Owner Native Result

The fresh Huge Earthlike candidate completed on 2026-10-01 at 08:27:08 UTC,
with stock cutoff10, map/game seeds1018/1018 and ten players. Its five installed
files matched the archived build before launch. Source revision
`2f137560e9b380b692bcad1ef737669958c8fd05` and all four diagnostic/owner source
pins are retained with the installation receipt. The independent frozen reader
ran once: all 421 admission entries and 17 outcome checks pass, with 46 inputs
byte-pinned and rechecked.

Exactly 48 wet cells recover their first-write native heights: bodies
1643/3384/3899 are 230/530/110 across 16/15/17 cells instead of 0/18/0. All
2,517 dry heights and the other fourteen final facts hold. Kilimanjaro retains
native788 at all three footprint cells, including the two actual edits from
initial688/778. The 310 dry NAV cells, 155 accepted native-lake cells, 4,276
outside-accepted wet cells, eleven wet feature cells and all 191 complete river
objects (659 plot entries / 658 distinct cells) hold. Captured physical lake
membership and levels hold for 55 bodies / 203 accepted cells; this does not
claim comparison of every physical artifact.

The second authentic setter is call16, before the existing recalculateAreas17
and storeWaterData18. Removing it reproduces the control method sequence.
Both terminal observation passes remain no-ops; all six observed facts hold
through final capture. The full second setter input and full immediate
preparation grid are not independently observed: their construction is source
and focused-test evidence, while native evidence covers ordered focus
observations and complete final outcomes.

Adopt this narrow owner repair. All 48 cells remain native nonlake, so neither
classification nor freshwater/navigation semantics is repaired. Absent Redwood
and untriggered dry-NAV/wet-feature height mismatches do not qualify universal
feature protection; cliffs, future maintenance and traversal remain separate.
Evidence prefix: `water-prepare-owner-huge1018-20261001-*` in
`earth-calibration/bounded-lake-cutoff-20260930/`. Analysis receipt SHA-256:
`f5a54a85c6910b04044ffac6debf93de3e46ee571542d064f33d4fbb87d754d9`.
Reader SHA-256:
`8bf4beaf51b5d6d46a85e8eac56e703c439b18e60738f489879bfe6943da48bc`.

### Repaired Recipe Cutoff Qualification

V21 extends only the existing bounded-cutoff fixture's observations. Both arms
protect the first authentic Number-array request and capture equal, no-action
post-recipe grids. They add no setter, maintenance, suppression or replay; the
real recipe retains its two authentic elevation writes. The existing catalog,
official size presets, independent seeds and saved-setup selection drive both
arms. Focused fixtures pass 129 tests / 42,442 assertions; the owning test-type
graph passes. The full realization suite passes 270 tests / 50,123 assertions.
No production computation or configuration property changes.

The fresh Earthlike/Huge1018 pair uses map/game seeds1018/1018, ten players and
`ToT_NoModsExceptMaps`, with actual native cutoffs10/40 separately admitted.
Physical lake declarations remain 55 bodies / 203 wet cells. Cutoff40 changes
exactly the previously nonlake 48 accepted cells to lakes: all 203 then classify
as lakes. Every final native height and thirteen other full-grid facts hold
across all 6,996 cells. Both arms retain the two actual dry/wonder edits at
cells2945/3052 (native788) and all 4,276 baseline native-water cells outside the
accepted set. This protected native-water population is not a new claim about
the entire physical marine mask.

All 191 river objects remain complete, and their `connectedToOcean` flags hold.
Three memberships change, removing four plot entries (659 to 655): lake cells
2177/3898/3697 and dry cell2071. Per-plot river/NAV facts still hold; the complete
native object memberships do not.
Body3384's fifteen water cells change their area-level ocean connectivity from
true to false; the other two newly classified bodies retain true. Native lake
identity, area connectivity and river membership are therefore distinct
observations. On all 203 accepted cells, `isFreshWater` is false in both arms;
that does not test adjacent settlement freshwater. No era-qualified vessel
movement, rendered world-Z equivalence or cliff-continuity claim follows from
this pair.

The finite comparator initially assigned a wrong height outcome: it compared
final water heights to raw first-setter requests. The request is projected
per-cell ground with the native land offset, not the engine's flat water
surface. All 203 cells differ from that request in both arms, while all 203
exactly retain their own first post-setter native heights. The original failed
outcome receipt is preserved; the correction belongs in a separate analysis,
not a weaker production readback check. Current V21 lake observations do not
independently capture the physical sea datum; a historical value of11 is not
silently promoted into current physical-height proof.

Evidence prefix: `earth-calibration/repaired-cutoff-huge1018-*` in the existing
Civ research user-data root. The original comparison receipt is
`repaired-cutoff-huge1018-stock10-vs-cutoff40-20261001-analysis.json`
(`5bcb16d770e9f0a99a3e9a727ad0ced1eb9a246c20a64356419f898590bfa950`).
Its raw MapInfo-row/public-projection and Nx log-prefix parser failures remain
retained as distinct attempts, not native failures. The normal registered
Earthlike mod was restored afterward; after reconciling one interrupted
mod-selection lifecycle transition, its fresh Huge1018/12-player saved-setup
generation passed and fresh public status reported playable.

The separate `-height-supplement.json` receipt
(`d46be5d216f1dbd404b3448896c7b112e9052588d9ba06999d072411db2e062b`)
passes 104 guards and the corrected native-preservation/classification
outcomes. It retains every raw-request mismatch, confirms all 55 bodies are
flat and all 203 accepted cells preserve their own first-post-setter native
height, and keeps the original 377-guard comparison byte-identical. Physical
heads and native levels are retained separately; no sea datum is inferred.

This qualifies forty for the held case, not a global policy or sampled maximum
lake-size bound. The retained Ring case fails at40 and passes at252; its exact
classification boundary remains unproven. Actual lake
footprints are outputs of the basin/supply model. Choose any general native
classification criterion from projected ordinary-water connectivity while
protecting marine bodies; do not retain a competing legacy water path, change
physical basins to fit a native constant, or introduce a host preflight by
implication.

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
