# Design: MapGen Studio Storybook Component Workbench (Stage 1)

This design resolves the target shape of the Stage 1 workbench. Every decision
below is settled; none is left as a fallback, optional, or "decide later" path.

## 1. Stack and version

- **Framework:** `@storybook/react-vite` at Storybook **9.x**. The studio is
  React 19.2 + Vite 7.3, so the React-Vite builder reuses the existing
  toolchain natively.
- **Version pin gate:** the repo is on **Vite 7** and **Tailwind v4**, both
  newer than Storybook 9's baseline. The exact 9.x minor that lists Vite 7 in
  its builder peer range is verified as the first implementation task (see
  `tasks.md`); the pin is the latest 9.x that satisfies Vite 7 + React 19. If no
  published 9.x supports Vite 7, that is a blocking finding surfaced to the
  owner, not worked around with a downgraded Vite.
- **Package manager / runtime:** Bun 1.3.14, Node 22.22.0 (repo-pinned). Deps
  are added with Bun; `bun.lock` is the only lockfile touched.

## 2. Placement

- `.storybook/` lives **inside `apps/mapgen-studio`**, co-located with the
  components. Rationale: the components are studio-local (no shared
  `packages/ui`), and co-location lets `viteFinal` inherit `vite.config.ts`
  and the tsconfig path aliases directly. A dedicated Storybook package is
  rejected for Stage 1 — it would duplicate the Vite/alias config for no
  current benefit (revisit only if components later graduate to a shared
  package).

## 3. Vite builder integration (`viteFinal`)

`.storybook/main.ts` merges the app's Vite config via `viteFinal` and **inherits**:

- the `@` → `./src` alias and the `@mapgen/domain*` tsconfig path aliases;
- the **`child_process` → `src/shims/child_process.ts`** alias (mandatory —
  deck.gl/loaders.gl pulls a Node-only `child_process` path; without the shim
  any deck.gl-touching story breaks the build);
- the Tailwind v4 Vite plugin (`@tailwindcss/vite`) — Tailwind v4 is wired
  through Vite, not PostCSS; the preview must load it or stories render
  unstyled.

It **strips / does not activate**:

- the `/rpc` dev proxy and `server.watch.ignored` globs (daemon-oriented; the
  workbench runs with no daemon);
- StrictMode is not forced around stories (deck.gl + luma crash under
  StrictMode double-mount; `main.tsx` already disables it in dev).

The `@swooper/mapgen-viz` source alias applies only in Vite `serve` mode;
Storybook dev (`serve`) gets the source, `build-storybook` (`build`) resolves
the package's built output. Viz-heavy canvas stories are out of the Tier-1/2
scope, so this asymmetry does not affect Stage 1 stories.

## 4. Decorators / `preview.tsx` (the rendering-context contract)

`.storybook/preview.tsx` composes the same context the app assembles in
`main.tsx` + `StudioProviders.tsx`, as global decorators applied to every story:

| Decorator | Source it mirrors | Why required |
|---|---|---|
| Theme (`.dark` class on the iframe `document.documentElement`) + `src/index.css` + `@fontsource/*` | `StudioProviders.tsx` theme effect, `index.html` pre-paint script, `main.tsx` font imports | Theming is a single `.dark` class + token CSS; without it every story is unstyled/unthemed. A `globalTypes` theme toolbar toggles light/dark. **Must apply the class to `document.documentElement` (`<html>`), not a wrapper div, and at mount** — post-merge `sonner` reads the theme from that class via `useSyncExternalStore` with no internal-state settle, so a late/misplaced class leaves the first toast unthemed. The decorator may reuse the app's exported `useThemeFromClass` (`src/components/ui/sonner.tsx`) to stay in lockstep. |
| `TooltipProvider` (Radix, `delayDuration={300}`) | `StudioProviders.tsx` | Tooltip-using components render **silently blank** with no console error if absent (bit the design-sync on 6 components). |
| Per-story `QueryClientProvider` | `main.tsx` (`createQueryClient()`) | Components reaching `orpc.*.queryOptions()` need a client; each story gets a fresh one to avoid cross-story cache bleed. |
| `Toaster` (sonner) | `StudioProviders.tsx` | Toast-emitting components need it mounted. Reads theme from the `<html>.dark` class (see the theme row) — no extra wiring beyond mounting it. |
| Zustand store reset | `src/stores/{viewStore,runStore,authoringStore}` | Stores are module singletons (no provider); a `beforeEach` decorator resets state per story. `authoringStore` hydrates from `localStorage` at module load, so the reset seeds/clears `localStorage` deterministically. |

