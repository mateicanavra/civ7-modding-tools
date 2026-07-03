## ADDED Requirements

### Requirement: The package's real build natively produces every design-sync input

The `studio-ui` workspace package SHALL produce, from its own build with zero post-build hand transforms: a compiled ESM dist entry whose module graph exports all 46 manifest components plus `TooltipProvider`; a generated strict `.d.ts` tree with a types barrel (`package.json#types` → `dist/index.d.ts`) — the build SHALL fail on any TypeScript error (no TS7056 tolerance); a flat compiled stylesheet that is dark-default (`:root` carries dark tokens) with a `.light` override block and the transitive closure of its imports inlined (tw-animate-css, fonts, component globals `.custom-scrollbar` and the native select/input resets); and woff2 font files whose `url()` references resolve within the package dist. `build-inputs.sh`, `tsconfig.dts.json`, `ds-entry.tsx`, and the `source-storybook.mjs` converter fork SHALL be deleted, not bypassed.

#### Scenario: A clean checkout builds the complete sync input
- **WHEN** `bunx nx run <studio-ui>:build` runs on a clean checkout
- **THEN** `dist/` contains the ESM entry, the `.d.ts` tree with the types barrel, the compiled dark-default stylesheet with a `.light` block, and `dist/fonts/*.woff2`
- **AND** no script outside the package build mutates any of these artifacts before the design-sync converter consumes them

#### Scenario: The theme artifact preserves today's rendered semantics
- **WHEN** the theme-invariant test compares `dist/styles.css` against the committed token-contract fixture (captured once at B1 from today's `_ds-compiled.css`)
- **THEN** the dark-default `:root` and `.light` token SETS and spot-checked values match the fixture, and the test fails on any missing token block
- **AND** value-level rendered equivalence for both theme modes is proven at the repoint branch by the cutover computed-style probe plus the forced-`.light` render canary

### Requirement: Every module has exactly one owner and no compatibility shims exist

The extraction SHALL execute the frozen ownership map (`docs/projects/studio-ui-extraction/LEDGER.md` §4 and the `ledger/coherence.md` §3 ownership table): every adjudicated shared-kernel module ends up owned by the package, the app, or split per the map, with the app importing package-owned symbols from the package and never from a retained copy. The package SHALL ship exactly one `cn` (the extended implementation), one theme-read hook (`useResolvedTheme`), one `RunInGameRelation` union, and a value-clean barrel with no external `toast` re-export. The plain `cn`, sonner's private theme hook, the dead PHASES re-exports, and the dead `src/ui/index.css` SHALL be deleted. No re-export bridges, wrapper layers, or dual import paths SHALL survive the stack.

#### Scenario: A moved module leaves no app copy behind
- **WHEN** any branch moves a module into the package
- **THEN** the app copy is deleted in the same branch and every app consumer imports from the package
- **AND** repo-wide grep finds no remaining import of the old app path

#### Scenario: The status-module split keeps domain constructors app-side
- **WHEN** the phase-label formatters move to the package
- **THEN** they type against contract types only (`import type` from `@civ7/studio-contract`, per E1-C) with the dead contract value re-exports deleted
- **AND** the app's status modules retain the operation-domain constructors with their six app consumers unchanged

#### Scenario: Contract types come from the contract package only (E1-C)
- **WHEN** the package types its contract-shaped prop surfaces (GameConsole, RecipePanel, PipelineStage) and `panels/statusLabels.ts` against `@civ7/studio-contract`
- **THEN** every contract reference is an `import type` from `@civ7/studio-contract` — no structural twins exist and no parity test is needed
- **AND** the package `verify` dist grep finds no `@civ7/studio-server` and no runtime `@civ7/studio-contract` specifier in dist JS

### Requirement: The app renders identically after the rewire

The rewired app SHALL be behavior- and render-identical: every rewire branch SHALL leave `mapgen-studio:check`, the app test suite, and the package build green, and the completed extraction SHALL pass the 46-story oracle with unchanged rendered output for every verbatim-moved component. Deliberate rendered-output changes SHALL NOT ride move branches; they are deferred to the post-anchor cleanup wave and individually story-gated. The dark-default CSS cutover SHALL land together with the `index.html` pre-paint `.light` companion fix in the same branch that flips the app to package CSS.

#### Scenario: A move branch changes no rendered output
- **WHEN** a component moves verbatim (specifier rewrites only) and its stories re-render
- **THEN** the captured story output matches the pre-move reference for that component
- **AND** any intentional visual change found riding the branch is rejected to the cleanup wave

#### Scenario: Theme flip is invisible to users
- **WHEN** the app switches from its own light-default stylesheet to the package dark-default artifact plus the pre-paint `.light` fix
- **THEN** light-preference and dark-preference sessions render with the same computed token values as before the switch

### Requirement: The design-sync repoint is config-only, same-shape, and anchor-preserving

The sync SHALL remain `shape: "storybook"` and be re-pointed at the package's real artifacts purely through `.design-sync/config.json` (and the wholesale move of `.design-sync/` + `.ds-sync/` into the package): `lib/emit.mjs` and `lib/bundle.mjs` SHALL NOT be forked or edited; story titles SHALL stay byte-identical; the 25 card overrides and `docsMap` content SHALL carry verbatim (paths re-pointed); the sync anchor SHALL survive the repoint as `changed:[46]` with `added:[]` and `removed:[]` — any added or removed entry is a stop-and-diagnose event. The first post-extraction re-verify SHALL run the full render-check tier, grade all 46 from fresh captures, and route the four portal dialogs through the manual-verification path. No upload to the pinned design project SHALL occur without Matei's explicit go-ahead.

#### Scenario: The anchor survives the repoint
- **WHEN** the first post-extraction `resync.mjs --remote` runs against the pinned project
- **THEN** the verdict reports all 46 components as changed with none added or removed and the remote anchor recognized
- **AND** a missing barrel export or a story-title drift surfaces as added/removed and halts the run

#### Scenario: Upload stays gated
- **WHEN** the local re-verify completes with all 46 graded
- **THEN** results are presented to Matei and no `write_files` call targets the pinned project before his go-ahead

### Requirement: Reserved decisions gate execution

The reserved decisions — package name/publishing (Q2), the contract-types × boundary-tag bundle (E1), Civ7 options data (E2), cleanup-wave batching (E3), and AppHeader treatment (E4) — SHALL be decided by Matei before any implementation slice executes. The recorded outcomes SHALL be reflected in this change's `design.md` before B1 starts, and an E4-defer outcome SHALL be recorded together with its consequence (the design project loses the AppHeader card until it ships).

#### Scenario: A redirect lands before code
- **WHEN** Matei's checkpoint answer differs from a recommended default
- **THEN** design.md and the decision packet are updated and the affected slices re-planned before the first package commit
