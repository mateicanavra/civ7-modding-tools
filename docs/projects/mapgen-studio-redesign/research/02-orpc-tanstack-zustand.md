# Client Data Architecture: oRPC + TanStack Query + Zustand

Canonical reference for the `apps/mapgen-studio` client data layer in the React 19 redesign.
Research lane: client-data-architecture. Date: 2026-06-08.

---

## 0. TL;DR (1-screen summary)

**The stack (verified current versions, npm `latest` as of 2026-06-08):**

| Package | Version | Role |
| --- | --- | --- |
| `@orpc/client` | `1.14.5` | `RPCLink` (fetch transport) + `createORPCClient` |
| `@orpc/tanstack-query` | `1.14.5` | `createTanstackQueryUtils` — the native TanStack Query integration |
| `@tanstack/react-query` | `5.101.0` | **peer dependency** — provides `QueryClient` + `QueryClientProvider` + hooks |
| `zustand` | `5.0.14` | client/UI state only |
| `@orpc/contract` / `@orpc/server` | `1.14.5` | server side (typed router → `RouterClient<typeof router>` type export) |

> Skill `dev:orpc` pins `1.13.4` (dated 2026-02-05). Live npm is `1.14.5`. The TanStack Query
> API surface (`createTanstackQueryUtils`, `*.queryOptions`, `*.key`) is stable across that range.

**VERDICT on "do we use oRPC's native query utils directly?": YES — directly, no hand-written query client.**
`createTanstackQueryUtils(client)` returns a tree of utilities (`orpc.x.queryOptions(...)`,
`orpc.x.mutationOptions(...)`, `orpc.x.key(...)`) that you feed straight into the *standard*
`useQuery` / `useMutation` / `useQueryClient` hooks from `@tanstack/react-query`. There is **no**
custom query client, no hand-rolled query-key factory, no wrapper hooks library to build. oRPC
generates type-safe `queryOptions` objects; TanStack Query consumes them. You still install and
provide `@tanstack/react-query`'s `QueryClient` yourself (it is a peer dep, not bundled by oRPC).

**The one crisp rule (server state vs client state):**
> **If the value comes from (or is owned by) the server, it lives in TanStack Query (via oRPC).
> If it only exists in the browser and the server neither produces nor validates it, it lives in
> Zustand.** Never copy server data into Zustand; subscribe to the query cache instead.

---

## 1. The exact oRPC → TanStack Query wiring

### 1.1 The client module (`lib/orpc.ts`)

One module owns URL resolution, the link, the typed client, and the query utils. This kills the
"every component builds its own client" problem.

```ts
// lib/orpc.ts
import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { RouterClient } from '@orpc/server'
import type { router } from '../../server/router' // type-only import of the server router

// 1. Link: HTTP/fetch transport to the RPC handler.
//    Vite SPA, same-origin → relative '/rpc' is fine and avoids env wiring.
const link = new RPCLink({
  url: () => `${window.location.origin}/rpc`, // lazy: only evaluated in the browser
  fetch: (request, init) =>
    globalThis.fetch(request, { ...init, credentials: 'include' }), // send auth cookies
  interceptors: [
    onError((error) => {
      // central client-side logging hook (optional)
      console.error('[orpc]', error)
    }),
  ],
})

// 2. Typed client. RouterClient<typeof router> gives full end-to-end types
//    WITHOUT importing any server runtime code (type-only import above).
export const client: RouterClient<typeof router> = createORPCClient(link)

// 3. TanStack Query utilities. THIS is the whole "query client" — generated, not written.
export const orpc = createTanstackQueryUtils(client)
```

`createTanstackQueryUtils(client)` mirrors the procedure tree. For a router with
`mapConfigs.save`, `civ7.liveStatus`, `civ7.runInGame`, you get `orpc.mapConfigs.save.*`,
`orpc.civ7.liveStatus.*`, etc. Each leaf exposes:

| Utility | Purpose |
| --- | --- |
| `.queryOptions({ input, ... })` | full options object for `useQuery` / `useSuspenseQuery` / `prefetchQuery` |
| `.infiniteOptions({ input: (pageParam) => ..., ... })` | for `useInfiniteQuery` |
| `.experimental_streamedOptions(...)` / `.experimental_liveOptions(...)` | Event Iterator streaming/live (array vs latest) |
| `.mutationOptions({ ... })` | options object for `useMutation` |
| `.call(input)` | imperative call (alias of the underlying client procedure) |
| `.key({ input?, type? })` | **partial** query key — for invalidation/matching |
| `.queryKey({ input })` / `.infiniteKey(...)` / `.mutationKey(...)` | **full** keys — for `setQueryData`, exact matching |

### 1.2 Call sites — standard TanStack hooks, oRPC options

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '../lib/orpc'

// QUERY
function SavedConfigs() {
  const { data, isPending, isError } = useQuery(
    orpc.civ7.savedConfigs.queryOptions(), // no input → call with nothing
  )
  // ...
}

// QUERY WITH INPUT
function SetupConfig({ enabled }: { enabled: boolean }) {
  const query = useQuery(
    orpc.civ7.setupConfig.queryOptions({
      input: {},
      enabled, // any standard TanStack option is passed straight through
    }),
  )
}

// MUTATION + INVALIDATION
function SaveButton() {
  const qc = useQueryClient()
  const save = useMutation(
    orpc.mapConfigs.save.mutationOptions({
      onSuccess: () => {
        // invalidate everything under the mapConfigs namespace
        qc.invalidateQueries({ queryKey: orpc.mapConfigs.key() })
      },
    }),
  )
  return <button onClick={() => save.mutate({ config /* typed input */ })}>Save</button>
}
```

### 1.3 Query-key structure & invalidation

oRPC keys are **hierarchical arrays** shaped roughly `[[...procedurePath], { type, input }]`.
You almost never write them literally — you call the generated helpers and let partial matching
do the work:

```ts
const qc = useQueryClient()

// Invalidate ALL civ7 queries (any procedure under civ7.*)
qc.invalidateQueries({ queryKey: orpc.civ7.key() })

// Invalidate only non-infinite queries for one procedure
qc.invalidateQueries({ queryKey: orpc.civ7.liveStatus.key({ type: 'query' }) })

// Invalidate one exact input
qc.invalidateQueries({ queryKey: orpc.civ7.runInGameStatus.key({ input: { requestId } }) })

// Optimistic / manual cache write (FULL key)
qc.setQueryData(
  orpc.civ7.runInGameStatus.queryKey({ input: { requestId } }),
  (old) => ({ ...old, status: 'running' }),
)
```

Rule of thumb: `.key(...)` for **invalidate/match** (partial), `.queryKey(...)` /
`.mutationKey(...)` for **exact read/write** (`setQueryData`, `getQueryData`).

### 1.4 Optimistic updates

Standard TanStack pattern; keys come from oRPC:

```ts
const update = useMutation(orpc.studio.rename.mutationOptions({
  onMutate: async (vars) => {
    const key = orpc.studio.get.queryKey({ input: { id: vars.id } })
    await qc.cancelQueries({ queryKey: key })
    const prev = qc.getQueryData(key)
    qc.setQueryData(key, (old) => ({ ...old, name: vars.name }))
    return { prev, key }
  },
  onError: (_e, _v, ctx) => ctx && qc.setQueryData(ctx.key, ctx.prev),
  onSettled: (_d, _e, _v, ctx) => ctx && qc.invalidateQueries({ queryKey: ctx.key }),
}))
```

### 1.5 Type-safe error handling

oRPC `ORPCError`s are propagated to TanStack `error`. Use `isDefinedError` to narrow to
contract-declared errors:

```ts
import { isDefinedError } from '@orpc/client'

