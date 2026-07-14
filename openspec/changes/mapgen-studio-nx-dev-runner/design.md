# D11 Design - Nx Dev Runner

## D1. System Boundary

D11 draws the dev-process boundary around Nx, not the app. Nx owns task
orchestration, dependency ordering, continuous process lifecycle, and workspace
watch/build relationships. The Studio app owns two runnable programs:

- the backend daemon entrypoint;
- the Vite frontend entrypoint.

The app does not own a supervisor that starts both, waits for readiness, or
restarts child processes. The daemon does not launch a Bun watcher around
itself. The frontend does not become runtime truth; it proxies `/rpc` to the
backend serve target.

## D2. Nx Target Topology

Use scale-continuous target names:

- `mapgen-studio:serve-daemon`: backend daemon serve target, continuous.
- `mapgen-studio:dev`: user-facing Vite dev server target, continuous,
  depending on `serve-daemon`.

These target names are the D11 implementation contract. The `dev` target is
both the public user-facing target and the frontend process target so the graph
has no orphaned second frontend authority. Existing baseline targets with
overlapping behavior are migrated to this topology or deleted; D11 does not
preserve alternate names as an implementation option.

Generated recipe/build prerequisites are Nx dependencies, not app-supervisor
logic. `mapgen-studio:dev` or its dependency chain must account for the Studio
recipe/build target consumed by the app, matching D1 import-graph isolation.

This target shape follows Nx's native continuous-task semantics: a long-running
backend serve dependency is marked continuous so dependent frontend dev can
start while the backend remains alive. Dependent rebuilds use Nx target
dependencies or workspace watching rather than a bespoke child-process loop.

## D3. Script And Entrypoint Shape

The public command routes directly to repo-local Nx:

```bash
nx run mapgen-studio:dev
```

App package scripts may remain as target executors when Nx invokes them, but
they must not be the public orchestration authority. The app `dev` script cannot
call `bun src/server/daemon/devLive.ts`, and no app dev script can launch
`bun --watch` for the daemon.

`devLive.ts` is deleted. Its tests are deleted or rewritten around Nx target
metadata/process proof. If implementation discovers a real production-serving
helper need, that helper gets a new name and file outside the dev-supervisor
surface; it cannot retain `devLive.ts`, child-process imports, readiness loops
for starting Vite, child teardown graphs, or Bun watcher behavior.

## D4. Watch And Process Semantics

Nx owns watch semantics. A source change should cause the appropriate Nx target
or executor to rebuild/restart the backend or frontend. D11 does not require
zero process restarts during source edits; it requires that operation-time
deploy/build writes do not restart the daemon and that the daemon is not
supervised by a nested app-local watcher.

Process proof is taken while `mapgen-studio:dev` is running. It should show Nx
as the orchestration owner, one backend daemon process, one Vite/frontend
process, and no process whose command includes `devLive.ts` or `bun --watch
src/server/daemon/daemon.ts`.

## D5. Runtime Stability Proof

Dev process simplification is only accepted if Studio operations still work
under the new topology. Play and Save&Deploy must keep `serverInstanceId` stable
across accepted, deploy-entered, deploy-exited, and terminal operation phases
while `mapgen-studio:dev` runs through Nx. Each proof records branch, commit,
operation id, `serverInstanceId`, command/API path, timestamps, and log pointers.
Restart recovery, browser reload, or operation adoption after a new daemon
starts does not satisfy this proof. If live Civ7 is unavailable, D11 writes a
next packet and remains not-green for live operation proof.

## D6. Rejected Shapes

- Keeping `devLive.ts` as an app-local child-process supervisor.
- Starting `bun --watch src/server/daemon/daemon.ts` from the daemon or app dev
  script.
- Routing root dev through Turbo or dual Turbo/Nx branches.
- Using Effect or Arc as a task runner for frontend/backend dev processes.
- Treating Vite proxy behavior as backend lifecycle ownership.
- Hiding process churn with browser watchdog/recovery.
- Treating deployment build commands, such as Railway, as local dev topology
  proof. Deployment residues are classified and handed off separately.

## D7. Falsification Proof

The D11 implementation should fail fast when:

- the accepted Nx/Habitat baseline is absent;
- `mapgen-studio:dev` does not have a backend serve dependency;
- the backend serve target is not continuous;
- active scripts still route through `devLive.ts`;
- a daemon child command contains `bun --watch`;
- Play or Save&Deploy changes `serverInstanceId` mid-operation under Nx dev.

OpenSpec validation proves packet shape only. Nx graph/process/live operation
proofs prove the component behavior.
