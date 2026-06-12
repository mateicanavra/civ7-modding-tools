# A1 — Full-grid parity delta classification (live Huge/10p, seed 1337)

Status: COMPLETE — every delta on all four surfaces is assigned to a named
class with an owner. Zero unexplained classes (two precision caveats are
recorded inline, neither leaves a row unclassified).

## Frame

- Proof artifact: `/tmp/parity-a3.json` — full-grid final-surface parity for
  live run `studio-run-in-game-mq95a8mp-o7l` (Huge 106x66, seed 1337,
  10 players, `swooper-earthlike` config; request + proof identity fully
  resolved, 0 unresolved authorship links). 6996/6996 plots compared per
  surface.
- Live telemetry (Scripting.log, run-bounded): `RESOURCE_PLACEMENT_V1`
  (planned 226 / placed 219 / rejected 7 / mismatch 0),
  `FEATURE_APPLY_V1` (attempted 1716 / applied 1670 / rejected 46, all
  `rejectedCanHaveFeature`), `NATURAL_WONDER_PLACEMENT_V1` (planned 7 /
  placed 5 / rejected 2 `partial-expected-footprint`),
  `PLACEMENT_SURFACE_PREPARATION_V1` (acceptedLakeTileCount 27,
  finalLakeWaterDriftCount 0, finalLakeClassificationDriftCount 12).
