## Why

The 46 design-synced MapGen Studio components live inside `apps/mapgen-studio` with no real package boundary: the Claude Design sync fakes a "package" from the app's Vite build via `.design-sync/build-inputs.sh` (hand transforms: font URL rewrite, `.dark`→`:root` dark-default flip, `:root`→`.light`), a `synthEntry` converter fork papers over the app publishing no `exports`/`types`, and the components reach into app guts (a mis-homed `cn`, two divergent `cn` implementations, a private theme-hook duplicate, runtime formatter imports one hop from `@civ7/studio-server/contract`, leaked server types in public props). Every one of these is a defect class under the decision-holder's directive: make a clean, proper React components package.

The classification is done and reviewed: `docs/projects/studio-ui-extraction/LEDGER.md` (38 clean / 6 moderate / 2 app-shaped, adversarially verified, coherence-adjudicated, 25-module shared-kernel ownership map). The design is synthesized from four parallel designers: `docs/projects/studio-ui-extraction/DESIGN.md` + `design/*.md`.

## What Changes

- **New workspace package** at `packages/studio-ui` (name RESERVED — Q2; placeholder `@civ7/studio-ui`): the 46 components + their 46 co-located CSF stories (titles byte-frozen), the extended `cn`, `useResolvedTheme`, `LAYOUT`, the split-out status label formatters, `useConfigCollapse`, the forms five-module unit (never split), the recipe-dag view+presentation split, re-homed types, a value-clean barrel + types barrel, an authored dark-default CSS source compiled to a flat `dist/styles.css`, package-owned fonts (@font-face + woff2), and a real build: tsup ESM + strict `tsc --emitDeclarationOnly` (no TS7056 tolerance) + `@tailwindcss/cli`.
- **Package-hosted Storybook** (the fidelity oracle moves with the stories); preview = TooltipProvider(300) + Toaster only; stories import the package by bare name.
- **App rewire**: ~36 file edits + 11 test relocations; app `index.css` collapses to tailwind + package theme/fonts imports + `@source` of package dist; `index.html` pre-paint light branch adds the `.light` class (mandatory companion to dark-default authoring); app package.json sheds the moved deps; app-side halves of the splits stay working (status constructors, configBuilders, viewStore/clientState/useRecipeDagQuery back-imports).
- **Design-sync repoint**: `.design-sync/` + `.ds-sync/` move into the package; config-only, same-shape (`storybook`) repoint at the package's real artifacts; anchor survives as changed:[46]; full O(46) recapture/regrade; the 4 portal dialogs via the recorded manual-verification path.
- **Deletions (one-owner enforcement)**: `build-inputs.sh`, `tsconfig.dts.json`, `ds-entry.tsx`, the `source-storybook.mjs` fork + `libOverrides`, the plain `cn` (`src/ui/utils/cn.ts`), sonner's private `useThemeFromClass`, the dead `src/ui/index.css`, the dead PHASES re-exports, the app `.storybook/` + `storybook/{storeReset,queryStub}.ts`, and every app copy of a moved file. No compatibility shims, no re-export bridges, no dual paths.
- **Execution**: 8-branch Graphite stack (scaffold → foundation+primitives → composites+layout → forms → panels+splits → AppHeader → sync repoint + deletions + oracle run → post-anchor cleanup wave), every branch CI-green.

## What Does Not Change

- **Rendered output of the 46 components** — the 46-story oracle + resync compare gates the move (ZERO_DRIFT for verbatim moves; deliberate visual cleanups are deferred to the post-anchor E3 wave and individually gated).
- Story titles (grouping authority for the sync) — byte-identical.
- The design-sync converter contract: `lib/emit.mjs` / `lib/bundle.mjs` never forked; shape stays `storybook`; `globalName` stays `MapGenStudio`.
- The app's state/data layer: zustand stores, oRPC/TanStack Query, StudioShell orchestration, daemon/server runtime.
- App-side domain modules: `seedPolicy`, `setupConfig`, `clientState`, `riverLakeInspector`, `configBuilders`, presets plumbing, `useRecipeDagQuery`, `prunePipelineExpansion`.
- No uploads to design project `531d158d…` without Matei's explicit go-ahead.

## Reserved Decisions (gate execution — Matei checkpoint)

Q2 (package name/publishing), E1 bundle (contract types × Nx boundary tag), E2 (Civ7 options data vs props), E3 (cleanup-wave batching — confirm), E4 (AppHeader redesign vs 45-component v1). Options + recommendations: `docs/projects/studio-ui-extraction/DESIGN.md` §4.

## Affected Owners

- `packages/studio-ui/**` (NEW — the package, its Storybook, its `.design-sync/` + `.ds-sync/`)
- `apps/mapgen-studio/src/**` (rewire: ~36 files; deletions of moved/dead files)
- `apps/mapgen-studio/.design-sync/**`, `apps/mapgen-studio/.ds-sync/**` (move out), `apps/mapgen-studio/.storybook/**` (delete)
- `apps/mapgen-studio/package.json`, `index.html`, `vite.config.ts` (dep prune; pre-paint fix; dev-only source alias)
- Root `vitest.config.ts` (new `studio-ui` project block)
- Forbidden owners: `.ds-sync/lib/emit.mjs` + `lib/bundle.mjs` (never forked), server/daemon code, stores, app orchestration behavior.

## Requires / Enables

- **Requires:** PRs #1991–#1994 merged (satisfied); the frozen LEDGER; the Matei checkpoint on Q2/E1–E4.
- **Enables:** retiring the build-inputs.sh bug class permanently; future UI work against a real package boundary; the E3 designed cleanup wave; a publishable design system if ever wanted.
