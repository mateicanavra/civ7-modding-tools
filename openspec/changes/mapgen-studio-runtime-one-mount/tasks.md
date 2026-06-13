## 1. Frame

- [ ] 1.1 Proposal/design/tasks/spec deltas committed
      (`design/runtime-one-mount`), `--strict` valid.

## 2. Package unification (`@civ7/studio-server`)

- [ ] 2.1 Move recipe-DAG contract modules verbatim into
      `packages/studio-server/src/recipeDag/` (schema, errors,
      typeboxStandardSchema, contract) + `RecipeDagService` type; deps add
      `@civ7/control-orpc`, `typebox`.
- [ ] 2.2 `contract/index.ts`: unified contract — `civ7.*` spreads
      `Civ7ControlOrpcContract` (disjoint-keys verified), `recipeDag.get`
      added; `StudioContract` re-exported with `RecipeDagResult`.
- [ ] 2.3 `router/index.ts`: recipe-DAG procedure re-implemented on the ONE
      runtime (private empty runtime deleted); `Civ7ControlOrpcRouter`
      merged under `civ7.*`.
- [ ] 2.4 `context.ts`: required `recipeDagService` + `civ7Control` fields.
- [ ] 2.5 `handler.ts`: ONE `RPCHandler`; per-request context built
      internally (memoized unconnected session into
      `endpointDefaults.session`); `tuner.session()` port deleted;
      `tuner.health()` + `dispose()` kept.
- [ ] 2.6 Gates: studio-server build + tests + tsc.

## 3. Daemon + app cutover

- [ ] 3.1 `daemon.ts`: deps shrink to `{ studioRpc, health, assetsRoot? }`;
      fetch routes `/healthz` + `/rpc` + assets; if-chain, session patch,
      and explicit `/api` branch deleted; `createStudioServerContext`
      supplies `civ7Control` (live facade + default timeout) +
      `defaultRecipeDagService`.
- [ ] 3.2 `vite.config.ts` proxy → one `/rpc` rule; `devLive.ts` log/docs
      updated.
- [ ] 3.3 Client: `lib/orpc.ts` types off the unified contract;
      `liveControlPort` → `orpcClient.civ7.*`; `useRecipeDagQuery` →
      `orpcClient.recipeDag.get`; deletions per design D4 (two middlewares,
      nodeWebBridge, rpcPath, both shared path constants, three satellite
      clients).
- [ ] 3.4 Tests per design D6: daemonFetch rewrite; NEW single-mount
      contract pin (namespaces + session injection + sanitization + 404 +
      collision guard); four superseded test files deleted;
      artifactPresentation retarget.

## 4. Verification + closure

- [ ] 4.1 Gates: apps/mapgen-studio `bun run test` + tsc; studio-server,
      control-orpc (347), direct-control (433) package tests; `bun run
      openspec:validate` strict.
- [ ] 4.2 Live click-through proof on a fresh daemon (`bun run dev`): Play
      (run-in-game), Save&Deploy, Explore, pipeline DAG tab load — all over
      `/rpc` only (daemon log shows no `/api` traffic).
- [ ] 4.3 Downstream realignment: PLAN.md §3 S1.1 annotated with the two
      grounding corrections (rpcPath/studioServerClient deletions);
      tuner-session change notes the session-port deletion.
- [ ] 4.4 Graphite submit/merge/drain per repo rules; foreign staged trio
      preserved; repo clean.
