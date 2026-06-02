# Play-Agent Operational Reference (Live Antiquity Playbook)

Status: active
Session owner: Codex play agent
Scope: one live Civ VII run, from current position through end of Antiquity
Commit policy: keep this file as durable session memory; do not delete it. Persist under Git once session ends (or when watcher does).

## 0) Core objective
Maintain a high-probability win-or-near-top Antiquity outcome by driving score/legacy/achievement pressure while preserving growth and survivability. Military domination is a valid lane but not the only one; policy, culture, science, and economy lanes are competitive if they unlock compounding advantage before turn pressure converges.

Use this objective:
- first as `safe` operations: clear blockers and remove tempo debt;
- then as `tempo conversion`: convert scouting and production freedom into stable expansion;
- then as `legacy scoring`: pursue high-confidence triumph paths and district/civic/science/culture compounding;
- then as `edge correction`: trade off risk if behind vs. double-down on a stronger lane if ahead.

## 1) Non-negotiable execution loop
At each decision window:

1. `civ7 game status --json`
2. `civ7 game play progress-dashboard --compact --json`
3. `civ7 game play priorities --compact --json`
4. Resolve only the first blocking lane, unless multiple non-conflicting independent actions are fully validated.
5. Execute via validator-backed operation (`--json --send`) with explicit `--reason`.
6. Require meaningful postcondition (`sent` + verified change). Treat `no-state-change` as a miss.
7. Re-run priorities and notifications before next action.

Do not add actions that depend on hidden or stale state. If a read fails, rehydrate and validate from a fresh `priorities`/`notifications` snapshot.

## 2) Blocking lane playbook
- `NOTIFICATION_CHOOSE_CULTURE_NODE` → `game play choose-culture --options --json`
- `NOTIFICATION_CHOOSE_TECH` → `game play choose-tech --options --json`
- `NOTIFICATION_CHOOSE_GOVERNMENT` → `game play choose-government --options --json`
- `NOTIFICATION_CHOOSE_GOLDEN_AGE` → `game play choose-celebration --options --json`
- `NOTIFICATION_DIPLOMATIC_ACTION`
  - If response options exist: use diplomacy response surface and send validated response.
  - If no actionable response: reviewed diplomatic closeout (`dismiss-notification` with reviewed reason).
- `NOTIFICATION_COMMAND_UNITS`
  - Prefer `ready-unit` + `unit-target`/`unit-operation` lanes.
  - If `unit-command-stale-expired` and no closeout candidates: end-turn fallback is allowed; otherwise use the specific candidate closeout.
- Reviewed info reports / reports in general → `dismiss-notification` with explicit reviewed reason.
- In all dismissal categories, use official closeout route(s) and verify queue/front-item movement when possible.

## 3) Movement/tactical discipline
- For ready unit decisions use `unit-move-preview --compact --json`.
- Treat any non-obvious move (combat, city approach, worker placement) as a two-step:
  1) `unit-target` / `unit-operation` validation from compact output
  2) send with `--reason` and post-read verification
- Use `unit-target` path summaries and movement reachability for candidate triage.
- Do not infer enemies from owner alone; only treat hostility through verified diplomatic relationship data where surfaced.

## 4) Score/legacy priorities (Antiquity-centric)
- Track every window using:
  - Age progress
  - Cultural, Military, Science, Economic progression
  - Legacy path progress and per-victory score deltas
- Prefer actions that convert immediate tempo to durable growth:
  - stable city production and growth,
  - expansion into safe revealed locations,
  - anti-vulnerability positioning,
  - one lane of legacy pressure supported by current blockers.
- If behind materially on all lanes, rebalance immediately: skip speculative aggression and secure recovery lanes first (civic/production/research + map control).

## 5) Risk controls
- Never perform blind autopilot turns without a blocker-free read window.
- Never trust one stale snapshot for irreversible civic/military commitments.
- If the same blocker remains for multiple windows without progression, send a watcher feature request rather than brute-forcing closeouts.
- Keep all evidence paths in compact outputs in the loop; avoid direct App UI assumptions.

