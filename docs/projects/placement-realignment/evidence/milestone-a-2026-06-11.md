# Milestone A — Live-Game Proof (resources vertical + identity)

Status: IN PROGRESS (this file is filled probe-by-probe; nothing below is a
claim until its section carries observed payloads).

## Run frame (bounded)

- Branch: `placement-live-integration` (integration branch: placement
  9-slice stack top `placement-realignment-s8-closure` @ 176e95f58 + rivers
  stack `codex/river-native-materialization-doc-realignment` @ 886ea24d0;
  merge 754e0fc9b — see `live-integration-2026-06-11.md` for the merge
  decision log). The placement stack under proof is PRs #1565–#1573.
- Driver: studio-server run-in-game pipeline from this worktree
  (`bun run dev:mapgen-studio`, vite on localhost:5173, IPv6 loopback).
- Request: `studio-run-in-game-mq94duhs-o7l` — POST /api/civ7/run-in-game,
  HTTP 202 at 2026-06-11T06:33Z. Payload: recipe `mod-swooper-maps/standard`,
  map config = `swooper-earthlike` config object (placement knobs at
  defaults — the declared Earth-like baseline), seed 1337,
  `MAPSIZE_HUGE`, playerCount 10, materialization disposable,
  `recovery.restartCivProcess: true`, setupConfig.savedConfig =
  `ToT Config.Civ7Cfg` (user save dir, mtime 2026-06-04).
- Pre-run log boundary: `Scripting.log` 468,212 bytes, mtime Jun 11 01:18
  local (captured 2026-06-11T06:32:19Z). Anything cited below must come
  from after this boundary.
- Live frame note (recorded amendment context): local-stats gates E1/E2/E3
  were predeclared on standard/84x54/8 seats. This live run is the
  user-mandated product frame (Huge 106x66, 10 players, ToT game config);
  count-based gates are re-derived for the Huge frame where they apply
  (E2.2 minimums via MapResourceMinimumAmountModifier rows for HUGE).

## Run attempts (run-in-game pipeline)

| Attempt | Request id | Result |
| --- | --- | --- |
| 1 | `studio-run-in-game-mq94duhs-o7l` | FAILED at step 50/53 `placement.place-resources`: `console.warn is not a function` — the Civ7 scripting runtime exposes `console.log` only. All phases up to waiting-for-proof passed (deploy, process restart, ToT config load, setup readback, Begin Game); 49/53 pipeline steps OK on the live engine, including the full new placement chain (plan-resources 373ms, assign-starts 84ms, adjust-resources 43ms). Fix: engine-safe `warnLog` helper replacing all 6 placement `console.warn` call sites — integration commit 409f35de5, stack slice `placement-realignment-s9-live-compat`. |
| 2 | `studio-run-in-game-mq951dz6-o7l` | COMPLETE. 53/53 steps OK. Proof markers matched: requestId + configHash `0ee1f4b5…` + envelopeHash `78618e6b…` + seed 1337 + 106x66. civSetup readback: `MAPSIZE_HUGE`, mapSeed 1337, gameSeed 1337, playerCount 10, map script `{swooper-maps}/maps/studio-current.js`. exactAuthorshipProof.status = `unresolved` with ONLY `source-snapshot.*` links missing (headless driver sent no browser-state snapshot — see attempt 3). |
| 3 | `studio-run-in-game-mq95a8mp-o7l` | Re-run with a truthful headless `sourceSnapshot` (recipe/world/pipeline settings = the request payload itself; configHash/envelopeHash from attempt 2) so the proof can complete and unblock A1 parity. In flight at this ledger write. |

### Attempt-2 live placement telemetry (Scripting.log, bounded to the 02:51 run)

- `RESOURCE_PLACEMENT_V1`: plannedCount 226, placedCount 219, **rejectedCount 7**,
  mismatchCount 0, 34 unique types planned and placed, per-type counts 2..20,
  runtimeCatalogCount 55. Reconciliation byPhase: rotation 62→ (see raw row),
  rangeFloor, regionMinimum 0, support 0. The 7 rejections are TYPED rows
  (`cannot-have-resource`) with plot coordinates: RESOURCE_HARDWOOD(103,41),
  RESOURCE_HIDES(45,8), RESOURCE_FLAX(9,13), + types 10/42/45/46 — the live
  legality-disagreement corpus for A3. Raw row: `/tmp/resource-placement-v1-attempt2.json`
  (copied below in A2 section when probed).
- Start assignment: **zero warn lines** — no degraded seats, no
  region-reassignments, no below-floor spacing on the Huge/10p live map
  (the never-throw ladder seated everyone on the primary rung).
- `PLACEMENT_SURFACE_PREPARATION_V1`: acceptedLakeTileCount 27,
  finalLakeWaterDriftCount 0, **finalLakeClassificationDriftCount 12** —
  live lake classification drift exists where mock has 0 (Milestone B1 scope).
- The engine-safe `[warn]` routing is proven live (the reconciliation warn
  line rendered through console.log).

### Harness finding (recorded)

`verify:final-surface-parity` refuses to compare while the exact-authorship
proof has unresolved links (`parityStatus: "blocked"`); source-snapshot links
are REQUIRED, so a headless driver must supply `sourceSnapshot` in the start
request. This is correct harness behavior (no parity claims against unproven
identity) — recorded so future headless runs include it from the start.

## A1. Full-grid final-surface parity — RUN (classification in companion doc)

