# Agent Action Surface Contract

Date: 2026-05-31
Lane: Mutating action-surface
Status: contract-ready; no live mutation performed in this lane

## Scope And Evidence

This report turns the prior `wrap-carefully` candidates into first-class
wrapper contracts for `@civ7/direct-control`. Proof planning and contracts are
implementation work for this workstream, not optional deferrals. This lane does
not authorize automatic replay of mutations and did not mutate a live Civ7
session.

Evidence labels used below:

- `source`: repo source/docs inspected in this lane.
- `official-resource`: official mirrored Civ7 resource evidence.
- `recorded-live-proof`: prior workstream live probe evidence already recorded
  in project docs.
- `fresh-live-proof`: live proof collected during this lane. None collected.
- `inference`: design conclusion from source/resource/live evidence.
- `unresolved`: evidence is insufficient for a claim.

Primary inputs:

- `source`: `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`,
  `automation-playability-report.md`, `owner-runtime-probes.md`,
  `app-ui-surface-report.md`, `tuner-surface-report.md`.
- `source`: `packages/civ7-direct-control/src/index.ts` and package tests show
  current transport, state selection, App UI snapshot, restart/begin, Tuner
  readiness, and raw command execution.
- `official-resource`: `world-input.js`, `unit-actions.js`,
  `build-queue/model-build-queue.js`, `production-chooser` resources,
  `tuner-input.js`, automation scripts, `panel-action.js`, pause-menu resources,
  and operation enum usage.
- `recorded-live-proof`: prior probes confirmed App UI restart/begin,
  post-Begin Tuner readiness, root availability, operation routers, operation
  enum globals, `Autoplay`, `Visibility`, `GameplayMap`, `Players`, `Units`,
  `Cities`, `GameInfo`, and `Database`.

## System Frame

- `source` / `recorded-live-proof`: App UI owns lifecycle/session controls:
  `Network.restartGame()`, `UI.notifyUIReady()`, loading state,
  `GameContext`, `Autoplay`, network/account/session surfaces, and pause-menu
  flows.
- `source` / `recorded-live-proof`: Tuner owns post-Begin gameplay/map reads and
  the safer state role for map/player/unit/city snapshots and operation-router
  probing.
- `official-resource` / `inference`: official UI uses a validator-first pattern:
  `Game.<Domain>Operations.canStart(...)` or
  `Game.<Domain>Commands.canStart(...)`, then `sendRequest(...)` only when
  `Success` is true.
- `inference`: the direct-control API should model three different products,
  not collapse them: lifecycle automation, supervised gameplay execution, and
  disposable-session debug/cheat actions.

Dominant feedback loops:

- Reinforcing risk loop: broader raw command exposure encourages agents to
  synthesize more JS, which increases unvalidated mutation, which increases
  session-corruption risk.
- Balancing safety loop: state role selection, validator-first wrappers,
  explicit approval, postcondition proof, and no replay reduce blast radius
  while still enabling useful supervised control.

## Universal Mutation Rules

These rules apply to every mutating wrapper.

1. State role is explicit. Lifecycle wrappers use App UI. Gameplay validators
   and operation sends default to Tuner after post-Begin readiness. App UI may
   be used only when the required global is App UI-only.
2. Read wrappers may reconnect and retry. Mutating wrappers must not
   automatically replay after timeout, disconnect, response parse failure, or
   unknown postcondition.
3. A mutating wrapper accepts an `approval` object or validation token and
   returns the exact operation it will issue before execution in dry-run mode.
4. `force` is not a normal bypass. If present at all, it must require
   `approval.mode = "explicit-force"`, carry a reason, mark the result
   `high-risk`, and still run pre/post snapshots.
5. A `canStart` failure is a successful wrapper result, not a transport error.
   The request wrapper must not call `sendRequest` when validation fails unless
   the explicit-force path is used.
6. Postcondition proof is mandatory: each request wrapper returns before/after
   snapshots or an unresolved postcondition with no retry.
7. Multiplayer/account/network/save/load/delete/exit surfaces are rejected from
   this action surface unless a later owner decision creates a separate product
   contract.

## Wrapper Contracts

### Restart And Begin Loop

Contract: `restartCiv7Game()`, `beginCiv7Game()`,
`restartCiv7GameAndBegin({ waitForTuner })`

- State role: App UI.
- Evidence: `source` current package constants and wrappers;
  `official-resource` pause menu calls `Network.restartGame()` and load flow
  uses `UI.notifyUIReady()`; `recorded-live-proof` restart returned `true`,
  begin returned `null`, App UI reached `GameStarted`, and Tuner canary passed.
- Validation sequence: discover states, select App UI, read App UI snapshot,
  call restart only when App UI is command-ready, wait for loading states
  `WaitingForUIReady` or `WaitingToStart`, call begin once, then wait for
  `GameStarted`; optionally run Tuner health canary.
