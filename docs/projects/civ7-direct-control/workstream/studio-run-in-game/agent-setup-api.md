# Setup API Investigator Report

## Scope And Evidence

- [source-proven] Objective: identify the smallest `@civ7/direct-control`
  App UI/setup contract needed to prepare and start one single-player Civ7 game
  from shell/main menu or an existing game, using a selected map row, map
  size/options, and seed.
- [source-proven] Foreground boundary: direct-control owns setup/start wrappers;
  Studio must not send raw setup JavaScript or raw command strings for setup.
- [source-proven] Live command policy for this report: only read-only probes were
  run. No setup parameter mutation, shell exit, restart, start, deploy, or reload
  mutation was performed.
- [source-proven] Official resources under `.civ7/outputs/resources` are source
  evidence for Civ UI behavior, not repo API authority.
- [live-proven] Current read-only probes reached Civ7 at `127.0.0.1:4318`,
  `App UI` state id `65535`, and `Tuner` state id `1`.

## Findings

- [source-proven] Civ setup parameters already expose the minimum fields needed
  for this workstream: `Map`, `MapSize`, `MapRandomSeed`, and `GameRandomSeed`.
  Official setup rows map `Map` to `Map.Script`, `MapSize` to `Map.SizeType`,
  `MapRandomSeed` to `Map.RandomSeed`, and `GameRandomSeed` to
  `Game.RandomSeed`.
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:61`
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:62`
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:63`
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:75`
- [source-proven] Setup domain values for maps and map sizes come from frontend
  `Maps` and `MapSizes` queries. This means the wrapper should validate requested
  map scripts and map sizes against the active App UI setup domain before start,
  not against static source files alone.
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:208`
  - `.civ7/outputs/resources/Base/modules/core/config/SetupParameters.xml:209`
- [source-proven] Official single-player setup UI uses `GameSetup` as the
  mutation API: it reads `GameSetup.getGameParameters()`, watches
  `GameSetup.currentRevision`, finds parameters by id, and writes with
  `GameSetup.setGameParameterValue(...)`.
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:86`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:129`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:187`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:191`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:273`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/game-setup-panel.js:298`
- [source-proven] Official single-player UI starts through
  `CreateGameModel.startGame()`, which dispatches `StartCampaignEvent` and calls
  `engine.call("startGame")`.
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/create-game-model.js:154`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-panels/create-game-model.js:158`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-game/create-game-sp.js:153`
  - `.civ7/outputs/resources/Base/modules/core/ui/shell/create-game/create-game-sp.js:159`
- [source-proven] Official automation handles "start from an existing game" by
  checking `UI.isInShell()`, calling `engine.call("exitToMainMenu")` when not in
  shell, resetting game configuration in shell, waiting for `GameSetup` revision
  change, and then calling `Network.hostGame(...)`.
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:81`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:93`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:96`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:122`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:226`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/automation/automation-base-play-game.chunk.js:229`
- [source-proven] Current `@civ7/direct-control` App UI defaults do not include
  `Configuration` or `GameSetup` in the default App UI root list or capability
  App UI roots. They do include `Network`, `UI`, `Database`, and read surfaces.
  This means setup wrappers need explicit roots/types rather than piggybacking
  on the current read catalog.
  - `packages/civ7-direct-control/src/index.ts:27`
  - `packages/civ7-direct-control/src/index.ts:45`
- [source-proven] Current direct-control lifecycle wrappers cover restart and
  Begin Game for an already configured game, not setup parameter application.
  `restartCiv7GameAndBegin` runs `Network.restartGame()`, polls App UI loading
  state, calls `UI.notifyUIReady()` when begin-ready, and can wait for Tuner.
  - `packages/civ7-direct-control/src/index.ts:13`
  - `packages/civ7-direct-control/src/index.ts:14`
  - `packages/civ7-direct-control/src/index.ts:698`
  - `packages/civ7-direct-control/src/index.ts:1088`
  - `packages/civ7-direct-control/src/index.ts:1098`
  - `packages/civ7-direct-control/src/index.ts:1127`
  - `packages/civ7-direct-control/src/index.ts:1132`
  - `packages/civ7-direct-control/src/index.ts:1162`