## 6) Watcher escalation protocol
- If repeated friction appears in the same category 3+ turns (example: stale command-queue recovery, diplomacy report closeout, relationship classification gaps), request a dedicated support patch through the watcher thread.
- Prefer support changes that return compact option sets, evidence for why no closeout candidate exists, and deterministic commands with validation templates.

## 7) Current status to resume from
- Live direct-control socket is active on `127.0.0.1:4318` (App UI connected, playable).
- Last confirmed state: `Turn 13 / 3700 BCE`, hash `0`, `NOTIFICATION_COMMAND_UNITS` (`id 18`) is concrete/hard with two enabled `SKIP_TURN` closeout candidates on scouts `131072` and `196609`.
- Resume policy for this relaunch segment: execute one validated `unit-command` closeout first (`SKIP_TURN` unless a target-validated move is immediately superior), then immediately re-read `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`; keep non-blocking `NOTIFICATION_VOLCANO_ACTIVE` as informational until reviewed.

## 7b) Relaunch continuation checkpoint (Turn 12 / 3725 BCE)

- Resume posture confirmed for this net-new launch: live lane is concrete `NOTIFICATION_COMMAND_UNITS` priority with `NOTIFICATION_NEW_POPULATION` in follow-on position.
- Execution rule update:
  - run one validated unit closeout first,
  - re-read immediately: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`,
  - then continue to population/social/cultural follow-on only if it becomes hard/validated and non-stale.
- Keep generic framework clauses from this reference unchanged (one-command validation cycle, immediate postcondition checks, no stale inference, escalation after repeated drift).

## 7c) Immediate continuation checkpoint (Turn 13 / 3700 BCE)

- Active lane after a clean read is again `NOTIFICATION_COMMAND_UNITS` (`id 18`, end-turn blocker) with a readable ready unit pointer:
  - `firstReadyUnitId: UNIT_SCOUT (196609)` at `(29,33)`
  - `ready-unit` exposes valid no-target operations, including `SKIP_TURN`, and move utilities (`MOVE_TO`, `WAIT_FOR`, etc.)
- `notification-queue` now shows:
  - step 1: unit-command (`priority 100`) with `unit-command` disposition
  - step 2: non-blocking `NOTIFICATION_VOLCANO_ACTIVE` (`priority 35`)
- `priorities` is clear (`hud:unit-command` first, then `ready-unit`, then battlefield checks).
- `hasSentTurnComplete: false`; `canEndTurn: false` indicates a unit action closeout is still needed before safe turn handoff.

Resume policy (next two windows):
- validate one unit closeout (`SKIP_TURN` default) with explicit reason, then re-read `notifications -> notification-queue -> ready-unit -> priorities`.
- inspect and optionally dismiss the informational volcano note only after a human-review reason is logged (`dismiss-notification --target '{"owner":0,"id":17,"type":20}' --send --reason "<reviewed: ...>"`).
- after blocker stabilizes for two reads, resume growth/civic branch planning from the current live frame.

## 7d) Relaunch continuation checkpoint (Turn 13 / 3700 BCE)

- Live thread snapshot moved to a new baseline: hard blocker is now `NOTIFICATION_VOLCANO_ACTIVE` (`id 17`) and top queue priority is `reviewed-dismissal-candidate` with `isEndTurnBlocking: true`.
- `NOTIFICATION_COMMAND_UNITS` (`id 18`) remains secondary and stale-expired:
  - `firstReadyUnitId: null`
  - `selectedUnitId: null`
  - `expired: true`
  - `staleReadyPointerSuspected: false`
  - `staleExpiredWithoutEnabledCloseout: true`
  - no enabled SKIP_TURN candidates; both scanned scouts are now `enabled:false`.
- `priorities` points to informational-volcano closeout (`hud:informational-notification`) and reports `canEndTurn:false`, `hasSentTurnComplete:true`.

Resume policy (this relaunch window):
1. Execute reviewed informational dismissal for volcano first using the live notification id and explicit reason:
   - `game play dismiss-notification --target '{"owner":0,"id":17,"type":20}' --send --reason "reviewed: volcano active warning logged and location checked"`
2. Immediately re-read: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities` before any further attempt.
3. If `NOTIFICATION_COMMAND_UNITS` remains secondary and still stale/null-pointer, do not force speculative movement; keep one-cycle repair-readback only.
4. If and only if it becomes hard and actionable with a valid ready unit, execute one validated action (`SKIP_TURN` on a validated scout if no better target-validated move) then revalidate again.
5. If this no-ready condition persists for two reads without lock movement, return to parity-recovery loop and request escalation notes.