- Postcondition proof: final App UI snapshot must show `GameStarted` and
  `inGame`; optional Tuner health must show `ready: true`.
- Failure behavior: timeout or disconnect leaves the result unresolved. The
  implementation may reconnect for read polling, but must not issue a second
  restart or begin after a mutation unless the caller starts a new explicit
  request.
- Risk: medium. It destroys current transient session progress but is a core
  developer loop.

### Autoplay Start, Stop, Status

Contracts: `getAutoplayStatus()`,
`configureAutoplay({ turns, observeAsPlayer, returnAsPlayer })`,
`startAutoplay(approval)`, `stopAutoplay(approval)`.

- State role: App UI first; Tuner allowed only after fresh wrapper proof shows
  identical behavior in the target game phase.
- Evidence: `source` App UI snapshot already reads autoplay fields;
  `official-resource` automation scripts call `Autoplay.setTurns`,
  `setReturnAsPlayer`, `setObserveAsPlayer`, `setActive(true)`,
  `setPause(...)`, and stop with `setActive(false)`;
  `recorded-live-proof` runtime probes observed `Autoplay` in App UI and Tuner.
- Validation sequence: read status; require `turns` integer within package cap;
  resolve observer/return player from `PlayerIds` where possible; reject
  multiplayer by default; dry-run returns planned setter sequence.
- Postcondition proof: after configure/start/stop, read status again and verify
  `turns`, `observeAsPlayer`, `returnAsPlayer`, `isActive`, and pause state.
  Completion proof should later use `AutoplayEnded`, `TurnBegin`, or `TurnEnd`
  signals if an event bridge becomes part of the package.
- Failure behavior: if start status is ambiguous, do not call stop
  automatically unless the original command completed and the caller requested
  `stopOnPostconditionFailure`. Never reissue `setActive(true)` on reconnect.
- Risk: medium for bounded AI smoke tests; high if turns are uncapped or used
  in a non-disposable player session.

### Reveal And Explore Map

Contracts: `getVisibilitySummary(playerId)`,
`revealAllPlots({ playerId }, approval)`,
`requestUnitExplore({ unitId }, approval)` after validator proof.

- State role: Tuner for visibility reads; App UI or Tuner for
  `Visibility.revealAllPlots` only after fresh proof identifies the live owner;
  Tuner for unit explore operations.
- Evidence: `source` capability reports observed `Visibility` methods and
  recommend visibility summaries; `official-resource` UI uses
  `GameplayMap.getRevealedState(...)` and `getRevealedStates(...)` to filter
  hidden information; `recorded-live-proof` owner probes observed `Visibility`
  as mutating and `Players.LiveOpsStats.numPlotsRevealed` as a progress read.
- Validation sequence for reveal: require disposable-session approval, reject
  multiplayer/account sessions, capture before visibility counts, confirm
  target player is valid, then call the proven reveal method once.
- Validation sequence for explore: call `canStartUnitOperation` or
  `canStartUnitCommand` for the specific explore operation/command; require
  local-player ownership; execute only if validation succeeds.
- Postcondition proof: reveal requires increased revealed/visible counts or an
  explicit already-revealed result. Explore requires unit status/location or
  automation state change plus visibility/progress read.
- Failure behavior: reveal failure is high-risk unresolved; do not retry.
  Explore failure returns validator/request result and after snapshot.
- Risk: reveal is high cheating/debug risk; explore is medium gameplay risk
  when validator-backed and human-approved.

### End Turn And Turn Complete

Contracts: `getTurnCompletionStatus()`,
`requestTurnComplete({ policy }, approval)`,
`requestTurnUnready(approval)` where supported.

- State role: App UI.
- Evidence: `official-resource` `panel-action.js` checks
  `GameContext.hasSentTurnComplete()`, calls `canEndTurn()`, activates
  blocking notifications, then calls `GameContext.sendTurnComplete()`. It also
  exposes `sendUnreadyTurn()` and maps `force-end-turn` directly to
  `sendEndTurn()`. `source` App UI reports list `GameContext.sendTurnComplete`
  as plausible and unproven.
- Validation sequence: read local player, player turn-active state,
  `GameContext.hasSentTurnComplete()`, notification blocker
  `Game.Notifications.getEndTurnBlockingType(...)`, remaining-move indicators
  where available, and multiplayer state. Default policy must refuse blockers.
- Postcondition proof: after request, read `hasSentTurnComplete`, active player
  turn state, turn number/date, and any blocker status. Success is either
  `hasSentTurnComplete = true` or observed turn advancement.
- Failure behavior: if blockers exist, return `blocked` with blocker metadata
  and do not call `sendTurnComplete`. Do not expose a force-end-turn helper in
  the first-class action surface.
- Risk: medium for normal single-player turn completion; high for force-end
  behavior, multiplayer, or modal-choice bypass.
