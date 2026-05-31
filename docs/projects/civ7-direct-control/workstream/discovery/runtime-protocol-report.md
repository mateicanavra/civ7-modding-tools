# Runtime Protocol Report

## Summary

Fresh local evidence on 2026-05-31 supports the direct Civ7 tuner-socket path:
the macOS `CivilizationVII` process was listening on TCP port `4318`, accepted
direct client connections, returned scripting states through `LSQ:`, and
executed read-only JavaScript introspection commands through `CMD:<stateId>:...`.

FireTuner is useful reference-client evidence, not a proven runtime dependency.
`FireTuner2.exe` contains the same protocol tokens (`LSQ:`, `CMD:`,
`127.0.0.1`) plus scripting-state and request-listener symbols, but the live
listener observed here was owned by Civ7 itself. No Steam dependency appeared in
the socket protocol path beyond the separate fact that this running game process
was launched from Steam.

The implementation should keep the direct path primary, query states on every
new session, expose explicit state selection, classify health in layers, and
treat reconnect-after-game-restart as unresolved until a state-changing restart
probe is run.

## Live Evidence

- `ps` showed a running macOS Civ7 process:
  `/Users/mateicanavra/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VII/CivilizationVII.app/Contents/MacOS/CivilizationVII`.
- `lsof -nP -iTCP:4318` showed `Civilizat` PID `94913` listening on `TCP *:4318`.
- `nc -vz -G 2 127.0.0.1 4318` succeeded.
- `ifconfig bridge100` showed Parallels host bridge address `10.211.55.2`.
- Direct `LSQ:` probes succeeded on both `127.0.0.1:4318` and
  `10.211.55.2:4318`.
- Three new-socket `LSQ:` attempts to each host succeeded, with elapsed times
  between 22ms and 48ms.
- `LSQ:` returned these states:
  - `65535` / `App UI`
  - `1` / `Tuner`
- Read-only `CMD:<stateId>:typeof ...` probes returned:
  - `App UI`: `typeof Network` -> `object`; `typeof Game` -> `object`;
    `typeof Autoplay` -> `object`
  - `Tuner`: `typeof Network` -> `undefined`; `typeof Game` -> `object`;
    `typeof Autoplay` -> `object`

Proof label: `tuner-exercised` for direct transport, state discovery, and
read-only command execution. This is not `in-game observed` proof for restart,
autoplay effects, or map-generation effects.

## Static Protocol Evidence

`packages/cli/src/utils/firetunerSocket.ts` already encodes the essential direct
protocol:

- Defaults: host `127.0.0.1`, port `4318`, timeout `10_000`, default state
  name `App UI`.
- State query: send `LSQ:` and parse response parts as alternating
  `[stateId, stateName]`.
- Command execution: send `CMD:<stateId>:<command>`.
- Frame format: little-endian `uint32` message byte length, little-endian
  `uint32` listener id, then a UTF-8 NUL-terminated message.
- Response format: same frame header, with NUL-separated response parts.
- Listener ids are local client request ids; responses must be correlated by id.

`packages/cli/test/utils/firetunerSocket.test.ts` confirms the intended fixture
protocol: a fake server responds to `LSQ:` with `65535/App UI` and `1/Tuner`,
then accepts `CMD:65535:Network.restartGame()` and returns `true`.

Current gap: the helper destroys the socket after each command and does not yet
model layered health, reconnection policy, state-specific command requirements,
or restart-time state repopulation.

## FireTuner Binary Clues

Inspected directory:
`/Users/mateicanavra/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/FireTuner/Win64/`.

`file` identifies `FireTuner2.exe` and the `Firaxis.*.dll` files as Windows
x86-64 Mono/.NET assemblies. `FireTuner2.exe.config` only contains .NET runtime
and assembly binding redirects; it did not expose socket, Steam, or launcher
configuration.

ASCII and simple UTF-16LE string extraction from `FireTuner2.exe` found:

- Protocol strings: `CMD:`, `LSQ:`
- Default connection clue: `127.0.0.1`
- UI/state strings: `Tuner Connect`, `Port:`, `Connect`,
  `Refresh Scripting States`, `Lock Scripting State`, `Main State`,
  `[ Scripting State = `