const m = useMutation(orpc.mapConfigs.save.mutationOptions({
  onError: (error) => { if (isDefinedError(error)) { /* typed .code / .data */ } },
}))
```

---

## 2. VERDICT: native oRPC query utils directly (not a separate React Query layer)

**Use oRPC's generated utilities directly. Do not build a parallel React Query abstraction.**

What "native integration" concretely means here:

1. **No custom query client / no query-key factory.** `createTanstackQueryUtils(client)` IS the
   integration. It generates `queryOptions`/`mutationOptions`/`key` for every procedure, fully
   typed from the contract. Writing your own `useSavedConfigs()` wrappers around `fetch` (the
   current pattern) is exactly what we delete.

2. **`@tanstack/react-query` remains a real peer dependency you install and provide.** oRPC does
   not bundle or re-export TanStack Query. You install `@tanstack/react-query@5`, create the
   `QueryClient`, and wrap the app in `QueryClientProvider`. oRPC only produces the *options
   objects* you pass to the hooks.

3. **Minimal idiomatic wiring** (the entire server-state layer):
   - `lib/orpc.ts` — `RPCLink` → `createORPCClient` → `createTanstackQueryUtils` (Section 1.1).
   - `lib/query.ts` — one `QueryClient` factory (Section 6).
   - Provider in `main.tsx` — `<QueryClientProvider client={queryClient}>`.
   - Components call `useQuery(orpc.x.queryOptions(...))` / `useMutation(orpc.x.mutationOptions(...))`.
   That's it. No `services/`, no `api/` hooks folder, no key constants file.

**QueryClient provisioning (SPA):**

```ts
// lib/query.ts
import { QueryClient } from '@tanstack/react-query'
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: false },
    },
  })
}
```

```tsx
// main.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createQueryClient } from './lib/query'

