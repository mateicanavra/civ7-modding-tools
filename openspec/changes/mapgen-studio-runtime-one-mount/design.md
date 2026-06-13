# Design — runtime one-mount (S1.1)

## D1. Namespace merge under `civ7.*` (collision-proofed)

The unified contract is the existing studio contract with two additions:

```ts
export const contract = oc.router({
  civ7: {
    // studio read surface (unchanged): status, mapSummary, gameInfo,
    // autoplay, setupConfig, savedConfigs, setupCatalog, live.*
    ...studioCiv7Entries,
    // control surface (spread of Civ7ControlOrpcContract): attention, city,
    // diplomacy, display, government, narrative, notifications, progression,
    // readiness, strategy, turn, unit, view, world
    ...Civ7ControlOrpcContract,
  },
  runInGame, mapConfigs, studio,          // unchanged
  recipeDag: { get: RecipeDagGetContract }, // moved from the app
});
```

Verified disjoint key sets (grounding 2026-06-12): no studio `civ7.*` key
collides with a control top-level namespace. A unit pin asserts this stays
true (`Object.keys` intersection is empty) so a future control namespace
cannot silently shadow a studio procedure.

Schema heterogeneity is fine: studio contracts are zod, control + recipe-DAG
are TypeBox via standard-schema — oRPC consumes both.

## D2. One runtime, one handler, structural session

`createStudioRouter(runtime)` composes all namespaces against the ONE
`ManagedRuntime`:

- Studio procedures: unchanged effect-orpc implementations.
- Recipe-DAG procedure: re-implemented against the same `implementEffect`
  builder (its former private `ManagedRuntime.make(Layer.empty)` is deleted),
  reading the host's `recipeDagService` through the `StudioConfig` layer (the
  host context is ALREADY a runtime layer — no per-request context needed for
  recipeDag, and the effect router keeps its `Record<never, never>` initial
  context).
- Control procedures: the prebuilt `Civ7ControlOrpcRouter` merged in as plain
  oRPC procedures (they are not Effect; their per-request context carries the
  facade + endpoint defaults). The 347-test control package is untouched.

`createStudioRpcHandler(context)` wraps the composed router in ONE
`RPCHandler` and builds the per-request context internally:

```ts
const session = runtime.runPromise(Effect.map(Civ7TunerSession, (t) => t.session));
// memoized; Civ7DirectControlSession is acquired UNCONNECTED (connect() runs
// on first command and is reuse-idempotent), so awaiting this in tests opens
// no socket.
handle: async (request, options) =>
  handler.handle(request, {
    prefix: options?.prefix ?? "/rpc",
    context: {
      directControl: context.civ7Control.directControl,
      endpointDefaults: {
        timeoutMs: context.civ7Control.timeoutMs,
        session: await session,
      },
    } satisfies Civ7ControlOrpcContext,
  }),
```

The per-request context is the CONTROL context only; a rejected session
resolution clears the memo (no sticky cached failure).

The public `tuner.session()` port is deleted — its only consumer was the
daemon patch this change removes. `tuner.health()` and `dispose()` remain.

## D3. Context seams are required, not defaulted

`StudioServerContext` gains:

```ts
readonly recipeDagService: RecipeDagService;
readonly civ7Control: Readonly<{
  directControl: Civ7ControlOrpcDirectControlFacade;
  timeoutMs: number;
}>;
```

