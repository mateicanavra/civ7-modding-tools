# Dev Startup Proof Ledger

Status: proof recorded on branch `codex/studio-dev-startup-proof`.

This ledger records bounded dev startup attempts for SMR-05. It names branch,
commit, command, daemon URL, Vite URL, RPC target, server identity, process
cleanup, and git status before/after.

## Attempt 1: TUI/Nx Process Contention

- Time: 2026-06-17T04:36Z.
- Branch/head: `codex/studio-dev-startup-proof` at `f01ebcf29`.
- Command:
  `STUDIO_DAEMON_PORT=5274 STUDIO_DEV_PORT=5273 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 bun run dev:mapgen-studio`.
- Result: no daemon or Vite listener was reachable during the bounded probe.
- Classification: Nx process orchestration/TUI contention, not daemon startup,
  Vite startup, RPC handler, direct-control, or Civ7 runtime failure.
- Evidence: the command remained in Nx orchestration; probes to
  `http://127.0.0.1:5274/healthz` and `http://127.0.0.1:5273/` failed.
- Cleanup: current-worktree `mapgen-studio:dev`, Vite, and daemon processes were
  terminated. A separate daemon in
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mc-handcrafted-map`
  on port `5184` was left alone as exterior state.

## Attempt 2: Isolated Ports With Nx Daemon Disabled

- Time: 2026-06-17T04:44:58Z.
- Branch/head: `codex/studio-dev-startup-proof` at `f01ebcf29`.
- Command:
  `STUDIO_DAEMON_PORT=5274 STUDIO_DEV_PORT=5273 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 NX_DAEMON=false NX_TUI=false bun run dev:mapgen-studio`.
- Daemon URL: `http://127.0.0.1:5274`.
- Vite URL: `http://localhost:5273`.
- RPC target: `http://127.0.0.1:5274`.
- Readiness: reached after 6 seconds.
- Daemon health:
  - `ok`: `true`
  - `serverInstanceId`: `studio-server-mqhl7inu-1jz3-1`
  - `startedAt`: `2026-06-17T04:44:58.554Z`
  - `repoRoot`: `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`
  - `runtimeMode`: `studio-daemon-effect-orpc`
  - tuner: `consecutiveResponseTimeouts=0`, `gateOpenUntil=null`,
    `wedgeSuspected=false`
- Vite proof: `GET http://localhost:5273/` returned `200` with
  `<title>MapGen Studio`.
- Proxy/RPC mount proof:
  `GET http://localhost:5273/rpc/nope` returned daemon body `Not Found` with
  status `404`, proving the Vite `/rpc` proxy reached the daemon.
- Listener proof:
  - Vite listened on `[::1]:5273`.
  - Daemon listened on `127.0.0.1:5274`.
- Cleanup: after the wrapper exited, Nx left the continuous target process and
  its Vite/daemon children alive. The proof ports were cleared explicitly by
  terminating PIDs `72473`, `72542`, and `72543`. A final listener audit showed
  no listeners on `5273` or `5274`.

## Classification Notes

- `localhost:5273` is the correct Vite proof URL for this run. A strict
  `127.0.0.1:5273` probe can fail while Vite is healthy because Vite listened
  on IPv6 loopback `[::1]:5273`.
- `127.0.0.1:5274` is the correct daemon proof URL for this run.
- Dev startup proof is not product proof. This packet does not prove live Civ7,
  FireTuner, in-game observation, `studio-current.js` deployment, or the full
  Run in Game lifecycle.
- The user-reported priority failure
  `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js` remains a
  downstream runtime/deployment falsifier for the packet that exercises
  generated map deployment and live setup execution.
