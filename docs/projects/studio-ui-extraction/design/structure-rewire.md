# Designer 4 — Package structure & app rewire (target tree, exact names, split execution, migration order)

Inputs: LEDGER.md (frozen), ledger/coherence.md §3 (binding 25-module ownership), all four build-*.md rows,
WORKSTREAM.md §3/§5/§5b, FRAME.md §2/§3/§6, ground reports (repo-conventions, sync-surface, coupling-recon,
theme-token, storybook-oracle, converter). All counts below re-verified by grep against
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction/apps/mapgen-studio` @ `c4ebaf1e1`
(cited as `app:<path>`). Package paths are relative to `packages/studio-ui/` (placeholder name — Q2 RESERVED).

Legend: **[R]** = decision reserved to Matei (Q2, E1–E4). Everything else is a recommendation this designer owns.

---

## 0. Decision-axis map

| # | Axis | Recommendation | Reserved? |
|---|---|---|---|
| D1 | Package name + location | `@civ7/studio-ui` at `packages/studio-ui` | **[R] Q2** |
| D2 | Internal layout | five ds-group dirs under `src/components/` + `lib`/`types`/`styles`/`storybook` | no |
| D3 | File-naming convention | keep per-tree convention (shadcn kebab in `components/ui`; PascalCase elsewhere) = **zero renames** | no |
| D4 | Story import specifier | stories import the package by NAME (`@civ7/studio-ui`); fixtures relative | no |
| D5 | Type re-homes | component-owned exports (exact names §3.4), aggregated in `src/types/index.ts` | no (E1 shapes exceptions) |
| D6 | Split-formatter home | one `src/components/panels/statusLabels.ts` (type-only over the contract) | no |
| D7 | Design-sync + Storybook home | both move INTO the package (`.design-sync/`, `.ds-sync/`, `.storybook/`) | no |
| D8 | AppHeader | E4(a) approved redesign — intent-callback contract in §5 | **[R] E4** |
| D9 | Civ7 options data | app keeps `options.ts`/`defaults.ts`; AppFooter/AppHeader receive options via props | **[R] E2** |
| D10 | Contract types in `.d.ts` | types-only dep on `@civ7/studio-server` (with taxonomy caveat §8.1) | **[R] E1** |
| D11 | Migration order | 7-branch Graphite stack + 1 post-stack E3 wave (§6) | E3 batching **[R]** |
| D12 | Test relocation | tests of package code move to `packages/studio-ui/test/` + co-located; app halves stay | no |

---

## 1. D1 — Package identity and location **[RESERVED — Q2]**

| Option | Pros | Cons |
|---|---|---|
| **`@civ7/studio-ui` @ `packages/studio-ui`** (recommended) | matches house rule "infrastructure/control = `@civ7/*`" (ground: repo-conventions §1.2); sibling of `@civ7/studio-server` (the app's other half); short | none material |
| `@swooper/studio-ui` | `@swooper/*` is the mapgen DOMAIN family (mapgen-core/viz); the studio UI is app chrome, not mapgen domain | miscommunicates domain membership |
| `@civ7/mapgen-studio-ui` | maximally explicit | long; app is unscoped `mapgen-studio`, so the pairing is already implied by `studio-*` |

Publishing: `private: true`, `version 0.1.0`, `type: module`, `engines.node 22.22.0` — the internal-package
recipe (repo-conventions §1.2). npm publication is a separate later decision; nothing in this tree precludes it
(pins required first: cva/clsx/tailwind-merge are `"latest"`, LEDGER §3.9).

Nx: no `project.json`; config via package.json `nx` key. Tag: see §8.1 — **the tag choice is entangled with E1**
and cannot be finalized here.

---

## 2. D2/D3 — Internal layout + naming convention

### Alternatives

1. **Mirror today's split** (`src/components/ui` + `src/ui/components` + `src/features/{presets,configOverrides,recipeDag}` + `src/app`):
   maximally verbatim, but enshrines the accidental three-tree split the directive says not to carry
   ("do not over-index on how things currently are"). The `src/app`/`src/features` names are meaningless inside a package.
2. **Five ds-group dirs** (recommended): `src/components/{ui,composites,forms,panels,layout}/` — mirrors the pinned
   five-group sync taxonomy (story titles, sync-surface §1), so the file system and the design-system pane agree;
   keeps `components/ui` for shadcn-generator compatibility (components.json `aliases.ui`, build-primitives §Shared.3).
3. **Flat per-component dirs** (`src/components/<Name>/`): idiomatic for big design systems, but forces 46 dir
   creations + splitting today's multi-component files (PresetDialogs, rjsfWidgets, rjsfTemplates) — the forms
   five-module unit's cross-file contracts (LEDGER §2 forms note) make this churn-for-nothing.

**Recommendation: option 2.** Story titles are the grouping authority and stay VERBATIM; file paths are free
(sync-surface §3.3), so the one-time re-key window (fork deletion + story moves already re-key all 46 —
converter §4 "one-time cost") makes this relayout free with respect to the sync.

### Naming convention (D3)

Today: `components/ui` is kebab-case (shadcn convention, `button.tsx`); everything else is PascalCase
(`AppFooter.tsx`). Repo packages have no component-file precedent (repo-conventions §3.1: zero `.tsx` under
`packages/`). Options:

- **Keep per-tree convention** (recommended): shadcn tree stays kebab (matches the ecosystem + any future
  `shadcn add` against the package's own components.json); all other components stay PascalCase (React norm,
  31 files). **Rename cost: zero.** Verbatim moves stay verbatim; `git diff --find-renames` shows R≈100.
- All-kebab: 31 renames. Free w.r.t. sync grading (componentSrcMap values are inert under storybook shape,
  converter §1a; sourceKeys re-key anyway), but pure review noise and git-history churn for no behavior.

Multi-component files stay multi-component (`PresetDialogs.tsx` = 3 rows, `rjsfWidgets.tsx` = 7,
`rjsfTemplates.tsx` = 3) — the sync's story-title identity does not require file splits.

---

## 3. The complete target file tree

```
packages/studio-ui/
├── package.json                  # @civ7/studio-ui [R], private, ESM, exports map (§3.6), peer react/react-dom
├── tsconfig.json                 # extends ../../tsconfig.base.json; moduleResolution bundler; jsx react-jsx; noEmit
├── tsup.config.ts                # entries: src/index.ts, src/types/index.ts; --dts; CSS build seam (Designer-build owns mechanics)
├── components.json               # package-local shadcn config; aliases.ui → src/components/ui, aliases.utils → src/lib/utils
├── README.md                     # package usage + documented contracts (LEDGER §7)
├── .storybook/
│   ├── main.ts                   # stories: ["../src/**/*.stories.@(tsx|jsx)"]; no child_process/mapgen-viz aliases (dead — storybook-oracle §5)
│   └── preview.tsx               # fonts + package CSS + TooltipProvider(300) + Toaster + theme decorator ONLY (adjudication 12)
├── .design-sync/                 # MOVED config home (D7): config.json, NOTES.md, conventions.md, groups/*.md (5), overrides/ (empty after fork deletion)
├── .ds-sync/                     # MOVED vendored converter (committed policy per .gitignore, converter §0)
├── test/                         # relocated non-co-located tests (§3.8)
│   ├── AppHeader.test.tsx        #   (E4a only; E4b → stays app-side)
│   ├── AppFooter.test.tsx
│   ├── GameConsole.test.tsx
│   ├── waterStatsSection.test.tsx
│   ├── sonnerTheme.test.tsx      #   repointed at useResolvedTheme + Toaster (adjudication 5)
│   ├── useConfigCollapse.test.ts
│   ├── rjsfFieldTemplateErrors.test.tsx
│   ├── PipelineStage.test.tsx
│   ├── recipeDagLayout.test.ts       # from app test/recipeDag/layout.test.ts (renamed to avoid bare "layout")
│   └── domainPresentation.test.ts
└── src/
    ├── index.ts                  # THE value-clean barrel (§3.5)
    ├── lib/
    │   ├── utils.ts              # extended cn — verbatim from app:src/lib/utils.ts (keeps `utils.ts` name for shadcn components.json compat)
    │   ├── useResolvedTheme.ts   # verbatim from app:src/ui/hooks/useResolvedTheme.ts (+ resolveThemeFromDom, ResolvedTheme)
    │   └── layout.ts             # LAYOUT + LayoutConfig — verbatim from app:src/ui/constants/layout.ts
    ├── types/
    │   └── index.ts              # verbatim move of app:src/ui/types/index.ts (307 lines, zero imports)
    │                             #   + re-exports of component-owned re-homed types (§3.4) and all public Props types
    ├── styles/
    │   ├── index.css             # tokens source: @import tailwindcss + tw-animate-css, @custom-variant dark, @theme inline,
    │   │                         #   :root light, .dark, @layer base, .custom-scrollbar (legacy vars inlined), select/input resets,
    │   │                         #   .font-mono, backdrop-blur fallback  (from app:src/index.css 8–246; pulse-subtle dropped — dead, theme-token §Surprises.4)
    │   └── dark-default.css      # the AUTHORED inversion for the ds bundle: dark tokens on :root + `.light` toggle
    │                             #   (retires build-inputs.sh awk steps 4–5; converter §3 "the one bespoke artifact")
    ├── storybook/
    │   ├── mockWidgetProps.tsx   # verbatim from app:src/storybook/mockWidgetProps.tsx (imports become package-relative)
    │   └── recipeDagFixture.ts   # verbatim from app:src/storybook/recipeDagFixture.ts (typed against contract — E1 [R])
    └── components/
        ├── ui/                                     # 15 shadcn primitives — kebab, verbatim from app:src/components/ui/
        │   ├── index.ts                            #   sub-barrel; DROPS `export { toast } from "sonner"` (adjudication 8)
        │   ├── button.tsx        + button.stories.tsx
        │   ├── checkbox.tsx      + checkbox.stories.tsx
        │   ├── dialog.tsx        + dialog.stories.tsx
        │   ├── dropdown-menu.tsx + dropdown-menu.stories.tsx
        │   ├── input.tsx         + input.stories.tsx
        │   ├── label.tsx         + label.stories.tsx
        │   ├── popover.tsx       + popover.stories.tsx
        │   ├── scroll-area.tsx   + scroll-area.stories.tsx
        │   ├── select.tsx        + select.stories.tsx
        │   ├── separator.tsx     + separator.stories.tsx
        │   ├── sonner.tsx        + sonner.stories.tsx    # useThemeFromClass DELETED → imports ../../lib/useResolvedTheme (adjudication 5)
        │   ├── switch.tsx        + switch.stories.tsx
        │   ├── tabs.tsx          + tabs.stories.tsx
        │   ├── textarea.tsx      + textarea.stories.tsx
        │   └── tooltip.tsx       + tooltip.stories.tsx
        ├── composites/                             # from app:src/ui/components/, app:src/app/, app:src/features/presets/
        │   ├── AppBrand.tsx          + AppBrand.stories.tsx
        │   ├── AppFooter.tsx         + AppFooter.stories.tsx      # + seedMin/seedMax props (§4.5); E2 option props [R]
        │   ├── AppHeader.tsx         + AppHeader.stories.tsx      # E4a redesigned contract (§5); E4b → stays app-side
        │   ├── StageViewTabs.tsx     + StageViewTabs.stories.tsx  # exports `type StageView` (re-home)
        │   ├── ViewControls.tsx      + ViewControls.stories.tsx   # plain cn → ../../lib/utils
        │   ├── WaterStatsSection.tsx + WaterStatsSection.stories.tsx  # exports WaterStatsSummary/WaterStatsLayerRef (§3.4)
        │   ├── OptionSelect.tsx      + OptionSelect.stories.tsx
        │   ├── DisclosureHeader.tsx  + DisclosureHeader.stories.tsx
        │   ├── EmptyState.tsx        + EmptyState.stories.tsx
        │   ├── ErrorBanner.tsx       + ErrorBanner.stories.tsx    # from app:src/app/ErrorBanner.tsx
        │   └── PresetDialogs.tsx     + PresetErrorDialog.stories.tsx + PresetSaveDialog.stories.tsx + PresetConfirmDialog.stories.tsx
        ├── forms/                                  # THE five-module cohesive unit + widgets/templates + FieldRow — NEVER SPLIT (LEDGER §2 forms)
        │   ├── FieldRow.tsx          + FieldRow.stories.tsx       # story title stays `primitives/FieldRow` (title ≠ path)
        │   ├── rjsfWidgets.tsx       + {Text,Textarea,Number,Select,Checkbox,Switch,TagSelect}Widget.stories.tsx (7)
        │   ├── rjsfTemplates.tsx     + BrowserConfig{Field,ObjectField,ArrayField}Template.stories.tsx (3)
        │   ├── SchemaConfigForm.tsx  + SchemaConfigForm.stories.tsx
        │   ├── SchemaForm.tsx                                     # keeps @rjsf/core deep-subpath CSP fix (pinned hazard, LEDGER §7)
        │   ├── pathUtils.ts
        │   ├── schemaPresentation.ts
        │   ├── typeboxRjsfValidator.ts + typeboxRjsfValidator.test.ts   # test moves co-located, verbatim
        │   └── useConfigCollapse.ts                               # PUBLIC export (SchemaConfigForm's collapse counterpart; §3.5)
        ├── panels/
        │   ├── ExplorePanel.tsx      + ExplorePanel.stories.tsx
        │   ├── GameConsole.tsx       + GameConsole.stories.tsx
        │   ├── RecipePanel.tsx       + RecipePanel.stories.tsx
        │   ├── statusLabels.ts                                    # the split-formatter module (§3.3)
        │   └── recipe-dag/                                        # the designed directory split (LEDGER row 44)
        │       ├── PipelineStage.tsx + PipelineStage.stories.tsx  # exports `type RecipeDagLoadStatus` (re-home) + PIPELINE_EDGE_INK
        │       ├── layout.ts                                      # buildRecipeDagLayout — output must stay byte-identical
        │       ├── domainPresentation.ts
        │       └── artifactPresentation.ts
        └── layout/
            ├── LeftDock.tsx          + LeftDock.stories.tsx
            └── RightDock.tsx         + RightDock.stories.tsx
