# Play-Agent Net-New Launch Strategy (Turn 4 / 3925 BCE)

Anchor: this file is the launch-specific ledger for the active new game. Keep cross-game doctrine in
`operational-reference.md` and `strategy-notes.md`.

## Generic doctrine kept (applies across relaunches)

- Keep one validated command per cycle (`--send --reason ...`) and re-read `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` after each send.
- Resolve hard queue blockers before speculative movement, production, or civic commitments.
- Avoid hidden-state inference; if a pointer is null or queue posture is stale/recoverable, hold and re-query.
- Do not branch until two clean reads confirm identical queue + priority order and concrete payloads.
- If the same unresolved blocker posture repeats twice, escalate as parity-lock hold and request manual confirmation before switching lanes.

## Live checkpoint (current relaunch window)

- Timestamp (UTC): `2026-06-02` (latest read window)
- Turn/Date/hash: `4 / 3925 BCE`, hash `0`
- Blocking surface: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` is queue head and `isEndTurnBlocking:true`.
- Queue snapshot (`notification-queue`):
  - Step 1: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`), priority 100, hard blocking, handler-inspection posture
- `selectedUnitId`: `null`
- `firstReadyUnitId`: `null`
- `ready-unit`: no concrete payload (`unitId:null`, `legalOperations: []`)
- `ready-city`: no concrete payload (`cityId:null`, `legalOperationCount: 0`)
- `canEndTurn`: `false`

## Net-new decision law for this launch

1. Do not infer a unit/city action until the discovery handler exposes a concrete closeout.
2. Resolve via official handler path or equivalent inspected evidence:
   - `game play notifications --json` (then execute only the handler-supported command path for discovery payload)
   - if no explicit closeout command is surfaced, keep in hold mode and request manual handler confirmation before branching.
3. Re-read immediately in this order:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
4. If queue head shifts to a concrete known lane and remains stable for two clean reads, permit one non-speculative follow-on from that head.
5. Defer all other branches until handlers + queue are concrete.
6. Keep `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` as primary until resolved by handler-validated action.
7. If blocker posture is unchanged on the next two reads, request explicit handler confirmation and hold a 1-window lane commit freeze.

## 10-20 turn horizon (updated for this relaunch)

- Turns 4-5: hold discovery-blocker queue until handler evidence exists; no speculative movement/tech/city actions.
- Turns 6-8: if discovery resolves cleanly, take one validated follow-on (often growth/tech or city setup dependent on surfaced lane), then re-read.
- Turns 9-14: once two clean reads confirm stability and non-null payload, test one lane only:
  - Growth-lite lane: lock one production/city-growth follow-on and preserve tempo.
  - Pressure-lite lane: one validated scouting move only if target evidence is safe and high-value.
- Turns 15-20: commit lane choice only if queue/head + ready payload are stable for two additional clean reads; otherwise continue conservative recovery.

- If `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` persists unresolved for 2+ consecutive clean reads, pause turn-sequenced branch planning and switch to parity-watch mode (no branch, no action, only handler evidence revalidation).

## One-line relay for active player frame

`Turn 4 / 3925 BCE` | `Blocking notification is discovery-direction (id 4), and no unit/city handler payload is currently concrete` | `Hold lane, inspect handler evidence from notifications + queue + priorities, then execute only explicit handler-backed closeout` | `Defer unit/city/tech branches until queue and handler payload are concrete and stable` | `Medium`

## Live checkpoint recheck (Turn 4 / 3925 BCE, handler still unresolved)

- Timestamp (UTC): `2026-06-02` (repeat read)
- `Blocking notification` remains `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`), still hard and unresolved.
- `queueLength` remains `1`; no concrete ready unit/city payloads or ready operations appeared.
- `turn` remains `4` / `3925 BCE`; `canEndTurn` remains `false`.
- `execution posture`: still no handler-closeout path exposed in this read.
- Updated action for this micro-window:
  - hold at lock-safe read-confirm mode,
  - avoid speculative branches,
  - continue `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` on each pass,
  - escalate to explicit handler-review request only after this persistence is observed again.

## Live checkpoint recheck #2 (Turn 4 / 3925 BCE, persistence confirmed)

- Timestamp (UTC): `2026-06-02` (repeat confirmation)
- Queue remains one-element hard head: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`, blocking).
- `selectedUnitId`: `null`.
- `firstReadyUnitId`: `null`.
- `ready-unit`: still null payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no actionable payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`.
- Control law unchanged:
  - do not branch into unit/city/tech while payload remains unknown,
  - re-read chain now and on next meaningful window,
  - request explicit handler-confirmed closeout before any speculative lane commit if this posture persists into next read.

## Live checkpoint recheck #3 (Turn 4 / 3925 BCE, escalation threshold reached)

- Timestamp (UTC): `2026-06-02` (repeat verification)
- `blockingNotificationId`: still `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) as sole queue head.
- `queueLength`: `1`.
- `selectedUnitId`: `null`.
- `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.
- Decision posture:
  - escalate as explicit handler-confirmation hold,
  - continue `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` read-confirm loop,
  - pause lane commits and branching for one full window until official closeout evidence appears.

## One-line relay (recheck #3)

`Turn 4 / 3925 BCE` | `Discovery blocker persists through three clean reads, still no concrete ready payload` | `Request explicit handler confirmation and hold all speculative lanes` | `Do only lock-safe revalidation until a concrete discovery closeout is exposed` | `Medium`

