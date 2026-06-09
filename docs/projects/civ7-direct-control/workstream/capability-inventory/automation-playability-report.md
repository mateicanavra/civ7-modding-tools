# Automation Playability Report

Date: 2026-05-31
Lane: Automation Playability Investigator

## Summary

An LLM or agent can already use `@civ7/direct-control` for useful developer
automation around a running Civ7 session: health, App UI status, restart,
Begin Game, post-Begin Tuner readiness, map/player summaries, and bounded raw
JavaScript probes. That is enough for map/studio iteration and for supervised
"observe and suggest" gameplay assistance.

Full autonomous play is not currently feasible as a repo-supported capability.
The direct-control package can execute arbitrary JavaScript in Civ7 scripting
states, and official resources show plausible gameplay action APIs, but the
repo has not proven enough stable read models, action schemas, validation
wrappers, turn/event synchronization, or safety policy to let an agent play
without frequent human supervision.

The practical target is a small set of safe wrappers: richer read snapshots,
explicit `canStart` validators, dry-run action planning, bounded autoplay, and
supervised validator-first command execution. Avoid broad "AI player" or "cheat
console" work until action schemas and state transitions are proven.

## Evidence Sources

- `packages/civ7-direct-control/src/index.ts`: canonical direct socket
  transport, state selection, raw command execution, App UI snapshot,
  restart/begin loop, and Tuner readiness canary.
- `packages/civ7-direct-control/README.md` and
  `packages/civ7-direct-control/test/direct-control.test.ts`: current public
  package contract and mocked protocol/health behavior.
- Discovery reports in
  `docs/projects/civ7-direct-control/workstream/discovery/`, especially
  `runtime-protocol-report.md`, `app-ui-api-inventory.md`,
  `tuner-api-inventory.md`, and `public-corpus-report.md`.
- `packages/civ7-types/index.d.ts`: current ambient runtime type coverage,
  mostly map-generation and lightweight gameplay globals.
- Official resources under `.civ7/outputs/resources`, especially:
  - `Base/modules/base-standard/ui/tuner-input/tuner-input.js`
  - `Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js`
  - `Base/modules/base-standard/ui/automation/automation-test-benchmark-ai.js`
  - `Base/modules/base-standard/ui/automation/automation-test-production.js`
  - `Base/modules/base-standard/ui/world-input/world-input.js`
  - `Base/modules/base-standard/ui/interface-modes/interface-mode-move-to.js`
  - `Base/modules/base-standard/ui/build-queue/model-build-queue.js`
  - `Base/modules/base-standard/ui/production-chooser/production-chooser-helpers.chunk.js`
  - `Base/modules/base-standard/ui-next/screens/pause-menu/pause-menu-bootstrap.js`
  - `Base/modules/base-standard/data/unit-operations.xml`
  - `Base/modules/base-standard/data/unit-commands.xml`
  - `Base/modules/base-standard/data/city-commands.xml`

Commands searched included targeted `rg` passes for `Autoplay`,
`Game.*Operations`, `sendRequest`, `canStart`, `WorldBuilder`, `MapUnits`,
`Cities`, `UnitOperationTypes`, `CityOperationTypes`, `PlayerOperationTypes`,
and turn/end-turn terminology. No live mutating gameplay actions were run for
this lane.

## Game-Reading Capability Needs

An agent that plays or gives useful turn advice needs a read model much richer
than the current `getCiv7AppUiSnapshot()`:

| Need | Why it matters | Current evidence |
|---|---|---|
| Session/readiness state | Know whether commands are legal and which scripting state to use. | Confirmed. `App UI` handles network/loading; `Tuner` becomes command-ready only after Begin Game. |
| Turn/player identity | Attribute decisions to the local player and current turn. | Confirmed minimal reads: `Game.turn`, `Game.getTurnDate()`, `GameContext.localPlayerID`, `Players.getAliveIds()`. |
| Map facts | Evaluate movement, settlement, resources, hazards, and visibility. | Plausible/partly confirmed via `GameplayMap` read methods and `packages/civ7-types`. |
| Fog/revealed state | Avoid acting on hidden information. | Plausible. `world-input.js` checks `GameplayMap.getRevealedState(...)`; not wrapped. |
| Units and available actions | Decide moves, attacks, fortify, found city, exploration, promotions. | Plausible. Official UI uses `Units`, `MapUnits`, `Game.UnitOperations.canStart`, and `Game.UnitCommands.canStart`. |
| Cities, queues, yields, plots | Choose production, purchases, expansion, tile development. | Plausible. Official UI uses `Cities`, `MapCities`, `Game.CityOperations`, `Game.CityCommands`, and build-queue models. |
| Diplomacy/war state | Avoid accidental declarations and select policy/diplomatic actions. | Plausible but high-risk. `world-input.js` checks war declaration before attacks; diplomacy UI uses `Game.PlayerOperations`. |
| Notifications/required choices | Detect blocking prompts: golden age, pantheon, policies, research, culture, advanced start, narrative choices. | Plausible. Official UI routes many choices through `PlayerOperationTypes`; not inventoried enough for wrappers. |
| Action result/execution feedback | Verify that a command changed state, failed, or advanced turn. | Mostly missing. Current package returns raw command output, not game-core operation effects. |

