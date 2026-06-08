# Slice Plan — Graphite Stack

> Dependency-ordered. Each slice = one Graphite branch = one coherent, reviewable,
> independently-typechecking change. Verify gate per slice: `tsc --noEmit` clean +
> app builds + behavior parity for touched surfaces. Build the stack bottom-up.

## Sequencing rationale

Server contract first (unblocks typed client) → server impl (keep old middleware
alive) → cutover → client data layer → stores (un-god App.tsx) → design-system
foundation (tokens, broken theming is foundational) → component decomposition →
primitive migration + new components + rjsf + craft → rigor + dead code → verify +
review + PR. Server and design-foundation are independent and could interleave;
the stack keeps them linear for clean review.

## Phase A — Server (`@civ7/studio-server`, effect-orpc on Bun)

- **A1 — Package + contracts.** Scaffold `packages/studio-server`; define oRPC
  contracts (zod I/O) for all 16 endpoints across civ7/live/runInGame/mapConfigs/studio.
  No logic. Export contract types. *Verify:* package typechecks; contract types importable.
- **A2 — Effect services.** Lift `src/server/*` helpers + the vite.config handler bodies
  into Effect services (Civ7TunerClient, ProcessControl, MapConfigStore, RunInGameEngine,
  Civ7ResourceCatalog, StudioConfig) + Layers + ManagedRuntime. Preserve parity invariants.
- **A3 — Router + middleware.** `effect-orpc` router implementing the contract via services;
  `.effect(function*(){})`; ORPCError mapping with **non-uniform status codes**; requestId/
  logging middleware; context injection. Isolate effect-orpc to `router/`.
- **A4 — Bun entrypoint + dev proxy.** `Bun.serve` + RPCHandler at `/api`; CORS; Vite dev
  proxy `/api`→Bun; prod Caddy reverse_proxy (fix the static-only parity gap). Add run scripts.
- **A5 — Cutover.** Remove the `/api` middleware from `vite.config.ts`. Parity-test all 16
  endpoints against the new server (curl/contract tests). *Verify:* every endpoint responds identically.

## Phase B — Client data layer

- **B1 — oRPC client + Query provider.** `lib/orpc.ts` (RPCLink→client→tanstack utils),
  `lib/query.ts` (QueryClient), `QueryClientProvider` in `main.tsx`. *Verify:* typed client resolves against A1 contracts.
- **B2 — Zustand stores.** `stores/authoringStore.ts` (persist), `viewStore.ts`, `runStore.ts`
  (persist). Port the localStorage persistence reference impl into `persist`. Make vizStore the single step/layer owner. *Verify:* stores typecheck; persistence round-trips.
- **B3 — Swap fetch → query/mutation.** Replace the non-live fetch sites with oRPC hooks.
  *Verify:* each surface loads/mutates identically.
- **B4 — Live poll (LAST, parity harness).** Migrate the 149-line live-runtime poll to
  `useQuery` adaptive `refetchInterval` + `skipToken`, keeping staleness gating + backoff
  verbatim in the queryFn. *Verify:* no snapshot tearing; no hot-poll when Civ7 disconnected.

## Phase C — Design-system foundation

- **C1 — Tailwind v4 + shadcn init.** Migrate Tailwind v3→v4; `components.json`; `cn` util;
  animate; HSL token set; single `.dark` strategy; **one committed accent**. Delete
  `createTheme()`, `lightMode` prop threading, dead `colors.light|dark`, `--spacing-*`/`--radius-*`.
  *Verify:* app renders in light+dark via `.dark` class; no JIT-missing classes.

## Phase D — Component decomposition

- **D1 — Extract helpers.** Move the 535 LoC of non-React helpers out of App.tsx into modules.
- **D2 — Shell + providers.** `StudioProviders`, `StudioShell`, docks; theme→`ThemeContext`(use()).
  App.tsx → ~30 LoC. Remove the 8 disguised effects.
- **D3 — Container/presentational split.** RecipePanel/ExplorePanel/AppFooter read stores;
  kill 30-38-prop drilling; compound-component the 6 duplicated select-triples.
- **D4 — Error boundaries.** Around CanvasStage + mapgen pipeline + each dock.
  *Verify per slice:* parity on recipe authoring, viz, run-in-game.

## Phase E — Primitives, new components, rjsf, craft

- **E1 — Migrate primitives → Radix shadcn** (Button, Input, Select, Switch, Checkbox,
  Textarea, AlertDialog→Dialog, Tooltip; Toast→Sonner). Update ~21 sites; 28 `title=`→Tooltip.
- **E2 — Add components.** Command(cmd-k), Popover, DropdownMenu, Tabs, ScrollArea, Resizable,
  Sheet, Slider, Separator, Combobox — wired where the app needs them.
- **E3 — rjsf through shadcn.** Re-skin widgets/templates onto shadcn primitives.
- **E4 — Craft pass.** Focus rings, motion, loading skeletons, empty/error states, density,
  hierarchy, dark-mode correctness. *Verify:* design:audit re-run is clean against system.md.

## Phase F — Rigor + cleanup

- **F1 — tsconfig strict.** Enable noUncheckedIndexedAccess, exactOptionalPropertyTypes,
  verbatimModuleSyntax; fix fallout. *Verify:* 0 errors.
- **F2 — Dead code.** Remove `fields/` duplicate styling system, dead hooks/exports — confirm
  with find_unused_exports / references before deleting.
- **F3 — Comments + organization.** Top-1% intentional comments (why, not what); file/dir layout.

## Phase G — Verify + review + PR

- **G1 — Full verify.** typecheck + build + tests for studio + studio-server + affected packages;
  parity checks on live-control loop and run-in-game.
- **G2 — Review wave.** Framed reviewers: correctness/parity, a11y, types, design-audit.
  Accepted P1/P2 block closure.
- **G3 — Close.** Graphite stack submit → PR with the workstream docs linked.

## Risk register (top)

1. effect-orpc pre-1.0 — isolate to `router/`; ~30-line manual fallback ready.
2. Live-runtime poll parity (B4) — do last, parity harness, verbatim gating.
3. run-in-game 9-phase engine (A2/A3) — lift verbatim into one service; contract-test.
4. Tailwind v4 + rjsf re-skin churn — large surface; slice E3 separately.
5. Production `/api` parity gap — must be fixed in A4, not discovered at deploy.