Command: `bun scripts/civ7-direct-control/verify-final-surface-parity.ts
--request-id studio-run-in-game-mq95a8mp-o7l --studio-url http://localhost:5173
--output /tmp/parity-a3.json` at 2026-06-11 ~07:05Z against the attempt-3 live
map (proof identity fully resolved, 0 unresolved authorship links). Full-grid,
all four surfaces, 6996/6996 plots compared:

| Surface | Mismatches | % |
| --- | --- | --- |
| terrain | 108 | 1.54% |
| biome | 7 | 0.10% |
| feature | 50 | 0.71% |
| resource | 156 | 2.23% |

Live `RESOURCE_PLACEMENT_V1` (both attempts, byte-identical hashes
c7c1f533/5173efc5): planned 226, placed 219, 7 typed rejections
(`cannot-have-resource`, types [10,18,42,43,45,46,49]), mismatchCount 0 —
plan==stamp held for every accepted intent; every rejection is a typed row
with coordinates. Per-delta classification + disposition of the legacy
106/6996 corpus: `milestone-a-2026-06-11-a1-classification.md`.
The local-vs-live start readback is a named limitation in the parity proof
("no start-position wrapper in this proof path") — covered by A5/A7 via the
turn-1 founder-unit probe instead.

## A2. E2.2 / E2.4 live resource counts — see companion doc

`milestone-a-2026-06-11-a2-a6-policy.md` (analysis over the captured live
full-grid + GameInfo tables).

## A3. E4.4 mock-vs-live legality agreement + ignoreWeight + SILVER — **PASS**

Command: `bun scripts/placement/verify-live-legality-agreement.ts
--sample-size 400 --output …/evidence/live-legality-agreement.json`
(2026-06-11T07:07Z, Tuner state, in-engine batched
`ResourceBuilder.canHaveResource(iX, iY, type, ignoreWeight)` — signature
verified against official `resource-generator.js:176`).

- **Gate E4.4: PASS — 0.9863 agreement** (21,699 / 22,000 sampled
  (plot,type) pairs; threshold ≥ 0.95).
- Disagreement structure: 274/301 are mock-illegal/live-legal, ALL on
  water plots without features (WHALES 137, CRABS 137) — the mock marine
  lane is stricter than live legality; 27 are mock-legal/live-illegal,
  24 of them land plots WITH features (live feature-blocking the mock
  under-applies; matches the 7 live plan rejections' class).
- **ignoreWeight semantics pinned:** ignoreWeight=true is a strict
  superset of =false across every type (0 violations; 2457 vs 2335 legal
  pair-counts). The deterministic pipeline's legality-only assumption maps
  to ignoreWeight=true semantics; the weight gate is selection-side.
- **SILVER (DEF-009) resolved:** live-legal SILVER tiles full-grid:
  **112** (ignoreWeight=true) / 88 (=false) vs the mock's 16 → the E2.7
  SILVER structural exception is a mock-emulation artifact, NOT a map
  shortage. DEF-009 disposition: fix the mock silver lane (or widen its
  legality), then re-run the E2.7 gate.

## A4. isResourceRequiredForAge live semantics — boundary PINNED

Command: `bun scripts/placement/verify-live-required-for-age.ts --output
…/evidence/live-required-for-age.json` (same run window; signature
`isResourceRequiredForAge(index, Game.age)` per official
`resource-generator.js:115`). Live age resolved: AGE_ANTIQUITY
(hash 2077444219). Live leaders captured (10).

- Live-required set (17): COTTON GOLD IVORY JADE KAOLIN PEARLS SILK SILVER
  WINE CAMELS HIDES HORSES IRON SALT WOOL RUBIES TIN.
- **Live behavior matches NEITHER the static derivation NOR the
  leader-filtered static set** (17 mismatches each way; e.g. GOLD keyed by
  absent LEADER_HATSHEPSUT is still live-required; FISH/INCENSE/MARBLE are
  static-required but live-not). The S2 static derivation
  (Resource_RequiredLeaders × Resource_ValidAges) is the WRONG rule for
  this engine call; the live set reads as the age's tradeable/empire
  resource class. Boundary recorded; correction owed to the policy-table
  generator (V1) + the E2.2 gating that consumes it — follow-up slice, not
  silently patched here.

## A5. Alive-major id semantics (E1.2 engine half) — VERIFIED

`civ7 game exec` probes (Tuner state, 2026-06-11 ~07:0xZ):

- `Players.getAliveMajorIds()` = `[0,1,2,3,4,5,6,7,8,9]` — contiguous,
  0-based, **human first** (id 0 is the only human), exactly the configured
  10 players (E1.2 engine half: count exact, ids contiguous-from-zero —
  the seat-identity mapping's contiguous-ids model holds live).
- No start-plot getter exists on the live player prototype; start plots
  read via turn-1 founder-unit positions (one unit per player):
  p0(34,41) p1(25,37) p2(45,19) p3(39,28) p4(31,48) p5(48,27) p6(90,19)
  p7(95,25) p8(69,40) p9(58,26). Observed hemisphere split 6 west / 4 east.
  Method recorded in `live-identity-a.json`.

## A6. Per-civ StartBias resolution — see companion doc

Per-player civ/leader hashes captured live (`live-identity-a.json`); leader
names resolved live in A4's payload. Static StartBias row resolution +
seatBiases op-input table: `milestone-a-2026-06-11-a2-a6-policy.md`. Live
seatBiases wiring remains a follow-up data change (op input ships neutral).

## A7. Studio↔live seat parity (first pass) — see companion doc

`milestone-a-2026-06-11-a7-seat-parity.md` (local headless run of the same
config/seed/frame vs the live founder-unit plots above).