The current direct-control read layer is enough for operational automation and
small canaries, not enough for autonomous strategic play. The next read wrapper
should be a structured `getPlayableSnapshot()` that stays read-only and has a
strict size limit.

## Action Capability Needs

Gameplay control needs two levels of actions: ordinary game commands and
developer/test automation commands.

| Action family | Required for play? | Observed/plausible API | Current status |
|---|---:|---|---|
| Restart/begin | No, but essential for test loops. | `Network.restartGame()`, `UI.notifyUIReady()`. | Confirmed and wrapped. |
| Bounded autoplay | Useful for AI-vs-AI tests and smoke runs. | `Autoplay.setTurns`, `setReturnAsPlayer`, `setObserveAsPlayer`, `setActive`, `setPause`. | Plausible/observed in official automation; not safely wrapped. |
| Unit movement/combat | Yes. | `Game.UnitOperations.canStart/sendRequest` with `UNITOPERATION_MOVE_TO`, attack operations, skip/sleep/found city; `Game.UnitCommands.canStart/sendRequest`. | Plausible from official UI; not proven through direct-control. |
| City production/purchase | Yes. | `Game.CityOperations.canStart/sendRequest(..., CityOperationTypes.BUILD, args)`, `Game.CityCommands.PURCHASE`, build queue mutation args. | Plausible from official UI; not proven through direct-control. |
| Research/culture/government/policies | Yes for nontrivial play. | `Game.PlayerOperations.canStart/sendRequest` with tree and policy operation types. | Plausible only; schemas fragmented across UI resources. |
| Diplomacy | Yes, but high-risk. | `Game.PlayerOperations.sendRequest` for war, alliance, diplomacy actions. | Plausible; requires explicit product policy, validator evidence, and postcondition proof before productization. |
| End turn | Yes. | Likely App UI/engine/UI action path or unresolved game operation. | Not identified as a stable direct API in this lane. |
| Save/load/exit | Useful for sandboxing. | `Network.saveGame`, `Network.loadGame`, `engine.call("exitToMainMenu")`, `engine.call("exitToDesktop")`. | Plausible/high-risk; not gameplay wrappers. |
| WorldBuilder/tuner edits | No for fair play; useful for developer tools. | `WorldBuilder.MapPlots.*`, `MapConstructibles.*`, `Game.PlayerOperations` create/destroy element. | Plausible but explicitly developer/cheat surface. |

Action wrappers must be validator-first: expose `canStart`/legal-target reads
before any `sendRequest`, and treat every `sendRequest`, `Network.*` mutation,
`Autoplay.set*`, `WorldBuilder.*`, `MapConstructibles.*`, `engine.call`, and
`GameContext.send*Request` as mutating.

## Observed Direct-Control APIs

Confirmed by repo implementation and discovery reports:

- Transport: TCP tuner socket on port `4318`, `LSQ:` for state discovery,
  `CMD:<stateId>:<javascript>` for execution, little-endian framed messages.
- State roles:
  - `App UI`: command-ready, owns `Network`, `UI`, `GameContext`, `Game`,
    `Autoplay`, `Players`, and `GameplayMap` in observed runs.
  - `Tuner`: listed before Begin Game but command-ready only after Begin Game;
    post-Begin canary sees `Game`, `Autoplay`, `GameplayMap`, and `Players`;
    `Network` is undefined.
- Wrapped functions: `queryCiv7TunerStates`, `executeCiv7Command`,
  `executeCiv7AppUiCommand`, `executeCiv7TunerCommand`,
  `inspectCiv7RuntimeApi`, `getCiv7AppUiSnapshot`, `beginCiv7Game`,
  `restartCiv7Game`, `restartCiv7GameAndBegin`,
  `checkCiv7DirectControlHealth`, and `checkCiv7TunerHealth`.
- Read-only current snapshot: network/session status, autoplay status fields,
  turn/date/hash, UI loading state, local player/observer ids, alive players,
  map dimensions/seed.