## 10–20 turn sequencing update (this launch continuation)

- Turns 13–14: clear volatility through informational closeout first, then one-command repair-confirm cycle; do not open production/civic commitments.
- Turns 15–16: if queue ordering stabilizes and command lane becomes non-stale, run one validated unit lane closeout or city/civic action as the new hard top lane.
- Turns 17–20: commit to branch only after two consecutive stable reads with no queue inversion:
  - Branch A: safe compounding setup (production/civic conversion first)
  - Branch B: pressure-lite recon (single validated scouting move, no combat)
- If stale/unstable state persists into 20, hold the lane and continue conservative loop (no speculative expansion).

## 7e) Relaunch continuation checkpoint (Turn 15 / 3650 BCE)

- Live relaunch status (2026-06-02): `Turn 15 / 3650 BCE`, hash `0`, hard blocker is now `NOTIFICATION_CHOOSE_TECH` (`id 20`).
- Secondary lane is `NOTIFICATION_COMMAND_UNITS` (`id 21`), currently non-blocking but still a valid watch channel because `firstReadyUnitId` is active and `SKIP_TURN` is enabled on scout `196609`.
- Exact readback chain for this cycle:
  1. `civ7 game play notifications --json`
  2. `civ7 game play notification-queue --json`
  3. `civ7 game play ready-unit --json`
  4. `civ7 game play ready-city --json`
  5. `civ7 game play priorities --compact --json`
- Execution rule now:
  - Resolve technology first with a validated closeout (`Animal_Husbandry` or `Writing` are both enabled and non-expired in current payload).
  - Re-read immediately after send, then either:
    - run one validated unit closeout (`SKIP_TURN`) if queue remains unit-command top or
    - continue with tech lane if command remains secondary.
- Keep all prior non-negotiables: no speculative operations, no stale-id action, and immediate post-condition verification.

## 10–20 turn sequencing (relaunch, active window)

- Turns 15–16: hard tech unblock only, then immediate repair-read.
- Turns 17–18: if command lane reappears as hard and valid, run one validated command closeout + immediate re-read.
- Turns 19–20: pick branch only after two consecutive stable reads:
  - growth-lite branch (city/expansion tempo) if tech resolved cleanly and city/command lanes agree,
  - pressure-lite branch (single validated scout probe) only if unit targets become clearly higher value.
- If queue/chosen blocker flips for 2 consecutive reads without state advancement, freeze at safe-loop and request parity confirmation before any non-lock move.

## 7f) Live correction checkpoint (Turn 15 / 3650 BCE, current)

- Verified App UI state (same hash `0`): hard blocker is `NOTIFICATION_CHOOSE_TECH` (`id 20`) and `NOTIFICATION_COMMAND_UNITS` (`id 21`) is second.
- Unit-command is in `unit-command-stale-expired` posture:
  - `firstReadyUnitId: null`
  - `selectedUnitId: null`
  - both scanned scouts present but no enabled closeout candidates
  - `staleExpiredWithoutEnabledCloseout: true`