- [source-proven] Current App UI snapshot already exposes enough phase/readiness
  data to guard setup/start: `UI.isInGame()`, `UI.isInShell()`,
  `UI.isInLoading()`, loading state/name, begin readiness, `skipStartButton`,
  and map seed/dimensions via `GameplayMap`.
  - `packages/civ7-direct-control/src/index.ts:188`
  - `packages/civ7-direct-control/src/index.ts:208`
  - `packages/civ7-direct-control/src/index.ts:230`
  - `packages/civ7-direct-control/src/index.ts:2088`
  - `packages/civ7-direct-control/src/index.ts:2111`
  - `packages/civ7-direct-control/src/index.ts:2124`
  - `packages/civ7-direct-control/src/index.ts:2143`
- [live-proven] Read-only App UI root inspection found `Configuration`,
  `GameSetup`, `Network`, `UI`, `Automation`, and `Database` available in the
  running `App UI` state. `GameSetup` exposed `currentRevision`,
  `getGameParameters`, `findGameParameter`, `setGameParameterValue`,
  `getParameterChanges`, `loadCreateGameSettings`, and
  `resetSavedCreateGameSettings`.
- [live-proven] Read-only setup snapshot in an existing game found:
  `UI.isInShell() = false`, `UI.isInGame() = true`, `GameSetup.currentRevision =
  19`, selected map `{swooper-maps}/maps/swooper-earthlike.js`, `MapSize =
  MAPSIZE_STANDARD`, `GameRandomSeed = -1317491366`, and `MapRandomSeed =
  -1317491365`.
- [live-proven] Read-only runtime snapshot found `GameplayMap.getRandomSeed() =
  -1317491365`, `GameplayMap.getGridWidth() = 84`, `GameplayMap.getGridHeight()
  = 54`, and `GameplayMap.getMapSize() = -2055278946`.
- [live-proven] The running game's `MapRandomSeed` matched
  `GameplayMap.getRandomSeed()`. `GameRandomSeed` did not match; it was one less
  in this session. The wrapper must therefore treat the Studio map seed as
  `MapRandomSeed`, not as `GameRandomSeed`.
- [live-proven] Read-only frontend DB query in App UI found the Swooper map row
  in the active config database:
  `{ Domain: "StandardMaps", File:
  "{swooper-maps}/maps/swooper-earthlike.js", Name:
  "LOC_MAP_SWOOPER_EARTHLIKE_NAME", SortIndex: 501 }`.
- [live-proven] Read-only `GameSetup.findGameParameter("Map")` domain values
  included four Swooper rows, including
  `{swooper-maps}/maps/swooper-earthlike.js`.
- [live-proven] Current `getCiv7GameInfoRows({ table: "Maps", filter:
  File=... })` returned zero rows, while direct `GameInfo.Maps.$data` in Tuner
  contained map-size rows keyed by `MapSizeType`. The existing `GameInfo` wrapper
  is not sufficient to prove frontend map-script row existence for setup.
- [unresolved] Mutating setup parameter writes are source-proven but not
  live-proven in this phase because the prompt only authorized read-only probes.
- [unresolved] Starting a newly prepared single-player game from shell through
  either `engine.call("startGame")` or `Network.hostGame(...)` is source-proven
  as an official candidate path, but not live-proven as a direct-control wrapper
  contract in this phase.
- [unresolved] Exiting from a running game to shell through
  `engine.call("exitToMainMenu")` is source-proven in official automation, but
  not live-proven here.
- [unresolved] Reload semantics for newly generated/deployed map rows are not
  proven. The current session can see deployed Swooper rows, but this does not
  prove hot deploy, shell reload, `UI.reloadUI()`, or full process restart
  behavior for changed rows.

## Smallest Proposed Wrapper Contracts

### `getCiv7SetupSnapshot`

- [inferred] Add a read-only App UI wrapper:

```ts
type Civ7SetupSnapshot = Readonly<{
  phase: "shell" | "running-game" | "loading" | "begin-ready" | "unavailable";
  ui: Pick<Civ7AppUiSnapshot["ui"], "inShell" | "inGame" | "inLoading" | "loadingState" | "loadingStateName" | "canBeginGame">;
  setup: {
    revision: number;
    parameters: ReadonlyArray<{
      id: "Map" | "MapSize" | "MapRandomSeed" | "GameRandomSeed";
      exists: boolean;
      hidden?: boolean;
      invalidReason?: number;
      value?: string | number | boolean;
      domainType?: number;
      possibleValues?: ReadonlyArray<unknown>;
    }>;
  };
  selectedMapRow?: {
    source: "GameSetup.domain" | "Database.config.Maps";
    file: string;
    domain?: string;
    name?: string;
    description?: string;
    sortIndex?: number;
  };
}>;
```

- [inferred] This wrapper should use `GameSetup.findGameParameter(...)` for
  parameter state and a bounded `Database.query("config", ...)` or equivalent
  package-owned query for frontend `Maps` row verification.
- [rejected] Do not use `getCiv7GameInfoRows("Maps")` as the setup map row proof
  until the package distinguishes frontend `Maps` from gameplay map-size data.

### `prepareCiv7SinglePlayerSetup`

- [inferred] Add a proof-bounded App UI mutation wrapper:

```ts
type Civ7SinglePlayerSetupInput = Readonly<{
  mapScript: string;        // e.g. "{swooper-maps}/maps/studio-current.js"
  mapSize: string;          // e.g. "MAPSIZE_STANDARD"
  seed: number;             // writes MapRandomSeed; verified after start
  gameSeed?: number;        // optional non-map RNG seed
  options?: Readonly<Record<string, string | number | boolean>>;
  requireShell?: true;
}>;

async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions,
): Promise<Civ7PreparedSetupResult>;
```

- [inferred] Minimum writes are `GameSetup.setGameParameterValue("Map",
  mapScript)`, `GameSetup.setGameParameterValue("MapSize", mapSize)`, and
  `GameSetup.setGameParameterValue("MapRandomSeed", seed)`.
- [inferred] `GameRandomSeed` should be optional and explicit. If the caller does
  not provide it, the wrapper should either leave Civ's value alone or use a
  documented deterministic companion policy after live proof. It must not treat
  `GameRandomSeed` as the value verified by `GameplayMap.getRandomSeed()`.
- [inferred] The result should include before/after setup snapshots,
  `GameSetup.currentRevision` before/after, normalized selected values, domain
  validation results, and selected map row proof.
- [unresolved] Exact post-write stabilization condition must be live-proven. The
  official UI reacts to `GameSetup.currentRevision`, and automation waits for a
  revision change before host/start, but direct-control's minimum wait rule still
  needs mutating proof.

### `startPreparedCiv7SinglePlayerGame`

- [inferred] Add a proof-bounded App UI mutation wrapper after the start
  primitive is live-proven:

```ts
async function startPreparedCiv7SinglePlayerGame(
  input: Readonly<{
    expected: Pick<Civ7SinglePlayerSetupInput, "mapScript" | "mapSize" | "seed">;
    waitForTuner?: boolean;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  }>,
  options: Civ7DirectControlOptions,
): Promise<Civ7SinglePlayerStartResult>;
```

- [inferred] The wrapper should first call `getCiv7SetupSnapshot()` and reject if
  the selected setup values do not match `expected`.
- [unresolved] The wrapper must choose one live-proven start primitive. Source
  candidates are `engine.call("startGame")` from the SP UI and
  `Network.hostGame(serverType)` from automation. The package should not ship a
  dual-path fallback.
- [inferred] The result must include final App UI loading state, Tuner readiness,
  `GameplayMap.getRandomSeed()`, map dimensions, map size hash/value, and
  request id for joining with Studio/Swooper proof.

### `runCiv7SinglePlayerFromSetup`

- [inferred] Add one high-level orchestration wrapper only after the lower-level
  wrappers are live-proven:

```ts
async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerSetupInput & Readonly<{
    fromRunningGame?: "reject" | "exit-to-shell";
    waitForTuner?: boolean;
  }>,
  options: Civ7DirectControlOptions,
): Promise<Civ7SinglePlayerRunResult>;
```

- [inferred] This wrapper should be the Studio-facing API. Studio supplies
  structured fields only; direct-control constructs the App UI commands.
- [rejected] Studio must not call `civ7 game exec` with raw
  `GameSetup.setGameParameterValue(...)`, `engine.call("startGame")`, or
  `Network.hostGame(...)`.

## Phase Guards And Errors

- [source-proven] Existing App UI snapshot can classify `shell`,
  `running-game`, `loading`, and `begin-ready` phases through `UI.isInShell()`,
  `UI.isInGame()`, `UI.isInLoading()`, and `UI.getGameLoadingState()`.
- [inferred] `prepareCiv7SinglePlayerSetup` should require shell by default.
  Error: `setup-phase-invalid` with observed phase and snapshot.
- [inferred] `runCiv7SinglePlayerFromSetup` may accept
  `fromRunningGame: "exit-to-shell"` only as an explicit destructive recovery
  mode with disposable-session boundaries. Error: `setup-requires-shell` when
  running-game exit is not permitted by the operation contract.
- [inferred] If `GameSetup`, `Configuration`, `Network`, `UI`, or `Database` is
  missing from App UI, error `setup-api-unavailable`.
- [inferred] If `Map`, `MapSize`, or `MapRandomSeed` is missing, hidden,
  invalid, or outside the domain, error `setup-parameter-invalid`.
- [inferred] If the requested map script is not visible in `GameSetup` domain or
  frontend config `Maps`, error `setup-map-row-missing`.
- [inferred] If `GameSetup.currentRevision` does not advance or selected values
  do not read back after a write, error `setup-apply-timeout` or
  `setup-readback-mismatch`.
- [inferred] If start reaches `GameStarted` but `GameplayMap.getRandomSeed()`
  differs from requested `seed`, error `setup-seed-mismatch`.
- [inferred] If post-start map dimensions do not match selected map size/source
  expectations, error `setup-map-size-mismatch`.
- [inferred] If Swooper log/config hash proof is absent or stale, error
  `setup-config-proof-missing`; do not silently downgrade to source proof.

## Live Proof Sequence Needed Before Implementation

- [live-proven] Read-only setup API inventory is already proven for this running
  session:
  `bun run dev:cli -- game inspect --state "App UI" --roots Configuration,GameSetup,Network,UI,Automation,Database --json --timeout-ms 5000`.
- [live-proven] Read-only current setup/runtime relation is already proven for
  this running session:
  `GameSetup.Map = {swooper-maps}/maps/swooper-earthlike.js`,
  `GameSetup.MapSize = MAPSIZE_STANDARD`, `GameSetup.MapRandomSeed =
  -1317491365`, and `GameplayMap.getRandomSeed() = -1317491365`.
- [unresolved] Mutating proof step 1: from a disposable running game, call the
  future direct-control shell guard and verify App UI reaches shell/main menu
  without relying on Studio raw JS.
- [unresolved] Mutating proof step 2: from shell, snapshot `GameSetup`
  parameters and selected map domain before writes.
- [unresolved] Mutating proof step 3: apply `Map`, `MapSize`, and
  `MapRandomSeed` through the direct-control wrapper; verify revision advance
  and exact readback.
- [unresolved] Mutating proof step 4: verify selected frontend map row exists
  after the defined reload boundary, using package-owned row proof.
- [unresolved] Mutating proof step 5: start the game through one live-proven
  direct-control start primitive; record loading-state observations.
- [unresolved] Mutating proof step 6: after start, verify
  `GameplayMap.getRandomSeed() === requested seed`, dimensions match selected
  map size/options, and `GameplayMap.getMapSize()` is consistent with the map
  size hash.
- [unresolved] Mutating proof step 7: verify fresh Swooper `Scripting.log`
  markers include the Studio run id/config id/config hash for the requested
  map row and seed.

