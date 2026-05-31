# App UI API Inventory

Date: 2026-05-31
State: `65535` / `App UI`
Proof label: `tuner-exercised` for read-only direct socket commands and
`in-game proof` for the restart/begin loop verified against fresh
`Scripting.log` output.

## State Identity

`LSQ:` returned `App UI` and `Tuner`; `App UI` was selected by state name/role
and resolved to id `65535` in this runtime. Treat the id as session data.

## Probe Method

Commands were sent through `@civ7/direct-control` source imports using
`CMD:65535:<js>`. Most probes were read-only: root enumeration, method metadata
via `Object.getOwnPropertyNames`, and selected getter/status calls. A later live
proof intentionally exercised `Network.restartGame()` followed by
`UI.notifyUIReady()` when App UI reached the native Begin Game loading state.

Representative commands:

- `inspectCiv7RuntimeApi({ state: "App UI", roots: [...] })`
- read-only snapshot IIFE covering `Network`, `Autoplay`, `Game`, `UI`,
  `GameContext`, `Players`, and `GameplayMap`
- built CLI proof after implementation:
  - `node packages/cli/bin/run.js game health --json`
  - `node packages/cli/bin/run.js game exec '1+1' --state 'App UI' --json`
  - `node packages/cli/bin/run.js game inspect --app-ui-snapshot --json`

The built CLI probes returned `ok: true` for health, `1+1 -> 2`, and the App UI
snapshot described below.

## Root Availability Matrix

| Root | Type | Own keys | Prototype/API surface |
|---|---:|---:|---:|
| `Network` | `object` | 6 | 130+ methods |
| `Autoplay` | `object` | 6 | 8 mutating/config methods |
| `Game` | `object` | 26 | 6 methods |
| `UI` | `object` | 5 | 100+ methods |
| `GameContext` | `object` | 2 | 9 methods |
| `PlayerIds` | `object` | 3 | Object prototype only |
| `Players` | `object` | 39 | 28 methods |
| `GameplayMap` | `object` | 0 | 70+ map query methods |
| `GameInfo` | `object` | 0 | Object prototype only |
| `Engine`, `Tuner`, `Debug`, `MapConfiguration` | `undefined` | 0 | unavailable |

## Network API

Own properties observed: `lastMismatchVersion`, `maxNetMPPlayers`,
`joinCodeMaxLength`, `networkVersion`, `unitTestModeEnabled`, `isInSession`.

Useful read-only methods observed: `getNumPlayers`, `getJoinCode`,
`getHostPlayerId`, `getNicknameById`, `isPlayerStartReady`,
`isPlayerModReady`, `isPlayerConnected`, `hasAgeTransitionSave`,
`getSaveConflictFileName`, `isAtMaxSaveCount`,
`isMultiplayerServiceAvailable`, `isConnectedToMultiplayerService`,
`isConnectedToNetwork`, `isWirelessEnabled`, `hasCommunicationsPrivilege`,
`hasAccessUGCPrivilege`, `canBrowseMPGames`, `supportsSSO`,
`isConnectedToSSO`, `isAuthenticated`, `cloudSavesEnabled`,
`isForcedOfflineFromEmptyResponse`, `isChildAccount`, `isTeenAccount`,
`isFullAccountLinked`, `isAccountLinked`, `isAccountComplete`,
`isMetagamingAvailable`, `isBanned`, `getBanInfo`, `getBlockedAccessInfo`,
`areLegalDocsCompleted`, `getServerType`, `getSecondsSinceSessionCreation`,
`getChatTargets`, `getChatHistory`, `getUnreadChatLength`, `hasCapability`,
`isPlayerMuted`, `getLocalCrossPlay`, `hasCrossPlayPrivilege`,
`hasCrossPlatformSaveSupport`, `getLocalHostingPlatform`,
`getLocal1PPlayerName`, `getPlayerHostingPlatform`, `isPlayerHotJoining`,
`isWaitingForValidHeartbeat`, `getRedeemCodeResult`,
`getRedeemCodeResponse`, `canDisablePromotions`, `getNumWantPausePlayers`,
and `getWantPausePlayerName`.

Mutating/side-effect candidates observed: `hostMultiplayerGame`,
`joinMultiplayerGame`, `joinMultiplayerRoom`, `matchMakeMultiplayerGame`,
`startMultiplayerGame`, `leaveMultiplayerGame`, `resetNetworkCommunication`,
`toggleLocalPlayerStartReady`, `startTransition`, `startGame`,
`restartGame`, `loadAgeTransition`, `loadGame`, `saveGame`, `syncGame`,
`resolveConflict`, `deleteGame`, `hostGame`, `connectToMultiplayerService`,
`disconnectFromMultiplayerService`, `triggerNetworkCheck`,
`sendPremiumCheckRequest`, `clearPremiumError`, QR/status requests, kick/chat
actions, account/linking actions, URL openers, invite actions, login/logout,
redeem, and multiplayer pause toggles.