- Implementation symbols: `SocketConnection`, `OpenConnection`,
  `CloseConnection`, `LuaStateManager`, `QueryLuaStates`,
  `UpdateLuaStates`, `AddRequestListener`, `RemoveRequestListener`,
  `GetRequestListener`, `MessageRecievedListener`
- Warning text: `Tuner port already in use. Please close {0} and restart FireTuner.`

`Firaxis.Net.dll` contains generic socket/client symbols including
`SocketConnection`, `ConnectAsync`, `OpenConnection`, `CloseConnection`,
`ConnectionTarget`, `System.Net.Sockets`, and `FindTunerConnectionApp`.

No relevant `Steam`, `Steamworks`, or launcher strings were found in the
FireTuner binary/string pass. This does not prove Steam is irrelevant to
launching Civ7; it does support that FireTuner's socket client path is not
obviously Steam-mediated.

Tooling caveat: macOS `/usr/bin/strings` lacks `-el`; no local `monodis`,
`ikdasm`, `dotnet`, `ilspycmd`, or `pedump` tool was available. The binary pass
is string/metadata evidence, not a full decompilation.

## State/Health/Reconnect Implications

State selection matters. `Network` was available in `App UI` but not `Tuner`,
while `Game` and `Autoplay` were available in both observed states. The default
`App UI` state is plausible for `Network.restartGame()`, but gameplay commands
should not assume one universal state. The API should accept an explicit state
name and should surface the state list when the requested state is missing.

State ids should be treated as session data, not stable constants. The observed
ids were `65535` for `App UI` and `1` for `Tuner`, matching the current test
fixture, but implementation should query by name and use ids only from the
current `LSQ:` response.

Health should be layered:

- `listener`: TCP connect to host/port succeeds.
- `states`: `LSQ:` succeeds and returns at least one state.
- `state-ready`: requested state is present.
- `command-ready`: a harmless command succeeds in the requested state.
- `effect-proven`: a state-changing command produced bounded log or in-game
  evidence.

Later implementation evidence supersedes this lane's restart caution for the
running-process restart case: a persistent direct session successfully called
`Network.restartGame()`, observed App UI loading, called `UI.notifyUIReady()`,
observed `GameStarted`, and passed a Tuner gameplay canary. Full Civ7 process
exit/relaunch remains unproven. Expected implementation behavior remains:
re-query states after transitions, reconnect for observational probes, and never
automatically replay state-changing commands.

## Steam/FireTuner Dependency Assessment

Direct socket control is not falsified. The live listener was `CivilizationVII`
on `*:4318`; direct commands were accepted without using the Windows bridge
append-only log and without interacting with the FireTuner UI.

FireTuner appears to be a reference client for the same server-side protocol:
its executable contains `LSQ:`, `CMD:`, connection UI, state refresh, and request
listener symbols. That is useful protocol corroboration, but it is not evidence
that FireTuner must be running.

Steam was running because the observed macOS Civ7 process came from the Steam
install, and Steam helper processes were present. No observed socket request,
response, source helper, or FireTuner string requires Steam in the command path.
Keep Steam/launcher handling outside this workstream unless later dynamic
testing shows command execution depends on it.

## Implementation Requirements

- Create one canonical direct-control transport boundary instead of spreading
  socket framing across CLI/Studio callers.
- Keep host, port, timeout, and state selection configurable through
  direct-control environment and API options.
- Implement frame encode/decode as little-endian length + listener id + UTF-8
  NUL-terminated payload; support fragmented TCP reads and multiple frames.
- Correlate responses by listener id and ignore or queue unrelated frames.
- Query `LSQ:` before command execution; select by state name, not hardcoded id.
- Expose available states and command output in result objects and errors.
- Model health in layers, not as a single boolean.
- Use a persistent session for restart/begin/readiness loops so repeated
  one-shot sockets do not wedge the listener; persistent sessions need
  close/error handling and state refresh.
- Provide command profiles or caller guidance for known state-sensitive commands
  such as `Network.restartGame()` versus `Autoplay.*`.
- Record proof labels separately: transport proof, state proof, command proof,
  log proof, and in-game proof.
