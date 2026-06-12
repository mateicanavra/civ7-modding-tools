# Target Architecture — MapGen Studio

> Synthesis of the six audit/research lanes. This is the target state the slice
> plan implements. Hard core: behavior parity (map-gen, Deck.gl, recipes,
> live-control loop unchanged). Exterior: engine internals.

## 0. Stack (verified versions, 2026-06-08)

| Layer | Choice | Packages |
| --- | --- | --- |
| Server runtime | **Bun** (`Bun.serve` + `RPCHandler`) | — |
| RPC | **oRPC** contract-first | `@orpc/server@1.14.5`, `@orpc/client@1.14.5`, `@orpc/contract@1.14.5` |
| Effect bridge | **`effect-orpc`** (mandated) | `effect-orpc@0.2.2`, `effect@3.21.3` |
| Validation | **Zod** at boundary (Effect Schema = spike, not first-class in oRPC) | `zod@^3.25 \|\| ^4` |
| Server state (client) | **oRPC-native TanStack Query** (use utils directly) | `@orpc/tanstack-query@1.14.5`, `@tanstack/react-query@5.101.0` |
| Client/UI state | **Zustand v5** (slices + persist) | `zustand@5.0.14` |
| Design system | **shadcn/ui** (Radix) + **Tailwind v4** | `radix-ui/*`, `tailwindcss@4`, `sonner`, `tailwindcss-animate`/v4 equiv |

## 1. Server: `@civ7/studio-server` (new workspace package)

Replaces the 16 hand-rolled `/api/*` handlers in `vite.config.ts` (~L379-1147).
Contract-first so the client gets types before the impl exists; OpenAPI/RPC
handler mounted at `/api` so legacy paths keep working through cutover.

```
packages/studio-server/
  src/
    contract/            # oRPC contracts (zod I/O) — the typed corpus, no logic
      civ7.ts            # status, mapSummary, gameInfo, autoplay, setupConfig,
                         #   savedConfigs, setupCatalog
      live.ts            # civ7.live.{status,snapshot,entities,gameInfo}
      runInGame.ts       # runInGame.{start,status}
      mapConfigs.ts      # mapConfigs.{saveDeploy,status}
      studio.ts          # studio.serverInfo
      index.ts           # root contract
    services/            # Effect services (lift src/server/* + handler bodies)
      Civ7TunerClient.ts # FireTuner/socket reads (status, snapshot, gameinfo…)
      ProcessControl.ts  # macosProcessRestart, Steam relaunch  [PARITY-CRITICAL]
      MapConfigStore.ts  # write-then-deploy + rollback, path jail [PARITY-CRITICAL]
      RunInGameEngine.ts # 9-phase state machine, fingerprint dedup, proof id,
                         #   logFailure classification, serialized queue [PARITY-CRITICAL]
      Civ7ResourceCatalog.ts
      StudioConfig.ts    # env/paths context (macOS app-resources root)
    middleware/          # oRPC native middleware
      requestId.ts       # proof identity / request-id (.use)
      logging.ts
      errorMap.ts        # ORPCError mapping; preserve NON-UNIFORM status codes
    router/              # effect-orpc: .effect(function*(){...}); ISOLATE effect-orpc here
      index.ts
    runtime.ts           # ManagedRuntime + Layer composition
    server.ts            # Bun.serve entrypoint, CORS, mount /api
  package.json
```

**Parity invariants (do not change behavior):**
- Error status codes are **non-uniform** (gameinfo→400, setup-config→503, most→500). `errorMap` must reproduce per-procedure.
- `civ7/live/status` returns **200 with per-field embedded `{error}`** (via allSettled), not transport errors.
- `assertNoRawControlFields` deep-scan in run-in-game is a **security boundary** — keep it.
- run-in-game: fingerprint dedup→202, dual-store mutex→409, sha256 proof identity, `finally` cleanup + `gen:maps` regen, serialized queue. Move verbatim into `RunInGameEngine` service.
- status 404 echoes `serverInstanceId`/`serverStartedAt` for restart detection.

**Dev/prod wiring (fixes the production parity gap):** today `/api/*` exists only
in Vite dev; `railway.json`/`Caddyfile` serve static `dist` only. Target: Bun
server owns `/api`; Vite dev proxies `/api`→Bun; prod Caddy `reverse_proxy`s
`/api`→Bun service (or Bun serves `dist` + `/api`).

## 2. Client data layer

```
apps/mapgen-studio/src/lib/
  orpc.ts     # RPCLink(fetch) → createORPCClient → createTanstackQueryUtils(client)
  query.ts    # QueryClient factory (sane defaults: staleTime, retry)
apps/mapgen-studio/src/main.tsx  # QueryClientProvider wraps app
```

- **Verdict (confirmed):** use oRPC's native query utils **directly** —
  `orpc.civ7.status.queryOptions()` into standard `useQuery`. No hand-written
  query client, no query-key factory, no wrapper-hook lib. Only QueryClient is
  ours to provide.