No router decorator: the studio has no React Router; navigation is `viewStore`
state.

**All five decorator-mirror sources are unchanged by the StudioShell decomposition stack** (verified at its tip `aa389e317`): `StudioProviders.tsx`, `main.tsx`, `lib/query.ts`, `ui/hooks/useTheme.ts`, and the three stores. The only stack change touching this layer is `sonner.tsx`'s internal rewrite to `useSyncExternalStore` (additive `useThemeFromClass` export; `ToasterProps` unchanged) — captured in the theme/Toaster rows above. So the decorator contract is stable across the merge.

## 5. oRPC / daemon isolation (the headline risk)

`src/lib/orpc.ts` instantiates an oRPC client at module load, reading
`window.location.origin` for `/rpc`. Components that import `features/*/api.ts`
or the app data hooks would fire RPC at a daemon that is not running in the
workbench. Resolution:

- **Tier-1/2 stories use components that do not reach the data layer.** The
  census confirms the presentational surface (`components/ui/*`, the studio
  composites, `PipelineStage`) is prop-driven and clean.
- **Data-reaching components** are storied with a **stub `QueryClient` seeded
  with fixture data** (not MSW — Stage 1 keeps the mock surface minimal), or, if
  a component cannot render meaningfully without live data, it is **excluded
  with a recorded reason** in the story-support notes. No story attempts a live
  `/rpc` call.
- `@civ7/studio-server/contract` imports in the component tree are `import type`
  (erased) plus a few value imports of plain constant arrays — safe; no
  `node:`/`bun:` runtime enters the client component tree.

## 6. Story authoring: source, format, coverage, location

- **Source:** adapt the 46 `apps/mapgen-studio/.design-sync/previews/*.tsx`
  scenes — they already encode the correct fixtures, mocks, and decorators
  (documented in `.design-sync/NOTES.md`). Stage 1 reads them as reference; it
  does not modify them (they remain the package-shape source until Stage 2
  retires them).
- **Format:** CSF 3, named exports, one `Meta` default per file. Component
  imports inside stories use the same aliases as app code.
- **Coverage:** at least one faithful **primary** story per in-scope component,
  plus variant stories for load-bearing visual states. Exhaustive prop coverage
  is not required (the future design-sync grades the primary and trusts the
  rest; ≤6 stories/component is the sync cap).
- **Location & titles:** co-located `src/**/*.stories.tsx`; story **titles map
  to the design-sync component export names** and group by the design-sync
  categories (`primitives`, `composites`, `panels`, `presets`, `configoverrides`,
  `recipedag`, `fields`, `app`). This is the forward-hook that makes Stage 2's
  flip a no-re-author cutover.

## 7. Component scope (from the census)

- **Tier 1 (~30, primary + variants):** all 15 `src/components/ui/*` shadcn
  primitives; the prop-pure composites/leaves (AppBrand, ViewControls,
  OptionSelect, DisclosureHeader, EmptyState, FieldRow, StageViewTabs,
  WaterStatsSection, AppHeader, AppFooter, GameConsole, ExplorePanel, LeftDock,
  RightDock, ErrorBanner) and the 3 preset dialogs.
- **Tier 2 (~10, needs the support fixtures):** the 7 rjsf widgets + 2 simpler
  rjsf templates via one `mockWidgetProps()` factory; `PipelineStage` via a
  static `RecipeDagResult` fixture. **Fixture invariant (post-merge):** the
  StudioShell stack added `prunePipelineExpansion` so the app prunes
  `expandedStageIds` down to `dag.stages[].stageId` in the orchestration hook
  (`useViewportLayout`) before the prop reaches `PipelineStage`. The story must
  keep its `expandedStageIds` fixture consistent with its `dag.stages[].stageId`
  — same prop shape, just a self-consistent fixture (no new field; `PipelineStage`
  itself and the `RecipeDagResult` contract are unchanged).
- **Tier 3 (best-effort fixtures):** `RecipePanel` (collapsed primary;
  `SchemaConfigForm` child needs an RJSF schema+value fixture),
  `SchemaConfigForm`, `BrowserConfigObjectFieldTemplate`, and `CanvasStage`
  **empty-state branch only** (deck.gl-free path).
- **Excluded (no story):** `StudioShell`, `StudioProviders`, `DeckCanvas`, and
  any component that cannot render without live data — recorded as excluded with
  a reason.

