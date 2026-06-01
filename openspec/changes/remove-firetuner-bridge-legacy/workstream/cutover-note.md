# FireTuner Bridge Cutover Note

The bridge cutover is gated by direct-control parity and better-than-bridge
coverage.

Confirmed before deletion:

- Direct socket listener present on `127.0.0.1:4318`.
- `LSQ:` returns `App UI` and `Tuner`.
- Direct command execution returns `2` for `1+1`.
- Direct runtime root inspection reports `Network`, `Game`, and `Autoplay`.
- Direct `Network.restartGame()` proof returned `true` and produced a fresh
  `Scripting.log` MapGeneration window.
- A later fresh started-game proof at `2026-05-31T18:58:31.563Z` used one
  persistent session to call `Network.restartGame()`, observe App UI loading,
  call `UI.notifyUIReady()`, observe `GameStarted`, and pass a Tuner gameplay
  canary.
- Repo-owned CLI bridge utilities, tests, and flags are removed. CLI control
  commands now route through `@civ7/direct-control`.

Cutover rule: do not restore the Windows/FireTuner bridge unless direct socket
control is falsified for a required command that the bridge can demonstrably run
from the same game state.

Shared-drive cleanup: the current `Comms` directory contains only
`Modifiers.ltp`; no bridge scripts, wrappers, command files, or bridge logs were
present to delete in this pass. Official FireTuner binaries were preserved as
development tools/reference-client evidence, not repo-owned runtime control.