```

All 46 components accounted for: ui 15 + FieldRow (forms dir, primitives title) = 16 primitives;
composites 13 (10 files + PresetDialogs×3); forms 11 (7 widgets + 3 templates + SchemaConfigForm);
panels 4; layout 2. 46 story files co-located, titles byte-identical.

### 3.1 What does NOT move (stays app-side, per coherence §3)

`configBuilders.ts` (stays at `app:src/features/configOverrides/configBuilders.ts` — the only file left in that
dir), `seedPolicy.ts`, `setupConfig.ts`, `clientState.ts`, `riverLakeInspector.ts`, `viewStore.ts`,
`useRecipeDagQuery.ts`, `prunePipelineExpansion.ts` (zero imports — verified), presets plumbing
(`dialogState/usePresets/storage/importFlow/importExport/repoBacked/types`), `ui/utils/{config,formatting}.ts` + barrel,
`ui/hooks/{useGeneration,useTheme,useViewState}.ts`, `ui/constants/{options,defaults}.ts` (E2 [R]), app status-module
halves (§4.6), `storybook/{storeReset,queryStub}.ts` (retire with the app preview — adjudication 12), `index.html`
flash guard, `useThemePreference` policy.

### 3.2 Deletions (one-owner enforcement)

App copies of every moved file; `app:src/ui/utils/cn.ts` (plain cn — coherence §3 "delete");
`app:src/ui/index.css` (provably dead, Q9); `.design-sync/ds-entry.tsx`; `.design-sync/build-inputs.sh`;
`.design-sync/tsconfig.dts.json`; `.design-sync/overrides/source-storybook.mjs` (+ its `libOverrides` entry);
`app:.storybook/` (both files); `app:src/storybook/` (storeReset, queryStub, EXCLUSIONS.md — the four exclusions
note migrates into the package README).

### 3.3 The split-formatter module — `src/components/panels/statusLabels.ts`

Exact contents (all verified pure; type-only over `@civ7/studio-server/contract`):

| Symbol | From | Package consumers | App consumers (repoint to barrel) |
|---|---|---|---|
| `formatMapConfigSaveDeployPhaseLabel` | app:src/features/mapConfigSave/status.ts:20 | GameConsole, RecipePanel | none |
| `formatRunInGamePhaseLabel` | app:src/features/runInGame/status.ts:38 | GameConsole | none |
| `runInGamePrimaryActionLabel` | runInGame/status.ts:76 | GameConsole | none |
| `runInGameRequiresProcessRestart` | runInGame/status.ts:69 (dep of primaryActionLabel:81) | GameConsole (indirect) | **StudioShell.tsx:14** |
| `type RunInGameRelation` | collapse of `RunInGameActionRelation` (status.ts:23) ≡ `RunInGameCurrentRelation` (clientState.ts:41) | GameConsole prop | clientState + status alias back (§4.6) |

Alternative: two files mirroring the app's domain split (`mapConfigSaveLabels.ts` + `runInGameLabels.ts`) — rejected:
the three formatters + relation union are one vocabulary consumed by one component pair; one file keeps the
contract-facing seam singular. The imports remain `import type { … } from "@civ7/studio-server/contract"` plus one
value-free module — the dead `export { MAP_CONFIG_SAVE_DEPLOY_PHASES }` / `export { RUN_IN_GAME_PHASES }` re-exports
(status.ts:9 / :8, zero consumers — grep-confirmed at freeze) are deleted app-side, not carried.

### 3.4 Re-homed types — exact names and homes

| New type | Home (exports it) | Replaces | Back-reference |
|---|---|---|---|
| `StageView` (`"map" \| "pipeline"`) | `composites/StageViewTabs.tsx` | app:src/stores/viewStore.ts:32 | viewStore imports from `@civ7/studio-ui` and re-exports (`app:useViewportLayout.ts:9` keeps working) |
| `RunInGameRelation` (`"current" \| "stale" \| "unknown"`) | `panels/statusLabels.ts` | the twin unions above | app `clientState.ts` + `runInGame/status.ts` alias it (never a third copy — adjudication 7) |
| `RecipeDagLoadStatus` (`"idle" \| "loading" \| "ready" \| "error"`) | `panels/recipe-dag/PipelineStage.tsx` | app:src/features/recipeDag/useRecipeDagQuery.ts:20 | useRecipeDagQuery imports it back (kills the TS7056/orpc d.ts path — LEDGER row 44) |
| `WaterStatsSummary` | `composites/WaterStatsSection.tsx` | narrow structural stand-in for `RiverLakeFloodplainInspectorSummary` | app `riverLakeInspector` types stay wide; call sites assign structurally (build-composites row 6) |
| `WaterStatsLayerRef` | `composites/WaterStatsSection.tsx` | narrow structural stand-in for `RiverLakeInspectorLayerRef` (fields actually read: `layerKey/dataTypeKey/label/presentation.{categoryLabel,palette.activeColor}`; summary rows: `rowKey/label/counts/layerRefs`) | same; ExplorePanel imports the two from the sibling |
| `Civ7StudioSetupConfig` | **E1 [R]** — recommended: NOT re-homed; under E4a AppHeader stops importing it entirely (§5), so the question collapses to the story/app container only | app:src/features/civ7Setup/setupConfig.ts:28 | — |
| `MapConfigSaveDeployStatus`, `RunInGameOperationStatus`, `RecipeDagResult` | **E1 [R]** — recommended: types-only dep on `@civ7/studio-server` (zero drift; §8.1 caveat) | prop types of GameConsole/RecipePanel/PipelineStage | — |
| `ThemePreference`, `GenerationStatus`, `SelectOption`, `PipelineConfig`, `RecipeSettings`, `WorldSettings`, + rest of the 307-line module | `src/types/index.ts` (verbatim move of `app:src/ui/types/index.ts`) | — | 19 app files repoint (§4.1) |

`src/types/index.ts` additionally re-exports the component-owned types (`export type { StageView } from "../components/composites/StageViewTabs"` etc.)
and every public `*Props` type, making it the single types barrel the LEDGER §6 demands.

### 3.5 Barrel spec — `src/index.ts` (value-clean, covers all 46 + today's gaps)

- **Components (all 46 + families):** the full `components/ui` set incl. subcomponents (Dialog×10, DropdownMenu×15,
  Select×10, Tooltip×4 **incl. `TooltipProvider`** — provider gate hard-fails otherwise, converter §3), `Toaster`;
  `FieldRow`; all 11 composites incl. the six current gaps (StageViewTabs, OptionSelect — build-composites §Shared.4;
  ErrorBanner, LeftDock, RightDock, PipelineStage — build-panels §5) + the 3 preset dialogs; the 7 widgets +
  `configWidgets`, the 3 templates, `SchemaConfigForm`; `ExplorePanel`, `GameConsole`, `RecipePanel`, `PipelineStage`;
  `LeftDock`, `RightDock`.
- **Utilities the app demands (LEDGER §6):** `cn`, `useResolvedTheme` (+ `resolveThemeFromDom`), `LAYOUT`
  (+ `LayoutConfig`), the four statusLabels functions, `useConfigCollapse` (public: the documented
  `data-config-*`/`configContentId` collapse engine that pairs with SchemaConfigForm — keeping it public avoids any
  transient re-export during migration and is a legitimate composition API).
- **Explicitly ABSENT:** `toast` (app `useToast` imports `sonner` directly — adjudication 8); `buttonVariants`-style
  internals stay (they're already exported today, keep); no app-domain values of any kind.
- `export type * from "./types"` so the main entry's `.d.ts` carries the full type surface
  (`exportedNames` reads `package.json#types` → `dist/index.d.ts`; a real value-export list there retires the
  synthEntry fork — converter §3).
