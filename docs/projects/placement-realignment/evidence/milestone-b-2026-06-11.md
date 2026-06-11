# Milestone B — Live-Game Proof (parity + planning-surface drift + viz QA)

Run frame: same as Milestone A (`milestone-a-2026-06-11.md`) — live run
`studio-run-in-game-mq95a8mp-o7l` (Huge 106x66, seed 1337, 10 players,
swooper-earthlike, ToT setup), branch `placement-live-integration`.

## B1. Reconstructed planning-surface drift window — MEASURED, zero artifact drift

Anchor: live `NATURAL_WONDER_PLAN_INPUT_V1.surfaceDigests` (emitted at
placement-planning time inside the live engine) vs the local headless run at
the exact live frame (`a7-live-frame-lat90` dump; frame replication recorded
in `milestone-a-2026-06-11-a7-seat-parity.md`).

| surface digest | live | local | drift |
| --- | --- | --- | --- |
| landMaskHash32 | 38bc48f5 | 38bc48f5 | none |
| elevationHash32 | 3ea69a4e | 3ea69a4e | none |
| aridityPpmHash32 | 263631b8 | 263631b8 | none |
| riverClassHash32 | 75550547 | 75550547 | none |
| lakeMaskHash32 | 7dd195d5 | 7dd195d5 | none |
| blockedMaskHash32 | 844568c5 | 844568c5 | none |
| biomeTypeHash32 | 42ceb397 | 42ceb397 | **none — S6's biome reconstruction holds LIVE** |
| terrainTypeHash32 | e8060fc0 | beb4edc6 | drift (declared engine read; A1 class T-NAV: 106 carved navigable-river tiles, rivers-stack) |
| featureTypeHash32 | 42fcf491 | 16df8a0c | drift (declared engine read; A1 class F-NAV-CLEAR + wonder footprints) |

Verdict: **live `validateAndFixTerrain`/engine maintenance does NOT rebind
biomes or invalidate any artifact-reconstructed planning surface** — every
surface the S6 hygiene pass reconstructs from artifacts is hash-identical
live. The only drifting planning inputs are the two DECLARED engine-read
surfaces (terrain, features), whose drift is fully classified in
`milestone-a-2026-06-11-a1-classification.md` and owned by the rivers
stack's live-vs-mock modelRivers gap. DEF-004 scope decision: no extension
needed for biome/feature artifact coverage — the declared-read model is
exactly right; the drift is upstream-owned, not a placement reconstruction
defect.

## B2. Live reconciliation of adjusted intents (E3.1/E3.2 post-stamp) — PASS

- The run's support pass adjusted 0 intents (`byPhase.support: 0` locally at
  the matched frame; the Huge/earthlike map needed no support adjustments),
  so "live rejections among support-adjusted intents" is vacuously 0.
- Recomputed per-start support on the LIVE final surface (live resource grid
  from the parity proof + live founder-unit start plots, hex radius 4):
  counts per player [3,3,2,4,4,4,2,2,2,3] → min 2, max 4, gap 2.
  **E3.1 (floor ≥ 2): PASS live. E3.2 (gap ≤ 2): PASS live** — the 7 typed
  legality rejections did not drop any start below the floor.

## B3. Full-grid parity at the B boundary — same run as A1

S6/S7 changed planning inputs and viz, not stamps; the A1 full-grid
comparison (terrain 108 / biome 7 / feature 50 / resource 156 of 6996, all
classified, 0 unexplained) IS the B-boundary measurement for this head.
No additional deltas beyond the A1 classes.

## B4. Visual QA — capture path proven; map view blocked by age-intro overlay

- `civ7 game visibility --player-id 0 --reveal --disposable` → classification
  `revealed` (live mutation worked).
- `civ7 game screenshot` (native `XR.World.takeScreenshot`): **unsupported in
  this game build** (`availability.value=false`) — recorded.
- `civ7 game appshot` (macOS OS-capture fallback): captures succeed
  (3 shots under `/var/folders/.../civ7-appshots/`), but the rendered frame
  is the Antiquity age-intro cinematic — the autostarted game sits on a
  blocking notification stack (blocker type 20, queue length 17), so the map
  itself is not visible in OS captures. Dismissing the first-turn
  intro/notification stack is live-play-stack functionality (its
  `dismiss-notification-queue` reported `not-sent` for this blocker class).
- Disposition: visual map inspection is SUPPLEMENTAL per the workstream
  frame; the substantive B gates above are log/benchmark-proven. Remaining
  human follow-ups recorded in the closure checklist: (1) in-browser studio
  review of the 29 placement layers (DEF-008 landMask call), (2) an in-game
  visual pass once the intro stack is dismissed in normal play.

## Live-run findings owed to follow-up slices (recorded, not silently fixed)

1. `isResourceRequiredForAge` static derivation is the wrong rule (A4) —
   policy-table generator + E2.2 gating correction.
2. Mock marine legality stricter than live (A3: WHALES/CRABS classes) and
   mock SILVER lane far stricter than live (DEF-009: 16 vs 112) — mock
   emulation calibration.
3. Scripting.log truncates long telemetry lines on Huge
   (`RESOURCE_PLACEMENT_V1` rejectionRows cut) — bound telemetry payloads.
4. HUGE seats 12 slots for 10 alive players (surplus `slot-index` seats are
   flagged and inert live) — DEF-010 capacity-derived split evidence.