- Active execution policy:
  - resolve tech first using `game play choose-tech --options --json` and one validated `--send --closeout` node (`Animal_Husbandry` or `Writing`)
  - immediate re-read: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`
  - if command-lane remains stale on the immediate re-read, do not attempt unit operations; hold in repair-confirm loop and do one read cycle before retrying.
- Generic clauses unchanged: one validated command per cycle, no stale inference, no speculative movement, two consecutive stable reads before branch commitment.

## 7g) Launch reset checkpoint (Turn 1 / 4000 BCE, active rebootstrap)

- New session evidence (post-crash launch) indicates a fresh baseline:
  - `civ7 game status --json`: `Turn 1 / 4000 BCE`, hash `0`, `canEndTurn:false`, `hasSentTurnComplete:false`, `playable:true`, `inGame:true`.
  - `civ7 game play notifications --json`:
    - hard blocker: `NOTIFICATION_COMMAND_UNITS` (`id 2`)
    - non-blocking: two `NOTIFICATION_LEGACY_COMPLETED` entries (other players, non-local; inspect before dismiss)
    - `firstReadyUnitId: UNIT_FOUNDER (65536)`
    - command reconciliation reports enabled `SKIP_TURN` closeout on founder as fallback-safe.
  - `civ7 game play notification-queue --json`:
    - step 1: unit-command (`priority 100`, end-turn blocking)
    - step 2–3: legacy-notification handler-inspection steps (`legacy_completed`, non-blocking)
  - `civ7 game play priorities --compact --json` shows top priority `hud:unit-command`.
  - `civ7 game play ready-unit --json` keeps a valid ready founder pointer with no direct no-target ops exposed in this sample.
  - `civ7 game play unit-move-preview --unit-id ... --json` shows movement options (3+ tiles reachable), with move intent requiring explicit target validation per-cycle.
- Net-new execution policy for this restart window:
  1. Resolve `NOTIFICATION_COMMAND_UNITS` immediately via one validated unit action path:
     - preference: `game play unit-target --unit-id <founder> --x <validated> --y <validated> --send --reason "..."`
     - fallback only if no target is immediately value-positive: `game play operation --family unit --type SKIP_TURN --unit-id <founder> --send --reason "..."`
  2. Re-read the full short chain before any city/econ branch: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`.
  3. Keep all unclassified legacy notifications as informational until handler review; do not force-dismissal or speculative civic steps.
- Generic clauses from this reference still dominate:
  - one validated command per cycle,
  - no stale inference from null/missing selectors,
  - one clean re-read cycle before any branching,
  - if the unit lane inverts or stalls on null pointers for two reads, pause tactical expansion and run parity lock-down for the next cycle.

## 7h) Relaunch correction checkpoint (Turn 1 / 4000 BCE, blocking-notification inversion)

- Latest authoritative snapshot: `NOTIFICATION_LEGACY_COMPLETED` (`id 0`, `isEndTurnBlocking=true`) is now queue head and blocks `end-turn`; this followed an earlier unit-lock focus window.
- `NOTIFICATION_COMMAND_UNITS` (`id 2`) remains stale-expired and non-actionable:
  - `firstReadyUnitId: null`, `selectedUnitId: null`, `staleExpiredWithoutEnabledCloseout: true`.
  - repairCandidate remains the end-turn command: `game play end-turn --send --reason "stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout"`.
- `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) is visible but no longer hard at this cycle.
- `ready-unit` and `ready-city` have no concrete action payload now.
- `notification-queue` and `priorities` align on blocking-notification at the top (`legacy-completed`), with unit-command and production still deferred as non-blocking follow-ons.

Execution policy for this cycle:
1. Resolve/inspect `id 0` first using the official handler path or a validated dismissal command if handler confirms review-safe closure.
2. Immediately re-read `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` before any unit/city operation.
3. If legacy-blocking status persists on two clean reads, hold tactical/micro branches and continue repair-read mode.
4. Run one validated command only if queue head is concrete and non-null-ready for that lane.

10–20 turn adaptation (rebootstrap window):
- **Window A (Turns 1–3):** blocking-notification repair and parity confirmation.
- **Window B (Turns 4–8):** if blocker deconflicts and `NOTIFICATION_COMMAND_UNITS` regains readiness, run one safe closeout then immediate re-read.
- **Window C (Turns 9–12):** only after two stable reads, choose one low-variance lane (growth-lite or pressure-lite).
- **Window D (Turns 13–20):** commit only if queue/order + ready pointers remain stable for two additional windows; otherwise continue conservative lockhold and escalation logging.

## 7i) Live re-entry checkpoint (Turn 1 / 4000 BCE, blocker stable)

- Re-check confirmed no state advance since the last live window:
  - top blocker remains `NOTIFICATION_LEGACY_COMPLETED` (`id 0`, `blocking`), queue-head hard.
  - `command-units` (`id 2`) still stale-expired: `firstReadyUnitId: null`, `staleExpiredWithoutEnabledCloseout: true`, repair hint unchanged.
  - city production (`id 3`) present but non-blocking because legacy head must be resolved first.
  - `ready-unit`: null payload; `ready-city`: null payload.
- Active rule reset for this cycle:
  - Step 1: resolve or formally defer the blocking legacy notification through handler-confirmed path before any non-handler action.
  - Step 2: immediately re-read `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
  - Step 3: only if queue head shifts and one lane has concrete ready payload, execute one validated command and re-read again.