- **Live/polling surface** (App.tsx L966-1114): becomes `useQuery` with adaptive
  `refetchInterval` fn + `skipToken` gating. **Migrate LAST**, behind a parity
  harness — the 149-line poll hides request-key staleness gating and cross-failure
  adaptive backoff that naive porting will break (snapshot tearing / hot-polling).

## 3. Client state (Zustand) — the App.tsx un-godding

42 `useState` + 24 `useEffect` in one 3,010-line component → stores + query + local.

| Store | Owns | Replaces |
| --- | --- | --- |
| `authoringStore` (persist) | worldSettings, recipeSettings, setupConfig, pipelineConfig, overridesDisabled, repoBackedPresetOverrides | 6 useState + manual persistence effect (L868-877) |
| `viewStore` | showGrid/Edges, overlays, era*, panel-collapse, selectedStage/Step (single owner; delete App mirror + sync L1242-1248) | scattered view useState + vizStore mirror |
| `runStore` (persist) | runInGameSnapshot, lastRunInGameSource, lastSaveDeployConfig, lastRunSnapshot, localStorage request-id bridge | run snapshots + studioState/persistence.ts |
| **TanStack Query** | all server polling (live status/snapshot, setup-catalog, saved-configs, run-in-game status, save-deploy status) | 8 raw fetch effects |
| **Local (useState/ref)** | viewportSize, headerHeight, deckApi refs, dialog open, dedupe latches | stays colocated |

**Crisp rule:** server owns it → TanStack Query (via oRPC). Browser-only → Zustand.
Never mirror query results into Zustand; a Zustand selection id flows the other way as a query `input`.

## 4. Component tree (decomposition target)

```
App                       theme + providers only (~30 LoC)
└─ StudioProviders        Toast(Sonner) + QueryClient + ThemeContext(use())
   └─ StudioShell         layout, error boundary host, global shortcuts host
      ├─ CanvasStage      → DeckCanvas         (viewStore + vizStore)
      ├─ AppHeader        presentational       (authoringStore + setupStore)
      ├─ LeftDock         → RecipeConfigPanel(container) → RecipePanel(presentational)
      ├─ RightDock        → ExploreController(container) → ExplorePanel(presentational)
      ├─ AppFooter        container-lite       (runStore + live query)
      ├─ PresetDialogs    (already extracted)
      └─ ErrorBanner
```
535 LoC of non-React helpers at the top of App.tsx → extracted modules.
Panels currently take 30-38 flat props (boolean-prop explosion + 6 duplicated
select-triples) → compound components reading stores. 8 effects are
derived-state/event-handlers in disguise → remove.

## 5. Design system (shadcn + Tailwind v4)

- **Theming is structurally broken today**, not just inconsistent: `useTheme.ts:130-175`
  builds classes via runtime string interpolation (`bg-[${...}]`) Tailwind JIT never
  emits; two conflicting dark-mode systems (`media` default vs a `lightMode` boolean
  threaded through 24 files); declared accent (#5e5ce6 indigo) ≠ used accent (#4b5563 slate).
- **Target:** single `.dark` class strategy, HSL shadcn tokens, **one committed accent**,
  delete `createTheme()`/`lightMode` prop/`colors.light|dark` config/`--spacing-*`/`--radius-*` vars.
- Token map: `bg→--background`, `text→--foreground`, `card/popover`, `muted-foreground`,
  `border/input`, `--primary/--ring` (pick one accent), `--destructive`, `--radius:0.25rem`.
- **Primitives → Radix shadcn:** 8 primitives (+Sonner for Toast); ~21 import sites,
  5 dialog/toast instances, 28 native `title=`→Tooltip. Closes focus-trap/ARIA/keyboard gaps.
- **Add:** Dialog, Popover, **Command (cmd-k)**, Combobox, DropdownMenu, Tabs, Accordion,
  ScrollArea, Slider, Separator, Sheet, Resizable.
- **rjsf** widgets/templates re-render through shadcn primitives (big surface).
- Tailwind **v3→v4 now** (React 19.2 + Vite 7 already; config is mostly dead).

## 6. TypeScript rigor

- Typecheck is **clean today (0 errors)**. App tsconfig is standalone (does NOT extend base).
- 21 `any` + 126 `as` casts; ~10-12 dangerous `res.json() as T` casts **evaporate for free**
  once the typed oRPC client lands. RJSF/deck.gl/worker `any`s need explicit work.
- Enable: **`noUncheckedIndexedAccess`**, **`exactOptionalPropertyTypes`**, **`verbatimModuleSyntax`**.
- `localStorage` persistence layer is the **reference impl** (guarded `JSON.parse as unknown`) — copy it, don't "fix" it.

## 7. Do-not-break registry (parity)

browserRunner runToken/generation gating · run-in-game fingerprint/relation equality ·
materialization-mode decision · localStorage schema contract · live-runtime poll
request-key staleness + adaptive backoff · `assertNoRawControlFields` · process-restart
+ catalog macOS paths · serialized run queue + dual mutex.
