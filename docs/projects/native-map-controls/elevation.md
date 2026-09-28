# Elevation Lane

Status: historical elevation-first acceptance passes for its tested native
setup, with every late height change attributed. The current basin/authored-river
integration extends accepted inland-water qualification; see
[the integration boundary](basin-integration.md#native-water-category-boundary).

## Outcome And Boundary

The heightfield used by the physics pipeline should determine Civ7's realized
elevation through an explicit, tested conversion. Morphology truth remains
immutable and engine-neutral; native readback cannot redefine it.

Existing locus: `stages/morphology/elevation/steps/build-elevation` in the
Swooper definition. Native writer: the realization app's map-script adapter.
Portable contract/mock: `packages/civ7-adapter`. Core only admits the new exact
step capabilities; it gains no Civ7 conversion policy.

The user authorized elevation-first completion on 2026-09-27. The initial
expectations and receipts below concern that slice, when the procedural river
pass was a downstream preservation guard. Removing its obsolete automatic
river-naming call was a current-source compatibility repair, not new river
authorship. Later production integration is recorded in the linked packet.

## Elevation-First Expectations

Before behavior changes, the full existing Standard study bank passes at
`6d8c463db3`: 27 studies, 91 unique scenarios. The bank includes all shipped
identities, arid climate, geography, ecology, river-network, floodplain, relief,
Huge relief, and placement guards. Evaluation took 94.6 seconds on this host.
The generated local report is
`/tmp/civ7-elevation-study-baseline-6d8c463db3.json`.
Separate SHA-256 hashes of every captured model field were recorded for 12
unique scenarios: all eight shipped Huge identities at seed 1018 and Earthlike
Huge seeds 1, 42, 99, and 7777. The generated comparison input is
`/tmp/civ7-elevation-model-baseline-6d8c463db3.json`.
These are deterministic baseline receipts, not native-engine evidence.

| Surface | Required outcome |
| --- | --- |
| Physical model fields | Exact baseline hashes on those 12 scenarios |
| Existing study targets | All 27 studies remain passing without changing bounds |
| Authored elevation | Exact immediate numeric readback outside evidenced native lake adjustments; every mismatch remains visible |
| Final elevation | Zero unexplained numeric drift after the complete recipe |
| Terrain, water, lakes | Setter does not silently reclassify the authored surface |
| Native cliffs | Controlled native observations and an actual generated-map inspection |
| Natural wonders | Physical suitability stays physical; native constraints and feature parameters use native units |

Code inspection confirms that physical elevation originates as normalized
relief multiplied by 100 and rounded into Int16 storage. It is not a verified
native unit or meter scale. Existing native Int16 readback also truncates
fractions; qualification and numeric parity must use an exact numeric snapshot.
The original natural-wonder boundary mixed physical numbers with native minimum
elevation and feature parameters. The implemented separation retains physical
elevation for suitability, uses exact current native evidence for elevation
constraints, and reads fresh native height for feature dispatch, as the shipped
wonder generator does. V3 planner-input evidence records both numeric surfaces
and observation provenance. Placement policy and study targets are not retuned.

## Discovery Gate

The official Earth example shows a full number array, but does not define units
or all accepted values. Before choosing conversion coefficients:

1. Use a non-square asymmetric fixture to discriminate row/column order and
   north/south orientation. Read all input plots immediately after setting.
2. Probe zero, negative, fractional, and bounded positive inputs separately;
   retain native refusal/coercion rather than normalizing it away in the mock.
3. Compare water, coast, lake, flat land, hill, mountain and volcano tiles.
4. Generate cliffs across a controlled boundary; inspect repeat behavior.
5. Observe again after the existing procedural river call, terrain validation,
   cache refresh and final placement. A successful immediate readback is not
   final preservation; explicit river finalization belongs to the later lane.

Do not call the numeric scale meters without supporting documentation or a
separately justified physical-to-native conversion contract. Do not assume
ArrayBuffer views have the same binding semantics as the demonstrated JS array.

## Target Design

Keep existing stage order, after accepted lake projection and before rivers.
The projection owns a named transformation from final topography/sea datum and
accepted engine surface to native elevation intent. Its invariants include
finite values, exact map cardinality, deterministic conversion, intentional
water/lake handling, and preservation of physical ordering where supported.
The implemented product conversion is `128 + round(max(0, elevation - seaLevel) * 10)`
for physical land and accepted-lake inputs; marine water is zero. The floor is
observed native behavior; scale 10 is an explicit Swooper display calibration,
not meters or a claimed engine unit. It is fixed across seeds and identities,
with no per-map normalization or terrain-category bands. Invalid or overflowing
intent refuses instead of silently clipping or wrapping.
The completed Huge production run qualifies immediate numeric admission and
accounts for every final numeric change on its full map. Neither that run nor
the diagnostic establishes every lake, coast or natural-wonder case.

At Huge/1018, Earthlike's above-sea relief median/p95/max is 22/63/81,
projecting to 348/758/938. Across all eight identities the largest above-sea
value is 158 (1708 projected). For context, the shipped Earth example's nonzero
median/p95/max is 350/1100/1550 and this probe's stock generator reached 2526.
These comparisons calibrate presentation; they do not prove native bounds.

The adapter dispatches admitted intent and returns/reads exact native evidence;
it does not select relief or alter the physical artifact. The mock records
writes and models only known semantics. Unsupported behavior stays observable.
Separate physics height, projected native intent, immediate observation, and
final observation in metrics and visualization.

Accepted inland water remains native-leveled. Submit physical projected ground
heights and keep that authored footprint distinct from native lake classification
and physical spill height. Measurements partition every numeric mismatch into
accepted native-lake adjustments, accepted inland-COAST adjustments, unplanned
native-lake mismatches, and other mismatches; raw errors remain intact.
An accepted adjustment requires original physical land plus stable local native
water, COAST terrain and category before/after the write. The separate unplanned
lake exception requires original physical water, native water and lake before
and after the immediate write maintenance, and unchanged terrain. Legacy cliffs
occur before this admission read; certified late-cliff qualification occurs
after river finalization and does not redefine immediate numeric admission.
Ordinary land and ocean
mismatches still refuse. Final classification describes current evidence only,
not preservation. Uniform water levels are observations, not an inferred native
formula or a newly enforced flat-body constraint.
Compare post-write and final native arrays outside the generator. Do not
reproduce native lake leveling or feed readback into physical truth.

## Native Qualification

On 2026-09-27, Civ7 1.5.0 (1306154), the ordinary diagnostic mod completed a
Tiny 60x38 game with map seed 1018, game seed 1019, and four players. The public
live verifier confirmed the selected script, runtime dimensions, turn 1 and a
fresh digest-valid completion log. Script SHA-256:
`78d5f6b53e039625042d2110656599efe15b9263071ac38f448cd37c46a02975`.

| Probe | Native observation |
| --- | --- |
| Asymmetric indexing | All 2280 indices match `x + y * width` |
| Positive land | Authored integers >=128 retained at every tested non-water plot |
| Low land | 0, 1, 25, 100 become 128, including hills/mountains/volcano sample |
| Signed/fractional | -1 becomes 65535 on land; 350.5 becomes 350 |
| Marine water | Ocean/coast samples remain zero even for nonzero inputs |
| Enclosed lake | Four input-zero tiles become a common native level 358 |
| Terrain | Setter leaves categorical terrain unchanged |
| Cliffs | High coastal boundary gains cliffs; second call preserves sampled edges and all heights |
| Downstream | Every height survives modelRivers, floodplains, validation, areas, water cache, fertility and starts unchanged |

The procedural river pass changed 85 terrain tiles but zero height values.
This is why existing categorical river/coast handling is not removed here.
The probe does not prove that regenerating cliffs clears stale edges, so the
production path generates them once after its authored elevation write.

Local receipts: `/tmp/civ7-elevation-probe-install.json`,
`/tmp/civ7-elevation-probe-observations.json`, and
`/tmp/civ7-elevation-probe-live-after-restart.log`.
The first launch failed before map execution while the new mod was not yet
registered. After application restart, read-only registration/row checks passed
and one deliberate launch completed. It was not blindly retried.

### Production Qualification

The first Earthlike/Huge attempt using the user's `ToT_NoModsExceptMaps` saved
setup and map/game seeds 1018 reached the production elevation step at
`2026-09-28T02:34:37Z`. Strict numeric admission then stopped generation:
49 differences across 6,996 plots, with 48 accepted-lake adjustments and one
remaining plot 976, `(22,9)`, requested as 0 and observed as 10. There is no
terminal production observation or completed-map proof from this attempt.

Plot 976 is a singleton enclosed water component in authored topology, with six
unchanged land neighbors at elevations 138..198. The accepted mask contains
only requested lake tiles stamped as water, not the full native lake mask.
An instrumented run then proved plot 976 was already native water and lake
before the setter and remained both afterward, with terrain ID 3 unchanged.
Its input 0 became 10 in the setter. All 49 changed plots retained their water,
lake and terrain classifications, and all numeric changes occurred in the
setter, not cliffs. Receipt: `/tmp/civ7-elevation-earthlike-huge-surfaces.json`.
The narrow guard above corrects the mistaken assumption that accepted authored
lakes exhaust native lakes. It adds no lake placement or leveling algorithm.
Temporary after-setter isolation reads/logs are removed; production retains one
exact post-cliffs snapshot and bounded full-array evidence.

The fresh normal production build then completed the full game at
`2026-09-28T02:56:43.351Z`, Earthlike/Huge, 106 x 66 (6,996 plots), map/game seeds
1018. Deployed script SHA-256:
`5931b0304ed8abc28e07576386e59b1e6fd65d39f47806a4368a4022a4925bf5`.
The public saved-setup result reports 12 players; the recipe's captured alive
major-player IDs are 0-9. These are distinct observations, not a verified
12-player runtime roster. No replacement roster was synthesized.

The immediate numeric record has 49 changes: 48 accepted lakes, one qualified
preexisting native lake, and zero other mismatches. Native intent and observed
range are both 0..938. Terminal observation differs from the immediate array at
eight plots: seven accepted-lake cells and one Redwood-footprint cell. Final
intent comparison therefore contains 50 mismatches, including one non-lake
mismatch. Those raw counts remain visible rather than being normalized away.

A successful instrumented replay of the same saved Huge/1018 setup attributes
all eight late height changes to exact native calls:

| Native call | Observed height changes |
| --- | --- |
| `modelRivers(5, 15, 5)` | Lake plots 4028, 4133, 4134, 4239 and 4240: 150 -> 240; plots 4436 and 4542: 20 -> 100 |
| `setFeatureType(102, 27, {Feature: 30, Direction: 0, Elevation: 638})` | Redwood plot 2964: 638 -> 598; footprint neighbors 2965 and 3071 were already 598 and remain so |

The seven lake cells retain native water/lake classifications, terrain 3 and
feature -1. Redwood assigns feature 30 to all three footprint cells without
changing their terrain or water/lake classification. No other selected surface
changes occur in that attribution record. The normal run's complete arrays
contain only these eight late numeric changes: the tested map has zero
unexplained late drift, not globally unchanged numeric elevation. The native
river/lake and multi-cell feature transformations are not new Swooper leveling
algorithms or numeric tolerances. Attribution receipts:
`/tmp/civ7-elevation-attribution-live.log` and
`/tmp/civ7-elevation-attribution-calls.json`.

The attribution replay completed at `2026-09-28T03:05:39.566Z`, diagnostic script
SHA-256 `ee45c290e223ddb5168b5f4a170db9d25ebe5a0e8570f1a3ed6ab77cc780d14a`.
`/tmp/civ7-elevation-attribution-comparison.json` confirms byte-equivalent JSON
for the normal and instrumented post-write and final full payloads, including
all 6,996 heights in each phase. Temporary attribution code was removed and the
adapter restored exactly to its pre-probe source SHA-256
`95812494b0dede56d404b33734829248aa54b55619e087bafe2287ab47a7a07c`;
all 44 adapter tests and the app test typecheck pass after restoration. No
production lake or wonder behavior was changed to obtain this attribution.

The source is committed as `fd4802c616` on
`agent-root-civ7-authored-elevation`. A final clean production reload with the
same saved setup, Huge Earthlike, seeds 1018/1018 and 106 x 66 dimensions passes
at turn 1, completing at `2026-09-28T03:08:26.387Z`. It uses the normal deployed
script SHA-256 `5931b0304ed8abc28e07576386e59b1e6fd65d39f47806a4368a4022a4925bf5`,
not the diagnostic build. Receipt: `/tmp/civ7-elevation-final-clean-live.log`.
Official bounded-log decoding of fresh 23:08 scripting-log lines produces
`/tmp/civ7-elevation-final-clean-observations.json`: both full post-write and
final payloads again match the earlier normal production run exactly, including
all 6,996 heights per phase. The source log is retained at
`/tmp/civ7-elevation-final-clean-scripting.log`.

Receipts: `/tmp/civ7-elevation-complete-live.log` and digest-checked bounded arrays
in `/tmp/civ7-elevation-complete-observations.json`. On the earlier normal run,
the explore request timed out, but the user confirmed completion and the native
screenshot shows the fully revealed map with cliffs. This is visual verification,
not a performance project or a replacement for numeric attribution. Explore on
the final clean reload then completes with a longer request timeout: all 6,996
plots are revealed and visible, the grant remains active, and the receipt
reports quiescence plus verified notification suspension/resumption. Receipt:
`/tmp/civ7-elevation-final-clean-explore.json`. A fresh native screenshot confirms
the revealed minimap and rendered terrain. No Explore implementation changed.

The earlier launcher rejection was separate and pre-dispatch: the public
saved-config identity rejects an extra filesystem `path`. The bounded verifier
fix projects only id/displayName/fileName, retaining the path in diagnostics and
omitting player count unless explicitly overridden. Existing saved-setup
loading and mod reconciliation remain under the public lifecycle owner.

## Tests And Acceptance

- Contract/cardinality and asymmetric-indexing fixtures.
- Native dispatch order and no later stock `buildElevation` overwrite.
- Existing no-water-drift test extended with numeric preservation evidence.
- Exact or explicitly justified quantized intent/readback agreement, including
  after the downstream recipe. Tolerance cannot be invented to hide drift.
- Relief, geography, lake/coast, ecology and placement study HOLD guards.
- An exact deployed build observed in-game; no claim from mock parity alone.

Existing `finalLandElevation` measures physical model elevation. Keep its
meaning; add separate engine-observation measurements instead of relabeling it.
The final unchanged bank passes 27 studies / 91 scenarios / 6,197 expectations,
with zero changed observed values versus baseline and unchanged study/scenario/
target definitions. Physical-model hashes remain identical on all 12 Huge
comparison cases. The unified six-owner check/test graph passes 70 tasks,
including 598 definition and 403 Studio tests. Receipts:
`/tmp/civ7-elevation-study-final.comparison.json` and
`/tmp/civ7-elevation-closure-check.log`. Native acceptance additionally depends
on the exact full-map and call-attribution evidence above; mock agreement alone
does not supply it.

## Deletion Receipt

The adopted path's procedural `buildElevation` call and portable capability have
been removed and replaced by the qualified explicit setter/cliff path. The
obsolete `defineNamedRivers` call is also removed from recipe, adapter and Core
capability surfaces: installed 1.5 procedural scripts use `modelRivers` and
validation without that call. Earth's coordinate-specific custom names are
separate and are not adopted here.
Reassess each post-elevation coast/terrain repair using
the late-readback experiment before removing it. Do not remove Morphology ridge,
foothill, erosion or rough-land physics merely because elevation is writable.