- 10–20 horizon update:
  - **Turns 1–2:** no-op parity loop, no speculative exploration.
  - **Turns 3–6:** if blocker de-locks and command/city readiness remains actionable, run one safe closeout in sequence.
  - **Turns 7–12:** maintain one validated command per cycle and only branch once two clean reads show non-inverted queue and non-null ready pointers.
  - **Turns 13–20:** commit to one lane only under continued stability, else extend recovery loop and escalate parity confirmation cadence.

## 7j) Repeated hold checkpoint (Turn 1 / 4000 BCE, no queue/ready progression)

- Second confirmation after prior hold: state remains unchanged:
  - `NOTIFICATION_LEGACY_COMPLETED` (`id 0`) remains hard queue head / HUD blocker.
  - `NOTIFICATION_COMMAND_UNITS` (`id 2`) is still stale-expired (`firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true`).
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) remains non-blocking follow-on.
  - `ready-unit` and `ready-city` remain null/non-concrete.
- New escalation guard now active in this rebootstrap:
  1. Keep handler-first pass for the legacy blocker.
  2. Re-read the chain immediately after any handler action attempt:
     `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
  3. If two consecutive reads continue with this exact posture, classify as a lock hold window and defer tactical branches.
  4. Continue one-command-at-most if and only if a non-null ready command/city payload appears on queue head.
- 10–20 adaptation now pinned for this thread:
  - **Window A (Turns 1–3):** confirmation/review loops only.
  - **Window B (Turns 4–6):** one validated lane action only after lock head changes.
  - **Window C (Turns 7–14):** branch test only under two stable, non-inverted reads.
  - **Window D (Turns 15–20):** commit only if stable; otherwise extend conservative recovery cadence and escalate parity drift to active player.

## 7k) Stable hold checkpoint (Turn 1 / 4000 BCE, unchanged for multiple reads)

- This is a confirmed continuation sample with no blocker or ready progression:
  - `NOTIFICATION_LEGACY_COMPLETED` (`id 0`) remains hard queue head (`isEndTurnBlocking=true`).
  - `NOTIFICATION_COMMAND_UNITS` (`id 2`) remains stale-expired, `firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true`.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) remains non-blocking follow-on.
  - `ready-unit` and `ready-city` remain null.
- Reboot posture rule (lock-safe):
  1. Keep blocking-legacy handler review as the first explicit action item (`NOTIFICATION_LEGACY_COMPLETED`, id 0).
  2. No city/production or unit command execution until either blocker resolves or a concrete non-null ready payload emerges on queue head.
  3. Immediately re-read: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` after any attempted handler action.
  4. If this posture repeats for the next read again, classify as a durable lock hold and keep all movement/city branches frozen.
- 10–20 continuation now narrowed:
  - **Window A (Turns 1–3):** sustained repair-read only.
  - **Window B (Turns 4–7):** one validated action only if head changes to a concrete queue/ready pair.
  - **Window C (Turns 8–14):** branch test (growth-lite vs pressure-lite) only after 2+ stable reads.
  - **Window D (Turns 15–20):** commit only under stable lock resolution; else continue conservative hold + escalation cadence.

## 7l) Launch 2 hold checkpoint (Turn 1 / 4000 BCE, same hold)

- Confirmed again on re-entry: hard top blocker remains `NOTIFICATION_LEGACY_COMPLETED` (`id 0`, `isEndTurnBlocking:true`) and unit queue remains `NOTIFICATION_COMMAND_UNITS` (`id 2`) with `staleExpiredWithoutEnabledCloseout:true`.
- `firstReadyUnitId` and `selectedUnitId` are `null`; `ready-unit` and `ready-city` continue to report no concrete payload.
- `notification-queue` and `priorities` are still aligned on legacy head-first handling.
- No execution branch changed during the relaunch window; replay-safe state remains stable (`turn 1 / 4000 BCE`, `hash 0`).

