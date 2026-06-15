# D11 Next Packet - Live Nx Dev Operation Proof

Status: not-green live product proof handoff
Date: 2026-06-15
Branch: `codex/runtime-effect-nx-dev-runner`

## Missing Proof

D11 has executable proof for Nx-owned dev orchestration, process topology, and
deletion of the app-local supervisor. It does not have live Civ7 Play or
Save&Deploy phase-sampled `serverInstanceId` proof.

The missing proof is:

- Run in Game / Play while `bun run nx run mapgen-studio:dev --outputStyle=stream`
  is active.
- Save&Deploy while the same Nx dev target is active.
- For each operation, sample accepted, deploy-entered, deploy-exited, and
  terminal phases from daemon APIs/events.
- Record one stable `serverInstanceId` for all samples in the same operation.
- Record branch, commit, operation id, API path or UI command, timestamps, and
  relevant daemon/game log paths.
- Prove operation completion is not explained by daemon restart recovery,
  browser reload, or operation adoption after a new daemon starts.

## Re-Entry Prerequisites

- Civ7 running and reachable through the normal Studio direct-control/FireTuner
  path.
- Studio dev runner started with:

```bash
bun run nx run mapgen-studio:dev --outputStyle=stream
```

- Backend health visible at `http://127.0.0.1:5174/healthz`.
- Frontend visible at `http://localhost:5173/`.
- No active process command containing `devLive.ts` or `bun --watch`.

## Process Proof Already Captured

Current D11 proof captured on 2026-06-15:

- `bun run nx run mapgen-studio:dev --outputStyle=stream` started
  `mapgen-studio:serve-daemon` and `mapgen-studio:dev`.
- Process sample showed one Nx runner, two Nx executor children, one Vite
  frontend process, and one `bun src/server/daemon/daemon.ts` backend process.
- Process sample showed no `devLive.ts` and no `bun --watch`.
- `curl http://127.0.0.1:5174/healthz` returned `ok: true`,
  `runtimeMode: "studio-daemon-effect-orpc"`, and daemon identity
  `studio-server-mqfnojkq-1gwf-1`.
- `curl -I http://localhost:5173/` returned HTTP 200 from Vite.

## Blocked Closure Claim

Until the live operation proof above is run, D11 must not be described as live
Play/SaveDeploy product-green. D12 must consume this as a live-proof gap rather
than silently treating D10/D11 unit or process proof as end-to-end game proof.