## Reload-Semantics Questions

- [unresolved] Does `bun run --cwd mods/mod-swooper-maps deploy` make new
  frontend `Maps` rows visible to an already running Civ7 App UI session?
- [unresolved] If not hot-visible, does returning to shell/main menu reload the
  frontend config DB enough to see the row?
- [unresolved] If shell is insufficient, does `UI.reloadUI()` reload the map
  domain without a full Civ7 process restart? `UI.reloadUI` exists in the live
  App UI root inspection, but it was not called.
- [unresolved] If neither shell nor UI reload works, what is the smallest honest
  process restart boundary Studio can expose for Run in Game?
- [unresolved] Does `GameSetup.loadCreateGameSettings()` or
  `GameSetup.resetSavedCreateGameSettings()` affect row/domain visibility, or
  only saved setup values?
- [unresolved] Does `Configuration.editGame().refreshEnabledMods()` matter for
  single-player map row visibility, or only additional content toggling?

## P1 Risks

- [P1][unresolved] Shipping a mutating setup/start wrapper from source-only
  evidence would violate the proof policy. Setup writes and start must be
  live-proven before Studio depends on them.
- [P1][unresolved] If direct control cannot start a newly prepared game from
  shell, the workstream hits the reframe trigger. Existing restart/begin only
  restarts the current configured game.
- [P1][unresolved] If changed/generated map rows require a full Civ7 process
  restart and Studio hides that boundary, Run in Game would appear exact while
  using stale data.
- [P1][rejected] A Studio implementation that emits raw setup JavaScript through
  `civ7 game exec` or `executeCiv7Command` would bypass the required
  direct-control ownership boundary.
- [P1][unresolved] The current `GameInfo.Maps` wrapper does not prove frontend
  map-script rows. Treating it as row proof could accept a wrong or stale map.

## P2 Risks

- [P2][inferred] Writing only `GameRandomSeed` would fail the required
  `GameplayMap.getRandomSeed()` proof; live evidence shows runtime map seed
  matches `MapRandomSeed`.
- [P2][inferred] Setting `Map` before validating active domain values could
  produce a silent fallback or invalid setup value if a deployed row is stale.
- [P2][inferred] Accepting arbitrary option records without a whitelist could
  accidentally clone the full Civ setup UI. Keep options bounded to known setup
  parameter ids needed for Swooper Run in Game.
- [P2][inferred] Reusing current `restartCiv7GameAndBegin` from Studio after
  deploy can restart a prior setup and look successful unless setup readback,
  seed, map row, and config hash are tied to the request.
- [P2][inferred] Shell exit from an existing game is destructive to that game
  session. It needs explicit destructive-action and disposable-session language
  in the wrapper result and Studio UI.

## Concrete Next Steps

1. [inferred] Add `Configuration` and `GameSetup` to direct-control setup
   inspection roots/types, but keep raw command construction private to
   `@civ7/direct-control`.
2. [inferred] Implement `getCiv7SetupSnapshot` first, including setup parameter
   readback and frontend map row proof.
3. [inferred] Repair or supplement map row proof so setup verification can query
   frontend `Maps` rows distinctly from gameplay `GameInfo.Maps` map-size rows.
4. [inferred] Run a mutating disposable proof for one start primitive from
   shell. Choose exactly one internal primitive after proof:
   `engine.call("startGame")` or `Network.hostGame(...)`.
5. [inferred] Run a mutating disposable proof for from-running-game shell return
   if Studio needs that path in v1; otherwise reject running-game phase for the
   first wrapper slice.
6. [inferred] Add `prepareCiv7SinglePlayerSetup` with bounded parameter ids,
   revision/readback verification, postcondition/no-repeat evidence, and no
   Studio raw JS surface.
7. [inferred] Add `startPreparedCiv7SinglePlayerGame` with expected setup
   validation before start and seed/dimensions validation after start.
8. [inferred] Only then expose a Studio Run in Game endpoint that accepts
   structured `mapScript`, `mapSize`, `seed`, and bounded options, calls
   direct-control wrappers, and records proof outputs.