- Dropped without replacement: `FOOTER_HEIGHT` standalone re-export (AppFooter.tsx:68 → barrel) — zero consumers
  outside the barrel chain (grep-verified; `useViewportLayout` uses `LAYOUT.FOOTER_HEIGHT`).

### 3.6 package.json exports map (names concrete; build mechanics = Designer-build's lane)

```jsonc
"types": "./dist/index.d.ts",
"exports": {
  ".":            { "types": "./dist/index.d.ts",       "import": "./dist/index.js" },
  "./types":      { "types": "./dist/types/index.d.ts", "import": "./dist/types/index.js" },
  "./styles.css":              "./dist/styles.css",              // app + Storybook entry (light :root + .dark)
  "./styles-dark-default.css": "./dist/styles-dark-default.css", // ds cssEntry (dark :root + .light)
  "./styles/index.css":        "./src/styles/index.css"          // source-CSS escape hatch for the app's own Tailwind compile (§8.2)
},
"files": ["src", "dist"]
```

Fonts: `@fontsource/inter` + `@fontsource/jetbrains-mono` become package dependencies; the CSS build copies the
woff2 set to `dist/fonts/` with relative `url(./fonts/…)` so the converter's `extractFonts` resolves them from the
stylesheet's own directory (converter §1a). Key-order convention `types` → `import` matches mapgen-core
(repo-conventions §1.6).

