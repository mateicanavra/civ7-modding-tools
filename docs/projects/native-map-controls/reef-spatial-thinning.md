# Reef Spatial Thinning

**Status:** Implemented and independently reviewed; portable study acceptance
passed for this correction. No new native-runtime claim.

## Scope And Objectives

Replace coordinate-origin sampling with habitat-ranked spatial thinning in the
existing `ecology/features/plan-reefs` operation. A suitable isolated bank must
not disappear because its coordinates miss a preselected lattice. Preserve
the confidence floor, family selection, lake-only lotus admission, upstream
occupancy, deterministic output, and local gaps between selected reefs.

This is a definition-owned correction, not a thermal calibration or a new
placement framework. No change to temperature, scoring, feature legality,
metric targets, realization, or Core grid mechanics is proposed.

The [thermal diagnosis](thermal-coherence.md#atoll-regression-is-a-placement-assumption-not-a-thermal-handoff-bug)
identifies Sundered Archipelago Huge/1018 tile 3510 at `(12,33)`: its current
atoll score is approximately `0.7464`, above the unchanged `0.52` floor, but
`(x + 2*y) % 10` rejects it before placement. Switching to today's `habitat`
strategy is not a correction: that strategy uses `tileIndex % stride`.

## Decision

Keep one strategy, `habitat`, and replace its stride gate with explicit
`minSpacingTiles`. Retire `diagonal-stride` and the old `stride` property rather
than preserving two implementations of a disproved placement assumption.

| Alternative | Decision | Reason |
| --- | --- | --- |
| Habitat-ranked greedy spatial thinning | Recommend | Uses actual admitted habitat; every suppression has a nearby, already selected witness. |
| Keep diagonal lanes or switch to tile-index stride | Reject | An isolated eligible bank can still be rejected solely by origin. |
| Add a third strategy or an atoll-only rescue | Reject | Leaves competing policy and a special-case bypass of ordinary family selection. |
| Per-profile counts, percentages, or quotas | Reject | Would manufacture feature presence instead of choosing among eligible habitats. |

## Selection Law

1. Scan the map once. Exclude occupied cells before candidate selection. Reuse
   `selectReefIntentCandidate` and `admitReefIntent` unchanged to choose and
   admit at most one family per cell.
2. Sort admitted candidates with the existing `comparePhysicalCandidates`:
   confidence descending, stress ascending, tile index ascending, then feature
   identity. This preserves the existing within-cell family tie law. Do not
   introduce family priority, seeded noise, or a second confidence threshold.
3. Visit candidates in that order. Accept a candidate unless its cell is
   blocked by an earlier accepted reef-family candidate. On acceptance, block
   the canonical hex ball of radius `minSpacingTiles - 1` around it.
4. Return placements in row-major order, preserving the operation's current
   ordering and the step's publication contract. Do not mutate input arrays.

Use `getHexRadiusIndicesOddQ` from `@swooper/mapgen-core/lib/grid` for the ball;
use `hexDistanceOddQPeriodicX` as the independent test oracle. Despite their
legacy names, these implement Civ7's **odd-row-offset** grid, periodic X and
bounded Y. The radius helper deduplicates narrow-grid aliases. No square-grid
distance, manual parity table, new dependency, or Core helper is needed.

One local blocked `Uint8Array` suffices. Spacing applies across all four
reef-family features, not separately per feature, and only accepted candidates
block cells. An occupied or below-floor candidate cannot suppress a neighbor.
Existing non-reef occupancy continues to exclude its exact cell, not a new
buffer around that cell. Spacing is geometric, including across intervening
land; adding water-component-aware spacing is outside this correction.

The result is a maximal admitted set under this greedy ordering, not a global
maximum-count or maximum-total-score solution. Every rejected eligible
candidate has an accepted candidate strictly closer than the configured
spacing. An eligible candidate with no other eligible candidate inside that
distance is always retained.

## Contract And Configuration Migration

Operation input/output schemas, `seed`, step dependencies, and `reefIntents`
stay unchanged. `seed` remains unused; this correction does not need new
randomness. Remove the other strategy definition, implementation, contract
import, and registry entry. Core infers `habitat` as the sole strategy and
rejects a redundant authored `defaultStrategy`; remove that property without
changing the effective default or modifying Core admission.

Replace `habitat.config.stride` with `minSpacingTiles`, an integer in `[1,12]`,
default `1`. Its meaning is minimum hex-edge distance between accepted
reef-family cells. `1` admits every eligible cell and preserves the current
unconfigured strategy's behavior. Values `2` and `3` leave respectively at
least one and two intervening cells on a shortest path between placements.
Remove `admitReefStride`; retain the other shared admission functions.

Migrate all eight authored `plan-reefs.planReefs` selections together:

| Config basename | Existing strategy / stride | Unchanged floor | New strategy / spacing |
| --- | --- | --- | --- |
| `swooper-earthlike` | habitat / 4 | 0.84 | habitat / 2 |
| `mountains-of-time-earthlike` | habitat / 4 | 0.84 | habitat / 2 |
| `mountains-of-time-original` | habitat / 4 | 0.84 | habitat / 2 |
| `latest-juicy` | habitat / 4 | 0.84 | habitat / 2 |
| `mountain-patch` | habitat / 4 | 0.84 | habitat / 2 |
| `swooper-desert-mountains` | habitat / 3 | 0.62 | habitat / 2 |
| `shattered-ring` | habitat / 2 | 0.58 | habitat / 2 |
| `sundered-archipelago` | diagonal-stride / 10 | 0.52 | habitat / 3 |

These proposed distances express a one-cell local gap normally and a wider
two-cell gap for the explicitly sparse archipelago profile. They are **not**
an algebraic conversion of stride or a claim of equal feature density. Counts
can rise or fall because quality and actual neighbors now decide placement.
The unchanged study bank must judge the resulting density; do not compensate
with profile quotas or quietly lower confidence floors.

Public normalization must reject `stride` under `habitat`, reject the retired
strategy identifier, and reject spacing outside the declared integer bounds.
No compatibility alias or silent conversion. Adjacent descriptions must say
hex spacing rather than diagonal lanes or tile-index sampling.

## Determinism And Translation

Repeated identical inputs produce identical placements, independent of input
array identity. The map's longitude seam is not a gap in spacing.

An isolated eligible bank survives every X translation, including across the
seam, and parity-correct interior hex translations. For multiple candidates
with distinct confidence priorities, translating the complete input without
clipping preserves the translated selected set. Odd-row translation tests
must translate cube/axial coordinates and convert back, not merely add one to
the row while pretending parity is unchanged.

Exact confidence ties deliberately retain the existing tile-index tiebreak.
Full translation equivariance is therefore **not** promised for tied competing
cells, although spacing, maximality, and nonempty isolated-bank retention
still hold. A deterministic unique choice on a fully symmetric periodic
habitat cannot also preserve every translation without additional asymmetric
evidence. Do not hide that limitation behind coordinate hashing or RNG.

Spacing preserves local reef-free gaps, not a guaranteed navigable ocean
network. This operation has neither a passability graph nor complete terrain
identity; it must not claim a proof of global shipping routes.

## Deliverables And Verification

Implementation stays within the existing reef planner, its two strategy
registrations, eight authored configs, and focused tests. No new artifact or
harness is needed. Replace `habitat-and-stride.test.ts` with spatial selection
coverage rather than retaining obsolete pattern snapshots.

| Test surface | Required evidence |
| --- | --- |
| Operation admission | Floors below/at/above threshold; occupied strongest cell cannot block a weaker free neighbor; unchanged lotus lake gate and within-cell family tie. |
| Spatial selection | Lone atoll at every longitude; strongest nearby habitat wins; mixed-family conflicts; dense equal-score and distinct-score banks; distances exactly at and just below the limit. |
| Topology | Wrapped-X competitors; both row parities; bounded top/bottom edges; width 1/2 aliases; every selected pair satisfies canonical hex distance. |
| Completeness | Every eligible rejected cell has an accepted spacing witness; no eligible isolated cell disappears; spacing 1 equals the admitted candidate set. |
| Stability | Repeatability, unchanged inputs, row-major output; qualified translation laws above, with tie limitation explicitly tested. |
| Recipe composition | Existing real-op `plan-reefs/publication.test.ts`, including upstream ice occupancy and lake truth; collision refusal stays fail-closed. |
| Public config | All eight configurations normalize; old strategy and old property refuse admission; bounds/defaults verified in `map-config-schema.test.ts`. |

Run the nearest leaf tests and type checks after implementation. Exercise a
dense Huge-size operation fixture to bound runtime; the existing radius helper
allocates temporary map-sized visitation arrays per accepted cell, so record
that cost before considering any local optimization. Do not preemptively
introduce a reusable spatial-index abstraction.

Owner verification then reruns the **complete existing study bank unchanged**,
not just Sundered/1018. Existing non-reef thermal failures remain separately
classified; this change must add none. Pre-declared expectations:

| Signal | Expected movement / guard |
| --- | --- |
| Sundered/1018 admitted atoll habitat | Origin-only rejection disappears; inspect tile 3510 and any actual spacing witness, then require the existing atoll-presence target to pass. |
| Reef-family density | All existing identity ceilings stay intact, including Sundered's 0.02 water share and cold-reef coast guards. No target edits. |
| Geography, climate, habitat evidence | Byte-identical upstream terrain, water masks, thermal fields, and suitability scores for held inputs. |
| Occupancy and legality | No duplicate or upstream-occupied intent; existing feature-surface legality checks remain clean. |
| Downstream placement | Changed reef occupancy may change later features/resources; keep existing downstream integrity/fairness guards rather than demanding identical counts. |

Failure to retain an isolated eligible bank falsifies the implementation.
Failure of a density, legality, or downstream guard rejects the proposed
spacing choices pending review; it does not authorize a quota or target
relaxation. The receipt below records portable acceptance, not native proof.

## Implementation Receipt

The selected operation/config migration is implemented without changes to
habitat scoring, feature floors, Core, steps, or study targets. Independent
review found no correctness issue. Its focused rerun passed 13 tests with
110,069 assertions, including exhaustive small-bank spacing/maximality,
canonical geometry, occupancy and deterministic ranking.

The 2026-09-29 owning Nx graph ran definition and realization check, test,
build and original Habitat policy together. Definition: 909 passed, one
aggregate study test failed; realization: 175 passed. The complete unchanged
study bank now reports **11 rather than 12 failed expectations**: the atoll
presence failure is gone, with no new failures. The remaining expectations
are the already-tracked thermal/vegetation calibration issues. All reef
density, legality, placement and resource guards pass. The graph is therefore
not globally green and is not represented as such.

Ten retained scenario replays match all 120 upstream field hashes across
terrain, water masks, drainage and climate. Only the admitted reef envelope
differs in authored configuration. The receipt and rerunner are
`earth-calibration/reef-upstream-parity.{json,mjs}` under the documented
VisualAtlas root. This field list does not claim every downstream output is
unchanged; reef occupancy intentionally affects later placement.

Dense Huge operation measurements after warmup remain below 8 ms in the
sampled spacing-2/3 runs. Temporary canonical-radius allocations total about
36.7 MB at spacing 2 and 16.6 MB at spacing 3 per dense run. No new index or
optimization was justified by that bounded cost. Native map playback remains
part of the subsequent integrated qualification, not this operation proof.

## Source Anchors

- `src/domain/ecology/modules/features/ops/features-plan-reefs/` owns the change.
- `rules/admit-reef-intent.ts` owns existing family and confidence admission.
- `src/domain/ecology/modules/features/model/policy/feature-score-selection.ts`
  owns the existing physical candidate ordering.
- `packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts` and
  `hex-space.ts` own canonical adjacency and distance.
- `src/recipes/standard/metrics/studies/` owns the study bank and its target
  registrations; paths beginning `src/` above are relative to the Swooper
  definition package, `plugins/mod/map/swooper-physics`.

## Current Ring Calibration And Native Receipt

The 2026-10-01 current-only thermal cohort exposed a different admission gap
after the thinning correction above: Ring Huge/1018 has an isolated eligible
warm ocean bank at `(39,35)`, cell `3749`, three hex edges from land. Its score
under the existing scorer is `0.6121392250061035`, above Ring's unchanged `0.58`
planner floor, but Ring's authored minimum coast distance `4` excludes it.
This is not a reason to restore stride sampling or manufacture an atoll quota.

Change only Ring's `scoreReefAtoll.config.minDistanceToCoast` from `4` to `3`.
Hold its warm-ocean-bank strategy, maximum distance `8`, temperature/depth
bounds, confidence floor and spacing. Keep the public default minimum `4` and
the other seven profile selections. An eleven-cell public-operation test
holds invalid/occupied habitat and the existing distance-four/eight scores;
the catalog test compiles all eight authored selections through the existing
initial-setup helper. Both tests pass with the existing Tiny and Huge size
selectors: 25 tests, 327 assertions for each size. No new test registry,
fixed-size runner, operation, recipe step, or global configuration is needed.

The retained five-seed Ring Huge scorer/planner ablation admits `1/0/7/1/2`
atolls, eleven additions with no removal or displacement of existing reef
intents. Upstream physical inputs and other reef placement are held. The
existing `shipped/identity/shattered-ring` study now passes at Huge/1018/1018
with ten players, including its unchanged density and integrity targets.
The complete definition graph passes types and Habitat policy, with 1,049
tests passing and one aggregate study test failing on three unchanged climate
expectations: Earthlike within-row thermal variation and biome dominance,
and Latest Juicy pressure anomaly RMS. Those are still open, not waived.

Native verification uses the normal `shattered-ring` map, the saved
`ToT_NoModsExceptMaps` setup with explicit Huge, seeds `1018/1018`, ten players,
and stock lake cutoff `10`. The current generated and installed script hashes
match. A digest-valid completion agrees with the current configuration digest
and setup. Its fresh `FEATURE_APPLY_V1` reports one attempted/applied atoll
and no feature rejection; the complete 6,996-cell native readback confirms
that the only `FEATURE_ATOLL` (`27`) persists at `(39,35)` after generation.
No application exit/relaunch was needed.

Receipts are under the documented VisualAtlas `earth-calibration` root:
`ring-atoll-current-bank-20261001.json`,
`ring-atoll-definition-owner-proof-20261001.log`, and
`ring-atoll-native-20261001-{qualification.json,native-surface.json,scripting.log,decoded-log.json,live-recheck.log}`.
The native qualification digest is
`b0c1db18bc93d328b2a9c44ef01782d5d5fd36c77765cb4f21c2372c0aef3370`.
This closes the Ring atoll calibration/persistence claim, not general lake
height, cliff rendering, or navigable passage.
