# Play Agent Control Surface Reference

Status: working reference for Civ7 playable-agent control research.

This document is the normative reference for the current play-agent control
surface investigation. It captures evidence and rules discovered so far so that
future work does not collapse distinct paths into vague "unproven" buckets.

Current solution synthesis: `hotseat-solution.md`.

## Objective Frame

The product objective is not merely to watch native Civ7 AI play. The target
experience is: a human plays their own civilization in one Civ7 game while AI
agents control other civilizations in that same game, without requiring multiple
Civ clients.

Allowed architecture families:

- Hotseat, if available and if its local-player handoff can be used.
- Local multiplayer in a single Civ client, if it exposes enough slot/session
  primitives.
- Single-client multi-agent operation dispatch, if operation APIs accept
  commands for non-local players.
- A replicated hotseat layer, if official hotseat cannot be activated but its
  primitives can be emulated safely enough.
- Automation only as a supporting primitive, unless it unexpectedly provides
  all needed handoff/control behavior.

Disallowed assumption:

- Multiple Civ clients. Do not design around a human client plus separate agent
  Civ clients.

## Evidence Authority

Use these authority levels in order:

1. Installed official game resources under:
   `/Users/mateicanavra/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VII/CivilizationVII.app/Contents/Resources`
2. Live read-only runtime introspection through the existing direct-control CLI.
3. Official resources submodule under `.civ7/outputs/resources`.
4. Existing repo docs and wrappers as implementation evidence, not as new
   official API evidence.
5. FireTuner DLL metadata and panels as transport/tooling evidence.
6. Sibling mods only as reference evidence.

Important correction: `.civ7/outputs/resources` is not complete for this trail.
The installed game bundle contains official hotseat UI files that were missing
from the submodule snapshot, including `ui-next/screens/hotseat/hotseat-curtain.js`.

## Current Runtime Snapshot

Read-only App UI runtime observations from the live single-player session:

- `UI.isInGame() === true`
- `UI.supportsHotseat() === false`
- `Configuration.getGame().isAnyMultiplayer === false`
- `Configuration.getGame().isHotseat === false`
- `Configuration.getGame().humanPlayerIDs === [0]`
- `Configuration.getGame().aiPlayerIDs` includes the native AI players.
- `GameContext.localPlayerID === 0`
- `GameContext.localObserverID === 0`
- `Network.getServerType() === 0`
- `Network.getNumPlayers() === 1`
- `Network.hasCapability(NetworkCapabilityTypes.LANServerType) === true`
- `Network.hasCapability(NetworkCapabilityTypes.WirelessServerType) === false`
- `Autoplay.isActive === false`

This proves current state only. It does not prove that hotseat cannot be
activated from menu/setup, because `UI.supportsHotseat()` may be build/config
gated and the current session is not a hotseat setup screen.

## Automation And Autoplay

Official automation is an App UI test harness that can configure games,
convert slots, load/host, and start global native autoplay.