### 3.7 Storybook + design-sync homes (D7)

- `.storybook/main.ts`: framework `@storybook/react-vite`, `stories: ["../src/**/*.stories.@(tsx|jsx)"]`,
  `addon-docs` only, `disableTelemetry`. **No `@` alias, no `child_process`/mapgen-viz aliases** (verified
  not load-bearing for the story graph — storybook-oracle §5). Dev-mode alias `@civ7/studio-ui` → `src/index.ts`
  (gated `configType === "DEVELOPMENT"`, the sanctioned mapgen-viz pattern — repo-conventions §2.2); production
  builds resolve the self-reference through `exports` → dist, so **the sb-reference oracle renders the shipped
  artifact** (strictly stronger fidelity than today).
- `.storybook/preview.tsx`: six `@fontsource` imports + `import "@civ7/studio-ui/styles.css"` +
  `QueryClientProvider` **dropped** (zero storied consumers — storybook-oracle §2.4), `TooltipProvider(300)` +
  `Toaster` + the theme toolbar/decorator, **no `beforeEach` storeReset** (invariant vacuous — adjudication 12).
- `.design-sync/` moves wholesale (config.json, NOTES.md, conventions.md, groups/×5); `.ds-sync/` moves with it
  (committed-vendored policy, converter §0). cwd for the sync becomes `packages/studio-ui`; PKG_DIR resolves to the
  package; `docsMap`/`tsconfig`/`storybookConfigDir` all resolve package-relative with **no `../` reach-back** —
  the alternative (sync stays app-side, every path reaches `../../packages/studio-ui/...`) is legal
  (workspaceRoot-bounded) but leaves the deleted-app-shape's ghost as the config home; rejected.
- config.json key changes (per converter §4): `pkg: "@civ7/studio-ui"`, drop `entry` (exports resolution),
  `cssEntry: "dist/styles-dark-default.css"`, `buildCmd: "bun run build"` (or the nx invocation),
  `tsconfig: "tsconfig.json"` (now the package's), `storyImports.shim: []` (package-name imports shim by rule 1 —
  story-imports.mjs:133), `componentSrcMap` values updated to package paths (honesty only; keys remain the pins),
  delete `libOverrides`. `shape`/`projectId`/`globalName`/`storybookStatic`/`storybookConfigDir`/`srcDir`/`overrides`/
  `readmeHeader`/`docsMap` carry as-is.