## 8. Nx / target convention

- `storybook` and `build-storybook` are added as `package.json` `nx` targets
  in `apps/mapgen-studio`, matching the studio's existing inference-only
  convention (`dev`, `build`, `build:vite`). `build-storybook` declares its
  `storybook-static/` output so it participates in Nx caching without polluting
  the `build`/`build:vite` cache keys.
- `@nx/storybook` is **not** introduced — Stage 1 keeps the inference-only,
  executor-free convention; the two targets are plain `package.json` `nx`
  entries. Stage 1 also does **not** mint a `project.json` (current `main` has
  none for the studio).
- **Habitat coordination (captured 2026-06-30).** The Habitat toolkit stack —
  **unmerged and deferred** ("not yet" per the owner; its tip `8458690cb` is not
  an ancestor of `main`) — converts `apps/mapgen-studio` from inference-only
  targets to an explicit `project.json` with a `targets` block (`dev`/`build`
  executors; verified in that tip's diff). So a `project.json` is **not** a model
  "the repo deliberately avoids" — it is arriving later via Habitat. The decision
  above stands for the **current** integrated tree (package.json `nx` targets);
  the two Storybook targets are authored to be **trivially portable**, so when
  Habitat lands, whoever runs that migration lifts `storybook`/`build-storybook`
  into the new `project.json` beside `dev`/`build`. Stage 1 does **not**
  pre-build for that unmerged, in-flux model — coupling to a 40-branch stack that
  has not landed would be speculative.

## 9. Test-runner / lint coexistence

- The Storybook Vitest **test addon is not added in Stage 1** — the repo runs
  Vitest 4 with a `mapgen-studio` project, and the Storybook test addon would
  contend on Vitest config/version. Stage 1's verification is build + render +
  visual review, not a Storybook-test-runner gate.
- Stories and config are checked against **Biome** (`biome.json`), the repo's
  app-code linter (not ESLint). The StudioShell stack lands **three React rules**
  globally (no `overrides`, no stories exclusion), which the generated story +
  decorator code must satisfy:
  - `correctness.useHookAtTopLevel` = **error** — no hooks inside `fixtures.map()`,
    inline child callbacks, or after an early return. Interactive stories wrap
    their hook usage in a top-level render **component**, never a bare render arrow.
  - `correctness.useJsxKeyInIterable` = **error** — variant-gallery stories that
    `.map()` JSX must key each element.
  - `correctness.useExhaustiveDependencies` = **warn** (non-blocking) — hoist
    constant fixtures and reset callbacks to module scope to keep dep arrays clean.
  The proposal's stories-specific Biome-override escape hatch applies only if a
  genuine CSF pattern proves incompatible.
- The stack also adds `@testing-library/react` 16.x + `@testing-library/dom` +
  `jsdom` (React-19-aligned) to the studio devDeps — these are the same testing
  stack Storybook 9 builds on, so they are net-positive shared deps, not a new
  conflict. The opt-in `lint:react-compiler` script is advisory (exit 0 without
  `--strict`) and imposes no Storybook gate.

## 10. Review lanes (run before/with implementation)

Per the runtime-simplification precedent, frame Codex + Claude review around the
parity and isolation hazards, not "does it look right":

- **Isolation / parity reviewer (Claude):** confirms no component implementation
  was edited to fit Storybook; confirms no story reaches a live `/rpc`/daemon
  call; confirms StrictMode is off for canvas stories.
- **Architecture-boundary reviewer (Codex `codex:review`):** confirms the
  write set stays inside the proposal's paths — design-sync surface untouched,
  daemon untouched, no `@nx/storybook`/`project.json`.
- **Adversarial reviewer (Codex `codex:adversarial-review`):** challenges the
  decorator-context fidelity (does a story render the same as in-app?), the
  stub-QueryClient choice vs MSW, and the design-sync-titling forward-hook (will
  Stage 2 actually consume these unchanged?).
- **Code-quality bar (`dev:review-code-quality`):** the decorator/fixture
  support module must not grow wrappers or special-cases; one `mockWidgetProps`
  factory, one fixture, one preview.

## 11. Non-claims

- Stage 1 does not prove design-sync storybook-shape verification — no
  screenshot pairs are produced; the live sync stays `package` shape.
- A rendered story proves the component renders in the workbench's decorator
  context; it does not prove pixel-identity with the in-app render (that is
  Stage 2's screenshot-pair job).
- OpenSpec validation proves artifact shape only.
