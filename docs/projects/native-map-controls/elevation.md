# Elevation Lane

## Outcome And Boundary

The heightfield used by the physics pipeline should determine Civ7's realized
elevation through an explicit, tested conversion. Morphology truth remains
immutable and engine-neutral; native readback cannot redefine it.

Existing locus: `stages/morphology/elevation/steps/build-elevation` in the
Swooper definition. Native writer: the realization app's map-script adapter.
Portable contract/mock: `packages/civ7-adapter`. Core only admits the new exact
step capabilities; it gains no Civ7 conversion policy.

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
The coefficient/range design is deliberately unlocked until the probe gate.

The adapter dispatches admitted intent and returns/reads exact native evidence;
it does not select relief or alter the physical artifact. The mock records
writes and models only known semantics. Unsupported behavior stays observable.
Separate physics height, projected native intent, immediate observation, and
final observation in metrics and visualization.

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