### 3.8 Tests (D12)

Verified inventory of app tests importing MOVING code (grep, §evidence in run log): 11 files. Recommended split:

- **Move to `packages/studio-ui/test/`** (new root-vitest project `studio-ui`): `AppHeader.test.tsx` (E4a),
  `AppFooter.test.tsx`, `GameConsole.test.tsx`, `waterStatsSection.test.tsx`, `sonnerTheme.test.tsx` (repointed),
  `useConfigCollapse.test.ts`, `rjsfFieldTemplateErrors.test.tsx`, `PipelineStage.test.tsx`,
  `recipeDagLayout.test.ts`, `domainPresentation.test.ts`. Plus co-located `typeboxRjsfValidator.test.ts` in src.
  They import package internals relatively (or the barrel where the symbol is public).
- **Stay app-side** (they test app halves): `useBrowserRun.test.tsx` (seedPolicy), `usePresetLifecycle.test.tsx`
  (configBuilders/setupConfig), `useSaveDeploy.test.tsx` (status constructors), everything else in `app:test/`.
- Root `vitest.config.ts` gains a `studio-ui` project block (root `r("packages/studio-ui")`, jsdom via the app's
  pattern); **no alias block needed** (no `@/`, no mod-source imports in the package graph). The app's `mapgen-studio`
  block keeps its aliases unchanged.

Alternative (keep all tests app-side, repoint imports to the package): fewer moved files, but the package then has
zero tests of its own and CI for the package proves nothing — rejected under "the package is a real library".

---

## 4. App-side rewire inventory (every file, exact change — counts verified by grep)

### 4.1 `ui/types` repoints — **19 files** (grep-verified; LEDGER's "17" undercounts by the two `ui/constants` files)

`import type { … } from "<rel>/ui/types"` → `import type { … } from "@civ7/studio-ui/types"` (or the main barrel):

1. `src/app/StudioShell.tsx:27` (also §4.4)
2. `src/app/hooks/useRunInGame.ts:29`
3. `src/app/hooks/usePresetLifecycle.ts:28`
4. `src/app/hooks/useVizSelection.ts`
5. `src/app/hooks/useSaveDeploy.ts:16`
6. `src/app/hooks/useKeyboardShortcuts.ts:4`
7. `src/features/configOverrides/configBuilders.ts:11`
8. `src/features/configMigrations/pipelineConfig.ts:1`
9. `src/features/presets/usePresets.ts:3`
10. `src/features/runInGame/clientState.ts:2` (also §4.6)
11. `src/features/runInGame/liveSource.ts:6`
12. `src/features/studioState/persistence.ts:2`
13. `src/stores/authoringStore.ts:16`
14. `src/ui/hooks/useGeneration.ts:8`
15. `src/ui/hooks/useTheme.ts:2`
16. `src/ui/hooks/useViewState.ts:9`
17. `src/ui/utils/config.ts`
18. `src/ui/constants/defaults.ts:8`
19. `src/ui/constants/options.ts`

(Story-side chases — AppFooter.stories:4, RecipePanel.stories:4 — move WITH the stories; not app files.)

### 4.2 Constants — **2 files + 1 barrel edit** (verified)

- `src/app/hooks/useViewportLayout.ts:10` — `LAYOUT` from `../../ui/constants/layout` → `@civ7/studio-ui`.
- `src/ui/constants/index.ts` — drop the `LAYOUT`/`LayoutConfig` re-export lines (layout.ts deleted);
  `MAP_SIZE_LABELS`/`MAP_SIZE_SHORT` derivations stay.
- `src/ui/hooks/useViewState.ts:8` (`DEFAULT_VIEW_STATE` from `../constants`) — unchanged (defaults stay app-side).

### 4.3 Theme + toast — **4 files**

- `src/app/hooks/useToast.ts:3` — `import { toast as sonnerToast } from "../../components/ui"` →
  `import { toast as sonnerToast } from "sonner"` (barrel is value-clean).
- `src/app/StudioProviders.tsx` — `Toaster`, `TooltipProvider` → `@civ7/studio-ui`; `useResolvedTheme` (if imported
  here) → `@civ7/studio-ui`. (`useThemePreference` from `../ui/hooks` unchanged.)
- `src/features/viz/DeckCanvas.tsx` — `useResolvedTheme` → `@civ7/studio-ui`.
- `src/ui/hooks/index.ts` — drop the `useResolvedTheme`/`resolveThemeFromDom`/`ResolvedTheme` re-export line
  (file deleted; hook barrel keeps useGeneration/useThemePreference/useViewState).

### 4.4 Component consumers — **3 files**

- `src/app/StudioShell.tsx` — repoint to `@civ7/studio-ui`: `PresetConfirmDialog/PresetErrorDialog/PresetSaveDialog`
  (:7-10), `PipelineStage` (:12), `runInGameRequiresProcessRestart` (:14), `AppFooter/AppHeader/ExplorePanel/`
  `GameConsole/RecipePanel/StageViewTabs` (:21-26), `ErrorBanner` (:30), `LeftDock` (:45) + `RightDock`. Plus the
  E4a intent-callback container wiring (§5) and AppFooter's new `seedMin`/`seedMax` args (§4.5).
- `src/app/CanvasStage.tsx:6` — `EmptyState` direct-file import → `@civ7/studio-ui` (the normalize item; the OTHER
  direct importer, PipelineStage.tsx:4, becomes package-internal `../../composites/EmptyState` in its move).
- `src/App.tsx` — comment-only mentions; no code change (verified).

### 4.5 AppFooter inject-prop (seedPolicy — adjudication 2)

`AppFooterProps` gains `seedMin: number; seedMax: number` (required — a package-side default would create the
second policy owner the adjudication forbids). `StudioShell` passes `CIV7_STUDIO_SEED_MIN/MAX` from
`features/civ7Setup/seedPolicy`. `AppFooter.stories.tsx` args add the two numbers (fixture values, not policy).
Rendered DOM identical (same values reach the same `min`/`max` attrs — AppFooter.tsx:266-273).
Under **E2 [R]** = options-via-props (recommended for direction cleanliness, consistent with coherence §3's
app-ownership lean): AppFooter additionally gains
`mapSizeOptions: ReadonlyArray<SelectOption & { dimensions?: string }>`, `mapSizeShortLabels: Record<string,string>`,
`playerCountOptions: ReadonlyArray<SelectOption<number>>` — mirroring today's shapes exactly so the rendered output
is unchanged; StudioShell passes the app constants. Under E2 = ship-in-package: `options.ts`/`defaults.ts` move to
`src/lib/options.ts` instead and rows 18-19 of §4.1 become deletions. **E2 changes AppFooter's (and, under E4a,
AppHeader's option sourcing) public API — surface this at the Matei checkpoint before B3.**