- Status: `unresolved` until fresh live proof exercises the read-only status and
  one approved disposable turn-complete path.

### Unit Validators And Approved Requests

Contracts: `canStartUnitOperation(input)`, `canStartUnitCommand(input)`,
`requestUnitOperation(input, approval)`, `requestUnitCommand(input, approval)`.

- State role: Tuner.
- Evidence: `official-resource` `unit-actions.js` iterates visible
  `GameInfo.UnitOperations` and `GameInfo.UnitCommands`, calls
  `Game.UnitOperations.canStart(...)` and `Game.UnitCommands.canStart(...)`,
  and calls `sendRequest(...)` after successful validation. `world-input.js`
  uses the same pattern for move, ranged/naval/air attack, swap, overrun, and
  move-to. `recorded-live-proof` Tuner probes observed `Game.UnitOperations`,
  `Game.UnitCommands`, and enum globals.
- Validation sequence: resolve unit id; confirm unit exists; confirm owner is
  the local player unless approval marks debug control; normalize operation or
  command against observed enum/catalog; build args from a reviewed schema;
  call `canStart(..., false)`; optionally call exclusion/target query with the
  official boolean flag only as a read.
- Postcondition proof: unit snapshot before/after: location, activity/status,
  health/damage, movement, operation state, sight/reachable plots as relevant.
- Failure behavior: validation failure returns `valid: false` with failure
  reasons and no mutation. Request output with unknown postcondition is
  `executed: unknown` and cannot be replayed automatically.
- Risk: low for validator reads; medium for skip/sleep/fortify/wake/automate
  explore; high for attacks, delete, upgrade, create, damage, or direct unit
  mutation.

### City Validators And Approved Requests

Contracts: `canStartCityOperation(input)`, `canStartCityCommand(input)`,
`requestCityOperation(input, approval)`, `requestCityCommand(input, approval)`.

- State role: Tuner.
- Evidence: `official-resource` build queue and production chooser resources
  use `Game.CityOperations.canStart(city.id, CityOperationTypes.BUILD, args,
  false)` and `Game.CityCommands.canStart(..., CityCommandTypes.PURCHASE, ...)`
  before `sendRequest`. `recorded-live-proof` Tuner probes observed city
  operation and command routers.
- Validation sequence: resolve city id; confirm ownership/local player; inspect
  city/build queue before state; normalize operation/command and args from a
  reviewed schema; run `canStart`; require approval for request.
- Postcondition proof: city/build queue before/after, production item,
  purchase/gold/resource deltas where available, city name or growth mode when
  relevant.
- Failure behavior: no send on failed validator; no generic build/purchase
  wrapper without schema and postcondition.
- Risk: low for validators; medium for production queue reorder/cancel in a
  disposable or approved session; high for purchases, city naming, growth mode,
  WMD/ranged attack, expansion, or any irreversible city state.

### Player Validators And Approved Requests

Contracts: `canStartPlayerOperation(input)`,
`requestPlayerOperation(input, approval)`.

- State role: Tuner for validator/request, with App UI local-player context
  only when required.
- Evidence: `official-resource` tree/culture/government/diplomacy screens use
  `Game.PlayerOperations.canStart(...)` before `sendRequest(...)`; tuner input
  uses `Game.PlayerOperations.sendRequest(..., "CREATE_ELEMENT" |
  "DESTROY_ELEMENT", args)` for debug creation/deletion. `recorded-live-proof`
  Tuner probes observed player operations and operation enum examples.
- Validation sequence: resolve local player; reject account/network/multiplayer
  and diplomacy/war by default; normalize operation against enum/catalog and
  allowlist; run `canStart`; require approval for request.
- Postcondition proof: player summary before/after, specific progression node,
  resource assignment, government/policy state, or diplomacy state as relevant.
- Failure behavior: no generic `PlayerOperations.sendRequest` product wrapper.
  Unknown schema means validator-only or raw expert command, not first-class
  request execution.
- Risk: low for validators; medium for tech/culture target selection after
  schema proof; high for diplomacy/war, resource assignment, government/policy,
  create/destroy element, extended game, or live-ops/account-adjacent choices.

## Allowed Selected Actions

Allowed as first implementation targets after their proof recipes pass:

| Action | Class | Rationale |
|---|---|---|
| Autoplay configure/start/stop with turn cap | medium | `official-resource` automation uses the setters; bounded and observable. |
| Unit skip/sleep/fortify/wake | medium | Common unit action family; validator-first and postcondition-friendly. |
| Unit automate explore | medium | Satisfies explore-map need without direct reveal cheat; requires local-player unit and validator proof. |
| Unit move to validated reachable plot | medium | Official UI validates movement and can provide target plots; requires visible/local-player filters. |
| City build queue reorder/cancel | medium/high | Official build queue validates and sends; only allowed in approved/disposable sessions first. |
| Player tech/culture target selection | medium/high | Official UI uses player operation validators; allowed only after schema proof and approval. |
| Reveal all plots | high debug | Allowed only as explicit disposable-session debug wrapper, not gameplay assistance. |
| Turn complete | medium/high | Allowed only when blocker check proves no required choice; no force-end wrapper. |