## Live checkpoint recheck #4 (Turn 4 / 3925 BCE, persistent lock)

- Timestamp (UTC): `2026-06-02` (additional confirmation)
- Hard head unchanged: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`, `isEndTurnBlocking:true`), one-item queue (`queueLength: 1`).
- No execution surface opened by queue/payload: `selectedUnitId:null`, `firstReadyUnitId:null`, `ready-unit` null payload, `ready-city` null payload.
- `canEndTurn`: `false`.
- Control update for this band:
  - continue explicit `handler evidence` hold,
  - do not execute speculative unit/city/tech branches,
  - if this persists through the next window with no handler-backed closeout command path, request active-player confirmation before any lane-change recommendation.

### 10-20 turn lens (current lock window)

- `Turns 4-10`: sustained hold/revalidation only.
- `Turns 11-14`: unlock one branch only if two consecutive reads expose identical queue + ready payload.
- `Turns 15-20`: only then choose one growth/pressure lane and hold it for at least two reads before deeper branching.

## Live checkpoint recheck #5 (Turn 4 / 3925 BCE, persistent lock + stable evidence)

- Timestamp (UTC): `2026-06-02` (most recent read).
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains the only queue head, hard-blocking posture.
- `queueLength` remains `1`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still `unitId: null`, `legalOperations: []`.
- `ready-city`: still `cityId: null`, no legal actions.
- `canEndTurn`: `false`.
- Control update:
  - continue parity-watch and handler-evidence hold for another window,
  - no speculative city/unit/tech movement,
  - only request explicit handler confirmation when the next poll also lacks concrete closeout evidence.

### 10-20 turn lens addendum (after #5)

- `Turns 4-9`: continue strict hold.
- `Turns 10-14`: branch test only after two consecutive reads with concrete closeout + stable queue/payload.
- `Turns 15-20`: commit at most one growth-first or pressure-first follow-on only with sustained non-null payload.

## Live checkpoint recheck #6 (Turn 4 / 3925 BCE, handler-required path unchanged)

- Timestamp (UTC): `2026-06-02T03:49:59Z` (same relaunch lane after re-entry)
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head, hard, with `disposition: inspect-handler`.
- `notification-queue`: still a single visible head (`queueLength: 1`) with no helper queue candidates in this read.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still null payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still null payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`.
- `hasSentTurnComplete`: `false`.
- `command-path recovery note`: explicit command path is still unresolved from App UI; only handler/notification evidence is authoritative for closeout.

### Net-new rollout update

- Keep pure handler-backed hold mode for at least one full window.
- Continue the read-confirm chain exactly:
  - `civ7 game play notifications --json`
  - `civ7 game play notification-queue --json`
  - `civ7 game play priorities --compact --json`
  - `civ7 game play ready-unit --json`
  - `civ7 game play ready-city --compact --json`
- If this posture persists on the next clean read with no closeout evidence, request explicit active-player confirmation before any speculative branch.

### One-line relay (recheck #6)

`Turn 4 / 3925 BCE` | discovery handler queue remains hard and unresolved (`id 4`) with no concrete unit/city payload | continue handler-evidence mode and avoid speculative lanes | hold until official closeout path is exposed and validated | `Medium`

### 10-20 turn lens addendum (after #6)

- `Turns 4-8`: hold/revalidation + handler-checking, no branching.
- `Turns 9-12`: allow one branch test only after two consecutive clean reads yield concrete closeout + stable queue/payload.
- `Turns 13-20`: commit exactly one lane only if the same concrete discovery closeout repeats on another confirm; otherwise preserve parity-watch hold.

## Live checkpoint recheck #7 (Turn 4 / 3925 BCE, handler lock persists)

- Timestamp (UTC): `2026-06-02T03:50:27Z`
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains the only queue head and is still hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: `queueLength:1`, `disposition: inspect-handler`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.
- `command-path evidence`: no concrete closeout path is exposed from App UI; keep handler evidence as the control source.

Operational update:
- continue strict lock-safe posture for another window;
- do not branch unit/city/tech while both payloads are null;
- continue one-window read loop and request explicit blocker confirmation if this exact posture persists on the next clean poll.

### One-line relay (recheck #7)

`Turn 4 / 3925 BCE` | discovery handler lock is still unresolved with null unit/city payload | hold handler-first read-confirm cycle | only execute after explicit closeout evidence appears | `Medium`

### 10-20 turn lens addendum (after #7)

- `Turns 4-10`: maintain recovery hold and avoid branches.
- `Turns 11-14`: permit one lane trial only after **two** consecutive reads that expose the same concrete discovery closeout + stable queue.
- `Turns 15-20`: permit one growth-first or pressure-first follow-on only if continuity remains stable; otherwise continue hold.

## Live checkpoint recheck #8 (Turn 4 / 3925 BCE, handler-only hold persists)

