# Tasks: MapGen Studio Storybook Component Workbench (Stage 1)

Ordered implementation steps. Each block is closeable; do not start a block
before its prerequisites. Runs on a fresh Graphite branch off a settled `main`.

## 0. Branch and version baseline

- [x] Confirm the design-sync PR stack has finished draining and `main` is
      settled; create the `studio-storybook-workbench` Graphite branch + worktree
      off `main`; commit this change set as the first commit.
- [x] Resolve the Storybook 9.x minor that supports Vite 7 + React 19 (check the
      `@storybook/react-vite` builder peer range). Record the pinned version. If
      no 9.x supports Vite 7, stop and surface to the owner (do not downgrade
      Vite).

## 1. Storybook install and Vite wiring

- [x] Add `@storybook/react-vite` + the Storybook 9.x core/addons (essentials,
      autodocs) as `apps/mapgen-studio` devDependencies via Bun.
- [x] Write `apps/mapgen-studio/.storybook/main.ts`: framework
      `@storybook/react-vite`, `stories` glob `../src/**/*.stories.@(tsx|jsx)`,
      autodocs on, and `viteFinal` merging the app Vite config — inheriting the
      `@`, `@mapgen/domain*`, and `child_process`-shim aliases and the Tailwind
      v4 plugin, while not activating the `/rpc` proxy or daemon watch-ignores.
- [x] Add `storybook` and `build-storybook` `nx` targets to
      `apps/mapgen-studio/package.json`; declare `storybook-static/` as the
      `build-storybook` output; add `storybook-static/` to
      `apps/mapgen-studio/.gitignore`.
- [x] Verify `build-storybook` produces a static build with `iframe.html`
      (empty-stories build is acceptable at this step).

## 2. Global rendering-context layer (`preview.tsx` + decorators)

- [x] Write `apps/mapgen-studio/.storybook/preview.tsx` importing
      `src/index.css` + the Inter/JetBrains-Mono fonts, with global decorators:
      theme (`.dark` class on the preview root, driven by a `globalTypes` theme
      toolbar), `TooltipProvider`, a fresh per-story `QueryClientProvider`, and
      `Toaster`.
- [x] Write `apps/mapgen-studio/src/storybook/storeReset.ts`: a decorator that
      resets `viewStore`/`runStore`/`authoringStore` per story and seeds/clears
      `localStorage` for `authoringStore`'s load-time hydration.
- [x] Render a trivial primitive (Button) story to confirm theme + tokens +
      fonts + Tooltip all render; toggle dark/light.

## 3. Story-support fixtures

- [x] Write `apps/mapgen-studio/src/storybook/mockWidgetProps.ts`: a factory for
      rjsf `WidgetProps` / `*TemplateProps` covering the 7 widgets + 2 templates.
