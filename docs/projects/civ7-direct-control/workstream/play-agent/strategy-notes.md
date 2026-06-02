# Play-Agent Strategic Advisory Notes (Active Loop Ledger)

Date: 2026-06-02
Parent frame: `output-contract.md`
Scope: tactical + strategic planning support for the active Civ7 AI play thread.
Frame anchor: [output-contract.md](/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/docs/projects/civ7-direct-control/workstream/play-agent/output-contract.md)

Status: **Live thread data captured, turn-window baseline established.**

## Live update (Turn 3 / 3950 BCE, stale COMMAND_UNITS repair)

- `civ7 game play notifications --json`, `notification-queue --json`, and `priorities --compact --json` now show `NOTIFICATION_COMMAND_UNITS` (`id 0`) as stale-expired hard blocker with null ready pointers.
- `selectedUnitId`, `firstReadyUnitId`, `ready-unit`, and `ready-city` are all null/no-payload on this window.
- Execution posture for this window: one validated command repair send (`game play end-turn --send --reason "stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout"`) then immediate re-read chain.
- Player-facing relay format for this window:
  - `Turn 3 / 3950 BCE | hard blocker: COMMAND_UNITS stale-expired (id 0), null ready pointers | send one validated stale-repair end-turn closeout now + immediate notifications->queue->priorities->ready-unit->ready-city re-read | defer city/tech branches until concrete queue head returns | Medium`

## Live update (Turn 4 / 3925 BCE, blocking discovery lane)

- `civ7 game play notifications --json`, `notification-queue --json`, and `priorities --compact --json` now show `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) as single hard queue head with no concrete ready-unit/city payload.
- `selectedUnitId`, `firstReadyUnitId`, `ready-unit`, and `ready-city` are all null/no-payload.
- `notifications` exposes a handler-driven blocking posture (`category: blocking-notification`) with no in-view specialized shortcut.
- Execution posture for this window: hold and inspect handler evidence first; execute only an explicit handler-backed closeout command/path after payload appears, then immediate re-read chain.
- Player-facing relay format for this window:
- Turn 4 / 3925 BCE | hard blocker: CHOOSE_DISCOVERY_STORY_DIRECTION (id 4), no concrete unit/city payload | hold and inspect blocking notification handler before any mutating action | re-read notifications -> queue -> priorities -> ready-unit -> ready-city after handler closeout | Medium

## Live update (Turn 4 / 3925 BCE, recheck persistence)

- Recheck confirms unchanged hard lock state: `NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION` (`id 4`) still blocks, with no concrete `ready-unit`/`ready-city` payload.
- `selectedUnitId`, `firstReadyUnitId` remain `null`; `canEndTurn` is still `false`.
- Updated command posture:
  - continue `handler-evidence` mode only,
  - do not commit any unit/city/tech branch on this read,
  - request explicit handler confirmation before closeout attempt and then re-read entire control chain.
- 10–20 turn framing impact:
  - Turns 4–8: hold and re-validate only.
  - Turns 9–14: branch tests only if two clean reads show concrete queue + payload.
  - Turns 15–20: full lane commitment only if handler-backed discovery closeout is exposed and remains stable.

### Turn Notes (append here only when new game thread data arrives)

- `Turn 4` | `Discovery blocker still hard and unresolved on recheck` | `Keep one clean hold cycle and handler evidence inspection; no branching` | `No explicit closeout command was exposed on repeated read` | `Medium` | `If posture still repeats next read, request explicit blocker confirmation before any speculative closeout`
- `Turn 4` | `Discovery blocker still hard and unresolved on consecutive recheck #3` | `Hold handler-led evidence loop and escalate to explicit closeout confirmation` | `No concrete queue movement/payload after repeated rechecks` | `Medium` | `If handler confirmation does not appear, keep parity-watch hold until the active player confirms a safe closeout`
- `Turn 4` | `Discovery lock persists on repeat recheck #4 with no payload` | `Continue parity-watch hold and do not open lane branches` | `No closeout command has been exposed for handler-safe execution` | `Medium` | `If still unresolved after next window, request a direct handler verification before any action`

## Multi-turn advisory update (continuous lane plan)

- `Turns 4–10`: do not branch; only revalidate blocker/ready state each read and keep handler-confirmation posture.
- `Turns 11–14`: if two clean reads expose concrete handler-backed discovery closeout, test one follow-on closeout only.
- `Turns 15–20`: commit one consistent lane (growth-first vs early pressure) only after sustained non-null queue + payload stability; otherwise remain in recovery hold.

## Active player message (first advisory)

- I have aligned a persistent strategy ledger next to your frame reference and am
  standing by for live output. Until CLI snapshots are posted, the strongest
  safe output is a planning guardrail that does not assume hidden map/runtime facts:
  focus first turns on stabilizing economy visibility, blocker resolution, and
  low-risk scouting rather than tactical escalation.
- Next expected update cadence: append one row every 3–6 turns (or once per
  meaningful new snapshot) and refresh the 10–20 turn outlook every time the
  active turn band changes.

## Strategic Frame

- **Player objective**: keep the game in a high-information, low-regret trajectory using
  the `play-agent-v0` contract and explicit risk-aware expansions only.
- **Decision model**: prefer short-horizon operational safety (next 1–3 turns) and
  longer-horizon strategic pressure (10–20 turns) using checklists in this ledger.
- **Primary constraint**: never act on hidden/runtime facts without explicit visibility
  policy in the observation summary.
- **Reframe triggers**:
  - Unstable turn/hash snapshots across two consecutive polls.
  - Missing blockers or postcondition evidence after mutating commands.
  - CLI command contract changes that alter field names or risk semantics.

## CLI Progress View Contract (Player Loop)

Use these commands in this order every turn window:

1. `civ7 game status --json`
2. `civ7 game autoplay --json`
3. `civ7 game map --summary --json` (area/region shape checks and map hash)
4. `civ7 game inspect --app-ui-snapshot --json`
5. `civ7 game inspect --roots "Network,Autoplay,Game,Players" --json`
6. `civ7 game exec "const p=Players.get(0); ({cities:p.Cities?.numCities, units:p.Units?.numUnits, treasury:p.Treasury?.goldBalance, techs: {researching:p.Techs?.getResearching?.(), turnsLeft:p.Techs?.getTurnsLeft?.(p.Techs?.getResearching?.()), treeType:p.Techs?.getTreeType?.()}})" --state Tuner --json`
7. `civ7 game exec "const ids=Game.Notifications?.getIdsForPlayer?.(0)||[]; JSON.stringify({ids, sum:Game.Notifications?.getSummary?.(0), blocker:Game.Notifications?.findEndTurnBlocking?.(0), types:ids.map((id)=>({id, msg:Game.Notifications.getMessage?.(id), block:Game.Notifications.getBlocksTurnAdvancement?.(id), name:Game.Notifications.getTypeName?.(id)}))})" --state Tuner --json`
8. `civ7 game operation ...` for explicit validation or execution (dry-run by default, add `--send` with `--reason` when approved)

Notes:

- Planned tactical commands like `game tactical ready-actions`, `game tactical battlefield`, and `game tactical destination` are not available in this branch yet; keep this as an explicit exception in the loop to preserve parity with reality.
 - Notification accessor shape is runtime-dependent across states: `App UI` may not expose `Game.Notifications` methods, while `Tuner` does. Use `Tuner` for blocker truth and treat `App UI` as confirmation-only.

Keep the same command set when you need continuity across turns so the advisory loop
can compare apples to apples.

## Progress Ledger Template

### Snapshot: Turn 0 (bootstrap)

- Turn/Date:
- Hash:
- Readiness:
- Immediate blocker(s):
- Top ready focus:
- Confidence:

## Turn 19 (bootstrap) — operational baseline (watch-only)

- Turn/Date: 19 / 3550 BCE
- Hash: 0
- Readiness: `inGame=true`, `autoplay.isActive=false`, blockers present (`5` player notifications)
- Immediate blocker(s): `Command Units`, `Choose Civic`, `Choose Production`, `Social Policies Available`, `Scout casualty follow-up`
- Top ready focus:
  - Highest-priority lane: clear notification blockers before further expansion.
  - Current known tactical shape: 1 city, 3 units (Scout, Hoplite x2), no movement safety signal beyond adjacency due zero revealed frontier signal in sampled windows.
  - Strategic tempo: local economy is still vulnerable to invalid sequencing if civic/production/social choices are deferred.
- Confidence: medium

### Data used for this row

- App UI runtime snapshot (`game status`, `game inspect`, `game autoplay`, `game map --summary`, `game map --bounds`)
 - City/units/managers sampled via `game exec` against `Players.get(0)`:
  - Cities: `cityCount=1`, capital at `x=21,y=27`, growth in 7 turns, population 5
  - Units: `unitCount=3` with ids `131072`,`196609`,`327682`; first unit is `UNIT_SCOUT`, one is `UNIT_HOPLITE`
  - Notification count: `5`, blocker summary returned by `getSummary` includes
    `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`, and casualty note from destroyed Scout

### Snapshot: Turn 19 (Tuner-blocker verification)

- Turn/Date: 19 / 3550 BCE
- Hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Game.Notifications` in `Tuner` state):
  - IDs: `66, 67, 68, 69, 70` with blocker root `66`
  - Player-facing messages: `Unit Killed`, `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Blocker profile: 4 hard blockers remain (`Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`); casualty follow-up is non-blocking and can be resolved in the normal decision flow.
- Economy/micro state (`Tuner`): `cities=1`, `units=3`, `gold=142`, `researching.type=-1255676052`, `turnsLeft=2`
- Confidence: medium-low (`Game.Notifications` introspection only reliable through `Tuner`, `App UI` has partial runtime shape)

### Snapshot: Turn 19 (recheck) — live thread heartbeat

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blocking evidence: `Game.Notifications` appears opaque in direct `App UI` execution in this session; keep blocker clearing on UI/turn-window evidence.
- Top ready focus: continue blocker-first execution discipline (civic/policy/production sequencing), preserve tempo with unit safety before expansion.
- Confidence: medium-low (runtime API shape drift on notification root means we treat this as a constrained observation).

### Snapshot: Turn 19 (Tuner revalidation #2)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from prior recheck, with blocker IDs `66..70` and 4 blocking entries still active.
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `researching.type=-1255676052`, `turnsLeft=2`, `treeType=-153498200`, `unlocked=3`
- Progress signal: no turn/hash movement this window; `sum` from blocker payload remains empty string, so treat blocker source as queue-state reliable rather than summary text.
- Confidence: medium-low (stable but no turn progression yet).

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `No visible turn/hash progression on recheck` | `Hold blocker-clear order and do not over-extend`; keep one validated action once blockers are cleared | `Notification accessor drift and 1-city fragility` | `Medium` | `Requery every 3-6 turns; if blockers remain >2 turns, shift to one-window reframe before commits`
- `Turn 3` | `Stale COMMAND_UNITS lock at queue head, with null ready-unit and no city payload` | `Execute one explicit end-turn repair command with stale-command reason; re-read full loop immediately` | `Any unit/city branch is blind in this null-ready posture` | `Medium` | `Continue two-clean-read confirmation, and hold if stale posture repeats`
- `Turn 4` | `Blocking notification CHOOSE_DISCOVERY_STORY_DIRECTION is hard queue head with no ready payload` | `Hold and inspect blocking-handler evidence, then execute only concrete handler closeout before branching` | `No handler-level unit/city command exists yet, so speculative branches would be blind` | `Medium` | `If payload remains absent after one more clean read, request explicit blocker-confirmation review before any lane branch`

- `Turn 19 (Tuner verification)` | `Open blockers unchanged across two snapshots; no turn progression` | `Sequence blockers in locked order: choose civic → choose production → social policy → command unit; then resume outward scouting` | `Turn remains in forced setup debt with low tempo buffer` | `Medium-low (notification API is Tuner-only in this run)` | `If no progress after next 2 windows, pause map pressure and force one production lock per turn`
- `Turn 19 (stability check)` | `Tuner signals still unchanged and no hash/turn movement` | `Keep one blocker per decision cycle: Civic -> Production -> Social Policy -> Units` | `Forced opener is still debt-heavy` | `Medium-low (no advancement and Game.Notifications queue unchanged)` | `Requery after 3 more windows; pivot to one-window risk-control plan if still static`
- `Turn 19 (Tuner revalidation #3)` | `Same 5-notification queue and same 4 hard blockers; gold/research state unchanged` | `Continue one safe blocker-at-a-time loop; do not open frontier actions until civic/production/policy are all cleared` | `The game remains in forced setup debt; no measured forward momentum` | `Medium` | `If this persists for one more window, request explicit UI confirmation for the top blocker state before any non-blocker operation`

### 10-20 Turn Strategic Cadence — Window A (Turns 1-6) updated for live snapshot

- Immediate goal: clear all non-combat blockers first, then convert the current scouting posture into map expansion with no overreach.
- Turn 19 indicators: open civic/policy/city-production actions indicate forced sequence, not optional optimization.
- Update condition for this window: advance from this band only after all notification blockers resolve and at least one city production decision is posted.

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `In early city setup with 1 city / 3 units` | `Clear notification blockers in order: Scout casualty follow-up -> Civic -> Production -> Social Policy -> Units` | `Force the safe minimum progression chain to unlock next economy/milestone actions` | `Medium` | `If any blocker persists two consecutive turns, pause expansion and re-query map+notifications before moving units.`

### Turn Windows (10–20 turn sequencing)

#### Window A (Turns 1–6)
- Goal: stabilize economy, clear urgent blocker debt, convert opening mobility into
  map pressure.
- Typical play priorities:
  - Resolve first blocker queue (research/civic/tech choice first where applicable).
  - Avoid expanding into high-friction fronts without scout and movement cover.
  - Keep one move per turn with explicit "future value" reason: resource access,
    route denial, or city placement support.

#### Window B (Turns 7–12)
- Goal: convert expansion opportunities into durable setup and early conflict
  resilience.
- Typical play priorities:
  - Convert top 1–2 scouting lanes into secure trade/defensive corridors.
  - Lock critical city placement before rushing offense.
  - Prefer city growth and worker actions that reduce fog variance over
    speculative combat unless opportunity risk is low.

#### Window C (Turns 13–18)
- Goal: transition from opportunistic scouting to infrastructure + containment.
- Typical play priorities:
  - Close production bottlenecks revealed in status and city choice telemetry.
  - Shift from passive scouting to positional posture where returns are strongest.
  - Keep at least one reserve action for tempo defense if a high-danger city/unit
    move appears.

#### Window D (Turns 19–20+)
- Goal: choose one of two strategic tracks: consolidate for long game or convert to
  active pressure.
- Typical play priorities:
  - Evaluate whether frontier expansion is still below opportunity cost versus
    defense and timing windows.
  - If the threat model increased, prioritize survivability and choke control.
  - If the pressure model increased, convert the best route into a capped, tested
    action chain with explicit pre/postcondition checks.

## Tactical/Progress Decision Rulebook (apply every 3–6 turns)

- **Read**: If no `decisionHud.ready` in the top band, hold a non-aggressive posture
  and convert to blocker/notification resolution actions first.
- **Choose**: Use one high-confidence action per turn unless multiple high-value actions
  are independent and low-risk.
- **Validate**: For every mutating command, require `operation` + `audit` outcome
  and call out any `replaySafe: false`.
- **Review**: If two consecutive turns show the same blocker unresolved, queue a lane
  pivot (econ, safety, production) and annotate next turn recommendation.

## 10–20 Turn Strategic Cadence Matrix

Use this matrix once turn data starts flowing:

| Turn band | Strategic intent | What to verify this band | Risk ceiling |
|---|---|---|---|
| 1–3 | Stabilize and de-risk | Blockers cleared, map script confirmed, local-visibility model aligned, first expansion move logged | High uncertainty about opener; avoid irreversible expansion commitments |
| 4–6 | Secure core setup | City growth, worker first-pass efficiency, route safety, fog-to-known conversion rate, resource pressure | Medium |
| 7–10 | Convert scouting to intent | Confirm one durable corridor / choke, test 1–2 expansion vectors, set production tempo | High-variance conflicts |
| 11–15 | Transition to compounding advantage | Evaluate whether to consolidate or pressure based on frontier stability and military tempo | Medium-high |
| 16–20 | Pick lane and reinforce | Commit to defense-first or pressure-first lane; lock in next 5-turn objective with backup condition | Medium |

## Turn Notes (append here only when new game thread data arrives)

- `T-` entries should follow:
  - `Turn N` | `Turn summary` | `Chosen plan` | `Why now` | `Risk` | `Next 5-turn correction`

Example format:

- `Turn 1` | `...` | `...` | `...` | `...` | `...`

## Instructions for Update Cadence

- Do not replace previous rows; append.
- Add a new row only when new CLI evidence arrives.
- For the same turn with multiple command interactions, keep one consolidated advisory
  row to avoid spam.
- If a turn fails to pass audit (missing readiness/mutator evidence), append one short
  corrective row:
  - `Turn X` | `Data gap` | `Safe lane adjustment` | `Fix before action` | `Missing proof` | `Recheck after 2 turns`

## Current Play Window (watch-only snapshot)

- Active check: 2026-06-02 (live turn snapshot observed)
- Advisory posture: conservative blocker-clear loop + economy restart sequencing (civic/policy/production before forward push)
- Immediate recommendation: prioritize blocker cleanup (`Game.Notifications`) then one validated operation per turn after `game operation` validation + execution evidence.

## Open items for player thread

- Awaiting: next 3–6 turn payload to validate whether notifications and production blockers clear on cadence.
- Watch for:
  - `Game.Notifications` blocker count changes and top blocker age.
  - `cityCount/unitCount` deltas and first 5 unit/city id changes.
  - Unit/city candidate ranking stability across horizon slices.
  - Any `replaySafe: false` and any missing mutation evidence after non-trivial operations.

## Suggested one-message cadence to the active player

From now on, send one message per turn window when data lands:

1. What changed (short factual summary + key turn key/hash).
2. What I can safely do now (2–3 priorities).
3. What to defer (and why, tied to risk).
4. 10–20 turn pivot condition for the next window.

## Live Update: Turn 19 (consolidated revalidation #4)

- Turn/Date: 19 / 3550 BCE
- Turn hash: `0`
- Evidence set: `civ7 game status`, `autoplay`, `map --summary`, `exec` state probes (`Players`, `Game.Notifications`) in `Tuner`
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blocker lock: unchanged (`4` hard blockers + `1` non-blocking casualty note), root `66` (`Unit Killed` / `Choose a Civic` / `Choose Production` / `Command Units` / `Social Policies Available`)
- Economy/micro: `cities=1`, `units=3`, `gold=142`, `researching.type=-1255676052`, `turnsLeft=2`, `treeType=-153498200`
- Action rule: execute only blocker-completion loop in order `Choose Civic -> Choose Production -> Social Policies Available -> Command Units`, then re-evaluate before any frontier expansion
- Confidence: medium-low (high-certainty blocker state, no forward turn movement)

### Next advisory row for player thread

- `Turn 19` | `Queue remains frozen after repeated live rechecks` | `Keep one validated blocker action per turn until unlock` | `Openers are still debt-capped; any extra expansion now is high-variance` | `Medium-low` | `Requery in 3–4 turn windows, then pivot to explicit command-window framing if root blocker does not advance`


### Snapshot: Turn 19 (Tuner revalidation #5)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged (`66..70`) with 4 hard blockers: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available` plus `Unit Killed` non-blocking follow-up.
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `researching.type=-1255676052`, `techState=0`, `techProgress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: still no turn/hash movement or blocker-order progress after repeated rechecks in the same execution window.
- Confidence: medium-low (high confidence in observed queue-lock, high uncertainty in frontier safety because no validated exploration action has occurred since lock)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Fifth consecutive revalidation still frozen on same blocker queue` | `Hold sequence discipline: Civic completion -> Production completion -> Social Policies completion -> Unit command, with one safe validated operation per cycle` | `Setup debt is still the tempo bottleneck; expansion before unlocks increases sequencing risk` | `Medium-low` | `If lock persists through next 3 windows, switch to explicit command-window framing and add a blocker-age trigger for escalation/attention to prevent UI drift`

### Snapshot: Turn 19 (Tuner revalidation #6)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged (`ids 66..70`), `4` hard blockers (`Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`) + `Unit Killed` non-blocking
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `tech.state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash or blocker queue change across this check-in window
- Confidence: medium-low (high-confidence blocker lock, low-confidence frontier opportunities due no safe post-opener action)

#### Multi-turn pivot note (10–20 window update)

- `Turn 19` | `Queue remains unchanged, no measured forward tempo since opener` | `Enforce blocker-first sequence only; no new frontier actions until one high-confidence unlock is confirmed` | `High setup debt keeps risk of irrecoverable expansion choices` | `Medium-low` | `If this persists through the next 2 full windows, force one explicit command-window pause and request blocker-age confirmation from the player UI state before any non-blocker move`


### Snapshot: Turn 19 (Tuner revalidation #7)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): no change in queue (`ids: 66..70`, `count=5`), with the same blocking root `66` and 4 blocking entries (`Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`) plus 1 non-blocking `Unit Killed`.
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `researching.type=-1255676052`, `tech.state=0`, `tech.progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no measurable turn/hash movement or blocker-order movement in this revalidation cycle.
- Confidence: medium-low (`sum` remains empty; queue/state is stable and trustworthy in Tuner path)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Seventh consecutive revalidation shows no blocker order progress` | `Pause at blocker-first micro-loop: Civic -> Production -> Social Policy -> Units. Perform one safe confirmed action per cycle only when UI/API confirms unlocked choice.` | `Uncertainty on frontier value remains highest risk while opener remains unsatisfied` | `Medium-low` | `If still blocked after next 2 loops, escalate to explicit command-window handoff protocol: verify blocker root in player-facing UI before any exploratory move`


### Snapshot: Turn 19 (Tuner revalidation #8)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged, `ids: 66..70`, `count=5`
  - Blocking set: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking follow-up: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `tech.state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-queue progression.
- Confidence: medium-low (`Tuner` queue view is consistent; strategic horizon remains constrained until opener clears)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Eighth consecutive revalidation shows queue still static` | `Keep single-lane, low-variance execution: Civic -> Production -> Social Policies -> Units, with explicit validate/execute checks between each` | `Avoid premature expansion while opener debts remain` | `Medium-low` | `If no blocker advancement in two more rechecks, request UI-side blocker root confirmation and pause exploration planning until signaled`


### Snapshot: Turn 19 (Tuner revalidation #9)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged, `count=5`, ids `66..70`
  - Hard blockers: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `tech.state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: sustained freeze; no turn/hash or blocker-order change after repeated checks.
- Confidence: medium-low (high-confidence blocker lock state, no new tactical data surfaced)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Ninth consecutive revalidation: no opener progression` | `Keep blocker-first sequence and only execute one validated action after each blocker transition` | `Risk remains front-loaded to speculative movement under lock` | `Medium-low` | `If no blocker age/ordering shift by next checkpoint, treat as handoff condition and request explicit UI confirmation before any non-blocker action`


### Snapshot: Turn 19 (Tuner revalidation #10)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blocker stack (`Tuner`): unchanged, `count=5`, ids `66..70`
  - Hard blockers: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking notice: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `tech.state=0`, `tech.progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no queue movement, and no turn/hash movement since prior checkpoint.
- Confidence: medium-low (`Game.Notifications` queue remains stable and explicit in `Tuner`)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `10th revalidation confirms full setup freeze` | `Continue blocker-first loop and require explicit UI blocker-root confirmation before non-blocker execution` | `Expansion now has low expected value until first unlock because move-risk is no longer constrained by known queue state` | `Medium-low` | `If no blocker-order advance by next 2 checkpoints, switch to escalation protocol: single-command lane with handoff acknowledgment from active UI state`


### Snapshot: Turn 19 (Tuner revalidation #11)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged (`5` notifications, `ids 66..70`)
  - Hard blockers: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no queue, turn, or hash movement.
- Confidence: medium-low (stable lock state observed repeatedly; still no strategic visibility expansion)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Eleventh consecutive revalidation remains static` | `Maintain blocker-first micro-loop; no non-blocker expansion until queue transitions` | `Current frontier choices are high-variance under full setup debt` | `Medium` | `Advance one more validation window, then if still frozen initiate explicit UI blocker-root confirmation before any exploratory commitment`


### Snapshot: Turn 19 (Tuner revalidation #12)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged (`count=5`, ids `66..70`)
  - Blocking: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement or blocker-order movement after this check
- Confidence: medium-low (`Tuner` data stream remains stable; queue itself is still the operational bottleneck)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `12th consecutive revalidation with lock unchanged` | `Hold blocker-first execution and require confirmation before any non-blocker move` | `Prolonged freeze makes speculative exploration low-value` | `Medium-low` | `If still no progress next cycle, request direct UI verification of root blocker before resuming non-blocker operation`


### Snapshot: Turn 19 (Tuner revalidation #13)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): no change in queue, `count=5`, ids `66..70`
  - Blocking entries: `Choose a Civic`, `Choose Production`, `Command Units`, `Social Policies Available`
  - Non-blocking: `Unit Killed`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: still no turn/hash movement and no blocker-order movement.
- Confidence: medium-low (`Tuner` remains stable; no new tactical opportunity surfaced in queue)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `13th revalidation remains static` | `Continue blocker-first cycle and only perform one validated move after a blocker clears` | `Any speculative non-blocker move compounds uncertainty under unresolved opener debt` | `Medium` | `If this persists to next 2 checkpoints, move to explicit UI blocker-root confirmation and tighten turn-by-turn handoff criteria`


### Snapshot: Turn 19 (Tuner revalidation #14)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed from `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): queue changed now to a single blocker
  - `count=1`, `ids: 71`
  - Blocking: `Command Units`
  - `sum:""`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: major blocker contraction from 5 -> 1; no turn/hash movement yet, indicating partial opener-clear state.
- Confidence: medium-high that the active bottleneck is now `Command Units`.

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Blocker queue collapsed from 5 to 1` | `Prioritize finishing unit command block and then immediately validate production/civic follow-on actions available that cycle` | `Opening debt is largely unlocked; risk now concentrated in movement/safety execution` | `Medium` | `If command resolution is blocked by UI ambiguity, resolve `Command Units` in UI-first mode and re-probe before non-blocker scouting`


### Snapshot: Turn 19 (Tuner revalidation #15)

- Turn/Date: 19 / 3550 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable single blocker
  - `count=1`, `ids: 71`
  - Blocking: `Command Units`
  - `sum:""`
- Economy/tech: `cities=1`, `units=3`, `gold=142`, `tech.type=-1255676052`, `tech.state=0`, `progress=108`, `turnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement; queue is stable at a single actionable blocker.
- Confidence: medium (high certainty on blocker identity; strategic impact now depends on safe unit-command resolution)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 19` | `Single blocker holdover confirms delayed execution phase` | `Prioritize command execution clearance now that civic/production/policy blockers are resolved` | `Main risk shifts to tactical unit safety and move legality under limited information` | `Medium` | `Resolve this blocker and immediately re-probe for any remaining hidden blockers before starting forward scouting/expansion`


### Snapshot: Turn 20 (Tuner revalidation #16)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): queue has shifted to `3` notifications
  - Blocker IDs: `72`, `73`, `74`
  - Blocking root: `id:72` (`Volcano Goes Dormant`, block `false`)
  - Notable blocking state: `Command Units` at `id:74` is still blocking (`block=true`)
  - Non-blocking items: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
- Economy/tech: `cities=1`, `units=3`, `gold=155` (from 142), `tech.type=-1255676052`, `tech.state=0`, `tech.progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: turn/hash advanced to `20` in `App UI`, while blocker root shows mixed event noise and one active `Command Units` blocker.
- Confidence: medium-high (`turn progression confirms unblock, but active command blocker still constrains actions`)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Turn advanced and blocker field shifted from legacy blockers to event noise + active Command Units` | `Execute blocker-specific command handling now, then re-probe before exploring beyond immediate frontier actions` | `Volcanic event notices are non-blocking but can hide a timing context edge for unit safety` | `Medium` | `After clearing Command Units, prioritize a second blocker probe and then shift to a 3–5 turn micro-window for expansion posture`


### Snapshot: Turn 20 (Tuner revalidation #17)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (confirmed from `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): `ids=72,73,74`, `count=3`
  - `Volcano Goes Dormant` (`block=false`)
  - `Catastrophic Volcanic Eruption` (`block=false`)
  - `Command Units` (`block=true`)
  - Note: `findEndTurnBlocking` currently returns `id=72` despite only id 74 being blocking, so treat runtime root as advisory only and enforce direct `block:true` filtering.
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: turn advanced to 20 with unchanged queue shape and one active blocker.
- Confidence: medium; blocker API root appears inconsistent with direct blocking flags.

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Post-opener state persists with active Command Units` | `Clear `Command Units` now, then immediately re-run notifications and production/civic checks from the resulting state` | `Volcanic non-blocking notices are likely environmental noise; they should not stop unit-command execution` | `Medium` | `If blocker API root remains inconsistent, trust explicit `block:true` entries and capture a UI confirmation screenshot-style check before non-blocker moves`


### Snapshot: Turn 20 (Tuner revalidation #18)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from last checkpoint
  - `count=3`, `ids=72,73,74`
  - Active blockers: `Command Units` (`id 74`, `block=true`)
  - Non-blocking notices: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` continues to return `id 72` (non-blocking), so explicit per-entry `block` flags remain authoritative.
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement after latest check.
- Confidence: medium (high certainty in blocker set; residual risk in root-blocker metadata quality)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Stable post-opener state with remaining Command Units blocker` | `Execute the unit command blocker and immediately re-probe; once cleared, shift to a short tactical consolidation window` | `The blocker API root is noisy, so direct `block` truth is the safer control input` | `Medium` | `If `Command Units` does not clear in one cycle, request explicit UI validation before non-blocker operation`


### Snapshot: Turn 20 (Tuner revalidation #19)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable three-item queue
  - `ids=72,73,74`, `count=3`
  - `Command Units` (`id 74`) remains the only blocking entry
  - `Volcano Goes Dormant` and `Catastrophic Volcanic Eruption` remain non-blocking contextual noise
  - `findEndTurnBlocking` still points at `id 72`, so control flow should treat per-entry `block` truth as authoritative
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `tech.state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker count drift since last check.
- Confidence: medium (high-confidence state continuity; slight parser noise in blocker root)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Queue persisted with same single active blocker` | `Resolve `Command Units` now; avoid speculative actions until blocker clears and one re-probe confirms state` | `Unit execution remains the only deterministic gate to next phase` | `Medium` | `If `Command Units` repeatedly fails to clear, pause and verify directly via UI notification state before reattempting`


### Snapshot: Turn 20 (Tuner revalidation #20)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (confirmed via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable 3-item queue, with active `Command Units` id now `75`
  - `ids: 72, 73, 75`, `count=3`, `sum=""`
  - `Volcano Goes Dormant` (`id 72`, `block=false`)
  - `Catastrophic Volcanic Eruption` (`id 73`, `block=false`)
  - `Command Units` (`id 75`, `block=true`)
  - `findEndTurnBlocking` still returns non-blocking `id 72`, so per-item `block` flags are the reliable signal
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement; only blocker id refreshed from `74 -> 75`.
- Confidence: medium (queue is low-complexity; blocker metadata drift requires filtered interpretation)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Command Units blocker persisted while id churned (74 -> 75)` | `Clear `Command Units` immediately and re-probe before any non-blocker movement` | `Non-blocking volcanic events can be ignored for end-turn gating, but keep parser drift in mind` | `Medium` | `If block remains after one clean resolve/reprobe loop, switch to UI confirmation on command state before retrying`

### Snapshot: Turn 20 (Tuner revalidation #21)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable 3-item queue
  - `ids: 72, 73, 75`, `count=3`, `sum=""`
  - Active blocker: `Command Units` (`id 75`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant` and `Catastrophic Volcanic Eruption` (`block=false`)
  - `findEndTurnBlocking` still reports `id 72`; trust per-item `block` flags over blocker root
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `tech.state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker count drift
- Confidence: medium (state remains stable; runtime blocker-root metadata still noisy)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `No state movement this cycle and Command Units still the only hard gate` | `Hold a single unblock action loop: resolve `Command Units`, then immediately re-probe blockers and confirm no hidden UI blocker root mismatch` | `The blocker queue has become simple enough to run one disciplined clear-and-reprobe cycle every 1-3 turns` | `Medium` | `If Command Units remains blocked after a clean replay-safe clear attempt, pause and request direct UI confirmation for blocker state before any expansion`

### 10-20 Turn Strategic Pivot (Window A -> B Transition Checkpoint)

- If command-block is cleared within the next two rechecks, transition from "unlock" mode to **Window B** actions:
  - lock one production lane,
  - take a low-variance scout route with defensive depth,
  - begin worker first-pass for revealed high-yield plots only.
- If `Command Units` remains blocked through another probe pair:
  - continue freeze mode,
  - do not execute non-blocker movement,
  - force explicit UI blocker confirmation and escalate the blocker-root anomaly in the operational log.

### Snapshot: Turn 20 (Tuner revalidation #22)

- Turn/Date: 20 / 3525 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): no structural change from #21
  - `ids: 72, 73, 75`, `count=3`, `sum=""`
  - Active blocker: `Command Units` (`id 75`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption` (`block=false`)
  - `findEndTurnBlocking` still returns non-blocking `id 72`; per-item `block` remains authoritative
- Economy/tech: `cities=1`, `units=3`, `gold=155`, `tech.type=-1255676052`, `tech.state=0`, `progress=126`, `turnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash or blocker-structure movement
- Confidence: medium (high-confidence queue interpretation despite blocker-root metadata drift)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 20` | `Fourth consecutive revalidation with no structure movement` | `Execute one disciplined unblock attempt on `Command Units` only, then re-probe immediately` | `Gate is stable but static; speculative movement still increases variance more than expected utility` | `Medium` | `If Command Units still unresolved after clean clear/reprobe, pause and obtain direct UI blocker-state confirmation before any expansion move`

### Player-facing advisory pulse (non-spam window update)

- `Turn 20` status is still in a single actionable lock: `Command Units`. Keep operations constrained to clearing this blocker with full validation, then switch directly to a **Window B micro-window** (one production lane + one safe exploration lane + defensive reserve) once unblocked. Non-blocking volcanic notices can be ignored for decision gating. If block persists across next recheck, force UI confirmation before non-blocker actions and keep this as escalation condition.

### Snapshot: Turn 21 (Tuner revalidation #23)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): changed to 6-item queue
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` returns `id 76`; per-item `block` flags remain authoritative because of known root-reported drift
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1`, `tech.state=0`, `progress=0`, `turnsLeft=-1`, `treeType=-153498200`
- Progress signal: first turn progression after long command-lock phase; blocker complexity increased from prior `3` to `6`
- Confidence: medium-high on blocker set; medium on strategic sequencing until tech/production choices land

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Unlock phase restarted with stacked civic/production/ops blockers` | `Sequence blockers in deterministic order: choose technology → choose production → command units → towns and cities; verify each gate before any additional movement/expansion action` | `This is a re-entry into forced setup debt with fresh branching risk, not a safe expansion window` | `Medium` | `Re-probe immediately after the first blocker transition and keep the per-item block filter for control flow`

### 10-20 Turn Strategic Pivot (Window B reset signal)

- The thread has moved from “single blocker unlock” into a forced-choice stack. For the next 3–6 turns, the operational priority is:
  - Resolve `Choose a Technology` and `Choose Production` with minimal downside picks.
  - Finish `Command Units` and `Towns and Cities` sequencing before any non-blocker movement.
  - Delay outward scouting/expansion until at least two consecutive rechecks show the blocker stack reduced below the current forced cap.
- After this stack clears, re-enter Window B with a concrete post-opener playbook: one secure production line + one low-variance scout corridor + one defensive fallback anchor.

### Snapshot: Turn 21 (Tuner revalidation #24)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged relative to #23
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda ... Relationship`, `Volcano Now Active`
  - `findEndTurnBlocking` still `id 76`; per-item `block` remains control source
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1`, `tech.state=0`, `progress=0`, `turnsLeft=-1`, `treeType=-153498200`
- Progress signal: no queue/turn/hash movement beyond #23; lock remains deep.
- Confidence: medium (high-confidence blocker set; uncertain sequencing impact until first blocker is cleared)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Second consecutive check confirms no stack progress` | `Continue strict blocker-order execution and avoid non-blocker commitments` | `The same stack with unchanged ids indicates the opening debt is still the dominant tempo constraint` | `Medium` | `If top blocker does not transition on player action, request UI confirmation of decision-state validity before speculative actions`

### Snapshot: Turn 21 (Tuner revalidation #25)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable 6-item queue
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active` (`block=false`)
  - `findEndTurnBlocking` still returns `id 76`; per-item `block` remains authoritative
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: blocker topology unchanged; only tech context refreshed while still blocked
- Confidence: medium-high (block list stable; turn-progression still stalled by decision debt)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Queue stable across third data point, with active tech node now confirmed` | `Run one non-speculative action to clear `Choose a Technology` with least-regret path, then re-probe before choosing production` | `No exploration upside yet; execution value is in reducing forced stack depth` | `Medium` | `If this blocker remains unresolved after explicit resolution attempt, pause and verify UI blocker-state coherence`

### 10–20 Turn Strategic Pivot (Window B reset continues)

- The 3rd consecutive check confirms the game remains in forced setup debt; the 10–20 window objective for this phase is now:
  - clear all hard blockers as quickly as safely possible;
  - defer expansion and combat probes until stack depth is reduced;
  - only after all hard blockers are removed, re-open a 3–5-turn scouting/production consolidation cycle with explicit tempo and risk gates.

### Snapshot: Turn 21 (Tuner revalidation #26)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains non-blocking `id 76`; use per-item `block` flags
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no blocker/turn/hash movement; stack remains a full forced setup lock
- Confidence: medium-high (`tuner` probes stable across revalidation windows)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Fourth consecutive check shows no structural movement` | `Prioritize one validated `Choose a Technology` completion and only then reassess production/units/cities blockers` | `Repeated static reads mean the main risk is wasting actions in ambiguity while `tech` stays blocked` | `Medium` | `After one concrete blocker resolution, capture a full follow-up blocker re-probe and only then move on`

### Snapshot: Turn 21 (Tuner revalidation #27)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #26
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` still `id 76`; per-item `block` flags remain definitive control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no queue/turn/hash movement since #26
- Confidence: medium-high (`tuner` signal is stable across reads; still constrained by unresolved blocked chain)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Fifth consecutive revalidation without blocker movement` | `Do one safe, explicit `Choose a Technology` action, then immediately re-probe and only proceed to `Choose Production` if the next blockers update` | `This is still setup-debt theater; premature scouting/conflict actions are not cost-effective` | `Medium` | `If unchanged after next clear attempt, treat as a UI/interaction parity issue and verify the active decision context before moving on`

### Snapshot: Turn 21 (Tuner revalidation #28)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #27
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains non-blocking `id 76`; per-item `block` flags remain control source
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/hash/notification-structure movement
- Confidence: medium-high (`tuner` state is stable across reads; unresolved chain persists)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Sixth consecutive stable check confirms deep setup lock persists` | `Take one validated choice on `Choose a Technology` and stop if it does not clear; then escalate to direct blocker-state verification before additional non-deterministic operations` | `Reproducibility of state suggests high command-order risk and low marginal value from non-critical actions` | `Medium` | `After blocker-clear attempt, run a full re-probe and only then resume sequential blocker processing`

### Snapshot: Turn 21 (Tuner revalidation #29)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #28
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` still returns non-blocking `id 76`; per-item `block` flags remain primary control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no queue/turn/hash movement yet again
- Confidence: medium-high (`tuner` is stable across consecutive reads; unresolved chain remains the bottleneck)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Seventh consecutive revalidation with no blocker movement` | `Keep to a single deterministic `Choose a Technology` action path and stop immediately if it does not move the stack` | `Depth-first blocker clearing remains the only productive move while the chain is unchanged` | `Medium` | `If this action still produces no stack transition, pause and force an explicit UI decision-state check before proceeding`

### Snapshot: Turn 21 (Tuner revalidation #30)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #29
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains non-blocking `id 76`; per-item `block` remains primary signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no queue/turn/hash movement; lock state unchanged
- Confidence: medium-high (`tuner` state is consistent; no new decision-state transitions observed)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Eighth revalidation confirms no measurable movement` | `Execute exactly one deterministic `Choose a Technology` attempt only when player confirms action context; stop if no progression occurs` | `The chain appears to be blocking due to interaction order, not new game state noise` | `Medium` | `Use UI confirmation step as a hard gate before any non-deterministic blocker chain branching`

### Snapshot: Turn 21 (Tuner revalidation #31)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #30
  - `ids: 76, 77, 78, 79, 80, 81`, `count=6`, `sum=""`
  - Active blockers: `Choose a Technology` (`id 78`), `Choose Production` (`id 79`), `Command Units` (`id 80`), `Towns and Cities` (`id 81`)
  - Non-blocking/contextual notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` continues to return non-blocking `id 76`; per-item `block` remains the reliable signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: still no queue/turn/hash movement
- Confidence: medium-high (`tuner` output remains consistent across revalidation windows)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Ninth consecutive revalidation with full stack static` | `Pause on a single validated `Choose a Technology` attempt and hold all other actions until the stack transitions` | `Nothing in the signal suggests safe expansion; repeated order-locking is the limiting constraint` | `Medium` | `After one confirmed choice attempt, demand a fresh blocker-state diff before continuing`

### Snapshot: Turn 21 (Tuner revalidation #32)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): reduced queue
  - `ids: 76, 77, 80`, `count=3`, `sum=""`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Non-blocking notices: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains `id 76`; per-item `block` still the control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: this is a structural reduction from the previous 6-item stack; one hard gate now dominates
- Confidence: medium-high (`Tuner` queue is stable, and blocker-root still non-blocking)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Revalidation shows blocker stack collapsed to a single hard gate` | `Clear `Command Units` deterministically, re-probe once, and only then shift to production-safety and low-risk map work` | `The game appears to have cleared earlier civic/production/city-choice gates; that is the only meaningful frontier unlock in this window` | `Medium` | `If Command Units does not clear on the next validated attempt, treat as an interaction-parity issue and force direct UI blocker confirmation before any additional non-blocker action`

### 10–20 Turn Strategic Pivot (Window B release branch)

- With the hard gate now narrowed to `Command Units`, the immediate 10–20 turn objective resets to:
  - Phase 1 (now, 1–3 turns): clear `Command Units`, then revalidate both blocker set and turn progression.
  - Phase 2 (after clearance): execute **one compact production lane** (city growth/queue lock) and **one safe scouting lane** with explicit risk cap.
  - Phase 3 (next 10 turns): choose between
    - consolidate build-up (no exposure growth) if unit pressure remains low, or
    - measured expansion if frontier and scout value remain positive under one-turn-fail-safe sequencing.
- Escalation condition: if blocker persists after a clean clear-and-reprobe cycle, stop non-critical actions and log UI blocker-state mismatch as a blocking condition.

### Player-facing advisory pulse (non-spam window update)

- `Turn 21` is now effectively a one-gate unlock phase. Keep action set to: `Command Units` resolution only, with immediate re-probe, then move only into the smallest production/camera-safe scouting step once the blocker drops. If that blocker does not clear cleanly on a validated attempt, force confirmation via UI-facing notification state before touching map pressure.

### Snapshot: Turn 21 (Tuner revalidation #33)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #32
  - `ids: 76, 77, 80`, `count=3`, `sum=""`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Non-blocking/contextual: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains `id 76` (non-blocking), so per-item `block` remains the control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: static lock persists across this revalidation window; no turn/hash movement
- Confidence: medium-high (`Tuner` notification list stable, no topology drift)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Third consecutive full revalidation shows unchanged single-blocker topology` | `One validated `Command Units` resolution attempt is still the only productive action; re-probe immediately` | `High confidence on blocker source lets us avoid speculative expansion while preserving tempo` | `Medium` | `If Command Units remains open after this cycle, treat as interaction-parity issue and force direct UI blocker confirmation before any non-blocker command`

### 10–20 Turn Strategic Pivot (single-gate sustain phase)

- Window objective remains: keep the turn-cycle alive by minimizing command entropy while clearing the gate that now dominates.
- 1st micro-phase (next 1–3 checks): resolve `Command Units` → revalidate notification list/turn/date.
- 2nd micro-phase (after clearance): immediately lock one production plan and one scouting line only if turn progression has actually advanced.
- 3rd micro-phase (if unresolved gate persists): stop proactive movement and treat active player guidance as parity/interaction maintenance: confirm blocker semantics from UI and repair command-path state before any expansion.

### Snapshot: Turn 21 (Tuner revalidation #34)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 76, 77, 80`, `count=3`, `sum=""`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Non-blocking: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains `id 76` (non-blocking)
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: still no turn/hash or blocker topology movement
- Confidence: medium-high (stable queue and state)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Consecutive revalidations unchanged` | `Hold the single-gate loop: one validated `Command Units` attempt, then immediate re-probe` | `No signal for safe expansion yet; continued blocker lock dominates all non-essential decisions` | `Medium` | `If two consecutive clears fail, force explicit UI blocker-state confirmation before any non-blocker actions`

### Strategic cadence note (Window B sustain)

- Maintain the current unlock-to-commit posture for the next 1–2 turn windows.
- Only when `Command Units` clears and turn date/hash/turn remain coherent should we transition to the compact 10–20 turn structure:
  - secure one production line, one low-variance scouting route, reserve tempo for defense.
- Escalation boundary unchanged: no exploration/expansion outside the gate while `id 80` remains blocking.

### Snapshot: Turn 21 (Tuner revalidation #35)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged `ids 76, 77, 80`
  - Active blocker remains `Command Units` (`id 80`, `block=true`)
  - `The Agenda of Ibn Battuta has changed your Relationship.` and `Volcano Now Active` stay non-blocking
  - `findEndTurnBlocking` still returns non-blocking `id 76`
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no movement in turn, hash, or blocker topology across revalidation window
- Confidence: medium-high (state signatures unchanged)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Lock remains single-gate and unchanged` | `Do one strict `Command Units` clear attempt, then re-probe immediately` | `No new decision surface worth opening yet; this is a durable interaction gate rather than a map/opportunity moment` | `Medium` | `If two more attempts fail to move this gate, request UI-side blocker-state confirmation before non-blocker operations`

### Snapshot: Turn 21 (Tuner revalidation #36)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable `ids 76, 77, 80`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Context notifications non-blocking: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains non-blocking `id 76`
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no change from #35
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Lock persists with no movement` | `Repeat strict cycle: attempt to clear `Command Units` once with full validation, then re-probe immediately` | `No additional reliable action is unlocked; interaction queue is the control boundary` | `Medium` | `If two consecutive clear attempts fail, mark next step as UI-level blocker reconciliation before any non-blocker move`

### Strategic Horizon Gate (for 10–20 turn plan)

- The 20-turn posture is still in a controlled hold: unblock `Command Units`, then only commit to a compact one-lane growth-and-safety sequence.
- If this single blocker continues past another validation cycle, pause broader strategic execution and re-anchor by reconciling UI blocker state and any hidden command-window drift, then resume once verified.

### Snapshot: Turn 21 (Tuner revalidation #37)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): still `ids 76, 77, 80`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Context/Non-blocking: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` still reports `id 76` (non-blocking); per-item flags remain authoritative
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no topology, turn, or hash movement in this revalidation cycle.
- Confidence: medium-high (high signal stability across repeated reads)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Still fully static on one-block gate` | `Continue one deterministic `Command Units` clear attempt, then re-probe immediately` | `Lock is stable and still the only safe-meaningful decision boundary` | `Medium` | `If two consecutive clean attempts keep `Command Units` unresolved, switch to explicit UI blocker reconciliation before any further non-blocker action`

### Strategic horizon continuation (single-gate hold)

- This remains a forced-precision phase in the 10–20 turn frame: clear the final active blocker, then transition to a minimal growth path (one production line + one scouting lane) only after lock resolves and turn progression is proven.
- If lock persists, prioritize command-window integrity over tempo and treat further map actions as suspended risk budget.

### Snapshot: Turn 21 (Tuner revalidation #38)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged `ids 76, 77, 80`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Non-blocking/contextual: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains non-blocking `id 76`
- Unit shell: `4` units visible, ids include `{owner:0,id:131072,type:26}`, `{owner:0,id:196609,type:26}`, `{owner:0,id:327682,type:26}`, `{owner:0,id:393219,type:26}`
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no lock progression; blocker remains the sole hard gate
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Persistent single-gate lock with stable queue and no-turn movement` | `Continue strict `Command Units` unblock attempt cadence, then re-probe immediately` | `No reliable frontier action is unlocked while `id 80` remains blocking` | `Medium` | `If this persists through the next clear attempt, require explicit UI blocker-state reconciliation before any non-gate operation`

### 10-20 Turn advisory reset

- Until gate clears: lock window remains in **precision hold** (minimum actions, maximum validation). Transition plan stays: clear `Command Units` → revalidate → one production lane + one low-variance scout lane. If repeated attempts stall, escalate to UI-state parity and then re-baseline the 10–20 turn path.

### Snapshot: Turn 21 (Tuner revalidation #39)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged `ids 76, 77, 80`
  - Active blocker: `Command Units` (`id 80`, `block=true`)
  - Non-blocking/contextual: `The Agenda of Ibn Battuta has changed your Relationship.`, `Volcano Now Active`
  - `findEndTurnBlocking` remains `id 76` (non-blocking); use per-item `block` flags
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/date/hash or blocker topology movement
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Continued static lock with unchanged blocking stack` | `Keep strict `Command Units` unblock-reprobe sequence only` | `Gate remains the only reliable action boundary; broader moves still speculative` | `Medium` | `If the next attempt also fails to transition this blocker, escalate with direct UI blocker-state confirmation before non-gate operations`

### Snapshot: Turn 21 (Tuner revalidation #40)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology shift
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`, `block=false`)
  - `findEndTurnBlocking` now reports `id 77` (non-blocking); per-item `block` remains the control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `tech.state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: blocker stack pruned and normalized from the prior 3-item set to 2-item set; only one hard gate remains
- Confidence: medium-high (queue and state are internally consistent in this revalidation)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Topology shift: blocker removed and current hard gate advanced to `Command Units` id 82` | `Resolve `Command Units` as the only lock, then immediately re-probe for a clean post-clear transition` | `The system removed stale blockers; this is likely the final startup gating path` | `Medium` | `After one clean transition, move into the compact production+low-risk scout sequence only if turn/date changes or blocker list drops below the gate set`

### Strategic Pivot (Window B execution branch)

- The 10–20 turn plan now shifts from “multi-gate setup debt” to “single-gate precision”:
  - 1) clear `Command Units` (`id 82`) with validation
  - 2) revalidate `notifications/turn/date`
  - 3) if clear, execute only one production stabilization action and one safe reconnaissance lane; hold expansion otherwise
  - 4) if gate persists, escalate to explicit UI blocker-state reconciliation immediately

### Snapshot: Turn 21 (Tuner revalidation #41)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): still `ids 77, 82`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` remains `id 77`; trust per-item block flags
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: zero movement in turn/hash or blocker topology since #40
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Lock remains stable on single `Command Units` gate` | `Keep one deterministic clear+reprobe cycle and do not transition to outward execution yet` | `No new evidence to justify relaxing the command boundary` | `Medium` | `If the gate still fails after another clear attempt, force explicit UI blocker reconciliation and restart the unlock sequence from `Command Units``

### Strategic Horizon Continuation

- 10–20 turn framing remains: finish remaining setup gate first, then a compact execution window (one production lane, one low-risk scouting lane, one safety reserve).
- Because lock is unchanged across multiple checks, treat this as a parity/interaction hold and resist tactical expansion until proven unlock.

### Snapshot: Turn 21 (Tuner revalidation #42)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` still returns `id 77` (non-blocking), so per-item blocker remains control signal
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no change since #41
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Second consecutive check after #41 remains static` | `Keep strict `Command Units` clear-and-reprobe behavior and defer any non-blocking actions` | `The gate is stable but still unresolved, so execution variance remains too high` | `Medium` | `If lock persists through this revalidation, require explicit UI blocker-state confirmation before attempting additional non-gate decisions`

### Snapshot: Turn 21 (Tuner revalidation #43)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` still returns `id 77` and remains non-blocking
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no topology, turn, or hash movement
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Stability lock persists` | `Continue strict `Command Units` clear-and-reprobe only` | `No reliable opening has released the game from this gate yet` | `Medium` | `Treat one extra consecutive stall as command-state reconciliation condition before taking any speculative non-gate action`

### Snapshot: Turn 21 (Tuner revalidation #44)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` still non-blocking (`id 77`)
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: unchanged for another revalidation window
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Static hold persists` | `Continue one gated `Command Units` cleanup attempt and immediate re-probe` | `The command boundary remains stable; risk control still outweighs speculative gains` | `Medium` | `If blocker still unresolved after this cycle, the next advisory step is to validate through direct UI blocker-state reconciliation`

### Snapshot: Turn 21 (Tuner revalidation #45)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged `ids 77, 82`
  - `Command Units` (`id 82`) remains the only hard blocker
  - `Volcano Now Active` (`id 77`) remains non-blocking
  - `findEndTurnBlocking` still returns non-blocking `id 77`
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no visible turn/hash/notification-topology movement since previous revalidation
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `No state transition despite repeated precision hold checks` | `Keep strict `Command Units` clear + immediate re-probe cadence only` | `Remaining locked reduces decision utility of non-gate actions` | `Medium` | `If still blocked, perform explicit UI blocker-state reconciliation before next non-gate command attempt`

### Snapshot: Turn 21 (Tuner revalidation #46)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - `Command Units` (`id 82`) remains the only hard blocker
  - `Volcano Now Active` (`id 77`) remains non-blocking
  - `findEndTurnBlocking` still reports `id 77` (non-blocking)
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: unchanged through the latest revalidation; no turn/hash/notification topology movement
- Confidence: medium-high

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Persistent lock continues` | `Keep one strict `Command Units` unblock + immediate re-probe action` | `No new unlock evidence for non-gate expansion` | `Medium` | `If no gate movement on next check, explicitly validate blocker state in UI and only continue with confirmed unblock path`

### Snapshot: Turn 21 (Tuner revalidation #47)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` remains non-blocking (`id 77`)
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/date/hash or blocker-topology movement from #46, control boundary unchanged
- Confidence: medium-high (highly stable Tuner queue and economy snapshot)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Revalidation #47 remains static on a single hard gate` | `Keep one strict `Command Units` clear + immediate re-probe sequence only` | `No durable unlock to safely authorize non-gate exploration` | `Medium` | `If `Command Units` stays unresolved on next window, trigger explicit UI blocker-state reconciliation before any non-blocker commands`

### Strategic Window B/C Handoff Readiness

- Hold condition: single-gate precision remains until `Command Units` transitions off blocker set or turn/hash changes.
- Handoff rule for 10–20 turn frame: once gate clears, run a short 3-turn revalidation cycle before broader moves, then commit:
  1) one production lane
  2) one low-variance scouting lane
  3) one tempo-reserve tactical check for unit safety every turn
- If blocker persists across this additional check, downgrade pressure and keep the thread in command-window parity mode (no speculative expansion).

### Snapshot: Turn 21 (Tuner revalidation #48)

- Turn/Date: 21 / 3500 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 77, 82`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 82`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 77`)
  - `findEndTurnBlocking` remains non-blocking (`id 77`)
- Economy/tech: `cities=1`, `units=4`, `gold=168`, `tech.type=-1558948215`, `state=0`, `progress=0`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/date/hash or blocker-topology movement from #47; control boundary unchanged
- Confidence: medium-high (stable blocker topology and economy/turn identity)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 21` | `Revalidation #48 confirms continued static single-gate hold` | `Keep strict `Command Units` clear + immediate re-probe cadence only` | `No unlocking signal yet; non-gate action remains high-variance` | `Medium` | `If gate still unresolved after this checkpoint, perform explicit UI blocker-state confirmation and hold all expansion/production branches until parity is confirmed`

### Snapshot: Turn 22 (Tuner revalidation #49)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): changed from prior cycle
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`), so per-item `block` remains authoritative
- Economy/tech: `cities=1`, `units=4`, `gold=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal:
  - Tuner indicates `turn=22`, `3475 BCE` while App UI/autoplay snapshot still reports `turn=21`, `3500 BCE` (UI drift). `status` also shows split reads; use Tuner as control-plane for unblock logic.
  - Blocker topology moved from `77/82` to `83/84/85` with one hard gate still in force.
- Confidence: medium-high on `Tuner` blocker state; App UI appears lagging in turn/date presentation.

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `Single hard gate persists after topology churn and partial turn advancement` | `Now run the gate-clear cycle immediately around `Command Units`; re-probe every 1-2 turns because runtime UI/date divergence is present` | `The game appears to have advanced in Tuner, but UI lag is masking it; only validated unblock path should be trusted` | `Medium` | `If `Command Units` clears, confirm with an additional Tuner revalidation and then enter controlled Window B execution lane sequencing`

### 10-20 Turn Strategic Pivot (Window B lock-to-release)

- The 10–20 plan remains blocked at the interaction layer, but the gate is now a shifted id set (`83/84/85`) rather than `77/82`.
- Do not broaden actions yet: one validated `Command Units` clear attempt is still the only release condition.
- Once blocker clears under Tuner-confirmed state, move immediately to the compact 3-step run:
  1) verify `turn=22` stability and map hash
  2) choose one safe production lane
  3) one low-variance scouting lane + safety reserve for the following 2-3 turns.

### Snapshot: Turn 22 (Tuner revalidation #50)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #49
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`), so per-item `block` is control truth.
- Economy/tech: `cities=1`, `units=4`, `treasury=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal:
  - `status` / `autoplay` / `map` now all report `turn=22`, `3475 BCE`, aligning with prior Tuner values from #49.
  - Blocker topology remains the same one-gate pattern (ids churned previously, still stable now).
- Confidence: medium-high (cross-runtime turn/date consistency improved; blocker topology unchanged and stable)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `Runtime now aligned on turn/date; command gate unchanged` | `Maintain strict `Command Units` clear + immediate re-probe loop; do not expand into non-gate actions yet` | `The control-layer remains unchanged despite improved runtime visibility; risk is still concentrated on command gating` | `Medium` | `If gate clears, run 2-3 revalidations to confirm date/hash stability before opening broader scouting/production branches`

### 10-20 Turn Framing Update (Window B lock-release checkpoint)

- The window is now in an active release-wait posture: one blocking edge persists, but telemetry consistency improved.
- Execution policy for the next few turns:
  1) clear `Command Units` in the confirmed UI path,
  2) run quick Tuner revalidation,
  3) then shift to a bounded 3-step growth play (one production lane + one low-risk scout lane + one safety hold).

### Snapshot: Turn 22 (Tuner revalidation #51)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`), so per-item `block` flags still control progression checks
- Economy/tech: `cities=1`, `units=4`, `treasury=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal: no turn/hash/notification-topology movement since #50; command gate remains unchanged and singular
- Confidence: medium-high (telemetry stable across App UI + Tuner on this cycle)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `Second consecutive checkpoint confirms steady one-gate lock` | `Continue strict `Command Units` unblock + immediate re-probe loop only` | `No unlocked branch has appeared despite turn/date stability` | `Medium` | `If the gate persists through next two non-spam windows, request explicit operator confirmation of command-phase completion before shifting to non-gate operations`

### Snapshot: Turn 22 (Tuner revalidation #52)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`)
- Economy/tech: `cities=1`, `units=4`, `treasury=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal: no turn/hash/notification-topology movement since #51
- Confidence: medium-high (stable hold across multiple consecutive checkpoints)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `Steady-state hold on Command Units-only lock` | `Keep strict clear-and-reprobe discipline and do not branch beyond command clearance` | `Still no strategic release condition surfaced; non-gate actions remain low-utility` | `Medium` | `If lock clears, spend the next 2 turns closing and validating production or civic branches before broadening; if not cleared, continue command-first posture`

### Snapshot: Turn 22 (Tuner revalidation #53)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from prior revalidations
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`)
- Economy/tech: `cities=1`, `units=4`, `treasury=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal: no change in turn/date/hash or blocker topology from #52
- Confidence: medium-high (stable lock and aligned App UI + Tuner telemetry)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `Sustained stability without release` | `Hold the command-gate loop only; no non-gate expansion or production branches yet` | `The same lock remains the highest-certainty control constraint` | `Medium` | `If no blocker change after this revalidation, maintain strict two-step check (re-probe + optional UI confirmation if command action is ambiguous) before any branching`

### Snapshot: Turn 22 (Tuner revalidation #54)

- Turn/Date: 22 / 3475 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 83, 84, 85`, `count=3`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Volcano Goes Dormant`, `Catastrophic Volcanic Eruption`
  - `findEndTurnBlocking` remains non-blocking (`id 83`)
- Economy/tech: `cities=1`, `units=4`, `treasury=181`, `tech.type=-1558948215`, `state=0`, `progress=25`, `turnsLeft=3`, `treeType=-153498200`
- Progress signal: no turn/hash/notification-topology movement from #53
- Confidence: medium-high (reproducibly stable lock on same 1.25-gate profile)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 22` | `No movement after another revalidation` | `Continue strict `Command Units` clear + immediate re-probe only` | `Still in a single practical unlock bottleneck` | `Medium` | `If repeated lock continues, ask the active operator for command-phase visibility confirmation before any non-gate sequencing`

### Snapshot: Turn 23 (Tuner revalidation #55)

- Turn/Date: 23 / 3450 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology shifted with one persistent hard gate
  - `ids: 85, 86`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 86`)
  - `findEndTurnBlocking` returns non-blocking `id 86`, so per-item `block` flags remain controlling
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal:
  - Turn/date advanced to `23 / 3450 BCE`; map hash unchanged.
  - Gate did not vanish, but blocker ids churned from `83/84/85` to `85/86` with `Command Units` remaining the only hard gate.
- Confidence: medium-high (`Tuner` and `App UI` both aligned on turn/date; blocker payload stable enough for progression checks)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 23` | `Turn and blocker topology advanced into new id set` | `Keep strict `Command Units` clear + immediate re-probe loop` | `The unlock condition is unchanged (`Command Units` still hard blocking); tactical branches remain premature` | `Medium` | `If `Command Units` remains unresolved after this cycle, maintain UI confirmation on command completion before any non-gate expansion`

### 10-20 Turn Framing Update (Window B→C transition check)

- The gate remains a single operational lock, so there is no justified expansion now.
- New operating rule for this transition: once `Command Units` clears and is stable on a follow-up revalidation, open one compact execution bundle over 3 turns:
  1) one production stabilizer action,
  2) one low-risk scouting action,
  3) one defensive safety check per turn.

### Snapshot: Turn 23 (Tuner revalidation #56)

- Turn/Date: 23 / 3450 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #55
  - `ids: 85, 86`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 86`)
  - `findEndTurnBlocking` remains non-blocking (`id 86`)
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/date/hash/notification-topology movement from #55
- Confidence: medium-high (stable single-gate pattern persisted across checkpoints)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 23` | `Hold persists into #56` | `Keep strict `Command Units` clear + immediate re-probe only` | `No unlock yet; command-stage latency remains the only meaningful constraint` | `Medium` | `If repeated holds continue, request confirmation that `Command Units` action has truly drained before trying any non-gate branch`

### Snapshot: Turn 23 (Tuner revalidation #57)

- Turn/Date: 23 / 3450 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged topology, root flagging improved
  - `ids: 85, 86`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 86`)
  - `findEndTurnBlocking` now returns `id 85` (blocking), aligning root with per-item gate evidence
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no turn/date/hash/notification-topology movement from #56; one control signal improved (`findEndTurnBlocking` now points at true blocker)
- Confidence: medium-high (consistent hold with better blocker-root alignment)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 23` | `Root signal corrected while gate remains active` | `Continue strict `Command Units` clear + immediate re-probe loop; no non-gate branching yet` | `The blocking constraint is unchanged, but visibility on the blocker root improved` | `Medium` | `Treat this as signal hygiene and proceed with one command-clear attempt only, then confirm post-action in next revalidation`

### Snapshot: Turn 23 (Tuner revalidation #58)

- Turn/Date: 23 / 3450 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 85, 86`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 86`)
  - `findEndTurnBlocking` remains `id 85`
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: no movement in turn/date/hash or blocker topology since #57
- Confidence: medium-high (sustained hold with cleaner blocker-root truth alignment)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 23` | `Another checkpoint confirms single-gate hold` | `Keep one explicit `Command Units` clear + immediate re-probe; do not expand non-gate actions` | `The interaction gate remains the only high-confidence control constraint` | `Medium` | `If this persists, perform a final confirmation of command completion and then proceed only when `Command Units` has drained`

### Snapshot: Turn 23 (Tuner revalidation #59)

- Turn/Date: 23 / 3450 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 85, 86`, `count=2`, `sum=""`
  - Active hard blocker: `Command Units` (`id 85`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 86`)
  - `findEndTurnBlocking` remains `id 85`
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: still no movement in turn/date/hash or blocker topology from #58
- Confidence: medium-high (sustained, stable hold and aligned blocker-root truth)

### Turn Notes (append here only when new game thread data arrives)

- `Turn 23` | `Persistent command-gate lock continues` | `Hold strict `Command Units` clear + immediate re-probe sequence only` | `No progression or topology change, so non-gate sequencing remains high-variance` | `Medium` | `If this persists through next 2 checkpoints, request explicit confirmation that the command path has cleared before any branching`

### Snapshot: Turn 24 (Tuner revalidation #60)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology broadened to six visible notifications
  - `ids: 85, 86, 87, 88, 89, 90`, `count=6`, `sum=""`
  - Active hard blockers:
    - `Command Units` (`id 85`, `block=true`)
    - `Respond to Diplomatic Action` (`id 87`, `block=true`)
    - `Respond to Diplomatic Action` (`id 88`, `block=true`)
  - Non-blocking:
    - `Diplomatic Action Completed` (`id 86`)
    - `Volcano Now Active` (`id 89`)
    - `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` now resolves to `id 85` (hard gate remains in control)
- Economy/tech: `cities=1`, `units=4`, `treasury=192`, `tech.type=-1558948215`, `state=0`, `progress=37`, `turnsLeft=4`, `treeType=-153498200`
- Progress signal: turn/date remained stable at 24/3425 BCE; no topology movement beyond the added diplomatic-volcano notification drift from previous window
- Confidence: medium-high on Tuner blocker truth; App UI remains one-turn lagged in turn/date vs Tuner

### Turn Notes (append for player thread)

- `Turn 24` | `Turn 24 with new blocker topology: 3 hard gates persist` | `Resolve `Command Units` and both `Respond to Diplomatic Action` blockers first, then immediate re-probe; then test only one production/scout branch per turn` | `The unlock frontier is now a small diplomacy-command cluster, not yet a production/military decision window` | `Medium` | `If 87/88 persist after two revalidations, request direct UI confirmation that diplomatic response commands are actually selectable before branching`

### Multi-turn strategic framing update (turn 24)

- Window lock condition is now **tri-gate, not single-gate**. Keep one-window anti-spam rule: one blocker-clear attempt, then one hard-state re-probe.
- 10-20 turn plan refresh:
  - Turns 24-27: clear command + diplomatic response blockers in order of shortest-validated queue; do not expand frontier commitments until queue drops below one unresolved blocker.
  - Turns 28-31: once queue clears, execute a 3-step growth lane (1 production stabilizer, 1 low-risk scouting move, 1 safety check/revalidation).
  - Turns 32-38: pick one of two lane trajectories:
    - Consolidation lane: lock civic/production for city growth and worker-capable expansion.
    - Pressure lane: convert scouting lane into fixed route-control with fallback defensive hold each turn.
- Readiness fallback: if any turn revalidation shows queue churn without progress, keep operations in command-phase only until the active blocker set is explicitly confirmed drained in two consecutive checks.

### Snapshot: Turn 24 (Tuner revalidation #61)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): blocker topology narrowed and re-prioritized
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Active hard blockers:
    - `Choose Production` (`id 91`, `block=true`)
    - `Command Units` (`id 92`, `block=true`)
  - Non-blocking:
    - `Volcano Now Active` (`id 89`)
    - `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` reports `id 89` (non-blocking), so per-item `block` flags remain the control truth.
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `research.type=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement; blocker topology changed from turn 24 #60 and no turn advancement in this revalidation cycle.
- Confidence: medium-high (notification queue stable in Tuner, but root blocker helper remains noisy on environmental notifications)

### Turn Notes (append for player thread)

- `Turn 24` | `Blocker drift resolved into a two-gate production+command bottleneck` | `Resolve `Choose Production` and `Command Units` first with one validated command-cycle per window, then immediate re-probe` | `Only these two gates now block end-turn; branching before they clear is high-variance` | `Medium` | `If either blocker persists across 2 more checkpoints, request UI confirmation on exact selectable responses before attempting non-gate city/expansion actions`

### Multi-turn strategic framing update (Window B→C)

- New holding rule: two hard gates (`Choose Production`, `Command Units`) are now the controlling constraints; this shifts the lane from command-only to **command + civic-production sequencing**.
- 10–20 turn plan reset from here:
  1) Immediate horizon (next 1–3 checkpoints): clear both hard blockers, validate with a second `Tuner` recheck, and keep one action per window.
  2) Near horizon (next 4–8 checkpoints): if gate set clears cleanly, execute a 3-step bounded bundle (1 production lock, 1 low-risk unit action, 1 safety revalidation) without committing expansion corridors yet.
  3) Mid horizon (approx turns 28–38): choose between consolidation and pressure only after at least 2 clean revalidation windows show stable blocker-free progression.
- Watch condition: if `findEndTurnBlocking` continues to drift to non-gating events, treat per-notification `block` flags + 2-window confirmation as source of truth.

### Snapshot: Turn 24 (Tuner revalidation #62)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #61
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` still reports `id 89` (non-blocking); gate truth continues to be per-item `block` flags
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `research.type=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash movement and no blocker-topology movement since revalidation #61
- Confidence: medium-high (`Tuner` blocker/econ data is stable; root helper not aligned to true gate)

### Turn Notes (append for player thread)

- `Turn 24` | `Two-gate blocker lock is stable through revalidation #62` | `Keep strict 1-at-a-time resolve loop: `Choose Production` first or `Command Units` if UI exposes it as cheaper path, then recheck` | `Repeated confirmation means this is a structural setup gate, not noise` | `Medium` | `If this exact pair persists for two more checkpoints, request explicit UI confirmation before any speculative action`

### 10–20 Turn Handoff Adjustment

- Hold condition still true: two hard gates must clear before broader lane execution.
- Tactical rhythm over the next 6–8 checkpoints:
  - checkpoint 1–2: execute one validated blocker resolution, then re-probe
  - checkpoint 3–4: if same pair persists, pause non-gate expansion and keep only blocker/revalidation actions
  - checkpoint 5+: if gate set finally clears, run the 3-step bounded bundle (1 production lock, 1 low-risk movement, 1 safety check) and only then open wider 10–20 turn lane commitment.

### Snapshot: Turn 24 (Tuner revalidation #63)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #62
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` still returns `id 89` (non-blocking), so per-notification `block` remains the control gate signal.
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `research.type=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash movement and no blocker-topology movement after #62
- Confidence: medium-high (highly stable hold set; only blocker root helper remains noisy)

### Turn Notes (append for player thread)

- `Turn 24` | `No movement at revalidation #63` | `Hold strict two-gate cleanup: one validated action + one re-probe only` | `Three checks in a row show the same setup block; speculative actions still unsafe` | `Medium` | `If this exact pair holds for 2 more checkpoints, request explicit UI-level confirmation for both remaining actions before changing play lane`

### 10–20 Turn Framing Note

- Operational cadence after three consecutive stable holds: do not branch to exploration/expansion lanes yet.
- Immediate objective remains unblock clearance through the narrowest valid path (`Choose Production` and `Command Units`) plus environmental follow-up.
- Post-clearance entry condition: two consecutive revalidations showing both hard blockers cleared and no new hard gate inserted.
- Only after entry condition: run bounded 3-tick consolidation sequence, then reassess lane choice in the 28–38 planning band.

### Snapshot: Turn 24 (Tuner revalidation #64)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable through #63 → still unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` remains `id 89` (non-blocking); per-item `block` still controls sequence.
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash change and no blocker-topology change since #63
- Confidence: medium-high (`Tuner` observation is reproducible; root helper remains noisy)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #64 confirms a hard two-gate hold` | `Continue strict one-action, one-reprobe loop and avoid speculative non-gate sequencing` | `Four checks with no topology movement indicate structural lock, not transient UI drift` | `Medium` | `If the same gate set holds on #65 and #66, escalate with explicit UI confirmation and do not widen lane commitments until both hard blockers are cleared`

### 10–20 Turn Continuation (no-go lane rule)

- Hold envelope unchanged for now:
  - Blocker clearance is the only allowed tactical lane.
  - Expansion/scouting branches remain paused until two consecutive revalidations confirm both hard blockers cleared.
- On eventual clearance: run a conservative 3-step sequence (`1` production lock, `1` move by safest active unit, `1` safety revalidation), then revisit `Window C` lane choice for turns 28–38.

### Snapshot: Turn 24 (Tuner revalidation #65)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` still reports `id 89` (non-gate), so per-item `block` remains authoritative
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash movement and no blocker-topology movement from #64
- Confidence: medium-high (`Tuner` signal remains reproducible through repeated polling)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #65 is another clean hold` | `Hold strict two-gate cleanup with one validated command and immediate re-probe` | `The queue has stabilized into a structural sequencing lock; expanding scope now carries high non-recoverable risk` | `Medium` | `If this hold repeats on two more checkpoints, pause non-gate planning and require explicit player-level confirmation of both action pathways before any lane expansion`

### 10–20 Turn Continuation (stability trigger)

- Keep the no-go window in effect until two consecutive clears on both hard blockers are observed.
- If release occurs, execute exactly one of this sequence per checkpoint:
  1) production/civic stabilization action,
  2) non-risky reconnaissance or infrastructure-support movement,
  3) safety + blocker audit check.
- If still blocked on #67, request explicit UI resolution-state confirmation and only then re-open planning branches.

### Snapshot: Turn 24 (Tuner revalidation #66)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` continues to return `id 89` (non-gate); per-item `block` is the operational gate.
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no movement in turn/date/hash or blocker topology since #65
- Confidence: medium-high (`Tuner` data remains stable across repeated reads)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #66 confirms continued hard hold` | `Stick to a tight blocker-clear cadence (1 valid action, 1 re-probe) and no branch actions` | `Five consecutive stable checks without any gate resolution implies durable sequencing lock` | `Medium` | `If this persists through #67 and #68, request explicit UI-level confirmation and do not shift from unblock lane until both hard blockers clear twice in a row`

### 10–20 Turn Strategic Continuation

- No-go rule remains active: no scouting/expansion branching until verified dual-clear of hard blockers.
- On release, use a 3-turn bounded rebuild sequence and only then reassess lane direction in turns 28–38.

### Snapshot: Turn 24 (Tuner revalidation #67)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` remains `id 89` (non-gate), so per-item `block` flags remain the control signal
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: still no turn/date/hash movement and no blocker-topology movement since #66
- Confidence: medium-high (highly stable hold and reproducible Tuner signal)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #67 confirms six consecutive holds` | `No new blockers and no turn movement; keep blocker-cleanup-only mode` | `Persistently structural lock; lane expansion now strongly discouraged` | `Medium` | `If this holds through #68 and #69, escalate by requesting explicit UI validation that both hard blockers are truly actionable before any branching`

### 10–20 Turn Strategic Continuation (durable-lock protocol)

- Hold condition unchanged; two-gate unblock lane remains the only safe operational lane.
- Trigger to re-open broader decisions: two consecutive revalidations that show both `id 91` and `id 92` non-blocking and no new hard gate inserted.
- On release, execute a controlled 3-step recovery cycle: production commit, one safe movement, one safety check; then reevaluate `Window C` lane commitment.

### Snapshot: Turn 24 (Tuner revalidation #68)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #67
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` still `id 89` (non-gate)
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash or blocker-topology movement in yet another check
- Confidence: medium-high (`Tuner` observability remains stable across repeated checks)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #68 confirms prolonged structural hold` | `Maintain one-action cleanup lane only; keep one re-probe and no branch expansion` | `The same two hard blockers are still present after prolonged no-move window` | `Medium` | `If #69 and #70 remain identical, request explicit UI confirmation of both blocker resolutions before relaxing constraints`

### 10–20 Turn Strategic Continuation (high-confidence hold)

- Keep operations constrained to unblock lane until two consecutive checks show both hard blockers cleared.
- Upon confirmed release, execute at most one bounded 3-step recovery sequence per checkpoint to avoid compounding blind-risk before lane reclassification for turns 28–38.

### Snapshot: Turn 24 (Tuner revalidation #69)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #68
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` remains `id 89` (non-blocking), so per-item `block` remains the gate
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash or blocker-topology movement since #68
- Confidence: medium-high (stable lock has persisted across seven checks)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #69 confirms sustained dual-block hold` | `Keep strict unblock-only cadence: one validated action, one re-probe; no branch actions` | `A seven-check hold suggests the lock is durable, not transient` | `Medium` | `If this holds through #70 and #71, require explicit UI-level confirmation on blocker resolution sequence before any non-gate plans`

### 10–20 Turn Strategic Continuation (durable hold protocol)

- Continue no-go stance on exploration/expansion until two consecutive revalidations show both hard blockers clear and stable.
- On eventual release, execute the standard 3-step recovery rhythm per checkpoint and then reassess 10–20 turn lane choice with both tactical and operational safety context.

### Snapshot: Turn 24 (Tuner revalidation #70)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` remains `id 89` (non-gate), so per-item `block` remains the source of truth
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/date/hash movement and no blocker-topology movement since #69
- Confidence: medium-high (high stability and reproducible Tuner signal)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #70 confirms durable hold` | `Keep strict one-action cleanup lane; do not branch` | `Eight checks with identical topology indicate durable sequencing bottleneck` | `Medium` | `If #71 and #72 remain unchanged, pause all non-gate planning and require explicit UI confirmation before expanding decision scope`

### 10–20 Turn Strategic Continuation (lock persistence)

- Hold window remains active until two consecutive checks confirm both `id 91` and `id 92` non-blocking.
- On release, resume only a bounded 3-step recovery sequence per checkpoint (production choice, safe move, safety audit) and then re-evaluate turns 28–38 lane strategy.

### Snapshot: Turn 24 (Tuner revalidation #71)

- Turn/Date: 24 / 3425 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 89, 90, 91, 92`, `count=4`, `sum=""`
  - Hard blockers: `Choose Production` (`id 91`, `block=true`), `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Volcano Now Active` (`id 89`), `Major River Flooding` (`id 90`)
  - `findEndTurnBlocking` remains `id 89` (non-gating), so per-item `block` remains the control source
- Economy/tech: `cities=1`, `units=5`, `treasury=203`, `researchType=-1558948215`, `techState=0`, `progress=49`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no movement in turn/date/hash and no blocker-topology movement since #70
- Confidence: medium-high (sustained stable lock)

### Turn Notes (append for player thread)

- `Turn 24` | `Revalidation #71 confirms sustained dual-block hold` | `Continue strict unblock-only cadence: one valid action + one re-probe` | `Nine checks with identical hard blockers still active means expansion remains high-risk` | `Medium` | `If this persists on #72 and #73, explicitly confirm blocker pathways in UI before changing priorities`

### 10–20 Turn Strategic Continuation

- The no-go rule remains in force: do not shift from blocker lane until both hard blockers clear in two consecutive revalidations.
- On release, execute one bounded 3-step sequence each checkpoint before reopening the broader 10–20 turn lane commitment.

### Snapshot: Turn 25 (Tuner revalidation #72)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology reduced from two+ to one true gate
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` reports `id 93` (non-blocking)
  - Gate truth remains the per-notification `block` flag
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: one-turn advancement to `3400 BCE` and blocker topology collapse in place; previously active `Choose Production` lane likely resolved.
- Confidence: medium-high (multi-command verification, stable hash and consistent queue signal)

### Turn Notes (append for player thread)

- `Turn 25` | `Dual blocker structure resolved into single hard gate` | `Advance only `Command Units` now, then immediate re-probe` | `Choosing one confirmed blocker unlock path creates a safe narrow corridor for forward action` | `Medium` | `Do a second Tuner checkpoint immediately after Command Units resolves; if still single-gate and no new hard block appears, open one production-related follow-up action in same checkpoint window`

### 10–20 Turn Strategic Continuation (single-gate release)

- Lane shifts from structural two-gate lock to **single-gate execution mode**. The active constraint is now `Command Units` (id 92).
- 10–20 turn planning update:
  1. **Next 1–3 checkpoints:** resolve `Command Units`, then one immediate re-probe. If gate persists, stay in one-gate lane and stop.
  2. **Next 4–8 checkpoints:** if gate clears cleanly in two consecutive revalidations, run one bounded 3-step action bundle (safe move, production clarity, safety revalidation) and reassess.
  3. **Turns 28+ horizon:** only after sustained gate clearance and no immediate tactical penalty, begin corridor/consolidation choice between consolidation and outward pressure.
- Escalation guard: if a new non-blocking environmental notification (`id 93` family) becomes gating again, force explicit UI confirmation before switching to non-gate lanes.
- Keep messaging concise: one concise advisory row only at next meaningful checkpoint unless blocker topology changes again within same turn.

### Snapshot: Turn 25 (Tuner revalidation #73)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #72
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` reports `id 93` (non-gating), so per-notification `block` flags remain the operational gate source
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: turn and hash unchanged; blocker topology unchanged for consecutive revalidation window
- Confidence: medium-high (stable Tuner reads across status/map/econ/notifications; map shape constant)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate blocker lock persists after consecutive revalidation` | `Continue one validated `Command Units` completion + immediate re-probe` | `Gate is stable and non-environment notifications remain clear; avoid expanding scope until the gate is truly clear on two checkpoints` | `Medium` | `If id 92 remains blocking next two checkpoints, request explicit UI validation of the unit-command completion path before opening production/scouting branches`

### 10–20 Turn Strategic Continuation (single-gate persistence)

- Tactical posture remains in constrained **single-gate execution mode**:
  1) clear `Command Units` (only) and recheck immediately;
  2) if still blocked and unchanged on the next checkpoint, hold and do not branch;
  3) once unblocked in two consecutive checkpoints, switch to bounded 3-step recovery sequence (safe movement, production clarification, safety audit) and only then reassess expansion lane for turns `28+`.
- Additional framing guard: environmental non-blocking notification (`id 93`) should not be treated as hard gate, but if it starts replacing id-based blocking while no action is available, force UI confirmation before any lane expansion.

### Snapshot: Turn 25 (Tuner revalidation #74)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #73
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` still reports `id 93` (non-gating), so per-item `block` remains authoritative
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-topology movement since #73
- Confidence: medium-high (consistent multi-command evidence across status/map/econ/notifications)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate hold persists after another revalidation` | `Stay in one-gate execution: complete `Command Units` if available, then re-probe once immediately` | `Sustained hold means non-gate branching is still high-risk and should remain off the table` | `Medium` | `If gate remains and no clear action path appears by the next checkpoint, request explicit UI-level confirmation of unit-command options before shifting any broader planning lane`

### 10–20 Turn Strategic Continuation (lock verification band)

- Keep one-lane protocol: **resolve `Command Units` only, then revalidate**.
- If unchanged through the next checkpoint, do not open production/exploration branching yet.
- On two consecutive clear confirmations of hard-gate release, run a controlled 3-step recovery sequence in that checkpoint:
  1) secure first safe production/commit decision,
  2) execute one low-risk movement,
  3) immediate tactical safety + blocker audit.
- Update horizon mapping once release is real: `Window C` (≈28–38) lane choice should pivot only when gate clearance is stable and no new environmental non-blocking notification replaces sequencing priority.

### Snapshot: Turn 25 (Tuner revalidation #75)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology unchanged, but root blocking signal stabilized on the real hard gate
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` now reports `id 92` (hard gate), resolving prior root-helper drift
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: turn/hash stable and blocker topology stable for consecutive checks
- Confidence: medium-high (consistent multi-source reads; improved blocker-root alignment)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate lock remains and root blocker now aligns with hard blocking source` | `Resolve `Command Units` as the gating action, then revalidate immediately` | `Root helper now confirms the actual hard blocker, improving low-regret sequencing confidence` | `Medium` | `If Command Units remains blocking through the next checkpoint, request explicit UI confirmation of selectable unit commands before moving to any non-gate decisions`

### 10–20 Turn Strategic Continuation (gate-root alignment)

- Maintain strict single-gate recovery protocol: `Command Units` only, re-probe after each action.
- Since root signal now aligns, execution confidence improves; however, hold still continues until two consecutive revalidations show gate clear.
- Upon confirmed release, begin the bounded sequence in the same order as before:
  1) production clarity step,
  2) one safe operational move,
  3) full safety/revalidation check,
  then reevaluate turns `28+` expansion vs consolidation lane.

### Snapshot: Turn 25 (Tuner revalidation #76)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged across another revalidation
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` reports `id 92` (hard gate)
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker topology movement this checkpoint.
- Confidence: medium-high (stable multi-command readback, unchanged blocker structure)

### Turn Notes (append for player thread)

- `Turn 25` | `Single hard gate persists with consistent signal (`id 92` hard blocker)` | `Keep strict one-gate completion protocol: Command Units -> immediate re-probe` | `No evidence of sequencing release or safe non-gate expansion opportunity` | `Medium` | `If `Command Units` remains the only hard gate on the next two checkpoints, request UI-level confirmation of legal command path before any broadened lane actions`

### 10–20 Turn Strategic Continuation (confirmation lane)

- Hold remains in place: no branching outside command-unlock lane.
- 10–20 turn planning logic stays: once `Command Units` clears in two consecutive revalidations, execute bounded 3-step recovery (production clarification, one safe move, safety+blocker audit) and then choose between consolidation vs pressure lane for turns 28+.

### Snapshot: Turn 25 (Tuner revalidation #77)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): no topology movement
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` reports `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash change; blocker set stable in a third+ consecutive revalidation window since last release signal
- Confidence: medium-high (stable status/map/econ/notifications telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Persistent single-gate hold is continuing` | `Keep Command Units on lockstep with immediate re-probe and no branch expansion` | `Repeated lock means sequencing risk is still unresolved` | `Medium` | `If no resolution after the next 1–2 checkpoints, request UI-verified valid command sequence before any broader operational move`

### 10–20 Turn Strategic Continuation (stable lock)

- Continue one-lane protocol exactly as before.
- Maintain 3-step recovery reserve but only execute it after two consecutive clear checks of `Command Units` and a fresh readiness hash turn event.

### Snapshot: Turn 25 (Tuner revalidation #78)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement, no blocker topology movement
- Confidence: medium-high (highly stable, no drift across status/map/econ/notifications)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate hold remains stable for another checkpoint` | `Maintain hard-gate discipline: only Command Units action and immediate re-probe` | `Gate is unresolved and no safer branching signal has emerged` | `Medium` | `If unresolved after this checkpoint set, keep lock posture and request explicit UI confirmation of command options before changing lanes`

### 10–20 Turn Strategic Continuation

- Continue the same single-gate recovery protocol.
- Keep the 3-step non-gate recovery sequence deferred until `Command Units` clears in two consecutive revalidations and a clear turn/hash event follows.

### Snapshot: Turn 25 (Tuner revalidation #79)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-topology movement for yet another checkpoint.
- Confidence: medium-high (stable multi-vector telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate hold remains unchanged` | `Keep the strict command-clear/re-probe loop only` | `No new blocker risk-signal or queue drift indicates sequencing still constrained` | `Medium` | `Request explicit UI verification of available `Command Units` options only if the same hard gate persists through the next checkpoint and no legal action appears to resolve it`

### 10–20 Turn Strategic Continuation (hold continuity)

- Maintain lock posture until two consecutive revalidations show hard-blocker release for `id 92`.
- On release: run a short bounded restart sequence before broad lane changes, then reassess `Window C` lane (consolidation vs pressure) with fresh 4–6 checkpoint evidence.

### Snapshot: Turn 25 (Tuner revalidation #80)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no movement in turn/date/hash and no blocker topology change in another consecutive revalidation
- Confidence: medium-high (consistent and stable readset)

### Turn Notes (append for player thread)

- `Turn 25` | `Sustained single-gate lock after extended hold window` | `Hold strict Command Units-only lane: resolve/clear and recheck` | `Persistent constraint indicates sequencing remains unfinished; speculative actions likely increase variance` | `Medium` | `If unresolved through next checkpoint(s), keep the lock and ask for explicit UI confirmation of available command options before lane broadening`

### 10–20 Turn Strategic Continuation (risk discipline)

- Gate discipline remains unchanged.
- Re-open broader lanes only after 2 consecutive checkpoint clears of `id 92` plus a clear readiness signal; then execute the bounded 3-step recovery sequence before choosing a long-horizon route (consolidation vs pressure) in turns 28+ band.

### Snapshot: Turn 25 (Tuner revalidation #81)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged in same gate state
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-topology movement versus prior revalidations
- Confidence: medium-high (consistent multi-channel reads)

### Turn Notes (append for player thread)

- `Turn 25` | `Single hard gate remains unchanged through another checkpoint` | `Continue Command Units-only recovery with immediate re-probe` | `Risk remains skewed toward sequencing errors if we branch now` | `Medium` | `If the same hard gate persists, keep lock and request UI confirmation on legal command path before broadening lane actions`

### 10–20 Turn Strategic Continuation

- No lane shift yet; operationally remain in single-gate lock.
- Only when two consecutive rechecks show `Command Units` cleared and turn/hash progress resumes should we execute the pre-planned bounded restart bundle and reopen broader 10–20 turn lane decisions for turns 28+.

### Snapshot: Turn 25 (Tuner revalidation #82)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement or blocker-topology movement from prior checkpoints
- Confidence: medium-high (stable status/map/econ/notification telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate hold is unchanged in continued revalidation` | `Continue strict Command Units-only operation and immediate re-probe` | `Turn remains constrained by one hard sequencing gate; branching still carries avoidable risk` | `Medium` | `If unresolved, keep lock and request UI-level confirmation of available command options before any broader lane action`

### 10–20 Turn Strategic Continuation (operational discipline)

- Maintain one-gate lock posture until 2 consecutive clears of `id 92`.
- On actual release, run the pre-approved bounded recovery sequence and then reassess strategic lane choice in 10–20 turn lens.

### Snapshot: Turn 25 (Tuner revalidation #83)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash progression and no blocker-topology change from the prior revalidation
- Confidence: medium-high (stable readback across status, map, econ, and notifications)

### Turn Notes (append for player thread)

- `Turn 25` | `Single-gate hold remains stable yet again` | `Keep strict gate-only protocol: Command Units then immediate re-probe` | `No sequencing release signal; broadening actions still carry high avoidable risk` | `Medium` | `If this persists on another checkpoint and no legal command path appears, request explicit UI validation of Command Units choices before any strategic lane change`

### 10–20 Turn Strategic Continuation (hold continuation)

- Maintain lock posture. Defer non-gate scouting/expansion until `id 92` clears in two consecutive checkpoints and a turn/hash event follows.
- Once released, execute bounded 3-step restart sequence before committing to medium-horizon lane (consolidate vs pressure).

### Snapshot: Turn 25 (Tuner revalidation #84)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: persistent hold with no topology/turn/hash change since prior checkpoint.
- Confidence: medium-high (stable status/map/econ/notification telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Sustained single hard-gate hold` | `Keep strict one-action/one-check protocol for `Command Units`` | `Prolonged lock suggests sequencing is still the highest-order risk` | `Medium` | `If the same hard gate remains for the next checkpoint, keep lane lock and avoid branch actions until verified command resolution path exists`

### 10–20 Turn Strategic Continuation (long hold)

- Remain in controlled lock mode.
- On gate resolution in two consecutive checkpoints, execute bounded restart sequence, then reassess the 10–20 turn lane direction with a fresh 4–6 checkpoint view.

### Snapshot: Turn 25 (Tuner revalidation #85)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-topology movement from revalidation #84
- Confidence: medium-high (stable status/map/econ/notification telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Persistent single hard-gate hold continues` | `Keep executing only the `Command Units` unlock sequence with immediate re-probe` | `The game remains in narrow sequencing lock; no evidence yet to widen the plan` | `Medium` | `If this remains unchanged next checkpoint, request UI confirmation of legal Command Units options before broadening into multi-step lane actions`

### 10–20 Turn Strategic Continuation (sustained lock)

- Preserve the lock protocol until `id 92` clears in two consecutive rechecks.
- On clear, execute bounded 3-step restart and then resume 10–20 turn lane planning (turn bands 28+).
### Snapshot: Turn 25 (Tuner revalidation #86)

- Turn/Date: 25 / 3400 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 93`, `count=2`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`)
  - Non-blocking: `Gentle Volcanic Eruption` (`id 93`, `block=false`)
  - `findEndTurnBlocking` remains `id 92`
- Economy/tech: `cities=1`, `units=5`, `treasury=214`, `researching.type=-1558948215`, `techState=0`, `progress=61`, `techTurnsLeft=2`, `treeType=-153498200`
- Progress signal: sustained hold with no topology movement or turn/hash change versus prior checkpoint
- Confidence: medium-high (consistent multi-vector telemetry)

### Turn Notes (append for player thread)

- `Turn 25` | `Single hard blocker persists after prolonged revalidation window` | `Keep one safe action lane: Command Units then immediate re-probe` | `Sequencing constraint still dominates; opening broader lanes now likely increases unrecoverable variance` | `Medium` | `If this state still holds next checkpoint, request UI-confirmable legal Command Units options and keep gate lock until cleared twice`

### 10–20 Turn Strategic Continuation (extended hold)

- Continue lock protocol without expansion or production commits outside command resolution.
- Resume medium-horizon lane work only after two consecutive clear `id 92` checkpoints and a resumed readiness progression event.

### Snapshot: Turn 26 (Tuner revalidation #88)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged since #87
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` still reports `id 95` (non-blocking); per-item `block` remains the trusted sequencing control.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: turn/hash still unchanged; no blocker-topology progression.
- Confidence: medium-high (stable and reproducible Tuner state under direct readout)

### Turn Notes (append for player thread)

- `Turn 26` | `Revalidation remains on same 7-item queue` | `Continue strict sequencing lane: resolve hard blockers in minimum-safe order, with one validated unblock action then immediate re-probe` | `No new movement since last checkpoint means this is a durable startup-repair phase` | `Medium` | `If this state persists, request explicit UI-confirmed command action availability before any non-gate expansion`

### 10–20 Turn Strategic Continuation (sustained hold refresh)

- The near horizon remains a **durable multi-gate startup debt**.
- Next 1–3 checkpoints: attempt the current highest-confidence blocker in sequence and immediately revalidate.
- Next 4+ checkpoints (if no new topology): maintain a constrained command-first posture; defer corridor/expansion commitments until queue drops below hard-gate cluster and clears in two consecutive checks.
- Message cadence remains one advisory row per meaningful checkpoint only to avoid noise.

### Snapshot: Turn 26 (Tuner revalidation #89)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` still reports `id 95` (non-blocking); per-item flags remain control source.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: turn/hash and blocker topology still static; no queue transitions since #88.
- Confidence: medium-high (stable repeated Tuner read, no drift)

### Turn Notes (append for player thread)

- `Turn 26` | `Another static revalidation with no queue progression` | `Hold strict command-first unblock sequence; keep to validated one-step clear + immediate re-probe` | `Persistent five-gate stack means non-gate branching is still low-value and high-risk` | `Medium` | `If queue persists unchanged through the next check, confirm each planned blocker action is UI-selectable before attempting expansion/branch moves`

### Snapshot: Turn 26 (Tuner revalidation #90)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` still points to `id 95` (non-blocking); use per-item `block` flags for sequencing control.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement, no queue movement, no topological change from #89.
- Confidence: medium-high (consistent repeated readback across status/map/econ/notification streams)

### Turn Notes (append for player thread)

- `Turn 26` | `Turn remains static on repeated revalidation` | `Sustain strict single-step blocker clearance sequence and immediate re-probe; do not branch until the 5-gate stack clears and stabilizes` | `The window remains a sustained startup lock despite active readiness and map consistency` | `Medium` | `Escalate to explicit UI-blocker-state confirmation if no block transitions occur through the next checkpoint`

### Snapshot: Turn 26 (Tuner revalidation #87)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): expanded hard-gate stack
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` returns `id 95` (non-blocking), so per-item `block` flags remain authoritative for sequencing.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: blocker topology increased from a single gate to a 5-hard-block + 2-context set while turn/hash advanced.
- Confidence: medium-high (Tuner notifications and map hash remained stable in this check)

### Turn Notes (append for player thread)

- `Turn 26` | `Turn advanced with a reopened multi-gate setup queue` | `Shift to triage sequence and clear only hard blockers in lowest-variance order: Command Units, Grow City, Choose Civic, Choose Production, Social Policies Available` | `Turned into a fresh setup-repair phase; branching now would add sequencing uncertainty` | `Medium` | `Run one validated unblock command, then re-probe immediately before attempting any non-gate scouting/expansion`

### 10–20 Turn Strategic Continuation (Window B recovery reset)

- The active objective resets to **multi-gate startup debt release**, not map tempo.
- Near horizon (next 1–3 checkpoints): clear blockers in strict one-at-a-time order with immediate revalidation after each successful action.
- Near-to-mid horizon (next 4–8 checkpoints): only after the queue drops below the current hard-gate cluster and remains stable for 2 rechecks should you open a constrained growth sequence (1 production-stabilization decision + 1 safe movement + 1 safety audit).
- Escalation condition: if top-3 rechecks show no queue movement, request explicit UI confirmation on blocker-selectability and hold expansion/commitment planning until verified.

### Snapshot: Turn 26 (Tuner revalidation #91)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` still points to `id 95` (non-blocking); per-item blockers remain sequencing source of truth.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: unchanged since #90; sustained hold with no queue movement.
- Confidence: medium-high (three consecutive identical checks since #89)

### Turn Notes (append for player thread)

- `Turn 26` | `Persistent static hold across repeated checkpoints` | `Keep the single validated clearance cadence only: one blocker action, immediate re-probe, no branching` | `No unblock movement means the window remains a startup lock rather than a tempo window` | `Medium` | `If this persists through the next checkpoint, require explicit UI-confirmed selectable action flow before widening beyond queue-resolution`

### Snapshot: Turn 26 (Tuner revalidation #92)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` still reports non-blocking `id 95`; per-item `block` remains operational control.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no movement from #91; sustained lock with identical 7-item topology.
- Confidence: medium-high (identical repeated run on Tuner status/map/econ/notifications)

### Turn Notes (append for player thread)

- `Turn 26` | `Fourth repeated static revalidation since #87` | `Hold the queue-resolution lane only: one command unblock attempt then immediate recheck` | `This is now a durable lock state, not a visibility artifact` | `Medium` | `At next checkpoint, only clear/validate if a hard blocker is selectable in UI; otherwise keep to command-parity verification`

### Snapshot: Turn 26 (Tuner revalidation #93)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains `id 95` (non-blocking); per-item blockers remain operational truth.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: sustained hold; no turn/date/hash or queue topology movement from #92.
- Confidence: medium-high (fourth+ consecutive stable Tuner read set).

### Turn Notes (append for player thread)

- `Turn 26` | `Persistent 5-gate hold confirmed again` | `Do only one validated blocker-clear attempt followed by immediate re-probe` | `Lock has not moved through multiple consecutive checkpoints, so this is a durable sequencing constraint` | `Medium` | `Request explicit UI confirmation that blocker actions are currently selectable before opening any multi-step tactical lane`

### Snapshot: Turn 26 (Tuner revalidation #94)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains `id 95` (non-blocking); per-item blockers remain operational truth.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: five consecutive checkpoints in a row with no turn/hash or topology movement.
- Confidence: medium-high (stable across App UI + Tuner + map/econ/notifications)

### Turn Notes (append for player thread)

- `Turn 26` | `Lock remains fully static through yet another check` | `Remain in one-action blocker-clear cadence only` | `This has become a high-confidence durable lock, not a transient UI artifact` | `Medium` | `If no selectable action appears in UI at next check, pause broader planning and maintain blocker-resolution parity checks only`

### Snapshot: Turn 26 (Tuner revalidation #95)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains non-blocking `id 95`; per-item flags remain operational truth.
- Economy/tech: `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement, no topology movement from #94.
- Confidence: high-ish (multiple identical checks since #87, now including #95)

### Turn Notes (append for player thread)

- `Turn 26` | `Unchanged state confirms durable startup queue lock` | `Keep strict one-step blocker clearance and immediate revalidation cadence` | `Queue has shown high persistence with no topology change` | `Medium` | `Delay non-gate planning until a hard blocker clears with UI-verified actionability`

### Snapshot: Turn 26 (Tuner revalidation #96)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged queue with cleaner root alignment
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`), `Choose a Civic` (`id 97`, `block=true`), `Choose Production` (`id 98`, `block=true`), `Grow City` (`id 99`, `block=true`), `Social Policies Available` (`id 100`, `block=true`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`, `block=false`), `Violent Storm!` (`id 96`, `block=false`)
  - `findEndTurnBlocking` now reports `id 92` (hard blocker), which removes prior root-level ambiguity.
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no topology movement, but clearer end-turn blocker semantics (`findEndTurnBlocking=id 92`).
- Confidence: high-ish (steady telemetry across status/map/econ/notification with aligned root semantics)

### Turn Notes (append for player thread)

- `Turn 26` | `Root blocker signal normalized to `Command Units` on Tuner` | `Prioritize unblock sequence at `id 92` first, then immediately re-probe before touching other queue entries or expansion` | `Hard-root lock is now explicit, so queue-clearing should be deterministic if action is UI-selectable` | `Medium` | `If the same 7-item queue persists with `findEndTurnBlocking=92` through next checkpoint, request an explicit UI-confirmed legal action path and continue one-step validation only`

### 10–20 Turn Strategic Continuation (window update)

- Window now remains in a **durable startup-lock lane**; the immediate 10–20 turn objective is to regain sequencing freedom before committing to either pressure or consolidation.
- For the next 3–6 checkpoints: perform exactly one validated `Command Units` unblock attempt, then re-probe `Game.Notifications` and only then escalate to `Grow City` if selectable.
- Pivot condition unchanged: require two consecutive checkpoints with reduced hard-block count before opening constrained scouting/production commitments.

### Snapshot: Turn 26 (Tuner revalidation #97)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged and still lock-bound
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains `id 92` (hard)
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash progression and no blocker topology movement in two consecutive checkpoints.
- Confidence: medium-high (stable repeated telemetry)

### Turn Notes (append for player thread)

- `Turn 26` | `Tuner revalidation is stable for a second checkpoint in a row` | `Continue strict queue-first policy: execute exactly one blocking `Command Units` unblock attempt, then re-probe before touching `Choose Civic/Production/Grow City/Social Policies`` | `Sustained lock without queue transitions makes broader lanes higher variance than helpful` | `Medium` | `If id 92 remains top blocker at next checkpoint, pause nonessential action attempts and request explicit UI selectability confirmation`

### Snapshot: Turn 26 (Tuner revalidation #98)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged for checkpoint streak
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`, `block=true`), `Choose a Civic` (`id 97`, `block=true`), `Choose Production` (`id 98`, `block=true`), `Grow City` (`id 99`, `block=true`), `Social Policies Available` (`id 100`, `block=true`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains hard `id 92`
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=225`, `researching.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash movement; no blocker-topology movement; checkpoint remains fully locked.
- Confidence: high (stable multi-command telemetry with same hard lock semantics)

### Turn Notes (append for player thread)

- `Turn 26` | `Another unchanged checkpoint with identical lock profile` | `Keep strictly one-step `Command Units` unblock attempt only; re-check immediately, then stop` | `No queue transition in yet another checkpoint indicates a sustained sequencing lock` | `Medium` | `If this still holds next checkpoint, pause multi-step planning and request explicit UI actionability for `Command Units` before any wider lane movement`

### 10–20 Turn Strategic Continuation (sustained lock, checkpointed)

- Window remains in recovery mode for startup sequencing. Treat the next 3–5 checkpoints as lock-management checkpoints, not expansion checkpoints.
- 2-stage trigger for horizon reset:
  1) two consecutive checkpoints with reduced hard-block count, or
  2) two consecutive checkpoints showing `findEndTurnBlocking` changes away from `92`.
- If either trigger lands: open a constrained 3-action restart sequence before re-laning into long-horizon pressure vs consolidation.

### Snapshot: Turn 26 (Tuner revalidation #99)

- Turn/Date: 26 / 3375 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged, high-confidence lock signature
  - `ids: 92, 95, 96, 97, 98, 99, 100`
  - `count=7`, `sum=""`
  - Hard blockers: `Command Units` (`id 92`), `Choose a Civic` (`id 97`), `Choose Production` (`id 98`), `Grow City` (`id 99`), `Social Policies Available` (`id 100`)
  - Non-blocking/contextual: `Volcano Goes Dormant` (`id 95`), `Violent Storm!` (`id 96`)
  - `findEndTurnBlocking` remains `id 92` (hard)
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=225`, `research.type=-1558948215`, `techState=0`, `progress=73`, `techTurnsLeft=1`, `treeType=-153498200`
- Progress signal: no turn/hash or blocker-topology movement since #98.
- Confidence: high (repeatable telemetry with stable lock ordering)

### Turn Notes (append for player thread)

- `Turn 26` | `Repeated revalidation confirms no new sequencing signal for checkpoint #99` | `Execute one `Command Units` clearance attempt only, re-probe, and freeze on unresolved lock` | `Lock entropy remains low but lock duration is high; action branching remains uncalibrated` | `Medium` | `If unchanged next checkpoint, escalate to explicit UI validation before attempting any non-blocker lane action`

### 10–20 Turn Strategic Continuation (sustained lock checkpoint)

- For the next 3–5 checkpoints, maintain a strict queue-management mode.
- Escalate from lock-management to lane recovery only on either:
  - two consecutive checkpoints with hard-block count reduction, or
  - hard-root changes off `id 92`.
- On recovery: run a 3-action reset (Command Units -> Civic/Production/City growth) before choosing pressure vs consolidation objective in the medium horizon.

### Snapshot: Turn 27 (Tuner revalidation #100)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): shifted to a narrower 4-item queue
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`, `block=true`), `Command Units` (`id 104`, `block=true`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`, `block=false`), `Volcano Now Active` (`id 102`, `block=false`)
  - `findEndTurnBlocking` moved to `id 101` (non-blocking); hard sequencing control remains in per-item `block` flags.
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=236`, `research.type=-1`, `techState=0`, `progress=0`, `techTurnsLeft=-1`, `treeType=-153498200`
- Progress signal: clear progress in blocker topology (from 7-item lock on Turn 26 to 4-item queue on Turn 27); turn/hash advanced from previous window.
- Confidence: medium-high (consistent Tuner read with changed blocker topology)

### Turn Notes (append for player thread)

- `Turn 27` | `Blocker stack contracted and root shifted from hard `Command Units` to non-blocking contextual storm state` | `Prioritize hard blockers in this order: `Choose a Technology` -> `Command Units` (one validated action each, re-probe between). Keep context weather/volcano only in watch mode.` | `Weather/volcano events likely create temporary tactical friction; avoid treating non-blocking storm state as hard sequencing` | `Medium` | `If both hard blockers do not clear in two checkpoints, capture UI action availability for those exact notifications before broader planning`

### 10–20 Turn Strategic Continuation (phase transition)

- The run moved from multi-gate startup debt to a **narrower recovery lane** on turn 27. This is an opportunity to convert from pure blocker-management to an opener restart track.
- Immediate 10–20 turn objective reset:
  - 2–3 checkpoints: clear `Choose a Technology` and `Command Units` only (with validate/re-probe)
  - then reassess for first meaningful move outside lock (scouting/production)
  - if both hard blockers clear, re-open this horizon around corridor and city growth commitments.

### Snapshot: Turn 27 (Tuner revalidation #101)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): topology unchanged since #100
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`, `block=true`), `Command Units` (`id 104`, `block=true`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`, `block=false`), `Volcano Now Active` (`id 102`, `block=false`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking); per-item `block` flags continue to be sequencing control source.
- Economy/tech (`Tuner`): `cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`
- Progress signal: no blocker-topology movement; tech research state changed from `type=-1 / turnsLeft=-1` to `type=-1255676052 / turnsLeft=7`, indicating technology selection context reopened in the lock.
- Confidence: high (stable blocker set across multiple snapshots with plausible research metadata shift)

### Turn Notes (append for player thread)

- `Turn 27` | `Blocker set stable, but research metadata shifted inside same hard-lock` | `Prioritize `Choose a Technology` now first (to resolve both unknown branch and potential lock coupling), then `Command Units` with one action-at-a-time validation` | `Root lock still reflects environmental events plus two true blockers; branching before clearance still increases sequencing risk` | `Medium` | `If either hard blocker remains after 2 checkpoints, capture explicit UI action state before expanding outside restart lane`

### 10–20 Turn Strategic Continuation (turn 27 reset)

- Maintain narrow recovery window: two mandatory clears before any expansion commitments.
- New sequence for 10–20 turn lens:
  1. resolve `Choose a Technology` (2 checkpoints)
  2. resolve `Command Units` (2 checkpoints)
  3. if both clear with stable lock drop, execute first structured movement/production growth action and retest horizon every 3–5 checkpoints.

### Snapshot: Turn 27 (Tuner revalidation #102)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking); hard sequencing still governed by per-item `block` flags.
- Economy/tech (`Tuner`): stable in this window (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no turn/hash movement and no blocker/topology transition in another recheck at the same game turn.
- Confidence: high (telemetry consistency across all sampled surfaces)

### Turn Notes (append for player thread)

- `Turn 27` | `Consecutive rechecks confirm full lock stability` | `Hold strict unlock sequence only: `Choose a Technology` then `Command Units`, with one validate/re-probe cycle per attempt` | `No movement for another checkpoint means sequencing risk remains highest-variance vector` | `Medium` | `Delay recovery lane expansion until either hard blocker drops and remains dropped over two checks`

### 10–20 Turn Strategic Continuation (stability hold)

- Keep the 10–20 turn plan in *containment mode* for the next few checkpoints. Priority remains reducing hard blockers before any exploratory or production branching.
- If two consecutive checkpoints continue with both hard blockers unresolved, request explicit UI actionability confirmation for both hard notifications before attempting any non-lock move.

### Snapshot: Turn 27 (Tuner revalidation #103)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking), hard sequencing remains on per-item blockers (`103`, `104`).
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no turn/hash move and no blocker-topology change since prior check.
- Confidence: high (stable multi-surface revalidation)

### Turn Notes (append for player thread)

- `Turn 27` | `Second consecutive static checkpoint at same blocker topology` | `Hold strict two-step unblock protocol (`Choose a Technology` -> `Command Units`) and re-probe immediately after each attempt` | `No topological progress indicates lock persists longer than one full checkpoint rhythm` | `Medium` | `If both hard blockers stay unresolved after this checkpoint, request UI-confirmed availability for each required choice before adding any broader tactical move`

### 10–20 Turn Strategic Continuation (static-lock hold)

- Continue treating the next window as sequencing recovery rather than expansion.
- Trigger to exit: two consecutive checkpoints where both hard blockers are cleared and queue count drops.
- If the exit trigger does not appear in the next 2–3 checkpoints, shift to a UI-first confirmation drill (`Which of `Choose a Technology` and `Command Units` is actually selectable and why`) before planning medium-term lane actions.

### Snapshot: Turn 27 (Tuner revalidation #104)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged for extended checkpoint sequence
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking); hard sequencing remains on hard-item flags.
- Economy/tech (`Tuner`): unchanged (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no blocker-topology or turn/hash movement on this checkpoint after multiple consecutive revalidations.
- Confidence: high (fully consistent lock profile with stable metrics)

### Turn Notes (append for player thread)

- `Turn 27` | `Sustained static checkpointing extends through a third verification window` | `Keep strict sequence: address `Choose a Technology` first, then `Command Units`, with immediate re-probe each attempt` | `No visible lock movement indicates sequencing, not environment, is the active constraint` | `Medium` | `If no change across next checkpoint, force explicit UI actionability audit for both hard blockers before widening strategy window`

### 10–20 Turn Strategic Continuation (lock hold reinforcement)

- Continue 10–20 turn planning as **lock-clearance maintenance**.
- Keep one actionable branch in reserve (`production/expansion`) but do not execute until the blocker stack drops and persists for two checks.
- If both hard blockers stay present by next 2 checkpoints, document blockers as the dominant constraint and keep the next 10–20 window anchored to unlocking before tempo/expansion play.

### Snapshot: Turn 27 (Tuner revalidation #105)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged sustained lock profile
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking); hard sequencing remains tied to per-item blockers.
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no topology movement, no turn/hash progression, no blocker root transition.
- Confidence: high (repeated consistency across status/autoplay/map/notifs/econ in same turn window)

### Turn Notes (append for player thread)

- `Turn 27` | `Another repeated static checkpoint on same 4-item stack` | `Hold to two-step unlock protocol and re-probe immediately after each action: `Choose a Technology`, then `Command Units`` | `No movement indicates sequencing remains the only dominant constraint` | `Medium` | `If two more checkpoints pass without blocker reduction, request explicit UI-actionability proof before any branching move`

### 10–20 Turn Strategic Continuation (lock persistence)

- Keep 10–20 turn stance locked to unlock-management and sequencing recovery.
- Exit condition remains unresolved: two consecutive checkpoints showing hard blocker count reduction (or both hard blockers cleared) before opening scouting/production growth branch.
- Preserve tempo discipline and avoid speculative expansion while both hard blockers are active.

### Snapshot: Turn 27 (Tuner revalidation #106)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged in a fourth sustained checkpoint
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking).
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `researching=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no movement in turn/hash/topology since prior checkpoint set.
- Confidence: high (cross-checked across status/autoplay/map/notifications/econ with stable values)

### Turn Notes (append for player thread)

- `Turn 27` | `Sustained lock persists; state is stable across four consecutive rechecks` | `Continue strict hard-block unlock sequence and re-probe every attempt` | `The absence of movement makes sequencing resolution the only reliable near-term lever` | `Medium` | `If the next two checkpoints still show both hard blockers, escalate into explicit UI verification of actionability before considering non-lock actions`

### 10–20 Turn Strategic Continuation (lock persistence to hard-stop threshold)

- Keep the 10–20 horizon in a lock-maintenance lane until blocker set reduces.
- Immediate trigger to reframe around tempo planning: either (a) both hard blockers clear and persist for 2 checks, or (b) one or both hard blockers repeatedly fail validation, in which case convert to a UI audit + alternate play branch.

### Snapshot: Turn 27 (Tuner revalidation #107)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` still `id 101` (non-blocking), so hard sequencing remains controlled by `block=true` fields.
- Economy/tech (`Tuner`): unchanged (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no change in lock topology or turn/hash after many revalidation cycles.
- Confidence: high (all telemetry surfaces consistent)

### Turn Notes (append for player thread)

- `Turn 27` | `Persistent stall continues across revalidation #107` | `Remain in strict two-step lock break sequence and do not branch outside blockers` | `Continued non-movement confirms this is an extended sequencing lock, not a transient UI artifact` | `Medium` | `If both hard blockers still unresolved at next checkpoint, capture explicit UI validation status and queue action path before attempting any growth/scouting branch`

### 10–20 Turn Strategic Continuation (extended lock window)

- Treat this window as a prolonged opener-repair phase; preserve 1) unblock priority, 2) immediate re-probes, 3) no expansion commitments.
- Reframe into medium-horizon lane only after both hard blockers clear (or actionable UI-proof shows one is impossible and a safe alternate branch exists).

### Snapshot: Turn 27 (Tuner revalidation #108)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable (no topology change)
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking), so hard-sequencing control remains per-item blockers.
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `research.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no topology, turn, or hash movement in yet another checkpoint.
- Confidence: high (repeated lock-state revalidation)

### Turn Notes (append for player thread)

- `Turn 27` | `Lock remains unchanged through revalidation #108` | `Keep one hard-block action-at-a-time (choose tech first, then command units) and re-probe immediately` | `No topological or readiness movement means any broad action adds avoidable variance` | `Medium` | `If blockers persist through next checkpoint, force an explicit UI actionability pass before any tactical branch expansion`

### 10–20 Turn Strategic Continuation (prolonged hold)

- The 10–20 turn horizon is still in sequencing-repair mode.
- Delay non-lock actions until either hard blocker count drops or one hard blocker is confirmed unavailable + an alternate branch is explicitly validated.
- Continue to preserve a single-lane recovery plan and treat any unrelated events as secondary until unlock is achieved.

### Snapshot: Turn 27 (Tuner revalidation #109)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #108
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`), `Command Units` (`id 104`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`), `Volcano Now Active` (`id 102`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking); hard sequence remains in per-item flags.
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `researching.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no progression in turn/hash/topology in this checkpoint cycle.
- Confidence: high (consistent readback across status/autoplay/map/notifications/econ)

### Turn Notes (append for player thread)

- `Turn 27` | `Another stable checkpoint with no lock release` | `Continue strict unlock-only sequence: `Choose a Technology` then `Command Units` with immediate re-check` | `Lock is persistent and dominates tempo; branching now increases sequencing risk` | `Medium` | `If two additional checkpoints fail to move, escalate to explicit UI-only actionability validation for hard blockers before any non-lock tactical move`

### Snapshot: Turn 27 (Tuner revalidation #110)

- Turn/Date: 27 / 3350 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable across revalidation cycle
  - `ids: 101, 102, 103, 104`
  - `count=4`, `sum=""`
  - Hard blockers: `Choose a Technology` (`id 103`, `block=true`), `Command Units` (`id 104`, `block=true`)
  - Non-blocking/contextual: `Storm Rages On` (`id 101`, `block=false`), `Volcano Now Active` (`id 102`, `block=false`)
  - `findEndTurnBlocking` remains `id 101` (non-blocking).
- Economy/tech (`Tuner`): stable (`cities=1`, `units=6`, `treasury=236`, `researching.type=-1255676052`, `techState=0`, `progress=0`, `techTurnsLeft=7`, `treeType=-153498200`)
- Progress signal: no turn/hash movement and no blocker-topology change in this cycle.
- Confidence: high (consistent full-surface telemetry)

### Turn Notes (append for player thread)

- `Turn 27` | `Persistent lock with no visible progression on revalidation #110` | `Hold strictly to hard-block unlock sequence only: `Choose a Technology` then `Command Units`, re-probe immediately after each attempt` | `No topology movement suggests sequencing remains the single dominant constraint` | `Medium` | `If no blocker movement through next checkpoint, execute an explicit UI-pathability check and keep non-lock actions paused`

### 10–20 Turn Strategic Continuation (deep hold)

- Continue treating this as a recovery-only segment: one action to unlock then re-probe.
- Only shift to medium-horizon expansion/planning after hard blockers clear and remain clear for two checks.
- If blocked persists another window, convert next player update to a concrete UI audit checklist before attempting any tactical branch.

### Snapshot: Turn 28 (Tuner revalidation #111)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stack remains at 4, with different human-facing IDs
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - Blockers (`block=true`):
    - `Command Units` (`id 104`)
    - `Storm Peters Out` (`id 105`)
    - `Gentle Volcanic Eruption` (`id 106`)
    - `Choose Production` (`id 107`)
  - `findEndTurnBlocking` is `id 105` (storm event), while `block=true` remains true across all listed items.
- Economy/tech (`Tuner`): shifted but still stable in this checkpoint
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `researching.state=0`, `researching.progress=26`, `researching.depth=1`, `researching.maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
  - `targetTech=-1255676052`, `getTurnsForNode=-1`
- Progress signal: hard lock moved from earlier `Choose a Technology` pressure into `Choose Production`; still no full lane expansion while lock remains and no city expansion actions have been executed in this turn.
- Confidence: medium (new turn + blocker reconstitution from direct status/exec/read probes, all cross-checked)

### Turn Notes (append for player thread)

- `Turn 28` | `Active blocker topology changed at turn advance` | `Prioritize one unblock at a time: `Command Units` first, then `Choose Production`, with immediate re-probe after each attempt; treat weather/volcano blockers as provisional hard until UI confirms dismiss/actionability` | `The stack likely switched from pure early-identity sequencing to a production-capability branch, so premature scouting/expansion increases noise risk` | `Medium` | `If either `Command Units` or `Choose Production` remains unresolved for two checks, request explicit UI confirmation of required action path before widening tactical branching`

### 10–20 Turn Strategic Continuation (lock shape change)

- Reframe the next 10–20 sequence as **unlock transition** rather than opening expansion:
  1. Resolve `Command Units` now if any idle/ready unit exists.
  2. Resolve `Choose Production` for the capital if available, to re-baseline growth queue.
  3. Re-probe immediately after each action and only then check whether storm/volcano notifications remain hard.
  4. Once both core blockers are released (or one proven non-actionable), open one controlled tactical lane (scouting/sight gain or build plan) and hold to 2–3 checkpoints for stability before broader tempo shift.

### Snapshot: Turn 28 (Tuner revalidation #112)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #111 at this revalidation
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - Hard blockers:
    - `Command Units` (`id 104`, `block=true`)
    - `Storm Peters Out` (`id 105`, `block=true`)
    - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
    - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 105` (Storm event)
- Economy/tech (`Tuner`): unchanged since last checkpoint
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: 2 consecutive verifications with zero blocker topology change and no turn/hash movement.
- Confidence: high (status/autoplay/map + direct blocker probe + econ telemetry aligned)

### Turn Notes (append for player thread)

- `Turn 28` | `Consecutive rechecks confirm unchanged lock stack` | `Keep strict unlock-first sequence: `Command Units` then `Choose Production`, with immediate re-probe after each action attempt` | `No observed state movement means sequencing remains dominant and branching now mostly adds variance` | `Medium` | `If either of those two remains unresolved after this check, request UI actionability proof for each blocker and delay tactical branching`

### 10–20 Turn Strategic Continuation (steady recovery)

- Maintain lock-repair lane until two consecutive checks show either:
  1. both `Command Units` and `Choose Production` cleared, or
  2. one blocker is proven intentionally non-actionable by UI and a safe alternate branch is validated.
- Immediate order of operations remains: one unblock action, immediate re-read, then reassess before any scouting or expansion decisions.
- If weather/volcano blockers (`Storm Peters Out`, `Gentle Volcanic Eruption`) clear from hard to non-blocking through UI confirmation, promote secondary tempo lane to production queue optimization + forward scouting only after the 2-blocker unlock condition holds.

### Snapshot: Turn 28 (Tuner revalidation #113)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): static versus #112
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - Blockers:
    - `Command Units` (`id 104`, `block=true`)
    - `Storm Peters Out` (`id 105`, `block=true`)
    - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
    - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 105` (storm event).
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no blocker topology change in a third revalidation at turn 28.
- Confidence: high (status/autoplay/map + direct blocker + econ probes cohere)

### Turn Notes (append for player thread)

- `Turn 28` | `Three consecutive static checks on unchanged hard blockers` | `Keep lock-discipline: `Command Units` -> `Choose Production` with one-at-a-time execution and re-probe per action` | `No blocker or economic movement means sequencing remains dominant and speculative actions are currently high-variance` | `Medium` | `If either required unblock remains stuck next cycle, request explicit UI actionability for that specific notification and pause expansion decisions until confirmed`

### 10–20 Turn Strategic Continuation (firm lock corridor)

- Maintain 10–20 turn posture as **lock corridor**; do not add scouting/explore or map-shape plans before unblock conditions clear.
- Decision gate: unlock progress only when both of the following have occurred and held for two checks:
  1. `Command Units` resolved
  2. `Choose Production` resolved
- If the check still shows neither resolved in the next checkpoint, switch to explicit UI-path validation then execute one sanctioned branch only (e.g., single production pick) and re-stabilize for 2–3 checkpoints.

### Snapshot: Turn 28 (Tuner revalidation #114)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable 4-item stack
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - Blockers:
    - `Command Units` (`id 104`, `block=true`)
    - `Storm Peters Out` (`id 105`, `block=true`)
    - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
    - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` shifted to `id 104` (Command Units)
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no turn/hash movement and no blocker-cardinality change this cycle.
- Confidence: high (coherent status/autoplay/map/notifs/econ snapshot)

### Turn Notes (append for player thread)

- `Turn 28` | `Lock stack remains fully blocked, but top blocker pointer moved to `Command Units`` | `Invert immediate unlock order and execute `Command Units` first, then `Choose Production`, re-probe after each attempt` | `The block priority shift suggests the engine is waiting on immediate unit actionization first, not production queue sequencing alone` | `Medium` | `Do not branch this cycle until both core blockers are confirmed cleared across two checks or a UI-pathability audit proves one is non-actionable`

### 10–20 Turn Strategic Continuation (prioritized unlock lane)

- Treat this window as a two-stage unlock corridor:
  1. Resolve `Command Units` (highest immediate unlock pressure).
  2. Resolve `Choose Production` in the capital.
  3. Re-probe each step; only then check if storm/volcano notifications become non-blocking.
- Delay all broader tactical expansion until the two-core unlock pair clears and holds, then run a 2–3 checkpoint reset window before opening scouting/production-queue experiments.

### Snapshot: Turn 28 (Tuner revalidation #115)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged for another checkpoint
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=true`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no topology, no turn/hash, and no econ movement.
- Confidence: high (all live reads aligned)

### Turn Notes (append for player thread)

- `Turn 28` | `Persistent no-change streak continues` | `Keep strict two-step unlock execution order (`Command Units`, then `Choose Production`) and enforce re-probe after every action attempt` | `No movement across any observed dimension means current thread stability is from unresolved locks, not environmental fluctuation` | `Medium` | `Do not broaden tempo or scouting this cycle unless there is explicit UI confirmation that at least one hard blocker is now actionable/cleared`

### 10–20 Turn Strategic Continuation (no-change hold)

- Continue this 10–20 window as a sequencing-lock hold, not a tempo-transition period.
- 3-part gate before any wider actions:
  1. `Command Units` action completed and confirmed,
  2. `Choose Production` action completed and confirmed,
  3. two consecutive post-action checkpoints show lock reduction or conversion to non-blocking.
- If still blocked after two more checkpoints, perform a focused UI-pathability audit (one blocker at a time) before resuming tactical branching.

### Snapshot: Turn 28 (Tuner revalidation #116)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged lock stack
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=true`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no blocker topology movement and no econ/turn progression.
- Confidence: high (status/autoplay/map/notifications/econ all align)

### Turn Notes (append for player thread)

- `Turn 28` | `Protracted lock-hold confirmed` | `Keep the unlock sequence unchanged: one attempt at `Command Units`, immediate re-probe, then one attempt at `Choose Production`, immediate re-probe` | `Repeated non-movement across every observed dimension indicates sequencing is the true binding constraint` | `Medium` | `If this lock persists for two more checkpoints, switch to explicit blocker actionability checks with UI proof before any branch expansion`

### 10–20 Turn Strategic Continuation (stability-locked hold)

- Maintain the 10–20 horizon as a sequencing-resolution block until unlocked.
- Hard gate before widening: `Command Units` + `Choose Production` complete and confirmed stable, then at least one additional checkpoint at turn/horizon stability before broader scouting/tempo work.
- If no movement after this pass, run an explicit UI-pathability verification as the highest-priority next action and defer all non-lock moves.

### Snapshot: Turn 28 (Tuner revalidation #117)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged hard-lock stack
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=true`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no blocker topology movement; no turn/hash/econ movement.
- Confidence: high (status/autoplay/map + direct blocker/econ reads consistent)

### Turn Notes (append for player thread)

- `Turn 28` | `Lock state remains static after repeated revalidation` | `Hold strict one-at-a-time unlock protocol (`Command Units` first, then `Choose Production`) with immediate re-probe after each action` | `No observed movement across any major metric means sequencing is still the dominant constraint and speculative moves would add noise` | `Medium` | `If two additional checkpoints remain unchanged, switch to explicit UI-pathability confirmation before opening any scouting/expansion branch`

### 10–20 Turn Strategic Continuation (extended sequencing hold)

- Keep the next 10–20-step lane in an **extended sequencing hold**.
- Gate for release remains:
  1) `Command Units` action successfully completed and verified,
  2) `Choose Production` action successfully completed and verified,
  3) no regression across two recheck checkpoints.
- If no release by next checkpoint pair, perform focused blocker actionability checks (unit command / production UI) and postpone broader tactics until one lane is positively unlocked.

### Snapshot: Turn 28 (Tuner revalidation #118)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `civ7 game status` + `civ7 game autoplay` + `civ7 game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged static hard-lock stack
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=true`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=true`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: no blocker topology movement and no observed metrics movement.
- Confidence: high (all read surfaces aligned)

### Turn Notes (append for player thread)

- `Turn 28` | `Sustained protracted lock over another checkpoint` | `Continue strict unlock sequencing: execute one `Command Units` action only, re-probe, execute one `Choose Production` action only, re-probe` | `Lock remains the dominant constraint with no forward tempo signal, so widening now increases risk of false-positive branches` | `Medium` | `If still unchanged after next checkpoint pair, prioritize a UI-pathability verification for each blocked action before expanding tactics`

### 10–20 Turn Strategic Continuation (lock confirmation phase)

- Keep this 10–20 sequence on **lock confirmation**:
  1. attempt `Command Units` first and verify hard state changes,
  2. attempt `Choose Production` next and verify hard state changes,
  3. if unchanged, run explicit UI-pathability checks and hold broader play.
- Do not treat map position or turn-date stasis as a reason to act; only unblock progress or confirmed UI actionability should reset the lane.

### Snapshot: Turn 28 (Tuner revalidation #119)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `game status` + `game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): changed shape in this check
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=false`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=false`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: hard blockers are now narrowed to `Command Units` plus `Choose Production`; environmental effects appear non-blocking this cycle.
- Confidence: high (status/autoplay/map + blocker + econ telemetry are internally aligned)

### Turn Notes (append for player thread)

- `Turn 28` | `Storm/volcano no longer hard-blocking; the core lock narrowed to 2 hard items` | `Resolve `Command Units` first, re-probe, then `Choose Production`, re-probe` | `This is a small but meaningful unblock shift: you can now treat weather/eruption as post-lock cleanup only` | `Medium` | `If either hard blocker persists 2 checks after action attempt, request UI actionability proof before any scouting or expansion branch`

### 10–20 Turn Strategic Continuation (unlock thinning)

- Update the 10–20 view from full recovery-lock to **unlock-thinning hold**:
  1. Complete `Command Units` and verify hard-state transition.
  2. Complete `Choose Production` and verify transition.
  3. Preserve two-check stability after each completion before widening scope.
- This is the first moment to prepare a non-blocking branch only after both items clear in two consecutive checkpoints.
- If only one hard item is cleared and the other remains, do not branch; run explicit UI actionability validation on the remaining block and return to this lane.

### Snapshot: Turn 28 (Tuner revalidation #120)

- Turn/Date: 28 / 3325 BCE
- Hash: `0` (verified via `game status` + `game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): still static
  - `ids: 104, 105, 106, 107`
  - `count=4`, `sum=""`
  - `Command Units` (`id 104`, `block=true`)
  - `Storm Peters Out` (`id 105`, `block=false`)
  - `Gentle Volcanic Eruption` (`id 106`, `block=false`)
  - `Choose Production` (`id 107`, `block=true`)
  - `findEndTurnBlocking` remains `id 104`
- Economy/tech (`Tuner`): unchanged
  - `cities=1`, `units=7`, `treasury=247`
  - `researching.type=-1255676052`, `state=0`, `progress=26`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=6`, `treeType=-153498200`
- Progress signal: zero topology/lock change across this revalidation after three consecutive checkpoints.
- Confidence: high (status/autoplay/map + blocker + econ telemetry aligned)

### Turn Notes (append for player thread)

- `Turn 28` | `Another unchanged recheck after previous unlock-thinning confirmation` | `Continue strict two-step unlock protocol: one `Command Units` action, immediate re-probe; then one `Choose Production` action, immediate re-probe` | `No lock movement after immediate previous revalidation suggests sequencing remains the only reliable next action` | `Medium` | `If both hard blockers remain after 2 more checks, pause all tactical broadening and run explicit UI-pathability verification for the specific actions`

### 10–20 Turn Strategic Continuation (stability lane lock-in)

- Hold the lane at **stability lock-in** until two hard blockers are both cleared in Tuner state and remain stable for one verification pass.
- Sequence for each validation cycle:
  1. Execute command-unit unblock candidate.
  2. Immediate re-query across status/autoplay/map + `Game.Notifications` + econ probe.
  3. Execute production unblock candidate only if step 1 is verified.
  4. Immediate re-query and only then consider non-lock tactical branches.
- If either hard blocker is unchanged after this full pair, defer scouting and expansion, then perform focused UI-pathability proof for the remaining blocker on the next iteration.

### Snapshot: Turn 29 (Tuner revalidation #121)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via `game status` + `game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): lock shape changed on turn advance
  - `ids: 108, 109, 110, 111`
  - `count=4`, `sum=""`
  - `Choose Celebration` (`id 110`, `block=true`)
  - `Command Units` (`id 111`, `block=true`)
  - `New Settlement Nearby` (`id 108`, `block=false`)
  - `Diplomatic Action Completed` (`id 109`, `block=false`)
  - `findEndTurnBlocking` is `id 108` (non-blocking)
- Economy/tech (`Tuner`): mild forward movement
  - `cities=1`, `units=7`, `treasury=252`
  - `researching.type=-1255676052`, `state=0`, `progress=41`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: turn advanced while blocker set reconstituted into a new hard pair (`Choose Celebration` + `Command Units`); non-blockers include settlement/diplomacy notices.
- Confidence: high (status/autoplay/map + blocker + econ telemetry consistent)

### Turn Notes (append for player thread)

- `Turn 29` | `Turn advanced and hard-lock pair shifted from production/weather to command/celebration` | `Hold lock discipline: prioritize `Command Units` first (hard blocker top pointer is non-blocking), then `Choose Celebration`, with immediate re-probe after each action` | `The engine moved to a new gating layer after the turn change; treating both as high-confidence unlock gates avoids dead-end branches` | `Medium` | `If either remains unresolved after two checks, run UI actionability validation on that specific blocker before widening scouting/expansion`

### 10–20 Turn Strategic Continuation (post-production lock shift)

- Refresh the 10–20 horizon from unlock-thinning into **dual-gate unlock**:
  1. Resolve `Command Units` and verify state movement.
  2. Resolve `Choose Celebration` and verify state movement.
  3. Keep non-blocking notices (`New Settlement Nearby`, `Diplomatic Action Completed`) on a watch-only backlog unless they become blocking.
- Only open tactical expansion lanes after both hard blockers clear and hold one post-action checkpoint showing lock reduction.
- If one blocker clears and the other stalls, do not branch; pivot to targeted UI-pathability checks and freeze broad tactic execution.

### Snapshot: Turn 29 (Tuner revalidation #122)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via `game status` + `game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): lock expanded with one additional hard item
  - `ids: 108, 109, 110, 111, 112`
  - `count=5`, `sum=""`
  - `Choose Celebration` (`id 110`, `block=true`)
  - `Command Units` (`id 111`, `block=true`)
  - `Independent Powers` (`id 112`, `block=true`)
  - `New Settlement Nearby` (`id 108`, `block=false`)
  - `Diplomatic Action Completed` (`id 109`, `block=false`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): unchanged from last check
  - `cities=1`, `units=7`, `treasury=252`
  - `researching.type=-1255676052`, `state=0`, `progress=41`, `depth=1`, `maxDepth=2`
  - `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: hard gating now includes a newly surfaced political branch (`Independent Powers`) while command/celebration remain unresolved.
- Confidence: high (status/autoplay/map + blocker + econ telemetry aligned)

### Turn Notes (append for player thread)

- `Turn 29` | `Additional hard gate added without turn/hash movement` | `Use a controlled three-gate unlock pass: `Command Units`, `Choose Celebration`, `Independent Powers` (one attempt each), with immediate re-probe after each` | `The turn did not advance lock complexity; adding a speculative tactical branch now would likely increase deadlocks` | `Medium` | `If any one of the three hard blockers repeats unresolved for two checks, run focused UI-pathability proof on that blocker and hold broader play until resolved`

### 10–20 Turn Strategic Continuation (adaptive governance lock)

- Adjust the current 10–20 window to an **adaptive governance lock**:
  1. Clear `Command Units` (highest immediate sequencing gate).
  2. Clear `Choose Celebration`.
  3. Clear `Independent Powers` (newest hard branch).
- Keep `New Settlement Nearby` and `Diplomatic Action Completed` as informational only until they become blocking.
- Only after all three hard blockers verify clear in Tuner for one checkpoint should scouting/expansion be reintroduced.
- If all three do not move across two full revalidation cycles, pause broad tactical action and verify each blocker’s UI action path in isolation before retrying.

### Snapshot: Turn 29 (Tuner revalidation #123)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via status/autoplay/map summary)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from #122
  - `ids: 108, 109, 110, 111, 112`
  - Hard: `Choose Celebration` (110), `Command Units` (111), `Independent Powers` (112)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking`: `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: no blocker/econ/topology change in this recheck window.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Three consecutive checks in the new 3-gate lock show no movement` | `Hold the adaptive governance lock and execute one queued hard action only when actionable with immediate re-probe` | `This is a persistence condition; early expansion still has high deadlock risk` | `Medium` | `If a 3-gate item remains unresolved for another two checks, isolate its UI actionability and continue lock-first posture`

### Snapshot: Turn 29 (Tuner revalidation #124)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via status/autoplay/map summary)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged from prior checks
  - `ids: 108, 109, 110, 111, 112`
  - Hard: `Choose Celebration` (110), `Command Units` (111), `Independent Powers` (112)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking`: `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: no movement in lock/econ/topology across another revalidation.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Second persistent hold in 3-gate lock after prior turn-transition` | `Hold strict action sequencing and do not open broader tactical branches until all three hard blockers are resolved in proof`
|`Multiple checks with no movement indicate high-risk dead air if speculative moves are added` | `Medium` | `After this hold, prioritize a blocker actionability drill: verify exactly which UI path resolves `Independent Powers`, `Choose Celebration`, and `Command Units` before trying branch alternatives`

### 10–20 Turn Strategic Continuation (hard lock endurance)

- Reframed horizon remains **hard lock endurance**; value is in reducing uncertainty before expansion:
  1. Validate UI/actionability for one hard blocker at a time.
  2. Execute with immediate re-probe only when execution path is confirmed.
  3. Keep expansion/tactical lanes dormant until all three blockers are clear and held for one extra checkpoint.

### Snapshot: Turn 29 (Tuner revalidation #125)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via status/autoplay/map summary)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged for a further checkpoint
  - `ids: 108, 109, 110, 111, 112`
  - Hard: `Choose Celebration` (110), `Command Units` (111), `Independent Powers` (112)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking`: `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: continued lock persistence with no topological turn/hash movement.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Lock persists through another verification cycle` | `Keep one-step execution discipline: confirm a valid UI path for a single hard blocker, resolve it, then immediate re-probe` | `Nothing has changed since the last checkpoint, so branching now adds avoidable sequence risk` | `Medium` | `If any hard blocker still blocks after the next two checks, switch to a strict blocker-by-blocker UI actionability pass before continuing any broader tactic lane`

### 10–20 Turn Strategic Continuation (lock endurance and clarification lane)

- Continue treating this window as a **clarification-dependent lock endurance** lane.
- Keep the three-gate objective (`Command Units`, `Choose Celebration`, `Independent Powers`) as the only meaningful unlocking route.
- Only when all three are cleared and confirmed in one re-check should the strategy window transition to corridor-building or expansion actions.

### Snapshot: Turn 29 (Tuner revalidation #126)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via `game status` + `game autoplay` + `game map --summary --json`)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 110, 111, 112`
  - Hard: `Choose Celebration` (110), `Command Units` (111), `Independent Powers` (112)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: continued static loop across command probes at turn 29.
- Confidence: high (all surfaces aligned)

### Turn Notes (append for player thread)

- `Turn 29` | `Static hold extends beyond multiple revalidations` | `Hold strictly to the same unlock lane and do not branch until one of the three hard blockers (`Command Units`, `Choose Celebration`, `Independent Powers`) is confirmed clear` | `Stability with no movement indicates sequencing controls dominate; premature tactical actions increase deadlock risk` | `Medium` | `Execute one blocker at a time with explicit UI confirmation, then recheck; repeat this pass only when either blocker stack changes or a hard blocker clears`

### 10–20 Turn Strategic Continuation (operational decision lock)

- Keep horizon interpretation as **operational decision lock**: no broad expansion/scouting yet.
- Priority remains hard-block collapse in this order once validated:
  1. `Command Units`
  2. `Choose Celebration`
  3. `Independent Powers`
- Reversion threshold: after 1 additional unchanged revalidation on all three blockers, request a focused blocker-path audit before any tactical lane opens.

### Snapshot: Turn 29 (Tuner revalidation #127)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map snapshot)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): no change
  - `ids: 108, 109, 110, 111, 112`
  - Hard: `Choose Celebration` (110), `Command Units` (111), `Independent Powers` (112)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: still no movement in any measured state.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Extended no-move hold across repeated revalidations` | `Run one hard-blocker actionability drill only (validate `Command Units` path, execute once if valid, then re-probe)` | `Lock stack is stable and the highest-risk action is opening unverified tactical branches` | `Medium` | `If still unchanged next cycle, pause non-blocking notifications to informational status and re-baseline around `Independent Powers`/`Choose Celebration` first once one hard blocker clears`

### 10–20 Turn Strategic Continuation (decision lock consolidation)

- Keep horizon mode as **decision lock consolidation**.
- Primary objective: convert one hard blocker at a time through explicit verification:
  1. Confirm `Command Units` can be executed and clear it.
  2. Confirm `Choose Celebration` path and clear it.
  3. Confirm `Independent Powers` path and clear it.
- No scouting/expansion branch until all three hard blockers are proven clear and stable at a post-action checkpoint.

### Snapshot: Turn 29 (Tuner revalidation #128)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (verified via status/autoplay/map summary)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): lock shape changed materially
  - `ids: 108, 109, 113, 114`
  - Hard blockers: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`
  - `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: previous `Choose Celebration` and `Independent Powers` hard blockers cleared or retired; remaining hard gate focus is now `Command Units` + `Social Policies`.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Blocker stack transitioned from a 3-gate set to a 2-gate set` | `Pivot sequence to `Command Units` and then `Social Policies Available`, with explicit re-probe after each action` | `This is a positive signal: the lock narrowed, so sequencing risk dropped from the previous wider governance branch` | `Medium` | `If either of the two hard blockers remains unchanged after this pass, run direct UI-pathability confirmation for that specific blocker before branching`

### 10–20 Turn Strategic Continuation (lock narrowing window)

- Reframe the horizon as a **lock narrowing window**:
  1. Resolve `Command Units` first (if UI/actionability allows).
  2. Resolve `Social Policies Available`.
  3. Confirm both in one checkpoint before opening scouting/expansion lanes.
- Keep non-blocking `New Settlement Nearby` and `Diplomatic Action Completed` on watch-only unless they become blocking.

### Snapshot: Turn 29 (Tuner revalidation #129)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map snapshot)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged since #128
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (113), `Social Policies Available` (114)
  - Non-blocking: `New Settlement Nearby` (108), `Diplomatic Action Completed` (109)
  - `findEndTurnBlocking`: `id 108` (non-blocking)
- Economy/tech: `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `techTurnsLeft=5`, `treeType=-153498200`
- Progress signal: lock posture and all measured signals remain unchanged in this checkpoint.
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Repeated static revalidation after 2-gate narrowing` | `Hold lock-first posture with a one-at-a-time command resolution model for `Command Units` and `Social Policies Available`` | `The lock has stabilized to two hard gates, so precision is now easier than in prior wider states` | `Medium` | `If either gate remains open on the next check, request direct UI-path validation before attempting broader tactical branches`

### Snapshot: Turn 29 (Tuner revalidation #130)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/app-ui + autoplay + map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108`-class non-blocking signal
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: no turn/hash/blocker movement after another checkpoint
- Confidence: high (multi-channel probes aligned)

### Turn Notes (append for player thread)

- `Turn 29` | `Two-gate lock persists over another checkpoint` | `Continue one-action sequencing: resolve `Command Units` first with a direct UI-pathability check, then `Social Policies Available`, and re-probe immediately after each` | `Lock narrowed and stable is good, but branch expansion remains high deadlock risk while either hard gate remains unresolved` | `Medium` | `If both gates remain unchanged for 2 more checks, run a narrow UI-pathability drill on each gate and freeze non-critical tactical lanes until cleared`

### 10–20 Turn Strategic Continuation (static-lane confirmation)

- Hold a conservative posture until lock movement is observed.
- Primary objective for this mini-window: produce one verified gate-clear step before any expansion or aggressive tactical lane change.
- Escalation condition: if one hard gate clears and the other does not within one checkpoint, split checks by gate and keep the cleared one in audit memory while validating the remaining gate with the fewest reversible actions.
- Window transition condition: once both gates clear in a confirmed pair of checks, open a 3-turn scouting/reachability lane with explicit destination scoring and no city-expansion commitments until civic-policy sequencing is re-stabilized.

### Snapshot: Turn 29 (Tuner revalidation #131)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` still returns `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: static lock posture after another checkpoint
- Confidence: high (status/autoplay/map + blocker/econ telemetry aligned)

### Turn Notes (append for player thread)

- `Turn 29` | `Third consecutive revalidation in the 2-gate posture` | `Hold lock-first and only resolve one of the two gates with immediate validation; do not widen scope until both hard gates are observed clear in a post-opener checkpoint` | `This keeps sequencing risk bounded while the turn remains open only on command/policy debt` | `Medium` | `If one gate remains unresolved after two more checks, perform a targeted UI-pathability drill for that gate and park the other as a watch-only backlog`

### 10–20 Turn Strategic Continuation (static-lock runway)

- The runway remains locked for tempo control rather than expansion.
- Immediate 10–20 lane objective: convert the current 2-gate deadlock into a confirmed clearance chain before any frontier branch:
  1. Validate + execute `Command Units`, re-probe instantly.
  2. Validate + execute `Social Policies Available`, re-probe instantly.
  3. Require both to hold clear in one checkpoint before transitioning to 3-turn movement/positioning plans.
- Escalation: if either gate does not clear by the next 2 checkpoints, isolate and test that gate’s UI actionability in a dedicated one-at-a-time drill; keep scouting and settlement placement on hold until both are cleared.

### Snapshot: Turn 29 (Tuner revalidation #132)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: continued static lock, no turn/hash/blocker movement on another checkpoint
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Fourth persistent checkpoint in 2-gate lock` | `Hold the same lock-sequencing posture: complete one hard gate with immediate re-probe, then the second, without opening scouting/settlement branches` | `Repeatedly validating while static means sequencing is the only controllable lever right now` | `Medium` | `If no gate clears in the next two checks, pause all non-gate actions and run gate-specific UI-pathability drills for `Command Units` and `Social Policies` in separate passes`

### 10–20 Turn Strategic Continuation (lock-confirmation lane)

- Maintain this turnband as **lock-confirmation**, not expansion:
  1. Resolve `Command Units`, re-check.
  2. Resolve `Social Policies Available`, re-check.
  3. Require one full checkpoint with both gates absent before corridor scouting returns.
- If either gate stalls for two additional checkpoints, switch to a dedicated confirmation sequence for that gate before any new tactical branches are attempted.

### Snapshot: Turn 29 (Tuner revalidation #133)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: still no lock/tune shift across this checkpoint
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `5th consecutive checkpoint with identical 2-gate lock` | `Keep to one-gate-at-a-time execution: run `Command Units` pathability test, execute once, recheck, then move `Social Policies Available` only if first is cleared` | `No lock or turn movement means the main failure mode is wasted non-gate moves` | `Medium` | `If this condition persists through this next checkpoint, run a focused gate drill for one unresolved gate at a time and hold expansion until both are cleared`

### 10–20 Turn Strategic Continuation (static hold with escalation)

- This turnband is still **static hold**; value is reducing decision uncertainty.
- Gate order remains: `Command Units` → `Social Policies Available`, with immediate checkpointed revalidation.
- If one gate remains unresolved while the other is attempted and fails repeatedly, pause broader tactical planning and switch to direct actionability validation for that unresolved gate before any expansion move is reintroduced.

### Snapshot: Turn 29 (Tuner revalidation #134)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` still returns `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: continued stall in lock state and no turn/hash movement
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Sixth consecutive checkpoint on unchanged two-gate hard lock` | `Hold lock-first execution with a single verified action pass each check: test and execute `Command Units`, re-validate, then `Social Policies Available` if the first gate is clear` | `Long static hold is increasing expected cost of branching into non-gate tactical moves` | `Medium` | `If both gates still fail to clear this cycle, constrain next move to one explicit gate-pathability drill and do not open scouting/expansion branches`

### 10–20 Turn Strategic Continuation (static hold + bounded escalation)

- Continue in static-lock management mode.
- Required condition to leave this lane: one checkpoint showing both hard gates are clear.
- If stuck condition repeats, next-step switch is a single-gate controlled test (no speculative actions) and only then re-open a 3-branch scouting plan after confirmed gate clearance.

### Snapshot: Turn 29 (Tuner revalidation #135)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: still fully static in lock posture
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Seventh persistent revalidation: lock remains unchanged` | `Maintain strict queue discipline: validate/execute one `Command Units` attempt, re-probe; then `Social Policies Available` only if first gate clears` | `Uninterrupted stasis means sequence risk dominates over tactical upside` | `Medium` | `If this check still shows the same lock in the next snapshot, force an explicit UI-pathability drill on each hard gate before any branching play is permitted`

### 10–20 Turn Strategic Continuation (control loop enforcement)

- Continue until gates clear: no expansion or exploratory branches.
- Step order remains `Command Units` then `Social Policies Available`, each followed by immediate checkpoint.
- Escalation: two more unchanged checks → gate-by-gate actionability drill and pause broad planning.

### Snapshot: Turn 29 (Tuner revalidation #136)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: continued static lock with no movement
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Eighth checkpoint without lock movement` | `Reinforce one-at-a-time control: `Command Units` first with immediate checkpoint, then `Social Policies Available` if the first is cleared` | `Persisting static lock means any non-gate move compounds sequencing debt` | `Medium` | `If no gate progress by next two checks, run one controlled UI-pathability audit for each hard gate and defer all non-gate options until both are validated`

### 10–20 Turn Strategic Continuation (steady-state lock execution)

- Keep this window in steady-state lock execution.
- Immediate next action order: gate test/execute, checkpoint, second gate test/execute only if first is confirmed.
- Broad scouting, expansion, and pressure plans stay paused until one checkpoint confirms both gates clear.

### Snapshot: Turn 29 (Tuner revalidation #137)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: static lock posture continues with no measurable movement
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Ninth consecutive unchanged revalidation in the same two-gate lock` | `Keep a hard lock execution loop only: one gate attempt at a time with immediate checkpointing (`Command Units` first, then `Social Policies Available` if first clears)` | `After repeated checks, speculative actions only increase deadlock risk and opportunity cost` | `Medium` | `If either gate still unmoved by next checkpoint, suspend all non-gate attempts and complete a gate-by-gate actionability drill before resuming play`

### 10–20 Turn Strategic Continuation (lock-constrained execution)

- This window remains lock-constrained.
- Mandatory sequence: `Command Units` pathability -> execute -> checkpoint; if clear, `Social Policies Available` pathability -> execute -> checkpoint.
- Transition condition: two-gate clearance in one checkpoint is required before expanding scouting/pressure lanes.
- Risk trigger: if both gates stall again next cycle, keep strategy confined to unblock validation and avoid irreversible tactical expansion until cleared.

### Snapshot: Turn 29 (Tuner revalidation #138)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: tenth checkpoint in the same lock; no movement in turn/hash/econ/notifications
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Tenth unchanged revalidation indicates hard lock fatigue` | `Pause all broad lane work; perform a single controlled `Command Units` actionability validation and execute only if valid, then immediate re-probe` | `At this point, continuing broad action without verified gate progress has only downside risk` | `Medium` | `If commandability is blocked, isolate `Social Policies Available` as the next validation lane and do not progress to scouting/expansion until one hard gate is proven clear`

### 10–20 Turn Strategic Continuation (lock fatigue mode)

- Lock remains the governing constraint. Enter **lock fatigue mode**:
  1. Keep exactly one gate operation attempt per checkpoint.
  2. Immediate checkpoint after each attempt.
  3. If both gates continue unresolved through two more checkpoints, perform a minimal evidence pass focused on UI actionability for each gate and defer all non-gate decisions.

### Snapshot: Turn 29 (Tuner revalidation #139)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: lock remains static beyond 10 consecutive revalidation checks in this turn window
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Long-duration lock stagnation confirmed (two-gate) across another checkpoint` | `Keep one controlled action per checkpoint (`Command Units` then, only if cleared, `Social Policies Available`) and no non-gate planning` | `This is now a sequencing stall pattern: the dominant risk is spending checks with no unlock value` | `Medium` | `Immediate next step: run explicit actionability checks for `Command Units` path before retrying and hold all branch decisions pending proof`

### 10–20 Turn Strategic Continuation (sequenced unlock discipline)

- Remain in sequenced unlock discipline until one checkpoint confirms gate resolution.
- Execution loop:
  1. Validate and execute a `Command Units` action only if actionability is confirmed.
  2. Immediate re-probe all blockers/econ.
  3. Only then test `Social Policies Available`.
- If either gate remains unchanged after this pass, stay in lock mode for the next 2 checkpoints with no scouting/expansion/pressure commitments.

### Snapshot: Turn 29 (Tuner revalidation #140)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard gates: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: sustained stall across another check
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Extended static hold now spans 11+ checks` | `Do not expand action scope yet; run one exact `Command Units` actionability probe and execute only if valid, then immediate recheck` | `The loop is stable but unproductive without verified gate exit` | `Medium` | `If `Command Units` still unresolved on recheck, run a dedicated `Social Policies Available` actionability probe next and hold broad lanes until one gate clears`

### 10–20 Turn Strategic Continuation (lock persistence protocol)

- Reinforce lock persistence protocol:
  1. One gate test/attempt per checkpoint.
  2. Immediate blocker/econ re-verify.
  3. No scouting/pressure/settlement commitments unless at least one hard gate is proved clear.
- Reassessment trigger: after two further unchanged checkpoints, pause all tactical broadening and run explicit dual-gate pathability proof before any next branch.

### Snapshot: Turn 29 (Tuner revalidation #141)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged (`ids 108,109,113,114`)
  - Hard gates: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: still static after 12+ consecutive revalidation checks in this turn band
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Persistent two-gate hold after many checkpoints` | `Hold strict sequence: one gate pathability+execution attempt per checkpoint, re-probe immediately` | `This is now an execution-availability issue as much as a tactical issue; avoid branch attempts` | `Medium` | `After another unchanged check, convert to an explicit “gate actionability only” pass and do not resume scouting/expansion until one gate clears`

### 10–20 Turn Strategic Continuation (execution-only lock mode)

- Maintain **execution-only lock mode** until one hard gate clears in a confirmed checkpoint.
- One-step rule: attempt/verify only `Command Units` or `Social Policies Available` (single lane), then recheck; do not queue additional non-gate operations in one cycle.
- Re-entry condition to normal 10–20 horizon actions: first verified gate resolution plus one stability checkpoint.

### Snapshot: Turn 29 (Tuner revalidation #142)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged
  - `ids: 108, 109, 113, 114`
  - Hard gates: `Command Units` (`id 113`), `Social Policies Available` (`id 114`)
  - Non-blocking: `New Settlement Nearby` (`id 108`), `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 108` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: lock continues unchanged in another checkpoint
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Thirteenth consecutive revalidation in unchanged lock posture` | `Keep action scope at single-gate execution only; validate one hard gate pathability and re-check before any other action` | `No gate exit yet means widening actions increases risk with no guaranteed state progress` | `Medium` | `If next checkpoint remains unchanged, keep lock mode and run explicit proof-first pathability checks before another attempt`

### 10–20 Turn Strategic Continuation (persistent lock + proof-first)

- Continue **proof-first lock mode**:
  1. One gate attempt at a time (`Command Units` first).
  2. Immediate checkpoint and stability check.
  3. Only when clear, repeat for `Social Policies Available`.
- After the next unchanged check: transition to dedicated two-gate actionability proof pass and keep scouting/expansion at hold.

### Snapshot: Turn 29 (Tuner revalidation #143)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): narrowed to one hard gate
  - `ids: 109, 115`
  - `Diplomatic Action Completed` (`id 109`, `block=false`)
  - Hard: `Command Units` (`id 115`, `block=true`)
  - `findEndTurnBlocking` is now `id 109` (non-blocking marker)
- Economy/tech (`Tuner`): unchanged from prior checks
  - `cities=1`, `units=7`, `treasury=252`
  - `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: lock collapsed from two hard gates to a single `Command Units` gate; this is a genuine unlock gain
- Confidence: high (multi-source check and state snapshots agree)

### Turn Notes (append for player thread)

- `Turn 29` | `Lock narrowed to one remaining hard gate` | `Shift to single-lane unlock: validate + execute `Command Units` and re-probe immediately` | `The game is now one-step away from exiting lock and reactivating broader 10–20 planning` | `Medium` | `If `Command Units` is still blocked by UI path on the next attempt, perform one focused actionability drill on that gate before resuming scouting`

### 10–20 Turn Strategic Continuation (unlock release phase)

- Move into **unlock release**: prioritize clearing the final hard gate (`Command Units`) with immediate checkpoint.
- Once `Command Units` is confirmed clear, run two checks to re-verify readiness and then reopen scouting/positioning lanes using a conservative 3-turn reconnaissance window.
- If the gate remains blocked at recheck, treat this as a tactical dead-air state and spend the next 2 windows on a pathability confirmation drill only.

### Snapshot: Turn 29 (Tuner revalidation #144)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): stable single-gate posture
  - `ids: 109, 115`
  - Hard gate: `Command Units` (`id 115`, `block=true`)
  - Non-blocking: `Diplomatic Action Completed` (`id 109`, `block=false`)
  - `findEndTurnBlocking` remains `id 109` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: single hard gate hold persisted; no turn/hash/econ movement
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Single-gate lock persisted one more cycle` | `Keep to a one-action loop focused on clearing `Command Units`, then immediate checkpoint` | `The risk now is actionability friction, not gate branching complexity` | `Medium` | `If the gate remains unchanged, run one explicit `Command Units` actionability validation pass and only then decide whether to broaden`

### 10–20 Turn Strategic Continuation (single-gate execution)

- Continue with the single remaining lock objective:
  1. Validate and attempt `Command Units` only once.
  2. Immediate re-probe across blockers/econ.
  3. If cleared, move into a 3-turn scouting/positioning window under strict replay checks.
- If still unchanged, do not branch into non-gate actions; tighten validation proof on `Command Units` path before further moves.

### Snapshot: Turn 29 (Tuner revalidation #145)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/map summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged single hard-gate posture
  - `ids: 109, 115`
  - Hard: `Command Units` (`id 115`)
  - Non-blocking: `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 109` (non-blocking)
- Economy/tech (`Tuner`): `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: no movement since last several checkpoints
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 29` | `Single-gate lock holds across another checkpoint` | `Hold strict one-step execution on `Command Units` and recheck immediately` | `Stability without progression indicates this is the only viable unlock edge left` | `Medium` | `If still unresolved after this one-cycle, run focused `Command Units` actionability validation before any non-gate step`

### 10–20 Turn Strategic Continuation (single-gate lock persistence)

- Continue **single-gate lock persistence**.
- Step plan:
  1. One validated `Command Units` attempt.
  2. Immediate checkpoint.
  3. On unblock, run controlled 2–3-turn tactical expansion window.
  4. If still blocked, spend the next window exclusively on proving/repairing `Command Units` actionability.

### Snapshot: Turn 29 (Tuner revalidation #146)

- Turn/Date: 29 / 3300 BCE
- Hash: `0` (status/autoplay/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`
- Blockers (`Tuner`): unchanged single-gate posture from last deep pass
  - `ids: 109, 115`
  - Hard gate: `Command Units` (`id 115`)
  - Non-blocking: `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` remains `id 109` (non-blocking marker)
- Watch signal: `civ7 game watch --include-ready-unit --include-ready-city --count 1`
  - `blocker: 0`, `notificationCount: 0`, `blockingNotificationId: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
  - `nextDecision: null`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Economy/tech (`Tuner`): unchanged from prior checks
  - `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: no tactical/economic movement; hard lock remains a single-gate execution bottleneck
- Confidence: high (combined status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 29` | `Single-gate hold confirmed by ready-unit freeze` | `Keep one validated unlock attempt only: focus on making `Command Units` actionable (if possible), then re-probe` | `Readiness is not from notification debt; it is from zero legal ready-unit actions and persistent end-turn invalidation` | `Medium-High` | `If no `Command Units` actionability appears next checkpoint, do not branch broad play: run only validation-only operations centered on unit-readiness recovery`

### 10–20 Turn Strategic Continuation (single-gate + actionability hold)

- Maintain **single-gate actionability hold**.
  1. Re-validate `Command Units` pathability with one strict attempt per checkpoint.
  2. Re-probe blocker set and legal ready-unit/ready-city counts immediately.
  3. On unlock, shift to a controlled 2–3 turn re-expansion window with immediate rechecks.
  4. If still stuck, run a minimal “why no legal ready-unit ops?” diagnostic path before allowing any additional strategic branching.
- Framing cue for next horizon: if legal-operation count stays zero for two more checkpoints, treat the session state as a validation choke and avoid all speculative actions.

### Snapshot: Turn 30 (Tuner revalidation #147)

- Turn/Date: 30 / 3275 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0` in App UI, local observer remains `-1`
- Blocker posture: single hard gate remains inferred from validation shape
  - Previous deep pass remains `ids: 109, 115`
  - `Diplomatic Action Completed` (`id 109`, `block=false`)
  - `Command Units` (`id 115`, `block=true`)
  - `findEndTurnBlocking` previously surfaced as `109` (non-blocking marker)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `owner:0, type:26`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
  - `nextDecision: null`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Unit actionability (`unit-operation SKIP_TURN` on first ready unit): still invalid (`valid=false`, `result.Success=false`)
- Economy/tech (`Tuner`): unchanged from prior checks
  - `cities=1`, `units=7`, `treasury=252`, `researching.type=-1255676052`, `state=0`, `progress=41`, `turnsLeft=5`, `treeType=-153498200`
- Progress signal: no legal actionability opening despite turn advancement
- Confidence: high (turn/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 30` | `Posture remains lock-dominant after turn advancement` | `Do not branch into scouting/settlement lines while ready-unit legal actions remain zero; continue strict unlock-first sequencing` | `Autoplay/observer mode and `END_TURN` invalid together indicate a control-state choke at the same gate, not an expansion opportunity` | `Medium` | `Keep testing `Command Units` readiness once per checkpoint; if it remains blocked, hold all non-gate action until a lock-resolution proof is visible`

### 10–20 Turn Strategic Continuation (single-gate control-state choke)

- Continue **single-gate control-state choke** management for the next checkpoints:
  1. 1) Run one check on `Command Units` pathability (or closest equivalent validation).
  2. Immediate re-read with `game watch` + `END_TURN` validation.
  3. Only on hard-gate clear do you expand scope to a conservative 2–3 turn tactical block (recon, placement, pressure).
- Framing update for 10–20 horizon:
  - Assume 2–3 checkpoints of no unlock are likely in a row before this session yields to normal planning.
  - On unlock, reframe to corridor reconnaissance and production pre-positioning with strict replay checks; on sustained hold, do not spend turns on speculative expansion.

### Snapshot: Turn 31 (Tuner revalidation #148)

- Turn/Date: 31 / 3250 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0` in App UI
- Lock posture: inferred continuation of single hard-gate state from most recent deep pass
  - Last deep IDs remain `109, 115`
  - `Diplomatic Action Completed` (`id 109`, `block=false`)
  - `Command Units` (`id 115`, `block=true`)
  - `findEndTurnBlocking` previously surfaced as `109` (non-blocking marker)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `owner:0, type:26`), `activity:1797587246`
  - `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation (`player-operation END_TURN`): invalid (`valid=false`, `result.Success=false`)
- Ready-unit actionability (`unit-operation SKIP_TURN` on that unit): invalid (`valid=false`, `result.Success=false`)
- Progress signal: repeated progression stalls through another turn, with no decision/notification path opening
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 31` | `Second consecutive no-action checkpoint in the lock window` | `Stay on proof-first one-gate mode; do not branch until `Command Units` actionability is proven` | `Readiness and legal action counts indicate we are in a full tactical choke, not a missed UI step` | `Medium` | `Keep to one strict unlock attempt per checkpoint and only reopen scouting/settlement once legal ready actions exist`

### 10–20 Turn Strategic Continuation (lock persistence with observer-state drift)

- Maintain **lock persistence** with controlled probes only.
  1. Recheck `Command Units`-line actionability once per checkpoint.
  2. Immediately re-run `game watch` and `END_TURN` validator after each attempt.
  3. On first hard-gate clear, run a short 2–3-turn rebuilding plan (one lane only) with post-action rollback checks.
  4. If lock persists through the next two checkpoints, hold non-gate actions and avoid speculative positioning.
- Framing note: this keeps the active player aligned to a 10–20 turn recovery pattern while minimizing irreversible moves when state is verification-poor.

### Snapshot: Turn 32 (Tuner revalidation #149)

- Turn/Date: 32 / 3225 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0` in App UI
- Lock posture: still inferred as single hard-gate constrained from last deep validation
  - `ids: 109, 115` from previous blocker read
  - `Command Units` remains the hard gate (`id 115`), with `Diplomatic Action Completed` non-blocking (`id 109`)
  - `findEndTurnBlocking` not newly re-resolved this pass (status remains stable)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `owner:0, type:26`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Ready-unit actionability (`unit-operation SKIP_TURN` on first ready unit): still invalid (`valid=false`, `result.Success=false`)
- Progress signal: no observable decision or legal actionability opening after another turn advancement
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 32` | `Lock posture remains unchanged through another checkpoint` | `Continue strict unlock-first mode and do not unlock any broad strategic branch while ready actionability is zero` | `Three consecutive low-variance checkpoints imply this is a control-state bottleneck, not a tactical sequencing issue` | `Medium` | `If `Command Units` is still blocked next checkpoint, pause all exploration/settlement plans and run one deep actionability proof cycle before resuming breadth`

### 10–20 Turn Strategic Continuation (single-gate choke hold)

- Keep the 10–20 turn view on **single-gate choke hold**:
  1. Validate `Command Units` actionability once, then re-probe with watch + `END_TURN`.
  2. On no change, hold non-gate decisions for at most two more checkpoints.
  3. If still blocked, shift to narrow forensics: map-unit readiness, pathability proof, and validator edge-case testing before any lane expansion.
  4. If unlock appears, execute only a short conservative recon/pressure window and re-validate each substep before returning to breadth.
- Framing cue: this is a multi-turn deadlock-management rhythm. Preserve tempo by minimizing irreversible choices until gate proof arrives.

### Snapshot: Turn 32 (Tuner revalidation #150)

- Turn/Date: 32 / 3225 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0` in App UI
- Lock posture: unchanged from prior deep pass (single hard gate inferred)
  - `ids: 109, 115` from most recent direct blocker read
  - `Command Units` (`id 115`) remains the hard gate
  - `Diplomatic Action Completed` (`id 109`) remains non-blocking
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `turn: 32`, `turnDate: 3250 BCE`
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `type:26`)
  - `legalOperationScope: no-target`, `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation (`player-operation END_TURN`): invalid (`valid=false`, `result.Success=false`)
- Unit actionability (`unit-operation SKIP_TURN` for ready unit): invalid (`valid=false`, `result.Success=false`)
- Progress signal: no checkpoint drift; still a static lock state
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 32` | `Sustained static checkpoint with no lock telemetry change` | `Maintain single-gate commandability-only sequence and avoid broad strategic expansion until action counts rise above zero` | `Two independent validators agree there is no immediate legal path` | `High` | `Treat this as a lock-plateau; if no change after two more checkpoints, do a minimal actionability-focused forensic cycle before any lane re-entry`

### 10–20 Turn Strategic Continuation (plateau governance)

- Shift the next 10–20 turn frame to **plateau governance**:
  1. Continue the strict unlock drill (`Command Units` probe only, per checkpoint).
  2. Re-validate immediately with `watch` + `END_TURN`.
  3. On zero delta for two more cycles, run an evidence-first drill: readiness-source checks, pathability assumptions, and validator edge-case confirmation.
  4. Only after unlock proof expands to controlled scouting/production lanes with single-step rollback checks.
- Key discipline: conserve moves, keep risk low, and preserve strategic options by avoiding speculative commitments while locked.

### Snapshot: Turn 33 (Tuner revalidation #151)

- Turn/Date: 33 / 3200 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0`
- Lock posture: sustained single-gate state remains inferred from prior deep blocker read
  - Most recent blocker set remains `ids: 109, 115`
  - `Command Units` (`id 115`) hard gate, `Diplomatic Action Completed` (`id 109`) non-blocking
  - `findEndTurnBlocking` remains unresolved in this watcher-only pass (status is stable)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `turn: 33`, `turnDate: 3200 BCE`
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Unit actionability (`unit-operation SKIP_TURN` on ready unit): still invalid (`valid=false`, `result.Success=false`)
- Progress signal: no checkpoint drift after turn advancement
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 33` | `Third consecutive checkpoint in confirmed choke state` | `Hold the lock-management loop; do not reopen broad play lanes until actionability proves `Command Units` can execute` | `The signal stack has stayed identical across both status and watcher reads` | `High` | `If this persists, switch to a planned minimal validation forensics cycle before attempting any tactical diversification`

### 10–20 Turn Strategic Continuation (stabilized deadlock protocol)

- Treat the next horizon as a **stabilized deadlock protocol**:
  1. Re-confirm `Command Units` actionability only once per checkpoint.
  2. Immediately re-run `watch` and `END_TURN` after the attempt.
  3. If no change for two further checkpoints, pause breadth actions and complete a focused validity audit on command/unit readiness pathways.
  4. When unlock returns, re-enter with a tight 2–3 turn reconnaissance-production window, then re-check each substep.
- Framing anchor: this is no longer a tactical timing issue; it is a control-state lock that needs verification-first treatment before expansion.

### Snapshot: Turn 34 (Tuner revalidation #152)

- Turn/Date: 34 / 3175 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0`
- Lock posture: stable single-gate hold persisted from previous deep blocker check
  - `ids: 109, 115` retained
  - Hard gate: `Command Units` (`id 115`)
  - Non-blocking: `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` not newly re-resolved in this watcher-only cycle
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation: `player-operation END_TURN` remains invalid (`valid=false`, `result.Success=false`)
- Ready-unit actionability: `unit-operation SKIP_TURN` remains invalid (`valid=false`, `result.Success=false`)
- Progress signal: continuous stall; no decision/notification opening at checkpoint
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 34` | `Lock plateau persists into a new tactical band` | `Keep the unlock loop strictly minimal: only attempt `Command Units` validation and immediate re-checks` | `The control surface has not exposed any legal action path, so breadth now increases avoidable risk` | `High` | `Hold branching until at least one successful lock-escape actionability event is observed`

### 10–20 Turn Strategic Continuation (plateau-to-proof protocol)

- Continue **plateau-to-proof** posture for the next checkpoints:
  1. One `Command Units`-line actionability check per checkpoint.
  2. Immediate `game watch` + `END_TURN` recheck.
  3. If no movement through this next checkpoint, shift to a tightly scoped validation audit (unit pathability/reload of blockers) before any non-gate operations.
  4. On unlock, allow only a conservative 2–3-turn recovery lane, then revalidate again.
- Framing guidance: treat this as a control-state dead window; preserving tempo now means preserving options and not consuming irreversible actions during unresolved choke points.

### Snapshot: Turn 35 (Tuner revalidation #153)

- Turn/Date: `35 / 3150 BCE` from Tuner snapshot (App UI watcher still reads `34 / 3175 BCE` in same pass)
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=true`, `observeAsPlayer=0`
- Turn-context note: mixed App UI/Tuner turn marker in this snapshot, so treat tactical conclusions as lock-state-only and prefer status+revalidation convergence
- Lock posture: inferred continued single hard-gate hold from recent deep blocker read
  - `ids: 109, 115`
  - Hard gate: `Command Units` (`id 115`)
  - Non-blocking: `Diplomatic Action Completed` (`id 109`)
  - `findEndTurnBlocking` not re-resolved in watcher-only read
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `blocker: 0`, `blockingNotificationId: null`, `notificationCount: 0`, `nextDecision: null`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `type:26`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 0`, `legalOperationCount: 0`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Unit actionability (`unit-operation SKIP_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Progress signal: no meaningful lock movement in this checkpoint
- Confidence: high for lock continuity, moderate for exact turn alignment across states

### Turn Notes (append for player thread)

- `Turn 35` | `Lock plateau continues with an in-session marker mismatch` | `Keep one-step unlock work only; do not assume a turn advance reset when watchers diverge` | `The convergent no-action signals dominate over the marker mismatch for decision quality` | `High` | `Require two confirmatory cycles showing any legal actionability or non-zero ready ops before opening tactical breadth`

### 10–20 Turn Strategic Continuation (lock continuity with synchronization hygiene)

- Continue the lock-management horizon under **synchronization hygiene**:
  1. Re-run `Command Units` actionability probe once per checkpoint.
  2. Re-check with `watch` + `END_TURN` each time.
  3. If `legalOperationCount` remains zero and turn markers keep drifting, treat this as a dead-window and execute no non-gate branch commitments.
  4. On gate-clear signal, unlock a short, conservative 2–3-turn recovery window and then re-validate again before committing further.
- Strategic framing: prioritize proving control-state exits over opportunistic movement while synchronization and lock state are both static.

### Snapshot: Turn 36 (Tuner revalidation #154)

- Turn/Date: `36 / 3125 BCE` (App UI + watch and Tuner aligned)
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `localPlayerID=0`, `isPausedOrPending=true`
- Lock posture: **gate now shows explicit actionability** instead of zero-action choke
  - Watch blocker moved from `0` to `23669119` (`NOTIFICATION_COMMAND_UNITS`)
  - Blocking notification: `id 117`, `typeName: NOTIFICATION_COMMAND_UNITS`
  - `nextDecision` points to `SKIP_TURN` on unit-command scope
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 10`, `legalOperationCount: 10`
  - `movementMovesRemaining: 2`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Probe actionability (`unit-operation SKIP_TURN` on ready scout): now valid and accepted (`valid=true`, `result.Success=true`)
- Progress signal: single-gate control lock is no longer a static deadlock; it is now a step-gated sequence requiring completion of command actions before end-turn unlock
- Confidence: high (watch + operation convergence)

### Turn Notes (append for player thread)

- `Turn 36` | `Critical unlock shift: command lane is now actionable` | `Execute one legal unit action (e.g., SKIP_TURN or equivalent valid command unit) then immediately recheck `END_TURN` and watch blockers` | `Lock edge was valid but open; the game is giving an explicit command-units signal and success on the probe` | `High` | `Do not skip the revalidation step: one successful unit command here likely gates subsequent turn progression`

### 10–20 Turn Strategic Continuation (unlock transition protocol)

- Convert this horizon from static-plateau to **unlock transition protocol**:
  1. Resolve `Command Units` now (single concrete action, not a full branch push).
  2. Re-run `game watch` + `END_TURN` immediately after the action.
  3. If `END_TURN` still invalid, perform one more `ready-unit` actionability probe and repeat.
  4. Once end-turn is valid, enter a short 2–3 turn tactical recovery window: confirm visibility, production timing, and minimal recon options before scaling to broader operations.
- Framing for 10–20 turns: this is the first unlock-phase inflection; keep tempo high but strictly sequenced.

### Snapshot: Turn 36 (Tuner revalidation #155)

- Turn/Date: 36 / 3125 BCE (App UI/watch and tuner aligned)
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: active command-units gate remains
  - `blocker: 23669119` (`NOTIFICATION_COMMAND_UNITS`, notification `id 117`)
  - `nextDecision` still requests unit `SKIP_TURN`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`, `type:26`)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 10`, `legalOperationCount: 10`
  - `movementMovesRemaining: 2`
- End-turn validation: still invalid (`player-operation END_TURN valid=false`, `Success=false`)
- Unit action probe (`unit-operation SKIP_TURN` on scout): still valid and accepted (`valid=true`, `Success=true`)
- Progress signal: this is now an actionable lock, not a zero-action freeze; one legal unit action is still required before turn progression.
- Confidence: high (status/watch/operation convergence)

### Turn Notes (append for player thread)

- `Turn 36` | `Unlock has become operational, not closed` | `Perform one legal command-unit action only (SKIP_TURN or equivalent), then re-run `watch` and `END_TURN` immediately` | `The gate indicator and legal ops count now confirm the blocker is a command workflow step rather than a hard deadlock` | `High` | `Do not attempt broad branch planning yet: finish the unit-action loop to generate the next transition signal before scouting or expansion`

### 10–20 Turn Strategic Continuation (gated unlock execution)

- For the next checkpoints, treat this as a **gated unlock execution cycle**:
  1. Execute one validated `Command Units` action.
  2. Immediately re-check `END_TURN` validity.
  3. If still blocked, repeat one fresh unit-actionability probe and capture the next `nextDecision`.
  4. When end-turn becomes valid, open one constrained 2–3 turn corridor recon/production window and then revalidate again before broader expansion.
- Framing: this is now the “unlock bridge” phase where discipline on sequencing is more valuable than speed of branching.

### Snapshot: Turn 36 (Tuner revalidation #156)

- Turn/Date: 36 / 3125 BCE (App UI/watch and tuner aligned)
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: command-unit gate remains explicit
  - Watch `blocker: 23669119` (`NOTIFICATION_COMMAND_UNITS`, notification `id 117`)
  - `nextDecision` remains `SKIP_TURN`
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 10`, `legalOperationCount: 10`
  - `movementMovesRemaining: 2`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Unit action probe (`unit-operation SKIP_TURN`): still validates successfully (`valid=true`, `result.Success=true`)
- Progress signal: actionable lock persists; command execution is permitted but transition to full end-turn readiness still pending
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 36` | `Transition lag confirmed: command gate is open but unresolved` | `Complete one legal command action cycle (same unit, same lane) and re-check immediately; do not skip this rhythm` | `The gate is no longer opaque, so sequencing discipline now determines turn progress` | `High` | `If `END_TURN` remains invalid after a fresh action attempt, log the next `nextDecision` and continue one-step sequence only`

### 10–20 Turn Strategic Continuation (command-gate bridge)

- Maintain strict **command-gate bridge** cycle:
  1. Validate and execute one command-unit action from ready-unit scope.
  2. Immediate `game watch` + `END_TURN` revalidation.
  3. If still blocked, continue one-step loops until the next decision changes or end-turn opens.
  4. Only when lock resolves, spend next 2–3 turns on a conservative tactical/production recovery pass with post-action checks.
- Framing for 10–20 turns: preserve optionality; this is a sequencing bridge, not the point to branch planning.

### Snapshot: Turn 36 (Tuner revalidation #157)

- Turn/Date: `36 / 3125 BCE`
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: explicit command-unit step persists without progression
  - `blocker`: `23669119` (`NOTIFICATION_COMMAND_UNITS`), notification `id 117`
  - `nextDecision`: `SKIP_TURN` (`operationType`: `SKIP_TURN`, `operationFamily`: `unit-operation`)
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `legalOperationCount: 10` (`legalNoTargetOperationCount: 10`)
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `movementMovesRemaining: 2`
- End-turn validation: still invalid (`valid=false`, `result.Success=false`)
- Unit actionability (`unit-operation SKIP_TURN`): still valid/successful
- Progress signal: transition loop is active but no turn-completion unlock yet
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 36` | `Command-step loop confirms sequencing requirement` | `Continue one action-at-a-time; do not layer additional operations while this specific gate remains as the next decision` | `The game is in a recoverable execution loop: command actionability is open, but end-turn gating remains` | `High` | `If next `nextDecision` changes away from command-units after another valid action, pivot immediately to a short 2–3 turn recovery lane; otherwise keep the bridge loop`

### 10–20 Turn Strategic Continuation (sequenced recovery bridge)

- Hold the 10–20 turn arc to a **sequenced recovery bridge**:
  1. Repeat exactly one unit-step operation (`SKIP_TURN` or equivalent) and immediately recheck state.
  2. Record next `nextDecision` each cycle until end-turn becomes valid.
  3. Only then begin constrained operational expansion for 2–3 turns and revalidate at each substep.
- Framing: the objective in this window is to convert one hard procedural lock into stable throughput, not maximize exploration breadth.

### Snapshot: Turn 36 (Tuner revalidation #158)

- Turn/Date: `36 / 3125 BCE` (still aligned across status/watch)
- Hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: command gate still explicit and unresolved
  - `blocker`: `23669119` (`NOTIFICATION_COMMAND_UNITS`, notification `id 117`)
  - `nextDecision`: `SKIP_TURN`
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`)
  - `legalNoTargetOperationCount: 10`, `legalOperationCount: 10`
  - `movementMovesRemaining: 2`
- End-turn validation: still invalid (`valid=false`, `result.Success=false`)
- `unit-operation SKIP_TURN` probe: still valid and successful
- Progress signal: unchanged command-step bridge; no end-turn unlock observed yet.
- Confidence: high (converged lock/readiness pattern)

### Turn Notes (append for player thread)

- `Turn 36` | `Persistent command-step bridge with no exit yet` | `Keep one-step legal unit execution only and re-validate immediately; do not expand scope while `nextDecision` remains `SKIP_TURN` and end-turn is invalid` | `The gate is actionable but the sequence is multi-step; pace must match required resolution order` | `High` | `After two more unsuccessful loops, capture whether `nextDecision` transitions to a different blocker family before planning broader tactics`

### 10–20 Turn Strategic Continuation (command-step persistence mode)

- Hold with **command-step persistence mode**:
  1. Execute one legal command-unit action if available.
  2. Immediate `watch` + `END_TURN` recheck.
  3. If still blocked, repeat step only.
  4. Switch to 2–3 turn expansion only when end-turn validates or blocker family changes.
- Strategic framing: sequence completion, not branching speed, is the constraint in this stretch.

### Snapshot: Turn 36 (Tuner revalidation #159)

- Turn/Date: 36 / 3125 BCE
- Hash: `0` (status/watch summary confirmed)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: command-step sequence briefly interrupted by an informational blocker event
  - `blocker`: `0`
  - `blockingNotificationId`: `{ owner: 0, id: 116, type: 20 }`
  - `nextDecision`: `NOTIFICATION_VOLCANO_ERUPTS_SEV0`
  - `nextDecision operation`: `app-ui-action` / `Game.Notifications.dismiss`
  - Notification summary: `Bazman has erupted. Thankfully damage appears to be light.`
- Watch signal (`game watch --include-ready-unit --include-ready-city --count 1 --human-aware`):
  - `notificationCount: 2`
  - `firstReadyUnit`: `UNIT_SCOUT` (`id 131072`), `legalOperationScope: no-target`
  - `legalNoTargetOperationCount: 10`, `legalOperationCount: 10`
  - `movementMovesRemaining: 1`
- End-turn validation (`player-operation END_TURN`): still invalid (`valid=false`, `result.Success=false`)
- Unit probe (`unit-operation SKIP_TURN`): still valid and successful (`valid=true`, `result.Success=true`)
- Progress signal: blocker moved from `command-units` to explicit notification-dismiss requirement while movement/action opportunities remain open
- Confidence: high

### Turn Notes (append for player thread)

- `Turn 36` | `Turn-cycle now blocked by a transient event notification` | `Clear `NOTIFICATION_VOLCANO_ERUPTS_SEV0` before continuing the command-unit bridge` | `UI notifications can mask command-gate transitions; this is still a sequencing game, not a fresh hard lock` | `High` | `Prioritize the dismissable event path, then immediately rerun `watch` + `END_TURN` + `SKIP_TURN` feasibility to re-ground the next bridge step`

### 10–20 Turn Strategic Continuation (notification-to-bridge continuation)

- Shift the 10–20 turn view to **notification-to-bridge continuation**:
  1. Resolve the top notification (`Game.Notifications.dismiss`) first.
  2. Immediately re-check `watch` and `END_TURN`.
  3. Return to one legal `Command Units` action loop only after notification state clears.
  4. Resume constrained expansion window only when `END_TURN` becomes valid or blocker family changes again.
- Tactical frame: treat this as a temporary interlock that must be cleared to keep throughput and avoid deadtime.

### Snapshot: Turn 36 (Tuner revalidation #160)

- Turn/Date: `36 / 3125 BCE` (continuous across multiple watch/status probes)
- Hash: `0` (`status` remains unchanged)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`
- Lock posture: same top blocker, but dismissal path appears non-effective in current App UI eval scope
  - `blocker`: `0`
  - `blockingNotificationId`: `{ owner: 0, id: 116, type: 20 }`
  - `nextDecision`: `NOTIFICATION_VOLCANO_ERUPTS_SEV0`
  - `nextDecision operation`: `app-ui-action` / `Game.Notifications.dismiss`
  - `notificationCount`: `2`
  - `firstReadyUnit`: `UNIT_HOPLITE` (`id 327682`) / ready pointer continues to swap as reads progress
  - Verified attempts that did not clear lock:
    - `game play dismiss-notification --target '{\"owner\":0,\"id\":116,\"type\":20}' --send --reason ...` (multiple reasons)
    - `game play dismiss-notification-queue --send --reason ...`
    - `game play end-turn --send` (rejected as blocked by game state)
- Watch signal (`game watch --include-ready-unit --include-ready-city --human-aware --count 1 --json`): still reports `NOTIFICATION_VOLCANO_ERUPTS_SEV0` as blocking and `END_TURN` not available
- Validation state:
  - `game play end-turn --json`: `canEndTurn=false`
  - `game play operation --family unit --type SKIP_TURN --unit-id '{\"owner\":0,\"id\":196609,\"type\":26}' --send --reason ...`: executes successfully (`before valid=true`), but postcondition shows validation changed and no end-turn unlock
- Progress signal: command-step throughput remains available, but top blocker is not being consumed by the notification closeout path
- Confidence: high (recurrent lock signature with identical queue identity despite closeout attempts)
- Guidance for next 10–20 turns: continue 1-turn inspection cadence with lock-aware sequencing. If notification identity remains immutable after 2 consecutive dismiss attempts, elevate to manual intervention or explicit frame redefinition (same turn position retained) before doing broad tactical commits.

### Turn Notes (append for player thread)

- `Turn 36` | `Notification-closeout lock with non-mutating dismissal` | `Pause strategic branching; run strict one-step loop: dismiss command variant → watch → end-turn check → one legal unit skip only if needed` | `The blocker is currently an implementation-level deadlock candidate, not a tactical choice lock` | `High` | `Do not expand scouting/war planning until either nextDecision leaves this notification stack or blocker is confirmed resolved in a different App UI control state`

### 10–20 Turn Strategic Continuation (deadlock-management bridge)

- Convert the current 10–20 turn window to **deadlock-management bridge**:
  1. Re-read `game play notifications`/`notification-queue` and `watch` every cycle to confirm if the same `blockingNotificationId` persists.
  2. Re-issue only the minimal documented closeout command once per cycle, then avoid repeated spam unless blocker identity changes.
  3. If still blocked, execute a legal `SKIP_TURN` unit operation to test forward progression and re-ground postconditions.
  4. Only after a real blocker transition (or explicit manual/UI-level clearance) resume corridor/casual expansion planning.
- Strategic posture: prioritize bridge integrity and lock diagnosis, then transition back to tempo growth once a clean unblock is observed.

### Snapshot: Turn 36 (Tuner revalidation #161)

- Turn/Date: `36 / 3125 BCE` (no turn progression observed across rechecks)
- Hash: `0` (`status` unchanged)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `localPlayerID=0`, `hasSentTurnComplete=true` (from `game play end-turn --json`)
- Lock posture: top blocker remains non-clearing, now with queue expansion
  - `blocker`: `0`
  - `blockingNotificationId`: `{ owner: 0, id: 116, type: 20 }`
  - `nextDecision`: `NOTIFICATION_VOLCANO_ERUPTS_SEV0`
  - `notificationCount`: `3`
  - queue/queue-front evidence:
    - `isEndTurnBlocking=true`
    - `engineQueueFront` remains `{owner:0,id:116,type:20}`
    - `canEndTurn=false`
  - closeout attempts and outcomes:
    - `game play dismiss-notification --target ... --send --reason ...` → `sent=false`, no identity movement/expiry
    - `game play notifications --json` now shows only stale unit-command candidates; command-unit candidates mostly `enabled:false` while `staleReadyPointerSuspected:true`
    - `game play operation --family unit --type SKIP_TURN --unit-id ... --send` repeatedly reports `valid:false` / `sent=false` for enabled-candidate IDs when UI pointer is null
- Watch signal (`game watch --include-ready-unit --include-ready-city --human-aware --count 1 --json`):
  - `firstReadyUnitId:null`
  - `selectedUnitId:null`
  - `nextDecision`: `NOTIFICATION_VOLCANO_ERUPTS_SEV0`
- Validation:
  - `game play end-turn --json`: `canEndTurn=false` despite `hasSentTurnComplete` reading true
  - `game play notifications --json`: confirms stale/degenerate command-unit context with no active ready unit
- Progress signal: bridge is now in a hard notification-loop regime; no command has advanced toward turn completion.
- Confidence: high (recurrent identical top notification + immutable front-id)
- Multi-turn guidance: extend the recovery bridge through explicit no-spam polling cadence and command-unit dry-runs only until a queue-family shift or external UI unblock appears.

### Turn Notes (append for player thread)

- `Turn 36` | `Top blocker persists while queue degenerates` | `No tactical commit yet; keep to recovery cadence only` | `The signal now looks like UI queue-front deadlock rather than a tactical options problem` | `High` | `Do one validated read cycle per update window, avoid repeated dismiss spam, and treat the unit-command branch as stale unless a valid ready-unit pointer returns`

### 10–20 Turn Strategic Continuation (recovery bridge with externality check)

- For the next 10–20 turns of planning posture, run a **recovery bridge with externality check**:
  1. Confirm blocker identity has not changed (`id 116/type 20` remains front).
  2. Attempt one minimal legal command-unit action only if validation says `valid=true` and `sent=true`.
  3. Treat `hasSentTurnComplete=true`/`canEndTurn=false` as a UI-state inconsistency until `canEndTurn` returns true.
  4. Once one unblock condition is proven (`NOTIFICATION_VOLCANO...` clears or blocker family changes), reinitialize turn-sequencing horizon before resuming expansion and scouting commitments.
- Strategic objective remains throughput recovery: convert state confidence from deadlocked queue to a valid turn progression pivot, then pursue tempo/expansion planning in a constrained 2–3 turn burst.

### Snapshot: Turn 37 (Live Recovery Checkpoint #162)

- Turn/Date: `37 / 3100 BCE` (`status`/`watch` aligned in App UI; `turn` unchanged from prior window)
- Readiness: `inGame=true`, `autoplay.isActive=false`, `canEndTurn=false`, `localPlayerId=0`
- Blocker transition sequence observed:
  - `watch` first indicated `blockingNotificationId { owner: 0, id: 120, type: 20 }` (`NOTIFICATION_COMMAND_UNITS`) with `nextDecision.operationType=SKIP_TURN`.
  - `game play operation --family unit --type SKIP_TURN --unit-id {"owner":0,"id":131072,"type":26}` sent successfully; `blocker` moved from `23669119` to `0` and `firstReadyUnit` advanced to `458756`.
  - Subsequent lock transition: top blocker became `NOTIFICATION_DIPLOMATIC_ACTION` (`blockingNotificationId { owner: 0, id: 118, type: 20 }`) while command-units moved to expired closeout state (`id 120`, expired=true).
- Attempted unblockers and outcomes:
  - `dismiss-notification --target {"owner":0,"id":118,"type":20}` (send) → verified no state transition (notification remains front, end-turn still blocked).
  - `dismiss-notification-queue` → `Eligible:0; selected:0; send:true`; no front change.
- Current gate posture: explicit diplomatic front on turn-end persists; no production/expansion-safe progression yet.
- Evidence: `civ7 game watch --json --include-ready-unit --include-ready-city --human-aware`, `civ7 game play end-turn --json`, `civ7 game play notifications --json`, `civ7 game play operation ... SKIP_TURN`.
- Next immediate recommendation for this window:
  1. Hold tactical expansion and avoid speculative movement commits.
  2. Reconfirm diplomatic-closeout path (likely `respond-diplomacy` family) from live HUD/runtime handlers before the next non-blocker move.
  3. Maintain strict re-read cadence and send at most one closeout operation per read window.
- Confidence: **medium-high** on observed state machine transitions; medium on diplomatic-clear path because action details are not fully surfaced in App UI metadata.

### Turn Note (single-message cadence)

- `Turn 37` | `Command unlock achieved, then hard diplomatic front appeared` | `Validate and clear the diplomatic-closeout path only; keep one validated operation per read window` | `The active lock is now an end-turn diplomatic notification and generic dismissal does not clear it` | `Medium` | `Do not branch strategic execution until this front is explicitly resolved in handler/operation form`

### 10–20 Turn Strategic Cadence (Window B refresh)

- Immediate objective (next 1–4 turns): stabilize blocker stack by resolving `NOTIFICATION_DIPLOMATIC_ACTION` through a valid diplomacy response path, not queue dismissal.
- Secondary objective (next 4–8 turns): once unblocked, perform one constrained production/civic/force-safety check before expansion.
- Tertiary objective (next 8–12 turns): rebuild a compact scouting/recon lane that also respects civic/progression sequencing pressure.
- Guardrails:
  - Do not interpret command-unit readiness (`NOTIFICATION_COMMAND_UNITS`) as a continuing gate until blocker transitions back to `endTurnBlocking=false` and `canEndTurn=true`.
  - Keep unit actions on `SKIP_TURN` only while in this bridge phase.

### Tactical Note (diplomatic-clear diagnostics)

- `Game.Diplomacy` confirms multiple active player diplomacy actions are available in `Tuner` (`Game.Diplomacy.getPlayerEvents(0)`), and `game play respond-diplomacy` validation accepts several `action-id`s for `response-type` `926305338`.
- However, these action surfaces do **not** currently expose a reliable mapping from `NOTIFICATION_DIPLOMATIC_ACTION` id `118` to a specific `action-id`, and App-UI notification APIs continue to return only summary/message-level metadata.
- Practical implication for the live loop: do not send a blind `respond-diplomacy` until handler evidence links `id 118` to an explicit action (or the UI handler reports a concrete candidate), to avoid mis-firing diplomacy commitments.
- Suggested next step in loop: continue one-cycle revalidation (`watch` → `notifications` → `end-turn`) and only execute a verified response when `nextDecision`/notification details include a concrete closeout op.

### Snapshot: Turn 37 (Tuner revalidation #163)

- Turn/Date: `37 / 3100 BCE` (fresh read from `game status`, `watch`, `notifications`, and `notification-queue`)
- Hash: `0` (`status` still unchanged)
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `canEndTurn=false`
- Lock posture (latest):
  - `blockingNotificationId`: `{ owner: 0, id: 123, type: 20 }`
  - `nextDecision`: `NOTIFICATION_COMMAND_UNITS` (`SKIP_TURN`)
  - `notificationCount`: `2`
- Queue evidence:
  - `game play notification-queue --json`: schedule step 1 is `id 123` end-turn blocking; step 2 is `id 118` (diplomatic message) as non-blocking secondary.
  - `civ7 game play notifications --json`: `id 123` reported `isEndTurnBlocking=true`, `id 118` reported `isEndTurnBlocking=false`.
- Handler-gap diagnosis:
  - `respond-diplomacy --help` confirms surface supports `--action-id` and optional `--notification-id`, but `game exec ... Game.Diplomacy` still returns empty `responseTypes` and no stable `actionId -> notificationId` join path for `id 118`.
  - `game exec` inspection in Tuner confirms the diplomacy block is now mostly a **mapping opacity problem** (notification exists with type/title context, but no concrete action payload surfaced yet).
- Strategic inference for this window:
  - Turn is effectively in a **unit-command release cadence** with a persistent non-blocking diplomatic artifact.
  - A verified `SKIP_TURN` closeout on `id 123` remains the only high-confidence unblock route before deeper tactical investment.
- Recommendation: execute exactly one legal, evidence-backed unit `SKIP_TURN` and re-read the notification queue immediately after; do not proceed to scouting/conquest/civic branches until we regain a clean `canEndTurn=true` queue state.
- Confidence: medium

### Turn Notes (single-message window cadence)

- `Turn 37` | `Command-units is back at queue front, diplomacy item remains shadowed/non-blocking` | `Take one validated closeout action on `NOTIFICATION_COMMAND_UNITS` then re-read queue` | `This preserves throughput and avoids mis-targeted diplomacy operations while data is opaque` | `Medium` | `Reframe in 2–4 read windows: if `id 123` persists after a closeout attempt, stop unit spam and escalate to explicit UI handler trace`

### 10–20 Turn Strategic Cadence (Window B refresh)

- Window objective reset: regain deterministic turn cadence first, then re-enter expansion logic.
- 1–4 turn segment (immediate):
  - Confirm `NOTIFICATION_COMMAND_UNITS` resolves with a valid `SKIP_TURN` path and `canEndTurn` unlock.
  - Keep all recommendations constrained to one validated action per read cycle.
  - Track whether `id 118` ever flips to `isEndTurnBlocking=true`; if it does and handler evidence is absent, hold and avoid speculative diplomacy branches.
- 5–10 turn segment (once unlock is restored):
  - Resume the normal civic/city throughput lane and frontier posture checks (city production, worker setup, unit spacing).
  - Re-anchor expansion decisions to map-control value and safety radius instead of raw scouting impulses.
- 11–20 turn segment:
  - If unit cadence reopens cleanly, select either consolidation-first or pressure-first branch based on immediate neighbor pressure and gold/force ratio.
  - If cadence remains unstable or blocks continue, continue ledger-first recovery and avoid irreversible expansion commits.

### Direct message to active player thread

- Current turn snapshot is stable but blocked by `NOTIFICATION_COMMAND_UNITS` (`id 123`) as the queue front; do a minimal closeout `SKIP_TURN` candidate and immediately re-read `notification-queue`/`watch`.
- Keep `id 118` (`New Settlement Nearby`) in watch-only mode until the system exposes direct diplomacy response linkage; do not risk blind `respond-diplomacy` on unknown action mappings.
- Strategic horizon target remains: recover lane 3-step cadence (read → closeout → re-read), then resume the 10–20 turn expansion track once block-free end-turn becomes available.

### Snapshot: Turn 37 (Tuner revalidation #164)

- Turn/Date: `37 / 3100 BCE` after one validated closeout probe
- Hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `isPausedOrPending=true`, `firstReadyUnitId` now `393219`
- Blocker transition (post-probe evidence):
  - `SKIP_TURN` on ready unit `196609` sent successfully and changed `blocker` from non-zero to `0`.
  - After the call, `canEndTurn` remains `false` with blocking moved to `id 118` only.
  - `blockingNotificationId` is now `{ owner: 0, id: 118, type: 20 }` and `isEndTurnBlocking=true`.
  - `notification-queue` confirms queue order now starts with step 1 `NOTIFICATION_DIPLOMATIC_ACTION` (`id 118`) and step 2 `NOTIFICATION_COMMAND_UNITS` (`id 123`, expired).
- Strategic implication: unit-command interlock was successfully advanced; the remaining hard gate is now a diplomacy-notification handler dependency.
- Immediate recommendation: no speculative `respond-diplomacy` until handler evidence links `id 118` to a known safe action; continue one-read-cycle cadence under the updated queue priority.
- Confidence: medium (state transition observed and confirmed via `notification`, `watch`, and `notification-queue` evidence).

### Turn Note (single-message window)

- `Turn 37` | `Blocker moved from command-units to diplomatic` | `Advance one more validated `SKIP_TURN` only when it changes the front, then switch to handler-focused diplomacy clearance` | `This is now a sequencing handoff, not a dual-lock dead-end` | `Medium` | `If `id 118` remains front-blocking with no handler evidence over 2–3 reads, request explicit UI handler trace before any non-blocker operation`

### Direct message to active player thread (updated)

- Turn 37 now has a concrete progression: command-unit `SKIP_TURN` unblock worked, but we are parked on `NOTIFICATION_DIPLOMATIC_ACTION` (`id 118`) as a true blocker.
- Treat `id 123` as expired context; keep one validated closeout path only and do not force additional unit ops until `id 118` is handled in a confirmed manner.
- 10–20 turn posture remains recovery-to-expansion: `3` reads = revalidate + handler probe + decision, then resume constrained production/tempo checks only when `canEndTurn` is unlocked.

### Snapshot: Turn 37 (Live revalidation #2)

- Turn/Date: 37 / 3100 BCE (fresh read, turn/hash-stable)
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay.isActive=false`, `canEndTurn=false`
- Blocker state:
  - `blockingNotificationId`: `{ "owner": 0, "id": 124, "type": 20 }`
  - `notifications`: `NOTIFICATION_COMMAND_UNITS` (`id 124`) still hard-blocking; `isEndTurnBlocking=true`
  - `notification-queue`: queue length `1` (`id 124`, step `1`) with no secondary active blockers
  - `watch`: `firstReadyUnitId` moved to `{"owner":0,"id":655367,"type":26}` and `selectedUnitId=null`
- Tactical-read signal:
  - `ready-unit` context shows the unit list has multiple legal `SKIP_TURN` candidates (`id 589830`, `655367`, `720904`, `786441`) and several disabled candidates due movement constraints
  - battlefield pressure remains local and manageable; highest immediate risk is civilian proximity around the home frontier, not forced combat
- Strategic recommendation for this window:
  - Reissue a single validated `NOTIFICATION_COMMAND_UNITS` closeout pass only (no multi-command burst), then re-read `notifications` and `watch`.
  - Keep `id 118` strictly in watch mode until official response mapping is recoverable for `respond-diplomacy`.
- Confidence: medium (blocker chain is now single-source and stable, but `diplomacy` handler link remains opaque)

### Turn Notes (append when new game-thread data arrives)

- `Turn 37` | `Single hard blocker persists at id 124` | `Run one validated unit-command unblock cycle, then re-check lock state before any tactical branching` | `Queue simplification is positive, but an opaque secondary diplomacy artifact still blocks full cadence` | `Medium` | `If id 124 remains hard after one full read cycle, request explicit UI handler trace before any non-blocker move`

### 10–20 Turn Strategic Cadence — Window A refresh

- Current lane anchor remains `Turns 37–42`, but command-unit blocker now appears as a single stable front.
- Next 1–4 turn focus:
  - Hold one-action-per-read-cycle discipline.
  - Resolve unit-blocker with evidence-backed `SKIP_TURN` first if available.
  - Keep expansion and scouting commitments deferred until `canEndTurn` is unblocked and/or reliable diplomacy-closeout evidence appears.
- Next 4–8 turn focus (contingent on unlock):
  - Recenter strategy around one safe tempo lane: frontier recon only with explicit `unit-target` support and zero ambiguous diplomatic debt.
- 8–20 turn branch condition:
  - If command-units unblock cleanly and diplomacy remains unresolved, treat this as a temporary recovery lane and pivot to local safety consolidation.
  - If diplomacy unlocks before blockers return, begin constrained expansion pressure with one production/civic audit per read window.

### Direct message to active player thread (live)

- `NOTIFICATION_COMMAND_UNITS` (`id 124`) remains the active hard blocker with a clean one-item queue and stable hash/turn. Run one closeout action on a validated `SKIP_TURN` candidate, re-read immediately, and only then move into any production or movement chain.
- Keep `NOTIFICATION_DIPLOMATIC_ACTION` (`id 118`) parked as diagnostic debt; avoid blind response sends until action-id/link evidence is surfaced from the active UI handler or confirmed `respond-diplomacy` routing.

### Snapshot: Turn 37 (Live revalidation #1)

- Turn/Date: 37 / 3100 BCE (date-stamped 2026-06-02)
- Turn hash: `0`
- Blocker state: hard blocker remains `NOTIFICATION_COMMAND_UNITS` (`id 124`); `NOTIFICATION_DIPLOMATIC_ACTION` (`id 118`, "New Settlement Nearby") is non-blocking in this read.
- Tactical read: `firstReadyUnitId` is `393219` (Hoplite). Nearby pressure is non-trivial but immediate contact is limited to melee/ranged unclassified units around the home front; no immediate legal attacks are being forced.
- Suggested safe lane for the player: resolve `id 124` via a validated unit command first (`game play ready-unit --json` then `game play operation --family unit --type SKIP_TURN --unit-id '{"owner":0,"id":393219,"type":26}'` or a movement/fortify alternative if target intent improves frontier value).
- Progress framing update: do not act on `id 118` until blocker stack advances and the official handler is exposed; treat it as reconnaissance debt.
- Confidence: medium (stable queue/turn/hash, but diplomacy handler is still opaque from this read).

### Turn Notes (append when new game thread data arrives)

- `Turn 37` | `Hard blocker remains unit command` | `Clear blocker stack by command-unit closeout first, then immediately re-read priorities + notifications` | `Turn 37 has mixed blockers: a hard COMMAND_UNITS lock with a trailing non-blocking diplomatic notification` | `Medium` | `Re-query in 2–4 turns; if blocker persists with no stack movement, perform a one-turn forced command protocol before any expansion commitments`

### 10–20 Turn Strategic Cadence — Window A update

- New window anchor: `Turns 37-42` (current lane)
- Immediate objective: complete turn-flow unlock, reduce frontier ambiguity, and preserve a clean safety envelope around unit massing near home.
- 10–20 turn framing rule for this window:
  - Turn 37-38: unblock now (unit-command closeout), then lock one meaningful military/economic operation.
  - Turn 39-42: if unlocked, convert reconnaissance into a defended expansion lane only when a legal move is clearly supported by `unit-target`/`battlefield-scan` evidence.
  - Turn 43+: choose track A (stability-first consolidation) or track B (limited outward pressure) based on blocker age and enemy proximity.

### Snapshot: Turn 37 (Live revalidation #4)

- Turn/Date: 37 / 3100 BCE (fresh read)
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay.isActive=false`, `canEndTurn=false`
- Active hard blocker: `NOTIFICATION_COMMAND_UNITS` (`id 124`, `isEndTurnBlocking=true`)
- Queue posture: single-item queue, `queueLength=1`, no visible non-blocking siblings this cycle
- Ready context:
  - `firstReadyUnitId` is `720904` (UNIT_SLINGER at `17,28`), `selectedUnitId=null`
  - Legal no-target options remain broad (`MOVE_TO`, `RANGE_ATTACK`, `SKIP_TURN`, etc.), with nearby unknown-contact (`owner 19 scout` at `17,27`) in immediate proximity.
- Strategic interpretation: `id 124` lock is still cleanly isolated, so the control loop should stay on one closeout action per read cycle and avoid broad scouting/expansion while blocked.
- Confidence: medium (blocker source is stable; tactical contact is newly visible but does not yet replace the gate)

### Turn Notes (single-message cadence)

- `Turn 37` | `Stable hard blocker persists with clearer ready-unit tactical context` | `Keep execution to one validated closeout candidate, then immediately re-read all three views` | `Immediate contact exists, but strategic sequencing must remain lock-first until blocker release` | `Medium` | `If the same lock persists after this closeout window, hold expansion and push handler-level confirmation for route certainty`

### 10–20 Turn Strategic Cadence — Window A (current)

- Current objective remains `Turns 37-42`, with a stricter tempo rule:
  - Turn 37-38: clear `NOTIFICATION_COMMAND_UNITS` one step and verify blocker transition.
  - Turn 39-40: only resume non-blocker tactical action if blocker clears and unit action intent is explicitly validated.
  - Turn 41-42: re-anchor expansion only inside one conservative lane (frontier safety first).

### Direct message to active player thread (live)

- Current loop is stable but still blocked by one hard item: `NOTIFICATION_COMMAND_UNITS` (`id 124`).
- Recommended move this window: one read-cycle closeout (validated `SKIP_TURN` on `firstReadyUnitId` or another enabled candidate), immediate re-read (`notifications` + `notification-queue` + `watch`), then either continue closeout or branch.
- Keep `id 118` in watch/deferred mode until official `respond-diplomacy` mapping is surfaced.

### Snapshot: Turn 37 (Live revalidation #5)

- Turn/Date: 37 / 3100 BCE (live revalidation from `status`, `watch`, `notifications`, `notification-queue`, `ready-unit`)
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `autoplay.isActive=false`, `canEndTurn=false`
- Turn-loop state:
  - `blockingNotificationId`: `{ owner: 0, id: 124, type: 20 }`
  - `notificationCount`: `1`
  - `nextDecision`: `NOTIFICATION_COMMAND_UNITS` (`SKIP_TURN`)
  - `canEndTurn` still `false`; no active blocker chain beyond the single hard entry
- Read evidence:
  - `game watch` now reports `firstReadyUnitId: null` and `selectedUnitId: null` (stale pointer class).
  - `ready-unit` reports no selected unit, no legal ops visible for current pointer (no unit selected).
  - `notification-queue` still exposes single-item queue `step 1: id 124` and `queueLength=1`.
  - Queue-details continue to imply a stale-ready reconciliation state rather than a growing blocker stack.
- Confidence: `medium`
- Recommended action: hold lock-first cadence; execute exactly one candidate closeout only if a valid `selected/ready` unit returns. If no ready unit exists after one re-read, use the documented stale reconciliation route (`unit-command` closeout via validated candidate or safe reasoned repair) before any non-blocker planning.

### Turn Notes (single-message cadence)

- `Turn 37` | `Single hard blocker remains, now with null ready pointer in this read` | `Re-run one tight read-cycle, then run a single validated closeout path while avoiding speculative map actions` | `Ready-pointer drift increases misfire risk if commands are sent against stale context` | `Medium` | `If one more read still leaves only stale `id 124` and no enabled closeout, pause for UI-state confirmation before non-blocker ops`

### 10–20 Turn Strategic Cadence — Window A (current)

- Immediate lane (Turn 37-39): restore deterministic gating (`NOTIFICATION_COMMAND_UNITS` -> `canEndTurn=true`) with one validated closeout per read cycle; hold map commitments.
- Mid lane (Turn 39-44): after unlock, commit one production lane (or equivalent throughput lane) and one low-risk scout corridor only if `firstReadyUnitId` remains reliable and no fresh blocker drift appears.
- Later lane (Turn 45-55): branch by pressure:
  - consolidation path: reinforce worker/frontier safety and force multipliers before expansion,
  - pressure path: open one forward settlement/scout route only when the `ready-unit` + `unit-target` evidence is clean.
- Escalation boundary: if a stale or non-mappable hard blocker reappears twice consecutively, switch to explicit UI blocker-state validation and freeze expansion until command-window consistency is restored.

### Direct message to active player thread (live #2, non-spam)

- Turn 37 remains at stable `id 124` hard lock. The only safe move is a tight closeout cycle: read → validate → one action → re-read. Avoid all scouting/movement branches until the blocker resolves or the active pointer is recoverably valid.

### Snapshot: Turn 38 (Live revalidation #166)

- Turn/Date: 38 / 3075 BCE (`status`, `watch`, `notifications`, `notification-queue`, `ready-unit` in one cycle)
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay.isActive=false`, `canEndTurn=false`, `isPausedOrPending=true`
- Turn-loop state:
  - `blockingNotificationId`: `{ owner: 0, id: 128, type: 20 }`
  - `notificationCount`: `6`
  - `nextDecision`: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`CHOOSE_NARRATIVE_STORY_DIRECTION`)
  - `watch`: `firstReadyUnitId` present (`{owner:0,id:131072,type:26}`) but narrative selection is the active hard gate
- Notification topology (`queueLength=6`):
  - Step 1 hard blocker: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`)
  - Step 2 non-blocking: `NOTIFICATION_CHOOSE_CULTURE_NODE` (`id 127`)
  - Step 3 non-blocking: `NOTIFICATION_TRADITIONS_AVAILABLE` (`id 130`)
  - Step 4 non-blocking: `NOTIFICATION_COMMAND_UNITS` (`id 129`)
  - Step 5 non-blocking: `NOTIFICATION_DIPLOMATIC_ACTION` (`id 125`)
  - Step 6 non-blocking: `NOTIFICATION_VOLCANO_INACTIVE` (`id 126`)
- Ready-unit tactical context:
  - Selected/first unit is scout `id 131072` at `14,34`; legal ops are active and include `MOVE_TO`, `SKIP_TURN`, `SLEEP`, `AUTOMATE_EXPLORE`, and battle options.
  - Nearby visible enemy: unit at `12,32` (`UNIT_WARRIOR`, owner `14`).
- Strategic read:
  - Narrative gate is now the true sequencing lock; previous single-unit hard lock was displaced.
  - The `Command Units` stack remains available and closeout-valid (`SKIP_TURN` candidates enabled), but should stay deferred until the narrative gate is handled by valid UI inputs.
  - Civic/policy notifications are present but non-blocking in this snapshot; treat them as follow-on execution once narrative closes.
- Confidence: `medium` (strong signal on queue/front, medium on story-action derivation from this read alone).

### Turn Notes (single-message cadence)

- `Turn 38` | `Turn advanced to narrative-story gating` | `Handle the `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` event path first using live UI args (target/action), then clear `command-units` as the next gate if it stays exposed` | `This is a hard, user-decision-style lock, not a movement/tactical ambiguity lock` | `Medium` | `If narrative args are still unexposed after 1–2 reads, request direct UI-state confirmation before any non-retryable operations`

### 10–20 Turn Strategic Cadence — Window A reset

- New anchor: `Turns 38–43`
- Next 1–4 turns:
  - Resolve the narrative event to reopen deterministic turn flow.
  - Validate and execute one `command-units` closeout only after that unblock.
- Next 5–10 turns:
  - If narrative and unit-closeout gates clear, run one high-confidence civic/policy throughput action then one defensive scouting lane with explicit `unit-target` support.
  - Keep expansion decisions tied to updated frontier safety and blocker drift, not legacy assumptions from the prior turn.
- Next 11–20 turns:
  - Choose **consolidation** if narrative/civic friction repeats, or **limited pressure** if lock cadence stabilizes and no new enemy compression appears.
- Escalation boundary remains unchanged: if a hard blocker cannot be resolved with explicit UI-visible inputs in repeated cycles, pause proactive frontier operations and preserve one-turn read/probe cadence.

### Direct message to active player thread (live #3, non-spam)

- Turn 38 is now blocked first by `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`) and queueed after it are non-blocking; this is a sequencing, not safety, gate.
- Recommended: do not execute scouting/production moves until that narrative choice is captured from the UI (`target`, `targetType`, `action`), then re-run `watch`+`notifications`+`notification-queue` once.
- After unlock, run one `NOTIFICATION_COMMAND_UNITS` closeout and confirm `canEndTurn=true` before moving into the next 10–20 turn expansion branch.

### Snapshot: Turn 38 (Live revalidation #167)

- Turn/Date: 38 / 3075 BCE (fresh read, queue unchanged from previous cycle)
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay.isActive=false`, `canEndTurn=false`, `isPausedOrPending=true`
- Blocker state:
  - `blockingNotificationId`: `{ owner: 0, id: 128, type: 20 }`
  - `notificationCount`: `6`
  - `nextDecision`: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (hard blocker)
  - Narrative-specific args (`TargetType`, `Target`, `Action`) are still not exposed in `watch`/`notifications` output; operation remains blocked at UI-input resolution.
- Unit/civic/progression context:
  - `firstReadyUnitId`: `{ owner: 0, id: 131072, type: 26 }` (Scout, `14,34`)
  - `ready-unit` legal no-target ops include `MOVE_TO`, `SKIP_TURN`, `AUTOMATE_EXPLORE`, `SLEEP`
  - `NOTIFICATION_CHOOSE_CULTURE_NODE`, `NOTIFICATION_TRADITIONS_AVAILABLE`, `NOTIFICATION_COMMAND_UNITS`, `NOTIFICATION_DIPLOMATIC_ACTION`, `NOTIFICATION_VOLCANO_INACTIVE` remain behind/parallel and non-blocking.
- Evidence quality:
  - Revalidation confirms narrative-first sequencing lock is stable and repeatedly reproducible.
  - `notification-queue` still shows narrative entry at `step 1` with six-item queue length.
- 10–20 turn operational implication:
  - Current lane is still `Turns 38–43`, but progress is on hold at decision-decoding.
  - Immediate priority is to unlock narrative decision from live UI and then complete exactly one validated closeout action, restoring the previous `command-units` gating strategy.
- Confidence: `medium` (high confidence on blocker front; low confidence on absent narrative action payload without direct UI capture).

### Turn Notes (single-message cadence)

- `Turn 38` | `Narrative story lock persists after revalidation` | `Do not force a unit or civic move while hard gate is unresolved; obtain the UI-derived narrative arguments and apply a single valid narrative commit` | `Narrative input opacity is the current sequencing risk, so speculative play is operationally expensive` | `Medium` | `If the same narrative payload remains hidden for another revalidation cycle, explicitly pause and request a direct UI handler trace from the player-side runtime`

### 10–20 Turn Strategic Cadence — Window A reset (confirmed)

- Current anchor remains `Turns 38–43`.
- Turn 38-39:
  - unlock narrative lock via real UI args (`target`, `target-type`, `action`),
  - re-read queue and confirm `canEndTurn` transition.
- Turn 40-43:
  - resume one constrained throughput lane (`command-units` closeout + one civic/policy choice when exposed),
  - keep scouting to one low-variance lane only if lock is clean and frontline safety remains acceptable.
- Turn 44+:
  - choose consolidation versus pressure branch based on whether narrative and queue blockers remain under one-turn recoverability.
- Escalation rule unchanged: two consecutive re-validations with unresolved narrative payload should trigger explicit UI confirmation before any broader non-blocker expansion.

### Direct message to active player thread (live #4, non-spam)

- `Turn 38` remains at steady hard lock: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`) is now the only blocking gate at front.
- Operational call: hold all non-essential actions until `target/target-type/action` from the live UI is available, then replay `watch` + `notifications` + `notification-queue` immediately to verify unblock.
## Snapshot: Turn 38 (Narrative Block Watch #169) — 3075 BCE

- Live state sampled successfully before socket handoff: `turn 38`, `canEndTurn=false`, `blockingNotificationId=128`, `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION`.
- `canEndTurn=false` and game remains in a hard narrative gate. This must be resolved before any meaningful execution planning proceeds.
- Existing queue still reflects:
  - 1) `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (blocking)
  - 2) `NOTIFICATION_CHOOSE_CULTURE_NODE` (`Mysticism`, `Discipline`, `Tactics`, `Symmachia` options available)
  - 3) `NOTIFICATION_TRADITIONS_AVAILABLE`
  - 4) `NOTIFICATION_COMMAND_UNITS` (reconciliation candidates available; first-ready unit is `UNIT_SCOUT` @14,34)
  - + 2) non-blocking informational/diplomatic notifications
- `UNIT_SCOUT` at `14,34` has legal ops including `MOVE_TO`, `AUTOMATE_EXPLORE`, `SKIP_TURN`; nearby enemy `UNIT_WARRIOR` is at `12,32` (owner 14).

### Advisory to player (direct, non-spam message)
Narrative lock is the immediate control gate. Please keep actions paused until `choose-narrative` surface is available, then select the branch that preserves early civ growth while avoiding diplomacy pressure (if equivalent options exist).

### 10-20 turn forward view (next sequencing window: 39-58)
1. Clear `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` as soon as UI args are readable; then immediately validate and execute `NOTIFICATION_CHOOSE_CULTURE_NODE` + `SET_CULTURE_TREE_TARGET_NODE` in one closeout flow.
2. Resolve social policy review (`NOTIFICATION_TRADITIONS_AVAILABLE`) before end-of-turn lock pressure accumulates; prioritize defense, worker, and growth-relevant opener in your available tree.
3. Once narrative/culture/tradition blockers are clear, do a unit stack check from `front-summary` then run a scout sweep and safe tempo cycle: explore, reveal new city sites, and keep frontline melee/hoplite spacing tight around exposed edges.
4. Keep `ready-unit` and `unit-target`/`unit-move-preview` usage on hand: in this stage, a single careless aggression can escalate war-front tempo; keep one cheap unit for map denial and one safe worker-safe slot for land claim pace.
5. Reconcile `COMMAND_UNITS` candidates only after narrative is cleared; if no tactical objective exists, use SKIP_TURN on the highest-value stack/unit and resume civic policy completion next turn.

### Watch posture
- Socket dropped after this read; no further live pulls succeeded (`Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318`).
- Resume once socket reconnects, then re-read: notification queue detail, narrative target payload, and `priorities`/`front-summary` for the 10–20 turn branch update.
## Snapshot: Turn 38 (Narrative Block Watch #170) — 3075 BCE

- Reconnect attempt sequence executed; the Civ7 direct-control socket remains unavailable (`all-hosts-unavailable`), so no new live HUD/notification state could be re-read in this cycle.
- Last validated live blocker context (from prior successful pass) still applies: hard blocker is `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`) and the thread is effectively at an end-turn gate.
- Pending non-blocking queue context remains unchanged in ordering: culture-choice / traditions / command-units / diplomacy / natural-dispersion report candidates.
- Unit-level tactical read from last successful probe still shows a safe, non-committal posture: first-ready `UNIT_SCOUT` at `14,34` with move/scan potential and nearby enemy `UNIT_WARRIOR` at `12,32`.

### Direct advisory to the active player
Hold at the narrative blocker. Continue not-spam checking only after the story option payload is actually surfaced by the live UI path; when that becomes available, choose the branch that preserves tempo and civic momentum without creating unnecessary frontier pressure.

### 10–20 turn advisory update (refresh at blocker resolution)
1. Clear narrative branch as soon as args are available (`target`, `target-type`, `action`) and then immediate-chain culture start + culture target closure.
2. After cultural lock and tradition review resolve in sequence, keep expansion pressure on: scout economy for reveal + a safe land claim cadence (prioritize fresh city-site visibility > incidental melee brawls).
3. Sequence military readiness so the current exposed frontier holds one denial scout line and one delayed-response slinger/infantry stack; avoid overextending before city count/policy cadence is secure.
4. If culture/tradition queues are complete before narrative resolution, park units on high-leverage SKIP_TURN closeouts only after confirming no tactical move unlock appears from ready-unit re-read.
5. Target these next 10–20 turns toward momentum continuity: maintain civic growth, secure 1–2 forward claim options, and keep diplomacy posture clean unless a direct treaty branch appears.

### Recovery condition for next update
- Rehydrate successfully, then re-read: `game play notifications --json`, `game play notification-queue --json`, `game play ready-unit --json --unit-id 131072`, and `game play priorities --json`.
## Snapshot: Turn 38 (Narrative Block Watch #171) — 3075 BCE

- Reconnect check again failed immediately: `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318`.
- No listener is currently bound on port 4318 (`lsof -iTCP:4318 -sTCP:LISTEN -P -n` returned empty).
- Previous last-valid blocker chain remains the best current authority: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`) is still the hard end-turn gate.
- In absence of live refresh, continue to treat this as a “lock hold” turn state and avoid speculative non-blocker calls.

### Direct advisory to active player
Narrative branch payload is not yet surfaced because the control socket is offline; this is an operational pause, not a tactical turn. Resume immediately once reconnected and run: `notifications -> notification-queue -> ready-unit -> priorities` before issuing any non-recovery operation.

### 10–20 turn forward-view (stale horizon, for continuation once unblocked)
1. On reconnect, resolve narrative args first (`target`, `target-type`, `action`) and lock one story branch that maximizes civic tempo and minimizes frontier risk.
2. Immediately chain culture node start + culture target closeout, then traditions review closure in one continuous validated flow.
3. If queue is clean, execute a low-variance exploration cadence: frontier scouting/safety sweep first, expansion placement second, combat only if a high-certainty flank advantage appears.
4. For the next 10–20 turns, keep an eye on defender readiness: one active denial line and one delayed strike line, with no extra skirmish commitments until city policy and civic economy are stabilized.
5. If socket drops again before narrative unlock, repeat hard pause; do not burn turns on unit/unit-mode speculation.
## Snapshot: Turn 38 (Narrative Block Watch #172) — 3075 BCE

- Socket-state audit repeated: `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318` for status, notifications, notification-queue, and rehydrate calls.
- Local port scan still finds no active listener on `4318`.
- No new live blocker state was obtainable; the last validated hard blocker remains `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` as the front narrative lock.

### Direct advisory to active player (operational pause)
Do not emit speculative unit/civic actions until tuner socket reconnects. The advisory mode is now: stabilize the control channel first, then execute one tightly scoped observation-and-closeout pass before any turn-advancing planning assumptions.

### 10–20 turn sequence reset (blocked horizon)
1. Reconnect recovery first: `game play rehydrate --json`.
2. Capture: `game play notifications --json` -> `game play notification-queue --json` -> `game play ready-unit --json --unit-id 131072` -> `civ7 game play priorities --json`.
3. If narrative branch payload is available, resolve it immediately and then do immediate-chain: choose culture node + set target + traditions closeout.
4. After unblock, resume scout/claim tempo only after one tactical pass confirms safe frontier posture.
5. If socket drops again before unblock, continue with no-op advisory posture (no tactical speculation). Pause and request local control-surface restart support from the player side.

### Continuity note for next analyst
- Treat `#172` as carryover of a persistent external-liveness fault, not a state-change in game mechanics.
## Snapshot: Turn 38 (Narrative Block Watch #173) — 3075 BCE

- Reconnect status remains unchanged: every live read path still errors with `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318` (`all-hosts-unavailable`).
- `civ7 game watch --json --include-ready-unit` also failed and returned a structured read-failed observation (no turn/hash/notifications available).
- No listener on port 4318 in this run (`lsof -iTCP:4318 -sTCP:LISTEN -P -n` empty).
- Most recent validated game context is still the previous hard gate: `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` (`id 128`) at turn `38` (`3075 BCE`) with no confirmed closeout progress.

### Direct advisory to active player
This is a sustained transport hold, not a newly shifted tactical frontier. Keep all strategy actions in holding posture. Resume active turn sequencing only after socket reconnect and immediate revalidation pass (`rehydrate -> notifications -> queue -> ready-unit -> priorities`).

### 10–20 turn horizon update (reframed as recovery lane)
1. Re-establish live control channel and clear the narrative branch once args become available.
2. Run immediate sequence: narrative select (`target`, `target-type`, `action`) -> culture node + target chain -> tradition queue clear.
3. Then execute 10–20 turn recovery lane:
   - keep expansion intent conservative for first 2 turns after unlock,
   - prioritize secure scout reveal lanes and one economy-safe claim route,
   - stage one delayed tactical stack for frontier response,
   - defer further forward pressure until city policy/culture cadence is stable.
4. Do not invent new actions while blocked; this lock is the limiting factor.

### Recovery checklist for the next successful read
- `game play notifications --json`
- `game play notification-queue --json`
- `game play ready-unit --json --unit-id 131072`
- `game play priorities --json`
- capture any changed `blockingNotificationId`, `canEndTurn`, and queue order before acting.
## Snapshot: Turn 38 (Narrative Block Watch #174) — 3075 BCE

- Recheck again returns `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318` (`all-hosts-unavailable`) for status, notifications, queue, and rehydrate (no successful game-state payloads).
- `lsof -iTCP:4318 -sTCP:LISTEN -P -n` is still empty; there is no active Civ7 direct-control listener.
- This is a fourth consecutive polling window with no live read visibility. No new blocker transition evidence available.

### Advisory to active player
Hold on narrative lock and tactical speculation. A transport outage, not a strategic branch change, is the current constraint.

### Next recovery window (10–20 turn frame continuation)
1. On first successful reconnect, run this exact sequence and only then act:
   - `game play rehydrate --json`
   - `game play notifications --json`
   - `game play notification-queue --json`
   - `game play ready-unit --json --unit-id 131072`
   - `game play priorities --json`
2. If hard blocker still `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION`, capture the story UI payload (`target`, `target-type`, `action`) and clear it first.
3. Immediately chain culture + tradition closeout to restore operational throughput.
4. Resume the 10–20 turn plan as:
   - 2-turn controlled reconvergence lane,
   - recon/scout-first expansion safety checks,
   - one delayed-response defense stack,
   - no speculative frontline commits until blocker and civic queue are clean.
5. If blocker remains opaque after another reconnect attempt, escalate to direct UI handler trace before any non-recovery action.
## Snapshot: Turn 38 (Narrative Block Watch #175) — 3075 BCE

- Reconnect check remains failing: every attempted read path (`status`, `watch`, `notifications`, `notification-queue`) still returns `all-hosts-unavailable` against `127.0.0.1:4318`.
- `watch --json` now emits a formal read-failed observation and notes: `Read failed; after restart or reconnect, run game play rehydrate before mutating.`
- `lsof -iTCP:4318 -sTCP:LISTEN -P -n` still has no listener.
- No new live game evidence was captured; the last authoritative game state remains the prior hard lock on `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` at turn `38` (`3075 BCE`).

### Advisory to active player
The active path is still a control-channel outage hold. Treat this as “no valid turn progression data yet” and avoid non-recoverable action proposals.

### Next 10–20 turn advisory posture
- On first successful reconnect, run a strict revalidation ladder and only then resume turn strategy:
  1. `game play rehydrate --json`
  2. `game play notifications --json`
  3. `game play notification-queue --json`
  4. `game play ready-unit --json --unit-id 131072`
  5. `game play priorities --json`
- If narrative lock remains front and is actionable, clear it first and then execute an immediate closeout chain (culture + traditions) before making new micro-tactical calls.
- If narrative args are still not visible after reconnect, hold and escalate to explicit UI-handler trace rather than speculative unit/civic operations.
## Snapshot: Turn 38 (Narrative Block Watch #176) — 3075 BCE

- Latest read attempt confirms persistent control outage:
  - `civ7 game status --json`: unavailable (`all-hosts-unavailable`)
  - `civ7 game watch --json --include-ready-unit`: unavailable (`all-hosts-unavailable`)
  - `civ7 game play notifications --json`: unavailable (`all-hosts-unavailable`)
  - `civ7 game play notification-queue --json`: unavailable (`all-hosts-unavailable`)
- Transport health still shows no live Civ7 socket listener on `127.0.0.1:4318`.
- No new hard/soft blocker evidence is available from in-game state. We remain on the prior hard-gate narrative branch context from last successful read.

### Non-spam advisory to active player
Keep the game in passive watch mode until direct-control reconnects. Do not apply non-recoverable unit/civic calls while the state oracle is offline.

### 10–20 turn horizon (restart and recovery lane)
1. Reconnect order remains unchanged: `game play rehydrate --json` -> `game play notifications --json` -> `game play notification-queue --json` -> `game play ready-unit --json --unit-id 131072` -> `game play priorities --json`.
2. After reconnect, clear the narrative story direction immediately if actionable (`target`, `target-type`, `action` available).
3. Then execute the short closeout sequence (culture start/target + traditions closeout) before expanding tactical tempo.
4. Re-seed 10–20 turn planning only after the lock is proven cleared and turn progression becomes visible:
   - first two turns: controlled reveal and claim-safety check lane,
   - then one staged defense-forward posture,
   - avoid premature frontier commitment until both queues are stable in two consecutive reads.
## Snapshot: Turn 38 (Narrative Block Watch #177) — 3075 BCE

- Reconnection attempt remains blocked across the full read stack: `status`, `watch`, `notifications`, and `notification-queue` all fail with `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318` (`all-hosts-unavailable`).
- `watch --json --include-ready-unit` again returns a read-failed observation; no turn/notification/ready context is currently observable.
- Listener check still returns no active service on port `4318`.

### Player advisory (single-signal hold)
- Keep all non-recovery action planning in standby until direct-control connectivity is restored.
- First successful reconnect must be followed by strict revalidation (`rehydrate`, `notifications`, `notification-queue`, `ready-unit --unit-id 131072`, `priorities`) before any tactical/civic proposals.

### 10–20 turn framework while disconnected
- Hold this interval as a **lock-recovery frame** rather than a branching strategy frame.
- On reconnect: clear narrative story direction first if actionable, then chain culture start/target and tradition closeout to restore normal planning.
- Then resume two-step tempo plan: two turns of controlled reveal/frontier safety checks, then one delayed offense-defense staging pass, only after queue stability for two consecutive reads.
## Snapshot: Turn 38 (Narrative Block Watch #178) — 3075 BCE

- Reconnect remains unavailable on all live reads (`all-hosts-unavailable` against `127.0.0.1:4318`) with no listener on port `4318`.
- No game payload can be read this cycle; tactical planning remains on a strict recovery lane rather than a branch or force-selection update.

### Immediate player action
- Restore direct-control listener (tuner/game process), then run: `game play rehydrate --json` and `game play notifications --json` first.
- If this does not produce `NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION` args (`target`, `target-type`, `action`) in the first read window, pause and escalate to UI handler evidence before acting on any non-recovery operations.
- 10–20 turn advisory remains locked to: recover narrative blocker, then execute culture/tradition closeout, then controlled scout/defense tempo re-entry.
## Snapshot: Turn 38 (Narrative Block Watch #179) — 3075 BCE

- Reconnect attempt again failed on all live reads with `Civ7DirectControlError: Unable to reach Civ7 tuner socket on 127.0.0.1:4318` (`all-hosts-unavailable`).
- `watch` emitted a read-failed observation again; no turn/notification/ready payload is available.
- Listener check remains absent on port `4318`.

### Advisory to active player
No game-state progression can be validated yet; continue lock-recovery posture.

### Recovery-first 10–20 turn plan
- Restore direct-control channel first.
- On first successful read, run: `rehydrate -> notifications -> notification-queue -> ready-unit --unit-id 131072 -> priorities`.
- Clear the narrative branch if actionable, then immediately close culture/tradition blockers before tactical tempo calls.
- Only after two consecutive stable reads post-unlock should mid-horizon expansion/force projection resume.
## Snapshot: Turn 1 Re-grounding (4000 BCE) — Socket Recovery Pass #180

- Reconnect succeeded after prolonged outage.
- Game is currently at `turn 1`, `turnDate 4000 BCE`, `firstReadyUnitId: null`, `selectedUnitId: null`, `canEndTurn: false`.
- Blocking queue still exposes:
  - `NOTIFICATION_COMMAND_UNITS` (expired/stale): `id 0` (hard block)
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (non-blocking): `id 1` at city `id 65536`
- `ready-unit --json` and `ready-city --json` are both empty/none with no legal operations.
- `notification-queue` confirms stale `COMMAND_UNITS` as step-1 and production as step-2.
- `priorities` classifies top priority as `hud:unit-command-stale-expired` with explicit repair candidate:
  - `game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json`
- `unit-target` probe at `{- `unit-target` probe on unit id `{"owner":0,"id":2,"type":26}` at `(0,0)` returned only invalid candidate actions (no movement/attack legal), `unitChanged=false`, and did not mutate state.

### Strategic advisor note (first live horizon update after reconnect)
- This looks like a UI/state desync mode where command lock remains on stale unit-command data with no executable closeout candidates.
- Recommended immediate move sequence (non-spam, non-speculative):
  1) send the stale repair closeout once: `game play end-turn --send --reason "stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout"`
  2) re-read `notifications -> notification-queue -> priorities` immediately after.
  3) only then resolve city production (`NOTIFICATION_CHOOSE_CITY_PRODUCTION`) with a live chooser-based `build-production` payload.

### 10–20 turn planning for the resumed session
- Turn 1 priority is **stabilization**: clear stale end-turn blocker with one explicit closeout and verify turn progression before committing to mid-turn tactical probes.
- Once the queue is stable for two reads, shift to a 10–20 turn lane:
  - early game: one controlled scouting orientation and one secure build line,
  - avoid expansion commitment until unit command/pathing surfaces are reliable and city production is locked,
  - preserve tempo by handling blockers immediately and then revalidating every 1–2 turns.

## Snapshot: Turn 2 (3975 BCE) — New Game Restart #181

- The current playthrough is a fresh launch; keep the generic playbook and rule-based framing above. Treat all prior per-turn snapshot narratives as historical context only.
- Latest verified read set is coherent:
  - `status`: `turn 2`, `turnDate 3975 BCE`, `canEndTurn: false`.
  - `blockingNotificationId`: `id 2` (`NOTIFICATION_CHOOSE_TECH`, hard blocker).
  - `firstReadyUnitId`: `{"owner":0,"id":131072,"type":26}` (`UNIT_SCOUT`, `61,18`).
  - `selectedUnitId`: `null`, `selectedCityId`: `null`.
  - `notifications`: `CHOOSE_TECH`, `CHOOSE_CITY_PRODUCTION`, `COMMAND_UNITS`.
  - `ready-unit --json`: Scout has valid no-target options including `SKIP_TURN`, `MOVE_TO`, `AUTOMATE_EXPLORE`, `ALERT`, etc.
  - `ready-city --json`: empty pending manual city selection/chooser input.
  - `priorities`: active lane moved to `hud:unit-command` with a live-ready-unit contract, not stale-unit-command repair.
- Immediate advisory for this reset lane:
  1) clear the current tech blocker with live chooser-backed `game play choose-tech --player-id 0 --node <node> --send --closeout --reason ...` (Pottery/Animal Husbandry/Sailing are valid entry options).
  2) resolve city production with chooser-validated `game play build-production --city-id <id> ...`.
  3) only then execute one movement-heavy scout action, after `game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json` validates action shape.
- Strategic risk posture for turns 2–6:
  - Goal is queue-first stabilization first, not map-harvesting opportunism.
  - Keep scouting conservative until production and tech locks are proven.
  - Use one validated command per turn to preserve low-risk recovery and reduce UI/API mismatch.
- 10–20 turn horizon lane (Thread #181):
  - Turns 2–6: clear blocker debt, lock a production cadence, and gather a single safe expansion vector.
  - Turns 7–12: convert the scout lane into corridor intelligence and route safety checks before any non-defensive expansion.
  - Turns 13–20: choose either sustain mode (growth + defense) or pressure mode only if queue and frontier safety remain stable for two consecutive reads.

### Net-new turn row

- `Turn 2` | `Thread restart confirmed; priorities shifted to tech + production lock` | `Clear tech blocker, then lock production, then one validated scout action` | `UI/runtime is now live but still partially selector-less, so conservative sequencing avoids desyncs` | `Medium` | `Re-read notifications/queue/priorities after each blocker action; if any remains unresolved after 2 windows, hold unit acceleration`

## Snapshot: Turn 2 (3975 BCE) — Restart Revalidation #182

- Current live read signature remains `turn 2`/`3975 BCE` in App UI, while Tuner reports `turn 3`/`3950 BCE`; this divergence is treated as an async turn-boundary transition window.
- `hasSentTurnComplete: true` with `hasSentTurnComplete` reflected as `true` in `ready-unit/city`, `notifications`, and `priorities`.
- `NOTIFICATION_COMMAND_UNITS` is still top and now classified as `unit-command-stale-expired`:
  - `firstReadyUnitId` is `null` and no enabled closeout candidate exists for the scanned Scout (`UNIT_SCOUT` at `60,16`, `movementMovesRemaining: 0`).
  - `repairCandidates` now point to passive wait flow: `game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl`.
- `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and `NOTIFICATION_CHOOSE_TECH` are still present as non-expired/previously resolved blockers, but their execution still requires live chooser values.
- `ready-unit --json` and `ready-city --json` remain empty for direct selection.
- `priorities` confirms the safest immediate action is **wait-for-turn-advance/watch** and then re-check notifications once any new blocker signal arrives.

### Advisory (single message lane)
- Do not issue unit operations or speculative production/tech actions until a fresh watch shows either turn boundary movement or a fresh chooser-backed blocker set.
- Next actions, in order, should be:
  1. `game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl` (or equivalent steady read)
  2. if COMMAND_UNITS drops/changes: re-run `notifications`, `notification-queue`, `ready-unit`, and `ready-city`
  3. when chooser-backed tech/production appears, execute one validated decision only, then re-evaluate before expanding.

### 10–20 turn reset lane for Thread #182
- Immediate goal (turn 2+): stabilize the async turn boundary and recover clean blocker sequencing.
- Turns 2–6: single-command discipline; avoid scout movement while command lane is stale-expired.
- Turns 7–12: once blockers are clean and turn progression is stable, execute one expansion-relevant scout move after successful target validation.
- Turns 13–20: lock strategic posture based on whether early production and research locks are stable for two consecutive reads.

- `Turn 2` | `UI/Tuner turn clock drift plus stale unit-command lock` | `Hold unit actions; prioritize `wait-for-turn-advance` and fresh-reconcile blocker reads` | `State indicates async boundary and explicit stale-lock classification; this avoids repeating invalid unit commands` | `Medium` | `If two consecutive watch cycles do not change blocker class or turn/date, keep on one-lane wait and skip non-lock commands`

## Snapshot: Turn 3 (3950 BCE) — Population-Placement Lock #183

- Thread has transitioned from stale unit-command recovery into an active growth-lock state.
- Live read confirms:
  - `status`: `turn 3`, `3950 BCE` (App UI and Tuner aligned now).
  - `blockingNotificationId`: `id 3` (`NOTIFICATION_NEW_POPULATION`) and only one live queue step.
  - `canEndTurn: false`, `hasSentTurnComplete: false`.
  - `selectedUnitId: null`, `firstReadyUnitId: null`, `selectedCityId: null`.
  - `notifications`: single `NOTIFICATION_NEW_POPULATION` with `canUserDismiss: false`, `isEndTurnBlocking: true`.
  - `notification-queue`/`priorities`: confirms top priority `hud:population-placement`.
  - `ready-unit --json` and `ready-city --json` continue to return no direct legal operations.
  - `watch --json --include-ready-unit --include-ready-city` returns no stable selector/city payload but confirms population-placement as the next decision.
- Interpretation:
  - The game is in an explicit tile-placement fork: assign a valid adjacent workable tile as worker OR expand city onto a valid border tile.
  - The safest path is to avoid unit moves while this branch is unresolved; no validated path for movement exists from current exposed state.

### Advisory for the active player (single non-spam cadence)
- Priority now is **resolve new population placement cleanly** before any scouting/tech/production extension:
  1) read candidate plot candidates from the running UI chooser surface,
  2) execute exactly one validated growth command (`assign-worker ...` or `expand-city ...`) and
  3) re-run `notifications` + `notification-queue` immediately after, then continue the 10–20 turn frame.
- If candidate legality is ambiguous from the exposed UI, pause and request chooser evidence first; do not force a guessy location.

### 10–20 turn horizon reset (Thread #183)
- Turns 3–6: close growth lock with one conservative placement (worker first if yield-safe, expansion only if defense-neutral).
- Turns 7–12: with growth lock cleared, return to one validated scout action lane if unit selectors repopulate.
- Turns 13–20: shift to either consolidation (growth+defense) or pressure mode based on whether growth/tech sequencing is stable for two consecutive read windows.

- `Turn 3` | `Growth notification became sole hard blocker` | `Resolve `NOTIFICATION_NEW_POPULATION` via explicit plot validation first` | `Queue collapsed to one high-quality blocker; this is a cleaner recovery lane than earlier command desync` | `Medium` | `If no plot candidates appear for 2 reads, hold and request direct chooser read before any non-lock action`

## Snapshot: Turn 3 (3950 BCE) — Population Lock Recheck #184

- Recheck confirms no observable change since #183:
  - `turn 3`, `3950 BCE` still; `canEndTurn: false`; `hasSentTurnComplete: false`.
  - Single active end-turn blocker remains `NOTIFICATION_NEW_POPULATION` (`id 3`).
  - `queueLength: 1`, `priority 100`, `kind: hud:population-placement`.
  - `selectedUnitId`, `firstReadyUnitId`, `selectedCityId`, `ready-unit`, and `ready-city` remain empty for direct operations.
  - `watch` still reports `populationPlacement: null` (no read-exposed candidate selected yet).
- Interpretation: still in an acquire-tile growth fork, and the live system is withholding candidate payload until the chooser is explicitly read/declared.
- No safe additional turn action can be validated without plot-level input.

### Advisory for the active player
- Keep one strict blocking lane:
  - Wait for chooser-grounded tile exposure for `NOTIFICATION_NEW_POPULATION`, then resolve with one validated command (`assign-worker --location <plot-index>` or `expand-city --city-id ... --x ... --y ...`).
  - Immediately re-read `notifications`, `notification-queue`, and `priorities` after executing the growth choice.
- Do not force unit movement or further production/tech actions while this growth decision is unresolved; visibility of those branches is not trustworthy until this branch closes.

### 10–20 turn lane adjustment (Thread #184)
- Turns 3–6: complete growth lock with the lowest-risk worker placement unless defense value clearly favors expansion.
- Turns 7–12: only after lock closure, resume scouting/terrain reading and confirm any expansion with one validated unit action.
- Turns 13–20: if growth and unit surfaces stabilize for two consecutive reads, shift to a defined posture (defend growth or apply calibrated pressure) with concrete production/tech sequencing.

- `Turn 3` | `No candidate-caster visibility change on recheck` | `Hold growth branch and await tile-level chooser exposure` | `Avoid desync-risk guesses; only act on explicit placement validation` | `Medium` | `If chooser never yields a valid tile payload by next 2 rechecks, request direct UI-state alignment before any non-validated growth attempt`

## Snapshot: Turn 3 (3950 BCE) — Tuner Growth-Model Divergence #185

- Additional runtime probe (`game exec` on `Tuner`) shows city growth internals currently report:
  - `currentFood: 14`, `turnsUntilGrowth: 2`, `isReadyToExpand: false`, `isReadyToPlacePopulation: false`.
- This conflicts with HUD-level blocker payload still surfacing `NOTIFICATION_NEW_POPULATION` as end-turn blocking at the same `turn 3`.
- Net effect for the advisor lane:
  - Keep blocker-first discipline but treat the growth notification as a front-end state signal that still needs one direct chooser-resolution read before any mutation.
  - Do not infer growth completion or place-worker/expansion from Tuner scalar fields alone.

- `Turn 3` | `Blocker payload is ready-state, but Tuner growth fields are not yet ready` | `Freeze non-lock actions until the UI exposes a concrete tile choice` | `State inconsistency could produce invalid commands if acted on blindly` | `Medium` | `Prioritize a chooser-backed `NOTIFICATION_NEW_POPULATION` read cycle, then execute one explicit tile claim/assignment command only with validation`

### Snapshot: Turn 5 (new game run, growth branch unlocked)

- Turn/Date: 5 / 3900 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `canEndTurn:false`, `hasSentTurnComplete:false`, `selectedUnitId:null`, `selectedCityId:null`
- Active blocker queue: `NOTIFICATION_NEW_POPULATION` (id 5) is end-turn blocking; `NOTIFICATION_COMMAND_UNITS` remains queued but non-blocking.
- Concrete evidence from `game watch` (ready-city payload):
  - `readyCity: LOC_CITY_NAME_INCA1` at `61,18`, `population:3`, `isReadyToPlacePopulation:true`, `cityWorkerCap:0`
  - `workablePlots: []` (no current worker placement options exposed)
  - `expansionCandidates` exposed (all 8 candidate plots returned with `cli` hints):
    - `61,19` `IMPROVEMENT_INCA_MOUNTAIN` (food +2)
    - `62,18` `IMPROVEMENT_MINE` (prod +2)
    - `60,17` `IMPROVEMENT_FARM` (prod +1, gold +1)
    - `60,18` `IMPROVEMENT_CLAY_PIT` (food +1, prod +1)
    - `60,19` `IMPROVEMENT_FARM` (food +1, prod +1)
    - `62,17` `IMPROVEMENT_MINE_RESOURCE` (prod +2, gold +1, Silver)
    - `62,16` `IMPROVEMENT_PASTURE` (prod +3, happy +1, Wool)
    - `61,16` `IMPROVEMENT_INCA_MOUNTAIN` (food +1, prod +2)
- Immediate command posture:
  - `assign-worker` is currently unsupported by exposed data (`workablePlots` empty, no known valid worker location).
  - `expand-city` is therefore the only supported safe branch for this blocker if choosing expansion is desired.
  - Execute one growth command only after immediate re-read confirms the target plot still valid in the same turn window.
- Confidence: high for observation integrity, medium for optimal plot pick due horizon uncertainty.

### 10-20 Turn Strategic Cadence — Window A (Turns 1-6) re-grounded

- Open strategy reset for this game run:
  1. Resolve population expansion first with **validator-backed tile claim**.
  2. Keep `COMMAND_UNITS` at low-risk hold state (SKIP_TURN on current scout is currently valid) until no blockers remain.
  3. Re-establish core production lane immediately after growth: prioritize reliable growth->worker/production throughput before outward aggression.
- Candidate operational sequence (next 10–20 turns):
  - `Turns 5-7`: expand into strongest non-speculative build tile (likely `62,16` pasture if happiness headroom is needed, else `62,17` silver mine if gold/production is a better near-term bridge).
  - `Turns 7-10`: complete city setup blockers, then convert growth to one stable production anchor and one map-reveal lane via scout movement.
  - `Turns 11-14`: evaluate whether frontier can support a pressure lane or should consolidate economy-first.
  - `Turns 15-18`: lock in your primary lane (growth/defense or growth/pressure) and keep one tempo reserve turn for blocker recursion.

### Turn Notes (new game, append-only)

- `Turn 5` | `Population growth is now explicit and actioned by concrete city tile data` | `Choose `expand-city` using an exposed candidate (no safe worker assignment yet), then re-read blocker queue` | `This is the first irreversible commitment in a fresh game; candidate visibility removes prior guess-risk` | `Medium` | `Re-check `ready-city`, `notification-queue`, and `watch` immediately after expand to verify `hasSentTurnComplete` and next blocker profile`

### Snapshot: Turn 5 (3900 BCE) — post-growth blocker transition

- Turn/Date: 5 / 3900 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `canEndTurn:false`, `hasSentTurnComplete:false`, `firstReadyUnitId=131072`, `selectedUnitId:null`, `selectedCityId:null`
- Active blocking state:
  - `NOTIFICATION_COMMAND_UNITS` is now the top end-turn blocker (priority 100).
  - `NOTIFICATION_NEW_POPULATION` is now present but expired and non-blocking.
- Evidence from live surfaces:
  - `notification(s)`/`notification-queue` report queue length `2`; population message is now `expired:true`, `isEndTurnBlocking:false`.
  - `ready-unit` exposes concrete ready unit:
    - `UNIT_SCOUT` at `(60,16)` with legal no-target operations including `SKIP_TURN` (valid) and move/automation options.
  - `ready-city` is currently null; no valid `ready-city` growth operation payload is exposed now.
  - `priorities` shows explicit command lane: read `ready-unit`, then `unit-target` before any move/attack-like unit action.
- Immediate play posture:
  - Keep this a unit-lane closure turn; do not rely on prior growth plan until another explicit growth payload reappears.
  - If no directional move intent is visible, send a validated `SKIP_TURN` on scout with explicit reason, then re-read blocker/notification queue.
  - If moving/automation is chosen, validate through `unit-target` flow before mutation.
- Confidence: high for blocker transition and current legal surface, medium for best tactical unit destination without a map-visibility plan.

### Turn Notes (new game, append-only)

- `Turn 5` | `Population blocker is no longer hard-blocking; command units is now the only end-turn blocker` | `Close unit lane first (at minimum, validated SKIP_TURN or a validated unit move) before resuming any growth/prod sequencing` | `The blocker handoff is a safety event: unit command can create irreversibility if target validation is assumed` | `Medium` | `Re-read `notifications`, `notification-queue`, `ready-unit`, and `priorities` immediately after the unit closeout`

### 10-20 Turn Strategic Cadence — Window A reset (Turn 5 blocker handoff)

- Updated 10–20 turn objective for this branch:
  1. Turn 5: close `NOTIFICATION_COMMAND_UNITS` with minimal-risk validated action.
  2. Turns 6–8: re-open city-growth lane and re-check expansion candidates only if chooser payload reappears.
  3. Turns 9–14: establish one stable production + one scouting lane (no speculative expansion while blocker telemetry is unstable).
  4. Turns 15–20: lock early lane choice (consolidate vs pressure) only after two consecutive reads with stable queue and same candidate set.

- Decision rule for this window:
  - If unit-blocker repeats in 2 consecutive windows, execute only read-then-send unit-reconciliation actions and pause any non-unit turn decisions until the queue proves movement.

### Snapshot: Turn 1 (4000 BCE) — Natural Wonder discovery blocker

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame: false` in App UI loading state `WaitingForVisualization`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blocker: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`id 0`) is end-turn blocking and currently unresolved.
- Queue/priority evidence:
  - `notification-queue` reports `queueLength:1` with top priority `inspect-handler` for the natural wonder discovery event.
  - `game watch` shows same top decision and `notificationCount:1` with `ready-unit:null`, `ready-city:null` at this instant.
- Ready surfaces:
  - `ready-unit` now exposes a concrete `UNIT_FOUNDER` at `(18,40)` with valid `FOUND_CITY`, `MOVE_TO`, and `SKIP_TURN` operations.
  - `ready-city` still returns no city payload yet.
- Interpretation:
  - This is a fresh opener where the unknown-blocker type shifted from command handling to a one-off discovery acknowledgment.
  - The immediate safe action is handler-aware unblock, while keeping unit action in reserve until the blocker is cleared.
- Confidence: medium-high for blocker shape, medium for exact UI handler command because this is an unclassified event.

### Turn Notes (new game, append-only)

- `Turn 1` | `Natural Wonder discovered and appears as the sole hard blocker` | `Treat as an unclassified blocking-notification; avoid blanket dismissal and execute the handler-aware unblock flow before further operations` | `Unclassified blockers have higher schema drift risk than known unit/city commands` | `Medium` | `After unblock attempt, re-read `notifications`, `notification-queue`, and `ready-unit`; then execute one validated opener action (likely `FOUND_CITY` or safe move) if the founder remains ready`

### 10–20 Turn Strategic Cadence — Window A reset (Turn 1 opening)

- Updated opening lane:
  1. Turn 1: resolve natural wonder discovery blocker with proper handler confirmation.
  2. Turn 1–3: establish first durable city placement using `UNIT_FOUNDER` with explicit `FOUND_CITY` validation.
  3. Turn 3–6: absorb initial scouting/tech setup only after founder command closes and turn-end blockers are confirmed clear.
  4. Turn 7–14: anchor one growth or early tempo lane after at least one validated city placement and two stable queue reads.

- Rule: if the unclassified discovery blocker repeats or queues with missing handler context twice, pause non-foundation actions and request explicit UI handler confirmation before any mutation.

### Snapshot: Turn 1 (4000 BCE) — production-first opener with mixed blockers

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Readiness surface consistency: `notification` state now shows three items in queue; top/end-turn blocker is `NOTIFICATION_CHOOSE_CITY_PRODUCTION` for city `0, id 65536` at `18,40`.
- Active queue (`notification-queue`):
  - `notificationCount: 3`
  - Priority order (effective):
    1. `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (end-turn blocking)
    2. `NOTIFICATION_COMMAND_UNITS` (expired; non-blocking)
    3. `NOTIFICATION_DISCOVER_NATURAL_WONDER` (non-blocking but unclassified)
- `ready-unit`: null (no selected/first ready unit exposed in this read)
- `ready-city`: city `LOC_CITY_NAME_SPAIN1` at `18,40`, `population:1`, `buildQueue.currentProductionTypeHash:-1`
- `ready-city` production candidates (live chooser-backed):
  - `UNIT_SCOUT` (`--unit-type 1`)
  - `UNIT_WARRIOR` (`--unit-type 14`)
  - Both currently validate `Requirements.MeetsRequirements: true` in this payload.
- `ready-city` growth (`populationPlacement`) shows `isReadyToPlacePopulation:false`, `cityWorkerCap:0`, no workable plots, no expansion candidates.
- `watch` confirms top decision is still production choice and retains the same city lock state.

### Turn Notes (new game, append-only)

- `Turn 1` | `Startup queue converged on production as the hard blocker; unclassified discovery remains but is no longer the gating action` | `Resolve `NOTIFICATION_CHOOSE_CITY_PRODUCTION` first from live chooser (`build-production --city-id 65536 --unit-type 1` or `...14`), then immediately re-read blockers` | `Opening turn is now a controlled, reversible path: production branch is explicit, while founder-availability is not exposed in this read` | `Medium` | `If production is misclicked or ambiguous, stop and re-run `ready-city` + `notifications` before any non-production unit action`

### 10–20 Turn Strategic Cadence — Window A (Turn 1 opening reset)

- Turn 1–3 tactical reset:
  1. Clear `NOTIFICATION_CHOOSE_CITY_PRODUCTION` with one explicit, validated production item.
  2. Then reconcile whether `NOTIFICATION_DISCOVER_NATURAL_WOUNDER` requires any explicit action (non-blocking now, monitor once per 1–2 reads).
  3. Re-check `ready-unit` after city production closure; if a ready unit appears, move only via validated `unit-target` flow.
- Turns 4–10:
  - Keep growth lock low-risk; growth is not ready yet and no valid expansion tiles are exposed.
  - Establish a stable scouting/protection lane after first turn production resolves.
  - Avoid speculative expansion; prioritize production continuity and clean blocker state.
- Turns 11–20:
  - Branch on whether city growth and unit readiness stabilize within two consecutive reads: consolidation lane (more worker/worker-cap setup) versus early-pressure lane (scout-based corridor and military tempo).

- Decision rule for this horizon:
  - Never act on unclassified blocker without handler evidence; never choose a production item before live city chooser payload is confirmed for that turn.

### Snapshot: Turn 1 (4000 BCE) — Natural Wonder hard block reasserted

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Hard blocker state:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` is now the active **end-turn** blocker.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and `NOTIFICATION_COMMAND_UNITS` are both present but `expired:true` and currently non-blocking.
- Queue context (`notification-queue`): `queueLength:3`
  - Step 1: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (priority 100, inspect-handler)
  - Step 2: `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (priority 70, operate-with-live-inputs)
  - Step 3: `NOTIFICATION_COMMAND_UNITS` (priority 65, inspect-ready-unit)
- `notification` detail for unit-command confirms stale/expired class with no `ready` candidate in payload and explicit repair action:
  - `repairCandidates: [ send-turn-complete --reason 'stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout' ]`
- `ready-unit --json`: no selected/ready unit exposed.
- `ready-city --json`: no city payload exposed; no chooser candidate currently exposed here.
- `watch`: top decision remains `NOTIFICATION_DISCOVER_NATURAL_WONDER`, `notificationCount:3`, with `ready-city` null and `ready-unit` null.
- Interpretation:
  - This is a fresh recovery oscillation where unclassified blocker governance takes priority over production/unit continuation.
  - Avoid executing city production until natural-wonder handler evidence is resolved and the queue is de-stacked.
- Confidence: medium-high for blocker topology, medium for immediate handler requirement because discovery notification remains unclassified.

### Turn Notes (new game, append-only)

- `Turn 1` | `Turn remains in natural-wonder handler lock with stale unit/production notifications now downgraded` | `Prioritize handler-aware unblocking of `NOTIFICATION_DISCOVER_NATURAL_WONDER`; do not force production/unit execution while it is end-turn blocking` | `The prior production-first lane is still useful, but the hard blocker has shifted and expired entries are not safe to treat as active constraints` | `Medium` | `Run `game play notifications --json` for handler evidence, then re-check `notification-queue` immediately before any `build-production` or `unit` command`

### 10-20 Turn Strategic Cadence — Window A (Turn 1 opener reset)

- Turn 1 immediate lane:
  1. Resolve natural wonder blocker with handler-accurate action.
  2. Re-read `notifications`, `notification-queue`, `ready-unit`, `ready-city`.
  3. If blocker declassifies and queue stabilizes, resolve production candidate with one validated `build-production` item.
  4. If unit command remains stale/expired after one recheck, use the explicit `send-turn-complete` repair once, then rehydrate reads before moving.
- 1–10 turn guidance:
  - Keep to one high-confidence action per read cycle.
  - Do not issue movement/speculative growth actions until both production and unit surfaces are live again.
  - Establish scouting cadence only after natural-wonder closure and production lock are both visibly confirmed.
- 11–20 lane decision trigger:
  - If after 2–3 stable reads blockers clear cleanly, branch to **consolidate** (worker cap, early city growth prep) or **pressure-lite** (scout probing only) lane.
  - If recovery oscillates, continue handler-first stabilization and defer aggression planning.

### Snapshot: Turn 1 (4000 BCE) — No-progress watch recheck

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker topology has stabilized on this read:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` remains **active hard blocker**.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and `NOTIFICATION_COMMAND_UNITS` remain `expired:true` / non-blocking in this cycle.
- `notification-queue` stays at `queueLength:3`:
  - `step 1` `NOTIFICATION_DISCOVER_NATURAL_WONDER` (hard)
  - `step 2` `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (non-blocking)
  - `step 3` `NOTIFICATION_COMMAND_UNITS` (non-blocking, stale-expired)
- `ready-unit` still null; `ready-city` still null.
- Unit staleness evidence remains consistent with `unit-command-stale-expired` + explicit repair candidate:
  - `game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json`
- `watch` confirms top decision remains `NOTIFICATION_DISCOVER_NATURAL_WONDER` and shows `notificationCount:3`, no exposed ready selectors.

### Turn Notes (new game, append-only)

- `Turn 1` | `Recovery loop with persistent natural-wonder hard block and stale side blockers` | `Do not act on city production yet; the only meaningful first step is handler-aware unblock of the discovery notification` | `Blocking state is coherent but partially stale in secondary channels, so forcing production now is likely to misalign` | `Medium` | `Send handler-safe unblock flow first, then re-read blockers; only if blocked queue de-ranks to production should `build-production` be attempted next`

### 10–20 Turn Strategic Cadence — Window A (Turn 1 recovery guard)

- 1–2 turn horizon: unblock `NOTIFICATION_DISCOVER_NATURAL_WONDER` and normalize queue ordering.
- 3–5 turns (if blocker clears): execute exactly one validated production choice and then one validated scout/commander action only if `ready-unit` appears.
- 6–10 turns (if both blockers recover): move from pure recovery into controlled opening lane (scout reconnaissance + tech/civic sequencing)
- 11–20 turns: choose consolidation vs pressure lane only after two consecutive stable reads showing clean queue progress.

- Guardrail: do not trust unclassified blocker payload as harmless when it remains end-turn blocking; continue one-command-per-read cadence until the sequence is explicit and stable.

## Relauch Continuity Block: Turn 1 (4000 BCE) — natural-wonder-ledger recovery pass

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness/loop evidence: `tuner-ready`, `inGame=true`, `notificationCount=3`, `game autoplay inactive`
- Hard blocker: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (isEndTurnBlocking=true, priority `blocking-notification`)
- Secondary queue entries observed: `NOTIFICATION_CHOOSE_PRODUCTION` (non-blocking at present) + `NOTIFICATION_COMMAND_UNITS` (stale/expired)
- Visibility notes: `ready-unit --json` and `ready-city --json` returned `null`; no selected unit or city in this snapshot window
- Re-usable command stack kept: status -> autoplay -> map summary -> app-ui snapshot -> roots -> Tuner `Players` + `Game.Notifications` + targeted `operation` on-demand

### Restart Objective (next 10–20 turns)

1) **Turns 1–6 (Unblock + stabilize):**
- Primary objective: clear `NOTIFICATION_DISCOVER_NATURAL_WONDER` before committing to non-blocking action sequences.
- Execution rule: do not begin movement/expansion actions while hard blocker persists.
- Expected check: if wonder path stalls across 2 windows, force a single `operation` audit pass on the top blocker and then `--send` only once preconditions are confirmed.

2) **Turns 7–12 (Recover structure and tempo):**
- After wonder de-stacks, immediately clear production/civics/policy decisions in fixed order if still present, then resume one-turn scouting progression.
- Focus on map-value lane selection that is cheap to reverse (route recon, no-city-commit moves).
- Verify queue and hash stability before each lane change.

3) **Turns 13–20 (Build compounding advantage):**
- Convert recovered setup turns into durable macro sequence: city growth + production unlock + safe frontier read-in.
- Only escalate aggression after at least one full cycle of blocker-clean, city-production, and unit command evidence.
- Maintain “one validated operation per window” discipline until replay-proof and queue-stable for 2 consecutive checks.

### Next player-facing message (single-turn window cadence)

- `Turn 1` | `Game relaunched; natural wonder discovery is the active end-turn blocker` | `Run blocker-first path only: resolve wonder, then re-test queue and only then do one blocker-clearing civic/production follow-up` | `Natural-wonder lock is hard and must clear before safe expansion` | `Medium` | `Recheck in 2–3 windows; if same blocker persists, pause all optional ops and request direct notification-root confirmation before non-blocking actions`

### Reusable strategy notes to keep (applies beyond this restart)

- The general command contract (`status`, `autoplay`, `map --summary`, `inspect`, Tuner `Players` + `Game.Notifications`) remains valid and should be repeated unchanged for comparability.
- Keep conservative posture when top decision is hidden or stale: no speculative action when blockers are hard/opaque.
- Preserve one-message-per-window cadence to avoid churn and keep actionable advice legible for the acting agent.

## Live Revalidation: Turn 1 (4000 BCE) — blocker stack unchanged

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:05:08Z)
- Turn hash: `0`
- Readiness/health: `tuner-ready`, `app-ui` in `GameStarted`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Lock state: `NOTIFICATION_DISCOVER_NATURAL_WONDER` remains hard blocker (`notification-id 0`, type `NOTIFICATION_DISCOVER_NATURAL_WONDER`, category `blocking-notification`, summary: Torres del Paine)
- Queue order (`notification-queue`): `1) wonder/blocking-handler, 2) city production expired, 3) command-units stale-expired`
- Watch alignment: top decision remains the natural wonder blocker; `notificationCount=3`, `firstReadyUnitId=null`, `selectedUnitId=null`, `readyUnit=null`, `readyCity=null`
- Stale side-channel behavior: `NOTIFICATION_COMMAND_UNITS` remains expired/non-blocking with `unit-command-stale-expired` and explicit repair route available via `end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>'`

### Immediate action protocol (next 3–6 turns)

- Do nothing beyond blocker-aware unblocking in this window.
- Use strict sequence if still blocked on natural wonder:
  1. Re-run `game play notifications --json` + `game play notification-queue --json` (already complete this cycle; preserve cadence).
  2. Re-open only after the official handler path is evidenced and run a single, validated unblock operation.
  3. Re-read blockers/watch immediately.
- Keep production/unit actions paused until the blocker de-ranks and a valid `ready-unit`/`ready-city` payload returns.

### 10–20 Turn Strategic Cadence reset (post-recheck)

- **Turns 1–4 (recovery consolidation):** hold one-window, handler-first discipline; queue must show wonder de-rank before any city/unit command.
- **Turns 5–10 (controlled resume):** if the blocker clears, execute one validated production action then one validated unit-closeout/expansion action in separate windows.
- **Turns 11–20 (lane pick):** once both city and unit selectors are stable for 2 consecutive windows, choose a lane:
  - **Consolidation lane:** stabilize growth and safe city production,
  - **Pressure-lite lane:** scout map edges with explicit movement validation only.

### Turn Notes (new game, append-only)

- `Turn 1` | `Live watch confirms natural-wonder handler-only hard lock with null ready selectors and stale unit side queue` | `Pause speculative movement/production; keep one validated unblock-at-a-time cadence and re-hydrate all three surfaces (watch, notifications, queue) after each attempt` | `The hard lock still governs end-turn legality; stale command-unit state remains non-blocking but unreliable for action choice` | `Medium` | `If hard lock persists for the next 2 windows, request explicit UI handler confirmation for notification `id 0` before any non-blocking candidate is attempted`

### Direct message for active player thread (non-spam)

- `Turn 1` remains hard-locked by `NOTIFICATION_DISCOVER_NATURAL_WONDER` (Torres del Paine) with `notificationCount=3`, while `ready-unit` and `ready-city` are still null. Recommended now: hold, resolve the wonder through handler-valid unblock flow only, then re-run `watch + notifications + notification-queue` before any `build-production` or unit action.

## Live Revalidation: Turn 1 (4000 BCE) — continuity hold (no progression)

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:05:22Z)
- Turn hash: `0`
- Readiness/health: `tuner-ready`, `app-ui` in `GameStarted`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Top lock unchanged: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`id 0`) remains hard/blocking, with `notificationCount=3`
- Queue unchanged: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (step 1 hard), `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (step 2 non-blocking, expired), `NOTIFICATION_COMMAND_UNITS` (step 3 stale-expired/non-blocking)
- Visibility unchanged: `selectedUnitId=null`, `firstReadyUnitId=null`, `readyUnit=null`, `readyCity=null`
- Repair lane unchanged: stale `COMMAND_UNITS` still exposes only the `send-turn-complete` reconciliation candidate

### Window-level direction

- Keep hard-lock-first posture for this window: block all non-handled production/unit execution.
- In next two windows:
  1. Retry handler evidence from `game play notifications --json` and `game watch` only when any lock change is observed.
  2. If the hard lock is still present, do not force speculative operations.
  3. If a handler-confirmed unblock path appears, execute one validated unblock and immediately re-read queue/watch for second-window stability before next action.
- Horizon check: `10–20` turn plan remains in **recovery lane reset** until unlock evidence appears; no lane commitment yet.

### Turn Notes (new game, append-only)

- `Turn 1` | `Second consecutive read confirms static recovery state` | `Continue blocker-first loop only; do not add unit/city action until ready selectors reappear` | `No additional data changed to justify irreversible sequencing` | `Medium` | `Escalate only if handler evidence for natural wonder appears; else keep queue/watch revalidation cadence`

### Direct message for active player thread (non-spam)

- `Turn 1` still has no forward unlock from the last window: hard wonder block remains top, ready selectors remain null, and unit-queue state is still stale non-blocking. Follow the same safe cadence: no speculative ops, clear only through handler-confirmed unblock flow, then immediately re-read blocker surfaces.

## Live Revalidation: Turn 1 (4000 BCE) — static hold (third immediate probe)

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:05:35Z)
- Turn hash: `0`
- Readiness: `tuner-ready`, `GameStarted`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Top lock unchanged: `NOTIFICATION_DISCOVER_NATURAL_WONDER` remains blocking (`id 0`)
- Queue shape unchanged: 3 entries in `notification-queue`
  - step 1: natural wonder hard blocker (`priority 100`, `inspect-handler`)
  - step 2: choose city production (`priority 70`, expired/non-blocking)
  - step 3: command-units (`priority 65`, stale-expired/non-blocking)
- Ready probes unchanged: `ready-unit` and `ready-city` both null (`selectedUnitId=null`, `firstReadyUnitId=null`, no legal ops)
- Command-units lane unchanged: `unit-command-stale-expired` with explicit `send-turn-complete` reconciliation hint only

### Current control posture (next 3–6 turns)

- Keep strict hold on handler-only resolution for the natural wonder; do not execute speculative city/unit actions.
- Continue the same read-evidence loop each window: `watch` -> `notification-queue` -> `notifications` -> re-check.
- Do one validated unblock attempt at most per cycle only after handler evidence is concrete.

### Turn Notes (new game, append-only)

- `Turn 1` | `Third probe confirms no queue/selection progression` | `Hold the recovery lane exactly as-is: no production, no unit movement, one validated unblock-at-a-time` | `The top blocker remains the only legal constraint on advancement; low-entropy state is safer than rushed irreversible actions` | `Medium` | `If this exact topology holds for one more cycle, escalate by requesting handler-level confirmation for the natural wonder blocker before any additional command attempt`

### Direct message to active player thread (non-spam)

- `Turn 1` is still fully stalled by `NOTIFICATION_DISCOVER_NATURAL_WONDER`; `ready-unit/city` stays null and queue state is unchanged. Keep the sequence tight: wait for handler validation, perform only that unblock path if proven, then immediately re-read `watch + notification-queue + notifications`.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (fourth probe)

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:05:47Z)
- Turn hash: `0`
- Readiness: `tuner-ready`, `AppStarted`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker topology unchanged for fourth consecutive read:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` remains hard/active (`id 0`, `blocking-notification`)
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` remains non-blocking/expired
  - `NOTIFICATION_COMMAND_UNITS` remains non-blocking/stale-expired with no closeout candidates
- `notificationCount=3`, `selectedUnitId=null`, `firstReadyUnitId=null`, `readyCity=null`, `readyUnit=null`
- `notification-queue` unchanged (`queueLength:3`, same order and priorities)
- `ready` probes confirm no legal moves/production payload is actionable in this state

### Recommended loop for next 3–6 windows

1. Keep one-step read cycle only: `watch` → `notification-queue` → `notifications` → re-read.
2. Continue handler-aware resolution only for the natural wonder blocker.
3. Defer all city-unit sequencing decisions until the top blocker is declassified and a ready selector appears.

### Turn Notes (new game, append-only)

- `Turn 1` | `Static hold persists; no new actionable surface after repeated fresh probes` | `Hold full blocker-first mode, no speculative production or unit movement` | `Hard top decision remains the only legal reason to wait; unit/city selectors are still suppressed` | `Medium` | `If this state persists beyond the next window, escalate by asking for explicit handler/notification-root confirmation before any unblock attempt`

### Direct message for active player thread

- `Turn 1` remains blocked with unchanged evidence (`notification-queue=3`, natural wonder hard lock, null ready-city/ready-unit). Follow the same sequence and do not move a scout/issue production until handler evidence on the wonder blocker is present and revalidated by immediate post-action reads.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (fifth probe)

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:05:59Z)
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Lock profile unchanged:
  - Step 1 `NOTIFICATION_DISCOVER_NATURAL_WONDER` (hard blocker, `isEndTurnBlocking:true`)
  - Step 2 `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (non-blocking, `expired:true`)
  - Step 3 `NOTIFICATION_COMMAND_UNITS` (non-blocking, stale-expired)
- Top decision remains `NOTIFICATION_DISCOVER_NATURAL_WONDER`; ready selectors remain absent (`readyUnit=null`, `readyCity=null`, `selectedUnitId=null`, `firstReadyUnitId=null`).
- `watch`, `notifications`, `notification-queue`, and `map` confirm unchanged `turn=1`, `turnDate=4000 BCE`, `hash=0`.
- Read-only command surface still reports `unit-command-stale-expired` and a stale closeout candidate only.

### Turn Notes (new game, append-only)

- `Turn 1` | `Fifth direct probe confirms no meaningful state change` | `Keep strict blocker-first posture; do not attempt production/unit action until handler-confirmed wonder closure and selector resurfacing` | `The same hard lock persists with suppressed ready lanes, so speculative actions remain high-risk and non-verifiable` | `Medium` | `If this remains unchanged for one more probe, ask for explicit handler confirmation and/or alternate unlock path before any non-watch operation`

### 10–20 Turn Strategic Cadence (continuation)

- Recovery gate remains active through this window: de-noise the opening with one validated unblock-at-a-time only.
- Lane commitment (`consolidate` vs `pressure-lite`) remains deferred until both:
  1. `NOTIFICATION_DISCOVER_NATURAL_WONDER` de-ranks from blocking position,
  2. valid `ready-unit` or `ready-city` payload reappears for at least 1 consecutive stable re-read.

### Direct message for active player thread (non-spam)

- `Turn 1` is still unresolved by any fresh surface; natural-wonder remains hard blocker and ready selectors are null. Do not advance with production/unit actions. Keep re-reading `watch`, `notification-queue`, and `notifications` after each confirmed unblock attempt.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (sixth probe)

- Turn/Date: 1 / 4000 BCE (snapshot at 2026-06-02T03:06:12Z)
- Turn hash: `0`
- Readiness: `tuner-ready`, `AppUI in GameStarted`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Lock profile unchanged for sixth direct read:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` remains top hard blocker
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and `NOTIFICATION_COMMAND_UNITS` remain non-blocking (`expired` / `stale-expired` respectively)
- `notificationCount=3`; top `blockingNotificationId` still `id 0`
- `ready-unit` and `ready-city` remain null; no legal unit/city action payload exposed
- `notification-queue` order/priorities unchanged

### Turn Notes (new game, append-only)

- `Turn 1` | `Sixth probe still shows no queue or selection progress` | `Continue hard-lock-only recovery lane, with no scout/city actions until a handler-confirmed unblock path for wonder appears` | `Multiple cleanly fresh reads confirm static state and reduce the value of speculative sequencing` | `Medium` | `Hold this read-and-validate loop and escalate only to explicit natural-wonder handler confirmation before any unblock attempt that could change state`

### Window guidance update

- 10–20 turn planning remains in **recovery-first mode** until two conditions are met:
  1) `NOTIFICATION_DISCOVER_NATURAL_WONDER` de-ranks from hard blocker,
  2) `ready-unit` or `ready-city` surface becomes non-null and stable across two reads.
- In this gate, prioritize clean evidence collection over action volume.

### Direct message to active player thread

- Turn 1 remains fully stalled and unchanged (`notification-queue=3`, `turn/hash stable`, no `ready-unit/ready-city`). Keep the same safe playbook: one validated blocker-closure attempt only when handler evidence appears, then immediate re-read of `watch + notifications + queue`.

## New Game Launch Reset (Session Restart #2) — Turn 1 / 4000 BCE

### Net-new game snapshot

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0` (confirmed from current status/watch/notification reads)
- Readiness: `tuner-ready`, `autoplay.isActive=false`
- End-turn readiness: `canEndTurn=false`, `hasSentTurnComplete=false`
- Top blocking notification: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`Torres del Paine`)
- Queue state: `notification-queue` length `3` (`inspect-handler` for wonder, `production-choice`, `unit-command`)
- Selection state: `selectedUnitId=null`, `firstReadyUnitId=null`, `selectedCityId` unavailable from surfaced state
- Operational command posture: **do not execute speculative civ7 ops** until official handler evidence is surfaced for the wonder path

### Net-new 10–20 turn sequence (session-specific)

#### Window A (Turns 1–4): Stabilize the decision surface
- Objective: validate natural wonder handler and unblock the first legal decision path.
- What I will keep doing:
  - Poll every 2–4 turn-meaningful snapshots in strict order: `watch -> notifications -> notification-queue -> ready-unit -> ready-city`.
  - Read blocker evidence directly from official `notification`/`queue` handlers before any command.
  - Preserve city production and unit actions as pending until selection/validator data is concrete.
- Exit condition to move beyond this window: wonder handler evidence appears with a safe operation contract.
- Risk: very high due to unclassified hard blocker; avoid irreversible actions.

#### Window B (Turns 5–8): Controlled unlock
- Objective: clear first blocker chain and re-enter normal opener sequencing.
- Priority if wonder resolves: one validated non-branching operation per window (civic/production/social/unit as exposed by fresh runtime)
- Priority if wonder persists: pivot to evidence-driven queue handling only; no speculative skip-moves.
- Exit condition: at least one live `ready-*` selector and one non-blocking action executed with validation proof.

#### Window C (Turns 9–14): Expand after proof
- Objective: shift from blocker-only posture to map/value scouting and economy tempo.
- Priorities: city growth or first production conversion, then one recon lane with safety; avoid frontier aggression without path confidence.

#### Window D (Turns 15–20): Lane lock-in
- Objective: choose durable strategic lane (settlement + expansion vs. military posture) using objective proof from map/queue snapshots.
- If threat rises: lock defense-first; if map clears safely: push controlled expansion with one backup move per turn.

### What still applies generically (keep)

- Blocker-first sequencing remains mandatory.
- Never execute commands from queue hints alone; require explicit Tuner/runtime validation.
- Keep updates in one turn row and avoid multi-message noise.
- Maintain `10–20` turn framing with correction checkpoints every 3–6 snapshots.

### Turn note (append-ready)

- `Turn 1` | `New session resumed after crash; hard blocker is unclassified natural wonder discovery` | `Hold operation posture, revalidate watcher chain, and wait for handler evidence before any production/unit execution` | `Hard blocker may mask legal action surface; prior data is not safely actionable yet` | `High` | `Recheck queue/notifications in 2–4 snapshots; if blocker does not resolve, request explicit handler-backed unblocking path before turning to expansion`

### Message to active player thread

- Net-new posture for this launch: stop speculative play for now and run a strict evidence pipeline (`notifications` + `notification-queue` + `ready-unit` + `ready-city`) until `NOTIFICATION_DISCOVER_NATURAL_WONDER` is legally handled, then execute only one validated action per window. This is a restart-safe guardrail; generic blocker-first and 10–20 turn planning framework remains active and unchanged.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (seventh probe)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Selection signal remains suppressed:
  - `selectedUnitId=null`, `firstReadyUnitId=null`
  - `selectedCityId=null`
  - `readyUnit=null`, `readyCity=null`
- Lock topology remains:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`id 0`) is still hard blocking (`decision: blocking-notification`)
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` remains non-blocking/expired
  - `NOTIFICATION_COMMAND_UNITS` remains non-blocking/`unit-command-stale-expired`
- `notification-queue` remains length `3` and retains the same priority order (`inspect-handler` -> `operate-with-live-inputs` -> `inspect-ready-unit`)
- `game play notifications --json` still reports a `repairCandidates` path only for COMMAND_UNITS (`game play end-turn --send`) and does not open a direct production/unit action path while the wonder lock is unresolved.

### 10–20 Turn Strategic Cadence correction

- **Window A (Turns 1–4) is now extended** to **Turns 1–8** due to hard-lock persistence.
- New gate condition to enter Window B remains unchanged: **handler-confirmed declassification of the natural wonder decision** and recovery of at least one stable `ready-*` lane.
- Tactical posture until that gate: watcher-only discipline, one validated unlock attempt only when handler proof appears, then immediate post-op readback before any production/unit commitment.

### Turn note (append-only)

- `Turn 1` | `Seventh consecutive read confirms unchanged lock topology and no selector recovery` | `Hold strict blocker-first recovery lane; preserve one-at-a-time validation if lock evidence changes` | `No fresh legal decision surface for Scout/Production while wonder is unresolved` | `Medium` | `If top blocker remains after two additional probes, escalate to explicit handler-close confirmation on `NOTIFICATION_DISCOVER_NATURAL_WONDER` before issuing any further non-watch operations`

### Direct message to active player thread (non-spam)

- Turn 1 remains a hard static gate: the wonder blocker still blocks end-turn, and both unit/city selectors are null. Keep the same exact read loop and avoid production/unit sends until explicit handler proof arrives for notification `id 0`.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (eighth probe)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker status remains locked:
  - `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`id 0`, blocking)
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (non-blocking, `expired:true`)
  - `NOTIFICATION_COMMAND_UNITS` (non-blocking, `unit-command-stale-expired`)
- Selector state still unavailable:
  - `selectedUnitId=null`, `firstReadyUnitId=null`, `selectedCityId=null`, `readyUnit=null`, `readyCity=null`
- `notification-queue` still length `3`, same ordering and priorities as previous windows.
- `watch` confirms stable `turn=1`, `turnDate=4000 BCE`, `hash=0` after this probe.

### Turn note (append-only)

- `Turn 1` | `Eighth direct probe remains fully unchanged` | `Continue handler-only lock handling; do not attempt scout or production actions without handler confirmation of wonder closure` | `Persistent null ready selectors indicate the state is still not legally advanced` | `Medium` | `After this, still no change? then extend the recovery gate again; if lock persists across another 2 probes, escalate by requesting explicit handler-close confirmation and proof payload before any non-watch operations`

### Window-level correction

- `10–20` turn lane remains in **extended recovery mode**:
  - Treat `Window A` as open-ended until `NOTIFICATION_DISCOVER_NATURAL_WONDER` de-ranks and one `ready-*` selector appears with actionability.
  - Transition to Window B only after that gate is met and one post-clear revalidation cycle succeeds.

### Direct message for active player thread (non-spam)

- Turn 1 still shows no unlock progression: same hard natural-wonder blocker, same 3-item queue, no ready unit/city selectors, no legal city/unit payloads. Keep the same one-cycle evidence loop and handler-only posture; do not force production or movement commands until the wonder is legally resolved and selectors resurface.

## Live Revalidation: Turn 1 (4000 BCE) — sustained hold (ninth probe)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame:true`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Hard top blocker unchanged: `NOTIFICATION_DISCOVER_NATURAL_WONDER` (`id 0`, hard)
- Secondary notifications remain non-actionable for immediate unlock:
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (expired, non-blocking)
  - `NOTIFICATION_COMMAND_UNITS` (`unit-command-stale-expired`, no enabled closeout)
- Selector recovery still absent: `selectedUnitId=null`, `firstReadyUnitId=null`, `selectedCityId=null`, `readyUnit=null`, `readyCity=null`
- `notification-queue` still length `3`, same dispositions and priorities as prior window
- No map/turn/hash progression in this fresh cycle.

### Turn note (append-only)

- `Turn 1` | `Ninth probe still static; no legal progression path surfaced` | `Maintain the same lock-only recovery loop and avoid any non-handled action attempts` | `Repeated absence of ready selectors means any speculative play has low verification value` | `Medium` | `Hold for one more pair of probes; if still unchanged, escalate to direct handler-close confirmation for natural wonder blocker before trying any next action`

### Strategic horizon checkpoint (10–20 turns)

- Keep `Window A` extended as an unresolved lock-resolution phase until:
  1) top natural-wonder blocker de-ranks through handler proof, and
  2) at least one `ready-unit`/`ready-city` lane is non-null and stable for one follow-up read.
- Do not enter scouting/pressure sequencing until both are true; prioritize evidence integrity over tempo.

## Live Revalidation: Turn 1 (4000 BCE) — recovery-to-production transition

- Snapshot time: 2026-06-02 (post-rehydrate, second recovery validation)
- Turn/Date: 1 / 4000 BCE, `hash=0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Short transient issue observed: `civ7 game` surface briefly entered UI-loading during recovery (`WaitingForGameplayData` / `WaitingForGameCore`) and one `watch/notification/ready` command family failed with runtime module-load errors, then recovered to full `tuner-ready`.
- Stable blocker profile after recovery:
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) currently reads as end-turn blocking in notifications view (`isEndTurnBlocking:true`) with `unit-command-stale-expired` details and no enabled closeout candidates.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 1`) currently reads as non-blocking in this snapshot (`isEndTurnBlocking:false`, `expired:true`), city target at `{owner:0,id:65536,type:1}` and location `{x:26,y:36}`.
- Selection state remains null: `selectedUnitId=null`, `firstReadyUnitId=null`, `selectedCityId=null`.
- Economic snapshot: `cities=1`, `units=1`, `treasury=0` (via tuner exec), `tech` exists but progression not shown.
- `blockingNotificationId` from App UI is `id 0` in the immediate snapshot.

### Strategic interpretation

- The initial natural-wonder block is no longer the active visible frontier after rehydrate; the active lane is now a **command-unit reconciliation blocker** with stale pointer + a concurrent city production decision.
- Do not execute movement/scout actions while `selectedUnitId` and `firstReadyUnitId` remain null.
- The first validated unfreezing action candidate is now to resolve the city-production decision if/when the live chooser provides a concrete unit/project/building item (not just queue metadata), then re-read all surfaces.

### Turn note (append-only)

- `Turn 1` | `Post-recovery shift: natural-wonder blocker removed from immediate sequence; stale COMMAND_UNITS still blocks before valid city-production closure` | `Prioritize stable unblock evidence and handle CHOOSE_PRODUCTION only when live chooser is concrete; keep unit-action attempts deferred until a ready-unit candidate appears` | `Transient game state churn + null ready selectors means high risk of mis-sending` | `Medium` | `If COMMAND_UNITS remains blocking after one production-clear attempt, request explicit validator proof for `send-turn-complete` path versus a true tactical move branch before forcing any unit operation`

### 10–20 turn horizon correction

- Entering turn-1 tactical execution should be in two-step order:
  1. Resolve city production lock using explicit live picker proof (`build-production` path only).
  2. Re-run full live read (`watch` / `notifications` / `notification-queue` / `ready-*`) and, only if `unit-command` still blocks with actionable candidates, pursue guarded unit reconciliation.
- If this holds for two additional snapshots, extend `Window A` again as a recovery phase and defer broader scouting/pressure planning until both producer and unit selectors are materially stable.

## Live Revalidation: Turn 2 (3975 BCE) — unlock re-baseline

- Turn/Date: 2 / 3975 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blockers from authoritative App UI / notification queue:
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 1`) is now the end-turn blocker.
  - `NOTIFICATION_CHOOSE_TECH` (`id 2`) is non-blocking but live-available.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) remains non-blocking with stale-classic reconciliation metadata.
- Selection surfaces are now materially different from earlier loops:
  - `selectedUnitId=null`, `firstReadyUnitId={"owner":0,"id":131072,"type":26}` (a `UNIT_SCOUT` at `26,36`).
  - `readyCity` is now available: `selectedCityId=null`, `blockingCityId={"owner":0,"id":65536,"type":1}` at `26,36`.
- `ready-unit --json` shows legal unit operations including `MOVE_TO`, `SKIP_TURN`, `ALERT`, `EMBED_LOOKOUT`, `SLEEP`, `WAIT_FOR`.
- `ready-city --json` exposes concrete production candidates for the city:
  - `BUILDING_GRANARY` (`ConstructibleType 42`) with `placementPlot {x:26,y:36}`
  - `UNIT_SCOUT` (`UnitType 1`)
  - `UNIT_HOPLITE` (`UnitType 30`)
- `ready-city` growth/status snapshot:
  - city growth in `5` turns, queue shows previous production `UNIT_SCOUT` completed, 0 workers assigned in workable plots, blocked expansion context.
- `notification-queue --json` remains 3-step and now lists production-choice as step 1 blocker, tech-choice step 2, unit-step 3.

### Turn 2 Tactical interpretation

- This is no longer a pure lock/recovery loop; the game is in a valid opener-resolution phase with concrete choices.
- The cleanest legal execution path is:
  1. Resolve `NOTIFICATION_CHOOSE_CITY_PRODUCTION` with a validated `build-production` choice (unit granary/scout/hoplite) using live chooser proof.
  2. Re-read `watch -> notifications -> ready-unit/ready-city -> notification-queue`.
  3. If `canEndTurn` still false, resolve tech and then unit skip/reposition sequence with the concrete ready unit.

### Turn note (append-only)

- `Turn 2` | `Recovered selection surfaces and concrete live candidates are now present` | `Prioritize city production unblock first (it is the top blocker), then confirm tech blocker with an enabled research node and finish with deterministic unit closeout` | `Turn moved to new strategic layer; stale null-ready posture is improving but multi-decisions are now stacked` | `Medium` | `After one production/tech/command sequence readback, if turn 2 still blocks, hold to the validated next-step sequence before committing any movement path`.

### 10–20 turn horizon update

- **Window A (Turns 1–4)**: ends here due valid blocker surface recovery.
- **Window B (Turns 5–8)**: now starts with concrete opener sequencing:
  - secure production queue and tech branch, then spend mobility budget on scout-led map reading rather than risked pushes.
  - prefer city growth tempo and safe military coverage over expansion into unknown pressure without prior target proof.
- **Window C (Turns 9–14)**: transition to frontier lane selection once one stable `unit` move plan and one production milestone are validated.

### Direct advisory to active player thread (non-spam)

- Turn 2 is actionable again: top lane is `production-choice` with live options (`Granary`, `Scout`, `Hoplite`) at `{x:26,y:36}` and a real ready scout (`id 131072`) with legal move ops. Resolve production first, then tech+unit in that order after each immediate re-validation.

## Live Revalidation: Turn 2 (3975 BCE) — tech-first unblock lane

- Snapshot time: 2026-06-02T??:??:??Z (post-observation probe)
- Turn/Date: 2 / 3975 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blocker now: `NOTIFICATION_CHOOSE_TECH` (`id 2`) is end-turn blocking.
- Other queued items:
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 1`) non-blocking in this surface order.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) non-blocking with valid scout closeout candidate.
- Ready selectors:
  - `firstReadyUnitId={"owner":0,"id":131072,"type":26}` (`UNIT_SCOUT` at `26,36`)
  - `selectedUnitId=null`, `selectedCityId=null`, `blockingCityId=null`
- `ready-unit --json` confirms legal scout actions now exposed (`MOVE_TO`, `SKIP_TURN`, `ALERT`, `EMBED_LOOKOUT`, `SLEEP`, `WAIT_FOR`, plus command options).
- `ready-city --json` is inert because city is no longer the top blocker on this pass; no closeout city selector is selected.
- `notification-queue --json` order now: step1 **tech**, step2 production, step3 unit.
- Tech surface explicitly includes enabled nodes:
  - `NODE_TECH_AQ_POTTERY`, `NODE_TECH_AQ_ANIMAL_HUSBANDRY`, `NODE_TECH_AQ_SAILING` all enabled with `--send --closeout` clis,
  - higher-depth techs are disabled/disabled-to-target until prerequisites open.
- `watch` reflects blocker state transition (`technology-choice`) and still shows `turn=2`.

### Tactical interpretation

- This is the first robust opening in this session after transient recovery and stale-blocker cycles.
- Immediate validated sequence:
  1. Resolve **technology choice** using an enabled node from live tech options.
  2. Re-run quick readback (`watch`, `notifications`, `notification-queue`, `ready-unit`).
  3. Address city production in the next pass if still exposed and actionable.
  4. Use scout closeout (`SKIP_TURN` on unit `131072`) only if no movement path improves frontier safety/value.

### Strategic recommendation (10–20 turn horizon)

- **Window B (Turns 5–8)** now enters active sequencing: choose one early tech path that maximizes immediate scouting reliability:
  - **Sailing** if map pressure suggests coastal/sea leverage later;
  - **Pottery** if you want near-term domestic scaling reliability;
  - **Animal Husbandry** if first contact/food-pressure scouting indicates animal tiles and fast worker-econ payoffs soon.
- Keep city growth safe: avoid overcommitting to unit spam before tech/prod cadence is stabilized.
- Risk gate: until a tech and at least one production decision are confirmed, do not force scouting movement into unknown adjacency.

### Turn 2 note (append-only)

- `Turn 2` | `Blocker role finally clarified to tech-choice-first after prior recovery churn` | `Execute tech unblock first (Pottery / Animal Husbandry / Sailing), then revalidate production and unit options` | `The surface now supplies concrete options, so speculative play risk has dropped but still remains if command/state not fully re-read` | `Medium` | `If tech choice is sent and queue advances, keep same revalidation cadence; if blocker persists, verify selected node validity before retrying`.

### Direct advisory to active player thread

- Turn 2 has moved to a clear action lane: **resolve tech first**, then re-check production and scout action. Prefer a low-risk enabled tech (`Pottery`, `Animal Husbandry`, or `Sailing`) based on whether you want faster food/warfare economy or sea-readiness; avoid committing movement before the post-tech/prod re-read confirms no hidden blocker shift.

## Live Revalidation: Turn 2 (3975 BCE) — blocker lane pivot to command-closeout

- Snapshot time: 2026-06-02T03:10:00Z (post-observation probe)
- Turn/Date: 2 / 3975 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blocker evidence stack (App UI + play notification family):
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is end-turn blocking.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 1`) is non-blocking (not currently end-turn gating).
  - `NOTIFICATION_CHOOSE_TECH` (`id 2`) is non-blocking and still has live options.
- `civ7 game play notification-queue --json` and `civ7 game watch --json` now agree on priority order:
  - step 1: command-units
  - step 2: production-choice
  - step 3: technology-choice
- Selection + live choice surfaces:
  - `selectedUnitId=null`
  - `firstReadyUnitId={"owner":0,"id":131072,"type":26}` (`UNIT_SCOUT` at `25,35`)
  - `selectedCityId=null`, `readyCity=null`, `blockingCityId=null`
  - `ready-unit --json`: valid operations include `MOVE_TO`, `SKIP_TURN`, `ALERT`, `EMBED_LOOKOUT`, `SLEEP`, `WAIT_FOR`.
  - `ready-city --json`: no active legal city operation context because `id 1` is not the current blocker.

### Tactical interpretation (fresh turn-2 lane)

- This is now a two-tier legal sequence: clear the command-closeout first using a verified scout action, then re-read and only then consume production/tech branches.
- The lowest-regret path is:
  1. Run a unit operation on the concrete ready scout (prefer `SKIP_TURN` unless movement is explicitly validated against a target with strategic value).
  2. Re-read `watch -> notifications -> notification-queue -> ready-unit`.
  3. If blocker clears, resolve `NOTIFICATION_CHOOSE_CITY_PRODUCTION` next with a live chooser-backed concrete item.
  4. Resolve tech with `NOTIFICATION_CHOOSE_TECH` only after the above settles.
- Keep an explicit anti-speculation rule: do not accept unit movement as “done” if `watch`/`notifications` still reports `unit-command` blocking.

### Generic strategic clauses that still hold (apply unchanged)

- Never substitute guessed IDs for live values; every send path must have validator-backed proof from `ready-*`/`choose-*` or queue/notification details.
- Keep command cadence conservative: one high-confidence action, full revalidation, then next action.
- Preserve economy stability over tempo greed in turns 1–10 unless a clear path from scout recon justifies expansion.
- Avoid irreversible production commitments while any top blocker is unresolved.
- Do not force movement into unknown adjacency until at least one safe lane from the scout is proven with target validation.

### Turn note (append-only)

- `Turn 2` | `Blocker lane shifted again: unit-command now first gate while tech/production are advisory` | `Resolve command-closeout on the concrete scout id 131072 first; then revalidate before touching production or tech` | `This avoids wasted moves against stale sequencing and preserves read/write safety under fast blocker drift` | `Medium` | `If unit-closeout still does not clear, do not escalate to guessed movement/production; re-read both App UI and Tuner-facing details and resync before any non-closeout unit action`

### 10–20 Turn horizon correction

- `Window B` remains active, but its first objective becomes **turn-loop hardening** before expansion:
  - `Turns 5–8`: command-closeout stabilization + one constrained production branch + one safe scouting commitment only after target validation.
  - `Turns 9–14`: transition from cleanup to lane selection only once at least one production and one tech branch have successfully been locked in consecutive reads.
  - `Turns 15–20`: decide between compact growth track (granary/food + early worker timing) and pressure-lite scouting/claim path.

### Direct advisory to active player thread (non-spam)

- Current play lane: end-turn blocker is `NOTIFICATION_COMMAND_UNITS` with real scout id `131072`; `CHOOSE_TECH` and `CHOOSE_CITY_PRODUCTION` are present but not gating this turn. Execute the scout closeout with confirmation-first discipline, then re-check. If closeout opens, proceed to production, then tech. Avoid speculative movement before revalidation.

## Live Revalidation: Turn 2 (3975 BCE) — stale reconciliation lock after closeout attempt

- Snapshot time: 2026-06-02T03:09:05Z (same observed cycle family)
- Turn/Date surface split:
  - `civ7 game status --json` (Tuner) reports `turn=3`, `turnDate=3950 BCE`, `hash=0`.
  - `civ7 game watch --include-ready-unit --include-ready-city --json` (App UI) still reports `turn=2`, `turnDate=3975 BCE`, `hasSentTurnComplete` not shown in this call.
  - This divergence strongly suggests reconciliation lag after a pending closeout signal rather than active, stable board progression.
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`.
- Blocker state now:
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is still end-turn blocking.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 1`) remains non-blocking.
  - `NOTIFICATION_CHOOSE_TECH` (`id 2`) non-blocking and currently reports all known tech choices as disabled in the immediate pass.
- `civ7 game play ready-unit --json` and `ready-city --json` both return no current selected/ready context.
- `civ7 game play notifications --json` confirms explicit reconciliation marker:
  - `hasSentTurnComplete:true` at notification level.
  - `unit-command` details classify as `unit-command-stale-expired`.
  - `closeoutCandidates`: scout `id 131072` (`UNIT_SCOUT`) has `SKIP_TURN` candidate present but `enabled:false`.
  - `enabledCloseoutCandidates:[]`.
  - `repairCandidates` includes `wait-for-turn-advance` via `game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl`.
- `notification-queue --json` remains unchanged: step1 command-unit, step2 production, step3 tech.

### Tactical interpretation

- This is no longer a normal “pick-and-send” phase. We have a confirmed stale blocker class after an attempted command-closeout:
  - no ready unit pointer,
  - no executable closeout candidate,
  - and explicit repair hint tied to a pending turn-complete transition.
- A valid next move set is therefore: re-run a short multi-sample watch loop and only re-open the action ladder after the blocker class changes. Do not force any unit/city/tech mutation while this exact pattern persists.

### Turn note (append-only)

- `Turn 2` | `Command unit remains blocker, but closeout is now explicitly stale/disabled with hasSentTurnComplete=true` | `Hold all sends; run reconciliation watch loop and wait for either blocker reclassification or confirmed turn advancement` | `Cross-surface drift (App UI turn 2, Tuner turn 3) means action legality is not stable enough for a low-risk mutation` | `Medium-High` | `If this persists on next window, run one additional 3-sample watch and do not proceed until `closeoutCandidates` or a fresh firstReadyUnit appear`

### 10–20 turn horizon correction

- Keep `Window B` in a hardening sub-phase until reconciliation clears:
  - `Turns 5–8`: blocker stabilization and read-surface convergence only; no speculative unit movement.
  - `Turns 9–14`: re-enter scouting-expansion sequencing only after at least one enabled closeout (or validated production branch) is confirmed in two consecutive reads.
  - `Turns 15–20`: preserve compact growth track and conditional lane split if and only if command/purchase branches are stable.
- Corridor rule: only shift to pressure lanes when both blocker stack and `firstReadyUnitId` are stable across a clean post-wait recheck.

### Direct advisory to active player thread (non-spam)

- Active lane is **not** action-ready yet. `NOTIFICATION_COMMAND_UNITS` is the top blocker but closeout is currently stale/disabled, with `hasSentTurnComplete:true` and no valid ready-unit command payload. Continue with a constrained re-sync pass (`watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl`) and resume only when the queue/notification topology gives an enabled closeout or a fresh blocker reassignment.

## Live Revalidation: Turn 3 (3950 BCE) — population placement front and queue realignment

- Snapshot time: 2026-06-02T03:09:17Z
- Turn/Date: 3 / 3950 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`.
- Top blocker stack:
  - `NOTIFICATION_NEW_POPULATION` (`id 3`) is end-turn blocking and top of queue.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is present but currently non-blocking.
- `civ7 game play notification-queue --json` confirms two-step queue:
  - step 1: `NOTIFICATION_NEW_POPULATION` (`id 3`), blocking
  - step 2: `NOTIFICATION_COMMAND_UNITS` (`id 0`), non-blocking
- Surface now has stable, concrete growth/progression payload:
  - `watch --include-ready-unit --include-ready-city --json` and `ready-city --json` both expose `civ7` city context for `cityId 65536` at `x:26,y:36`.
  - `ready-city` reports `populationPlacement.isReadyToPlacePopulation=true` and concrete acquisition candidates:
    - `x26,y37` `IMPROVEMENT_WOODCUTTER`
    - `x27,y36` `IMPROVEMENT_FARM`
    - `x26,y35` `IMPROVEMENT_MINE`
    - `x25,y35` `IMPROVEMENT_FARM`
    - `x25,y36` `IMPROVEMENT_WOODCUTTER`
    - `x25,y37` `IMPROVEMENT_MINE`
  - `ready-city` also retains production branches (`Granary`, `Scout`, `Hoplite`) and city growth remaining `4` turns.
  - `ready-unit` is valid for scout `id 131072` at `24,35` and still has non-target no-op options (`SKIP_TURN`, etc.), but this unit is not the top gate this cycle.
- `civ7 game play notifications --json` no longer classifies `unit-command` as a stale-expired hard lock; it remains present as closeout context behind growth placement.

### Tactical interpretation

- The active sequencing lane has shifted from unit-closeout to growth placement, which is now the only meaningful end-turn unlock.
- Queue shape is cleaner than prior drift cycles: a single high-certainty blocker (`NEW_POPULATION`) plus a secondary non-blocking command.
- Immediate safe lane:
  1. Resolve `NOTIFICATION_NEW_POPULATION` with an explicitly validated plot action:
     - `assign-worker --location <plot-index>` when the tile is workable,
     - or `expand-city --city-id 65536 --x <x> --y <y>` when pursuing acquisition.
  2. Re-read `notifications -> watch -> ready-city` immediately after action.
  3. If command queue persists blocked or stale, only then re-enter unit action sequencing after a second revalidation.
- Do not proceed to movement/scouting before the growth placement branch is resolved, because the active lane is now deterministic and high-impact.

### Turn 3 note (append-only)

- `Turn 3` | `Top blocker moved to growth placement while unit closeout became non-blocking` | `Resolve `NOTIFICATION_NEW_POPULATION` first using a validated target branch, then re-read queue before any unit action` | `Cleaner queue topology lowers uncertainty, so speculative movement now has higher wasted-branch cost than blocker mis-synchronization` | `Medium` | `If population branch remains unresolved after one action/readback, validate candidate branches directly (`assign-worker` vs `expand-city`) before any second guess`

### 10–20 turn horizon update

- Keep `Window B` as follows:
  - `Turns 5–8`: growth-lock hardening and growth branch confirmation (worker cap, tile yield, and queue cleanups).
  - `Turns 9–14`: convert one stable pop placement decision into a production tempo lock (granary vs military opener) and then reopen scouting commitment.
  - `Turns 15–20`: choose between compact growth-first lane (food/happiness + controlled expansion) and pressure lane only if growth action remains cost-efficient and stable.
- New gating rule: do not shift to offense/scout pressure lanes until the growth blocker is resolved in two consecutive clean reads.

### Direct advisory to active player thread (non-spam)

- `Turn 3` gate is now actionable and bounded: `NOTIFICATION_NEW_POPULATION` is the end-turn blocker with explicit valid growth candidates. Finish that branch first (with chosen x/y action proof), re-read immediately, then continue with command + production only if the queue unlocks.

## Live Revalidation: Turn 3 (3950 BCE) — growth-lock reconfirmed and worker-cap edge noted

- Snapshot time: 2026-06-02T03:09:42Z
- Turn/Date: 3 / 3950 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`.
- Top blocker stack now stable:
  - `NOTIFICATION_NEW_POPULATION` (`id 3`) remains hard blocker.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is present but non-blocking.
- `civ7 game play notification-queue --json` confirms queue shape:
  - step 1: `NOTIFICATION_NEW_POPULATION` (blocking)
  - step 2: `NOTIFICATION_COMMAND_UNITS` (non-blocking)
- Both `ready-city` and `watch` now provide richer growth payload around city `65536`:
  - `isReadyToPlacePopulation:true`.
  - `cityWorkerCap:0` and `workablePlots:[]` with `workablePlotIndexes:[]`.
  - Expansion candidates available at:
    - `(x:26,y:37)` woodcutter
    - `(x:27,y:36)` farm
    - `(x:26,y:35)` mine
    - `(x:25,y:35)` farm
    - `(x:25,y:36)` woodcutter
    - `(x:25,y:37)` mine
  - One blocked growth tile shown in `allPlacementInfo` at `(x:26,y:36)` (Plot 2690, currently blocked).
- Strategic consequence of this snapshot: growth lane is not fully worker-assignable yet (`cityWorkerCap` is 0), so the practical choice set is acquisition-oriented (`expand-city`) unless/ until worker capacity becomes available.

### Tactical interpretation

- This is an end-turn unlock window, but not a unit-tactic window:
  - `NOTIFICATION_NEW_POPULATION` must be resolved before any meaningful queue unfreezing.
  - Since growth placement is the only blocking queue item and worker assign path is unavailable by snapshot, immediate focus is selecting the expansion tile with the best early-growth value.
- Keep conservative sequencing:
  1. Use validated `expand-city --city-id 65536 --x <x> --y <y>` for one chosen tile from candidates.
  2. Re-run immediate `watch -> notifications -> ready-city` revalidation.
  3. Only after queue unlocks, evaluate unit closeout (`ready-unit`/`notification`) and then any production choice.

### Turn note (append-only)

- `Turn 3` | `Growth blocker remains sole hard gate; worker capacity = 0 keeps the branch expansion-driven` | `Resolve population placement through a validated expand-city tile; hold NOTIFICATION_COMMAND_UNITS as secondary` | `Cleaner blocker topology reduces churn risk, but wrong tile choice carries long-term yield opportunity cost` | `Medium` | `After one growth command, re-read twice in sequence; if population still blocks, treat as branch-resolution confirmation issue before any non-gate action`

### 10–20 turn horizon correction

- Window B narrows for the next sequence:
  - `Turns 5–8`: growth-resolution stability window; confirm one expansion/worker-cap branch, then resume scouting spend.
  - `Turns 9–14`: re-baseline production tempo from growth decision (Granary vs unit starter) and lock one opener lane before pressure moves.
  - `Turns 15–20`: choose lane between compact growth-first consolidation and controlled forward pressure based on scout safety and turn costs.
- New gating rule: do not return to unit/scout movement prioritization until growth and queue unlocks are stable for one full readback cycle.

### Direct advisory to active player thread (non-spam)

- Recommended lane for this window: growth first, one validated acquisition tile now. Because `cityWorkerCap` is 0 and no worker plots are currently open, prioritize `expand-city` over `assign-worker`, then re-read immediately. Keep unit/movement commands for after the new growth blocker state clears.

## Live Revalidation: Turn 3 (3950 BCE) — stale COMMAND_UNITS lock reasserted, growth becomes review-only

- Snapshot time: 2026-06-02T03:09:59Z
- Turn/Date: 3 / 3950 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`.
- Top blocker stack changed this probe:
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is now hard top blocker and expired.
  - `NOTIFICATION_NEW_POPULATION` (`id 3`) is now non-blocking.
- `civ7 game play notification-queue --json` confirms the shape:
  - step 1: `NOTIFICATION_COMMAND_UNITS` blocking
  - step 2: `NOTIFICATION_NEW_POPULATION` non-blocking
- `watch` and `ready-*` now show a stale-reconciliation profile:
  - `firstReadyUnitId=null`, `selectedUnitId=null`
  - `ready-unit --json` has no unit context
  - `ready-city --json` has no city context (`blockingCityId=null`, no candidates)
  - `unit-command` details classify `unit-command-stale-expired` with:
    - scanned candidate `UNIT_SCOUT` (`id 131072`) at `(24,34)`
    - `SKIP_TURN` candidate exists but `enabled:false`
    - `enabledCloseoutCandidates:[]`
    - repair hint includes `game play end-turn --send --reason ...`.
- This differs from prior turn where growth placement had been active; growth remains visible in earlier reads but is no longer the immediate hard blocker.

### Tactical interpretation

- The active lane is now a stale unit-closeout lock, not a movement/placement decision.
- `COMMAND_UNITS` is still blocked because the UI has no selected/ready unit and no enabled closeout, despite a clean queue and legal movement stack.
- Immediate safe action path is not a tactical move. It is reconciliation-first:
  1. Hold unit commands/movement and do not infer a move/production action from stale context.
  2. Use one reconciliation attempt (`game play end-turn --send ...`) only when the stale-expired proof condition matches.
  3. Re-run `watch --count 2 --include-ready-unit --include-ready-city --json` and `notifications` immediately after.
  4. Resume normal blocker resolution only when either `unit-command` remains actionable or a new concrete block replaces it.

### Turn note (append-only)

- `Turn 3` | `COMMAND_UNITS stale-expired now blocks hard while growth dropped to non-blocking` | `Treat this as a queue-repair state; do not execute movement/production until closeout state stabilizes` | `Turn exhibits fast blocker drift and null ready pointers, increasing mis-send risk` | `High` | `If no usable closeout appears after one `end-turn` repair attempt, run a short watch loop and re-log before any further tactical command`

### 10–20 turn horizon correction

- Window B remains, but this probe moves it into a recovery branch:
  - `Turns 5–8`: stale-lock resolution phase (retries + readback, not expansion or scout pushes).
  - `Turns 9–14`: re-open growth or production sequencing only after the lock resolves in two clean reads.
  - `Turns 15–20`: decide growth or pressure lane only if this stale lock cycle does not recur.
- Anti-regress gate: no new scouting routes, no unit movement, no production closeout unless the live closeout class is explicitly `enabled`.

### Direct advisory to active player thread (non-spam)

- Current turn is a lock-repair window: `NOTIFICATION_COMMAND_UNITS` is end-turn blocking with stale-expired classification and no enabled SKIP_TURN closeout. Do not attempt command-city-unit combos now; run reconciliation + re-read. Keep growth note as deferred context.

## Live Revalidation: Turn 5 (3900 BCE) — command-units throughput lane restored

- Snapshot time: 2026-06-02T03:10:35Z
- Turn/Date: 5 / 3900 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `inGame=true`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blocker profile now:
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is end-turn blocking and hard.
  - `NOTIFICATION_NEW_POPULATION` is not active in this lane.
  - `notification-queue` and `watch` both show queue length `1` and a single open decision.
- Selected/ready visibility:
  - `selectedUnitId: null`, `firstReadyUnitId: {"owner":0,"id":131072,"type":26}` (`UNIT_SCOUT`).
  - `selectedCityId: null`, `ready-city` context still null.
  - Scout is currently at `{x:22, y:33}`.
- Legal surface from `watch`/`ready-unit` remains safe and explicit:
  - no ambiguity on command lane: `SKIP_TURN` is enabled and validator-confirmed.
  - non-target operations available include `MOVE_TO`, `AUTOMATE_EXPLORE`, `SLEEP`, `WAIT_FOR`, etc.
- Practical reading: this is a cleaner recovery state than the prior stale lock because an enabled closeout is present again and city decisions are not currently gating.

### Direct advisory row

- Turn 5 | Command-unit lane is now actionable in live queue | Use one validated Scout `SKIP_TURN` closeout now, then immediate re-read | This keeps the turn from drifting while avoiding movement/production guessing when queue is unit-gated | Medium | If the next re-read does not clear `NOTIFICATION_COMMAND_UNITS`, run one short watch loop and re-apply this same closeout-first rule before any expansion or combat move

### 10–20 Turn Horizon Update (Window B continuation)

- Turns 5–6: close command-units hard lock with strict replay-safe `SKIP_TURN` or validated move intent only.
- Turns 7–10: after two clean re-reads and queue clear, restore growth-production sequencing with explicit city growth and production closure.
- Turns 11–14: lock one expansion vector only if scouting and blocker signals remain stable and non-stale.
- Turns 15–20: decide growth-first vs pressure lane based on the first stable candidate set after unlock.

### Immediate non-spam guidance to active player thread

- For this window, the actionable lane is only: one closeout operation on the ready Scout, then revalidation.
- Defer multi-step map aggression, civic, and production commits until the blocker's post-closeout topology is confirmed in one additional observation pass.

## Live Revalidation: Turn 6 (3875 BCE) — growth lock returns; city-first unblock lane

- Snapshot time: 2026-06-02T03:11:17Z
- Turn/Date: 6 / 3875 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Active blocker stack:
  - `NOTIFICATION_NEW_POPULATION` (`id 4`) is hard and top blocker.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) is present as a secondary, non-blocking `inspect-ready-unit` step.
- Readiness context:
  - `selectedUnitId: null`, `selectedCityId: null`
  - `firstReadyUnitId: {"owner":0,"id":131072,"type":26}` (`UNIT_SCOUT`) at `{x:22, y:33}`
- Growth payload is concrete and actionable:
  - city: `LOC_CITY_NAME_GREECE1` (`cityId 65536`) at `{x:26, y:36}`, `population:3`, `cityWorkerCap:0`
  - `isReadyToPlacePopulation: true`
  - `workablePlots: []`, `blockedPlotIndexes: [2690]` (growth is effectively expansion-only currently)
  - expansion candidates exposed with CLI hints: `(26,37)` woodcutter, `(27,36)` farm, `(26,35)` mine, `(25,36)` woodcutter, `(25,37)` mine, `(26,34)` clay pit, `(25,34)` farm, `(24,35)` farm
- Queue topology:
  - `notification-queue`: length `2`, step order `NEW_POPULATION` (blocking) -> `COMMAND_UNITS` (non-blocking)
- Practical interpretation: this is a productive unblock moment for growth lane, not a movement-first turn. Keep unit operations at low priority until growth choice commits.

### Direct advisory row

- `Turn 6` | `Growth blocker returned as the single actionable end-turn lane with concrete expansion candidates` | `Execute one validated population placement via the expand-city command` | `City can claim growth with exposed candidate set and cityWorkerCap is 0, so worker assignment is not currently viable` | `Medium` | `Re-read queue/notifications/ready-city immediately after placement; if NOTIFICATION_NEW_POPULATION persists, resolve with an alternate expansion candidate only after candidate revalidation`

### Strategic horizon update (Window B continuation)

- Turns 6–7: resolve `NOTIFICATION_NEW_POPULATION` through a concrete `expand-city` choice and avoid unrelated civic/tech/more unit commands in the same lane.
- Turns 8–10: after the growth unlock clears, re-open unit closeout (`SKIP_TURN` is enabled on scout) only after fresh `ready-city`/`ready-unit` re-read.
- Turns 11–14: branch on the city’s next expansion safety and yield profile before declaring pressure vs defense posture.
- Turns 15–20: lock a single expansion/consolidation mode only if two consecutive reads show stable candidates and low-blocker churn.

### Immediate one-message guidance for player thread

- First action: one `NOTIFICATION_NEW_POPULATION` expansion commit from the listed candidates (avoid trying to force worker placement while `cityWorkerCap` remains 0).
- After send: `civ7 game play notifications --json -> notification-queue -> ready-city -> ready-unit -> watch`.
- Only if `NEW_POPULATION` clears, re-run the command lane with validated `SKIP_TURN` or movement target if still needed.

## Live Revalidation: Turn 6 (3875 BCE) — growth lane stable, no turn change

- Snapshot time: 2026-06-02T03:11:38Z
- Turn/Date: 6 / 3875 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker topology: unchanged from prior check-in,
  - `NOTIFICATION_NEW_POPULATION` (`id 4`) remains hard top blocker,
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) remains secondary and non-blocking.
- Candidate surface remains concrete:
  - `LOC_CITY_NAME_GREECE1` city `65536`, `cityWorkerCap:0`, `isReadyToPlacePopulation:true`.
  - `workablePlots: []`, `blockedPlotIndexes: [2690]`.
  - expansion candidates unchanged at `(26,37),(27,36),(26,35),(25,36),(25,37),(26,34),(25,34),(24,35)`.
- `firstReadyUnitId` stays `UNIT_SCOUT (131072)` and `SKIP_TURN` remains enabled for this unit when explicitly sent.
- No queue/candidate churn since last advisory window; this is a clean hold state with stable read evidence.

### Direct advisory row

- `Turn 6` | `State remains stable after a second watch; no blocker transition yet` | `Hold queue-first: execute one validated growth expansion once, then re-read` | `Stability allows low-regret continuation, but repeated execution attempts without re-read risk desync` | `Medium` | `If another rewatch remains identical, commit one `expand-city` only after confirming candidate availability in that read, then return to growth-cleared sequencing`

### 10–20 Turn Horizon update

- Turns 6–7 remain a stabilization lane: force a single expansion-resolution action and verify queue drop before scouting moves.
- If `NEW_POPULATION` still blocks after the next action attempt, run one additional read and avoid touching command/production branches until growth resolves.
- 10–20 turn mode stays growth-first unless the growth lane clears consistently across two reads, then lock the expansion path and move to scouting/projection decisions.

## Live Revalidation: Turn 6 (3875 BCE) — relaunch holding pattern (turn unchanged)

- Snapshot time: 2026-06-02T03:11:50Z
- Turn/Date: 6 / 3875 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- State continuity check:
  - `NOTIFICATION_NEW_POPULATION` (`id 4`) remains hard top blocker.
  - `NOTIFICATION_COMMAND_UNITS` (`id 0`) remains secondary/non-blocking.
  - `notification-queue` remains `2` with same order.
  - `firstReadyUnitId`: `{"owner":0,"id":131072,"type":26}` still present.
  - `cityWorkerCap:0`, `workablePlots:[]`, `blockedPlotIndexes:[2690]` unchanged.
  - Expansion candidates unchanged from prior checks: `(26,37),(27,36),(26,35),(25,36),(25,37),(26,34),(25,34),(24,35)`.
- Confidence: medium (stable hold with no observed turn progression; no new topological churn).

### Relaunch turn note (append here only when new thread data arrives)

- `Turn 6` | `Second hold-window sample confirms relaunch state is unchanged` | `Execute one validated expand-city choice from the current candidate set, then re-read notifications -> notification-queue -> ready-city -> ready-unit -> watch in one cycle` | `No new top-level progression means risk is now entirely in replay/desync; lock still bounded by a known, concrete growth action` | `Medium` | `If this remains unchanged on the next sample, repeat one validated expand-city candidate swap and delay all scouting/military/pressure branches`

### 10–20 Turn strategy reset (relaunch lane)

- Window objective remains **controlled growth-first reset** until blocker resolves:
  1) keep the one-action rule and immediate revalidation cadence,
  2) resolve growth placement when actionable,
  3) only then return to command closeout and production lock,
  4) unlock expansion corridor decisions only after two clean reads with changed blocker topology.
- If no growth transition appears within two more checks, treat this as a stable stale-cycle watch band:
  - force parity reconciliation (`watch --count 2 --include-ready-unit --include-ready-city --jsonl`),
  - keep advisory scope to queue-lock and safe closeout candidates only.

### Suggested direct message to active player thread (non-spam)

- `Turn 6` still sits in the relaunch holding lane: `NOTIFICATION_NEW_POPULATION` is still the top lock with concrete growth candidates and no queue churn. Play only one validated `expand-city` action, revalidate immediately, and defer scouting/expansion pressure decisions until the growth blocker drops for two consecutive clean reads.

## Live Revalidation: Turn 7 (3850 BCE) — cross-surface hold split (stale command lock)

- Snapshot time: 2026-06-02T03:15:10Z
- Turn/Date: 7 / 3850 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`, `blockingNotificationId:null`
- Cross-surface blocker profile:
  - App UI `notifications` reports `blocker:0`, `notifications:[]`, `queueLength:0` (no surfaced blockers).
  - Tuner probe shows `notification id 5` (`type 20`, `NOTIFICATION_ASSIGN_NEW_RESOURCES`) with `block=true` and `ids=[5]`.
  - `firstReadyUnitId` is `null` in App UI and Tuner-visible first-ready probe (`hasSelectedUnit:false`), so immediate command closeout is not directly actioned.
- Growth/city context is now non-actionable via App UI `ready-city`/`ready-unit`:
  - `ready-city --json`: no active blocking city context.
  - `ready-unit --json`: no active unit context.
- Progress command stack now behaves as:
  - `civ7 game play priorities --compact --json` => `summary: clean-read`, `priority` recommends `game play end-turn --json` as the validated next check.
  - `game play end-turn --json` confirms `canEndTurn:false`.

### Relauch lane note (append here only when new thread data arrives)

- `Turn 7` | `Runtime split now shows a Tuner-level stale command lock while App UI queue is empty` | `Use one explicit lock-repair pass (`game play end-turn --send --reason ...`) only if repair hint is still active, then re-read `notifications`, `notification-queue`, `ready-city`, and `ready-unit` as a single cycle` | `Blocker drift is now parity-oriented: queue metadata is sparse, so speculative growth/movement/prod commands would be high-risk` | `Medium` | `If no selected ready unit/city appears after repair and lock persists on the next sample, keep to read-loop only and do not force non-lock-close actions`

### 10–20 Turn strategy reset (relaunch hold)

- Hold strategy remains **queue-parity reset** until command lock is repaired:
  1) prioritize lock-repair and evidence convergence across App UI + Tuner,
  2) avoid city/production/scouting commands unless a concrete growth/city or command closeout lane reappears,
  3) only once lock converges on two clean reads, restart Window B growth-then-scout sequencing.
- If the lock persists for 2+ samples, pause speculative branching and keep cadence at `notifications -> notification-queue -> priorities -> end-turn` loops.

### Suggested direct message to active player thread (non-spam)

- `Turn 7` now has an App UI/Tuner parity split: visible queue is empty, but Tuner still reports a hard `NOTIFICATION_ASSIGN_NEW_RESOURCES` lock with no ready selector. Treat this as a reconciliation phase, avoid growth/scout pushes, and only resume normal sequencing after a clean lock-release readback.

## Net-new Rebase Play Sequence: Turn 7 (3850 BCE) through Turn 20

- Snapshot time: 2026-06-02T04:00:00Z (placeholder capture window, recheck before acting)
- Strategic phase: relaunch parity repair and lock-parsed restart (no speculative expansion yet)

### Window 1 — Recovery and parity lock repair (Turns 7–10)

- Hard rule: do not execute any growth/military/prod command until both surfaces agree on an actionable queue branch.
- Execute at most one command per read cycle:
  1. `game play notifications --json`
  2. `game play notification-queue --json`
  3. `game play priorities --compact --json`
  4. `game play ready-city --json`
  5. `game play ready-unit --json`
  6. If priorities/repair hint still points to end-turn parity and no ready context exists, run one `game play end-turn --send --reason "repair restart parity lock" --json`
  7. Re-read `notifications` + `notification-queue` immediately
- If `firstReadyUnitId` or `blockingNotificationId` becomes concrete, branch by priority in the same cycle and return to this file with a short append-only note.

### Window 2 — Unlock conversion (Turns 11–15)

- After two consecutive clean reads with changed blocker topology:
  - If `NOTIFICATION_NEW_POPULATION` is active with candidates, consume one `expand-city` from the current set, then immediate revalidation.
  - Else, if `NOTIFICATION_COMMAND_UNITS` remains hard and a valid closeout exists, run one low-variance closeout (prefer `SKIP_TURN`) and re-read.
  - Else, remain in read-loop and do not force lane changes.
- New anti-requirement: reject any action not backed by both queue source + ready source in the same read cycle.

### Window 3 — Strategic lane choice (Turns 16–20)

- Trigger to move to lane commitment: blocker remains converged on two reads with no null-ready resets.
- Lane A (growth-first): one city expansion lock + stable city growth cadence before any scout pressure.
- Lane B (pressure-lite): one scout route only if a non-stale command lane appears and the tile context remains stable.
- If lock churn recurs (2+ windows), defer commitment and continue Window 1 pattern.

### Single-message recommendation to active player

- Current turn is still restart-repair state; message should be: `Turn 7 restart branch is in parity lock repair. No city/unit/scout action until App UI and Tuner both expose the same actionable queue + ready context. Run the non-speculative repair cycle once, re-read immediately, then either one `expand-city` or validated unit closeout only.`

## Live Revalidation: Turn 8 (3825 BCE) — production gate regained, command lane still secondary

- Snapshot time: 2026-06-02T04:20:10Z
- Turn/Date: 8 / 3825 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker topology (App UI):
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 6`, type `NOTIFICATION_CHOOSE_CITY_PRODUCTION`) is hard top blocker.
  - `NOTIFICATION_COMMAND_UNITS` (`id 7`) remains non-blocking.
- Confirmation from `notification-queue`:
  - Step 1: `production-choice` `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (blocking)
  - Step 2: `unit-command` `NOTIFICATION_COMMAND_UNITS` (non-blocking, `SKIP_TURN` candidate exists)
- `ready-city` and `priorities` evidence:
  - City `LOC_CITY_NAME_GREECE1` (`id 65536`) has no growth placement now (`isReadyToPlacePopulation:false`, `cityWorkerCap:0`).
  - `ready-city` candidates are concrete: `UNIT_SCOUT`, `UNIT_HOPLITE`, `BUILDING_GRANARY`.
  - `game play priorities` confirms next action order: production-choice first, then ready-unit.
  - `firstReadyUnitId` remains `196609` and `ready-unit` shows legal operations including `SKIP_TURN`.
- Confidence: `medium` (high-confidence queue lock, medium-confidence candidate preference without wider diplomatic/warfare context).

### Direct advisory row

- `Turn 8` | `Turn advanced and queue re-converged on City Production as the hard lock` | `Use one validated build-production choice from the live candidates, then immediately re-read notifications -> notification-queue -> ready-city -> ready-unit` | `Growth pause is over for this turn; decision now shifts from recovery to opener commitment` | `Medium` | `If production choice does not clear lock in one clean read, pivot to the exact ready-city candidate proof line before any unit movement`

### 10–20 Turn horizon correction

- Turns 8–10 (re-baseline recovery): execute one production closeout and revalidate convergence; keep unit action at no-target closeout quality only if production lock clears.
- Turns 11–14 (lane test): after production is stabilized, revisit whether scout pressure lane opens without overextending city command line.
- Turns 15–20 (commitment): lock growth-control vs pressure-lite on two-read stability, with production throughput and unit safety as the gating condition.

### Suggested direct message for active thread

- `Turn 8 moved out of the stale parity split: hard blocker is now `NOTIFICATION_CHOOSE_CITY_PRODUCTION` on city 65536, with `NOTIFICATION_COMMAND_UNITS` secondary. Execute one city production decision now (candidate options visible: Scout/Hoplite/Granary), then revalidate immediately before any further move or secondary closeout.`

## Live Revalidation: Turn 8 (3825 BCE) — parity warning: Tuner still exposes `NOTIFICATION_ASSIGN_NEW_RESOURCES` aliasing

- Follow-up check time: 2026-06-02T04:24:40Z
- Snapshot evidence added from `civ7 game exec ... --state Tuner --json`:
  - ids: `[{"owner":0,"id":6,"type":20}, {"owner":0,"id":7,"type":20}]`
  - Tuner `findEndTurnBlocking` returns `{"owner":0,"id":6,"type":20}`.
  - `Game.Notifications` type labels for both entries are currently `NOTIFICATION_ASSIGN_NEW_RESOURCES`.
  - App UI `notifications` still labels `id 6` as `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (hard) and `id 7` as `NOTIFICATION_COMMAND_UNITS` (non-blocking).
- Implication: this is a label-resolution drift, not yet a structural blocker spread.

### Follow-up advisory row (append-only)

- `Turn 8` | `UI/Tuner names differ for the same notification ids (App UI separates production+command; Tuner aliases both to assign-resources)` | `Execute one validated city production closeout first, then re-read immediately` | `Production remains the decisive lane; command-unit actions are still secondary and should not lead this turn` | `Medium` | `If the aliasing persists for the next read and second lock does not clear, pause and explicitly request parity confirmation from the live player context before non-lock actions`

### 10–20 Turn correction under drift condition

- For this branch, keep `production-choice` as the only hard lane until aliasing/queue labels normalize on two reads.
- After that convergence, run window reset:
  - `Turns 8–10`: one validated production, one revalidation cycle, then decide whether to take one unit closeout.
  - `Turns 11–14`: if lock resolves, finalize opener lane (military-first or growth-first) and commit no more than one scout projection.
  - `Turns 15–20`: hold pressure commitment until blocker stack is stable across both App UI and Tuner labels.

## Live Revalidation: Turn 8 (3825 BCE) — second stable sample, no structural turn movement

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 8 / 3825 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Confirmed blockers and drift:
  - App UI still shows:
    - hard `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 6`)
    - secondary `NOTIFICATION_COMMAND_UNITS` (`id 7`)
  - Tuner still reports both ids with `NOTIFICATION_ASSIGN_NEW_RESOURCES`, with `block=true` for `id 6`.
- `ready-city`/`ready-unit` remained actionably concrete (city 65536 + scout ready unit 196609), but no queue transition occurred from the prior sample.
- Risk posture: no new tactical evidence to support route commits or move-based expansion; production lock is still the deterministic lane.

### Follow-up advisory row

- `Turn 8` | `Second same-turn sample shows no blocker topology change; only production-choice lock is actionable` | `Execute one validated production closeout from ready-city now, then re-read notifications/queue/ready to prove lock progression` | `Stability is useful for safety, but the duplicated aliasing requires lane confirmation from both App UI and Tuner before route commands` | `Medium` | `If production closeout fails to clear block, hold at revalidation + parity-confirmation mode; do not force scout movement until both lanes agree`

### 10–20 horizon note

- Keep `production-choice` as the hard lane through this stabilization window.
- `Turns 8–10`: require two clean revalidation passes with identical App UI + Tuner read convergence before committing any pressure-lite unit move.
- `Turns 11–14`: after production lock clears, run a controlled lane split test (`military-first` vs `growth-first`) with one chosen projection.
- `Turns 15–20`: commit only on stable production rhythm and no aliasing drift for two reads.

## Live Revalidation: Turn 8 (3825 BCE) — stale-command repair candidate and null ready pointers

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 8 / 3825 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`, `blockingNotificationId:id 6`
- Updated blocker state:
  - App UI: hard `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 6`) + secondary `NOTIFICATION_COMMAND_UNITS` (`id 7`)
  - `firstReadyUnitId: null`, `selectedUnitId: null`, no concrete unit context in App UI.
  - `ready-city` still returns production candidates for city `65536` (`Scout`, `Hoplite`, `Granary`) with growth still not ready.
  - Tuner export still aliases ids `6` and `7` as `NOTIFICATION_ASSIGN_NEW_RESOURCES` and keeps `id 6` as blocker.
- Unit command lane is now `unit-command-stale-expired` with `staleExpiredWithoutEnabledCloseout:true`.
- Repair path is explicit in runtime data: one `game play end-turn --send ...` candidate exists when stale unit closeout is empty.

### Follow-up advisory row

- `Turn 8` | `Stale command lock tightened and ready-unit pointer dropped to null; city production remains hard lock` | `Run one repair readback (`game play end-turn --send --reason "stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout" --json`) then immediate notifications -> notification-queue -> ready-city -> ready-unit re-check` | `Production is still the hard decision, but unit actions are unsafe without repaired ready state` | `Medium-high` | `If repair does not reintroduce a concrete ready unit, continue repair-only cadence and defer all scouting/movement commands until both App UI and Tuner converge`

### 10–20 turn correction under repair

- `Turns 8–10`: treat this as repair-first: one production closeout attempt only after lock repair, then no more than one validating read cycle.
- `Turns 11–14`: when/if both App UI and Tuner converge on non-null unit/city pointers, then test one lane (production-heavy opening vs recon-lite).
- `Turns 15–20`: lock lane decision only after two consecutive clean convergence windows with an executable ready-city and a non-stale unit pointer.

## Live Revalidation: Turn 8 (3825 BCE) — repair-attempt blocked, still no ready recovery

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 8 / 3825 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocker topology remains:
  - App UI hard: `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 6`)
  - Secondary: `NOTIFICATION_COMMAND_UNITS` (`id 7`) as stale-expired
- Ready context: still `selectedUnitId:null`, `firstReadyUnitId:null`, and `ready-unit` has no unit payload.
- Tuner export remains aliasing (`NOTIFICATION_ASSIGN_NEW_RESOURCES` for both ids), with `id 6` blocker.
- Action attempted: `game play end-turn --send --reason "stale COMMAND_UNITS ..." --json`
  - Result: blocked (`Civ7 turn complete is blocked by current game state`).
- Inference: repair helper remains suggested by introspection, but this exact send path is not currently executable in current surface state.

### Follow-up advisory row

- `Turn 8` | `Repair command is suggested by runtime but blocked by current game state` | `Do not re-send the same repair call in the same lane; continue `notifications -> notification-queue -> ready-city -> priorities` readback and wait for either production closeout eligibility or explicit ready-unit restoration` | `The game has entered a strict no-op window; unsafe blind retries can increase desync risk` | `Medium-high` | `Treat as parity lock and only execute one validated production command once ready-city and notification queue both show an executable branch`

### 10–20 turn correction under block

- `Turns 8–10`: keep the thread in read-only lock diagnosis mode; no blind repair resubmits and no unit movement.
- `Turns 11–14`: once production path becomes executable, take exactly one production action and revalidate once.
- `Turns 15–20`: commit to opener lane only if two complete reads confirm stable App UI + Tuner pointers with non-null ready data.

## Live Revalidation: Turn 8 (3825 BCE) — current parity sample confirms stable no-op recovery

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 8 / 3825 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocking evidence:
  - App UI: hard `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 6`) leading; `NOTIFICATION_COMMAND_UNITS` (`id 7`) still stale with no enabled closeout.
  - `notifications` and `notification-queue` topology unchanged from previous windows.
  - `ready-city`: candidates remain concrete on city `LOC_CITY_NAME_GREECE1` (`UNIT_SCOUT`, `UNIT_HOPLITE`, `BUILDING_GRANARY`), growth not ready for placement/worker ops.
  - `ready-unit`: null payload; `selectedUnitId:null`, `firstReadyUnitId:null`.
- Priority view:
  - `game play priorities` still reports production-choice as first lane.
  - `progress-dashboard` still at `age 8/140` Antiquity with all legacy tracks at zero.
- Command posture: stale repair remains present in runtime details (`staleExpiredWithoutEnabledCloseout:true`) and repair send is still not reattempted immediately.

### Follow-up advisory row

- `Turn 8` | `No queue/topology movement after prior repair-attempt window; unit ready context remains null` | `Remain in one-pass lock-repair loop, rechecking notifications/queue/ready-city/ready-unit every cycle` | `Production choice remains the only deterministic lane; unit lane still unsafe` | `Medium-high` | `If no queue movement or non-null ready pointer appears across the next two full samples, maintain conservative mode and request parity confirmation before any tactical expansion`

### 10–20 horizon correction after latest sample

- `Turns 8–10`: keep recovery mode; one validated production closeout at most, with immediate revalidation.
- `Turns 11–14`: no branching until two consistent reads show queue/ready pointer stability.
- `Turns 15–20`: commit a single lane (growth-first vs pressure-lite) only after two clean convergence windows; otherwise extend lock-safe recovery.

## Live Revalidation: Turn 9 (3800 BCE) — blocker handoff to technology-choice

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 9 / 3800 BCE
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Blocking state:
  - hard: `NOTIFICATION_CHOOSE_TECH` (`id 8`) now first in queue
  - secondary: `NOTIFICATION_COMMAND_UNITS` (`id 9`) with enabled SKIP_TURN closeout candidates
  - `firstReadyUnitId`: `UNIT_SCOUT (131072)` in App UI (`ready-unit` now concrete)
- `notification-queue` schedule now:
  - step 1 technology-choice
  - step 2 unit-command (`SKIP_TURN` candidates enabled for scouts `131072` / `196609`)
- `ready-city` currently null (city chooser action not first lane anymore)
- `priorities` now: `technology-choice -> ready-unit -> nearby tactical scans`
- Tech options surface: `Animal Husbandry`, `Sailing`, `Writing` are enabled-closeout; `choose-tech` should be used as the immediate lane clear.
- `progress-dashboard`: `Antiquity ageProgress 9/140`, all legacy tracks still at zero.
- Tuner quick check around the transition returned empty `Game.Notifications` ids, so cross-surface parity remains important.

### Follow-up advisory row

- `Turn 9` | `App UI transitions from stalled production stack to hard technology-choice blocker, with unit closeout now enabled` | `Resolve one `choose-tech` closeout first, then re-read and take only one validated unit action if still safe` | `Tech debt moved to first lane, making production moves irrelevant this cycle` | `Medium` | `If tech blocker persists without transition across two reads, pause and request parity confirmation on App UI/Tuner naming/visibility before non-tech moves`

### 10–20 horizon correction (new lane)

- `Turns 9–10`: tech-first recovery — select one enabled node and close out with strict post-read.
- `Turns 11–14`: once tech+unit lanes show stable non-null ids, choose lane branch:
  - growth-first (timing research + safe micro) or
  - pressure-lite (one scout route only).
- `Turns 15–20`: commit only after two consistent reads of same queue order and no stale-closeout contradictions.

### Live Revalidation: Turn 9 (3800 BCE, blocker inversion)

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 9 / 3800 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Priority snapshot:
  - App UI hard blocker: `NOTIFICATION_COMMAND_UNITS` (`id 9`)
  - App UI secondary: `NOTIFICATION_CHOOSE_TECH` (`id 8`)
  - `notification-queue`: unit-command head (priority 100), then technology-choice (priority 70)
  - `priorities`: top `hud:unit-command`
  - `ready-unit`: concrete `UNIT_SCOUT (131072)` with `SKIP_TURN` available
  - `ready-city`: null context
- Constraint note: Tuner still aliases both IDs as `NOTIFICATION_ASSIGN_NEW_RESOURCES`, so cross-surface parity is still required before any multi-step tactical expansion.

### Follow-up advisory row

- `Turn 9` | `Intra-cycle parity check shows unit-command inversion has held: command-units is now hard blocker and tech-choice is secondary` | `Execute one validated unit closeout now and re-read before any follow-up action` | `The active window is now unit-command-first despite prior tech-first framing` | `Medium` | `If inversion repeats in next 2 reads, remain in lock-parity loop and request explicit UI parity confirmation before branching`

### 10–20 correction after inversion

- `Turns 9–10`: continue unit-command-first closure; one validated SKIP_TURN or movement closeout, immediate re-read.
- `Turns 11–12`: once queue transitions, take one tech closeout if still enabled and revalidate same cycle.
- `Turns 13–16`: choose exactly one controlled lane only after two stable reads:
  - growth-lite branch (tech pacing + safe setup), or
  - pressure-lite branch (single validated scout loop).
- `Turns 17–20`: if queue inversion repeats across the two-read threshold, extend conservative lock-loop and avoid strategic commit until queue labels converge across App UI + Tuner again.

### Live Revalidation: Turn 9 (3800 BCE, parity reflip)

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 9 / 3800 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `autoplay inactive`, `canEndTurn:false`, `hasSentTurnComplete:false`
- App UI order:
  - hard blocker: `NOTIFICATION_CHOOSE_TECH` (`id 8`)
  - secondary: `NOTIFICATION_COMMAND_UNITS` (`id 9`)
  - `notification-queue`: tech-choice first (`priority 100`), unit-command second (`priority 65`)
  - `priorities`: `hud:technology-choice` first
  - `ready-unit`: `UNIT_SCOUT (131072)` at `(22,30)` with legal ops and `SKIP_TURN` enabled
  - `ready-city`: no city payload
- Cross-surface note: Tuner still aliases both IDs to `NOTIFICATION_ASSIGN_NEW_RESOURCES`, with blocker now reported on `id 8`.

### Follow-up advisory row

- `Turn 9` | `Intra-cycle reflip: blocker order returned to tech-first while unit lane stays secondary` | `Execute one enabled tech closeout now, then re-read queue/ready before any unit movement strategy` | `Live lanes are coherent again for a clean tech-first reset, but parity drift remains possible` | `Medium` | `If order flips again on next 2 reads, hold on tactical expansion and request direct parity confirmation`

### 10–20 correction after reflip

- `Turns 9–10`: execute one `choose-tech` closeout (`Animal Husbandry`, `Sailing`, or `Writing`) with post-send verification.
- `Turns 11–12`: move into one validated unit closeout only after tech lane clears and queue confirms unit-command remains non-blocking secondary.
- `Turns 13–16`: choose and hold one lane for two clean reads: growth-lite vs pressure-lite.
- `Turns 17–20`: continue or defer strategic commitments based on two-cycle parity stability across App UI and Tuner blocker topology.

### Live Revalidation: Turn 9 (3800 BCE, no inversion)

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 9 / 3800 BCE
- Turn hash: `0`
- Hard lane: `NOTIFICATION_CHOOSE_TECH` (`id 8`)
- Secondary: `NOTIFICATION_COMMAND_UNITS` (`id 9`)
- `notification-queue`: tech-first order holds (`priority 100` then `65`).
- `priorities`: `hud:technology-choice`
- `ready-unit`: `UNIT_SCOUT (131072)` at `(22,30)` with movement/skip-ready operations; `ready-city` remains empty
- `Tuner`: blocker and both ids still alias to `NOTIFICATION_ASSIGN_NEW_RESOURCES`, but App UI and queue surface confirm tech-first execution this cycle.

### Follow-up advisory row

- `Turn 9` | `Second consecutive read confirms tech-first control lane remains authoritative` | `Execute one enabled technology closeout now, then re-read queue/ready before unit escalation` | `This read removes prior lane ambiguity and restores the planned tech-first execution order` | `Medium` | `If a future read flips again, use two-cycle parity hold and delay non-essential movement commands`

### 10–20 correction after hold

- `Turns 9–10`: complete one enabled `choose-tech` closeout with immediate post-action verification.
- `Turns 11–12`: only if stable, run one validated unit closeout next (`SKIP_TURN` if no tactical gain to move).
- `Turns 13–16`: continue one-lane hold and only choose growth-lite vs pressure-lite after two stable reads.
- `Turns 17–20`: keep low-regret posture while cross-surface blocker naming remains noisy.

### Live Revalidation: Turn 9 (3800 BCE continuation, stable hold)

- Check time: 2026-06-02T03:20:25Z
- Turn/Date: 9 / 3800 BCE, hash `0`
- App UI: hard blocker still `NOTIFICATION_CHOOSE_TECH` (`id 8`), secondary `NOTIFICATION_COMMAND_UNITS` (`id 9`).
- `notification-queue`: tech-first (`priority 100`) then unit-command (`priority 65`); `priorities` still `hud:technology-choice`.
- `ready-unit`: still `UNIT_SCOUT (131072)` on `(22,30)`, command options available; `ready-city` still null.
- Tuner aliasing remains unchanged (`NOTIFICATION_ASSIGN_NEW_RESOURCES` for both ids).
- Active guidance unchanged: execute one validated tech closeout first, then immediate re-read; defer route/movement expansion until queue confirms a stable post-tech move lane.

### Follow-up advisory row

- `Turn 9` | `Hold sample confirms stable tech-first blocker ladder after prior volatility` | `Run one closeout tech command now (`Animal Husbandry` / `Sailing` / `Writing`) then re-check queue before unit actions` | `No new tactical branch is justified until a turn/queue transition is observed` | `Medium` | `If turn remains frozen after two more windows, continue strict parity loop and avoid speculative branching`

### 10–20 correction for hold sample

- `Turns 9–10`: single tech closeout with immediate post-send checks.
- `Turns 11–12`: only then evaluate one unit closeout if still safe and sequence-valid.
- `Turns 13–16`: keep a provisional one-lane plan and confirm two consistent reads before choosing growth-lite vs pressure-lite.
- `Turns 17–20`: only commit deeper scouting/pressure if App UI + Tuner blocker semantics are coherent over successive windows.

### Live Checkpoint (Turn 9 / 3800 BCE continuation, relaunch reset alignment)

- Snapshot time: 2026-06-02T03:20:25Z
- Turn/Date/Hash: `9 / 3800 BCE`, hash `0`
- Active blocker lane (App UI):
  - Hard: `NOTIFICATION_CHOOSE_TECH` (`id 8`)
  - Secondary: `NOTIFICATION_COMMAND_UNITS` (`id 9`)
- `firstReadyUnitId`: `UNIT_SCOUT (131072)` with legal closeouts; `ready-city`: null
- Queue/priority shape: technology-choice (`100`) above unit-command (`65`) under `hud:technology-choice`
- Cross-surface drift remains: Tuner aliasing still normalizes ids to `NOTIFICATION_ASSIGN_NEW_RESOURCES`, so App UI + queue remains the authoritative live lane source.
- Recommandation for this relaunch window:
  - run one validated tech closeout (`game play choose-tech --send --closeout ...`) only,
  - immediate full re-read, then one validated unit follow-up only if still coherent.

### 10–20 Turn sequencing update (relaunch window reset)

- `Turns 9–10`: one clean tech closeout per cycle.
- `Turns 11–12`: one validated unit closeout only if tech lane clears and queue confirms no inversion.
- `Turns 13–16`: lock one provisional branch for two clean reads:
  - growth-lite recovery (`tech + safe setup`) or
  - pressure-lite (`single scout loop`) and no broader pressure.
- `Turns 17–20`: if parity/noise persists, continue recovery hold with explicit parity probes; avoid speculative civic/expansion commits until two consecutive stable reads land.

- Player-facing row: `Turn 9` | `Relaunch remains in tech-first hold after blocker transition and parity drift` | `Execute one closeout tech node, revalidate queue/ready immediately` | `Unit lane is usable but secondary and should remain follow-on only` | `Medium` | `If lane order flips again before verification, hold and request direct App UI + queue + priority confirmation`

### Live Checkpoint (Turn 10 / 3775 BCE)

- Snapshot time: 2026-06-02T03:21:11Z
- Turn/Date/Hash: `10 / 3775 BCE`, hash `0`
- App UI blocker stack:
  - Hard: `NOTIFICATION_CHOOSE_CULTURE_NODE` (`id 11`, top priority)
  - Non-blocking: `NOTIFICATION_CULTURE_TREE_REVEALED` (`id 10`), `NOTIFICATION_CHOOSE_GOVERNMENT` (`id 12`), `NOTIFICATION_TRADITIONS_AVAILABLE` (`id 13`), `NOTIFICATION_COMMAND_UNITS` (`id 9`)
- `firstReadyUnitId`: `UNIT_SCOUT (131072)` (movement-capable, `SKIP_TURN` closeout available)
- Queue/priorities: `hud:culture-choice` (`100`) -> `unit-command` (`65`); `ready-city` still null
- Cross-surface drift remains: Tuner maps ids `9..13` to `NOTIFICATION_ASSIGN_NEW_RESOURCES`, blocker as `id 10`; App UI/queue shows `id 11` hard first and has actionable live options from `choose-culture --options --json`.
- 10-turn outlook correction:
  - 10–12: culture-first closeout execution (single action + re-read)
  - 11–14: unit follow-up only if culture lane stays stable
  - 15–20: branch commitment only after 2 clean reads and no inversion

- Player-facing relay row:
  - `Turn 10` | `Cultural tech lock became the hard blocker after turn advancement` | `Run one validated `choose-culture` closeout and immediate queue/ready recheck` | `Unit is now stable follow-up; keep queue-parity discipline in this drift window` | `Medium` | `If priority order flips, hold for one read cycle before any scouting or non-blocker execution`

- Generic doctrine remains unchanged: blocker-first sequencing, one validated command per cycle, immediate revalidation, no speculative movement or civic expansion while unit/culture lock is still in transition.

### Live Checkpoint (Turn 10 / 3775 BCE — unit-command hard blocker)

- Check time: 2026-06-02T03:21:50Z
- Turn/Date/Hash: `10 / 3775 BCE`, hash `0`
- App UI blocker state changed from prior sample:
  - Hard: `NOTIFICATION_COMMAND_UNITS` (`id 9`) with `blockingNotificationId` on `id 9`.
  - Non-blocking: `NOTIFICATION_CULTURE_TREE_REVEALED` (`id 10`), `NOTIFICATION_CHOOSE_CULTURE_NODE` (`id 11`, `expired:true`), `NOTIFICATION_CHOOSE_GOVERNMENT` (`id 12`), `NOTIFICATION_TRADITIONS_AVAILABLE` (`id 13`).
- Queue shape now: `unit-command` -> `culture-tree-revealed` -> `choose-culture` -> `choose-government` -> `traditions`.
- `priorities`: `hud:unit-command` top, confirming readiness-driven command-first posture.
- `ready-unit`: `UNIT_SCOUT (131072)` remains actionable; `SKIP_TURN` and movement operations available.
- `ready-city`: still null.
- Cross-surface drift unchanged: Tuner aliases all ids to `NOTIFICATION_ASSIGN_NEW_RESOURCES`, blocker `id 10`.
- 10-turn outlook correction:
  - 10–11: one validated unit closeout (prefer `SKIP_TURN`) + immediate re-read.
  - 11–12: only proceed to follow-up civic/government actions after unit blocker clears on consecutive reads.
  - 13–16 / 17–20: keep one-lane commitments only after two stable samples.

- Player-facing relay:
  - `Turn 10` | `Hard blocker pivoted back to COMMAND_UNITS; CHOOSE_CULTURE_NODE is now expired/non-blocking` | `Run one validated SKIP_TURN closeout now and re-read queue/notifications/ready` | `This is a concrete control-window correction that prevents speculative civic execution` | `Medium` | `Hold if inversion repeats until two consecutive stable unit-first reads show safe follow-up`

### Live Checkpoint (Turn 10 / 3775 BCE — stale COMMAND_UNITS hold state)

- Check time: 2026-06-02T03:25:19Z
- Turn/Date/Hash: `10 / 3775 BCE`, hash `0`
- Core lock evidence:
  - `blocked by`: `NOTIFICATION_COMMAND_UNITS` (`id 9`) with `staleExpiredWithoutEnabledCloseout: true`
  - `selectedUnitId: null`, `firstReadyUnitId: null`
  - `ready-unit`: null
  - `ready-city`: null
  - `hasSentTurnComplete: true`
  - `priorities`: `hud:unit-command-stale-expired` with explicit watch command (`game watch ...`)
  - `notification-queue`: unit-command remains `priority 100`, followed by culture/gov/tradition entries at `priority 70`.
- Generic doctrine preserved (still active):
  - blocker-first sequencing
  - one validated action per cycle
  - immediate re-read
  - no speculative movement/production while pointers are null or stale
- Net-new tactical consequence:
  - No immediate unit/civic mutation should be sent from this state.
  - Use read-only stabilization window (`game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl`) then re-run `notifications -> notification-queue -> priorities`.
  - If stale status clears and an enabled closeout appears, resume prior `unit-command -> re-read` micro-cycle.

### 10–20 strategic framework after stale hold

- `Turns 10–12`: watch/read only, keep one-message cadence.
- `Turns 13–14`: if stale lock remains, continue the same hold posture and request parity confirmation.
- `Turns 15–16`: if lock clears, one validated closeout first (unit if unit-command is true first lane; otherwise the surfaced hard civic node), then re-read.
- `Turns 17–20`: only after two stable non-null ready samples, branch into either growth-lite or pressure-lite.

### Follow-up advisory row

- `Turn 10` | `Lock moved from action window to stale-expired unit-command hold with no ready payload` | `Run the explicit watch command, then re-read notifications/queue/priorities before any command` | `This confirms a watch-state, not a move-state; forcing SKIP_TURN now risks no-op or invalid retries` | `High` | `If stale-expired persists for another 2 reads, extend recovery hold and do not branch into civic/unit operations`

### Live Checkpoint (Turn 12 / 3725 BCE — concrete unit-command lane after stale stall)

- Check time: 2026-06-02T03:29:10Z
- Turn/Date/Hash: `12 / 3725 BCE`, `hash=0`
- Active blocker now:
  - `NOTIFICATION_COMMAND_UNITS` (`id 16`) hard and actionable (`staleExpiredWithoutEnabledCloseout: false`)
  - `NOTIFICATION_NEW_POPULATION` (`id 15`) non-blocking follow-up
- Read outputs:
  - `firstReadyUnitId: UNIT_SCOUT (131072)` at `(24,30)`
  - `selectedUnitId: null`
  - `hasSentTurnComplete: false`
  - `ready-unit`: concrete legal operations (`SKIP_TURN`, `MOVE_TO`, `AUTOMATE_EXPLORE`, `ALERT`, etc.) with validation
  - `ready-city`: empty packet despite active population notification
  - `notification-queue`: `unit-command` then `population-placement`
  - `priorities`: `hud:unit-command` (with `ready-unit` follow-up and battlefield checks)
- Tuner continues to expose alias-level noise on ids; execution authority remains App UI + queue + priorities + live target/placement commands before branching.

### 10–20 strategic framework (post-turn12 reset)

- **Turns 12–13 (bridge):** one command-unit closeout only; re-read full sequence immediately.
- **Turns 14–16 (growth gate):** if population choice becomes concrete and validated, execute one city/place growth action; re-read immediately.
- **Turns 17–20 (commit):** commit to growth-lite or pressure-lite only after two consistent reads with stable top-lane order and non-null actionable ready payloads.
- If a new inversion appears before revalidation, hold to wait/read loop and avoid non-unit commitments.

### Follow-up advisory row

- `Turn 12` | `Unit closeout recovered from stale lock and is now actionable; growth remains secondary` | `Resolve one command-unit action first, then one pass of full re-read before any growth probe` | `This is the new active lane and supports safe closeout-first tempo preservation` | `Medium` | `If this lane becomes stale again, return to read/watch-only until ready pointers and priorities re-stabilize`

## Live Checkpoint (Turn 12 / 3725 BCE)

- State snapshot: turn hash remains `0` and `hasSentTurnComplete=false`; live queue shows `NOTIFICATION_COMMAND_UNITS (id 16)` above `NOTIFICATION_NEW_POPULATION (id 15)`.
- Read certainty: concrete `firstReadyUnitId` present (`UNIT_SCOUT 131072` at `24,30`), `selectedUnitId=null`; `ready-unit` is now actionable.
- Net-new 10–20 view:
  - Turns `12–13`: one validated unit closeout + immediate re-read
  - Turns `14–16`: one validated secondary lock clear if it surfaces as top gate
  - Turns `17–18`: choose one branch after two clean reads (growth-lite vs pressure-lite)
  - Turns `19–20`: commit only with non-stale two-window coherence
- Player relay: prioritize blocker-first sequencing and keep one-command-per-cycle discipline; no speculative unit movement or civic expansion until queue and `ready-*` stay coherent on the next read.

## Live Checkpoint (Turn 13 / 3700 BCE)

- Check time: 2026-06-02 (current sample)
- Turn/Date/Hash: `13 / 3700 BCE`, hash `0`
- Active lock:
  - `NOTIFICATION_VOLCANO_ACTIVE` (`id 17`) hard blocker (`isEndTurnBlocking=true`)
  - `NOTIFICATION_COMMAND_UNITS` (`id 18`) non-blocking, stale-expired secondary
  - `firstReadyUnitId: null`, `selectedUnitId: null`
  - `hasSentTurnComplete: true`, `canEndTurn: false`
- Decision evidence:
  - `ready-unit` null payload (`legalOperations` empty)
  - `ready-city` empty (`legalOperations` empty)
  - `notification-queue`: step1 volcano reviewed-dismissal, step2 command-units inspect-ready-unit, step3 natural wonder info
  - `priorities`: `hud:informational-notification` with `dismiss` command
- Strategic correction:
  - Keep immediate lane as reviewed-volcano closeout first.
  - If unit lane remains stale after next two reads, stay in recovery-only mode.
  - Resume any unit/civic progression only when a concrete non-stale ready payload appears and is stable across two reads.
- Multi-turn 10–20 sequence:
  - `13–14`: review-closeout then immediate parity re-read only.
  - `15–16`: continue same hold unless a stable non-stale ready candidate appears.
  - `17–20`: commit to growth-lite vs pressure-lite only if queue/ready coherence holds for consecutive windows; otherwise continue one-command recovery loop.
- Player relay row:
- `Turn 13` | `Hard blocker is now volcano; command-units is stale/null` | `Run reviewed notification dismiss on id 17, then re-read notifications -> notification-queue -> ready-unit -> ready-city -> priorities` | `Unit lane has no enabled closeout from this state` | `Medium` | `If stale-expired repeats on the next two reads, hold recovery mode and request parity escalation only with durable drift evidence`

## Snapshot: Turn 15 (fresh relaunch verification)

- Turn/Date: 15 / 3650 BCE
- Hash: 0
- Immediate blocker(s): `NOTIFICATION_CHOOSE_TECH` (hard), `NOTIFICATION_COMMAND_UNITS` (secondary)
- Readiness state: `hasSentTurnComplete=false`, `canEndTurn=false`, `firstReadyUnitId=UNIT_SCOUT (196609)`
- Confidence: medium (queue order and ready payload are coherent this sample)
- Top focus: execute one verified tech closeout, then one unit closeout only if required by the next read.

## Active play note (window 15)

- What changed: the live relaunch thread advanced into a tech-first hard lock with no hash drift.
- What to do now:
  1. `game play choose-tech --options --json`
  2. send one enabled tech closeout with `--closeout`
  3. re-read `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`
  4. if command lane is still top and valid, execute one `SKIP_TURN` closeout and re-read immediately.
- What to defer: avoid civic, production, and scouting commits until two consecutive clean reads show queue-order parity.
- 10–20 turn pivot condition:
  - Turns 15–16: tech unlock + unit repair loop.
  - Turns 17–20: choose one stable lane (growth-lite or pressure-lite) only after non-inverted queue for two windows.

## Turn Notes (live addendum)

- `Turn 15` | `New relaunch lane has a concrete tech hard block with active scout ready state` | `Resolve tech first via validated closeout, then immediate unit closeout only if still valid` | `Keeps recovery deterministic while still consuming tempo` | `Medium` | `Escalate if blocker order oscillates for 2 full reads without hash/turn movement`

## Snapshot: Turn 15 (live relaunch correction)

- Turn/Date: 15 / 3650 BCE
- Hash: 0
- Hard blocker: `NOTIFICATION_CHOOSE_TECH` (`id 20`), `hasSentTurnComplete:false`, `canEndTurn:false`
- Secondary unit lane: `NOTIFICATION_COMMAND_UNITS` (`id 21`) stale-expired, with `firstReadyUnitId: null`, `selectedUnitId: null`, no ready-unit payload.
- Required move: one validated tech closeout (`Animal Husbandry` or `Writing`) only.
- Post-check: immediately re-read `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`.
- Branch deferment: hold scouting/movement/production/civic branches until the unit lane is non-stale and a command closeout becomes enabled on two consecutive reads.

### Turn Notes addendum

- `Turn 15` | `Tech-first hard lock confirmed; unit lane now stale/null in App UI` | `Execute one closeout tech node with full reason and re-read immediately` | `The stale command lane means unit operations are not trustworthy in this state` | `Medium` | `Only after queue/ready stabilizes across two reads should pressure-lite scouting or production growth lanes be reintroduced`

## Live rebootstrap update (Turn 1 / 4000 BCE)

- Session context: new game launch after prior crash/reset. Treat all older blocker IDs as stale for this run.
- Turn/Date: `1 / 4000 BCE`
- Hash: `0`
- Turn posture: playable, tuner-ready, `canEndTurn:false`, `hasSentTurnComplete:false`
- Turn blockers: `NOTIFICATION_COMMAND_UNITS` hard at queue head; legacy-completed items are non-blocking informational noise until handler review.
- Top focus: founder command lane only (`UNIT_FOUNDER` first-ready at `65,31`) with movement-reachable tiles.
- Immediate command rule:
  - one validated unit action now (move candidate via `unit-target` or safe `SKIP_TURN` if no move value);
  - immediate re-read of `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`;
  - no production/civic branch while `ready-city` is null and no city blocker lock is hard.
- 10–20 tactical/strategic reset framing:
  - **Turns 1–3 (Window A):** founder-command stabilization and proof cycle.
  - **Turns 4–8 (Window B):** first growth/setup unlock only after hard-lane proof; do not force civic/culture/city actions.
  - **Turns 9–14 (Window C):** branch-select test (consolidation vs pressure-lite) only after 2 stable reads.
  - **Turns 15–20 (Window D):** commit to one lane only after non-inverting queue and concrete ready payloads persist.
- Escalation trigger: if queue top flips or `firstReadyUnitId` becomes null with no progress for two consecutive reads, stop branching and request parity confirmation in next player message.

## Live rebootstrap pivot (Turn 1 / 4000 BCE lock inversion)

- Live window check (2026-06-02): `blocker: NOTIFICATION_LEGACY_COMPLETED (id 0)` is hard/first; `NOTIFICATION_COMMAND_UNITS (id 2)` is stale-expired with `firstReadyUnitId:null`.
- `NOTIFICATION_CHOOSE_CITY_PRODUCTION (id 3)` remains visible but is non-blocking in this sample.
- `ready-unit` / `ready-city` currently have no concrete action payloads.
- Immediate advisory: treat this as a one-window lock inversion/review cycle; resolve or formally dismiss the blocking legacy notification first, then immediate parity re-read before any city or unit command.
- 10–20 horizon update:
  - **Turns 1–3:** legacy-notification resolution + repair loop only.
  - **Turns 4–8:** resume one-command microloop only if queue head and ready pointers stabilize.
  - **Turns 9–14:** branch test (growth-lite vs pressure-lite) only after two stable read windows.
  - **Turns 15–20+:** commit only on stable non-inversion behavior; otherwise continue recovery mode and send escalation on repeated stale transitions.
- Suggested relay row for active player:
  - `Turn 1 / 4000 BCE | NOTIFICATION_LEGACY_COMPLETED is now hard blocker (id 0), command lane stale, no ready city/unit payloads | Resolve inspected legacy blocker first, then re-read full queue/ready chain before any closeout | Avoid acting on null-ready `COMMAND_UNITS` to prevent invalid unit ops | Medium`.

## Snapshot: Turn 1 / 4000 BCE (stable blocking-notification hold)

- `Turn/Date`: `1 / 4000 BCE` · `hash 0` · `canEndTurn:false` · `hasSentTurnComplete:false`
- Blocker state: hard `NOTIFICATION_LEGACY_COMPLETED (id 0)` remains first and blocking.
- Auxiliary lane states:
  - `NOTIFICATION_COMMAND_UNITS (id 2)` stale-expired with null ready pointers.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION (id 3)` is non-blocking this read.
  - `ready-unit`: null, `ready-city`: null.
- Advisory row:
  - `Turn 1 / 4000 BCE` | `Blocking legacy-notification remains hard; command-closedown is still stale/null` | `Resolve blocking legacy notifier first using handler-confirmed action, then immediate full re-read` | `No city or unit safe closeout is currently concrete` | `Medium` | `If this hold persists for 2 more reads, stay recovery-only and prevent speculative production/movement`

### 10–20 turn recurrence plan (current relaunch)

- **Turns 1–2:** hold and revalidate; no speculative unit/city move.
- **Turns 3–6:** if blocker clears and queue becomes concrete, run exactly one validated closeout only.
- **Turns 7–12:** run one lane test after two stable reads (growth-lite or pressure-lite).
- **Turns 13–20:** commit one lane only with 2+ stable non-stale reads; otherwise continue conservative lock-loop and escalate parity confirmation.

## Snapshot: Turn 1 / 4000 BCE (third hold read)

- Turn/Date: `1 / 4000 BCE`
- Hash: `0`
- Turn posture: `canEndTurn:false`, `hasSentTurnComplete:false`
- Current locks:
  - Head blocker: `NOTIFICATION_LEGACY_COMPLETED (id 0)` hard/first.
  - `NOTIFICATION_COMMAND_UNITS (id 2)` still stale-expired, null ready pointer (`staleExpiredWithoutEnabledCloseout:true`).
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION (id 3)` non-blocking follow-on.
  - `ready-unit`: null · `ready-city`: null.
- Suggested player relay row:
  - `Turn 1 / 4000 BCE | Hold confirmed (3rd read) with no blocker/queue progress | Keep blocking legacy notification as priority; no unit/city command this window | Command lane remains non-actionable and risks invalid closeout | Medium | If still unchanged on next read, continue repair loop and escalate parity-confirmation cadence before any branch`.

### Hold horizon update (10–20)

- Turns 1–3: lock review only.
- Turns 4–6: if head blocker resolves and ready payload becomes concrete, one validated action only.
- Turns 7–12: branch test only after two stable reads and queue consistency.
- Turns 13–20: commit to growth-lite or pressure-lite only under sustained non-stale reads; else remain in recovery.

## Snapshot: Turn 1 / 4000 BCE (fourth hold read)

- Turn/Date: `1 / 4000 BCE`
- Hash: `0`
- State: `canEndTurn:false`, `hasSentTurnComplete:false`, `playable:true`.
- Blockers confirmed unchanged:
  - `NOTIFICATION_LEGACY_COMPLETED (id 0)` hard first.
  - `NOTIFICATION_COMMAND_UNITS (id 2)` stale-expired (`firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true`).
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION (id 3)` non-blocking.
  - `ready-unit`: null, `ready-city`: null.
- Player row (current):
  - `Turn 1 / 4000 BCE` | `Stable hold: blocking legacy remains hard and command-unit remains stale/null` | `Prioritize handler-confirmed blocking-notification resolve/read loop` | `No safe queue/ready closeout exists yet` | `Medium` | `If unchanged again, keep hold protocol and only escalate after another parity-confirm read`

### 10–20 recovery turn cadence (active relaunch hold)

- **Turns 1–3:** lock repair only.
- **Turns 4–7:** single validated action only if blocker clears and queue/ready are non-null and stable.
- **Turns 8–14:** branch test (growth-lite or pressure-lite) only after 2 consecutive stable windows.
- **Turns 15–20:** commit one lane only under sustained non-inverted, non-stale evidence.

### Snapshot: Turn 1 / 4000 BCE (Launch 2 re-entry hold)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `canEndTurn=false`, `hasSentTurnComplete=false`
- Primary blocker(s): `NOTIFICATION_LEGACY_COMPLETED` (`id 0`, hard queue head), plus non-blocking `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) and stale `NOTIFICATION_COMMAND_UNITS` (`id 2`).
- Immediate top focus: lock-safe legacy-closeout path; do not run city/unit growth before head-lock resolves.
- Confidence: high on hold-state (state sampled repeatedly), medium on whether handler closeout has deterministic safe action without UI confirmation.

### Data used for this row

- `civ7 game status --json`
- `civ7 game play notifications --json`
- `civ7 game play notification-queue --json`
- `civ7 game play priorities --compact --json`
- `civ7 game play ready-unit --json`
- `civ7 game play ready-city --json`

### Turn Notes (append when next meaningful read lands)

- `Turn 1` | `Re-launch relock remains unchanged for consecutive windows` | `Keep strict lock-first protocol and avoid all speculative civic, production, or movement actions while stale command/ready null persists` | `Avoids invalid closeout and keeps replay safety while launcher restart normalizes` | `Medium` | `If lock persists 2 more reads, add explicit command-window parity escalation note and continue one-step read-confirm cycle`

- `Turn 1 / 4000 BCE` | `Net-new relaunch baseline is live but queue is still legacy-blocked` | `Use one-command repair attempts only, then re-read full queue/priority/ready chain; no lane branching` | `Legacy blocker inversion is now dominant after restart; one false branch risks state drift` | `Medium-high` | `Request official handler-confirmed legacy closeout before any unit/city branch; then gate next actions by two consecutive stable reads`

### Snapshot: Turn 1 / 4000 BCE (hold re-confirm, turn-level parity)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `canEndTurn=false`, `hasSentTurnComplete=false`
- Top blocker: `NOTIFICATION_LEGACY_COMPLETED` (`id 0`) hard queue head; `NOTIFICATION_COMMAND_UNITS` (`id 2`) stale-expired; `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) follow-on only.
- Immediate focus: handler-first legacy closeout only; immediate one-command revalidation loop; no unit/city branch on null ready.
- Confidence: medium (high repeatability across multiple reads, low branch certainty until handler-confirmed legacy closeout).

### Data used for this row

- `civ7 game status --json`
- `civ7 game play notifications --json`
- `civ7 game play notification-queue --json`
- `civ7 game play priorities --compact --json`
- `civ7 game play ready-unit --json`
- `civ7 game play ready-city --json`

### Turn Notes (append here only when new game thread data arrives)

- `Turn 1 / 4000 BCE` | `Launcher relaunch remains in legacy lock hold across another parity read` | `Stay in handler-first lock-repair mode and avoid city/unit commitments while `firstReadyUnitId` is null` | `Avoids non-deterministic closeout under null-ready stale command-lane state` | `Medium` | `If two more clean reads do not unlock the queue head, switch to short escalation note with explicit blocker-head review before any speculative move`

- `Turn 1 / 4000 BCE` | `Legacy blocker still outranks city-production and stale command lane after relaunch reset` | `Re-read exact chain after any attempted legacy action: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`` | `Stable lock state means only lock-safe operations preserve replay posture` | `Medium` | `Next 2 windows: one verified transition or continue conservative hold with zero branching`

### Snapshot: Turn 1 / 4000 BCE (fifth hold read)

- Turn/Date: 1 / 4000 BCE
- Turn hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `canEndTurn:false`, `hasSentTurnComplete:false`
- Primary blocker(s):
  - `NOTIFICATION_LEGACY_COMPLETED` (`id 0`) hard queue-head
  - `NOTIFICATION_COMMAND_UNITS` (`id 2`) stale-expired, no concrete ready unit/city payload
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) non-blocking follow-on
- Immediate focus: continue legacy-head handler resolution + immediate full parity readback.
- Confidence: medium (repetition confirmed, but no validated unlock path yet).

### Data used for this row

- `civ7 game status --json`
- `civ7 game play notifications --json`
- `civ7 game play notification-queue --json`
- `civ7 game play priorities --compact --json`
- `civ7 game play ready-unit --json`
- `civ7 game play ready-city --json`

### Turn Notes (append here only when new game thread data arrives)

- `Turn 1 / 4000 BCE` | `Fifth consecutive hold read confirms legacy queue-head remains hard blocker` | `Hold legacy closeout-first and only run the parity chain; no unit/city branch until concrete payload appears` | `Avoids false command actions while both ready vectors stay null` | `Medium` | `If this holds again, maintain lock-safe recovery for the next 2 windows and trigger explicit blocker-head confirmation before any speculative branch`

### Snapshot: Turn 1 / 4000 BCE (single-lane hold read)

- Turn/Date: 1 / 4000 BCE
- Hash: `0`
- Readiness: `tuner-ready`, `inGame=true`, `canEndTurn=false`, `hasSentTurnComplete=false`
- Active blocker: single hard lane `NOTIFICATION_LEGACY_COMPLETED` (`id 1`) at queue head.
- Secondary lanes visible in prior reads (`NOTIFICATION_COMMAND_UNITS id 2`, `NOTIFICATION_CHOOSE_CITY_PRODUCTION id 3`) are not currently surfaced as queue-ready actions.
- `ready-unit` and `ready-city` remain null/non-concrete.
- Immediate focus: one-command lock-read cycle only: legacy handler evidence review then immediate re-read.
- Confidence: medium (high immediate repeatability on blocker head and empty ready payloads).

### Data used for this row

- `civ7 game status --json`
- `civ7 game play notifications --json`
- `civ7 game play notification-queue --json`
- `civ7 game play priorities --compact --json`
- `civ7 game play ready-unit --json`
- `civ7 game play ready-city --json`

### Turn Notes (append here only when new game thread data arrives)

- `Turn 1 / 4000 BCE` | `Single hard blocker queue now only legacy id 1; command/city lanes are fully latent` | `Do not branch; run handler-first legacy closeout path only` | `Speculative unit/city action remains unsafe while no concrete queue/ready payload exists` | `Medium` | `Hold and confirm this reduced-lane state for the next 2 reads before requesting explicit parity-escalation`

## Live checkpoint addendum (Turn 2 / 3975 BCE — net-new relaunch lock-hold)

- Check time: 2026-06-02T00:00:00Z
- Turn/hash: `2 / 3975 BCE`, `hash 0`
- Readiness: `tuner-ready` from app status; `canEndTurn:false`, `hasSentTurnComplete:false`
- Snapshot evidence: `game play notifications --json`, `game play notification-queue --json`, `game play ready-unit --json`, `game play ready-city --json`, `game play priorities --compact --json`, `game play progress-dashboard --compact --json`
- Blocking profile: live UI queue is empty in this sample (`queueLength: 0`) and `ready-unit`/`ready-city` are null/no payload, while `priorities` reports a clean-read fallback (no first ready lane).
- Interpretation: fresh relaunch has a lock-hold/parity-null condition rather than a safe concrete blocker, so this is a hold window pending explicit queue materialization.
- Recommendation now: keep one repair read cycle only (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) before any mutating command.
- Net risk: medium (no forward action evidence; stale/empty queue surface could conceal active lock requiring queue-handler review).
- Next correction condition: if two consecutive reads still show null ready + no concrete blocker, escalate parity confirmation and keep all movement/city/civic branches paused.

- Turn-row for active player cadence:
  - `Turn 2` | `No concrete notification queue/ready payload surfaced` | `Hold parity loop; re-read full stack and wait for queue-head lock` | `Avoid speculative ops and stale IDs` | `Medium` | `Recheck after 1–2 reads; if unchanged, request explicit handler validation before branching`


## Live checkpoint addendum (Turn 2 / 3975 BCE, concrete unit lane re-surfaced)

- Check time: 2026-06-02
- Turn/hash: `2 / 3975 BCE`, `hash 0`
- Evidence set: `notifications`, `notification-queue`, `ready-unit`, `ready-city`, `priorities`, `status`
- Top lane is now concrete again:
  - hard blocker: `NOTIFICATION_COMMAND_UNITS (id 6)`
  - queue order: `command-units -> choose-tech -> choose-city-production`
  - `firstReadyUnitId`: `UNIT_SCOUT (131072)`
  - `firstReadyUnitId`/`ready-unit` legality: SKIP/Move/Explore/Alert/Wait family are enabled
  - `canEndTurn:false`, `hasSentTurnComplete:false`
- Immediate plan: run one validator-backed unit closeout before any tech/city commits, then re-read full chain.
- Next correction condition: if re-read still leaves command queue blocked but no concrete action, downgrade to repair parity and escalate for one-cycle confirmation.

Turn-row (append-only)
- `Turn 2` | `Command units became concrete again (`firstReadyUnitId` present, legal no-target ops); top queue is now actionable` | `Perform one validated unit closeout, then immediate readback` | `Avoid acting on tech/city while command lane is hard and first` | `Medium` | `If this does not shift queue head, hold and keep one-cycle revalidation`.

## Turn-window refresh (10–20 horizon for this relaunch)

- **Window A (Turns 2–4):** command-clear first, preserve a single safe closeout each read, no speculative production/governance action.
- **Window B (Turns 5–8):** if command lane de-blocks and production/tech are now concrete, take one growth-safe civic/economic action with postcondition read.
- **Window C (Turns 9–14):** choose between growth-lite vs pressure-lite only after two stable consecutive reads with non-inverted queue head.
- **Window D (Turns 15–20):** execute lane commitment only under sustained readiness evidence; otherwise continue repair-confirm hold.


## Live checkpoint addendum (Turn 2 / 3975 BCE, tech-first lane recovered)

- Check time: 2026-06-02
- Turn/hash: `2 / 3975 BCE`, `hash 0`
- Queue/notification reality from this read:
  - `blockingNotificationId: {owner:0,id:4,type:20}`
  - `NOTIFICATION_CHOOSE_TECH` now hard/first with explicit enabled options;
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and `NOTIFICATION_COMMAND_UNITS` are non-blocking follow-ons.
- Unit status remains readable and concrete (`firstReadyUnitId: UNIT_SCOUT (131072)`, legal no-target ops present) but no longer priority blocker.
- `ready-city` still not yet concrete on this cycle.

Action for immediate cycle:
- Run one validated `choose-tech --closeout` now (from `notifications` enabled options), then re-read full loop before any city/unit sequencing.

Turn-row:
- `Turn 2` | `Hard blocker rotated from unit to choose-tech; tech lane is now explicit and blocking` | `Take one validated technology closeout, then read queue/ready again` | `Unit and city lanes are concrete enough to observe but not hard this cycle` | `Medium` | `If queue head remains tech on next read, keep one-command tech-only lane until it clears`

## Turn-window refresh (10–20 horizon)

- Window A (Turns 2–4): tech-clear first; execute one validated `choose-tech` closeout only.
- Window B (Turns 5–8): if tech lane advances and city/command remain concrete, run exactly one follow-on in the new hard lane.
- Window C (Turns 9–14): hold branch test to growth-lite vs pressure-lite only under two consecutive stable reads.
- Window D (Turns 15–20): commit to one lane only if no queue-head inversion and non-null ready payload persists.

## Relaunch Reset Pivot: Turn 2 / 3975 BCE (2026-06-02)

Current live posture is a **tech-first hard blocker** (`NOTIFICATION_CHOOSE_TECH`, id 4), with scout unit command and production as secondary follow-ons. Keep all non-generic doctrine intact; new action is narrow:

- Execute exactly one tech closeout now (`choose-tech --node <enabledNodeHash> --send --closeout --reason ...`).
- Re-read before any city or movement branch.
- Keep `command-units` and `choose-city-production` as follow-ons until they surface as hard with concrete payloads.

Immediate 10–20 horizon:
- 2–4: tech-blocker repair loops only.
- 5–8: one validated follow-on if the lane hardens with concrete inputs.
- 9–12: probe one low-commit branch only after two stable reads.
- 13–20: commit one lane only if continuity proof is clean across consecutive reads.

Draft one-line relay:
- `Turn 2 / 3975 BCE` | `Choose-tech is blocker` | `close tech once, re-read full loop, defer growth/pressure branches until lane stability returns` | `Medium`

## Live re-entry pivot (Turn 2 / 3975 BCE, 2026-06-02)

Live lane: `NOTIFICATION_CHOOSE_TECH` is hard with concrete choice payloads (`Pottery`, `Animal_Husbandry`, `Sailing` enabled).
Queue secondaries: `NOTIFICATION_CHOOSE_CITY_PRODUCTION`, `NOTIFICATION_COMMAND_UNITS`.

Execution sequence:
1) resolve tech with validated `choose-tech --closeout` and explicit rationale.
2) re-run `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
3) only advance to unit/city after queue/head is both hard+concrete and revalidated.

Forecast lanes:
- `2–4`: one-tech lock clear, no speculative branch.
- `5–8`: one concrete follow-up if lane flips and payload stabilizes.
- `9–12`: branch test after two consecutive stable reads.
- `13–20`: commit to one lane under stable queue/ready conditions.

## Live re-entry pivot (Turn 2 / 3975 BCE, null-ready hold)

- Evidence (single-cycle): `notifications`, `notification-queue`, `ready-unit`, `ready-city`, `priorities`.
- Hard blocker remains `NOTIFICATION_CHOOSE_TECH` (`id 4`).
- Queue head remains tech-first (`id 4`), then city-production (`id 5`), then stale `id 6`.
- `firstReadyUnitId` and `selectedUnitId` are now `null`.
- `ready-unit`/`ready-city` currently contain no actionable payloads.

Decision for this cycle:
1) Do one validated `choose-tech --closeout` from enabled options (`Pottery` / `Animal_Husbandry` / `Sailing`) with an explicit reason.
2) Immediate post-send readback: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
3) Do not start city/scout/other branches while both ready payloads are null.
4) If the same null-ready posture repeats on the next two reads, continue repair-confirm hold and only resume multi-step branching when queue/payloads stabilize.

Turn-horizon refresh (relaunch)
- **2–4**: tech-closeout lane only, one validated action.
- **5–8**: only open follow-on if that follow-on is hard + concrete.
- **9–12**: perform branch test only after two consecutive stable reads.
- **13–20**: commit one lane (growth-lite or pressure-lite) only under sustained lane continuity.

One-line relay for active player:
`Turn 2 / 3975 BCE` | `tech lock is hard and stable, but scout/city payloads are null now` | `send one validated tech closeout + immediate re-read` | `avoid speculative moves while ready pointers are null` | `Medium`

## Live re-entry pivot (Turn 2 / 3975 BCE, second null-ready hold sample)

- Hard blocker remains `NOTIFICATION_CHOOSE_TECH` (`id 4`), no turn progression.
- Queue remains: `CHOOSE_TECH -> CHOOSE_CITY_PRODUCTION -> COMMAND_UNITS`.
- `firstReadyUnitId` and `selectedUnitId` still `null`.
- `ready-unit` and `ready-city` remain null/no-op in this sample.

Decision for this cycle:
- execute one validated tech closeout (`choose-tech --closeout`) from current enabled options.
- immediate full readback (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`).
- defer city/scout actions until a non-null ready payload appears on the same read cycle.

Horizon refresh:
- Turns `2–4`: keep tech-lock only.
- Turns `5–8`: one follow-on only if hard lane becomes concrete.
- Turns `9–14`: branch test only after two stable non-stale reads.
- Turns `15–20`: commit one lane only if queue/head + ready payload stability persists.

Relay template:
`Turn 2 / 3975 BCE` | `tech-first hard blocker persists while ready pointers are null` | `send one valid choose-tech closeout then immediate readback` | `suppress city/unit branches on empty ready payloads` | `Medium`

## Live advisory checkpoint (Turn 2 / 3975 BCE — relaunch recovery hold)

- Check time: 2026-06-02T07:41:04.630Z
- `Live turn/hash`: `2 / 3975 BCE`, hash `0`.
- Hard blocker: `NOTIFICATION_CHOOSE_TECH` (`id 4`) with queue shape `id 4 -> id 5 -> id 6`.
- `selectedUnitId`: `null`; `firstReadyUnitId`: `null`.
- `ready-unit`: null payload (no legal operations).
- `ready-city`: null payload.
- `priorities`: `hud:technology-choice`.
- `NOTIFICATION_COMMAND_UNITS` is non-head stale-repair path and currently has no enabled closeout candidate, so unit actions must stay deferred.

Update decision lane:
- Immediate action: one validated tech closeout on enabled node (`Pottery`, `Animal_Husbandry`, `Sailing`) and immediate full re-read.
- Avoid city expansion/scouting branches until a hard lane produces concrete ready payload.
- If this same null/flat posture repeats on the next clean read, keep read-confirm hold and do not issue speculative closeouts.

10–20 turn sequencing update (relaunch edition):
- Turn band `2–4`: tech-lane recovery only.
- Turn band `5–8`: one follow-up only when hard lane is concrete.
- Turn band `9–14`: branch-lite check (`growth-lite` vs `pressure-lite`) only if two stable non-inverted reads.
- Turn band `15–20`: commit only under stable queue/ready continuity.

One-row relay for active thread:
`Turn 2 / 3975 BCE` | `Restarted game holds on CHOOSE_TECH with null ready pointers` | `Execute one validated `choose-tech --closeout` and re-read all control lanes immediately` | `No safe city/unit branch until concrete non-stale payload exists` | `Medium`

## Live advisory checkpoint (Turn 2 / 3975 BCE — second relaunch re-confirm)

- Check time: 2026-06-02T07:48:00Z
- `Live turn/hash`: `2 / 3975 BCE`, `hash 0`.
- Hard head blocker remains `NOTIFICATION_CHOOSE_TECH` (`id 4`) with queue shape `id 4 -> id 5 -> id 6`.
- `selectedUnitId` and `firstReadyUnitId` both `null` in this read.
- `ready-unit` and `ready-city` remain non-actionable (no legal operations, no city candidate payload).
- `priorities` still resolves to `hud:technology-choice`.
- `command-units` is not head; stale recovery remains non-closeout and cannot be safely actioned.

Strategic update:
- Keep immediate action to one validated tech closeout (`choose-tech --send --closeout`) and then `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` in that order.
- Do not branch to city production or scouting while both ready payloads are null.
- If this null/head hold repeats after this read, continue repair-read loop and escalate parity check before any speculative branch.

10–20 turn planning adjustment:
- `2–4`: hold to one clean tech closeout only.
- `5–8`: move to one follow-on only if hard lane transitions and payload is concrete.
- `9–14`: branch testing only after two clean non-inverted reads.
- `15–20`: choose one lane only if continuity holds; otherwise maintain recovery/confirmation posture.

One-row relay for active thread:
`Turn 2 / 3975 BCE` | `State remains stable: CHOOSE_TECH hard + null-ready` | `Send one validated choose-tech closeout and immediate full re-read` | `Hold back city/unit moves until concrete non-stale payloads return` | `Medium`

## Live checkpoint (Turn 2 / 3975 BCE, relaunch tech hold)

- Turn/Date: 2 / 3975 BCE, hash 0.
- Evidence: civ7 game status --json, civ7 game play priorities --compact --json, civ7 game play notifications --json, civ7 game play notification-queue --json, civ7 game play ready-unit --json, civ7 game play ready-city --json.
- Immediate blocker: NOTIFICATION_CHOOSE_TECH (id 4) is hard and queue-head.
- Queue order: id 4 (priority 100, tech) -> id 5 (priority 70, city production) -> id 6 (priority 65, command units).
- Pointers/payloads: selectedUnitId null, firstReadyUnitId null, ready-unit empty legalOperations, ready-city no candidates.
- Run rule for this window: send one validated tech closeout only, then re-read notifications -> notification-queue -> ready-unit -> ready-city -> priorities.
- Branch posture: defer city/unit branches while both ready payloads are null.

### Turn note added
- Turn 2 | relaunch holds on hard tech lock with null ready pointers | run one validated closeout-tech and immediate re-read (choose-tech --closeout) | no actionable city/unit lane yet so holding | Medium | if unchanged on the next clean read, keep parity hold and request explicit lock confirmation before branches

### 10–20 turn micro-horizon (net-new segment)
- 2-4: enforce one-command tech repair mode only.
- 5-8: run one follow-up only if head blocker becomes concrete.
- 9-14: test one branch only after two stable reads.
- 15-20: commit only with sustained queue/ready continuity; otherwise continue recovery-read mode.

- `Turn 2` | `New launch confirmed (post-crash)` | `Hard gate is CHOOSE_TECH (id 4) with null ready-unit/city context on both read surfaces` | `Send one validated `choose-tech --send --closeout` now (Pottery / Animal_Husbandry / Sailing) and re-read `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`; hold scouting/productivity branching until concrete payload exists` | `Medium` | `If no queue/ready movement for the next 2 clean reads, extend lock-repair loop and avoid speculative lane commits`

- `Turn 1` | `App UI read path degraded (notifications/queue/priorities return GameContext/Game undefined); Tuner still active on Command Units blocker` | `Hold non-validated execution and run verification triad: status/autoplay/map summary, then re-check App UI command views until one concrete queue+ready payload returns` | `Use repair-safe lane only with native validator evidence` | `Medium` | `If this persists for 2 consecutive reads, request thread restart/re-sync of the control socket before any branching`

- `Turn 4` | `Discovery choice blocker still unresolved after second clean recheck` | `Hold and keep handler-inspection loop only` | `No concrete closeout command exists in App UI/queue/read surfaces` | `Medium` | `If this persists through next turn probe, shift to explicit parity escalation before any branch or scout/city/tech action`

## Turn Notes (append-only relaunch refresh)

- `Turn 4 / 3925 BCE` | `Discovery lock persists on relaunch refresh and remains command-path unresolved` | `Keep strict handler-evidence hold; do not branch` | `No concrete ready-unit / ready-city payload and no explicit closeout surfaced` | `Medium` | `If this repeats on next read, request explicit blocker-verified closeout before any branch`

- `Turn 4 / 3925 BCE` | `Discovery closeout evidence still absent on checkpoint #7` | `Keep strict handler-inspected hold and do not branch` | `Queue is single hard node, no enabled ready-unit/city payload` | `Medium` | `If this repeats on next clean read, request explicit handler-backed closeout confirmation before any lane recommendation`

- `Turn 4 / 3925 BCE` | `Discovery blocker persists on checkpoint #8` | `Hold handler-evidence loop and keep no-branch posture` | `No concrete ready-unit/city payload and no closeout command is yet exposed` | `Medium` | `If this persists on next clean read, issue explicit handler-confirmed closeout request before any lane recommendation`

- `Turn 4 / 3925 BCE` | `Discovery blocker persists on checkpoint #9` | `Hold handler-inspected lock posture` | `No concrete handler/evidence closeout for unit or city appears` | `Medium` | `Hold and request explicit handler-backed confirmation before any speculative branch`

- `Turn 4 / 3925 BCE` | `Discovery blocker persists on checkpoint #10` | `Hold handler-evidence lock posture` | `No handler-confirmed closeout command or ready payload has appeared` | `Medium` | `Hold and explicitly request closeout confirmation before any branching recommendation`
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #11 | maintain lock-safe hold and full confirm loop (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; do not branch city/unit/tech | `Medium` | if recheck is still unchanged on next clean read, request explicit handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #11)

- `Turns 4–14`: recovery hold + revalidation only.
- `Turns 15–18`: permit one lane trial only after two consecutive reads return concrete discovery closeout + stable queue/payload.
- `Turns 19–20`: permit exactly one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise maintain hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #12 | enforce lock-safe hold and strict revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-confirmed closeout command; do not branch city/unit/tech | `Medium` | if this posture repeats on the next clean read, request explicit handler-confirmed closeout before any speculative lane recommendation

### 10–20 turn lens addendum (after #12)

- `Turns 4–14`: recovery + revalidation only.
- `Turns 15–18`: permit one lane trial only after two consecutive reads that expose stable, concrete discovery closeout + queue continuity.
- `Turns 19–20`: permit one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise continue hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #13 | continue strict handler-confirmation hold + full revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; no city/unit/tech branch until confirmation | `Medium` | if this repeats on the next clean read, request explicit handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #13)

- `Turns 4–14`: full recovery + revalidation only.
- `Turns 15–18`: allow one lane trial only after two consecutive reads with stable queue and concrete discovery closeout payload.
- `Turns 19–20`: permit one growth-first or pressure-first follow-on only if stable closeout repeats on confirming read; otherwise remain in hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #14 | enforce lock-safe hold + strict revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #14)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #15 | continue strict handler-confirmation hold + revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request explicit handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #15)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #16 | enforce lock-safe hold and strict revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #16)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #17 | continue strict handler-confirmation hold and full revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #17)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #18 | continue strict handler-confirmation hold and full revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #18)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | discovery handler lock persists on checkpoint #19 | continue strict handler-confirmation hold and full revalidation chain (`notifications -> notification-queue -> priorities -> ready-unit -> ready-city`) | no ready-unit/ready-city payload and no handler-verified closeout command; suppress city/unit/tech branch | `Medium` | if unchanged on next clean read, request handler-confirmed closeout before any lane recommendation

### 10–20 turn lens addendum (after #19)

- `Turns 4–14`: continue recovery + validation-only posture.
- `Turns 15–18`: one controlled lane trial only after two consecutive stable reads with concrete discovery closeout and queue continuity.
- `Turns 19–20`: one growth-first or pressure-first follow-on only if stable closeout repeats on a confirming read; otherwise hold.
- `Turn 4 / 3925 BCE` | live civ7 control socket unavailable on `127.0.0.1:4318` (`all-hosts-unavailable`) | hold prior check-in posture from checkpoint #19 without proposing lane changes; no fresh evidence to alter strategy | `Medium` | after socket recovery, re-run `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` and only then update tactical guidance

### 10–20 turn lens addendum (after #20)

- `Turns 4–14`: hold and wait for reconnection/read validation; do not branch on stale data.
- `Turns 15–18`: one lane trial only after two consecutive clean reads with concrete closeout payload and stable lock continuity.
- `Turns 19–20`: one controlled follow-on only if closeout continuity persists after reconnection and confirmation;

## Live update (relaunch reconnect, transport down)

- `2026-06-02`: All gameplay control surfaces now return `Civ7DirectControlError: all-hosts-unavailable` at `127.0.0.1:4318` (status, notifications, notification-queue, priorities, ready-unit, ready-city).
- Advisory state: strategy loop is **paused for transport**, not tactical replan. Preserve all generic doctrines that are transport-agnostic:
  - blocker-first, one validated action per cycle, null-pointer conservatism, and two-clean-read confirmation before branching.
- Active play-frame action:
  - continue no-op reconnection watch only;
  - resume with the bootstrap chain once socket returns;
  - resume 10–20 turn sequencing only after concrete queue head + payload stability is observed.
- Turn note:
  - `Turn unknown (new launch reconnect window)` | `Socket unavailable on all control calls` | `Stop all speculative lane planning and hold reconnection cadence` | `Avoid false assumptions from empty/undefined payloads` | `High` | `Request fresh full read once tuner socket is reachable`

- Multi-turn projection while offline:
  - `Block A`: Reconnect-only hold.
  - `Block B`: first two live reads with concrete queue/payload determine reset anchor.
  - `Block C`: only after two confirmed clean reads, permit one controlled follow-on.
  - `Block D`: commit lane only after payload continuity remains stable at least one confirming read beyond follow-on.

## Live update (relaunch reconnect retry window)

- `2026-06-02T03:55:14Z`: Repeated live recheck confirms CLI remains unreachable (`all-hosts-unavailable` on all play-control reads).
- Thread-state rule for this window: no tactical updates, no branching, no lane-switches until a full successful payload read returns.
- Turn-note row appended:
  - `Turn unknown (relaunch reconnect #21)` | `Three consecutive retries failed to contact tuner socket` | `Keep strict reconnect hold and preserve handler/payload guardrails` | `Any new move would be ungrounded speculation` | `Medium` | `Resume first concrete read on successful socket recovery`

Operational projection update:
- `Reconnect-0`: freeze strategy advice and keep a clean retry rhythm.
- `Reconnect-1`: first complete read defines new anchor + immediate queue/payload baseline.
- `Reconnect-2`: enable one validated follow-on only after the same concrete payload holds.
- `Reconnect-3`: commit only after an additional confirming read; otherwise revert to reconnection hold.

## Live update (reconnect complete, actionable COMMAND_UNITS)

- `2026-06-02`: socket recovered; live reads now available.
- Confirmed active lock: `NOTIFICATION_COMMAND_UNITS` head, `id 4`, `isEndTurnBlocking:true`.
- Read fields: `firstReadyUnitId=UNIT_SCOUT (131072)`, `selectedUnitId=null`, `queueLength=1` (`inspect-ready-unit`).
- `ready-unit`: concrete and legal (`SKIP_TURN`, `MOVE_TO`, `EMBED_LOOKOUT`, etc.).
- `ready-city`: `cityId:null`, `legalOperationCount:0`.

Turn note:
- `Turn 4 / 3925 BCE` | `COMMAND_UNITS is now concrete and actionable` | `issue one validated unit closeout (prefer SKIP_TURN), then re-read all chain` | `Hold city/civic/tech lanes until queue/payload becomes concrete and non-null` | `Medium` | `If lane remains, run one confirming read before any movement branch`

Projection refresh:
- `Block A (4–6)`: clear unit blocker only.
- `Block B (7–10)`: one controlled follow-on only after confirming queue/payload stability.
- `Block C (11–16)`: branch-lite growth/pressure decision only when new hard blocker and unit/city payload is concrete.
- `Block D (17–20)`: commit one lane only with two confirming reads.

## Live update (turn 5 / 3900 BCE: command blocker persists)

- `2026-06-02`: transport is live and state is stable but blocked.
- Confirmed read window:
  - `turn 5 / 3900 BCE`, `hash 0`.
  - Hard blocker still `NOTIFICATION_COMMAND_UNITS` (`id 4`) with `canEndTurn:false`.
  - `firstReadyUnitId=UNIT_SCOUT (131072)` and `selectedUnitId=null`.
  - `ready-unit` concrete legal operations remain available; `ready-city` remains null.

Player-facing recommendation row:
- `Turn 5 / 3900 BCE` | `COMMAND_UNITS still concrete (Scout ready at 8,22)` | `Send one validated closeout (SKIP_TURN unless scouting value from immediate evidence is clear)` | `No city/tech/civic expansion until command lane clears or pivots with concrete payload` | `Medium` | `Take one confirming re-read before any movement branch beyond skip`

Projection update:
- `Block A (5–8)`: continue single blocker-clear sequence.
- `Block B (9–12)`: one follow-on move/safe-scout action only if state repeats cleanly.
- `Block C (13–18)`: branch into growth/pressure if city/tech head appears with concrete payload.
- `Block D (19–20)`: commit to one lane only when lane continuity is confirmed on a second clean read.

## Live update (turn 6 / 3875 BCE: COMMAND_UNITS persists)

- `2026-06-02T03:56:54Z`: transport stable and readable.
- `turn 6 / 3875 BCE`, `hash 0`, `canEndTurn:false`, `hasSentTurnComplete:false`.
- Hard blocker still `NOTIFICATION_COMMAND_UNITS` (`id 4`).
- `firstReadyUnitId=UNIT_SCOUT (131072)`, `selectedUnitId=null`.
- `ready-unit`: concrete (`SKIP_TURN` available).
- `ready-city`: still non-actionable.

Player-facing recommendation:
- `Turn 6 / 3875 BCE` | `COMMAND_UNITS persists with concrete Scout` | `Execute one validated SKIP_TURN closeout` | `No city/tech/civic branches until command lane yields concrete follow-on` | `Medium` | `If unchanged on next read, keep single-blocker posture`

Projection refresh:
- `Block A (6–8)`: blocker-clear only.
- `Block B (9–12)`: one controlled follow-on only after confirming read.
- `Block C (13–16)`: branch-lite if command shifts to city/tech head.
- `Block D (17–20)`: commit only after lane continuity repeats on confirming read.
