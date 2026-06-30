# Tasks: MapGen Studio Storybook Component Workbench (Stage 1)

Ordered implementation steps. Each block is closeable; do not start a block
before its prerequisites. Runs on a fresh Graphite branch off a settled `main`.

## 0. Branch and version baseline

- [ ] Confirm the design-sync PR stack has finished draining and `main` is
      settled; create the `studio-storybook-workbench` Graphite branch + worktree
      off `main`; commit this change set as the first commit.
- [ ] Resolve the Storybook 9.x minor that supports Vite 7 + React 19 (check the
      `@storybook/react-vite` builder peer range). Record the pinned version. If
      no 9.x supports Vite 7, stop and surface to the owner (do not downgrade
      Vite).

## 1. Storybook install and Vite wiring

- [ ] Add `@storybook/react-vite` + the Storybook 9.x core/addons (essentials,
      autodocs) as `apps/mapgen-studio` devDependencies via Bun.
- [ ] Write `apps/mapgen-studio/.storybook/main.ts`: framework
      `@storybook/react-vite`, `stories` glob `../src/**/*.stories.@(tsx|jsx)`,
      autodocs on, and `viteFinal` merging the app Vite config — inheriting the
      `@`, `@mapgen/domain*`, and `child_process`-shim aliases and the Tailwind
      v4 plugin, while not activating the `/rpc` proxy or daemon watch-ignores.
- [ ] Add `storybook` and `build-storybook` `nx` targets to
      `apps/mapgen-studio/package.json`; declare `storybook-static/` as the
      `build-storybook` output; add `storybook-static/` to
      `apps/mapgen-studio/.gitignore`.
- [ ] Verify `build-storybook` produces a static build with `iframe.html`
      (empty-stories build is acceptable at this step).

## 2. Global rendering-context layer (`preview.tsx` + decorators)

- [ ] Write `apps/mapgen-studio/.storybook/preview.tsx` importing
      `src/index.css` + the Inter/JetBrains-Mono fonts, with global decorators:
      theme (`.dark` class on the preview root, driven by a `globalTypes` theme
      toolbar), `TooltipProvider`, a fresh per-story `QueryClientProvider`, and
      `Toaster`.
- [ ] Write `apps/mapgen-studio/src/storybook/storeReset.ts`: a decorator that
      resets `viewStore`/`runStore`/`authoringStore` per story and seeds/clears
      `localStorage` for `authoringStore`'s load-time hydration.
- [ ] Render a trivial primitive (Button) story to confirm theme + tokens +
      fonts + Tooltip all render; toggle dark/light.

## 3. Story-support fixtures

- [ ] Write `apps/mapgen-studio/src/storybook/mockWidgetProps.ts`: a factory for
      rjsf `WidgetProps` / `*TemplateProps` covering the 7 widgets + 2 templates.
- [ ] Write `apps/mapgen-studio/src/storybook/recipeDagFixture.ts`: a static
      valid `RecipeDagResult` for `PipelineStage` (satisfying the real contract;
      mirror the existing synced preview's fixture).
- [ ] Write a seeded stub `QueryClient` helper for any data-reaching story.

## 4. Tier 1 stories (primitives + prop-pure composites/leaves)

- [ ] Author co-located `*.stories.tsx` for the 15 `src/components/ui/*`
      primitives (primary + key variants; overlay primitives get one open
      story), adapting `.design-sync/previews/*.tsx`.
- [ ] Author stories for the prop-pure composites/leaves (AppBrand, ViewControls,
      OptionSelect, DisclosureHeader, EmptyState, FieldRow, StageViewTabs,
      WaterStatsSection, AppHeader, AppFooter, GameConsole, ExplorePanel,
      LeftDock, RightDock, ErrorBanner) and the 3 preset dialogs — primary +
      load-bearing visual states.
- [ ] Confirm titles map to the design-sync export names and group by design-sync
      category.

## 5. Tier 2 + best-effort Tier 3 stories

- [ ] Author stories for the 7 rjsf widgets + 2 templates using
      `mockWidgetProps()`, and `PipelineStage` using the `RecipeDagResult`
      fixture.
- [ ] Author best-effort Tier-3 stories: `RecipePanel` (collapsed primary),
      `SchemaConfigForm` (schema+value fixture), `BrowserConfigObjectFieldTemplate`,
      and `CanvasStage` empty-state branch only.
- [ ] Record excluded components (`StudioShell`, `StudioProviders`, `DeckCanvas`,
      any live-data-only component) and the exclusion reason in a
      `src/storybook/EXCLUSIONS.md` note.

## 6. Verification gates

- [ ] `build-storybook` completes with all in-scope stories; `iframe.html`
      emitted.
- [ ] Storybook dev server: every in-scope story renders with no console errors
      and no attempted `/rpc` call (daemon not running). Spot-check a
      Tooltip-using component renders visible (not blank) and a deck.gl-free
      canvas empty-state builds.
- [ ] Theme toggle renders both light and dark across a sample of each category.
- [ ] Biome check passes on `.storybook/**`, `src/storybook/**`, and all new
      `*.stories.tsx`.
- [ ] Studio typecheck passes with stories present.
- [ ] `bun run openspec -- validate mapgen-studio-storybook-workbench --strict`.
- [ ] `bun run openspec:validate`.
- [ ] `git diff --check`; final `git status` shows only the expected write set.

## 7. Review and disposition

- [ ] Run the four review lanes (isolation/parity, architecture-boundary via
      `codex:review`, adversarial via `codex:adversarial-review`, code-quality
      via `dev:review-code-quality`).
- [ ] Disposition findings; repair accepted P1/P2 blockers before close.

## 8. Downstream realignment and closure

- [ ] Confirm no design-sync artifact (`.design-sync/`, `.ds-sync/`, `ds-bundle/`)
      was touched and the live sync remains `package` shape.
- [ ] Note the Stage 2 enabler in the change record: stories are authored to the
      design-sync-titled, statically-renderable shape; Stage 2 flips
      `config.json` `shape` and runs the screenshot re-verify.
- [ ] Add a `docs/` pointer (or studio README line) to how to run the workbench
      (`nx storybook mapgen-studio`).
- [ ] Commit per the Graphite workflow; leave the repo clean; archive the change
      when accepted.