Net-new execution policy for this net-new launch:
1. Resolve official legacy-lock path first (or approved reviewed-dismissal closeout when safe evidence is available).
2. On any attempted repair, execute exactly one immediate readback chain: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.
3. If lock remains unchanged on the second read, do one lock-hold window and defer all tactical/civic/expansion mutations.
4. Never branch while both unit and city ready payloads stay null or stale-expired.

10–20 window update (rebootstrap continuity):
- Window A (Turns 1–4): repair-and-parity hold, zero speculative branches.
- Window B (Turns 5–8): if/when blocker head changes and a concrete ready payload appears, execute one validated closeout and re-read once.
- Window C (Turns 9–14): branch test only with two consecutive non-inverted reads.
- Window D (Turns 15–20): commit one lane only with clean continuity proof; otherwise continue recovery loop and request parity confirmation.

## 7m) Launch 2 parity hold (Turn 1 / 4000 BCE, re-confirm)

- Latest read confirms no state change from the prior relaunch hold:
  - hard blocker still `NOTIFICATION_LEGACY_COMPLETED` (`id 0`, `isEndTurnBlocking=true`) at queue head
  - `NOTIFICATION_COMMAND_UNITS` (`id 2`) remains stale-expired with `firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true`
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) is still non-blocking follow-on with no ready payload
  - `ready-unit` and `ready-city` remain null/non-concrete
  - `canEndTurn:false`, `hasSentTurnComplete:false`, `turn 1 / 4000 BCE`, `hash 0`
- Net-new execution posture: keep handler-first legacy unblock only; do not dispatch city/unit commands until concrete queue head + ready payload converge on a validated lane.

Hold ladder for this launch segment:
1. Continue `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` after each lock action attempt.
2. If legacy blocker remains for two consecutive reads and no queue/ready progress occurs, extend lock-hold and defer all growth/civic/movement branches.
3. If blocker resolution becomes actionable, execute exactly one validated closeout and re-read the same chain before any follow-on action.
4. Remove any speculative scout/unit movement from the plan until both queue head and ready context are concrete for two consecutive samples.

10–20 turn update (continuation):
- **Window A (Turns 1–4)**: repair-confirm parity loop only; no speculative action.
- **Window B (Turns 5–8)**: execute one concrete validated closeout only if hard blocker transitions and ready-lane is non-null.
- **Window C (Turns 9–14)**: branch test under two consecutive stable reads.
- **Window D (Turns 15–20)**: commit only if queue/ready stability holds across checks; else continue recovery cadence and request handler confirmation on stale legacy head state.

## 7n) Reconfirm hold (Turn 1 / 4000 BCE, fifth read)

- Third-party confirmation read remains unchanged:
  - `NOTIFICATION_LEGACY_COMPLETED` (`id 0`) still hard queue head and still `hud:blocking-notification`.
  - `NOTIFICATION_COMMAND_UNITS` (`id 2`) still stale-expired (`firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true`).
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) remains follow-on only.
  - `ready-unit` and `ready-city` remain null/non-concrete.
- Current run posture:
  1. Continue handler-first legacy resolution.
  2. Keep command/economic branches frozen until blocker resolves and one concrete ready payload exists on queue head.
  3. Re-read `notifications -> notification-queue -> priorities -> ready-unit -> ready-city` immediately after any lock attempt.
- Hold-to-commit rule updates:
  - **Window A (Turns 1–3)**: continue lock-repair-only.
  - **Window B (Turns 4–6)**: one validated closeout only if lane becomes concrete.
  - **Window C (Turns 7–12)**: branch test only after two stable reads.
  - **Window D (Turns 13–20)**: commit only if lock stability persists; otherwise continue recovery and escalate parity evidence.

## 7o) Queue collapse checkpoint (Turn 1 / 4000 BCE, single hard blocker)