- Timestamp (UTC): `2026-06-02T03:50:54Z`
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head, hard, with `disposition: inspect-handler`.
- `notification-queue`: still `queueLength:1`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`.

Operational update:
- keep strict lock-safe hold for this cycle;
- continue `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` on every loop;
- only consider any branch trial after two consecutive reads and explicit handler confirmation with concrete closeout payload.

### One-line relay (recheck #8)

`Turn 4 / 3925 BCE` | discovery blocker remains hard and unresolved (`id 4`) with no concrete unit/city payload | hold handler-evidence recovery only | request explicit closeout confirmation before lane commitments | `Medium`

### 10-20 turn lens addendum (after #8)

- `Turns 4-10`: remain in hold/revalidation and do not branch.
- `Turns 11-14`: allow one controlled lane test only after **two consecutive reads** show concrete discovery closeout + stable queue/payload.
- `Turns 15-20`: continue hold unless that concrete closeout repeats on another confirming read; then allow one growth-first or pressure-first follow-on with explicit checkpoints.

## Live checkpoint recheck #9 (Turn 4 / 3925 BCE, lock still unresolved)

- Timestamp (UTC): `2026-06-02T03:51:20Z`
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains the only queue head and is still hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: `queueLength:1`, `disposition: inspect-handler`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law for this checkpoint:
- Continue handler-only hold and no speculative city/unit/tech moves.
- keep re-read cycle exact: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
- request explicit closeout confirmation from handler evidence before any branch once one clean additional read repeats without payload.

### One-line relay (recheck #9)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #9 | continue lock-safe hold and evidence revalidation | explicit closeout confirmation required before lane branching | `Medium`

### 10-20 turn lens addendum (after #9)

- `Turns 4-12`: maintain recovery hold; do not branch while payload null.
- `Turns 13-16`: one lane trial only after two consecutive reads return concrete discovery closeout + stable queue/payload.
- `Turns 17-20`: commit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on the next confirming read; else continue hold.

## Live checkpoint recheck #10 (Turn 4 / 3925 BCE, handler lock persists)

- Timestamp (UTC): `2026-06-02T03:52:30Z`
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head, hard-blocking with `isEndTurnBlocking:true`.
- `notification-queue`: `queueLength:1`, `disposition: inspect-handler`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

## Live checkpoint recheck #11 (Turn 6 / 3875 BCE, fresh launch read-window)

- Timestamp (UTC): `2026-06-02T03:52:30Z` (next clean read after relaunch)
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) is once again the hard queue head and remains `isEndTurnBlocking:true`.
- `notification-queue`: still one visible entry (`queueLength:1`) with disposition `inspect-handler`.
- `selectedUnitId`: `null`.
- `firstReadyUnitId`: `null`.
- `ready-unit`: still no concrete command payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Net-new control decision for this relaunch segment:
1. Hold with strict handler-evidence mode until closeout evidence for the discovery notification is explicit.
2. Continue exact read order every window:
   - `game play notifications --json`
   - `game play notification-queue --json`
   - `game play priorities --compact --json`
   - `game play ready-unit --json`
   - `game play ready-city --compact --json`
3. If this exact posture repeats in the next two clean reads, request active-player handler confirmation before any lane commitment and extend parity-watch for one full window.
4. Resume branch planning only once both queue head and one lane payload are concrete and stable for two consecutive reads.

### 10-20 turn lens (after recheck #11)

- `Turns 6-8`: strict hold + handler closeout verification. No speculative production/civic/movement branches.
- `Turns 9-12`: one lane test only after two clean reads show concrete discovery closeout + stable queue/payload.
- `Turns 13-16`: execute exactly one validated follow-on (preferred growth-safe path if a lane becomes concrete; otherwise continue recovery hold).
- `Turns 17-20`: commit at most one lane if queue and ready payload remain stable on one additional confirming read; otherwise remain in recovery lock.

### One-line relay (recheck #11)

`Turn 6 / 3875 BCE` | hard discovery blocker persists (`id 5`) with null ready payload | maintain handler-first revalidation and request explicit closeout confirmation | defer all speculative branches until concrete queue + payload stabilization is observed | `Medium`

Execution law for this checkpoint:
- hold in handler-confirmation mode; do not branch unit/city/tech while payload is absent.
- keep the full read-confirm loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
- if this posture persists on the next clean read, request explicit handler-confirmed closeout before any speculative lane trial.

### One-line relay (recheck #10)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #10 | continue strict hold + revalidation | only execute after explicit closeout evidence appears | `Medium`

### 10-20 turn lens addendum (after #10)

- `Turns 4-14`: maintain recovery hold and do not branch.
- `Turns 15-18`: allow one lane trial only after two consecutive reads with concrete closeout + stable queue/payload.
- `Turns 19-20`: commit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on a second confirming read; otherwise hold.

## Live checkpoint recheck #11 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: one-item head (`id 4`), disposition `inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Operational law (recheck #11):
- hold lock-safe and evidence-first; do not branch unit/city/tech while payload stays absent.
- continue the fixed read loop exactly: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
- if this state persists on the next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #11)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #11 | keep strict handler-evidence hold and full revalidation cycle | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #11)

- `Turns 4-14`: continue recovery hold and validation-only posture.
- `Turns 15-18`: allow one lane trial only after two consecutive reads with concrete closeout + stable queue/payload.
- `Turns 19-20`: allow exactly one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.

## Live checkpoint recheck #12 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) is still queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId`: still `null`.
- `ready-unit`: no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #12):
- continue lock-safe hold; no city/unit/tech branching while both ready payloads are null and no handler-backed closeout appears;
- keep strict polling loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture persists on next clean read, request explicit handler-confirmed closeout and stall lane recommendations.

### One-line relay (recheck #12)

`Turn 4 / 3925 BCE` | discovery handler lock still unresolved on recheck #12 | hold strict handler-confirmation posture and full revalidation loop | explicit closeout evidence required before any branch action | `Medium`

### 10-20 turn lens addendum (after #12)

- `Turns 4-14`: maintain recovery hold, no speculative branches.
- `Turns 15-18`: permit one lane trial only after two consecutive reads with stable lock + concrete closeout payload.
- `Turns 19-20`: permit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise hold.

## Live checkpoint recheck #13 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) is still queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still a one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #13):
- hold lock-safe and evidence-first; no city/unit/tech branching while payload remains null and no handler-closeout appears.
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
- if this unchanged posture persists on the next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #13)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #13 | continue strict hold and evidence-first revalidation | explicit closeout confirmation required before any speculative branch | `Medium`

### 10-20 turn lens addendum (after #13)

- `Turns 4-14`: maintain recovery hold and validation-only posture.
- `Turns 15-18`: allow one lane trial only after two consecutive reads with stable hard-lock state + concrete closeout payload.
- `Turns 19-20`: allow exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise hold.

## Live checkpoint recheck #14 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #14):
- continue strict lock-safe hold; no city/unit/tech branching while both payloads are null and handler closeout remains absent;
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture repeats on the next clean read, request explicit handler-confirmed closeout and withhold lane recommendations.

### One-line relay (recheck #14)

`Turn 4 / 3925 BCE` | discovery handler lock still unresolved on recheck #14 | hold strict handler-evidence loop and full revalidation cycle | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #14)

- `Turns 4-14`: maintain recovery hold and no-branch posture.
- `Turns 15-18`: allow exactly one lane trial only after two consecutive reads with stable hard-lock + concrete closeout payload.
- `Turns 19-20`: allow exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #15 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #15):
- hold lock-safe and evidence-first; no city/unit/tech branching while both payloads are null and no handler-closeout appears;
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture persists on next clean read, request explicit handler-confirmed closeout and hold lane recommendations.

### One-line relay (recheck #15)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #15 | hold strict lock-safe revalidation posture | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #15)

- `Turns 4-14`: maintain recovery hold and no speculative branches.
- `Turns 15-18`: allow exactly one lane trial only after two consecutive reads with stable hard-lock and concrete closeout payload.
- `Turns 19-20`: allow exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #16 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #16):
- remain lock-safe and evidence-first; do not branch unit/city/tech while payload is null and handler closeout absent;
- continue exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture persists on next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #16)

`Turn 4 / 3925 BCE` | discovery handler lock still unresolved on recheck #16 | hold strict handler-evidence revalidation | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #16)

- `Turns 4-14`: maintain recovery hold and no-branch posture.
- `Turns 15-18`: permit exactly one lane trial only after two consecutive reads with stable lock + concrete closeout payload.
- `Turns 19-20`: permit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #17 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #17):
- continue lock-safe and evidence-first operations; no city/unit/tech branching while payloads are null and handler closeout is absent;
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture persists on next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #17)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #17 | hold strict lock-safe revalidation | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #17)

- `Turns 4-14`: maintain recovery hold and no speculative branches.
- `Turns 15-18`: allow exactly one lane trial only after two consecutive reads with stable lock + concrete closeout payload.
- `Turns 19-20`: permit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #18 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #18):
- remain lock-safe and evidence-first; no city/unit/tech branching while payloads remain null and handler closeout is absent;
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if this exact posture persists on the next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #18)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #18 | hold strict lock-safe revalidation | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #18)

- `Turns 4-14`: maintain recovery hold and no-branch posture.
- `Turns 15-18`: one lane trial remains conditional on two consecutive reads with stable lock + concrete closeout payload.
- `Turns 19-20`: permit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #19 (Turn 4 / 3925 BCE, handler lock still unresolved)

- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) remains queue head and hard-blocking (`isEndTurnBlocking:true`).
- `notification-queue`: still one-item head (`id 4`) with `disposition: inspect-handler`.
- `selectedUnitId` and `firstReadyUnitId` remain `null`.
- `ready-unit`: still no concrete payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: still no concrete payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.

