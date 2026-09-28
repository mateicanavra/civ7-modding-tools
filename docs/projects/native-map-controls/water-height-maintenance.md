# Inland Water Height Maintenance

The wet-outlet authoring correction is accepted, but not a general cliff cure.
The user's minor-waterfall versus NAV-channel distinction remains a useful
ablation. First resolve a more direct measured confound: accepted non-lake COAST
water loses height during native maintenance although the physical spill and
receiver are level. Do not grade physical terrain to compensate for that loss.

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
  non-lake and whose height drifts. Ten-cell controls remain native lakes.

No separate JavaScript waterfall construction or navigable-cliff connector was
found in those shipped paths. Native rendering internals are not visible here.
The size/classification agreement is a strong discriminator, not yet a causal
cutoff experiment or a navigation result.

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

Expected movement: precisely the 48 cells become native lakes, repeated height
loss stops, and the large-body outlet cliff defect improves visually. Hold
physical fields, all dry heights/terrain/river classes, original ocean, and the
existing lake controls. Record rather than silently accept any collateral
change. Finally load the nonmatching normal map and verify cutoff10 remains.

This tests a classification cause; cutoff20 is not a proposed universal lake
policy. If successful, derive a map-scoped realization policy from physical
lake semantics and the native classification boundary before productionizing.
If it fails with correctly activated metadata, test maintenance ordering next.

## Next Complete Test

1. Inspect shipped 1.5 map scripts for finalization, elevation, validation and
   cliff ordering, and any visible minor/NAV cliff treatment. Native internals
   absent from shipped source remain unknown.
2. Add an observation-only whole-map replay in the existing app-owned river
   diagnostic builder. Record both sides of elevation, finalization, every
   terrain-validation call, cliffs, areas and water cache. Include body69's
   outlet/receiver, native-lake control56, and other non-lake bodies63/67.
3. Retain the exact canonical map configuration, 656 dry plus 37 wet writes,
   elevation input and finalizer tuple. No extra terrain or river calls, no
   maintenance suppression, no retry and no changed recipe assertions.
4. Resolve native lake classification first using the ablation above, rather
   than adding compensating elevation offsets. Only then compare MINOR versus NAV,
   cliffs and a locally graded outlet as independent experimental arms if a
   discontinuity remains. A real impassable drop may warrant non-navigable
   classification; an engine-created height loss does not warrant carving.

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
This is installation evidence only until the corrected native run completes.
