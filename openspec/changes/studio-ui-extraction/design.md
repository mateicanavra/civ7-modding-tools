# Design — studio-ui package extraction

> Committed target-shape decisions for the slice plan. Authority: the frozen classification
> (`docs/projects/studio-ui-extraction/LEDGER.md` — binding adjudications §3, ownership map §4)
> and the synthesized design (`docs/projects/studio-ui-extraction/DESIGN.md`, full designer
> reports under `docs/projects/studio-ui-extraction/design/`). Reserved decisions (Q2, E1–E4)
> carry recommended defaults here and are re-confirmed at the Matei checkpoint before any
> implementation slice runs; a redirect updates this file before execution.

## 1. Target structure (digest — full tree with every file: design/structure-rewire.md §3)

```
packages/studio-ui/
  package.json          # RESERVED name (placeholder @civ7/studio-ui); private, ESM, v0.1.0
                        # exports: . | ./types (TYPES-ONLY condition, no runtime target — DESIGN.md §2.8)
                        #   | ./styles.css | ./theme.css | ./fonts.css | ./fonts/*
                        # peerDeps react/react-dom ^19 (workspace first); all deps pinned from lockfile
  tsconfig.json         # extends base; bundler resolution; jsx react-jsx; verbatimModuleSyntax
  tsup.config.ts        # single entry src/index.ts, ESM, browser, dts via separate strict tsc
  components.json       # package-local shadcn config (or documented no-generator policy)
  .storybook/           # package-hosted; UNCONDITIONAL source alias (DESIGN.md §2.7); preview = theme.css +
                        # direct @fontsource imports (fonts.css is dist-relative — DESIGN.md §2.9) +
                        # TooltipProvider(300) + [Story, Toaster] + theme decorator (writes BOTH classes)
  .design-sync/ .ds-sync/  # moved wholesale from the app (git mv)
  test/                 # 10-11 relocated tests (incl. repointed sonnerTheme, typebox validator)
  src/
    index.ts            # value-clean barrel: 46 components + families incl. TooltipProvider;
                        # cn, useResolvedTheme(+resolveThemeFromDom), LAYOUT(+LayoutConfig),
                        # 4 statusLabels fns, useConfigCollapse; NO toast; export type * from ./types
    lib/{utils.ts (extended cn), useResolvedTheme.ts, layout.ts (LAYOUT)}
    types/index.ts      # verbatim ui/types move + re-exports of component-owned re-homed types + all *Props
                        # (+ server-contract.ts under E1-B)
    styles/{index.css (compile entry: tailwindcss source(none) + @source + imports),
            theme.css (ONE dark-default source: ":root,.dark{dark}" + ".light{light}" + @theme inline + globals),
            fonts.css (authored @font-face, url(./fonts/...))}
    storybook/{mockWidgetProps.tsx, recipeDagFixture.ts}   # internal, never barrel-exported
    components/
      ui/               # 15 shadcn primitives (kebab) + stories; sub-barrel DROPS toast re-export;
                        # sonner.tsx consumes lib/useResolvedTheme (private twin deleted)
      composites/       # AppBrand, AppFooter(+seedMin/seedMax props), AppHeader(E4a contract),
                        # StageViewTabs(owns StageView), ViewControls, WaterStatsSection(owns
                        # WaterStatsSummary/WaterStatsLayerRef), OptionSelect, DisclosureHeader,
                        # EmptyState, ErrorBanner, PresetDialogs(+3 stories)
      forms/            # FieldRow + rjsfWidgets + rjsfTemplates + SchemaConfigForm + SchemaForm
                        # (CSP deep-subpath KEPT) + pathUtils + schemaPresentation +
                        # typeboxRjsfValidator(+test) + useConfigCollapse — ONE cohesive unit
      panels/           # ExplorePanel, GameConsole, RecipePanel, statusLabels.ts (split-formatter
                        # module + collapsed RunInGameRelation), recipe-dag/{PipelineStage(owns
                        # RecipeDagLoadStatus), layout, domainPresentation, artifactPresentation}
      layout/           # LeftDock, RightDock
```

## 2. Committed decisions

1. **Build**: tsup (ESM, browser, deps auto-external) + strict `tsc --emitDeclarationOnly`
   (build FAILS on any type error — no TS7056 tolerance; the orpc path is structurally dead
   because `RecipeDagLoadStatus` re-homes and `useRecipeDagQuery` stays app-side) +
   `@tailwindcss/cli -i src/styles/index.css -o dist/styles.css` (unminified) + declarative
   woff2 copy that fails on missing files. Zero post-build transforms.
2. **CSS single-source dark-default** (synthesizer adjudication over the dual-artifact
   alternative): `:root, .dark { dark tokens }` then `.light { light tokens }` — one owner of
   the palette; cascade-order proven equivalent to today's shipped `_ds-compiled.css`.
   Mandatory app companion: `index.html` pre-paint light branch adds `classList.add("light")`.
   `@source` scan covers component sources + story files + sonner.tsx. Tailwind + CLI + app
   `@tailwindcss/vite` pinned to the same exact version.