- Keep FireTuner binary findings in docs/tests as reference-client evidence,
  not as an implementation dependency.

## Risks/Reframe Triggers

- Reframe if a fresh Civ7 restart makes port `4318` unavailable, changes frame
  semantics, or requires FireTuner to bootstrap the listener.
- Reframe if useful commands require a state or authentication path unavailable
  through direct `CMD:<stateId>:...` messages.
- Reframe if state names/ids vary enough across main menu, in-game, restart, or
  modded sessions that a name-selected API cannot provide safe defaults.
- Reframe if long-running socket sessions receive unsolicited frames that break
  request correlation or require a more complete listener/event model.
- Downgrade any restart/autoplay/map-generation claims until they have bounded
  `Scripting.log`/sibling-log or in-game evidence from the relevant action.
- Treat `TCP *:4318` as a local security concern: default clients should use
  `127.0.0.1`, and non-loopback hosts should be explicit.

## Evidence Appendix

Repo/workflow:

- Branch: `codex/civ7-direct-control-workstream`.
- Graphite CLI present: `gt --version` -> `1.7.4`.
- Pre-existing dirty files preserved: `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`,
  `NOTE-TO-DRA.md`.
- No Windows bridge command-log entries were appended by this lane.

Live commands and observations:

```text
lsof -nP -iTCP:4318
COMMAND     PID         USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
Civilizat 94913 mateicanavra 252u  IPv4 ...      0t0  TCP *:4318 (LISTEN)
```

```text
nc -vz -G 2 127.0.0.1 4318
Connection to 127.0.0.1 port 4318 [tcp/*] succeeded!
```

```json
{
  "observedAt": "2026-05-31T18:12:21.586Z",
  "host": "127.0.0.1",
  "port": 4318,
  "states": [
    { "id": "65535", "name": "App UI" },
    { "id": "1", "name": "Tuner" }
  ],
  "commands": [
    { "state": { "id": "65535", "name": "App UI" }, "command": "typeof Network", "output": ["object"] },
    { "state": { "id": "65535", "name": "App UI" }, "command": "typeof Game", "output": ["object"] },
    { "state": { "id": "65535", "name": "App UI" }, "command": "typeof Autoplay", "output": ["object"] },
    { "state": { "id": "1", "name": "Tuner" }, "command": "typeof Network", "output": ["undefined"] },
    { "state": { "id": "1", "name": "Tuner" }, "command": "typeof Game", "output": ["object"] },
    { "state": { "id": "1", "name": "Tuner" }, "command": "typeof Autoplay", "output": ["object"] }
  ]
}
```

Repeated reconnect probe:

```text
127.0.0.1:4318 LSQ attempts: 3/3 ok, 22-47ms, states App UI/Tuner.
10.211.55.2:4318 LSQ attempts: 3/3 ok, 45-48ms, states App UI/Tuner.
```

Source anchors:

- `packages/cli/src/utils/firetunerSocket.ts`: constants and command API at
  lines 3-61; state query at lines 63-83; socket open at lines 85-105;
  request/response handling at lines 107-150; frame encoding/parsing at
  lines 153-178.
- `packages/cli/test/utils/firetunerSocket.test.ts`: fixture protocol at
  lines 7-51 and frame helpers at lines 54-79.
- `packages/cli/src/utils/firetunerBridge.ts`: bridge restart command and
  append-only log path at lines 5 and 31-38; append format at lines 45-77.
- `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`: project
  frame at lines 9-18 and reframe trigger at lines 50-54.

Binary anchors:

- `FireTuner2.exe` SHA-256:
  `5e05ee4a566c0ea37b43a4f52c789be92405358fab2d09fb2810572cc8714419`.
- `Firaxis.Net.dll` SHA-256:
  `f921bc844f8ae1f6fcf2b3619523e85d4f9af142dafb282e0d2eb488c5a6f376`.
- `FireTuner2.exe` string extraction found `CMD:`, `LSQ:`, `127.0.0.1`,
  `Refresh Scripting States`, `SocketConnection`, `QueryLuaStates`,
  `LuaStateManager`, and request-listener symbols.
