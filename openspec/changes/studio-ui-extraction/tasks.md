## 0. Gate — Matei checkpoint (blocks every implementation slice)

- [ ] 0.1 Present the decision packet (`docs/projects/studio-ui-extraction/DESIGN.md` §4): Q2 name/publishing, E1 bundle (contract types × Nx tag), E2 options data, E3 cleanup batching, E4 AppHeader. Record outcomes in DESIGN.md + this change's design.md; a redirect updates both before B1.
- [ ] 0.2 Confirm lane discipline: stack parents `studio-ui-extraction` → B1…; `git diff --cached` before every commit; draft PRs via `gt submit --draft --no-interactive` with `gt parent` verified.
- [ ] 0.3 **Staging rule for every move branch (blocker-derived, non-negotiable):** the branch that moves a module repoints EVERY not-yet-moved consumer of it — app src files, stories still app-side, and test files — to the package in the SAME branch. Branch gate: grep for each moved module's old path returns empty; `mapgen-studio:check` + app vitest + package build/check/test green. The per-branch lists below name the big classes; the grep gate is the authority, not the counts.

## 1. B1 — Package scaffold (no component code)

- [ ] 1.1 Create `packages/studio-ui/` per design.md §1: package.json (RESERVED name from 0.1; pinned deps incl. tw-animate-css + @fontsource pair; react/react-dom peers; exports map; sideEffects; nx tags key), tsconfig.json, tsup.config.ts, components.json, README stub with the LEDGER §7 contracts.
- [ ] 1.2 Authored CSS source (`src/styles/{index,theme,fonts}.css` — ONE dark-default source) + fonts copy script + build wiring (`build` = tsup + tsc dts + tailwind CLI + assets); `check`/`test`/`clean` scripts; root vitest `studio-ui` project block.
- [ ] 1.3 Capture the token contract ONCE (run build-inputs.sh a final time; extract token names/values from `_ds-compiled.css` into a committed fixture in the package test dir), then the theme-invariant test asserts `dist/styles.css` against the fixture (dark `:root` + `.light` blocks; token-set + spot-value parity) — the assert_theme_block replacement. `verify` script = artifact-contract assertions (exports count grows with each branch; final: 46 + TooltipProvider; no `@civ7/studio-server` specifier in dist JS — unconditional). Decide the `./types` export shape as adjudicated: types-only condition, no runtime target (DESIGN.md §2.8); fonts seam per DESIGN.md §2.9.
- [ ] 1.4 CI green: `bunx nx run <pkg>:build && :check && :test` + `bunx nx run mapgen-studio:check` unaffected.

## 2. B2 — Foundation + primitives (16)

- [ ] 2.1 Move extended `cn` → `src/lib/utils.ts` (delete app copy — zero external consumers, grep-gated), `useResolvedTheme` → `src/lib/`, `LAYOUT` → `src/lib/layout.ts`, ui/types → `src/types/index.ts` (verbatim). Trim the `ui/hooks` + `ui/constants` barrels in THIS branch (they re-export the deleted files).
- [ ] 2.2 Create the package `.storybook/` (main.ts + preview.tsx per storybook-sync §1, unconditional source alias, SB devDeps in the package). Move the 15 `components/ui` primitives + FieldRow + their 16 stories (bare package-name imports; titles byte-frozen); sub-barrel drops the `toast` re-export; sonner.tsx consumes `useResolvedTheme` (delete `useThemeFromClass`; move + repoint sonnerTheme test).
- [ ] 2.3 App rewire per rule 0.3 — every consumer of what B2 moves, including the still-app-side surface components and tests: 19 ui/types repoints + AppFooter/AppHeader/ExplorePanel/RecipePanel/ViewControls `../types` + `../constants` LAYOUT repoints; PipelineStage `useResolvedTheme` repoint; ALL `components/ui` primitive importers (rjsfWidgets, rjsfTemplates FieldRow, PresetDialogs, mockWidgetProps, the ~8 surface components, `test/runInGame/GameConsole.test.tsx` tooltip import, `test/controllers/*` + `test/runInGame/clientState.test.ts` + `test/studioState/persistence.test.ts` `@/ui/types` imports); useToast → sonner direct; StudioProviders/DeckCanvas → package `useResolvedTheme`; app `index.css` collapse + `index.html` pre-paint `.light` fix (same branch as the CSS flip); dev-only source alias (vite.config.ts); app dep prune (first tranche).
- [ ] 2.4 Green per rule 0.3 gates; package `build-storybook` smoke (16 stories).

## 3. B3 — Composites + layout (12: all but AppHeader)

