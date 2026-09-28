# Elevation Lane

## Outcome And Boundary

The heightfield used by the physics pipeline should determine Civ7's realized
elevation through an explicit, tested conversion. Morphology truth remains
immutable and engine-neutral; native readback cannot redefine it.

Existing locus: `stages/morphology/elevation/steps/build-elevation` in the
Swooper definition. Native writer: the realization app's map-script adapter.
Portable contract/mock: `packages/civ7-adapter`. Core only admits the new exact
step capabilities; it gains no Civ7 conversion policy.

The user authorized elevation-first completion on 2026-09-27. River writing
remains a separate subsequent slice; the existing river pass is a downstream
preservation guard, not part of this implementation's new behavior.

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
| Authored elevation | Exact admitted numeric readback immediately after writing |
| Final elevation | Zero unexplained numeric drift after the complete recipe |
| Terrain, water, lakes | Setter does not silently reclassify the authored surface |
| Native cliffs | Controlled native observations and an actual generated-map inspection |
| Natural wonders | Physical suitability stays physical; native constraints and feature parameters use native units |

Code inspection confirms that physical elevation originates as normalized
relief multiplied by 100 and rounded into Int16 storage. It is not a verified
native unit or meter scale. Existing native Int16 readback also truncates
fractions; qualification and numeric parity must use an exact numeric snapshot.
Natural-wonder planning currently mixes physical numbers with native minimum
elevation and feature parameters. Correct that boundary in this same slice,
retaining physical elevation for physical suitability and using current native
evidence for native constraints and dispatch, as the shipped wonder generator
does. This is not permission to redesign placement or retune its targets.

## Discovery Gate

The official Earth example shows a full number array, but does not define units
or all accepted values. Before choosing conversion coefficients:

1. Use a non-square asymmetric fixture to discriminate row/column order and
   north/south orientation. Read all input plots immediately after setting.
2. Probe zero, negative, fractional, and bounded positive inputs separately;
   retain native refusal/coercion rather than normalizing it away in the mock.
3. Compare water, coast, lake, flat land, hill, mountain and volcano tiles.
4. Generate cliffs across a controlled boundary; inspect repeat behavior.
5. Observe again after river finalization, terrain validation, cache refresh and
   final placement. A successful immediate readback is not final preservation.

Do not call the numeric scale meters without supporting documentation or a
separately justified physical-to-native conversion contract. Do not assume
ArrayBuffer views have the same binding semantics as the demonstrated JS array.

## Target Design

Keep existing stage order, after accepted lake projection and before rivers.
The projection owns a named transformation from final topography/sea datum and
accepted engine surface to native elevation intent. Its invariants include
finite values, exact map cardinality, deterministic conversion, intentional
water/lake handling, and preservation of physical ordering where supported.
The qualified product conversion is `128 + round(max(0, elevation - seaLevel) * 10)`
for physical land and accepted-lake inputs; marine water is zero. The floor is
observed native behavior; scale 10 is an explicit Swooper display calibration,
not meters or a claimed engine unit. It is fixed across seeds and identities,
with no per-map normalization or terrain-category bands. Invalid or overflowing
intent refuses instead of silently clipping or wrapping.

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

Accepted lakes remain native-leveled. Submit their physical projected heights,
report every lake adjustment separately from non-lake mismatch, and compare
post-write and final native arrays outside the generator. Do not reproduce a
guessed native lake-leveling algorithm or feed readback into physical truth.

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

## Deletion Receipt

Retire the adopted path's procedural buildElevation call and directly displaced
generation-only policy. Reassess each post-elevation coast/terrain repair using
the late-readback experiment before removing it. Do not remove Morphology ridge,
foothill, erosion or rough-land physics merely because elevation is writable.
