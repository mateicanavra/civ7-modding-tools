# oRPC × Effect × Bun — Canonical Reference for the mapgen-studio API rewrite

**Status:** Research lane deliverable (greenfield — no oRPC/Effect in repo today)
**Date context:** 2026-06-08
**Target:** `apps/mapgen-studio` — replace ~660 lines of hand-rolled Vite `server.middlewares.use("/api/...")` handlers (`apps/mapgen-studio/vite.config.ts`, lines ~374–1100) with a native Effect + oRPC router mounted on `Bun.serve`, consumed by the React client with end-to-end type safety.

> All versions, package names, and code below were verified against the live npm registry and the official oRPC docs (`orpc.dev`) on 2026-06-08. This is **not** from training memory. Where the API has changed (it has, a lot — `os`/`oc` builders, `.handle()` return shape, plugin-based CORS), the current surface is used.

---

## 0. One-screen summary (read this first)

**Recommended stack shape**

```
packages/studio-api/            # NEW workspace package (the API surface, server-agnostic)
  contract/        oc.router(...) contracts + zod schemas + error maps   (@orpc/contract, zod)
  effect/          Effect services + Layers (Civ7DirectControl, MapConfigs, RunInGame)
  router/          implementEffect(contract, runtime) -> router          (effect-orpc, @orpc/server)
  server/          Bun.serve entry: RPCHandler(router) on /rpc           (@orpc/server/fetch)
apps/mapgen-studio/
  src/lib/orpc.ts  createORPCClient(RPCLink) + RouterClient<typeof router> type
  vite.config.ts   dev-only proxy /rpc -> Bun server (replaces middlewares)
```

- **Transport:** `RPCHandler` only (internal TS-to-TS client). No OpenAPI handler needed — there are no external consumers. Skip `@orpc/openapi*` entirely unless/until you want a documented REST surface.
- **Effect bridge:** use the **`effect-orpc`** package (`implementEffect` / `makeEffectORPC`). It is a real, idiomatic bridge — handlers are Effect generators, services come from a `ManagedRuntime`, and the Effect error channel maps to `ORPCError` via `ORPCTaggedError`. This is the single most important finding: you do **not** hand-roll `Effect.runPromise` glue in every handler.
- **Validation:** **Zod** at the oRPC boundary (oRPC validates via Standard Schema; Zod is the path of least resistance and what `effect-orpc` examples use). Effect Schema is *not* yet a documented first-class oRPC validator — see §5. Keep Effect Schema for internal domain modeling if you want, convert at the boundary.
- **Bun:** `Bun.serve({ fetch })` calling `handler.handle(request, { prefix: '/rpc', context })` → `{ matched, response }`. Verbatim pattern in §4.

**Single biggest integration risk**