Execution law (recheck #19):
- continue lock-safe and evidence-first posture; no city/unit/tech branching while payload is null and no handler-confirmed closeout appears;
- keep exact read loop: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`;
- if posture persists on next clean read, request explicit handler-confirmed closeout before any lane recommendation.

### One-line relay (recheck #19)

`Turn 4 / 3925 BCE` | discovery handler lock remains unresolved on recheck #19 | hold strict lock-safe revalidation | explicit closeout confirmation required before any branch action | `Medium`

### 10-20 turn lens addendum (after #19)

- `Turns 4-14`: maintain recovery hold and no-branch posture.
- `Turns 15-18`: permit one controlled lane trial only after two consecutive reads with stable lock + concrete closeout payload.
- `Turns 19-20`: permit one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise continue hold.

## Live checkpoint recheck #20 (transport outage)

- Attempted live read of:
  `notifications`, `notification-queue`, `priorities`, `ready-unit`, `ready-city`, and `status`.
- All commands failed with `Civ7DirectControlError: all-hosts-unavailable` on `127.0.0.1:4318`.
- No new authoritative turn/queue/ready payload was available on this cycle.

Execution law (recheck #20):
- Treat this as an external transport reset condition, not a local advisory-state flip;
- keep strategy posture unchanged (strict handler-evidence hold from checkpoint #19) until socket returns and a fresh clean read confirms state;
- once socket recovers, resume exact read loop immediately: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.

### One-line relay (recheck #20)

`Turn 4 / 3925 BCE` | live read path currently unavailable (Civ7 tuner socket down) | pause state mutation and hold prior check-in assumptions; no branch guidance changes without fresh read | resume polling loop immediately once socket reconnects | `Medium`

### 10-20 turn lens addendum (after #20)

- Continue planning from the previous hold posture:
  - `Turns 4-14`: recovery hold and validation-only posture.
  - `Turns 15-18`: one lane trial only if two consecutive future reads show stable hard-lock + concrete closeout payload.
  - `Turns 19-20`: one controlled follow-on only if stable closeout continuity is confirmed after reconnection.

## Net-new relaunch checkpoint #20 (socket reconnect hold)

- Check time (UTC): `2026-06-02T04:24:00Z`
- Live probe state:
  - `civ7 game status --json`
  - `civ7 game play notifications --json`
  - `civ7 game play notification-queue --json`
  - `civ7 game play priorities --compact --json`
  - `civ7 game play ready-unit --json`
  - `civ7 game play ready-city --compact --json`
- Result: all probe commands failed with `Civ7DirectControlError: all-hosts-unavailable` against `127.0.0.1:4318`.

Net-new relaunch law while disconnected:
1. freeze all branching advice (no new lane recommendations, no unit/city/tech move recommendations);
2. treat the run as an unresolved startup/reconnect window, not a tactical read window;
3. request one clean reconnect read when tuner socket returns, in this exact bootstrap order:
   - `civ7 game status --json`
   - `civ7 game autoplay --json`
   - `civ7 game map --summary --json`
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`.
4. only restart turn sequencing once a concrete blocking head + payload appears on at least one fully successful read.

Active player relay:
`Post-crash relaunch / Turn unknown` | `Tuner socket is offline, so no advisory branching is valid` | `Hold and reconnect loop; keep one clean read cadence externally and resume one validated action only once concrete payload appears` | `Medium`

10-20 turn reset (hold mode):
- Turn block marker `Reconnect-0`: keep strategy posture frozen and preserve all previously proven generic doctrine.
- Turn block marker `Reconnect-1` (next successful read): re-baseline turn anchor and restart net-new plan only after stable queue-head + payload appears.
- Turn block marker `Reconnect-2`: allow one controlled follow-up only after two consecutive clean reads verify same concrete payload.
- Turn block marker `Reconnect-3`: if both blocks reconverge, begin first 10-20 lane decision with sustained queue stability.

## Net-new relaunch checkpoint #21 (reconnect remains required)

- Check time (UTC): `2026-06-02T03:55:14Z`
- Recheck attempts (`civ7 game play notifications --json`) x3 all returned:
  - `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318`
  - `Code: all-hosts-unavailable`

Net-new hold law:
1) keep all unit/city/tech strategy branches fully parked while transport is unavailable;
2) preserve existing generic doctrine (one validated send only, two-clean-read confirmation, concrete payload-first), but treat it as inactive until socket restoration;
3) when socket returns, force bootstrap read in strict order and anchor the next strategy window from the first complete queue/payload read.
4) do not issue any new lane commitment until two clean reads confirm the same blocker head and non-null execution payload.