- Id→name mappings: terrain/biome/feature via
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`
  (`CIV7_BROWSER_TABLES_V0`); resource ids via live GameInfo.Resources
  (`$index` → `ResourceType`, `/tmp/gameinfo-Resources.json`).
- Mismatch totals: terrain 108, biome 7, feature 50, resource 156
  (321 rows). All counts below were recomputed from the full embedded
  local/live grids in the proof (the artifact's `examples` arrays truncate
  at 16 rows; nothing here relies on truncated lists).

## Headline causal model

The placement pipeline held `plan == stamp` on both sides:

- Local: the local final resource surface equals the local adjusted resource
  plan exactly — 226/226 intents on-surface, 0 extras, 0 missing.
- Live: `RESOURCE_PLACEMENT_V1` `mismatchCount: 0` — every accepted stamp was
  readback-verified at its planned coordinate; placed 219 = planned 226 − 7
  typed rejections.

Therefore every cross-surface delta reduces to **plan-input divergence**
(the live placement surface differs from the local one before planning) plus
**typed engine legality rejections at stamp time**. The live placement
surface differs from local by exactly the rivers-stack-owned drift classes:

- 106 navigable-river terrain tiles live materializes that local does not
  project (`riverMetadataParity`: local `projectedNavigableTerrainTileCount`
  38 vs live `liveTerrainNavigableRiverTileCount` 144;
  `projectedVsLiveTerrainMismatchCount` 106 — proof label
  `terrain-readback: fail`).
- 1 engine-materialized water tile in an enclosed mountain basin (below).
- 12 lake classification drifts (`lake-final: fail`) — invisible on the
  terrain-id grid (both sides read `TERRAIN_COAST`), but part of the
  placement surface the live planner consumed.
- 46 live feature-apply rejections downstream of the terrain drift.

## Terrain — 108 rows

| Class | Count | Local→Live | Example coords | Explanation | Owner |
|---|---:|---|---|---|---|
| T-NAV navigable-river projection divergence | 106 | `TERRAIN_FLAT`→`TERRAIN_NAVIGABLE_RIVER` (88), `TERRAIN_HILL`→`TERRAIN_NAVIGABLE_RIVER` (18) | (25,13) (27,13) (86,14) (60,24) (9,55) | Live materializes 144 navigable-river tiles; local projects 38. Equals `projectedVsLiveTerrainMismatchCount=106` exactly. Known rivers-stack class (proof label `terrain-readback: fail`). Spatially: river-corridor chains (e.g. x≈85–94 y≈14–40, x≈59–60 y≈42–48, x≈9–18 y≈48–65). | rivers-stack |
| T-COAST-ADJ engine coast-adjacency materialization | 1 | `TERRAIN_OCEAN`→`TERRAIN_COAST` | (4,2) | Ice-covered water tile hex-adjacent (odd-r) to land at (3,3) in BOTH grids; engine `validateAndFixTerrain` reclassifies ocean adjacent to land as coast; local coast banding missed this one tile. Not a polar-water-row artifact (row 2 is outside the 2 polar rows). | engine-maintenance (local coast-banding counterpart gap noted) |
| T-LAKE-BASIN engine basin water materialization | 1 | `TERRAIN_FLAT`→`TERRAIN_COAST` | (5,60) | One-tile depression fully ringed by mountains; live materializes water where local keeps flat land. Proven to pre-date placement: live `FEATURE_APPLY_V1` rejected `FEATURE_TAIGA` on this tile at step 41 (`canHaveFeature=false`), so the tile was already water before features. Outside the 27 accepted-lake tiles (`finalLakeWaterDriftCount=0` counts accepted lakes only). | rivers-stack (lake materialization drift family) |

Full T-NAV coordinate list (H = local HILL, F = local FLAT):
(25,13)H (26,13)H (27,13)F (25,14)F (86,14)F (86,15)F (91,18)F (90,19)F
(87,20)F (88,20)F (89,20)F (90,20)F (90,21)F (91,21)F (61,22)F (62,22)F
(63,22)F (64,22)F (90,22)F (94,22)F (23,23)H (46,23)F (47,23)F (60,23)F
(87,23)F (88,23)F (89,23)F (93,23)F (24,24)H (25,24)H (60,24)F (68,24)F
(67,25)F (66,26)F (67,26)F (37,27)F (77,27)F (78,27)F (79,27)H (80,27)F
(81,27)H (36,28)F (38,28)F (78,28)H (26,29)F (27,29)F (35,29)F (38,29)H
(26,30)F (38,30)F (91,30)F (38,31)F (57,31)F (91,31)F (92,31)F (93,31)F
(58,32)F (80,32)F (81,32)H (82,32)F (83,32)H (94,32)F (58,33)H (69,33)F
(93,33)F (70,34)F (86,34)F (93,34)F (69,35)F (85,35)F (69,36)F (86,36)F
(91,36)F (92,36)F (93,36)F (85,37)F (33,38)F (86,38)F (32,39)F (85,39)F
(33,40)F (85,40)F (51,42)F (60,42)F (59,43)F (60,44)F (60,45)F (60,46)F
(59,47)F (15,48)F (16,48)F (59,48)F (12,49)H (13,49)H (14,49)H (11,50)H
(12,50)H (9,53)F (10,54)F (9,55)F (30,55)H (9,56)F (31,56)F (17,63)F
(18,64)F (18,65)F

Answers to the gate's specific terrain questions:

- Lake classification drift (12): explains **0** terrain-id rows. The drift
  is a lake-vs-coast *classification* divergence on tiles whose terrain id
  is `TERRAIN_COAST` on both sides; it is invisible on the terrain grid but
  material to the placement surface (see resource section).
- Navigable-river/coast maintenance: **107** rows (106 T-NAV + 1
  T-COAST-ADJ).
- Polar rows: **0** rows (no mismatch lies in the 2 polar water rows).

## Biome — 7 rows

| Class | Count | Local→Live | Coords | Explanation | Owner |
|---|---:|---|---|---|---|
| B-WONDER-HALO natural-wonder biome rebinding | 7 | `BIOME_GRASSLAND`→`BIOME_TUNDRA` | (31,22) + its 6 odd-r hex neighbors (30,21) (31,21) (30,22) (32,22) (30,23) (31,23) | Exactly the `FEATURE_GULLFOSS` anchor plot (planned and placed at plot 2363 = (31,22), confirmed by `NATURAL_WONDER_PLAN_V1`/`naturalWonderPlanCoordinateProof: match`) plus its full hex ring. Engine wonder placement rebinds the biome to tundra on the wonder plot and halo; the local mock places the feature id but does not replicate the biome side-effect. New named class. | engine-maintenance |

This is 7/7 biome rows — the surface is fully explained by one wonder halo.

## Feature — 50 rows

Reconciliation anchor: live `FEATURE_APPLY_V1` rejected exactly 46 features
(`rejectedCanHaveFeature: 46`), and the 46 local-has/live-lacks feature rows
match the per-feature rejection arithmetic exactly (TAIGA 162→154 = 8 =
7 nav + 1 basin; COLD_REEF 83→81 = 2; RAINFOREST 201→187 = 14;
SAGEBRUSH_STEPPE 24→20 = 4; FOREST 14→13 = 1; TROPICAL_FLOODPLAIN_MINOR
19→18 = 1; remainder MANGROVE 2 + SAVANNA_WOODLAND 12 +
PLAINS_FLOODPLAIN_MINOR 2 = 16 = 46 − 30). The other 4 rows are the two
wonder footprint pairs.

| Class | Count | Local→Live | Example coords | Explanation | Owner |
|---|---:|---|---|---|---|
| F-NAV-CLEAR vegetation/floodplain rejected on live navigable-river terrain | 43 | RAINFOREST→empty (14), SAVANNA_WOODLAND→empty (12), TAIGA→empty (7), SAGEBRUSH_STEPPE→empty (4), MANGROVE→empty (2), PLAINS_FLOODPLAIN_MINOR→empty (2), FOREST→empty (1), TROPICAL_FLOODPLAIN_MINOR→empty (1) | (60,24) (91,30) (10,54) (85,35) (26,30) (93,34) (60,23) (92,36) | Every one of these 43 tiles is in the T-NAV set: live terrain is `TERRAIN_NAVIGABLE_RIVER` at feature-apply time, so live `canHaveFeature=false`; local terrain is flat/hill so local applies the feature. Pure downstream of T-NAV. | rivers-stack (downstream of T-NAV) |
| F-BASIN-WATER feature rejected on engine basin water | 1 | TAIGA→empty | (5,60) | Same tile as T-LAKE-BASIN; live tile is water at feature apply. | rivers-stack (follows T-LAKE-BASIN) |
| F-COLD-REEF live canHaveFeature rejection on static-legal coast | 2 | COLD_REEF→empty | (36,6) (80,6) | `TERRAIN_COAST`/`BIOME_MARINE` on both sides, static-legal per policy tables; live rejects with `canHaveFeature=false`. Recurrence of legacy class **F1** from the earthlike-live-feature-resource-legality-repair ledger (same signature at (48,6) on the old seed). Hidden engine constraint; class is named and stable across runs, root engine rule still unidentified (precision caveat 2). | engine-maintenance |
| F-WONDER-FOOTPRINT partial-expected-footprint divergence | 4 | ZHANGJIAJIE: local (24,17) ↔ live (23,17); MACHAPUCHARE: local (57,39) ↔ live (56,39) | — | Two-plot wonders, identical anchors on both sides ((23,16) and (56,38), both agreeing on the final grids; plan hashes match — `naturalWonderPlanCoordinateProof: match`), but the second footprint plot diverges. Live `NATURAL_WONDER_PLACEMENT_V1` reports both as `readback-mismatch`/`partial-expected-footprint` yet the live final grid carries the feature on the alternate footprint plot. Recurrence of legacy classes **F2–F5** (Kilimanjaro/Zhangjiajie pairs on the old seed). | engine-maintenance (engine footprint-direction semantics; placement readback expects the planned footprint) |

Total: 43 + 1 + 2 + 4 = 50. ✓

## Resource — 156 rows

### Mechanism proof (computed from the full grids)

- Local final surface == local adjusted plan: 226/226, 0 extras, 0 missing.
- Live final surface: 219 cells = 126 on local-plan coords with the same
  type + 37 on local-plan coords with a different type + 56 on coords not in
  the local plan. So the **live plan geometrically diverged** from the local
  plan (same engine, same seed) — because the live placement surface
  differs by the rivers-stack drift classes above (106 nav tiles, 46 fewer
  features, 1 basin water tile, 12 lake classifications), and resource
  planning is order-sensitive over the legal-plot sets.
- Per-type conservation: live count(T) = local count(T) for every resource
  type except exactly one missing instance each of the 7 live-rejected types
  [10 KAOLIN, 18 HIDES, 42 CLAY, 43 FLAX, 45 RICE, 46 LIMESTONE,
  49 HARDWOOD]. Net per-type delta is −1 for those 7 and 0 for all other
  27 mismatch-involved types.
- Direct surface witnesses of plan divergence: 4 local-plan resources sit on
  tiles live materialized as navigable river — WOOL(58,33), INCENSE(59,43),
  RUBIES(14,49), TIN(11,50) — coordinates the live planner could never have
  selected (water on its surface).
- This is **not** engine post-stamp movement: stamp `mismatchCount: 0` plus
  exact per-type count conservation pins live-final == live-plan − typed
  rejections.

| Class | Count | Pattern | Example coords | Explanation | Owner |
|---|---:|---|---|---|---|
| R-REJ typed stamp rejection | 7 | local-has/live-lacks, one per type KAOLIN, HIDES, CLAY, FLAX, RICE, LIMESTONE, HARDWOOD | HARDWOOD(103,41), HIDES(45,8), FLAX(9,13) coordinate-verified | Live `ResourceBuilder.canHaveResource=false` at stamp time, reason `cannot-have-resource`, typed rows in `RESOURCE_PLACEMENT_V1`. The 3 surviving rejection rows all appear as local-has/live-lacks mismatches at the logged coordinates (live plan agreed with local plan there). The other 4 rows' live-plan coordinates are unrecoverable from this packet — the Scripting.log writer truncates the line ≈1KB in, after 3 of 7 `rejectionRows` (precision caveat 1); class membership and count are proven by per-type conservation. Candidates among local-only rows: KAOLIN (16,15)/(75,29)/(30,35); CLAY (30,2)/(47,29)/(27,31)/(27,38); RICE (98,28)/(10,34); LIMESTONE (34,29)/(61,34)/(100,53). | engine-maintenance (hidden live legality at stamp; A3 legality-disagreement lane) |
| R-PLAN-DISP plan-divergence displacement | 112 (56 local-only + 56 live-only) | same type disappears at a local-plan coord and appears at a live-plan coord | COTTON (82,20)→e.g.(84,22); SILVER (86,9)→(90,8); incl. the 4 nav-tile witnesses above | Live planner assigned the same per-type quotas to different coordinates. Greedy same-type pairing of the two sets: hex distance min 1 / p50 21 / p90 50 / max 77 — global reassignment, the same displacement signature the legacy corpus measured (p50 27), now causally pinned to plan-input divergence instead of unknown Civ behavior. | placement-pipeline (plan determinism is conditional on placement-surface parity); root cause rivers-stack drift classes |
| R-PLAN-SUB plan-divergence same-tile type substitution | 37 | both-has, different type at same coord | SILVER↔IRON ×5, GOLD↔TIN ×6, LIMESTONE↔MARBLE ×5, CLAY↔RICE ×5, GOLD↔IRON ×3, WOOL↔FLAX/LLAMAS… e.g. (84,7) IRON→SILVER, (29,15) TIN→GOLD | Same mechanism: the rotation/assignment order shifted under the drifted surface, so the same tile receives a different type. All substitution flows net to 0 per type. | placement-pipeline / rivers-stack (as R-PLAN-DISP) |

Total: 7 + 112 + 37 = 156. ✓  (The 4 nav-tile rows are inside the 56
local-only displacement rows: their types all net to 0.)

Full class membership (recomputed from the grids):

- Local-only (63 = 56 displaced + 7 rejected): CLAY (30,2) (47,29) (27,31)
  (27,38); HIDES (45,8) (16,57); SILVER (86,9) (88,11) (18,54) (16,56)
  (10,64); FLAX (9,13) (31,23) (17,53); KAOLIN (16,15) (75,29) (30,35);
  MARBLE (25,15) (67,47); GOLD (41,17) (26,26) (33,29) (37,31) (66,52);
  COTTON (82,20) (36,23) (40,23) (61,23) (84,23); WINE (85,20); WILD_GAME
  (58,21) (35,37) (25,41); SILK (47,22) (43,24) (65,44); CRABS (50,25)
  (79,49); RUBIES (33,26) (14,49); CAMELS (40,26) (21,51); GYPSUM (68,26)
  (64,28) (70,29); SALT (44,27) (84,31); RICE (98,28) (10,34); LIMESTONE
  (34,29) (61,34) (100,53); MANGOS (79,29) (31,35); WOOL (73,30) (58,33);
  TURTLES (99,32); TIN (59,35) (11,50); INCENSE (62,41) (59,43); HARDWOOD
  (103,41); FISH (38,58).
- Live-only (56): SILVER (90,8) (30,23) (34,54) (16,55) (10,60) (13,61)
  (11,64); TURTLES (93,17); WOOL (42,18) (32,35); WILD_GAME (65,18) (45,28)
  (46,50); CRABS (47,19) (29,38); WINE (59,21) (83,21) (75,24); CAMELS
  (75,22) (85,32); COTTON (84,22) (81,42) (76,43); SILK (49,23) (45,24);
  GYPSUM (73,24) (70,28) (20,53); SALT (74,24) (72,29) (60,33); TIN (32,25)
  (10,50) (18,53); GOLD (35,27) (74,31) (58,38) (36,44) (14,48); CLAY
  (76,29) (27,33) (79,34) (30,37); KAOLIN (57,30) (78,30); MANGOS (29,31)
  (35,36); LIMESTONE (36,31) (17,45); INCENSE (66,31) (60,43); RUBIES
  (58,34); FISH (27,35); MARBLE (61,35); FLAX (67,52); HIDES (19,57).
- Substitutions (37): SILVER→WOOL (87,6); IRON→SILVER (84,7) (87,9);
  SILVER→IRON (90,9) (83,11) (12,61); TIN→GOLD (29,15) (38,19) (25,49);
  IRON→GOLD (26,17) (39,22); GOLD→TIN (84,18) (68,46) (22,48); WOOL→FLAX
  (26,20); LIMESTONE→MARBLE (29,21) (33,21) (62,50); FLAX→GOLD (36,21);
  GOLD→LIMESTONE (27,22); MARBLE→LIMESTONE (33,22) (60,36); LLAMAS→RUBIES
  (26,23); GOLD→FLAX (35,23); WINE→COTTON (62,23) (79,45); SALT→GYPSUM
  (62,26); RICE→CLAY (6,29) (43,35); TIN→IRON (34,32); CLAY→RICE (45,32)
  (78,37) (93,37); WOOL→LLAMAS (55,39); GYPSUM→SILK (65,43); GOLD→IRON
  (18,45); IRON→WOOL (36,51).

## Corpus disposition — earthlike-live-feature-resource-legality-repair

The legacy ledger
(`openspec/changes/earthlike-live-feature-resource-legality-repair/workstream/delta-classification-ledger.md`)
classified a 106/6996 resource corpus (+5 feature, +2 terrain rows) for run
`studio-run-in-game-mq20rbzr-1fhc` (seed 138503614) against the
**pre-cutover** pipeline, where live Civ performed its own resource
assignment (252 planned/252 placed/0 rejected) and the local mock tried to
predict it.

That frame no longer exists. Post-cutover, the pipeline plans within policy
tables and stamps deterministically; live final equals live plan minus typed
rejections. Disposition by legacy class:

| Legacy class (rows) | Disposition |
|---|---|
| Adapter/map-policy adjacent-land class (26 live-only aquatic rows) | **Retained as a completed repair.** The `@civ7/map-policy` adjacent-land fix stands; no adjacent-land-signature class recurs in the new corpus (the new aquatic rows are 1:1 same-type displacement, fully inside R-PLAN-DISP). |
| `local-overaccepted-live-empty` (9 rows) | **Superseded by R-REJ.** The same phenomenon (local accepts what live `canHaveResource` rejects) is now first-class typed telemetry at stamp time: 7 rejection rows with type/coord/reason. The open "scarce-floor vs hidden Civ constraint" investigation continues in the A3 legality-disagreement lane on the new corpus. |
| `live-feasible-no-local-assignment` (37), `local-feasible-live-empty` (28), `substitution-both-feasible` (31), `substitution-both-infeasible` (1) | **Superseded by R-PLAN-DISP / R-PLAN-SUB.** The legacy "why does Civ assign differently" question is dissolved: Civ no longer assigns. The recurring displacement signature is causally pinned to placement-surface divergence (rivers-stack drift classes) feeding an order-sensitive planner. |
| Feature F1 (cold reef, (48,6)) | **Class still live.** Recurs in the new corpus as F-COLD-REEF (2 rows, (36,6)/(80,6)), same signature: static-legal coast/marine, live `canHaveFeature=false`. |
| Feature F2–F5 (Kilimanjaro/Zhangjiajie footprint pairs) | **Class still live.** Recurs as F-WONDER-FOOTPRINT (Zhangjiajie + Machapuchare pairs), now with typed `partial-expected-footprint` rejection telemetry and matching plan-coordinate hashes. |
| Terrain rows (2, out-of-lane in legacy ledger) | **Superseded.** New corpus terrain rows are fully classified here (T-NAV / T-COAST-ADJ / T-LAKE-BASIN). |

**New canonical corpus:** this document — 321 rows for run
`studio-run-in-game-mq95a8mp-o7l` (Huge 106x66, seed 1337, 10 players),
classes T-NAV(106), T-COAST-ADJ(1), T-LAKE-BASIN(1), B-WONDER-HALO(7),
F-NAV-CLEAR(43), F-BASIN-WATER(1), F-COLD-REEF(2), F-WONDER-FOOTPRINT(4),
R-REJ(7), R-PLAN-DISP(112), R-PLAN-SUB(37). The legacy ledger now carries a
supersession notice pointing here.

## Gate verdict — A1

Every delta is CLASSIFIED. Unexplained rows: **0**.

| Surface | Rows | Classified | Owner split |
|---|---:|---:|---|
| terrain | 108 | 108 | rivers-stack 107, engine-maintenance 1 |
| biome | 7 | 7 | engine-maintenance 7 |
| feature | 50 | 50 | rivers-stack 44, engine-maintenance 6 |
| resource | 156 | 156 | placement-pipeline/rivers-stack 149, engine-maintenance 7 |

Precision caveats (classified, but flagged for follow-up):

1. R-REJ coordinate identity for 4 of 7 rows (KAOLIN/CLAY/RICE/LIMESTONE):
   the class and count are proven by per-type conservation, but the exact
   live-plan coordinates are lost to Scripting.log line truncation.
   Follow-up: emit `rejectionRows` as separate (or shorter) log lines so all
   rows survive the ~1KB line cap.
2. F-COLD-REEF root engine rule: the class is stable across two runs/seeds
   and live `canHaveFeature=false` is the proven mechanism, but the specific
   engine constraint (reef adjacency/density?) is unidentified. Follow-up in
   the legality-disagreement lane alongside R-REJ.

Implication for the realignment plan: closing T-NAV (navigable-river
projection parity, rivers-stack) plus the lake/basin drift removes 106
terrain + 44 feature rows directly and, by restoring placement-surface
parity, is expected to collapse R-PLAN-DISP/R-PLAN-SUB (149 rows) to zero,
leaving only the typed engine-legality classes (R-REJ, F-COLD-REEF,
F-WONDER-FOOTPRINT, B-WONDER-HALO, T-COAST-ADJ — 21 rows) as the
engine-maintenance acceptance discussion.
