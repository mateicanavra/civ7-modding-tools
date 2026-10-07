# Graceful Civ7 Exit

## Choose The Lifecycle Action

Redeploying an already-registered, same-name mod normally needs an in-game
map/session restart, not a full application quit. Reserve full exit for a newly
registered mod or genuine application/lifecycle recovery. Losing the gameplay
`Tuner` state at the main menu is expected; inspect the shell/App UI state rather
than classifying that transition as an application hang.

Obtain authorization to discard unsaved progress before quitting. One operator
owns the request and any later relaunch; parallel investigations must not issue
competing lifecycle actions. Direct native execution bypasses the normal
in-game quit confirmation and does not save progress on the user's behalf.

## Ask Civ To Exit

The shipped main-menu handler and automation support use the same native UI
primitive:

```js
engine.call("exitToDesktop");
```

Find the current handlers in official resources under
`Base/modules/core/ui/shell/main-menu/main-menu.js` and
`Base/modules/base-standard/ui/automation/automation-test-support.js`.
This is an application exit, not `exitToMainMenu` or `Network.restartGame()`.

Discover the installed CLI surface with `game --help` and `game exec --help`.
The existing bounded maintainer diagnostic can dispatch the native request in
the discovered App UI state:

```bash
env -u CIV7_TUNER_HOST -u CIV7_TUNER_HOSTS -u CIV7_TUNER_PORT \
  civ7 game exec 'engine.call("exitToDesktop")' --host 127.0.0.1 --port 4318 \
  --state 'App UI' --timeout-ms 10000 --json
```

Use the supported built-workspace launcher when the CLI is not linked:
`bun apps/cli/bin/run.js` followed by the same arguments. Select the actual host,
port and state from current health/configuration; the example is not authority
for a different machine's endpoint. Before a real request, inspect its
`--dry-run` output and confirm the target process and unsaved-progress authority.
Run the example on the intended game host, selecting its discovered local port.
The current diagnostic config appends inherited hosts and a loopback default
even after an explicit `--host`; that flag alone does not disable fallback.
Clear inherited Tuner endpoint variables for host-local recovery, verify health
returns the intended endpoint, and inspect the final dry-run host list. For a
remote game, execute locally on that host rather than relying on an exclusive
remote-host selection this diagnostic does not provide. Do not send to the
gameplay state merely because it was available previously.

If the CLI/Tuner path is unavailable but Civ's existing Cohtml inspector is
available, use documented browser computer use to select the actual game UI
target and its Cohtml Main Context, observe that `engine.call` exists, and issue
the same request through the Console UI. Do not add a caller-local WebSocket
transport or expose the inspector publicly. A private loopback tunnel must be
disposed after use. Civ's own Quit control and its confirmation are the UI
alternative. Steam Stop is not established here as a graceful exit path.

## Verify The Effect

1. Record the actual host/user, running Civ PID/process identity, request time,
   selected state/context and available resource epoch before dispatch.
2. Dispatch once. Preserve the response, including rejection, timeout or
   disconnect; shutdown can destroy the very scripting context carrying it.
3. Independently check the operating-system process state on the same host.
   On macOS, after confirming the executable name, `pgrep -x CivilizationVII`
   must no longer find the game. Verify the original PID exited and no
   replacement game process appeared. Bound the wait; a disconnected Tuner or
   a fulfilled promise with `undefined` does not establish process exit.
4. If the result is uncertain, reconcile process and UI facts before retrying.
   Do not repeat the mutation blindly or escalate automatically to a signal,
   `kill -9`, `pkill`, application termination or a permission reset.
5. Only after exit is confirmed may the owning operation replace live settings,
   save/configuration databases or mod-registration state. Retain its backups,
   then let that same operator relaunch and rediscover fresh scripting states.

A successful graceful exit does not prove desktop window CUA was repaired,
that a replacement mod loaded, or that a later game generation passed.

## CLI Ownership

The command above uses the existing explicit diagnostic surface; it does not
introduce a dedicated semantic quit command or repair its historical transport
implementation. A future product lifecycle command must expose the same native
primitive through the public in-engine controller and reconcile host process
facts at a qualified app owner. Do not grow frozen `civ7-control` or
`direct-control` code, add a topic-local transport, or call raw execution a typed
controller operation merely to wrap this diagnostic.