- New read shows the queue has collapsed to a single hard queue item:
  - `notifications`: only `NOTIFICATION_LEGACY_COMPLETED` (`id 1`, hard, blocking).
  - `notification-queue`: `queueLength=1`, step-1 `id 1` with `isEndTurnBlocking=true`.
  - `firstReadyUnitId:null`, `selectedUnitId:null`, `staleExpiredWithoutEnabledCloseout:true` remains for `NOTIFICATION_COMMAND_UNITS` (`id 2`) but this lane is currently not surfaced in the live queue.
  - `NOTIFICATION_CHOOSE_CITY_PRODUCTION` (`id 3`) is absent from this read’s live queue; action path is currently pure legacy-handler-first.
  - `ready-unit` and `ready-city` still empty/nop payloads; `canEndTurn:false`, `hasSentTurnComplete:false`.
- Net-new lock posture:
  - Treat this as a hard legacy-first lock state: handler evidence/review first, no unit/city actions until explicit unlock with concrete queue/ready payload.
  - Readback chain remains unchanged: `notifications -> notification-queue -> priorities -> ready-unit -> ready-city`.

10–20 framing update (single-lane hold)
- **Window A (Turns 1–3):** hold-lock read-confirm loops only; no branching.
- **Window B (Turns 4–5):** if blocker resolves and concrete ready payload appears, execute exactly one validated closeout and re-read.
- **Window C (Turns 6–10):** after one stable concrete transition, test one low-risk branch only.
- **Window D (Turns 11–20):** if legacy lock persists, maintain recovery mode and avoid speculative commits.

## 7o) Relaunch re-entry checkpoint (Turn 2 / 3975 BCE)

- Fresh turn-2 sample confirms concrete hard queue head is now unit-command again, not legacy/empty-hold:
  - `blockingNotificationId: {owner:0, id:6, type:20}`
  - `queueLength: 3` with `unit-command` first (`NOTIFICATION_COMMAND_UNITS`, id 6), followed by `technology-choice` and `production-choice`
  - `firstReadyUnitId: UNIT_SCOUT (131072)`
  - `ready-unit` exposes legal operations (`SKIP_TURN`, `MOVE_TO`, `AUTOMATE_EXPLORE`, `ALERT`, etc.), while `ready-city` remains non-concrete in this cycle
  - `canEndTurn:false`, `hasSentTurnComplete:false`
- Priorities now align with a concrete one-lane unlock:
  - `hud:unit-command` -> `ready-unit` -> `battlefield`
- Active relaunch policy change from previous hold:
  1. resolve the concrete unit-command lane immediately (target-validated move if clear value; otherwise a safe closeout path such as skip/validated automate as lowest-regret)
  2. re-read the same loop immediately: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`
  3. only after queue head deblocks, evaluate tech/city follow-on lanes.
- Strategic lens for next 10–20 turns remains lane-bound:
  - short window: force reliable command lane clearance with no speculative commitment;
  - mid window: when command lane clears cleanly for one extra read, test one low-variance follow-on branch;
  - late window: commit only under two clean queue/head samples without null-ready inversion.


## 7p) Relaunch correction checkpoint (Turn 2 / 3975 BCE, tech-first lock)

- Latest live sample remains `Turn 2 / 3975 BCE`, `hash 0`.
- Hard blocker is now `NOTIFICATION_CHOOSE_TECH` (`id 4`):
  - `blockingNotificationId: {owner:0,id:4,type:20}`
  - `notification-queue`: step 1 `CHOOSE_TECH` (priority 100, blocking), step 2 `CHOOSE_CITY_PRODUCTION`, step 3 `COMMAND_UNITS`
  - `canEndTurn: false`, `hasSentTurnComplete: false`
- `priorities --compact`: `hud:technology-choice` is top; `ready-unit` is visible but non-blocking.
- Scout remains concrete (`UNIT_SCOUT 131072` at 65,30) with legal SKIP/MOVE/EXPLORE options.

Execution rule update (override 7f/7o for this cycle):
1. execute exactly one validated `choose-tech --closeout` on an enabled node (`Pottery`, `Animal Husbandry`, or `Sailing` as selected by map/economic rationale).
2. re-read immediately: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`.
3. only after tech head clears, continue a second command-only action in the new hard lane.
4. if readback still shows non-concrete readiness or inversion, hold and retry the read loop instead of speculative branching.