3. **App CSS consumption**: app keeps its own Tailwind compile; `apps/mapgen-studio/src/index.css`
   becomes `@import "tailwindcss"` + package `theme.css` + `fonts.css` + `@source` of package
   dist. App drops its @fontsource imports/deps.
4. **Storybook**: package-hosted; stories co-located; bare package-name story imports (one
   tsconfig `paths` self-entry); `storyImports.shim` deletes by the converter's specifier rule;
   preview stack per LEDGER adjudication 12.
5. **Sync repoint**: config-only, same-shape; `.design-sync/` + `.ds-sync/` live in the
   package (converter resolves config/PKG_DIR from cwd); pkg/cssEntry/buildCmd re-pointed;
   `entry` KEPT at `dist/index.js` (DESIGN.md §2.6 — the no-entry PKG_DIR fallback is broken
   under the isolated linker); DELETE `libOverrides` + fork +
   `storyImports` + `componentSrcMap` (prune, with the grouped-subcomponents build-log watch
   item); overrides/titles/provider/docsMap verbatim (docsMap re-pointed PKG_DIR-relative).
   Anchor survives as changed:[46].
6. **Nx/CI**: package.json `nx` key (tags: `kind:foundation`); plain scripts
   build/check/test/clean join CI's five-target run-many; `verify` = fast artifact-contract
   assertions (46 exports + TooltipProvider, dark `:root` + `.light` blocks, no
   `@civ7/studio-server` AND no runtime `@civ7/studio-contract` specifier in dist JS —
   contract usage is type-position only, token-set parity vs the committed B1
   token-contract fixture);
   the Chromium render-check is NEVER a CI target, but a custom-named Nx target on the
   package (`design-sync:check`: buildCmd + sb-reference rebuild + local resync verdict)
   makes the sync CI-runnable per the FRAME DoD. Root vitest gains a `studio-ui` project
   (jsdom; package declares its own test devDeps under the isolated linker).
7. **Splits** (exact symbol tables: design/structure-rewire.md §3.3–3.4): statusLabels.ts
   carries the 3 formatters + `runInGameRequiresProcessRestart` (+ app StudioShell repoint) +
   the collapsed `RunInGameRelation`; dead PHASES re-exports deleted app-side; re-homed types
   live with their owning components and re-export through the types barrel; viewStore /
   clientState / runInGame-status / useRecipeDagQuery import the package types back.
8. **Checkpoint outcomes (Matei, 2026-07-01 — DESIGN.md §4a)**: Q2 DECIDED =
   `@swooper/mapgen-studio-ui` at `packages/mapgen-studio-ui` (every `@civ7/studio-ui` /
   `packages/studio-ui` placeholder in this change set reads as the decided name); E2-A
   DECIDED (options data stays app-side; options-via-props mirroring today's shapes); E3
   CONFIRMED (verbatim-move-first, one post-anchor cleanup wave); E4a DECIDED (AppHeader
   intent-callback redesign, exact contract in design/structure-rewire.md §5). **E1 RESOLVED
   = E1-C, APPROVED**: extract `@civ7/studio-contract` (packages/studio-contract,
   `kind:foundation`) as precursor branch **B0** — server keeps `implementEffect`-ing the
   identical contract (effect-orpc merge stays in its thin `./contract` subpath); app
   repoints ~18 imports; the UI package declares `"@civ7/studio-contract": "workspace:*"`
   and types its 3 props + statusLabels against the REAL contract (type-position only). No
   taxonomy revision, no structural twins, **no parity-fence test** (deleted from the plan);
   `src/types/server-contract.ts` does not exist. Full plan:
   docs/projects/studio-ui-extraction/design/e1-contract-boundary.md.

## 3. Verification model

Staging rule (blocker-derived): **the branch that moves a module repoints EVERY not-yet-moved
consumer** (src, stories still app-side, tests) to the package in the same branch; gate = grep
for the moved module's old path returns empty AND `mapgen-studio:check` + vitest green.
Per-branch: package build green (strict d.ts) + `mapgen-studio:check` green + relocated tests
green + package `build-storybook` smoke. No parity test exists (E1-C: contract types have one
owner, `@civ7/studio-contract`; the dist grep is the fence). At the repoint branch:
buildCmd + sb-reference rebuilt together → `resync.mjs --remote` (DS_CHROMIUM_PATH) → expect
changed:[46]/added:[]/removed:[] with anchor ok → full render-check → grade all 46 → portal-4
manual path → forced-`.light` render canary over a token-heavy story subset (the FRAME's
both-modes gate). Cutover class-set diff vs the old uploaded stylesheet (+ explorations grep);
`@source inline()` safelist is the only permitted remedy. Upload to `531d158d…` gated on Matei.

## 4. Risks (watched)

Dev-only source alias must stay dev-gated (oracle sees dist); two Storybooks exist transiently
mid-stack (oracle runs once at the repoint branch — mitigated by markup-pin tests + smoke
builds); E4-defer would delete the AppHeader card from the design project (in the packet);
vendored `.ds-sync` `--tw-*` patch survives skill re-stages only by vigilance; superset→subset
utility loss for explorations (checked at cutover).