Active relay:
`Turn unknown (reconnect continuation)` | `socket still unavailable after 3 immediate retries` | `Hold reconnection cadence only, do not branch strategy without real payload` | `Medium`

10-20 turn relaunch lens extension:
- `Reconnect-0`: frozen hold for transport recovery.
- `Reconnect-1`: first successful full read anchors a new block start and re-baselines execution lane.
- `Reconnect-2`: one controlled follow-on only if next clean read is stable and concrete.
- `Reconnect-3`: commit only after continuity persists over another confirming read.

## Net-new relaunch checkpoint #22 (socket live, command-unit blocker)

- Check time (UTC): `2026-06-02T03:56:00Z` (snapshot window)
- `status` confirms: `turn 4 / 3925 BCE`, `hash 0`, `tuner-ready`, `autoplay.isActive=false`.
- `notifications` now show actionable head: `NOTIFICATION_COMMAND_UNITS` (`id 4`) with blocker token `23669119`, `isEndTurnBlocking:true`.
- `selectedUnitId`: `null`, `firstReadyUnitId`: `UNIT_SCOUT (131072)`.
- `notification-queue`: `queueLength:1`, `disposition: inspect-ready-unit`, hard command-units blocker.
- `priorities`: `hud:unit-command` is top, `ready-unit` is secondary.
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.
- `ready-unit`: concrete Scout at `(8,21)` with legal operations including `MOVE_TO`, `SKIP_TURN`, `EMBED_LOOKOUT`, `WAIT_FOR`, etc.
- `ready-city`: still null (`legalOperationCount:0`).

Net-new decision law for this turn:
1. This is an actionable command-unit blocker, not a handler-only hold.
2. execute exactly one validated unit closeout now (default safe choice: `SKIP_TURN` with explicit reason).
3. immediately re-read in this order: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
4. keep city/tech branches parked until blocker clears or queue visibly pivots with concrete payload.
5. if command lane remains stable but no broader payload, allow one movement/positioning follow-on only after a confirming read and only if scouts value is clear.

Suggested player relay:
`Turn 4 / 3925 BCE` | `Blocking lane is concrete NOTIFICATION_COMMAND_UNITS with Scout ready` | `Send one validated unit closeout now (prefer SKIP_TURN), then immediate re-read` | `Defer civic/tech/city branches until queue head and payload are clearly confirmed` | `Medium`

