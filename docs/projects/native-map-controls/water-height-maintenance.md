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

An earlier late-cliffs diagnostic recorded body69 at 530 after elevation,
402 after river finalization, and 274 after terrain validation. The later final
18 could be two further 128-unit decrements, but that attribution is not yet
observed. Treat 128 as an observation, never an invented correction constant.

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
4. If repeated maintenance is causal, first test a stock-compatible call order
   that keeps authored heights durable. Only then compare MINOR versus NAV,
   cliffs and a locally graded outlet as independent experimental arms if a
   discontinuity remains. A real impassable drop may warrant non-navigable
   classification; an engine-created height loss does not warrant carving.

Numerical evolution stays with C3. The probe must not introduce a second river
solver or move calculations into steps. Independent review, focused tests and
the owning app graph precede native use. The stock Exploration Cog movement
control remains separate and uses the ordinary Advanced Start grant, not a
debug-created Galley.
