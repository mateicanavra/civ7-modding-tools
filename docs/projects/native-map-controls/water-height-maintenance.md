# Inland Water Height Maintenance

The wet-outlet authoring correction is accepted. V11 establishes that native
lake classification prevents the measured inland-water height loss and repairs
the visible cliff-ring defect without physical grading. V12 rejects removing
the size limit globally: it also reclassifies the ocean. A general production
height-lifecycle repair and actual naval traversal remain unqualified.

## Current Discriminator

All values below are native units, not model metres. The production whole-map
read and the original atlas agree; the issue predates the wet-outlet repair.

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

This tests a classification cause; cutoff20 is not a proposed universal lake
policy. V11 passes its causal and visual comparisons. V12 rejects removing the
size boundary globally; maintenance ordering is the next production candidate.

## Next Production Candidate

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

The next complete change must qualify that conversion, retain protected
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