Required fields, no package-side defaults: the host names its dependencies
(daemon passes `liveCiv7ControlOrpcDirectControlFacade` +
`DEFAULT_CIV7_TUNER_TIMEOUT_MS` + the app's `defaultRecipeDagService`); tests
pass fakes. This is the same seam discipline the engines already use and
avoids a hidden live-default dual path inside the package.

Dependency direction: the recipe-DAG SERVICE (which imports
`mod-swooper-maps` recipes + `@swooper/mapgen-core/authoring`) stays in the
app at `src/server/recipeDag/service.ts`; only its TYPE
(`RecipeDagService`) moves into the package. `@civ7/studio-server` gains
deps on `@civ7/control-orpc` and `typebox` only.

## D4. Daemon + client collapse

Daemon fetch routes after this change: `/healthz` → probe; `/rpc` → the one
handler; static assets when configured; EVERYTHING else 404 (the explicit
`/api/*` branch dies with the mounts — `/api` paths now fall through to the
common 404, and the rewritten daemonFetch pins keep the retired paths,
including both old mount prefixes, asserted at 404).

Client: `lib/orpc.ts` is the one transport (`ContractRouterClient` of the
unified contract). `liveControlPort` keeps its port shape but binds to
`orpcClient.civ7.readiness.current` / `orpcClient.civ7.display.explore.request`
(typed off the contract, replacing the router-derived types).
`useRecipeDagQuery` calls `orpcClient.recipeDag.get`; `RecipeDagResult` is
re-exported from `@civ7/studio-server/contract`.

Deletions (each with its consumer set verified empty or retargeted):
`server/civ7ControlOrpc.ts`, `server/recipeDag/{orpc,contract,errors,schema,
typeboxStandardSchema,context,procedure,router}.ts`, `server/http/nodeWebBridge.ts`,
`server/studioServer/rpcPath.ts`, `shared/civ7ControlOrpc.ts`,
`shared/recipeDagOrpc.ts`, `lib/control/civ7ControlOrpcClient.ts`,
`features/recipeDag/client.ts`, `features/studioServer/studioServerClient.ts`.

## D5. Plan deviations (recorded)

1. **`rpcPath.test.ts`: DELETE, not rewrite.** PLAN §3 listed it as a
   rewrite; grounding shows `isStudioServerRpcPath` has zero production
   consumers since the daemon cutover (vite-middleware-era gate). Module +
   test die together.
2. **`studioServerClient.ts`: DELETE.** Same archaeology — a second `/rpc`
   client used only by its own test. Its non-rpc fallthrough pin migrates
   into the new single-mount contract pin; its default-URL pin dies with the
   dead twin client (the live client's URL resolution is exercised by every
   browser session, not unit-pinned — net coverage unchanged).
3. **Client `DedupeRequestsPlugin`: deferred.** Evidence: the plugin's
   default filter dedupes only `GET` requests; the RPC link sends POST.
   Enabling it would be a no-op. Re-evaluate with `BatchLinkPlugin` after
   S3.2 kills the polls.

## D6. Test relayering for this slice

- REWRITE `test/server/daemonFetch.test.ts`: single-mount route table;
  `/healthz` pins unchanged; 404 pins extended with `/api/civ7/rpc/...` and
  `/api/recipe-dag/rpc/...`.
- NEW `test/server/oneMount.test.ts` (single-mount contract pin): real
  `createStudioRpcHandler` over `node:http` with fake context (fake facade,
  fake recipeDag service, stub engines); asserts (a) `studio.serverInfo`,
  (b) `civ7.readiness.current` (and that `endpointDefaults` carried
  `timeoutMs` + the shared session object), (c) `recipeDag.get` + its
  `RECIPE_DAG_RECIPE_NOT_FOUND` typed error — all over ONE `/rpc` prefix;
  (d) out-of-scope path 404 fallthrough; (e) contract-collision guard
  (disjoint `civ7.*` key sets).
- DELETE `test/studioServer/rpcPath.test.ts`,
  `test/studioServer/studioServerClient.test.ts`,
  `test/runInGame/civ7ControlOrpcClient.test.ts`,
  `test/recipeDag/orpc.test.ts` (coverage subsumed by the new pin; the
  control sanitization pins — no host/port/state leakage — move into the new
  pin's readiness assertion).
- `test/recipeDag/artifactPresentation.test.ts` retargets type imports to
  the package.
- Package-side: `packages/studio-server` gains router-composition tests only
  if compose logic warrants; the contract pin lives app-side where the
  daemon mounts it.