### 4.6 App-side halves of the splits — **5 files edited in place**

- `src/features/mapConfigSave/status.ts` — delete `import { MAP_CONFIG_SAVE_DEPLOY_PHASES }` + `export { … }` (:7-9,
  dead) and `formatMapConfigSaveDeployPhaseLabel` (:20-35, moved). Keep `kindForMapConfigSaveDeployPhase`,
  `createMapConfigSaveDeployStatus`, `updateMapConfigSaveDeployStatus`, `isSaveDeployTerminal`,
  `saveDeployResultFromTerminalStatus` (consumers: useSaveDeploy, operationAdoption, tests — verified).
- `src/features/runInGame/status.ts` — delete the dead `RUN_IN_GAME_PHASES` re-export (:6-8) and the three moved
  functions (:38-90 minus kindFor); replace `export type RunInGameActionRelation = …` with
  `export type RunInGameActionRelation = RunInGameRelation` (imported from `@civ7/studio-ui`). Keep
  `isRunInGameTerminalPhase`, `kindForRunInGamePhase`, `formatRunInGameDiagnostics`, `stableRunInGameStringify`.
- `src/features/runInGame/clientState.ts:41` — `export type RunInGameCurrentRelation = RunInGameRelation` (alias,
  keeps all app call sites compiling; adjudication 7 — never a third copy).
- `src/stores/viewStore.ts` — `import type { StageView } from "@civ7/studio-ui"; export type { StageView };`
  replacing the local union (:32). (`useViewportLayout.ts:9` and `storeReset` — while it exists — keep working.)
- `src/features/recipeDag/useRecipeDagQuery.ts:20` — `import type { RecipeDagLoadStatus } from "@civ7/studio-ui";
  export type { RecipeDagLoadStatus };` replacing the local union.

### 4.7 Setup config (E4-dependent)

- `src/features/civ7Setup/setupConfig.ts` — **unchanged** (keeps runtime normalization; app-owned).
- Under E4a: StudioShell (or a thin `app/hooks/useSetupControls` extension) implements the four intent handlers —
  including the difficulty double-write (game `Difficulty` + player `PlayerDifficulty`, today at AppHeader.tsx:87-92)
  — and derives the `AppHeaderSetupState` view-model (§5).

### 4.8 CSS, entry, config files

- `src/index.css` — token/theme/global blocks (lines 8-246 classes) replaced by
  `@import "@civ7/studio-ui/styles.css";` (or the source-CSS variant — §8.2); app keeps only app-only globals (if
  any remain after the audit) and its own `@import "tailwindcss"` scope decision (Designer-build seam).
- `src/main.tsx` — unchanged (fonts + index.css imports stay).
- `index.html` — unchanged (hex flash-guard stays app-owned, documented manual-sync — theme-token §3.1).
- `apps/mapgen-studio/package.json` — add `"@civ7/studio-ui": "workspace:*"`; REMOVE deps that now have zero app-side
  importers (verify each by grep at execution time): the 12 `@radix-ui/*`, `class-variance-authority`,
  `clsx`, `tailwind-merge`, `@rjsf/core`, `@rjsf/utils`, `typebox`, `tw-animate-css`, `lucide-react` (grep shows no
  non-surface importers), `@fontsource/*` stays (main.tsx imports), `sonner` stays (useToast). Storybook devDeps +
  `storybook`/`build-storybook` scripts move to the package.
- Root `vitest.config.ts` — add the `studio-ui` project (§3.8).
- App `tsconfig.json` — unchanged (`@/*` alias remains for app code).

**Rewire footprint: 19 (types) + 2 (constants) + 4 (theme/toast) + 3 (consumers) + 5 (split halves) + 2 (css/pkg)
+ root vitest ≈ 36 app-side file edits**, plus deletions (§3.2) and the 11 test moves.

---

## 5. AppHeader parameterized on E4 **[RESERVED]**

### (a) Approved redesign — recommended

The component keeps its rendering, sentinel presentation, and ResizeObserver; it stops computing config updates.
Exact contract (replaces `setupConfig`/`onSetupConfigChange` — AppHeader.tsx:28,36):

```ts
export interface AppHeaderSetupState {
  /** Selected saved config, or null when none. displayName feeds the Re-apply affordance copy. */
  savedConfig: { id: string; displayName: string } | null;
  leaderId: string;        // "" = unset (today: String(localPlayerSetup.options.PlayerLeader ?? ""))
  civilizationId: string;
  difficultyId: string;
  gameSpeedId: string;
}
export interface AppHeaderProps {
  themePreference: ThemePreference;      // now from @civ7/studio-ui/types
  onThemeCycle: () => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  setup: AppHeaderSetupState;            // view-model, package-owned, structural
  setupOptions: { savedConfigOptions; leaderOptions; civilizationOptions; difficultyOptions; gameSpeedOptions };
                                          // shapes unchanged (ReadonlyArray<{value,label}>)
  savedConfigModified?: boolean;
  onSavedConfigChange: (configId: string) => void;
  onLeaderChange: (value: string) => void;        // "" = clear
  onCivilizationChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;    // app owns the game+player double-write
  onGameSpeedChange: (value: string) => void;
  onHeaderHeightChange?: (height: number) => void;
  gameConsole?: React.ReactNode;
}
```

What moves OUT to the app container: `getLocalPlayerSetup` read, the three `updateStudioSetup*` calls + contract
normalization (AppHeader.tsx:79-97), the difficulty double-write. What STAYS in the component: the
`CUSTOM_SETUP_VALUE` sentinel and warning chrome (presentation over `savedConfigModified` + `setup.savedConfig` —
AppHeader.tsx:149-174). Effects: `Civ7StudioSetupConfig` leaves the public API entirely (the E1 question for this
site evaporates); `AppHeader.stories.tsx` fixture becomes a plain view-model (no `@/features/civ7Setup/setupConfig`
import — the story chase resolves structurally); `test/AppHeader.test.tsx` pins move to the new args. NOT a verbatim
move — fidelity is proven by renderHash equality on both stories plus the existing markup pins, not by `changed:[]`.