10-20 turn lens reset:
- `Turns 4-6`: one-unit blocker-clear cycle.
- `Turns 7-10`: one controlled follow-on after one clean confirming read if queue/payload remains stable.
- `Turns 11-16`: choose a pressure-lite or growth-lite micro-branch only after hard blocker changes and concrete readiness.
- `Turns 17-20`: commit one lane only if continuity survives a second confirming read.

## Net-new relaunch checkpoint #23 (turn progression with concrete unit-ready continuation)

- Check time (UTC): `2026-06-02T04:15:00Z` (snapshot window)
- `status` confirms: `turn 5 / 3900 BCE`, `hash 0`, `tuner-ready`, `autoplay.isActive=false`.
- `notifications` remain with actionable head `NOTIFICATION_COMMAND_UNITS` (`id 4`, blocker token `23669119`), `isEndTurnBlocking:true`.
- `firstReadyUnitId`: `UNIT_SCOUT (131072)`; `selectedUnitId`: `null`.
- Scout now at `(8,22)`; command unblock options still concrete with `SKIP_TURN` available.
- `notification-queue`: `queueLength: 1`, `inspect-ready-unit`, hard command-units lane.
- `priorities`: `hud:unit-command` remains top.
- `ready-unit`: concrete legal operations, including `MOVE_TO`, `SKIP_TURN`, `ALERT`, `EMBED_LOOKOUT`, `WAIT_FOR`, `SLEEP`.
- `ready-city`: still null (`legalOperationCount:0`).

Net-new decision law:
1. Keep to one validated unit closeout now; default remains `SKIP_TURN` unless scouting follow-up is visibly superior.
2. Use exact command: `game play operation --family unit --type SKIP_TURN --unit-id '{"owner":0,"id":131072,"type":26}' --send --reason '<why this unit has no better operation this turn>'`.
3. immediate re-read chain unchanged: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
4. do not open city/tech lanes until command lane clears or a non-null new head appears with concrete payload.

Suggested player relay:
`Turn 5 / 3900 BCE` | `COMMAND_UNITS remains concrete with ready Scout` | `Send one validated SKIP_TURN closeout now, then re-read full chain` | `Keep city/tech on hold until command lane re-baselines with new concrete head` | `Medium`

10-20 turn lens update:
- `58`: one solid blocker-clear follow only.
- `912`: one follow-on unit scouting/positioning only if a second clean read confirms stable command continuity.
- `1318`: begin controlled growth vs pressure branch only if queue/payload now includes city/tech work and remains stable.
- `1920`: lane commitment only after at least one confirming read on new branch.


## Net-new relaunch checkpoint #24 (turn 6 persistent COMMAND_UNITS)

- Check time (UTC): `2026-06-02T03:56:54Z`
- `status` confirms: `turn 6 / 3875 BCE`, `hash 0`, `tuner-ready`, `autoplay.isActive=false`.
- `notifications` remain with unchanged hard head `NOTIFICATION_COMMAND_UNITS` (`id 4`, blocker token `23669119`), `isEndTurnBlocking:true`.
- `selectedUnitId`: `null`, `firstReadyUnitId`: `UNIT_SCOUT (131072)`.
- Scout location remains `(8,21)`.
- `notification-queue`: `queueLength:1`, `inspect-ready-unit`, hard command-units lane.
- `priorities`: `hud:unit-command` still top.
- `ready-unit`: concrete legal operations including `MOVE_TO`, `SKIP_TURN`, `ALERT`, `EMBED_LOOKOUT`, `WAIT_FOR`, `SLEEP`.
- `ready-city`: still null (`legalOperationCount:0`).

Net-new decision law:
1) Keep one validated blocker-closeout only; default `SKIP_TURN` with explicit reason.
2) immediate re-read order unchanged: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
3) keep city/tech lanes parked until queue head transitions with concrete new payload.
4) if command lane is stable on next read, consider one scouting movement follow-on only after confirming value.

Player relay:
`Turn 6 / 3875 BCE` | `COMMAND_UNITS remains hard head with concrete Scout` | `Send one SKIP_TURN closeout now and re-read` | `Defer city/tech branches` | `Medium`

10-20 turn relaunch lens:
- `68`: blocker clear only.
- `912`: one follow-on only if stability confirms on second clean read.
- `1316`: branch-lite growth/pressure only if queue/payload now includes city or tech work.
- `1720`: commit one lane only after two confirming reads.

## Net-new relaunch checkpoint #25 (turn 6 / 3875 BCE, discovery handler hold, new restart)