- [x] Write `apps/mapgen-studio/src/storybook/recipeDagFixture.ts`: a static
      valid `RecipeDagResult` for `PipelineStage` (satisfying the real contract;
      mirror the existing synced preview's fixture).
- [x] Write a seeded stub `QueryClient` helper for any data-reaching story.

## 4. Tier 1 stories (primitives + prop-pure composites/leaves)

- [x] Author co-located `*.stories.tsx` for the 15 `src/components/ui/*`
      primitives (primary + key variants; overlay primitives get one open
      story), adapting `.design-sync/previews/*.tsx`.
- [x] Author stories for the prop-pure composites/leaves (AppBrand, ViewControls,
      OptionSelect, DisclosureHeader, EmptyState, FieldRow, StageViewTabs,
      WaterStatsSection, AppHeader, AppFooter, GameConsole, ExplorePanel,
      LeftDock, RightDock, ErrorBanner) and the 3 preset dialogs — primary +
      load-bearing visual states.
- [x] Confirm titles map to the design-sync export names and group by design-sync
      category.

## 5. Tier 2 + best-effort Tier 3 stories

- [x] Author stories for the 7 rjsf widgets + 2 templates using
      `mockWidgetProps()`, and `PipelineStage` using the `RecipeDagResult`
      fixture.
- [x] Author best-effort Tier-3 stories: `RecipePanel` (collapsed primary),
      `SchemaConfigForm` (schema+value fixture), `BrowserConfigObjectFieldTemplate`.
      `CanvasStage` empty-state branch **deferred** (deck.gl host, not part of the
      46-component surface) — recorded in `src/storybook/EXCLUSIONS.md`.
- [x] Record excluded components (`StudioShell`, `StudioProviders`, `DeckCanvas`,
      any live-data-only component) and the exclusion reason in a
      `src/storybook/EXCLUSIONS.md` note.

## 6. Verification gates

- [x] `build-storybook` completes with all in-scope stories; `iframe.html`
      emitted.
- [x] Storybook dev server: every in-scope story renders with no console errors
      and no attempted `/rpc` call (daemon not running). Spot-check a
      Tooltip-using component renders visible (not blank) and a deck.gl-free
      canvas empty-state builds.
- [x] Theme toggle renders both light and dark across a sample of each category.
- [x] Biome check passes on `.storybook/**`, `src/storybook/**`, and all new
      `*.stories.tsx`.
- [x] Studio typecheck passes with stories present.
- [x] `bun run openspec -- validate mapgen-studio-storybook-workbench --strict`.
- [x] `bun run openspec:validate`.
- [x] `git diff --check`; final `git status` shows only the expected write set.

## 7. Review and disposition

- [x] Run the four review lanes (isolation/parity, architecture-boundary via
      `codex:review`, adversarial via `codex:adversarial-review`, code-quality
      via `dev:review-code-quality`).
- [x] Disposition findings; repair accepted P1/P2 blockers before close.

## 8. Downstream realignment and closure

- [x] Confirm no design-sync artifact (`.design-sync/`, `.ds-sync/`, `ds-bundle/`)
      was touched and the live sync remains `package` shape.
- [x] Note the Stage 2 enabler in the change record: stories are authored to the
      design-sync-titled, statically-renderable shape; Stage 2 flips
      `config.json` `shape` and runs the screenshot re-verify.
- [x] Add a `docs/` pointer (or studio README line) to how to run the workbench
      (`nx storybook mapgen-studio`).
- [x] Commit per the Graphite workflow; leave the repo clean; archive the change
      when accepted.

## Validation results (Stage 1 closeout)

Branch `studio-storybook-workbench` on `main` (`f23784e7e`); commits: definition
`cc1d3dc51` → foundation `b254db7d3` → story surface `8987a1642` → this closeout.
Each gate recorded expected / actual / oracle.

| Gate | Expected | Actual | Oracle |
|---|---|---|---|
| `openspec validate … --strict` | valid | **valid** | OpenSpec CLI |
| `openspec:validate` | 0 failed | **255 passed / 0 failed** | OpenSpec CLI |
| `build-storybook` | `iframe.html` emitted | **emitted; 88 stories, 0 build errors** | Vite/Storybook build |
| dev server: render + no console errors + no `/rpc` | all in-scope stories render clean | **88/88 stories: 0 console errors, 0 error overlays; network scan 0 `/rpc`/daemon** | headless render sweep + network capture |
| theme light/dark; Tooltip visible | both themes; tooltip not blank | **dark↔light token flip; `role=tooltip` visible** | DOM/computed-style probe |
| Biome on `.storybook`/`src/storybook`/`*.stories.tsx` | clean | **clean (50 files)** | `biome check` |
| Studio typecheck with stories | clean | **`tsc --noEmit` clean** | tsc |
| `git diff --check` + clean status | only the write set | **clean; write set only (no protected paths, no component edits, no `@nx/storybook`/`project.json`)** | git |

Non-claims (unchanged): Stage 1 does not prove design-sync storybook-shape
screenshot verification (Stage 2), nor pixel-identity with the in-app render,
nor any in-game/runtime behavior. The design-sync surface (`.design-sync/`,
`.ds-sync/`, `ds-bundle/`) stays `package` shape and was not touched.

**Stage 2 enabler:** the 46 stories are authored design-sync-titled (group =
docsMap group; export names = preview export names) and statically renderable, so
the deferred `package → storybook` shape flip is a no-re-author cutover. Run the
workbench with `bun run storybook` (or `nx storybook mapgen-studio`); see
`apps/mapgen-studio/README.md`.