Read-only sample outputs:

- `Network.isInSession` -> `true`
- `Network.getNumPlayers()` -> `1`
- `Network.getHostPlayerId()` -> `0`
- `Network.isConnectedToNetwork()` -> `true`
- `Network.isAuthenticated()` -> `false`
- `Network.isLoggedIn()` -> `true`

## Autoplay API

Own properties observed: `isPausedOrPending`, `isPaused`, `observeAsPlayer`,
`returnAsPlayer`, `turns`, `isActive`.

Prototype methods observed: `setActive`, `setTurns`, `setReturnAsPlayer`,
`setObserveAsPlayer`, `setAsLocalPlayer`, `setPause`, `setAsAI`,
`setAsHuman`.

Read-only sample output:

```json
{
  "isActive": false,
  "turns": -1,
  "isPaused": false,
  "isPausedOrPending": false,
  "observeAsPlayer": -1,
  "returnAsPlayer": -1
}
```

All observed methods are state-changing candidates. Package helpers should keep
status reads separate from explicit autoplay control calls.

## Other Useful Roots

- `Game`: `turn` -> `1`, `maxTurns` -> `0`, `getTurnDate()` -> `4000 BCE`,
  `getHash()` -> `0`.
- `UI`: `isInGame()` -> `true`, `isInShell()` -> `false`,
  `isInLoading()` -> `false`, `getGameLoadingState()` -> `8` after Begin Game
  (`6` / `WaitingForUIReady` immediately before `UI.notifyUIReady()`),
  `supportsMultiplayer()` -> `true`, `isClipboardAvailable()` -> `true`.
- `GameContext`: `localPlayerID` -> `0`, `localObserverID` -> `0`,
  `hasRequestedPause()` -> `false`.
- `Players`: `maxPlayers` -> `64`, `getAliveIds()` ->
  `[0,1,2,3,4,5,6,7]`, `getNumAliveHumans()` -> `1`.
- `GameplayMap`: `getGridWidth()` -> `84`, `getGridHeight()` -> `54`,
  `getPlotCount()` -> `4536`, `getRandomSeed()` -> `-1237550729`.

## Probe Errors And Boundaries

- `Tuner` can be listed in `LSQ:` before it is command-ready. After
  `UI.notifyUIReady()` moved App UI from `WaitingForUIReady` to `GameStarted`,
  the Tuner canary returned `Game`, `Autoplay`, `GameplayMap`, and `Players`
  successfully. `Network` remained undefined in Tuner.
- App UI broad inspection produced a very large JSON response; terminal output
  was truncated, but the key roots, method categories, and read-only sample
  outputs above were captured before truncation.
- No `Autoplay.setActive`, save/load, multiplayer, account, QR, chat, kick,
  URL-open, or arbitrary UI mutation commands were run during this App UI
  inventory lane.

## Safe Helper Candidates

- `restartCiv7Game()` via `Network.restartGame()` on `App UI` only.
- `restartCiv7GameAndBegin()` via `Network.restartGame()` followed by
  `UI.notifyUIReady()` when App UI reports `WaitingForUIReady` or
  `WaitingToStart`.
- `getCiv7AppUiSnapshot()` for read-only session/autoplay/game/UI/player/map
  status.
- `inspectCiv7RuntimeApi({ state: { role: "app-ui" } })` with bounded roots.
- Future explicit autoplay helpers should be named as mutating operations and
  never called from health/readiness polling.

## Unsafe/Mutating Candidates

Anything named `set*`, `start*`, `load*`, `save*`, `delete*`, `join*`, `host*`,
`kick*`, `send*`, `open*`, `toggle*`, `try*`, `attempt*`, `accept*`,
`decline*`, `redeem*`, or `restartGame` should be treated as mutating unless a
separate runtime proof demonstrates otherwise.

## Gaps/Risks

- Native functions report `length: 0` and `[native code]`; arity is not reliable
  for required arguments.
- This inventory is one live session and one map state; state surfaces can
  differ at main menu, loading, age transition, multiplayer, or after restart.
- Broad root enumeration can be large; package helpers should use curated roots.
- Restart/begin/readiness loops should use a persistent direct-control session
  with bounded reconnects, not repeated one-shot sockets.