### (b) Deferred — the 45-component v1

Structure: `AppHeader.tsx` relocates to `app:src/app/AppHeader.tsx` (its current home dir dissolves), importing
`Button/Tooltip×3/AppBrand/OptionSelect/ViewControls` + `ThemePreference` from `@civ7/studio-ui`; `setupConfig`
imports unchanged. Its story and `AppHeader.test.tsx` stay app-side. **Sync-surface implication (must be priced):**
the package Storybook indexes 45 stories; the first re-sync's anchor diff marks AppHeader `removed` and its card
lands in `upload.deletePaths` — the design project LOSES the AppHeader card until the follow-up, or the upload must
deviate from the "deletes verbatim from deletePaths" doctrine (converter §2). Keeping a one-story app Storybook
alive just for AppHeader would fork the oracle. Recommendation: **choose (a)** — the redesign is small (four intent
callbacks + one view-model), and (b)'s surface shrink is a real regression for the design agent.

---

## 6. Migration order — Graphite stack (D11)

Constraint honored: every branch leaves `bun run ci` (nx run-many build,check,lint,test,verify) green; the full
46-card oracle runs once, at the repoint branch (Storybook builds are not in CI today — repo-conventions §4.3).
Two Storybooks exist transiently (app glob stops matching moved stories automatically); the oracle is only
consulted at B6. Composites/panels touch their import lines twice (repoint in Bn, become package-internal in Bn+1)
— accepted as mechanical, import-specifier-only churn.

| # | Branch | Contents | Green proof at this level |
|---|---|---|---|
| **B1** | `studio-ui-scaffold` | `packages/studio-ui` skeleton: package.json (deps pinned: cva/clsx/tailwind-merge exact — LEDGER §3.9; tw-animate-css promoted to dependency), tsconfig, tsup.config, empty `src/index.ts`, `src/styles/` placeholders, root-vitest `studio-ui` project, package `.storybook` shell | package `build`/`check`/`lint` green; app untouched; CI five pass |
| **B2** | `studio-ui-foundation-primitives` | Move: `lib/utils.ts` (cn), `lib/useResolvedTheme.ts`, `lib/layout.ts`, `types/index.ts`, styles source (tokens out of app `index.css`; `dark-default.css` authored; app index.css imports package CSS), 15 primitives + stories + sub-barrel (toast re-export dropped), `FieldRow` + story (to `components/forms/`), sonner theme-hook unification. Delete: `app:src/ui/index.css` (dead), plain `cn.ts`, `--animate-pulse-subtle` (dead). App rewire: §4.1 (19), §4.2, §4.3, plain-cn composites → package cn, all surface files importing `components/ui`/`../types`/`LAYOUT` repointed to the package. Tests: `sonnerTheme.test` moved + repointed | CI five; `studio-ui` vitest green (sonnerTheme + validator-adjacent none yet); app renders (dev smoke); both Storybooks build; visual spot-check of app (tokens still applied) |
| **B3** | `studio-ui-composites-layout` | Move: 10 composite files + PresetDialogs + ErrorBanner + LeftDock/RightDock + 13+2 stories; `StageView` re-home (viewStore back-import); `WaterStatsSummary/LayerRef` re-home; AppFooter `seedMin`/`seedMax` inject-prop (+ E2 option props if approved); story fixtures chase (AppFooter/WaterStats). App rewire: StudioShell repoints, CanvasStage EmptyState normalize, viewStore edit. Tests moved: AppFooter, GameConsole? (no — GameConsole is B4), waterStatsSection | CI five; moved tests green in `studio-ui` project; app typecheck proves no orphan import |
| **B4** | `studio-ui-forms` | Move: the five-module unit + rjsfWidgets/rjsfTemplates/SchemaConfigForm + 11 stories + `typeboxRjsfValidator.test.ts` (co-located) + `mockWidgetProps` fixture; `useConfigCollapse` exported publicly. App rewire: RecipePanel (still app-side) repoints `SchemaConfigForm`/`useConfigCollapse` to the barrel; configOverrides dir shrinks to `configBuilders.ts`. Tests moved: useConfigCollapse, rjsfFieldTemplateErrors | CI five; relocated validator + template tests green; RecipePanel compiles against the package forms API |
| **B5** | `studio-ui-panels` | Move: ExplorePanel/GameConsole/RecipePanel + `statusLabels.ts` split + recipe-dag directory split (PipelineStage + layout + domainPresentation + artifactPresentation + `recipeDagFixture`) + 4 stories; `RecipeDagLoadStatus` re-home; union collapse (clientState/status aliases); PipelineStage's EmptyState import normalized internally. App rewire: §4.6 status halves, useRecipeDagQuery back-import, StudioShell `runInGameRequiresProcessRestart` repoint. Tests moved: GameConsole, PipelineStage, recipeDagLayout, domainPresentation | CI five; **strict tsc of the package (no TS7056 tolerance) now covers the full 46-minus-AppHeader graph** — the orpc declaration-path death is observable here; layout determinism pinned by recipeDagLayout.test |
| **B6** | `studio-ui-appheader` (E4a) **[R]** | AppHeader prop-contract redesign + move + story rewrite + AppHeader.test move + StudioShell container wiring. (Under E4b: branch replaced by a relocation of AppHeader to `src/app/` + the §5b sync-surface consequence) | CI five; AppHeader.test pins green on new args; renderToStaticMarkup snapshots unchanged |
| **B7** | `studio-ui-sync-repoint` | Move `.design-sync/` + `.ds-sync/` into the package; config.json rewrite (§3.7); DELETE build-inputs.sh, tsconfig.dts.json, ds-entry.tsx, synthEntry fork (+libOverrides); retire app `.storybook/` + `src/storybook/{storeReset,queryStub,EXCLUSIONS.md}`; app package.json dep prune; runbook/README updates | CI five; package build → sb-reference rebuild → **full local resync**: `resync.mjs` verdict with renderHash parity on all 46 (expected `changed:[46]` from the one-time re-key, converter §4), portal-dialog four via the manual path (frame §3); conventions-header validation |
| **B8+** | `studio-ui-cleanup-wave` (E3) **[R]** | The oracle-gated batch: TagSelectWidget cn flip, ErrorBanner text-xs→text-data, AppBrand propification, positioning-as-chrome lifts, ExplorePanel native-select→Radix, `${id}__error` id-builder extraction (`forms/fieldIds.ts`), React 19 forwardRef sweep, memoization wave, index-key re-keys | per-change oracle re-verify against the fresh B7 anchor |

