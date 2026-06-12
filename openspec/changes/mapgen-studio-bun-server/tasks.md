## 1. Frame

- [ ] 1.1 Workstream record + proposal/design/tasks/spec deltas committed
      (`design/bun-server-frame`), `--strict` valid.

## 2. Engine extraction (`design/bun-server-engines`) — no topology change

- [ ] 2.1 `src/server/studio/engines.ts`: `createStudioEngines({ repoRoot })`
      — queue, both operation stores, instance identity, five engine fns
      moved VERBATIM from `vite.config.ts`. No effect-orpc in its import
      graph (config must stay node-evaluable).
- [ ] 2.2 `src/server/studio/context.ts`: `createStudioServerContext`
      (moved `createStudioServerContextForApp`; non-uniform error mapping
      intact).
- [ ] 2.3 `vite.config.ts` consumes the extracted modules at module scope;
      legacy handlers and all three mounts behave identically.
- [ ] 2.4 Gates: tsc, studio tests, mod tests, build + worker bundle,
      fresh-process live smoke (run loop + pipeline view + readiness poll).

## 3. Control-oRPC fetch adapter (`design/bun-control-fetch`)

- [ ] 3.1 `civ7ControlOrpc.ts` → canonical fetch handler
      (`@orpc/server/fetch`) + Connect shim over `nodeWebBridge`,
      mirroring `recipeDag/orpc.ts`; path contract unchanged.
- [ ] 3.2 Transport test (node:http + shim → fetch handler), mirroring the
      recipe-DAG transport pins.
- [ ] 3.3 Gates: tsc, studio tests, live smoke (readiness/control poll).

## 4. Daemon + cutover (`design/bun-server-daemon`)

- [ ] 4.1 `src/server/daemon/daemon.ts`: arg parsing, one engines
      instance, `createStudioDaemonFetch(deps)` (pure, testable) routing
      `/healthz`, `/rpc`, `/api/civ7/rpc`, `/api/recipe-dag/rpc` (static
      import), legacy compat, optional static assets; `Bun.serve` entry.
- [ ] 4.2 `src/server/studio/legacyHttp.ts`: 16 REST handlers as fetch
      adapters over the shared engines — identical bodies/status codes
      (404-echo asymmetry, non-uniform codes, live/status embedded-error
      200).
- [ ] 4.3 `src/server/daemon/devLive.ts`: spawn daemon → wait `/healthz` →
      spawn Vite; signal forwarding; `makeDevLivePlan` pure.
- [ ] 4.4 `vite.config.ts`: delete the server plugin + server imports; add
      `server.proxy` for `/rpc` + `/api` (`STUDIO_DEV_RPC_TARGET`
      override). `package.json`: `dev` → runner, `dev:frontend`,
      `dev:server`.
- [ ] 4.5 Tests: daemon route dispatch; legacy compat parity pins;
      dev-live plan; existing transport/operation pins green unchanged.
- [ ] 4.6 Gates: tsc, studio tests, mod tests, build + worker bundle.
- [ ] 4.7 Live verification on FRESH processes: `bun run dev` boots both;
      generation run completes; pipeline view loads DAG via proxy; control
      readiness poll works; curl pins (`/healthz`, one legacy path,
      `studio.serverInfo`); dark theme visual unchanged.

## 5. Retirement checkpoint (SUPERVISED — not auto-run)

- [ ] 5.1 Present the retirement list (design.md table + consumer
      evidence) to the user; record the decision in the workstream record.
- [ ] 5.2 (post-approval) `design/bun-legacy-retire`: delete
      `legacyHttp.ts` + mount + compat tests; update
      `scripts/civ7-direct-control/verify-final-surface-parity.ts`.