- [ ] 3.1 Move AppBrand, AppFooter (+ required seedMin/seedMax props per adjudication 2 AND — under E2-A — mapSizeOptions/mapSizeShortLabels/playerCountOptions props mirroring today's shapes; story args = today's exact values; STRIP AppFooter's inline TooltipProvider per adjudication 6, hover verified manually), StageViewTabs (owns `StageView`; viewStore imports back), ViewControls (plain cn → extended), WaterStatsSection (owns the two narrow structural types), OptionSelect, DisclosureHeader, EmptyState (plain cn → extended), ErrorBanner, PresetDialogs (3 components), LeftDock, RightDock + their stories; delete `src/ui/utils/cn.ts` + dead `src/ui/index.css`.
- [ ] 3.2 App rewire per rule 0.3: StudioShell repoints for THIS branch's components + seed/options props wiring; still-app-side PipelineStage repoints its EmptyState import to the package; CanvasStage EmptyState normalization; presets dir split (plumbing stays); `ui/utils` barrel trim.
- [ ] 3.3 Green per rule 0.3 gates (30 stories cumulative; plain-cn unification verified no-op on the 3 affected stories via markup-pin tests).

## 4. B4 — Forms (11; the five-module unit moves as ONE)

- [ ] 4.1 Move rjsfWidgets + rjsfTemplates + SchemaConfigForm + SchemaForm (CSP deep-subpath KEPT verbatim) + pathUtils + schemaPresentation + typeboxRjsfValidator(+test) + useConfigCollapse + mockWidgetProps + the 11 stories; `configBuilders.ts` stays app-side (only file left in the app dir).
- [ ] 4.2 App rewire per rule 0.3: still-app-side RecipePanel repoints its SchemaConfigForm + useConfigCollapse imports to the package.
- [ ] 4.3 Green per rule 0.3 gates (41 stories cumulative; validator test green in the package project).

## 5. B5 — Panels + splits (4)

- [ ] 5.1 Create `panels/statusLabels.ts` (3 formatters + `runInGameRequiresProcessRestart` + collapsed `RunInGameRelation`; type-only over contract types per E1 outcome); delete dead PHASES re-exports app-side; app status modules keep constructors; clientState + runInGame-status alias the package union; StudioShell repoints `runInGameRequiresProcessRestart`.
- [ ] 5.2 recipe-dag split: PipelineStage (owns `RecipeDagLoadStatus`) + layout + domainPresentation + artifactPresentation + recipeDagFixture move; `useRecipeDagQuery` + `prunePipelineExpansion` stay (query hook imports the status union back). Move ExplorePanel, GameConsole, RecipePanel + 4 stories + relocated panel tests; app rewire per rule 0.3 (StudioShell panel repoints land HERE).
- [ ] 5.3 **E1-B drift fence**: app-side type-level parity test (mutual-assignability between `@civ7/studio-server/contract` unions/shapes and the package's re-homed types, in the app's test/type surface so drift fails `mapgen-studio:check`). Under E1-A: skip; the unconditional dist-grep fence covers the runtime leak.
- [ ] 5.4 Strict d.ts proof: package build green with zero TS7056 (a failure = mis-executed split; stop-and-diagnose, never re-add tolerance). `buildRecipeDagLayout` output byte-identical (fixture snapshot test).
- [ ] 5.5 Green per rule 0.3 gates (45 stories cumulative).

## 6. B6 — AppHeader (per E4 outcome)

- [ ] 6.1 E4a: implement the `AppHeaderSetupState` view-model + intent-callback contract (design/structure-rewire.md §5); update helpers + difficulty double-write move to the app container; both stories' args updated; markup-pin test proves identical rendered output. (E4b: skip — record the 45-component consequence.)
- [ ] 6.2 Green: as 2.4 (46 stories); `setupConfig` stays app-side; `Civ7StudioSetupConfig` out of the public API.

## 7. B7 — Sync repoint + deletions + oracle run

- [ ] 7.1 `git mv` `.design-sync/` + `.ds-sync/` into the package; config edit per design.md §2.5; DELETE build-inputs.sh, tsconfig.dts.json, ds-entry.tsx, the fork + `libOverrides`, app `.storybook/`, `storybook/{storeReset,queryStub}.ts`; NOTES.md gains an append-only extraction section.
- [ ] 7.2 Full local re-verify: buildCmd + sb-reference rebuild TOGETHER → `resync.mjs --remote` (DS_CHROMIUM_PATH=Google Chrome; config keeps `entry: "dist/index.js"` per DESIGN.md §2.6) → assert changed:[46]/added:[]/removed:[] + anchor ok → full render-check → grade all 46 → portal-4 manual path → **forced-`.light` render canary** over a token-heavy story subset (FRAME both-modes gate) → conventions.md revalidation against package artifacts.
- [ ] 7.2b Create the CI-runnable sync target: custom-named Nx target on the package (`design-sync:check` = buildCmd + sb-reference rebuild + local resync verdict), deliberately outside the CI five (FRAME §2 DoD).
- [ ] 7.3 Cutover class-set diff (old uploaded stylesheet vs package compile) + explorations grep; any gap → authored `@source inline()` safelist.
- [ ] 7.4 NO upload: present results to Matei; upload to `531d158d…` only on explicit go-ahead (atomic path, deletes verbatim from `.sync-diff.json`).

## 8. B8+ — E3 cleanup wave (post-anchor, per E3 confirmation)

- [ ] 8.1 One designed wave, each item individually story-gated: ErrorBanner text-xs→text-data, AppBrand propification, positioning-as-chrome lifts, ExplorePanel native→Radix selects, TagSelectWidget cn flip, panels/forms manual-join normalization onto the extended cn (adjudication 4's oracle-gated batch), `${id}__error` shared id-builder extraction (`forms/fieldIds.ts`), PresetConfirmDialog double-fire fix, GameConsole Popover rebuild + hover-text dedupe, object-template re-key, React 19 forwardRef sweep, memoization wave (PipelineStage).

## 9. Review + close

- [ ] 9.1 Fan-out reviews per branch (correctness / boundary / maintainability lenses + adversarial verify) + independent Codex second pass on substantial diffs; draft PRs with `gh pr edit` titles/bodies.
- [ ] 9.2 Frame §2 DoD walk with evidence (workstream close-out); runner worktree move-up + relaunch per standing memory.