- Restart/begin proof: `Network.restartGame()` returned `true`,
  `UI.notifyUIReady()` returned `null`, App UI reached `GameStarted`, and a
  post-Begin Tuner canary passed.

These are enough for "control Civ7 as a developer process" and "observe a
running session." They do not prove gameplay action safety.

## Plausible Gameplay APIs

Official resource usage makes the following surfaces plausible direct-control
targets, but they should remain research or explicit raw-command territory until
the repo verifies them in a disposable session:

- Unit control:
  - `Game.UnitOperations.canStart(unitID, UnitOperationTypes.MOVE_TO, args, false)`
  - `Game.UnitOperations.sendRequest(unitID, UnitOperationTypes.MOVE_TO, args)`
  - Attack variants such as `UNITOPERATION_RANGE_ATTACK`,
    `UNITOPERATION_AIR_ATTACK`, `UNITOPERATION_NAVAL_ATTACK`
  - Commands such as `UNITCOMMAND_WAKE`, `UNITCOMMAND_CANCEL`,
    `UNITCOMMAND_ADD_TO_ARMY`, `UNITCOMMAND_PROMOTE`
- City control:
  - `Game.CityOperations.canStart(city.id, CityOperationTypes.BUILD, args, false)`
  - `Game.CityOperations.sendRequest(city.id, CityOperationTypes.BUILD, args)`
  - `Game.CityCommands.canStart/sendRequest(..., CityCommandTypes.PURCHASE, args)`
  - Build queue mutations with `InsertMode`, `QueueSourceLocation`, and
    `QueueDestinationLocation`
- Player-level choices:
  - `Game.PlayerOperations.canStart/sendRequest` for golden ages, tech/culture
    nodes, policies, religions, diplomacy, resources, advanced start, and other
    notifications.
- Developer/tuner world edits:
  - `WorldBuilder.MapPlots.setFeature/setTerrain/setResource/setFertility/setOwnership/setBiome`
  - `MapConstructibles.addRoute/removeRoute/addDiscoveryType/addIndependentType`
  - `Game.PlayerOperations.sendRequest(localPlayerID, "CREATE_ELEMENT" | "DESTROY_ELEMENT", args)`

The official UI code is the best schema lead because native functions expose
weak signatures. A method name or enum row alone is not enough to call the API
safely.

## LLM Play Feasibility Tiers

| Tier | Feasibility | What an agent can do | Why |
|---|---|---|---|
| 0. Developer status assistant | Ready now | Check listener/states, restart/begin, summarize App UI snapshot, inspect selected roots. | Implemented and tested in `@civ7/direct-control`. |
| 1. Map/studio automation assistant | Ready/near-term | Restart mapgen loops, wait for Tuner readiness, collect map/player/map-summary canaries, run bounded raw reads. | Existing package plus prior reports already support this lane. |
| 2. Supervised gameplay advisor | Feasible with read wrappers | Read map, units, cities, queues, notifications, then propose actions for a human or a dry-run plan. | Needs richer read-only snapshots and legal-action queries, but avoids mutation risk. |
| 3. Supervised command executor | Feasible after wrappers | Execute one validated action at a time after `canStart` validation and post-action observation. | Requires action schemas and guardrails; direct-control transport can carry the commands. |
| 4. Bounded autoplay/test runner | Feasible after explicit wrapper | Start/stop AI autoplay for N turns, observe as player/observer, stop and report result. | Official automation uses `Autoplay.*`; direct-control has not wrapped or proved it. |
| 5. Autonomous playable agent | Not currently feasible | Play whole turns without supervision and proven safety policy. | Missing complete state model, end-turn path, action schemas, event feedback, strategy memory, failure recovery, and safety boundaries. |
| 6. Fair competitive AI replacement | Out of scope | Replace in-game AI or play multiplayer-like sessions. | Would require game-rule modeling and broad mutation rights well beyond this workstream. |

The useful near-term product is tier 2-3, not tier 5.

## Major Blockers

- **Incomplete read model.** Current snapshots do not include units, cities,
  yields, research/culture state, diplomacy, notifications, visibility, or legal
  action lists.
- **Unknown action schemas.** Official UI examples reveal argument shapes, but
  native function signatures are opaque and operation schemas are scattered.
- **Unproven end-turn control.** Unit skip/sleep operations exist, but a stable
  "finish all required choices and end turn" direct command was not established.
- **State/context mismatch.** `App UI` and `Tuner` differ; `Tuner` can be listed
  before it is command-ready; `Network` is App UI-only in observed evidence.
- **Mutation ambiguity.** `canStart` is likely safe, `sendRequest` is mutating,
  and many helpers have side effects despite benign names.
