# Direct-Control Surface Implementation Closure

Date: 2026-05-31

## Implemented Boundary

`@civ7/direct-control` is now the canonical control boundary for developer,
Studio, player-debug, and LLM-agent access to a running Civ7 process. CLI and
Studio call package wrappers; neither owns tuner-socket framing, state
selection, reconnect polling, restart/begin semantics, or operation request
contracts.

State roles remain explicit:

- `App UI`: lifecycle, network/session reads, restart, Begin Game, Autoplay,
  turn-completion status/actions, and Studio runtime endpoints.
- `Tuner`: post-Begin gameplay reads, map/visibility/player/unit/city summaries,
  `GameInfo` rows, capability inspection, reveal, and validator-backed gameplay
  operations.

## Public Read Surface

Read wrappers:

- `getCiv7PlayableStatus()`: App UI snapshot plus Tuner readiness.
- `getCiv7MapSummary()`: dimensions, plot count, seed, turn/date, optional
  area/region ids.
- `getCiv7PlotSnapshot()`: one plot with allowlisted fields and player-scoped
  hidden-info filtering.
- `getCiv7MapGrid()`: explicit bounds or locations, hard plot caps, omitted
  count, and the same field allowlist as plot snapshots.
- `getCiv7PlayerSummary()`, `getCiv7UnitSummary()`, `getCiv7CitySummary()`:
  bounded actor summaries from Tuner roots.
- `getCiv7VisibilitySummary()`: player visibility counts and optional bounded
  visibility grid.
- `getCiv7GameInfoRows()`: targeted `GameInfo` rows with identifier validation,
  limit/offset, lookup/filter, and no arbitrary SQL.
- `inspectCiv7Root()`: bounded root/method inspection with caps and truncation
  metadata.

## Public Action Surface

Mutating wrappers require explicit approval objects or CLI reason flags. The
package does not automatically replay mutations after transport failure.

- Restart/begin: `restartCiv7Game()`, `beginCiv7Game()`,
  `restartCiv7GameAndBegin({ waitForTuner: true })`.
- Autoplay: `getCiv7AutoplayStatus()`, `configureCiv7Autoplay()`,
  `startCiv7Autoplay()`, `stopCiv7Autoplay()`.
- Visibility debug: `revealCiv7MapForPlayer()` requires
  `disposableSession: true`.
- Turn complete: `getCiv7TurnCompletionStatus()`, `sendCiv7TurnComplete()`,
  `sendCiv7TurnUnready()`.
- Validator-backed requests:
  - Unit: `canStartCiv7UnitOperation`, `requestCiv7UnitOperation`,
    `canStartCiv7UnitCommand`, `requestCiv7UnitCommand`.
  - City: `canStartCiv7CityOperation`, `requestCiv7CityOperation`,
    `canStartCiv7CityCommand`, `requestCiv7CityCommand`.
  - Player: `canStartCiv7PlayerOperation`, `requestCiv7PlayerOperation`.

## Catalog And Types

The package exports TypeBox schemas:

- `Civ7CapabilityCatalogEntrySchema`
- `Civ7CapabilityCatalogSchema`

Catalog functions:

- `createStaticCiv7CapabilityCatalog()`
- `generateCiv7CapabilityCatalog()`
- `loadCiv7OfficialResourceCapabilities()`

The catalog records role, kind, risk, provenance, confidence, owner, root,
method, and wrapper metadata. Static entries describe package-owned wrappers;
runtime generation adds live root/method entries from App UI and Tuner.

## CLI And Studio Surface

CLI commands added or extended:

- `game status`
- `game map`
- `game visibility`
- `game gameinfo`
- `game autoplay`
- `game operation`
- `game catalog`
- existing `game health`, `game inspect`, `game exec`, and `game restart`
  remain package-backed.

Studio Vite endpoints added:

- `GET /api/civ7/status`
- `GET /api/civ7/map-summary`
- `GET /api/civ7/gameinfo?table=<Table>&limit=<N>`

## LLM-Agent Playability Model

