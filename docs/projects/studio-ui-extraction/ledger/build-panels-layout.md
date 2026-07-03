# Classification ledger — ds-group `panels-layout`

Slice scope: the 4 `panels/*` + 2 `layout/*` components from `.design-sync/config.json` componentSrcMap. Checkout read: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` @ `c4ebaf1e1` (main tip). Paths relative to `apps/mapgen-studio/` unless noted. Every component source and its co-located story was read IN FULL; every one-hop boundary target's import head was verified directly (not trusted from ground reports). Directive applied: boundary crossings and dependency-direction smells are DEFECTS even where tolerated; cleanups that change rendered output are flagged in risks (46-story oracle gates visual fidelity).

Tier rubric: **clean** = moves as-is (react / external / intra-surface / tokens); **moderate** = 1–4 crossings each with a clear remedy; **app-shaped** = entangled with app domain logic, needs a designed split.

---

## 1. ExplorePanel — `src/ui/components/ExplorePanel.tsx` — **moderate**

**Tier evidence:** Fully controlled, zero store/orpc/query imports (whole file read, 742 lines). Three boundary crossings, each with a clear remedy: (1) value `LAYOUT` from `../constants` (ExplorePanel.tsx:25, used at :373 for `EXPLORE_PANEL_WIDTH: 260`, ui/constants/layout.ts:21); (2) type-only 7 option types from `../types` (ExplorePanel.tsx:26–34; ui/types/index.ts has ZERO imports — verified `grep -c "^import"` = 0); (3) type-only `RiverLakeFloodplainInspectorSummary`/`RiverLakeInspectorLayerRef` from `features/viz/riverLakeInspector` (ExplorePanel.tsx:21–24), a 641-line viz module that itself type-imports `@swooper/mapgen-viz` (riverLakeInspector.ts:1–8). Intra-surface: `components/ui` Tooltip×3 (:20), `DisclosureHeader` (:35), `WaterStatsSection` (:36) — all manifest components.

**Boundary crossings:**
| specifier | kind | drag (one hop) | remedy |
|---|---|---|---|
| `../constants` (LAYOUT) | value | barrel `ui/constants/index.ts` also pulls `options.ts` (value `MAP_SIZE_OPTIONS`, index.ts:34) + `defaults.ts` (type-only `../types`); no runtime app-transport drag, but the shared layer is co-owned by 15+ app files (coupling-recon §3.7) | move-with (split constants: LAYOUT geometry travels) or inject-prop (width) |
| `../types` (7 option types) | type | zero-import pure-type module; co-owned by app | move-with / re-home-type into the package types surface |
| `../../features/viz/riverLakeInspector` (2 types) | type | 641-line viz-domain file; type-only over `@swooper/mapgen-viz` — no runtime drag but `.d.ts` would reference `@swooper/mapgen-viz` | re-home-type (the two summary/layer-ref shapes) |

**External deps:** react (v), lucide-react (10 icons: Activity, Bug, CircleDot, Compass, Flame, GitBranch, Hexagon, Layers, Maximize, SquareStack), @radix-ui/react-tooltip (via `components/ui` barrel).

**Cleanups:**
1. **Child effect writes parent-controlled state** — auto-selects the only data type by calling `onSelectedDataTypeChange` inside `useEffect` (ExplorePanel.tsx:216–220). A controlled library component silently correcting its parent's state is a hidden feedback loop; Vercel guidance: derive in the parent or handle in events. (Behavior-relevant — see risks.)
2. **Unmemoized/unhoisted derived work**: `groupedDataTypes` rebuilt via IIFE every render (:335–351); `getRenderModeIcon`/`getSpaceIcon` close over nothing yet are recreated per render (:300–333) — hoist to module scope; memoize the grouping.
3. **Multi-line template-literal classNames** in `stageBadge`/`stepBadge` (:291–298) embed literal newlines into DOM `className`. The file deliberately avoids `cn()` because plain-twMerge clobbers `text-data`/`text-label` sizing (comment :514–518 names the hazard) — after the package unifies on the extended cn (`src/lib/utils.ts:12–18`) these joins should normalize through it.
4. **Raw native `<select>`/`<input type=range>`** (:665–675, :686–696, :707–733) depend on unlayered global element resets in `src/index.css:215–230` and `accent-primary`; divergent from the `OptionSelect`/Radix-Select idiom used one directory over. Keeping them means the global CSS MUST ship with the package; converting changes rendered output (risk-flagged).
5. **~40-prop flat API** (`ExplorePanelProps`, :40–131) — prop proliferation a composition reviewer would flag; restructuring breaks the story oracle, record-only.

**Story notes:** `ExplorePanel.stories.tsx` — imports component + `ExplorePanelProps` via `@/ui/components/ExplorePanel` (:3); one story (`Inspector`), hoisted `satisfies ExplorePanelProps` fixture with `riverLakeInspectorSummary: null` (:79) so NO riverLake types enter the story graph; local `Dock` scaffold (bounded 600px flex host, "not a DS export", :84–90); tooltips require the global decorator's `TooltipProvider` (silent blank otherwise); ds-card override `column`.

**Risks:** cn-normalization of template-literal classes could change effective Tailwind merge order → gate on oracle; removing the auto-select effect is a behavior change; converting native selects to Radix changes rendered output; if the global select-reset/`custom-scrollbar` CSS doesn't travel, the story renders off-brand.

---

## 2. GameConsole — `src/ui/components/GameConsole.tsx` — **moderate**

**Tier evidence:** Fully prop-driven (whole file read, 569 lines); zero store/orpc/query imports; local state only (`statusOpen`, :125). Four crossings, all with mechanical remedies — the value imports are pure phase→label formatters, not state or domain logic, so no designed split is needed (this is the heaviest moderate, at the tier boundary): GameConsole.tsx:1 (server types), :15 (`formatMapConfigSaveDeployPhaseLabel`), :16 (`RunInGameCurrentRelation`), :17–20 (`formatRunInGamePhaseLabel`, `runInGamePrimaryActionLabel`).

**Boundary crossings:**
| specifier | kind | drag (one hop) | remedy |
|---|---|---|---|
| `@civ7/studio-server` (`MapConfigSaveDeployStatus`, `RunInGameOperationStatus`) | type | leaks into PUBLIC props (`GameConsoleProps` :82, :90) → published `.d.ts` needs the server package | keep-as-dep (types-only peer) or re-home-type |
| `../../features/mapConfigSave/status` (`formatMapConfigSaveDeployPhaseLabel`) | value | 137-line module; **VALUE-imports `MAP_CONFIG_SAVE_DEPLOY_PHASES` from `@civ7/studio-server/contract`** (status.ts:7 — verified) = runtime contract dependency one hop away | move-with (pure formatter; makes contract a runtime dep) or inject-prop (label strings) |
| `../../features/runInGame/status` (2 formatters) | value | 125 lines; **VALUE-imports `RUN_IN_GAME_PHASES` from contract** (status.ts:6 — verified); same runtime drag class | same decision as above (one decision covers both modules) |
| `../../features/runInGame/clientState` (`RunInGameCurrentRelation`) | type | 233-line app domain-state module (value-imports setupConfig + configMigrations, clientState.ts:1–9); the imported type is just `"current" \| "stale" \| "unknown"` (clientState.ts:41 — verified) | re-home-type (trivial 3-value union) |

**External deps:** react (v), lucide-react (9 icons), @radix-ui/react-tooltip (via barrel Button/Tooltip), @civ7/studio-server (types direct; runtime values one hop via the two status modules).

**Cleanups:**
1. The two runtime contract drags above are the directive's core defect class: a "UI package" acquiring a runtime dependency on the server-contract package through two label formatters.
2. **Triple hover-text redundancy**: the chip carries native `title={chipTitle}` + `aria-label={chipTitle}` + a Radix `TooltipContent` with the same string (:322–323, :351) — the native browser tooltip renders ALONGSIDE the Radix tooltip on hover; same pattern on the autoplay/explore/Play buttons (:371, :399, :419). Pick one surface (Radix) + keep aria-label.
3. **Hand-rolled dismissable popup**: the status hang-off wires its own document-level `pointerdown`/`keydown` listeners (:130–150) and has no focus trap/restore, while `@radix-ui/react-popover` is already a project dependency (popover.tsx exists in the surface). Rebuilding on Popover is the library-quality fix but changes portal/DOM structure (risk-flagged). The story never opens it (`defaultStatusOpen` unused in stories), so the hang-off is OUTSIDE the screenshot oracle — a change here is invisible to the fidelity gate, cutting both ways.
4. Props leak server types (:82, :90) — see crossings row 1.

**Story notes:** `GameConsole.stories.tsx` — imports via `@/ui/components/GameConsole` (:3); two stories (`LiveReady`, `NoLiveGame`) sharing a hoisted `base` typed `satisfies Omit<GameConsoleProps, "liveRuntime">` (:23–35); local `Bar` scaffold (:39–48); requires global `TooltipProvider`; the status hang-off popup is never opened in a story; ds-card override `column`. No server-type imports in the story file itself (fixture uses inline `GameConsoleLiveRuntime`).

**Risks:** replacing the hand-rolled hang-off with Radix Popover changes DOM/portal structure (not oracle-covered, but app behavior); inject-prop remedy for formatters changes the public props → story args edits; move-with remedy makes `@civ7/studio-server` a runtime dep of the published package (dependency-direction decision, not a code risk).

---

## 3. RecipePanel — `src/ui/components/RecipePanel.tsx` — **moderate**

**Tier evidence:** Fully controlled (whole file read, 556 lines); zero store/orpc/query imports. Crossings: RecipePanel.tsx:9 (server type), :33 (`formatMapConfigSaveDeployPhaseLabel` value), :34 (`LAYOUT`), :35 (`../types` types). Cross-home imports `SchemaConfigForm` (:31) + `useConfigCollapse` (:32) are INTRA-SURFACE — SchemaConfigForm is manifest component #46 and useConfigCollapse is support in the configOverrides home (imports react + rjsfTemplates types only — verified head) — but they hard-couple RecipePanel to the forms group: it cannot ship without it.

**Boundary crossings:**
| specifier | kind | drag (one hop) | remedy |
|---|---|---|---|
| `@civ7/studio-server` (`MapConfigSaveDeployStatus`) | type | public-prop leak (`RecipePanelProps` :75) → `.d.ts` references the server package | keep-as-dep (types-only) or re-home-type |
| `../../features/mapConfigSave/status` | value | same runtime contract drag as GameConsole (status.ts:7) | move-with or inject-prop — SAME decision as GameConsole |
| `../constants` (`LAYOUT`) | value | `PANEL_WIDTH: 340` (ui/constants/layout.ts:19) via inline style (:228); same barrel over-drag as ExplorePanel | move-with (geometry split) or inject-prop |
| `../types` (`PipelineConfig`, `RecipeSettings`, `SelectOption`) | type | zero-import pure types, app-co-owned | move-with / re-home-type |

**External deps:** react (v), lucide-react (7 icons), @radix-ui react-tooltip/react-dialog/react-dropdown-menu/react-switch (via barrel: Button, Dialog×7, DropdownMenu×5, Switch, Tooltip×3), @civ7/studio-server (type direct + runtime one hop), and transitively via SchemaConfigForm: @rjsf/core (deep subpath), @rjsf/utils, typebox.

**Cleanups:**
1. **Identity-transform `.map` creates a new options array every render** (:267–270, :285–288): `recipeOptions.map((opt) => ({ value: opt.value, label: opt.label }))` where `recipeOptions` is already `ReadonlyArray<SelectOption>` — structurally identical to OptionSelect's `ReadonlyArray<{value,label}>` (OptionSelect.tsx:9, verified). Dead transform + unstable prop identity; pass the array directly.
2. **Inline passthrough lambda** `onChange={(next) => onConfigChange(next)}` (:455) — pass `onConfigChange` directly.
3. Runtime contract drag via the status formatter (:33) — same defect class as GameConsole; one shared remedy.
4. Public-prop server-type leak (:75).
5. `LAYOUT.PANEL_WIDTH` inline width (:228) — geometry-authority crossing (deliberate policy per ui/constants/layout.ts:4–6, but a crossing nonetheless).

**Story notes:** `RecipePanel.stories.tsx` — imports via `@/ui/components/RecipePanel` + **types `PipelineConfig`/`SelectOption` from `@/ui/types`** (:4 — the story's own crossing follows wherever those types land); two stories (`RecipeAndConfig`, `RecipeSelection`) over a hoisted `base` (`satisfies Omit<RecipePanelProps, "recipeCollapsed" | "configCollapsed">`); hand-written RJSF schema fixture (:35–59) that drifts against real recipe schemas (known gotcha, .design-sync NOTES.md:45); rendering the form RUNTIME-drags the whole configOverrides forms home; local `Dock` scaffold; requires `TooltipProvider`; ds-card override `column`.

**Risks:** ships-with-forms coupling — RecipePanel cannot be extracted ahead of the forms group; the options-passthrough and lambda cleanups are render-identical (safe); the reset Dialog + save DropdownMenu portal surfaces are only partially oracle-covered (dropdown/dialog closed in stories).

---

## 4. PipelineStage — `src/features/recipeDag/PipelineStage.tsx` — **app-shaped**

**Tier evidence:** Whole file read (671 lines; 6 private subcomponents). The component's CORE DATA MODEL is the server contract: `dag: RecipeDagResult | null` (PipelineStage.tsx:1, :47) flows into ~980 lines of value-imported sibling domain modules — `./layout` (619 lines, itself typed against `@civ7/studio-server/contract`, layout.ts:1 — verified), `./domainPresentation` (280 lines, lucide-only — verified), `./artifactPresentation` (81 lines, sibling-only — verified). `buildRecipeDagLayout` executes at render (:78). The home directory needs a DESIGNED split: `useRecipeDagQuery.ts` VALUE-imports `@tanstack/react-query` + `../../lib/orpc` (useRecipeDagQuery.ts:2–4 — verified) and `prunePipelineExpansion.ts` are app-side; PipelineStage type-imports `RecipeDagLoadStatus` from the query hook (:18 ← useRecipeDagQuery.ts:20), tying the view's status vocabulary to the data layer — this exact edge drags `lib/orpc.ts` (pre-existing TS7056) into the declaration graph and is why d.ts emit is best-effort today (.design-sync NOTES.md:51). "App-shaped" per the FRAME's own designation; the split is tractable (siblings are pure) but must be designed: contract-type dependency decision + directory split + type re-homing.

**Boundary crossings:**
| specifier | kind | drag (one hop) | remedy |
|---|---|---|---|
| `@civ7/studio-server/contract` (`RecipeDagResult`) | type | the component AND `./layout` (619 lines) are structurally typed against it; public prop → `.d.ts` needs the contract | keep-as-dep (types-only peer) or re-home the whole DAG shape (heavy) — a designed decision |
| `./useRecipeDagQuery` (`RecipeDagLoadStatus`) | type | module VALUE-imports tanstack + `lib/orpc` (useRecipeDagQuery.ts:2–4); type-only so runtime-erased, but the TS module graph references transport until re-homed | re-home-type (4-value union `"idle"\|"loading"\|"ready"\|"error"`, useRecipeDagQuery.ts:20) — view owns the status vocabulary |
| `../../ui/hooks/useResolvedTheme` | value | 56 lines, react-only (`useSyncExternalStore`), convention-agnostic DOM reader — verified head; package-safe | move-with (it IS the package's theme-read API per theme-token report §5.4) |
| `../../ui/components/EmptyState` | value | intra-surface manifest component, but imported by DIRECT FILE PATH bypassing the barrel (:4) | keep-as-dep (intra-package); normalize import shape |
| siblings `./layout`, `./domainPresentation`, `./artifactPresentation` | value | ~980 lines, portable (lucide + contract types only) | move-with (they are the component's real composition) |

**External deps:** react (v), lucide-react (AlertTriangle, ChevronDown, Loader2, Workflow direct + ~11 icons incl. `createLucideIcon` via domainPresentation), @civ7/studio-server/contract (types), and — until re-homed — a type-graph reference to @tanstack/react-query + the orpc client.

**Cleanups:**
1. **Re-home `RecipeDagLoadStatus`** (:18) — the single highest-leverage cut: removes the view→data-layer edge, restores strict tsc for declaration emit (NOTES.md:51's TS7056 path dies).
2. **Unmemoized list-rendered subcomponents**: `ArtifactEdgeLabel` (:565), stage `<article>` nodes (:380–506), edge `<g>` paths (:305–340) — every selection/hover state change re-renders the ENTIRE DAG (SVG + nodes). `React.memo` on the extracted subcomponents + stable callbacks (`getStageAccent`, `handleSelectStage` are per-render closures, :127–136) is the Vercel-guidelines fix; render output identical (safe under oracle) but touches many closures.
3. **Index-suffixed key** on diagnostics list: `key={`${diagnostic.kind}-${diagnostic.artifact.id}-${index}`}` (:517) — index in keys on a sliced list; kind+artifact should be unique or the data model should say why not.
4. **Direct-file EmptyState import** (:4) bypasses `ui/components/index.ts` which exports it (barrel verified) — inconsistent import shape vs the composites.
5. `useResolvedTheme` consumption (:5, :76) is CORRECT — this is the hook the package should standardize on; the defect twin (sonner's private duplicate `useThemeFromClass`) lives in the primitives group (theme-token report §3), unify there.

**Story notes:** `PipelineStage.stories.tsx` — imports via `@/features/recipeDag/PipelineStage` (:3) + fixture `recipeDagFixture` from `@/storybook/recipeDagFixture` (:4), which is TYPED AGAINST `@civ7/studio-server/contract` (recipeDagFixture.ts:1, per storybook-oracle report) — `buildRecipeDagLayout` actually RUNS on it, so the fixture must remain a valid `RecipeDagResult`; one story (`PipelineGraph`), `satisfies PipelineStageProps` with `expandedStageIds: new Set(["relief"])`; local `Stage` scaffold (relative 1080×600 host — component is `absolute inset-0`); ds-card override `single 1080x620`; NO TooltipProvider needed (native `title` attrs only, no Radix Tooltip — verified in source).

**Risks:** the split must keep `buildRecipeDagLayout` output byte-identical (deterministic SVG layout is the oracle's subject); memoization touches many closures — verify no stale-closure regressions on selection; the contract-type decision (peer dep vs re-home) determines whether the package `.d.ts` references `@civ7/studio-server` — re-homing a DAG shape that the server also owns creates drift risk in the other direction.

---

## 5. LeftDock — `src/app/LeftDock.tsx` — **clean**

**Tier evidence (what was checked):** whole file read (35 lines). Sole import: `import type { ReactNode } from "react"` (LeftDock.tsx:1) — type-only, erased. No cn, no constants, no types, no feature imports, no assets, no env. Styling = static Tailwind classes over tokens (`absolute left-4 z-10 … pointer-events-none`, :28) + numeric `top`/`bottom` inline style from props. Story read in full: imports only `@storybook/react-vite`, react types, and the component via `@/app/LeftDock` (stories :1–3). Moves as-is.

**Boundary crossings:** none.

**External deps:** react (type-only).

**Cleanups:**
1. **Hardcoded domain aria-label** `"Recipe and configuration"` (:27) on an otherwise-generic positioning shell — library shape wants `aria-label` as a prop (defaulted, so no visual/behavior change).
2. **Near-duplicate twin of RightDock** — the two files differ only in `left-4` vs `right-4`, the aria-label, and doc comments (:24–33 vs RightDock.tsx:24–33). The library-quality shape is one `Dock` with a `side` prop; BUT the 46-name export surface + story titles pin both names, so unification must keep `LeftDock`/`RightDock` as thin named exports.
3. **No barrel**: exported only via `.design-sync/ds-entry.tsx:20` explicit re-export — the package barrel must add it.

**Story notes:** `LeftDock.stories.tsx` — CSF3 cast trick `args: {} as unknown as LeftDockProps` (:15, required-props escape); one render-owned story (`WithPanel`) with preview-only `Stage` (relative bounded host — component is absolutely positioned) + `SamplePanel` (pointer-events-auto stand-in) scaffolds (:23–47); no fixtures, no providers, no portal/open-state concerns.

**Risks:** none for a verbatim move. Unifying into one `Dock` component would change story import targets/titles → do it (if at all) behind preserved named exports.

---

## 6. RightDock — `src/app/RightDock.tsx` — **clean**

**Tier evidence (what was checked):** whole file read (35 lines). Sole import: `import type { ReactNode } from "react"` (RightDock.tsx:1). No cn, no constants, no feature imports, no assets, no env; static token classes (`absolute right-4 z-10 … pointer-events-none`, :28). Story read in full — imports only SB + react types + `@/app/RightDock` (stories :1–3). Moves as-is.

**Boundary crossings:** none.

**External deps:** react (type-only).

**Cleanups:** mirror of LeftDock: (1) hardcoded aria-label `"Explore and inspect"` (:27) → prop with default; (2) near-duplicate twin (see LeftDock #2); (3) no barrel — only `.design-sync/ds-entry.tsx:21`.

**Story notes:** `RightDock.stories.tsx` — identical pattern to LeftDock: `args: {} as unknown as RightDockProps` cast (:15), render-owned scene with `Stage`/`SamplePanel` scaffolds (:23–47), no fixtures/providers/portals.

**Risks:** none for a verbatim move; same unification caveat as LeftDock.

---

## Group-level findings (panels-layout)

1. **One shared remedy decision covers the group's only runtime contract drags**: GameConsole + RecipePanel both reach `@civ7/studio-server/contract` at RUNTIME through pure phase→label formatters (`features/mapConfigSave/status.ts:7`, `features/runInGame/status.ts:6` — both verified). Decide once: move-with (contract becomes a package runtime dep) vs inject-prop (labels injected; props change → story edits).
2. **`features/recipeDag/` requires a designed directory split**: PipelineStage + `layout.ts` + `domainPresentation.ts` + `artifactPresentation.ts` (~1650 lines, portable) move; `useRecipeDagQuery.ts` (tanstack + orpc) + `prunePipelineExpansion.ts` stay app-side; `RecipeDagLoadStatus` re-homes to the view. This split also restores strict d.ts emit (kills the TS7056/orpc declaration-graph path, .design-sync NOTES.md:51).
3. **Shared-kernel crossing**: ExplorePanel + RecipePanel value-import `LAYOUT` from `ui/constants` (barrel over-drags `options.ts`/`defaults.ts`); `ui/types` is zero-import but co-owned by 15+ app files — the constants/types split decision is group-blocking (coupling-recon §3.7).
4. **The panels never use `cn()`** — all class assembly is template-literal joins, deliberately shaped around the plain-cn `text-data` clobber hazard (ExplorePanel.tsx:514–518 documents it). Package must ship ONE extended cn (`src/lib/utils.ts:12–18`); the panels can then normalize (oracle-gated).
5. **Barrel state**: ExplorePanel/GameConsole/RecipePanel ARE in `ui/components/index.ts` (verified, with prop types); PipelineStage, LeftDock, RightDock have NO barrel — surface exists only via `.design-sync/ds-entry.tsx:20–21,49`. The package barrel replaces ds-entry (which the extraction retires entirely — its reason-for-being is the unpublished-app shape).
6. **Global-CSS dependency**: all four panels use `custom-scrollbar` (ExplorePanel.tsx:374,396,436,506; RecipePanel scroll region; PipelineStage.tsx:182,475) and `backdrop-blur-sm`; ExplorePanel additionally leans on the native `select`/`input[type=number]` resets (src/index.css:215–230). The unlayered globals in `src/index.css` must travel with the token CSS or panels render off-brand.
7. **Fixture drift hazards ride with two stories**: RecipePanel's hand-written RJSF schema (stories :35–59; NOTES.md:45) and PipelineStage's `recipeDagFixture` (typed against the live contract; layout actually executes on it). Both are the oracle's inputs — schema/contract changes silently invalidate them.
8. **Hang-off/portal surfaces are under-oracle'd**: GameConsole's status popup is never opened in stories; RecipePanel's reset Dialog and save DropdownMenu render closed. Changes there pass the screenshot gate unseen — verify those states manually (portal-dialog capture limit is already on record).
