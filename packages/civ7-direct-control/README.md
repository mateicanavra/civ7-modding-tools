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

- `App UI` is the default developer control state. Current live evidence shows
  `Network.restartGame()`, `Autoplay`, `Game`, `UI`, `GameContext`, `Players`,
  and `GameplayMap` are available there.
- `Tuner` is a separate state surface. It can appear in `LSQ:` before it is
  actually command-ready. After the native Begin Game action completes, current
  live evidence shows `Game`, `Autoplay`, `GameplayMap`, and `Players` are
  available there; `Network` remains App UI-only.

## Common Calls

```ts
import {
  executeCiv7AppUiCommand,
  getCiv7AppUiSnapshot,
  inspectCiv7RuntimeApi,
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
```

`getCiv7AppUiSnapshot()` is read-only and covers the stable developer status
surface: network/session status, autoplay properties, turn/date, UI loading
state, local player ids, alive player ids, and map dimensions.

## CLI

The CLI routes through this package:

```bash
civ7 game health --json
civ7 game exec "1+1" --state "App UI" --json
civ7 game inspect --app-ui-snapshot --json
civ7 game health --tuner --json
civ7 game restart --begin --wait-tuner --json
```

## Bridge Policy

There is no Windows/FireTuner bridge fallback in repo tooling. FireTuner remains
reference-client evidence for the same protocol, not a required runtime.