An LLM agent can now read enough state to observe a game and make bounded
decisions: playable status, map facts, visibility, actors, `GameInfo`, and
operation validators. It can act only through validator-backed request wrappers
or explicitly approved debug/lifecycle wrappers.

Known limits:

- hidden-info filtering relies on player-scoped visibility data and should be
  used whenever an agent is acting as a player;
- arbitrary raw SQL, force-end-turn, direct unit mutation, world-builder edits,
  and generic `sendRequest` surfaces are not first-class player/LLM actions;
- city/player operation schemas are exposed through generic validator-backed
  wrappers, but domain-specific production/tech/culture helpers should be added
  only when their args and postconditions are typed.

## Fresh Runtime Proof

Non-mutating live proof on 2026-05-31 against `127.0.0.1:4318`:

- `civ7 game status --json`: App UI `GameStarted`, Tuner ready, turn `122`,
  map `84x54`, date `2790 BCE`.
- `civ7 game map --summary --json`: Tuner map summary returned `84x54`,
  `4536` plots, seed/hash values, and area/region ids.
- `civ7 game gameinfo Resources --limit 1 --json`: Tuner `GameInfo.Resources`
  returned `RESOURCE_COTTON` and total `55`.
- `civ7 game map --plot 0,0 --player-id 0 --fields terrain,resource,visibility --json`:
  Tuner plot wrapper returned index `0`, terrain `4`, resource `-1`,
  revealed state `1`, visible `false`.

Autoplay start may intentionally omit `turns`; user runtime evidence confirmed
plain `Autoplay.setActive(true)` is valid. The wrapper keeps explicit approval
and status proof, but does not force a turn cap. Start now clears prior pause
by default and sets inferred `returnAsPlayer`/`observeAsPlayer` when App UI can
identify a concrete player.

Stop must not clear pause. Runtime proof showed `Autoplay.isActive === false`
can appear while the game is still resolving queued autoplay turns. The durable
stop contract is: set return/observe player, keep `Autoplay.setPause(true)`,
call `Autoplay.setActive(false)`, wait for player restoration, and require a
stable turn number before reporting `verified: true`.

Live autoplay proof on 2026-05-31 against the user's fresh running game:

- Start command: `civ7 game autoplay --action start --reason "..."`
  returned `verified: true`, `turns: -1`, `isPaused: false`, and inferred
  `observeAsPlayer: 0`, `returnAsPlayer: 0`.
- Stop command: `civ7 game autoplay --action stop --reason "..."`
  returned `verified: true`; the command output still showed active
  immediately, the wrapper waited through one in-flight autoplay turn, and the
  settled `after` snapshot reported `isActive: false`, `isPaused: true`,
  `observeAsPlayer: 0`, `returnAsPlayer: 0`, `localPlayerID: 0`.
- A follow-up status read 8s later stayed on turn `93` (`1760 BCE`), confirming
  that autoplay had stopped advancing after the wrapper returned.
- Follow-up probing of `Autoplay.setAsLocalPlayer()`, `setAsHuman()`, and
  `setAsAI()` while autoplay was active returned successfully but did not
  change the observable App UI status fields. Keep them in the discovered
  catalog, not first-class wrappers, until a postcondition beyond successful
  invocation is identified.
- Final status confirmed autoplay off and paused at turn `93` (`1760 BCE`).

## Verification Gates

Completed gates:

- `bun run openspec -- validate direct-control-state-role-model --strict`
- `bun run openspec -- validate direct-control-read-surface --strict`
- `bun run openspec -- validate direct-control-action-surface --strict`
- `bun run openspec -- validate direct-control-capability-catalog --strict`
- `bun run openspec -- validate direct-control-cli-studio-expansion --strict`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/cli check`
- `bun run --cwd packages/cli test -- test/commands/game.control.test.ts test/commands/game.restart.test.ts`
- `bun run --cwd packages/cli build`
- `bun run --cwd apps/mapgen-studio build`

## Cleanup Disposition

No Windows/FireTuner bridge runtime path was added or retained in the new
surface. Existing `remove-firetuner-bridge-legacy` artifacts remain the accepted
cleanup record for historical bridge references; this change set does not
delete official FireTuner binaries or evidence artifacts.