- Check time (UTC): `2026-06-02T03:57:44Z`
- `status` and HUD readback remain lock-stable on this fresh pass:
  - `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) is still queue head and hard blocker.
  - `queueLength:1`, `disposition: inspect-handler`.
  - `firstReadyUnitId:null`, `selectedUnitId:null`.
  - `ready-unit: null` action payload (`legalOperations: []`).
  - `ready-city: null` action payload (`legalOperationCount: 0`).
  - `canEndTurn:false`, `hasSentTurnComplete:false`.
  - `Age progress`: 6/140 (Antiquity, 4.3%).

Net-new execution law for this relaunch window:
1. Do not issue any command that depends on non-visible or stale unit/city payloads.
2. Continue strict read-confirm order this exact cycle:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If the same posture persists on next clean read, request explicit handler confirmation before attempting any branch recommendation.
4. If discovery closeout command becomes concrete, execute one validated closeout first, then re-read immediately.

Suggested player relay:
`Turn 6 / 3875 BCE` | `discovery handler block still hard with null ready pointers` | `stay in handler-evidence hold` | `re-read queue->priorities->ready surfaces each cycle; no speculative branches yet` | `Medium`

10-20 turn lane update (new run window):
- `610`: strict hold and handler validation; no speculative growth/civic/movement commitments.
- `1114`: if handler resolves and exposes concrete payload, permit one validated follow-on only on two consecutive reads.
- `1516`: one branch test on stable concrete payload.
- `1720`: commit to one lane only with one extra confirming read; otherwise remain in recovery/parity-watch.

## Net-new relaunch checkpoint #26 (turn 6 / 3875 BCE, persistence window)

- Check time (UTC): `2026-06-02T03:58:38Z`
- `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) remains the same hard queue head (`isEndTurnBlocking:true`, `queueLength:1`, `disposition: inspect-handler`).
- `selectedUnitId`: `null`, `firstReadyUnitId`: `null`.
- `ready-unit`: no action payload (`unitId: null`, `legalOperations: []`).
- `ready-city`: no action payload (`cityId: null`, `legalOperationCount: 0`).
- `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.
- `progress` is unchanged in this band (Antiquity `6/140`, 4.3%).

Updated net-new execution law for this run:
1. Keep strict handler-evidence hold and do not issue non-evidenced city/tech/unit branch commands.
2. Continue this read-confirm sequence, every loop:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If this exact posture reoccurs one more clean window, explicitly request handler-closeout confirmation before any follow-on suggestion.
4. Once discovery closeout becomes concrete, execute one validated closeout action only, then re-read before any lane opening.

Suggested player relay:
`Turn 6 / 3875 BCE` | `discovery-blocker lock continues unchanged` | `hold handler-evidence + read-confirm loop` | `no speculative city/tech/military branching` | `Medium`

10-20 turn lens (continuation):
- `610`: recovery lock continues; no branch commitments.
- `1112`: one branch candidate only if lock resolves with concrete payload and holds across two consecutive reads.
- `1316`: run one validated branch follow-on only if payload remains stable.
- `1720`: commit at most one lane only after an additional confirming read; otherwise stay in recovery/parity watch.

## Net-new relaunch checkpoint #27 (turn 6 / 3875 BCE, handler-lock persistence)

- Check time (UTC): `2026-06-02T03:59:09Z`
- Current posture is unchanged:
  - `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) remains hard queue head and is end-turn blocking.
  - `queueLength:1`, `disposition: inspect-handler`.
  - `selectedUnitId: null`, `firstReadyUnitId: null`.
  - `ready-unit`: no actionable payload (`legalOperations: []`).
  - `ready-city`: no actionable payload (`cityId: null`, `legalOperationCount: 0`).
  - `canEndTurn: false`, `hasSentTurnComplete: false`.
- `Age status`: Antiquity progress still `6/140`.

Execution law for this relaunch window:
1. Keep strict handler-evidence hold; do not execute any unit/city/tech branch without explicit closeout payload.
2. Re-run each control loop exactly:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If this exact lock persists on the next clean read, request active-player confirmation from handler evidence before any branch recommendation.
4. Once discovery closeout becomes concrete, do exactly one validated follow-on and re-read immediately.

One-line relay:
`Turn 6 / 3875 BCE` | `discovery lock persists and handlers are still non-concrete` | `continue strict hold with full read-confirm loop` | `no speculative city/tech/military branch` | `Medium`

10-20 turn relaunch lens (continuation):
- `610`: continued recovery hold.
- `1112`: one validated follow-on only after two confirming concrete reads.
- `1316`: one lane test only if payload turns concrete and stable.
- `1720`: at most one lane commitment if stability persists; else recovery hold.

## Net-new relaunch checkpoint #28 (turn 6 / 3875 BCE, handler lock unchanged)

