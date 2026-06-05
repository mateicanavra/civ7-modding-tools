# Civ7 Direct Control

`@civ7/direct-control` is the repo-owned boundary for controlling a running
Civilization VII process through the tuner socket protocol. CLI, Studio, and
future tools call this package instead of owning socket frames, state discovery,
or restart/autoplay behavior locally.

## Transport

- Default host: `127.0.0.1`
- Default port: `4318`
- State discovery: `LSQ:`
- Command execution: `CMD:<stateId>:<javascript>`
- Request framing: little-endian length, little-endian listener id, UTF-8
  NUL-terminated payload

For one-off calls, the package can open and close a socket around a single
command. For restart/begin/readiness loops, it uses `Civ7DirectControlSession`
so `LSQ:` and `CMD:<stateId>:<javascript>` requests share a persistent client
connection and reconnect only when Civ7 restarts the listener.

## State Surfaces

State APIs are not interchangeable.

- `App UI` is the default lifecycle/setup control state. It is valid at the
  main menu/shell even when gameplay globals such as `Game`, `GameContext`,
  `Players`, and `GameplayMap` are unavailable; callers must treat those as
  conditional probes until App UI reports a running game.
- `Tuner` is a separate state surface. It can appear in `LSQ:` before it is
  actually command-ready. After the native Begin Game action completes, current
  live evidence shows `Game`, `Autoplay`, `GameplayMap`, and `Players` are
  available there; `Network` remains App UI-only.

## Common Calls

```ts
import {
  canStartCiv7UnitOperation,
  executeCiv7AppUiCommand,
  generateCiv7CapabilityCatalog,
  getCiv7AppUiSnapshot,
  getCiv7GameInfoRows,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
  getCiv7PlotSnapshot,
  getCiv7VisibilitySummary,
  inspectCiv7RuntimeApi,
  requestCiv7UnitOperation,
  restartCiv7GameAndBegin,
  restartCiv7Game,
  waitForCiv7TunerReady,
  waitForCiv7DirectControl,
} from "@civ7/direct-control";

await restartCiv7Game();
await waitForCiv7DirectControl({ state: { role: "app-ui" } });
await restartCiv7GameAndBegin({ waitForTuner: true });
await waitForCiv7TunerReady();

const result = await executeCiv7AppUiCommand({ command: "1+1" });
const snapshot = await getCiv7AppUiSnapshot();
const api = await inspectCiv7RuntimeApi({
  state: { role: "app-ui" },
  roots: ["Network", "Autoplay"],
});

const status = await getCiv7PlayableStatus();
const map = await getCiv7MapSummary();
const plot = await getCiv7PlotSnapshot({ x: 32, y: 33, playerId: 0 });
const visibility = await getCiv7VisibilitySummary({ playerId: 0 });
const resources = await getCiv7GameInfoRows({ table: "Resources", limit: 10 });
const catalog = await generateCiv7CapabilityCatalog();

const unitId = { owner: 0, id: 65536, type: 26 };
const canSkip = await canStartCiv7UnitOperation({ unitId, operationType: "SKIP_TURN" });
if (canSkip.valid) {
  await requestCiv7UnitOperation(
    { unitId, operationType: "SKIP_TURN" },
    {},
  );
}
```

`getCiv7AppUiSnapshot()` is read-only and covers the stable developer status
surface: network/session status, autoplay properties, turn/date, UI loading
state, local player ids, alive player ids, and map dimensions.

First-class wrappers now cover:

- readiness and lifecycle: `getCiv7PlayableStatus`, restart, Begin Game,
  Tuner health, turn-complete status/actions;
- map reads: summary, one-plot snapshots, bounded grids, visibility summaries,
  player/unit/city summaries, and targeted `GameInfo` rows;
- mutating actions: Autoplay configure/start/stop, disposable reveal, and
  validator-backed Unit/City/Player operation/command requests;
- catalog/type support: TypeBox schema exports, static catalog generation,
  runtime catalog generation, and official-resource capability scanning.

Mutating wrappers run validator-first and report postcondition/no-repeat
evidence. Replay is not automatic after a failed or unverified mutation, and
reveal remains constrained to disposable-session callers.

Autoplay start may omit `--turns`; the package sets native return/observe
players when it can infer them and clears a prior pause before starting. Stop
keeps native pause enabled, requests inactive autoplay, then waits for the
return player and a stable turn number before reporting `verified: true`.

## CLI

The CLI routes through this package:

```bash
civ7 game status --json
civ7 game health --json
civ7 game exec "1+1" --state "App UI" --json
civ7 game inspect --app-ui-snapshot --json
civ7 game health --tuner --json
civ7 game restart --begin --wait-tuner --json
civ7 game map --summary --json
civ7 game map --plot 32,33 --player-id 0 --json
civ7 game visibility --player-id 0 --bounds 0,0,32,32 --json
civ7 game gameinfo Resources --limit 50 --json
civ7 game autoplay --action start --reason "unbounded smoke test" --json
civ7 game autoplay --action start --turns 1 --reason "bounded smoke test" --json
civ7 game autoplay --action stop --reason "stop smoke test" --json
civ7 game operation --family unit-operation --operation-type SKIP_TURN --unit-id '{"owner":0,"id":65536,"type":26}' --json
civ7 game catalog --json
```

Studio dev-server endpoints also call this package directly:

- `GET /api/civ7/status`
- `GET /api/civ7/map-summary`
- `GET /api/civ7/gameinfo?table=Resources&limit=50`

## Bridge Policy

There is no Windows/FireTuner bridge fallback in repo tooling. FireTuner remains
reference-client evidence for the same protocol, not a required runtime.