function Root() {
  const [queryClient] = useState(createQueryClient) // stable across renders
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
```

> Note: a stale `QueryClient` from a module-level singleton is fine for a pure SPA, but the
> `useState(createQueryClient)` form is the idiomatic, future-proof default (matches oRPC's own
> docs and avoids cross-render identity churn during HMR).

**One optional extra:** if you want `GET` requests (browser/CDN caching, server log readability)
for read procedures, oRPC sets a TanStack *operation context* you can read in the link's `method`:

```ts
import { TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL, type TanstackQueryOperationContext } from '@orpc/tanstack-query'

interface ClientContext extends TanstackQueryOperationContext {}
const GET_OPS = new Set(['query', 'streamed', 'live', 'infinite'])
const link = new RPCLink<ClientContext>({
  url: () => `${window.location.origin}/rpc`,
  method: ({ context }) =>
    GET_OPS.has(context[TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL]?.type ?? '') ? 'GET' : 'POST',
})
```
The RPCHandler's default `StrictGetMethodPlugin` blocks GET unless the procedure allows it — so
this is opt-in and safe to defer. Default POST is fine for v1.

---

## 3. Live / polling data (Civ7 status + snapshots)

Today (`App.tsx` ~lines 966–1080) this is a hand-built `setTimeout` recursion with
`AbortController`s, failure counters, document-hidden backoff, and manual `setState`. TanStack
Query replaces almost all of it.

### 3.1 Status long-poll surface

```ts
function useLiveStatus() {
  return useQuery(orpc.civ7.liveStatus.queryOptions({
    input: {},
    // Poll: number, or a function for adaptive/backoff intervals.
    refetchInterval: (query) => {
      if (document.hidden) return 15_000          // matches current document-hidden backoff
      return query.state.error ? 10_000 : 2_000   // back off on failure
    },
    refetchIntervalInBackground: false,           // pause when tab hidden (or keep + slow it)
    retry: 1,
    staleTime: 0,                                  // live data is always "stale"
    gcTime: 5_000,
  }))
}
```

Key mappings from the current manual loop:
- `setTimeout(poll, delay)` → `refetchInterval` (supports the adaptive function form).
- `document.hidden` backoff → branch inside `refetchInterval` + `refetchIntervalInBackground: false`.
- failure-count backoff → `query.state.error` / `query.state.fetchFailureCount` inside the fn.
- manual `AbortController` per poll → TanStack passes `signal` into the query fn automatically;
  oRPC's client forwards it to `fetch`. **Delete the manual abort plumbing.**

### 3.2 Snapshot read, gated on status (enabled / skipToken)

The snapshot request is derived from the latest status. Use `enabled` (or `skipToken`) so the
snapshot query only runs when there's a valid request, and key it by the derived request so the
cache naturally dedupes/cancels when the request changes:

```ts
function useLiveSnapshot(request: SnapshotRequest | undefined) {
  return useQuery(orpc.civ7.liveSnapshot.queryOptions({
    // skipToken: type-safe "disabled" — omits input and disables the query.
    input: request ?? skipToken,        // import { skipToken } from '@tanstack/react-query'
    refetchInterval: request ? 2_000 : false,
    staleTime: 0,
  }))
}
```

`skipToken` is preferred over `enabled: false` because oRPC + TanStack keep the types honest (you
can't accidentally call with `undefined` input). When `request` changes, the query key changes,
TanStack cancels the in-flight request (aborting the fetch) and starts the new one — replacing the
manual `activeLiveSnapshotRequestKeyRef` / `shouldCommitLiveRuntimeSnapshot` dedupe logic.

### 3.3 Suspense vs not — for a live surface, do NOT use Suspense

- **Non-suspense `useQuery`** for live/polling: you want `isPending` / `isError` / stale-while-
  refetch states visible in the footer status dot, not a thrown promise that unmounts the surface
  on every transient error. Keep the live status/snapshot surfaces on `useQuery`.
- **`useSuspenseQuery`** is appropriate for *initial, must-have* reads that gate first paint
  (e.g. setup catalog, saved-config list on a route) where an error boundary + spinner is the
  right UX. Even then it's optional in an SPA.

### 3.4 Streaming alternative (if the server moves to Event Iterator)

If/when `liveStatus` becomes a server-push Event Iterator instead of poll-on-demand, swap
`queryOptions` for `experimental_liveOptions` (data = latest event) or
`experimental_streamedOptions` (data = appended array) with `retry: true`. No component change
beyond the option call. Polling is the correct v1 given the current REST endpoints.

---

## 4. Zustand v5 patterns (client/UI state only)

Confirmed against current Zustand v5 reference (`zustand.docs.pmnd.rs`, v5.0.14):
`useShallow` lives in `zustand/react/shallow`; `persist`/`devtools`/`combine` in
`zustand/middleware`; `createWithEqualityFn` is a separate import (`zustand/traditional`) — for
v5 prefer plain `create` + `useShallow` over `createWithEqualityFn`.

### 4.1 Store slicing (avoid the App.tsx god-store)

`App.tsx` currently holds **83** `useState`/`useRef`/`useEffect` calls. Do NOT replace that with
one giant Zustand store — that's the same anti-pattern relocated. Split by domain, compose with
the **slices pattern**:

```ts
// stores/types.ts
import type { StateCreator } from 'zustand'

export interface ViewSlice {
  panel: 'recipe' | 'explore'
  setPanel: (p: ViewSlice['panel']) => void
}
export interface SelectionSlice {
  selectedPresetId: string | null
  selectPreset: (id: string | null) => void
}
export type StudioStore = ViewSlice & SelectionSlice

// stores/viewSlice.ts
export const createViewSlice: StateCreator<StudioStore, [], [], ViewSlice> = (set) => ({
  panel: 'recipe',
  setPanel: (panel) => set({ panel }),
})

// stores/studioStore.ts
import { create } from 'zustand'
import { createViewSlice } from './viewSlice'
import { createSelectionSlice } from './selectionSlice'

export const useStudioStore = create<StudioStore>()((...a) => ({
  ...createViewSlice(...a),
  ...createSelectionSlice(...a),
}))
```

Keep separate stores per bounded concern where there's no cross-talk (e.g. `useAuthStore`,
`useStudioStore`, `useThemeStore`) rather than forcing one root store. Slices are for cohesive
state that shares a store; separate stores for independent domains.

### 4.2 Selectors + `useShallow`

Always select the minimal slice. A bare `useStudioStore()` subscribes to *everything* and
re-renders on any change. For object/array selections, wrap in `useShallow` to avoid new-reference
re-renders:

```ts
import { useShallow } from 'zustand/react/shallow'

// single value — no useShallow needed
const panel = useStudioStore((s) => s.panel)

// multiple values / object — useShallow REQUIRED (v5 dropped the auto-equality of bare create)
const { panel, setPanel } = useStudioStore(
  useShallow((s) => ({ panel: s.panel, setPanel: s.setPanel })),
)
```

> v5 note: in v4 you could pass a 2nd `shallow` arg to the bare `create` hook; v5 removed that.
> Use `useShallow` (or `createWithEqualityFn` from `zustand/traditional` if you truly need a
> custom equality fn). Default to `useShallow`.

### 4.3 Persistence (studio + auth state)

The app already persists studio/auth via a hand-rolled `localStorage` wrapper
(`features/studioState/persistence.ts` — manual `JSON.parse`/`stringify`, a `version` field).
Replace with the `persist` middleware, which gives versioning + migrations + partialize for free:

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStudioStore = create<StudioStore>()(
  persist(
    (...a) => ({ ...createViewSlice(...a), ...createSelectionSlice(...a) }),
    {
      name: 'mapgen-studio', // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // persist ONLY durable UI prefs — never transient/derived state
      partialize: (s) => ({ panel: s.panel, selectedPresetId: s.selectedPresetId }),
      migrate: (persisted, fromVersion) => {
        if (fromVersion < 1) { /* reshape old payload */ }
        return persisted as StudioStore
      },
    },
  ),
)
```

Auth: persist only the durable token/identity bits (`partialize`), never server-fetched profile
data (that's a query). Use a separate `useAuthStore` with its own `name`.

> SPA hydration caveat: `persist` rehydrates synchronously from `localStorage` on store creation,
> so there is no SSR mismatch to guard against (see Section 6). If you later add SSR, use
> `skipHydration` + `rehydrate()`. Not needed now.

### 4.4 The client-vs-server boundary (crisp rule)

> **Server owns it → TanStack Query (oRPC). Browser-only and server-agnostic → Zustand.**

| Belongs in **TanStack Query** (server state) | Belongs in **Zustand** (client state) |
| --- | --- |
| Saved map configs, setup config, setup catalog | Which panel/tab is open, modal open/closed |
| Civ7 live status + snapshots (polled) | Selected preset id, current selection/hover |
| Run-in-game status, autoplay state from server | Theme, layout, deck.gl view state (UI camera) |
| Anything fetched from `/rpc` | Draft/unsaved form input before submit |
| Anything you'd `invalidateQueries` on | Auth token (persisted), feature toggles |

**Anti-pattern to forbid:** copying query results into Zustand (`useEffect(() => store.set(data))`).
That duplicates the source of truth and reintroduces the stale-state bugs we're removing.
Components read server data from the query cache and UI state from Zustand — side by side, never
mirrored. Cross-references go the *other* way (Zustand selection id → used as query `input`).

---

## 5. Recommended client data-layer file structure

```
apps/mapgen-studio/src/
  lib/
    orpc.ts        # RPCLink → createORPCClient → createTanstackQueryUtils  (export `client`, `orpc`)
    query.ts       # createQueryClient() factory (QueryClient defaultOptions)
  stores/
    studioStore.ts # persisted UI state (slices: view, selection, ...)
    authStore.ts   # persisted auth/identity (token only; profile is a query)
    themeStore.ts  # theme/layout prefs (persisted)
    types.ts       # slice interfaces + combined store types
  features/
    civ7/
      useLiveStatus.ts    # useQuery(orpc.civ7.liveStatus.queryOptions(...)) + refetchInterval
      useLiveSnapshot.ts  # useQuery gated by skipToken on derived request
    mapConfigs/
      useSaveMapConfig.ts # useMutation(orpc.mapConfigs.save.mutationOptions(...)) + invalidate
  main.tsx         # <QueryClientProvider> wraps <App/>
```

Conventions:
- `lib/orpc.ts` exports both `client` (imperative) and `orpc` (query utils). Components import
  `orpc`; rare imperative calls import `client` or use `orpc.x.call(...)`.
- No `services/` or `api/` folder, no query-key constants file — keys come from `orpc.*.key()`.
- Feature hooks are thin: they only choose options (interval, enabled, invalidation targets).
  All typing/serialization is inherited from the contract.
- `type`-only import of the server `router` for `RouterClient<typeof router>` — keeps server
  runtime out of the client bundle.

---

## 6. SSR / dev caveats (Vite SPA — no SSR)

This is a **pure client-rendered Vite SPA** (`vite.config.ts`, no SSR framework). Therefore:

- **No hydration boundary needed.** Skip the entire oRPC "Hydration" section
  (`StandardRPCJsonSerializer` + `dehydrate`/`HydrationBoundary` + `queryKeyHashFn`). That machinery
  exists only to transfer a server-rendered cache to the client. Not applicable here.
- **No per-request client isolation.** A module-level `client`/`orpc` singleton in `lib/orpc.ts`
  is correct and safe — there is no shared server process holding multiple users' state.
- **QueryClient provisioning:** `useState(createQueryClient)` in the root component (Section 2).
  Avoids identity churn on HMR; a bare module singleton also works but the `useState` form is the
  idiomatic default.
- **`RPCLink` URL:** use the lazy function form `() => \`${window.location.origin}/rpc\`` so it's
  only evaluated in the browser (defensive; harmless in an SPA) and needs no `VITE_*` env var when
  same-origin. If the API is on a different origin in dev, set `url` from `import.meta.env.VITE_SERVER_URL`
  and ensure CORS + `credentials: 'include'`.
- **Zustand `persist`:** rehydrates synchronously from `localStorage` at store creation — no
  hydration-mismatch risk in an SPA. `skipHydration`/`rehydrate()` only matter under SSR; do not
  add them.
- **Dev server:** Vite proxy (`server.proxy` in `vite.config.ts`) can route `/rpc` to the Effect+oRPC
  server during dev, keeping the client same-origin and avoiding CORS entirely.

---

## 7. Migration notes (current → target)

| Current (`App.tsx`) | Target |
| --- | --- |
| `fetch('/api/map-configs', { method:'POST' })` | `useMutation(orpc.mapConfigs.save.mutationOptions(...))` |
| `fetch('/api/map-configs/status?requestId=...')` polling | `useQuery(orpc.mapConfigs.status.queryOptions({ input:{requestId}, refetchInterval }))` |
| `fetch('/api/civ7/saved-configs')` | `useQuery(orpc.civ7.savedConfigs.queryOptions())` |
| `fetch('/api/civ7/setup-config')` + `setLiveSetup` | `useQuery(orpc.civ7.setupConfig.queryOptions(...))` |
| `setTimeout(poll)` + `AbortController` + failure counters (live/status) | `useQuery(...).refetchInterval` adaptive fn; signal is automatic |
| `activeLiveSnapshotRequestKeyRef` dedupe + `shouldCommitLiveRuntimeSnapshot` | query-key change → automatic cancel/dedupe; `skipToken` gating |
| `features/studioState/persistence.ts` manual localStorage | Zustand `persist` middleware (`version`, `migrate`, `partialize`) |
| 83 hooks of `useState`/`useEffect` in `App.tsx` | server state → query cache; UI state → sliced Zustand stores |

**Net deletions:** the hand-rolled query layer, manual abort/dedupe plumbing, the
`persistence.ts` wrapper, and most of the `App.tsx` `useEffect` polling. **Net additions:**
`lib/orpc.ts`, `lib/query.ts`, the provider, and per-domain Zustand stores.

---

## Sources

- oRPC TanStack Query Integration — https://orpc.dev/docs/integrations/tanstack-query (scraped 2026-06-08; `createTanstackQueryUtils`, `queryOptions`/`mutationOptions`/`infiniteOptions`/`experimental_streamed|liveOptions`, `key`/`queryKey`/`infiniteKey`/`mutationKey`, `skipToken`, operation context, hydration).
- oRPC Client-Side Clients — https://orpc.dev/docs/client/client-side (`createORPCClient`, `RouterClient<typeof router>`).
- oRPC RPCLink — https://orpc.dev/docs/client/rpc-link (fetch link, `credentials:'include'`, lazy `url`, `method` for GET, client context).
- Zustand v5 Reference — https://zustand.docs.pmnd.rs/reference/index (`create`, `createWithEqualityFn`, `useShallow`, `persist`, `combine`, v5 migration).
- Skill `dev:orpc` (`references/frontend-react-tanstack-query.md`) — client-module pattern, query-key stability, version context (1.13.4 @ 2026-02-05).
- npm `latest` versions verified 2026-06-08: `@orpc/tanstack-query@1.14.5`, `@orpc/client@1.14.5`, `@orpc/server@1.14.5`, `@tanstack/react-query@5.101.0`, `zustand@5.0.14`.
- App current state: `apps/mapgen-studio/src/App.tsx` (fetch sites L168–L1042, live poll loop L966–L1080, 83 hook calls), `apps/mapgen-studio/src/features/studioState/persistence.ts` (manual localStorage), `apps/mapgen-studio/src/features/liveRuntime/model.ts` (live runtime state shapes).
```
