# Browser Proof Ledger

Status: rendered browser evidence recorded.

This ledger records manual rendered-shell browser evidence for SMR-06. It must not claim automated browser proof or live Civ7 product proof.

## 2026-06-17 Rendered Run In Game Fast Path

Branch/worktree:

- branch: `codex/studio-browser-scenario-proof`
- repo: `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`
- dev command: `STUDIO_DAEMON_PORT=5287 STUDIO_DEV_PORT=5288 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5287 NX_DAEMON=false NX_TUI=false bun run dev:mapgen-studio`
- browser URL: `http://localhost:5288/`
- browser driver: Playwright CLI accessibility snapshots; no AppleScript, no coordinate input into Civ7.

Initial rendered state:

- Studio header: `Ready. Live Civ7 turn 1 seed 859250892`.
- Game status button: `Live: Turn 1 - Seed 859250892 Live game is ahead of Studio`.
- Run in Game button enabled.

Action:

- Clicked rendered Studio `Run in Game` button.
- Request id: `studio-run-in-game-mqhng9hg-1pku-2`.

Observed phase sequence:

- `Starting Game` with map `{swooper-maps}/maps/studio-current.js`.
- `Complete`, `Studio state: Current`.
- Final live status: `Turn 1 - Seed 123`.

Important negative evidence:

- No rendered `Restarting Civ` phase appeared on this fast-path run.
- World/game controls were disabled while the operation was running and re-enabled at completion.
- The operation completed from an already-running live game without restarting the Civ process.

Interpretation:

- This proves the corrected default path: disposable `studio-current` no longer requests process restart before setup visibility is checked.
- Process restart remains covered by server unit proof as fallback only after typed `setup-row-unavailable` / `reloadBoundary: "process-restart-required"` evidence.

Known console noise:

- Browser console retained one pre-existing error entry from page boot; it did not block the scenario and no Run in Game terminal error was observed.

## 2026-06-17 Restart Recovery Scope Regression

Branch/worktree:

- branch: `codex/studio-run-restart-relation-scope`
- commit: `1b9ec418e fix(studio): scope restart recovery to current run state`

Evidence:

- `bun run --cwd apps/mapgen-studio test test/runInGame/status.test.ts test/runInGame/GameConsole.test.tsx`
  passed with 21 tests.
- `bun run nx run mapgen-studio:check --outputStyle=static` passed.

Observed behavior:

- A current operation with `reloadBoundary: "process-restart-required"` still
  renders `Restart Civ & Run`.
- A stale prior operation with the same diagnostic renders `Run Current` and no
  longer carries process-restart intent into the next authored Studio run.

Interpretation:

- Browser restart recovery is scoped to the operation relation. It remains an
  explicit recovery affordance for the current failure, not a sticky global
  setting for later map reruns.
- No new live Civ7, generated, deployed, tuner, log, or product proof is claimed
  by this regression test.