- **No transactional safety.** Direct-control can issue JavaScript but cannot
  automatically roll back a bad game-core operation unless save/load wrappers
  are added and proven.
- **Fog-of-war and cheating risk.** Runtime globals may reveal information a
  human player should not know. Reads must be scoped to local-player-visible
  state for fair play.
- **Prompt/notification complexity.** Civ7 turns can be blocked by modal
  choices, narrative events, age transitions, diplomacy, and production
  placement requirements.
- **Output size and latency.** Broad introspection can produce large JSON and
  timeouts; snapshots need bounded, curated fields.

## Recommended Safe Wrappers

Wrap now or next:

- `getCiv7PlayableStatus()`: extends App UI/Tuner health with selected state,
  local player, turn/date, map size, alive players, loading state, and autoplay
  status. Read-only.
- `getCiv7MapSummary()`: dimensions, seed, area/region counts if available,
  and optional sampled tile facts. Read-only and bounded.
- `getCiv7PlayerSummary(playerId = localPlayerID)`: alive/human flags, visible
  units/cities counts, capital location if safely readable. Read-only.
- `inspectCiv7Root(root, { state, maxKeys })`: a bounded form of the existing
  runtime API inspection to prevent huge root dumps.
- `getAutoplayStatus()` and `setAutoplay({ turns, observeAs, returnAs })` as
  separate read/write APIs. The setter should require explicit options, max turn
  caps, and a stop method.
- `canStartUnitOperation({ unitId, operation, args })`: read-only legal-action
  validator returning success, plots, and failure fields.
- `requestUnitOperation(...)`: mutating counterpart that requires a prior
  `canStart` success token or an explicit `force: true`.
- Equivalent `canStartCityOperation` / `requestCityOperation` and
  `canStartPlayerOperation` / `requestPlayerOperation` pairs.
- `planOnly` helpers that return exact JavaScript to be run, evidence source,
  expected mutation, and rollback recommendation without executing it.

Safety defaults:

- Read wrappers may retry; mutating wrappers must not automatically retry after
  partial success or socket reconnect.
- Mutating wrappers should return before/after snapshots or require the caller
  to provide a post-condition probe.
- Default to `App UI` for UI/network/gameplay operation calls and use `Tuner`
  only for post-Begin gameplay canaries or proven Tuner-local reads.
- Keep raw `executeCiv7*Command` available for expert debugging, but do not let
  higher-level agents synthesize arbitrary mutating JavaScript by default.

## Separate Map/Studio Automation From Play

Map/studio developer automation is already a good fit for direct-control:
restart the current game, begin, wait for map-generation log markers, inspect
map dimensions/seed/resources, and optionally drive bounded autoplay for smoke
tests. It can tolerate developer-only commands and generated-map state.

Playable AI control is a different product. It should respect local-player
visibility, avoid WorldBuilder/tuner edit surfaces, use game-core
`canStart/sendRequest` APIs instead of UI cheats, and require explicit product
policy, validator evidence, postcondition proof, and user-facing confirmation
where appropriate for high-impact choices such as war, diplomacy,
save/load/delete, account/network actions, and irreversible game state changes.

## Avoid / Research Later

Avoid for now:

- FireTuner clone UI, broad command browser, or general cheat console.
- Autonomous whole-turn play without supervision and proven safety policy.
- Default wrappers for `WorldBuilder.*`, `MapConstructibles.*`,
  `CREATE_ELEMENT`, `DESTROY_ELEMENT`, `Network.saveGame/loadGame/deleteGame`,
  multiplayer/account actions, QR/linking, chat/kick/invite, or desktop/menu
  exit calls.
- Hidden-information snapshots that dump global state without local-player
  visibility filters.
- Caller-local socket implementations outside `@civ7/direct-control`.

Research later:

- Stable end-turn command path.
- Minimal legal-action snapshot for units/cities/notifications.
- Schema extraction for operation args from official UI resources plus runtime
  `canStart` probes.
- Bounded save/load sandboxing for disposable AI experiments.
- Event subscription or polling strategy for turn begin/end, operation results,
  notifications, and autoplay completion.
- Whether the post-Begin `Tuner` state can execute the same gameplay operations
  as App UI, or should stay a read/canary surface only.

## Bottom Line

Direct-control is a credible control transport and already useful for developer
automation. It is not yet an AI gameplay API. Build a small read-first,
validator-first wrapper layer, prove one or two low-risk operations in a
disposable session, and keep full autonomous play out of scope until the repo
has a stable state model, legal-action model, end-turn path, and explicit safety
policy.