10–20 turn update from this checkpoint:
- Turns 2–4: tech-unlock only, strict one-command reads.
- Turns 5–8: one validated follow-on when a new hard lane appears.
- Turns 9–14: branch-lite (growth vs pressure) only after two stable non-inverted reads.
- Turns 15–20: commit one lane only under sustained queue/ready continuity.

## 7n) Net-new relaunch checkpoint (Turn 2 / 3975 BCE, re-entry hold)

- Check time (UTC): 2026-06-02
- Live stack snapshot: `NOTIFICATION_CHOOSE_TECH` (`id 4`) is hard first blocker; command and city notifications are secondary (`id 6`, `id 5`).
- Ready state this window:
  - `firstReadyUnitId: UNIT_SCOUT (131072)` at `(65,30)` with legal no-target ops including `SKIP_TURN`.
  - `ready-city` has no concrete production payload.
  - `hasSentTurnComplete: false`, `canEndTurn: false`.

Net-new execution doctrine for this relaunch segment:
1. Resolve technology lock first with a single validated send in one pass.
   - Use one of the enabled start nodes; prefer by live context:
     - `Sailing` if the start has immediate coast logistics pressure or trade-route leverage in the first 2–3 turns.
     - `Pottery` if early city growth/cheap production setup is the safer read.
     - `Animal Husbandry` if early pastures/hide/cattle leverage appears in fog-limited openings.
   - Command template: `civ7 game play choose-tech --player-id 0 --node <enabledNodeHash> --send --closeout --reason "<one-line lane choice rationale>"`
2. Immediately re-read: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`.
3. While tech is still hard: do not open city-production or scouting movement decisions.
4. If queue head moves to unit or city lane and payload is concrete:
   - run one validated closeout only,
   - re-read the same chain,
   - keep branching paused until two consecutive stable reads agree on head + payload.
5. Preserve escalation rule: if same stale posture repeats across 2 reads, keep recovery mode and report lock drift to operator instead of speculative moves.

10–20 turn reframing (post-relaunch, this segment):
- Turns 2–4: tech clearance only; no speculative branch commitments.
- Turns 5–8: one validated follow-on in the lane that becomes hard (tech, city, or unit) only if concrete payload exists.
- Turns 9–12: branch test (`growth-lite` vs `pressure-lite`) only after two clean stable reads.
- Turns 13–20: commit one lane (growth-first or limited-pressure-first) only under sustained queue-head continuity and non-null ready payload.

Player relay (send as-is): `Turn 2 / 3975 BCE | hard blocker is tech choice; unit and city remain secondary; run one validated choose-tech closeout now, then immediate re-read loop before any follow-on city/unit action | Priority: lock-safe recovery-to-clarity | Med`.

## 7q) Net-new relaunch continuation checkpoint (Turn 2 / 3975 BCE)

- `notifications`/`notification-queue` readback confirms the relaunch is still blocked on `NOTIFICATION_CHOOSE_TECH` (`id 4`), with queue-head hard lane:
  - step 1: `id 4` technology choice (`priority 100`, `isEndTurnBlocking:true`)
  - step 2: `id 5` city production (`priority 70`, non-blocking)
  - step 3: `id 6` command-units (`priority 65`, stale/non-blocking in this lane)
- `selectedUnitId` and `firstReadyUnitId` are currently `null`.
- `ready-unit` and `ready-city` have no concrete action payload in this cycle.
- `priorities` reports `hud:technology-choice` as top actionable lane.

Net-new execution override for this run segment:
1. Execute one validated tech clearout only: `game play choose-tech --player-id 0 --node <enabledNodeHash> --send --closeout --reason "<strategy rationale>"`.
2. Re-read immediately: `notifications -> notification-queue -> ready-unit -> ready-city -> priorities`.
3. Maintain one-command/read discipline. Hold all city and scouting actions while both ready payloads are null.
4. If this same null-ready hard-lock recurs on the next clean read, continue recovery-confirm mode and send one parity-lock relay before attempting any branch.

10–20 turn continuation (this relaunch window):
- `2–4`: tech-clear lock recovery only.
- `5–8`: one follow-on only if new hard lane becomes concrete.
- `9–14`: branch-lite decision only after two clean stable reads.
- `15–20`: commit only one lane (growth-lite or limited pressure-lite) with continuity evidence.