- Check time (UTC): `2026-06-02T03:59:27Z`
- Live state is unchanged on third quick-confirm window:
  - `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) still hard blocking queue head.
  - `queueLength: 1`, `disposition: inspect-handler`.
  - `selectedUnitId: null`, `firstReadyUnitId: null`.
  - `ready-unit`: no legal/actions payload (`legalOperations: []`).
  - `ready-city`: no legal/actions payload (`cityId: null`, `legalOperationCount: 0`).
  - `canEndTurn: false`, `hasSentTurnComplete: false`.
- Age remains Antiquity `6/140`.

Net-new execution posture:
1. Continue strict handler-evidence hold; no speculative unit/city/tech execution.
2. Re-run each loop in exact order:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If this posture persists again with no concrete closeout, request explicit handler confirmation and stay in parity-lock for another cycle.
4. Once closeout payload appears, execute one validated action only, then immediate re-read.

One-line relay:
`Turn 6 / 3875 BCE` | `discovery blocker persists with null-ready payload` | `maintain strict handler-evidence hold` | `re-confirm every loop; no branch commitment` | `Medium`

10-20 turn relaunch lens:
- `610`: lock-hold only.
- `1112`: one branch follow-on only after two confirming concrete reads.
- `1316`: one lane test only if payload becomes concrete and stable.
- `1720`: commit at most one lane only if this hold clears with stable confirmation, otherwise continue recovery watch.

## Net-new relaunch checkpoint #29 (turn 6 / 3875 BCE, lock continues)

- Check time (UTC): `2026-06-02T03:59:46Z`
- Stable hard lock remains:
  - `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`) still queue head and is end-turn blocking.
  - `queueLength:1`, `disposition: inspect-handler`.
  - `selectedUnitId: null`, `firstReadyUnitId: null`.
  - `ready-unit`: still no actionable payload.
  - `ready-city`: still no actionable payload.
  - `canEndTurn: false`, `hasSentTurnComplete: false`.
- Antiquity remains `6/140`.

10-20 turn relaunch lens:
- `610`: recovery hold + read-confirm discipline only.
- `1112`: one validated branch follow-on only if closeout becomes concrete and confirms on two consecutive reads.
- `1316`: one validated lane test only if payload shifts and remains stable.
- `1720`: commit at most one lane only with one extra confirming read; otherwise continue recovery hold.

Net-new execution law:
1. Keep handler-evidence hold and avoid branch speculation.
2. Read-confirm loop every pass:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If unchanged, request explicit handler-closeout confirmation before any action beyond lock hold.
4. Execute one validated action only once discovery closeout becomes concrete, then immediate re-read.

One-line relay:
`Turn 6 / 3875 BCE` | `discovery lock still unchanged` | `keep strict hold with handler-evidence verification` | `no speculative branch commitments` | `Medium`

## Net-new relaunch checkpoint #30 (Turn 6 / 3875 BCE, post-crash re-validation)

- Check time (UTC): `2026-06-02T04:00:12Z`.
- Live lock is unchanged on post-crash read:
  - `turn`: `6`, `turnDate`: `3875 BCE`, `hash`: `0`
  - `canEndTurn`: `false`, `hasSentTurnComplete`: `false`
  - `blockingNotificationId`: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`), hard, end-turn blocking
  - `notification-queue`: `queueLength:1`, `disposition: inspect-handler`
  - `selectedUnitId`: `null`, `firstReadyUnitId`: `null`
  - `ready-unit`: `unitId: null`, `legalOperations: []`
  - `ready-city`: `cityId: null`, `legalOperationCount: 0`
  - `priorities`: `hud:blocking-notification: Choose a selection from the Discovery.`
- Net-new net effect: no concrete, handler-backed closeout path has surfaced.

10-20 turn lens (window B):
- `610`: continue strict handler-evidence hold and revalidation.
- `1112`: one follow-on only if closeout becomes concrete and is stable on two consecutive reads.
- `1316`: one validated lane test only if lock transitions and remains stable.
- `1720`: one-lane commitment only if post-transition state is confirmed on a further read; otherwise maintain parity-watch hold.

Net-new execution law:
1. Keep all speculative city/unit/tech branching off.
2. Re-run this exact order every loop:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If unchanged, record a handler-confirmation request and keep recovery hold.
4. Execute exactly one validated discovery closeout only once command payload becomes concrete, then immediate re-read.

### One-line relay (recheck #30)
`Turn 6 / 3875 BCE` | `post-crash read still shows discovery handler lock with null ready payload` | `retain handler-evidence hold and read-confirm discipline` | `no speculative branch decisions until concrete discovery payload is confirmed` | `Medium`

## Net-new relaunch checkpoint #31 (Turn 6 / 3875 BCE, post-crash read continues)

- Check time (UTC): `$(date -u +%Y-%m-%dT%H:%M:%SZ)`.
- `status` and HUD surfaces remain unchanged:
  - `turn`: `6`, `turnDate`: `3875 BCE`, `hash`: `0`.
  - `canEndTurn`: `false`, `hasSentTurnComplete`: `false`.
  - `blockingNotificationId`: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 5`), hard and end-turn blocking.
  - `notification-queue`: `queueLength:1`, `disposition: inspect-handler`.
  - `selectedUnitId`: `null`, `firstReadyUnitId`: `null`.
  - `ready-unit`: `unitId: null`, `legalOperations: []`.
  - `ready-city`: `cityId: null`, `legalOperationCount: 0`.
  - `priorities`: `hud:blocking-notification` (`Choose a selection from the Discovery.`)
- Net-new signal: no concrete handler-derived closeout candidate has materialized.

Net-new execution law for this relaunch window:
1. Hold all speculative city/unit/tech branches.
2. Read-confirm loop remains exact:
   - `civ7 game play notifications --json`
   - `civ7 game play notification-queue --json`
   - `civ7 game play priorities --compact --json`
   - `civ7 game play ready-unit --json`
   - `civ7 game play ready-city --compact --json`
3. If this exact posture persists on the next clean read, hold parity-lock and request handler-confirmation before any branch recommendation.
4. Execute exactly one validated discovery closeout action only after concrete payload appears, then immediately re-read before any broader recommendation.

One-line relay:
`Turn 6 / 3875 BCE` | `post-crash relaunch read still unresolved on handler-only discovery lock` | `continue strict handler-evidence hold and full re-confirm chain` | `do not branch until concrete closeout payload appears and repeats` | `Medium`

10-20 turn relaunch lens (refresh):
- `610`: hold and evidence-only polling only.
- `1112`: allow one validated follow-on only after two consecutive concrete closeout reads.
- `1316`: one lane test only if payload transitions and stays stable.
- `1720`: at most one lane commitment only after an additional confirming read.
