# Phase Record: Studio Dev Startup Proof

Status: recorded and ready for review.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-05---dev-startup-proof`.

Priority rows: DEV-01, DEV-02, PROOF-01 build hygiene portion, EB-14, EB-15.

## Packet Outcome

SMR-05 required a bounded proof that `bun run dev:mapgen-studio` can start the
Studio daemon and Vite frontend with isolated ports while classifying startup
failures separately from Civ7 runtime failures.

The packet did not require a runtime implementation change. The existing port
environment variables work:

- `STUDIO_DAEMON_PORT` controls the daemon port.
- `STUDIO_DEV_PORT` controls the Vite port.
- `STUDIO_DEV_RPC_TARGET` controls the Vite `/rpc` proxy target.

The successful proof used `NX_DAEMON=false NX_TUI=false` to isolate the attempt
from global Nx daemon state and terminal UI behavior. The prior attempt without
that isolation did not become reachable within the bounded window and is
classified as process orchestration contention, not as a Studio daemon, Vite,
RPC, direct-control, or Civ7 failure.

## Operational Findings

- Vite listened on `[::1]:5273`; probing `http://127.0.0.1:5273/` can produce a
  false negative. Use `http://localhost:5273/` for the app-shell proof.
- The daemon listened on `127.0.0.1:5274`; daemon health was available at
  `http://127.0.0.1:5274/healthz`.
- Continuous Nx targets can survive a bounded shell wrapper as orphaned
  processes. Cleanup proof must audit and clear the actual listener PIDs, not
  only the root `bun run` PID.
- The parallel daemon in
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mc-handcrafted-map`
  is exterior to this packet and was not terminated.

## Explicit Non-Proofs

- No live Civ7 or FireTuner success was proven.
- No browser interaction beyond serving the app shell was proven.
- No `studio-current.js` generation, deployment, or in-game visibility was
  proven. The missing `{swooper-maps}/maps/studio-current.js` failure remains a
  priority downstream falsifier.