## Rejected Raw Actions

These remain raw expert/debug commands or rejected product surface:

- Generic `Game.*Operations.sendRequest` or `Game.*Commands.sendRequest`.
- Generic `Game.PlayerOperations.sendRequest`, especially
  `CREATE_ELEMENT` / `DESTROY_ELEMENT`.
- Direct `Units.create`, `Units.setLocation`, `Units.setDamage`,
  `Units.restoreMovement`, `Units.changeExperience`, `Units.setActivity`.
- `TerrainBuilder.*`, `ResourceBuilder.setResourceType`,
  `FertilityBuilder.setFertilityType`, `AreaBuilder.recalculateAreas`.
- `WorldBuilder.MapPlots.*`, `MapConstructibles.add*` / `remove*`, unless a
  separate disposable map-edit contract is accepted.
- `Players.grantYield`, grant great work/culture slot, force unlock/reveal
  progression helpers, and other grant/cheat helpers.
- `Database.query` mutation or unconstrained SQL.
- `Configuration.edit*`, UI option writes, reload/refresh UI commands.
- `Network.saveGame`, `loadGame`, `deleteGame`, `syncGame`, multiplayer,
  account, invite, chat, kick, URL, legal, QR/linking, SSO/live-event flows.
- `engine.call("exitToMainMenu")`, `exitToDesktop`, and implicit
  save/reload/exit flows.

## Live Proof Recipes

General proof harness for every recipe:

1. Use a disposable single-player session unless the recipe is read-only.
2. Record App UI snapshot and Tuner health first.
3. Record the exact command sequence in dry-run form.
4. Execute at most one mutation per proof case.
5. Capture before/after snapshots and relevant logs/events.
6. If transport fails after mutation, mark postcondition `unresolved`; do not
   replay.

Autoplay proof:

- Before: `getAutoplayStatus`, turn/date, local/observer player, multiplayer
  flag.
- Execute: configure `turns = 1`, set return/observe, start.
- After: status active, then either `TurnEnd`/turn change or explicit stop.
- Stop proof: call stop once and verify `isActive = false`.

Reveal proof:

- Before: `getVisibilitySummary(playerId)` and a bounded hidden/visible count.
- Execute only with disposable debug approval.
- After: visible/revealed count changes or already-revealed classification.
- Reject proof if reveal affects an unexpected player or persists across
  restart in a non-disposable way.

Turn-complete proof:

- Before: local player, turn active, `hasSentTurnComplete`, blocker type, turn
  number/date.
- Execute only when blocker type is `NONE` and no force policy is requested.
- After: `hasSentTurnComplete = true` or turn advances. If blocker appears,
  wrapper returns blocked and does not send.

Unit operation proof:

- Before: unit summary for one local unit, legal target/operation read.
- Execute: skip/sleep/fortify or automate explore first; movement second only
  to a validator-approved reachable plot.
- After: activity/status/location changed as expected; no hidden-info target.

City operation proof:

- Before: city summary and build queue.
- Execute: validator-only first. Request proof starts with a reversible or
  disposable queue mutation.
- After: queue order/progress/item reflects the request or failure is reported.

Player operation proof:

- Before: player summary and operation-specific state.
- Execute: validator-only for all broad operations. First request proof should
  target tech/culture selection only in a disposable session.
- After: specific node/target state changes and no diplomacy/account/network
  side effects.

## Adversarial Review

- `force-end-turn` is explicitly not a first-class wrapper because official UI
  maps it directly to `sendEndTurn()` without normal blocker handling.
- `canStart(..., true)` appears in official UI as an exclusion/target read path;
  wrappers must not treat that boolean as authorization to bypass validation.
- Operation enums are not schemas. Enum availability alone cannot authorize
  request wrappers.
- Raw `sendRequest` can corrupt a non-disposable session through war,
  diplomacy, deletes, city production, hidden choices, or debug create/destroy.
- `Network.save/load/delete/sync` and menu/exit calls can create implicit
  persistence or reload effects; they are outside this lane.
- Account, SSO, live-event, invite, chat, kick, URL, and multiplayer surfaces
  are rejected even if exposed by App UI.
- Direct map/world edits and grant helpers are developer cheat surfaces. They
  must not be reachable by gameplay agents through the safe action surface.
- Fresh live proof is still required before implementation claims any new
  mutating wrapper as runtime-proven. Current lane evidence is source,
  official-resource, recorded-live-proof, and inference only.