Alternatives considered: **big-bang single move** (one branch, all 46) — one re-key, no double-touch, but an
unreviewable diff and no bisectable green states; **per-group stacks with app-side re-export shims** — violates
"one owner / no temporary re-exports" (FRAME §6). The 7-branch stack keeps every intermediate state shim-free
because each group repoints DIRECTLY to the package the moment its dependency moves.

Upload to `531d158d` remains gated on Matei's go-ahead (FRAME §6) — B7's oracle run is local-only.

---

## 7. ZERO_DRIFT verification hooks per branch

| Hook | Branches | What it proves |
|---|---|---|
| `bun run ci` (nx five) | all | build graph + strict types + biome + vitest, workspace-wide |
| Package strict `tsc --noEmit` (its `check`) | B1+ | no TS7056 tolerance; declaration graph never reaches `lib/orpc.ts` (fully proven at B5) |
| Verbatim-move audit: `git diff -M --find-renames` per moved file; only import-specifier lines may differ | B2–B5 | "verbatim" is checked, not asserted |
| Relocated tests: sonnerTheme (theme resolution + resubscribe), typeboxRjsfValidator, useConfigCollapse, rjsfFieldTemplateErrors, AppFooter/GameConsole/WaterStats markup pins, PipelineStage + recipeDagLayout (buildRecipeDagLayout determinism — the oracle's subject, LEDGER §7), domainPresentation | with their branch | behavior locks for every non-verbatim edit (hook unification, ip props, splits) |
| `build-storybook` both trees (manual/verify target) | B2–B6 | no story orphaned mid-stack; story compile = barrel-gap detector (stories import the package by name) |
| Full local resync: package build → sb-reference → `resync.mjs --remote` | B7 | renderHash parity for 46; styleSha/bundle flip expected; portal-4 manual verification; `[REFERENCE_STALE?]` guard |
| Light-mode canary (`.light` render of sb-reference or the dark-default.css `.light` toggle check) | B7 | the dark-only-gate blindspot (FRAME §2) — coordinate with Designer-sync's canary design |
| App dep prune verified by grep-per-removed-dep | B7 | no phantom runtime dep left behind (bun isolated linker would also fail loudly — repo-conventions §4.4) |

---

## 8. Conflicts / risks (cross-axis, for the coherence pass)

1. **E1 × Nx boundary taxonomy (hard conflict, needs Matei).** `statusLabels.ts`, GameConsole/RecipePanel props,
   PipelineStage/layout, and `recipeDagFixture` keep type-only imports of `@civ7/studio-server[/contract]`
   under the recommended E1. But `kind:foundation` may only depend on `kind:foundation` and studio-server is
   `kind:control` (eslint.boundaries.config.mjs:33, studio-server package.json nx.tags) — and
   `@nx/enforce-module-boundaries` counts type-only imports. Even FULL re-homing can't avoid it cleanly: the phase
   unions (`RunInGamePhase` etc.) are server-owned vocabularies (reverse-drift risk, LEDGER E1). Options:
   (i) taxonomy revision adding `kind:ui` with `ui → {foundation}` + a deliberate documented exception for the
   types-only `control` edge (formal protocol per eslint.boundaries.config.mjs:10-14); (ii) tag `kind:foundation` +
   E1=re-home everything (drift risk); (iii) per-file lint suppressions (worst). Surface with E1 at the checkpoint.
2. **E2 changes public APIs against the oracle.** Options-via-props (recommended direction) makes AppFooter (and
   AppHeader's option sourcing) non-verbatim — same class as the already-priced ip/E4a changes, but it widens the
   "not proven by changed:[]" set. If Matei wants maximum first-sync fidelity, E2=ship-in-package for v1 and lift in
   the E3 wave.
3. **CSS compile scope (Designer-build seam).** My tree exposes both compiled dist CSS and the source entry
   (§3.6). If the app imports COMPILED package CSS while also running its own `@import "tailwindcss"`, tokens and
   preflight exist in two stylesheets (duplication/order hazards); if the app imports the SOURCE entry and compiles
   with `@source` reach into `packages/studio-ui/src`, there is one compile but a new v4 pattern with no repo
   precedent (repo-conventions §3.3). The package's own dist compile must scan story files + sonner.tsx
   (adjudication 9). Structure supports either; the build designer must pick and the app's `src/index.css` edit in
   B2 follows their choice.
4. **Two-Storybook transient (B2–B6).** The oracle is only authoritative at B7; mid-stack visual regressions would
   surface late. Mitigation: per-branch build-storybook smoke + the moved markup-pin tests; accept, or collapse
   B2–B5 into fewer branches if Matei prefers a shorter exposure window.
5. **`storyImports.shim` emptying depends on D4** (stories import the package name). If the team instead recreates
   a `@/` alias inside the package, the shim patterns must be rewritten to package-internal dirs and the
   `components/ui` substring coincidence re-verified — do not carry the old three patterns blindly (converter §4).
6. **StageView/RecipeDagLoadStatus back-imports make the app import types from the package it also renders** —
   correct direction (app → package), but `storeReset.ts` imports viewStore while it still exists (B2–B6); its
   retirement lands in B7 with the app preview. No cycle at any point (package never imports app — verified by
   construction; falsifier check below).
7. **LEDGER count correction (minor):** the client-demand "17 ui/types importers" is 19 by direct grep (the two
   `ui/constants` files were bucketed); the rewire inventory above is the verified list. No design consequence.

## 9. Falsifier self-check

- **Two owners after the tree?** Walked all 25 coherence §3 modules → each maps to exactly one home in §3/§3.1/§3.2
  (splits produce disjoint symbol sets — §3.3, §4.6; aliases are type re-exports of package-owned types, not copies).
- **Forms unit split?** No — SchemaForm, pathUtils, schemaPresentation, typeboxRjsfValidator(+test), useConfigCollapse,
  widgets, templates, FieldRow all in `src/components/forms/`, one branch (B4).
- **Story title changes?** None — all 46 titles verbatim; FieldRow keeps `primitives/FieldRow` from its forms-dir home.
- **A branch that can't pass CI alone?** Each of B1–B7 compiles by construction (dependencies always move before or
  with their dependents: lib/types/primitives → composites → forms → panels → AppHeader; app repoints in the same
  branch as each move). The only non-CI gate (46-card oracle) is deliberately placed at B7 where the surface is whole.