`effect-orpc` is at **v0.2.2** (last published 2026-05-10), single-maintainer (`utopyin`), pre-1.0. It pins peer deps `@orpc/* >=1.13.0` and `effect >=3.18.0` (we'd use `1.14.5` / `3.21.3` — compatible). The risk is **bus-factor / churn on a young bridge**, not correctness. Mitigation: the bridge is thin (`makeEffectORPC` is ~a `ManagedRuntime` + `Effect.runPromise` wrapper around the stock `os` builder). If it stalls, you can inline the same ~30-line adapter and keep contracts/router untouched. Architect so `effect-orpc` is only imported in `router/`, never in `contract/` or `effect/`.

**Exact packages + versions to install** (verified on npm 2026-06-08)

```jsonc
// Server / contract / client (align all @orpc/* to one version via Bun catalog)
"@orpc/server":   "1.14.5",
"@orpc/client":   "1.14.5",
"@orpc/contract": "1.14.5",
// Effect bridge
"effect-orpc":    "0.2.2",
"effect":         "3.21.3",
// Validation at the boundary
"zod":            "^3.25 || ^4"   // oRPC supports both; match repo's existing zod if present
// Optional (only if you later add React Query helpers)
"@orpc/tanstack-query": "1.14.5"
```

`@orpc/server` re-exports the `@orpc/shared` peer that `effect-orpc` wants; no separate install needed. `@effect/platform-bun` is **not** required (oRPC owns the HTTP layer; Effect just runs business logic).

---

## 1. Current oRPC architecture (`os` / `oc`, handlers, routers, contract-first vs implementation-first)

### 1.1 Two builders

- **`os`** (from `@orpc/server`) — the **implementation-first** builder. You attach `.input()`, `.output()`, `.use()`, `.handler()` directly and the types flow from the implementation.
- **`oc`** (from `@orpc/contract`) — the **contract-first** builder. It defines the *shape* (input/output/errors/route) with no implementation, producing a sharable artifact. You then bind handlers with `implement(contract)`.

### 1.2 Implementation-first (the quickstart shape)

A procedure is a chain ending in `.handler()`. Routers are plain nested objects.

```ts
import { ORPCError, os } from '@orpc/server'
import * as z from 'zod'

export const findPlanet = os
  .input(z.object({ id: z.number().int().min(1) }))
  .output(z.object({ id: z.number(), name: z.string() }))
  .handler(async ({ input }) => {
    return { id: input.id, name: 'name' }
  })

export const router = {
  planet: { find: findPlanet },   // nested objects compose the router
}
```

- `.input(schema)` / `.output(schema)` take any **Standard Schema** validator (Zod, Valibot, ArkType…). `.output()` is optional but recommended for contract stability.
- The handler receives `{ input, context, errors, signal, lastEventId }`. It returns the output value directly; it throws to signal errors.
- The router is just an object tree — keys become procedure paths (`planet.find`).

### 1.3 Contract-first (`oc` + `implement`)

Define the contract once (no server deps), then implement it. This is the recommended shape for this project because contracts live in a package the client can also type-import.

```ts
// contract.ts  — depends only on @orpc/contract + zod
import { oc } from '@orpc/contract'
import * as z from 'zod'

export const contract = oc.router({
  civ7: {
    status: oc
      .input(z.object({}))
      .output(z.object({ ok: z.boolean(), playable: z.boolean() })),
    mapSummary: oc
      .input(z.object({ includeAreaRegionCounts: z.boolean().default(true) }))
      .output(z.object({ /* ... */ })),
  },
})
```

```ts
// router.ts — binds handlers to the contract
import { implement } from '@orpc/server'
import { contract } from './contract'

const os = implement(contract)   // os is now contract-aware; handlers must match contract I/O

export const router = os.router({
  civ7: {
    status:     os.civ7.status.handler(async () => ({ ok: true, playable: true })),
    mapSummary: os.civ7.mapSummary.handler(async ({ input }) => ({ /* ... */ })),
  },
})
```

**Which to choose here:** contract-first. It gives you (a) a `contract` artifact the React app type-imports without pulling server code, (b) drift control via snapshot tests, (c) clean separation between "what the API is" and "how Civ7 direct-control is called." With `effect-orpc`, contract-first uses `implementEffect(contract, runtime)` instead of `implement(contract)` (see §3).

### 1.4 Router composition

Routers nest by object literal. You can also `os.router(...)`-wrap to apply shared `.use()`/`.errors()`/`.meta()` to a whole subtree. Procedure path = object key path (`civ7.live.snapshot`), which becomes the RPC call path on the client (`client.civ7.live.snapshot(input)`).

---

## 2. Middleware & context (auth/logging/DI) — `.use()`, `.$context`, typed propagation

### 2.1 Initial context vs derived context

- **Initial context** is what you pass into `handler.handle(request, { context })` at the transport edge. Declare its type with `.$context<T>()`.
- **Derived context** is what middleware adds via `next({ context: {...} })`. Each `.use()` can narrow/extend the context, and the new keys are typed for everything downstream.

```ts
import type { IncomingHttpHeaders } from 'node:http'
import { ORPCError, os } from '@orpc/server'

export const authed = os
  .$context<{ headers: IncomingHttpHeaders }>()   // declares required initial context
  .use(({ context, next }) => {
    const user = parseJWT(context.headers.authorization?.split(' ')[1])
    if (!user) throw new ORPCError('UNAUTHORIZED')
    return next({ context: { user } })            // adds `user` to context, typed downstream
  })

export const createPlanet = authed
  .input(PlanetSchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    context.user        // <- fully typed, guaranteed present
  })
```

### 2.2 Middleware signature

A middleware is `({ context, next, path, procedure, errors, signal }) => next(...)`. It must call (and return) `next()`. To inject dependencies, return `next({ context: { db, logger, civ7: directControlClient } })`. This is oRPC's native DI pattern — there is no separate container.

### 2.3 For this project

The mapgen-studio API is local-machine, single-user, no auth. Context here is **dependency injection**, not auth: inject the Civ7 direct-control client, the operation stores (`createRunInGameOperationStore`, `createMapConfigSaveDeployOperationStore`), and a logger. With `effect-orpc`, prefer providing these as **Effect Layers in the `ManagedRuntime`** (§3) rather than oRPC middleware context — that's the more idiomatic split. Use oRPC `.use()` for transport-level concerns (request logging, response headers) and the Effect runtime for business-service injection.

### 2.4 Logging / error interception

Handler-level interceptors run at the `RPCHandler` boundary:

```ts
import { onError } from '@orpc/server'

const handler = new RPCHandler(router, {
  interceptors: [ onError((error) => console.error(error)) ],
})
```

---

## 3. oRPC × Effect — the `effect-orpc` bridge (the load-bearing piece)

**Verdict: there is a real, idiomatic bridge.** It is the community package **`effect-orpc`** (`utopyin/effect-orpc`, v0.2.2, published 2026-05-10), not part of `@orpc/*` core. Without it you'd do manual `Effect.runPromise(program.pipe(Effect.provide(layer)))` inside each `.handler()` and hand-map failures to `ORPCError`. With it, handlers *are* Effect generators and errors map automatically. Be honest: this is **glue maintained by one person**, but it is thin, typed, and currently healthy.

### 3.1 The runtime + builder

Services are Effect `Layer`s composed into a `ManagedRuntime`. `makeEffectORPC(runtime)` wraps the stock `os` builder so `.effect(...)` handlers can `yield*` those services with compile-time enforcement (using a service not in the runtime is a type error).

```ts
import { Effect, Layer, ManagedRuntime } from 'effect'
import { makeEffectORPC, ORPCTaggedError } from 'effect-orpc'
import * as z from 'zod'

// A service (DI unit) — wraps @civ7/direct-control calls
class Civ7Control extends Effect.Service<Civ7Control>()('Civ7Control', {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      playableStatus: () => Effect.tryPromise(() => getCiv7PlayableStatus({ timeoutMs: 5000 })),
    }
  }),
}) {}

const AppLayer = Layer.mergeAll(Civ7Control.Default /*, MapConfigs.Default, ... */)
const runtime = ManagedRuntime.make(AppLayer)

const effectOs = makeEffectORPC(runtime)

export const status = effectOs
  .input(z.object({}))
  .effect(function* () {
    const status = yield* Civ7Control.playableStatus()
    return { ok: status.playable, playable: status.playable }
  })
```

### 3.2 Contract-first with Effect: `implementEffect`

For the recommended contract-first layout, use `implementEffect(contract, runtime)`. Leaf nodes expose `.effect(...)` while preserving the contract's I/O types:

```ts
import { implementEffect } from 'effect-orpc'
import { contract } from './contract'

const oe = implementEffect(contract, runtime)

export const router = oe.router({
  civ7: {
    status: oe.civ7.status.effect(function* () {
      const s = yield* Civ7Control.playableStatus()
      return { ok: s.playable, playable: s.playable }
    }),
  },
})
```

### 3.3 Error channel → `ORPCError`

`ORPCTaggedError(tag, options?)` creates Effect-native error classes that double as oRPC typed errors. Options: `{ schema?, code?, status?, message? }` (`code` defaults to CONSTANT_CASE of the tag). When such an error is `yield*`-ed or an Effect fails with one, the runtime converts it to an `ORPCError` carrying that code/status/message/data. Register them with `.errors(...)`:

```ts
class Civ7Unavailable extends ORPCTaggedError('Civ7Unavailable', {
  code: 'SERVICE_UNAVAILABLE', status: 503,
  schema: z.object({ reason: z.string() }),
}) {}

export const status = effectOs
  .errors({ SERVICE_UNAVAILABLE: Civ7Unavailable })
  .input(z.object({}))
  .effect(function* () {
    const s = yield* Civ7Control.playableStatus().pipe(
      Effect.catchAll(() => new Civ7Unavailable({ reason: 'tuner offline' })),
    )
    return { ok: s.playable, playable: s.playable }
  })
```

There is also an Effect-aware contract builder `eoc` that accepts `ORPCTaggedError` classes directly in `.errors(...)` without re-declaring schemas.

### 3.4 Other niceties

- **Auto-tracing:** every `.effect(...)` procedure is wrapped in `Effect.withSpan` named by procedure path; override with `.traced('name')`. Add an OTel layer to the runtime to export.
- **Request-scoped fiber context:** `effect-orpc/node` exports `withFiberContext` to preserve `FiberRef` state (request IDs, log annotations) across the async boundary — uses `node:async_hooks` (works on Bun). Only needed if you annotate logs/traces per-request; for mapgen-studio it's optional.
- `EffectBuilder` exposes both `.effect(handler)` (Effect generator) and `.handler(handler)` (plain async) so you can migrate procedure-by-procedure.

### 3.5 Manual fallback (if you reject the dependency)

If you'd rather not depend on a v0.x package, the equivalent inline pattern is small:

```ts
const runtime = ManagedRuntime.make(AppLayer)
export const status = os.input(z.object({})).handler(async () => {
  return runtime.runPromise(
    Effect.gen(function* () {
      const s = yield* Civ7Control.playableStatus()
      return { ok: s.playable, playable: s.playable }
    }).pipe(
      Effect.catchTag('Civ7Unavailable', (e) =>
        Effect.fail(new ORPCError('SERVICE_UNAVAILABLE', { data: { reason: e.reason } }))),
    ),
  )
})
```

Recommendation: **start with `effect-orpc`**, keep it isolated to `router/`, and you can swap to the manual form later without touching contracts or services.

---

## 4. Mounting on Bun (`Bun.serve` + RPCHandler)

oRPC's `fetch` adapter targets the Web `Request`/`Response` API that `Bun.serve` speaks. This is the **verbatim current pattern** from `orpc.dev/docs/adapters/http`:

```ts
import { RPCHandler } from '@orpc/server/fetch'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server'
import { router } from './router'

const handler = new RPCHandler(router, {
  plugins: [ new CORSPlugin() ],
  interceptors: [ onError((error) => console.error(error)) ],
})

Bun.serve({
  port: Number(process.env.PORT ?? 8787),
  async fetch(request: Request) {
    const { matched, response } = await handler.handle(request, {
      prefix: '/rpc',
      context: {},               // initial context (DI lives in the Effect runtime here)
    })
    if (matched) return response
    return new Response('Not found', { status: 404 })
  },
})
```

Key facts (verified):

- **`handle()` returns `{ matched, response }`** (fetch adapter). `matched: false` means no procedure matched the path — fall through to your own 404 / static serving.
- **`prefix`** must match the URL path the client hits. Client `RPCLink({ url: '.../rpc' })` ⇄ handler `prefix: '/rpc'`. Mismatch = silent 404s (documented gotcha).
- **CORS** is a **plugin**, not config: `new CORSPlugin({ origin, allowMethods, allowHeaders, credentials })`. Default `new CORSPlugin()` is permissive enough for local dev; for same-origin (proxied through Vite) you can omit it.
- **Body parsing:** oRPC reads the raw `Request` body itself. Do **not** put a framework in front that consumes the stream first (this is why we use bare `Bun.serve`, not Elysia/Hono wrapping the same route — if you ever do, disable that framework's body parsing on the forwarded route).
- **Streaming:** supported natively via Event Iterators (AsyncIterator at the root of a handler return). Relevant if you want to stream run-in-game progress instead of polling an operation store — the handler keeps the connection open and emits events; `RPCLink` consumes them as an async iterable. Keep-alive/initial-comment options exist on the handler (`eventIteratorKeepAliveEnabled`, etc.).
- **GET hardening:** `StrictGetMethodPlugin` is **on by default** (prevents CSRF-ish GET exposure). Leave it on.

### Serving alongside Vite (dev) and in production

**Dev:** run the Bun API server as a separate process on its own port, and proxy from Vite so the browser sees one origin (no CORS):

```ts
// vite.config.ts (dev) — replaces the entire server.middlewares block
export default defineConfig({
  server: {
    proxy: { '/rpc': { target: 'http://localhost:8787', changeOrigin: true } },
  },
})
```

The `dev` script becomes "start Bun API + start Vite" (e.g. via a concurrently-style runner or a Turborepo task that runs both). This removes the ~660 lines from `vite.config.ts` and the dev/prod parity gap (see below).

**Production:** today `apps/mapgen-studio/railway.json` starts **Caddy serving static `dist`** only — the `/api/*` middlewares exist **only in the Vite dev server and do not exist in the deployed app**. The rewrite is the chance to fix that. Two options:

1. **Caddy reverse-proxy + Bun service** — keep Caddy for static `dist`, add a `reverse_proxy /rpc/* localhost:8787` and run the Bun server as a second process/container. Lowest change to the static-serving story.
2. **Bun serves everything** — `Bun.serve` handles `/rpc` and falls back to serving `dist` static files (Bun has a `static`/file-serving story) and `index.html` for SPA routes. Collapses to one process; drop Caddy.

Given this is a local-dev tool that talks to a desktop Civ7 process, the production "deploy" is mostly the hosted-docs/demo surface; the Civ7 direct-control endpoints only work where the game runs. Decide explicitly which procedures are meaningful in the Railway deploy vs local-only.

---

## 5. Validation / schema choice (Effect Schema vs Zod)

- oRPC validates `.input`/`.output`/error-`data` via **Standard Schema**. Officially supported & documented: **Zod, Valibot, ArkType**. `@orpc/zod` adds Zod-specific helpers (JSON-schema conversion, file/blob coercion) if needed.
- **Effect Schema is not (yet) a documented first-class oRPC validator.** Effect's `@effect/schema` does not currently expose a Standard Schema adapter that oRPC documents. The `effect-orpc` examples all use **Zod** at the boundary. Do not assume Effect Schema "just works" as an oRPC validator without verifying — treat that as a spike if you want it.
- **Recommendation:** **Zod at the oRPC boundary.** If your Effect domain services model data with Effect Schema internally, decode/encode at the service edge and expose plain types; the contract uses Zod. This mirrors the skill's "domain source-of-truth → Standard-Schema validator at the boundary" golden path (the skill uses TypeBox→Zod via `@sinclair/typemap`; here the analogue is EffectSchema→plain→Zod, or just author the contract schemas in Zod directly, which is simplest for ~17 endpoints).
- Many of the current endpoints already do ad-hoc validation in `./src/server/*/requestValidation.ts` (e.g. `parseRunInGameSetupRequest`, `parseMapConfigSaveRequest`). Port those into Zod contract `.input` schemas so validation is declarative and the error responses become typed `ORPCError`s.

---

## 6. Recommended project structure

New workspace package `packages/studio-api` (Bun workspace + Turborepo, matching repo conventions). Dependency rule: **`contract/` imports only `@orpc/contract` + `zod`; `effect/` imports only `effect` + `@civ7/direct-control`; `router/` is the only place that imports `effect-orpc` and ties them together.**

```
packages/studio-api/
  package.json
  src/
    contract/
      index.ts            # oc.router({...}) — the full API surface
      civ7.ts             # civ7.status, civ7.mapSummary, civ7.gameinfo, civ7.live.*
      civ7-autoplay.ts    # civ7.autoplay.{status,start,stop}
      run-in-game.ts      # civ7.runInGame.{status,start}
      map-configs.ts      # mapConfigs.{status,list,save}
      setup.ts            # civ7.setupConfig, civ7.savedConfigs, civ7.setupCatalog
      errors.ts           # ORPCTaggedError classes (Civ7Unavailable, RunInGameError, ...)
    effect/
      runtime.ts          # ManagedRuntime.make(AppLayer)
      services/
        Civ7Control.ts    # Effect.Service wrapping @civ7/direct-control reads
        MapConfigs.ts      # save/deploy operation store + deploy command
        RunInGame.ts       # operation state machine, log failure waits, proofs
    router/
      index.ts            # implementEffect(contract, runtime) -> router; export type AppRouter
    server/
      index.ts            # Bun.serve({ fetch }) + RPCHandler + CORS + onError
  tsconfig.json

apps/mapgen-studio/
  src/lib/orpc.ts         # RPCLink + createORPCClient -> typed `orpc` client
                          # import type { AppRouter } from '@civ7/studio-api/router'
  vite.config.ts          # dev proxy /rpc -> :8787 (middlewares deleted)
```

- Export `export type AppRouter = typeof router` (or `RouterClient<typeof router>`) for the client to type-import — **type-only import**, so the client never bundles server/Effect code.
- The existing `apps/mapgen-studio/src/server/*` helpers (operationState, deploy, requestValidation, proofIdentity, macosProcessRestart, logFailure) move into `packages/studio-api/src/effect/services/*` and get wrapped as Effect services. They're already well-factored, so this is mostly relocation + a thin Effect veneer.

---

## 7. Migration notes — hand-rolled `req/res` → oRPC procedure

The current endpoints follow a uniform shape. Map them mechanically:

| Hand-rolled pattern | oRPC equivalent |
|---|---|
| `server.middlewares.use("/api/civ7/status", (req,res,next)=>{...})` | procedure `civ7.status` in the router (path from key) |
| `if (req.method !== "GET") return next()` | implicit — RPC is POST; method gating goes away (or `.route({method})` only if using OpenAPI) |
| parse `new URL(req.url).searchParams` | declarative `.input(z.object({...}))`; client passes a typed object |
| manual JSON body read | oRPC reads + validates body against `.input` schema |
| `writeJson(res, 200, {...})` | `return {...}` (validated against `.output`) |
| `writeJson(res, 500, { ok:false, error })` | `throw new ORPCError('...')` / `throw errors.X()` / `yield* new TaggedError()` |
| `try/catch` per handler | Effect error channel + `onError` interceptor + typed `.errors()` |
| shared helpers (`getCiv7MapGrid`, operation stores) | injected via Effect runtime services |

**Worked example.** Current (`vite.config.ts`):

```ts
server.middlewares.use("/api/civ7/gameinfo", async (req, res, next) => {
  if (req.method !== "GET") return next();
  try {
    const url = new URL(req.url ?? "", "http://localhost");
    const table = url.searchParams.get("table");
    if (!table) throw new Error("Missing table query parameter");
    const limit = Number(url.searchParams.get("limit") ?? "100");
    const rows = await getCiv7GameInfoRows({ table, limit }, { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS });
    writeJson(res, 200, { ok: true, rows });
  } catch (err) {
    writeJson(res, 400, { ok: false, error: err instanceof Error ? err.message : "..." });
  }
});
```

Becomes — contract:

```ts
// contract/civ7.ts
gameinfo: oc
  .input(z.object({ table: z.string().min(1), limit: z.number().int().min(1).max(1000).default(100) }))
  .output(z.object({ rows: z.array(z.record(z.unknown())) }))
```

— and Effect handler:

```ts
// router/index.ts
gameinfo: oe.civ7.gameinfo.effect(function* ({ input }) {
  const rows = yield* Civ7Control.gameInfoRows(input.table, input.limit) // Effect.tryPromise inside
  return { rows }
}),
```

Client call (end-to-end typed, validation + 400 handled by oRPC):

```ts
const { rows } = await orpc.civ7.gameinfo({ table: 'Terrains', limit: 50 })
```

Note the response envelope flattens: drop `{ ok: true, ... }` wrappers — success is implicit (resolved promise / `data`), failure is an `ORPCError` the client distinguishes via `safe()` + `isDefinedError` (§ below). Migrate the React fetch sites to the typed client at the same time.

### Client setup + error handling (the consuming side)

```ts
// apps/mapgen-studio/src/lib/orpc.ts
import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { AppRouter } from '@civ7/studio-api/router'   // type-only

const link = new RPCLink({ url: '/rpc' })   // same-origin via Vite proxy / Caddy
export const orpc: RouterClient<AppRouter> = createORPCClient(link)
```

```ts
import { isDefinedError, safe } from '@orpc/client'

const { error, data, isDefined } = await safe(orpc.civ7.status({}))
if (isDefinedError(error)) {
  // typed error from .errors(): error.code, error.data is schema-typed
} else if (error) {
  // unexpected
} else {
  data.playable
}
```

`RPCLink` supports `headers`, custom `fetch`, and resilience plugins (`ClientRetryPlugin`, `RetryAfterPlugin` from `@orpc/client/plugins`) and per-call `AbortSignal` for timeouts — useful for the long-running run-in-game calls.

---

## 8. Pitfalls / contract checklist (project-specific)

1. **Prefix alignment:** `RPCLink.url` path ⇄ handler `prefix`. Off-by-one = silent 404.
2. **`effect-orpc` is v0.x:** isolate it to `router/`; pin the exact version; add a smoke test that exercises one `.effect` procedure end-to-end so an upgrade break is caught in CI.
3. **Don't double-consume the body:** use bare `Bun.serve`, no body-parsing framework in front of `/rpc`.
4. **Effect Schema is not a verified oRPC validator** — use Zod at the boundary; spike before assuming otherwise.
5. **Production parity:** the current `/api/*` exists only in Vite dev; decide the Railway story (Caddy reverse_proxy vs Bun-serves-all) deliberately — don't recreate the dev-only gap.
6. **Local-only procedures:** Civ7 direct-control only works where the game runs. Tag/segregate procedures that are meaningless in a hosted deploy.
7. **Error payload hygiene:** `ORPCError.data` reaches the client — don't leak filesystem paths / internal detail from the Civ7 tuner.
8. **Drift control:** snapshot the contract (oRPC's `minifyContractRouter` helper) in a test so API changes are reviewed explicitly.

---

## Sources (verified 2026-06-08)

- oRPC HTTP adapter (Bun.serve verbatim, `{matched,response}`, prefix, CORS): https://orpc.dev/docs/adapters/http
- oRPC Getting Started (`os`, `.use`, `.$context`, `ORPCError`, router, client): https://orpc.dev/docs/getting-started
- RPCHandler API (plugins, filter, default StrictGetMethodPlugin, supported types, streaming): https://orpc.dev/docs/rpc-handler
- Error handling (`ORPCError`, `.errors()`, typed throws): https://orpc.dev/docs/error-handling
- Client error handling (`safe`, `isDefinedError`, `createSafeClient`): https://orpc.dev/docs/client/error-handling
- CORS plugin: https://orpc.dev/docs/plugins/cors
- **effect-orpc bridge** (`makeEffectORPC`, `implementEffect`, `ORPCTaggedError`, `eoc`, `withFiberContext`, tracing): https://github.com/utopyin/effect-orpc
- npm versions: `@orpc/server@1.14.5`, `@orpc/client@1.14.5`, `@orpc/contract@1.14.5`, `@orpc/zod@1.14.5`, `@orpc/tanstack-query@1.14.5`, `effect-orpc@0.2.2` (peers `@orpc/* >=1.13.0`, `effect >=3.18.0`; published 2026-05-10), `effect@3.21.3`
- Repo state: `apps/mapgen-studio/vite.config.ts` (lines ~374–1100, 17 `middlewares.use` routes), `apps/mapgen-studio/package.json` (Bun 1.3.7, React 19, Vite 7), `apps/mapgen-studio/railway.json` + `Caddyfile` (static-only prod deploy)
- Internal skill: `dev:orpc` (`/Users/mateicanavra/.claude/plugins/cache/local/dev/0.1.0/skills/orpc/`) — contract-first, transports, schemas, monorepo, networking references