Important official files:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-test-support.chunk.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-test-benchmark-ai.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-test-benchmark-ui.js`
- `.civ7/outputs/resources/Base/modules/core/ui/context-manager/context-manager.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/action/panel-action.js`

Officially used Autoplay methods:

- `Autoplay.setTurns(...)`
- `Autoplay.setReturnAsPlayer(...)`
- `Autoplay.setObserveAsPlayer(...)`
- `Autoplay.setActive(...)`
- `Autoplay.setPause(...)`

Runtime-exposed but not found in official JS usage:

- `Autoplay.setAsLocalPlayer()`
- `Autoplay.setAsAI()`
- `Autoplay.setAsHuman()`

Reflection shows these as zero-argument native functions. They are not evidence
of a generic `setLocalPlayer(playerId)` or controller reassignment API. Existing
repo proof records that invoking `setAsLocalPlayer`, `setAsAI`, and `setAsHuman`
returned successfully but did not change observable App UI status fields.

Normative classification:

- Automation is viable for watching native AI play and for benchmark/smoke
  loops.
- Automation is not the primary product path unless a deeper proof shows it can
  combine with hotseat/local-player handoff without globally suppressing human
  UI.
- Autoplay is global. Normal UI suppresses input/popups while
  `Automation.isActive || Autoplay.isActive`.
- Do not treat Autoplay as deterministic external-agent control. It delegates
  decisions to native Civ7 AI.

## FireTuner And DLL Metadata

FireTuner is useful as a command transport and inspection tool, not as evidence
of a dedicated headless/autoplay API.

DLL metadata and panel evidence so far:

- `FireTuner2.exe` exposes generic tuner/console plumbing such as
  `FireTuner2.LuaConsole::RunConsoleCommand`,
  `FireTuner2.LuaStateManager::QueryLuaStates`,
  `FireTuner2.LuaStateManager::GetLuaStateByName`,
  `FireTuner2.CustomUI::LoadPanel`, and
  `FireTuner2.ActionBuilder::set_LuaStateID`.
- `Firaxis.Net.dll` exposes socket plumbing such as
  `Firaxis.Net.SocketConnection::OpenConnection`, `SendAsync`, and
  `ReceiveAsync`.
- Exact metadata/user-string search found one relevant user string in
  `FireTuner2.exe`: `Test Automation (WIP)`.
- `Atf.Core.dll` contains an unrelated DOM `Observer` type.
- No `Autoplay` or AI-autoplay API symbol was found in FireTuner DLL metadata.
- `/Users/mateicanavra/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/Comms/Modifiers.ltp`
  is a tuner-state modifier inspection panel. It has no autoplay terms and no
  actions.

Normative classification:

- FireTuner can execute code against exposed Lua/JS states, depending on the
  state and transport already connected.
- FireTuner DLLs do not define a dedicated headless-game or autoplay controller.
- The autoplay surface remains game-side `Autoplay.*`; FireTuner/direct-control
  are command transports.

## Hotseat

Hotseat is more concrete than earlier reports suggested.

Installed official hotseat evidence:

- `.../Resources/Base/modules/core/ui/shell/mp-landing/mp-landing-new.js`
  routes Hotseat through `MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_HOTSEAT, true)`.
- `.../Resources/Base/modules/base-standard/ui-next/screens/hotseat/hotseat-curtain.js`
  renders the turn-handoff curtain, reads the current local player through
  `useLocalPlayerId()`, switches to `INTERFACEMODE_HOTSEAT`, and exposes
  "Save Game" and "Start Turn".
- `.../Resources/Base/modules/core/ui-next/utilities/game-core-utilities.js`
  implements `useLocalPlayerId()` by listening to `LocalPlayerChanged` and
  updating from `data.player`.
- `.../Resources/Base/modules/base-standard/ui/mp-ingame-mgr/mp-ingame-mgr.js`
  imports the curtain, listens to `LocalPlayerChanged`, comments that this is
  likely "handing off game to another player (hotseat)", and attaches the
  curtain in hotseat games.
- `.../Resources/Base/modules/core/ui/shell/mp-staging/model-mp-staging-new.js`
  has `SLOT_ACTION_TYPE_HUMAN` mapped to `SlotStatus.SS_TAKEN` only for hotseat
  slot changes.

Observed hotseat model:

- Hotseat setup is integrated into multiplayer shell/staging.
- Hotseat has a distinct `isHotseat` mode and `SaveTypes.HOTSEAT`.
- Hotseat hides normal ready/kick/network affordances.
- Hotseat local-player handoff appears engine-managed. UI reacts to
  `LocalPlayerChanged`; JS does not expose a direct setter for
  `GameContext.localPlayerID`.
- The curtain gates human visibility/turn start after local player changes.

Normative classification:

- Hotseat is a leading candidate for single-client multi-agent control.
- The key proof is not "does hotseat exist"; installed official resources show
  that it does.
- The key proof is whether hotseat can be activated in this installed build and
  whether agent turns can be completed without requiring the human to manually
  operate each agent slot UI.
- If hotseat works, the most plausible architecture is: configure human player
  plus agent-controlled hotseat human slots; on each `LocalPlayerChanged`, route
  control to either the human UI or the agent operation dispatcher.

Open hotseat questions:

- Why does live `UI.supportsHotseat()` return false despite installed hotseat
  resources?
- Is hotseat disabled by title config, build flag, local platform, or current
  screen/session state?
- Can `ServerType.SERVER_TYPE_HOTSEAT` be hosted/launched through App UI from a
  safe setup context?
- During hotseat gameplay, does `GameContext.localPlayerID` become each human
  slot in turn?
- Can the curtain be bypassed or programmatically dismissed for agent turns
  without corrupting UI state?
- Can all agent operations be issued through normal operation APIs while the
  agent's hotseat player is current local player?

## Local Multiplayer

Local/LAN multiplayer is official and exposed through App UI.

Important official files:

- `.civ7/outputs/resources/Base/modules/core/ui/utilities/utilities-network-constants.chunk.js`
- `.../Resources/Base/modules/core/ui/shell/mp-landing/mp-landing-new.js`
- `.../Resources/Base/modules/core/ui/shell/mp-shell-logic/mp-shell-logic.js`
- `.../Resources/Base/modules/core/ui/shell/mp-create-game/mp-create-game.js`
- `.../Resources/Base/modules/core/ui/shell/mp-staging/model-mp-staging-new.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-test-multiplayer-host.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-test-multiplayer-join.js`

Runtime-exposed App UI `Network` methods include:

- `hostMultiplayerGame`
- `joinMultiplayerGame`
- `joinMultiplayerRoom`
- `initGameList`
- `refreshGameList`
- `getGameListEntry`
- `toggleLocalPlayerStartReady`
- `startGame`
- `startMultiplayerGame`
- `requestSlotSwap`
- `prepareConfigurationForHosting`
- `hostGame`

Normative classification:

- LAN/local multiplayer is a viable setup/control trail.
- It is strongest if multiple Civ clients are allowed, but they are not allowed
  for this product constraint.
- Single-client local multiplayer still matters because its setup/staging code
  owns slot status, human/computer status, ready/start behavior, and some
  hotseat behavior.
- Do not design a solution that depends on joining multiple clients.

Open local multiplayer questions:

- Can one local App UI session create multiple human-capable slots without
  hotseat?
- Does normal local multiplayer ever allow one client to control more than
  `GameContext.localPlayerID`?
- Is `Network.requestSlotSwap(playerID)` useful after start, or only a pregame
  lobby request?
- Does `Network.startGame()` differ from `Network.startMultiplayerGame()` in
  hotseat/LAN setup?

## Single-Client Multi-Agent Operation Control

This is the critical bridge: can the existing direct-control operation wrappers
issue operations for a player that is not currently the human's local player?

Runtime shape:

- `Game.PlayerOperations` exposes native `canStart(...)` and `sendRequest(...)`.
- Many official UI operations call operation APIs with `GameContext.localPlayerID`.
- Current live game has player 0 human/local and many native AI participants.

Normative classification:

- If operations for non-local players are accepted, a single-client
  multi-agent controller may be possible without hotseat.
- If operations require the current local player, hotseat becomes the cleanest
  way to make each agent civ local in turn.
- If operations require current local player and hotseat is disabled, we must
  replicate only enough hotseat behavior or find a native local-player switch.

Open operation-control questions:

- For each operation family already wrapped by direct-control, does `canStart`
  accept a non-local player id?
- Does `sendRequest(nonLocalPlayerId, ...)` reject, silently ignore, or execute?
- Are rejections caused by "not local", "not human", "turn inactive", or normal
  validation?
- Can AI/computer slots be converted to human/hotseat slots safely before game
  start?

Do not test these against the active live game without explicit approval,
because operation requests mutate game state.

## Preferred Search Strategy

Treat this as a rugged solution space. Maintain multiple paths until a proof
eliminates them.

Workstreams:

1. Hotseat activation and handoff.
   Owner question: can installed official hotseat be enabled/launched and used
   as the local-player switch for agent turns?
2. Local multiplayer setup.
   Owner question: can a single App UI client create the needed player-slot
   shape without multiple Civ clients?
3. Single-client operation authority.
   Owner question: can direct-control operations target non-local players, or
   do they require local-player identity?
4. Automation composition.
   Owner question: can automation/autoplay support setup, waiting, observer
   camera, or native AI fallback without taking over the human UI?
5. Solution synthesis.
   Owner question: which one or two solution architectures satisfy the product
   constraint with the least fragile set of assumptions?

## Viability Ladder

Use this ladder when ranking solutions:

1. Works with installed official hotseat and existing operation wrappers.
2. Works with installed local multiplayer/hotseat shell plus minimal new
   controller glue.
3. Works with single-client operation authority for non-local players.
4. Works by replicating hotseat UX/state with explicit, testable invariants.
5. Works only through Autoplay/native AI.
6. Requires multiple Civ clients.

Only ranks 1 through 4 satisfy the product intent. Rank 5 is useful for
watching native AI and smoke tests. Rank 6 is out of scope.

## Immediate Proof Targets

Do not run mutating tests in the active game. Use a disposable setup only after
explicit approval.

Read-only targets:

- Confirm all installed hotseat files and current resource/submodule drift.
- Inspect `UI.supportsHotseat()` implementation or binary/title-config clues.
- Inspect setup parameters for hotseat support flags.
- Inspect direct-control operation wrapper assumptions about local player ids.
- Inspect whether existing CLI can launch or reset into setup/menu contexts.

Disposable mutating targets after approval:

- Attempt hotseat setup through official App UI path.
- Verify `LocalPlayerChanged` sequence and curtain behavior.
- Verify agent slot `GameContext.localPlayerID` during hotseat turns.
- Verify one safe no-op or reversible operation request for a non-local player.
- Verify whether automation can advance only native AI waiting periods without
  suppressing the human turn UI.

## Current Best Hypotheses

Best primary hypothesis:

- Hotseat plus operation dispatch is the most promising single-client product
  path. It matches the required one-client constraint and official UI already
  models local-player handoff.

Best fallback hypothesis:

- If hotseat cannot be activated, use local multiplayer/hotseat setup insights
  and operation authority checks to build a replicated handoff layer that only
  needs to switch command ownership, not the full UI.

Weak hypothesis:

- Autoplay plus hotseat can handle everything. This is weak until a proof shows
  global autoplay can avoid suppressing the human UI and can be scoped to the
  intended players.

Rejected for current product:

- Multi-client LAN with one Civ client per agent. It is likely clean
  architecturally, but violates the explicit constraint.
