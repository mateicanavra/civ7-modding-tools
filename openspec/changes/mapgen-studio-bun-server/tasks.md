## 1. Frame

- [x] 1.1 Workstream record + proposal/design/tasks/spec deltas committed
      (`design/bun-server-frame`), `--strict` valid.

## 2. Engine extraction (`design/bun-server-engines`) — no topology change

- [x] 2.1 `src/server/studio/engines.ts`: `createStudioEngines({ repoRoot })`
      — queue, both operation stores, instance identity, five engine fns
      moved VERBATIM from `vite.config.ts`.
- [x] 2.2 `src/server/studio/context.ts`: `createStudioServerContext`
      (moved `createStudioServerContextForApp`; non-uniform error mapping
      intact).
- [x] 2.3 `vite.config.ts` consumes the extracted modules at module scope;
      all mounts behave identically.
- [x] 2.4 Gates: tsc, studio tests (193), mod tests (471), build + worker
      bundle, fresh-process live smoke (server-info identity, recipe-dag
      200, run-in-game 404 echo observed live).

## 3. Control-oRPC fetch adapter (`design/bun-control-fetch`)

- [x] 3.1 `civ7ControlOrpc.ts` → canonical fetch handler
      (`@orpc/server/fetch`) + Connect shim over `nodeWebBridge`,
      mirroring `recipeDag/orpc.ts`; path contract unchanged.
- [x] 3.2 Existing node transport pins (`civ7ControlOrpcClient.test.ts`)
      green unchanged over the re-shaped adapter.
- [x] 3.3 Gates: tsc, studio tests, live smoke (readiness.current 200 on a
      fresh process).

## 4. Daemon + cutover (`design/bun-server-daemon`)

- [x] 4.1 `src/server/daemon/daemon.ts`: arg parsing, one engines
      instance, `createStudioDaemonFetch(deps)` (pure, testable) routing
      `/healthz`, `/rpc`, `/api/civ7/rpc`, `/api/recipe-dag/rpc` (static
      import), optional static assets; `Bun.serve` entry. Legacy `/api/*`
      RETIRED — 404, no fallbacks (user directive 2026-06-12).
- [x] 4.2 `src/server/daemon/devLive.ts`: spawn daemon → wait `/healthz` →
      spawn Vite; signal forwarding; `makeDevLivePlan` pure.
- [x] 4.3 `vite.config.ts`: delete the server plugin + all server imports;
      `server.proxy` for `/rpc` + `/api` (`STUDIO_DEV_RPC_TARGET`
      override). `package.json`: `dev` → runner, `dev:frontend`,
      `dev:server`, `serve` (daemon + static dist).
- [x] 4.4 `scripts/civ7-direct-control/verify-final-surface-parity.ts`:
      status poll → oRPC `runInGame.status` (the legacy endpoint is gone).
- [x] 4.5 Tests: daemon route dispatch (incl. retired-path 404 pins);
      dev-live plan; existing transport/operation pins green unchanged.
- [x] 4.6 Gates: tsc, studio tests, mod tests, build + worker bundle.
- [x] 4.7 Live verification on FRESH processes: `bun run dev` boots
      daemon + vite; generation run completes; pipeline view loads DAG via
      proxy; control mount routes and returns the router's typed error
      envelope (the live tuner was unresponsive at test time — verified
      runtime-independent: the same direct-control read times out under
      node); curl pins (`/healthz` 200, retired legacy path 404,
      `studio.serverInfo` via proxy); zero console errors, dark theme.
- [x] 4.8 Workstream/phase record closed with evidence; goal-ledger entry.
