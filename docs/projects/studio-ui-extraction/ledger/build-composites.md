# Classification ledger — ds-group `composites` (13 components)

Checkout read: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` (branch `studio-ui-extraction` = main tip `c4ebaf1e1`). Paths relative to `apps/mapgen-studio/` unless absolute. Every component source file and every co-located story file was read IN FULL; support modules (`features/civ7Setup/seedPolicy.ts`, `features/civ7Setup/setupConfig.ts`, `stores/viewStore.ts`, `ui/constants/*`, `ui/utils/index.ts` + `cn.ts`, `ui/components/index.ts`, `features/viz/riverLakeInspector.ts` head, `ui/types` type sites) were read to verify one-hop drags.

**Intra-surface convention used for tiering:** the `src/ui/` shared layer (`ui/types` — 307 lines zero imports; `ui/constants` — self-contained except type-imports of `ui/types`; `ui/utils`; `components/ui` barrel) is treated as intra-surface shared UI kit that moves with the package. It is, however, co-owned by 15+ app files (coupling-recon §3.7) — the shared-kernel split is a group-level requirement, recorded in Shared findings, not per-row crossings. Crossings below = imports reaching `src/features/*`, `src/stores/*`, `src/lib/*`, or workspace packages.

---

## 1. AppBrand — `src/ui/components/AppBrand.tsx` — **clean**

- **Story:** `src/ui/components/AppBrand.stories.tsx`
- **Tier evidence (what was checked):** full read (72 lines). Imports are exactly `lucide-react` (ExternalLink, Github, User) + `react` (AppBrand.tsx:1-2). No cn, no `ui/types`, no constants, no feature imports, hardcoded content only. Exported from the `ui/components` barrel (index.ts:8).
- **Crossings:** none.
- **External deps:** react, lucide-react.
- **Cleanups:**
  - Hover-only disclosure is not keyboard-accessible: the info card mounts solely via `onMouseEnter`/`onMouseLeave` (AppBrand.tsx:17-18); the three links inside are unreachable without a pointer. Add focus-within handling (no static-render change — card is closed at rest).
  - Dead placeholder content hardcoded in a would-be library component: three `href="#"` links + "Author Name" (AppBrand.tsx:40-59), "© 2024 • MIT License" (stale year, AppBrand.tsx:66), version literal "v0.1" (AppBrand.tsx:25). Library-grade shape is props/config; changing text changes rendered output → oracle-gated.
  - Hand-rolled hover card duplicates what the in-surface Radix `Popover`/`Tooltip` primitives already provide (positioning, dismissal, a11y) — composition candidate; changes DOM → oracle-gated.
- **Story notes:** imports `@/ui/components/AppBrand`; no args; `Demo` wrapper (bg-background pad). Hover card never mounts in a static capture — resting pill only. No card override.
- **Risks:** brand-text/props cleanup and Popover recomposition both change rendered DOM/text → must be flagged against the 46-story oracle (hover card is uncaptured, so pill-only changes are what the screenshot sees).

## 2. AppFooter — `src/ui/components/AppFooter.tsx` — **moderate**

- **Story:** `src/ui/components/AppFooter.stories.tsx`
- **Tier evidence:** full read (339 lines). One boundary crossing: VALUE import of `CIV7_STUDIO_SEED_MIN/MAX` from `../../features/civ7Setup/seedPolicy` (AppFooter.tsx:11). Rest is intra-surface: `components/ui` barrel (:3-10), `../constants` LAYOUT/MAP_SIZE_OPTIONS/MAP_SIZE_SHORT/PLAYER_COUNT_OPTIONS (:12), `../types` types (:13, type-only), `./OptionSelect` (:14).
- **Crossings:**
  1. `../../features/civ7Setup/seedPolicy` (value) — drag: seedPolicy.ts is 57 lines, ZERO imports, fully self-contained (verified full read); runtime. Remedy: **inline** the two constants (0 / 0x7fff_ffff) or expose them as props; moving the whole seed-policy module would drag Civ7 domain policy (parse/format/random) into the UI package for two numbers.
- **External deps:** react, lucide-react (Bolt, Dices, Globe, History, Play); radix tooltip/select via `components/ui` primitives.
- **Cleanups:**
  - Inert HTML attributes: `min={CIV7_STUDIO_SEED_MIN}` / `max={CIV7_STUDIO_SEED_MAX}` on an `<Input type="text">` (AppFooter.tsx:266,272-273) — min/max only apply to number/range/date inputs; dead props (the real bound lives in `inputMode`/`pattern` + app-side parse).
  - Run-button `className` is a multiline template literal (AppFooter.tsx:327-330) that emits newline/indent whitespace into the class attribute; the file string-interpolates class fragments throughout (e.g. :161) instead of `cn` — inconsistent with sibling composites and unguarded against class conflicts.
  - `FOOTER_HEIGHT` re-exported from the component module (AppFooter.tsx:68, re-exported by the barrel at ui/components/index.ts:9) — a layout constant aliased through a component; belongs to the layout-constants module.
  - `ui/constants/options.ts:4-5` says options "can be overridden via props", but AppFooter hardcodes `MAP_SIZE_OPTIONS`/`PLAYER_COUNT_OPTIONS` imports with no prop override (AppFooter.tsx:228,247); the `.map()` fixups build new arrays every render (AppFooter.tsx:228-231,247-250) — hoist to module scope (they're static) and/or accept via props for library reuse.
  - Absolute app-chrome positioning baked in (`absolute bottom-4 left-4 right-4 z-20`, AppFooter.tsx:153) — placement-as-prop is the library-grade shape; changes DOM → oracle-gated.
- **Story notes:** imports `@/ui/components/AppFooter` + fixture types `RecipeSettings`/`WorldSettings` from `@/ui/types` (story import specifiers must follow wherever `ui/types` lands). Component self-provides `TooltipProvider` (AppFooter.tsx:151) so the story works bare; absolutely-positioned → relative `Dock` wrapper (760×80). Two stories (Ready, RunningDirty). Card override: `column`.
- **Risks:** removing min/max or normalizing className whitespace alters emitted attributes (screenshot-invisible but DOM-diff visible); positioning-as-prop changes layout → oracle-gated. `MAP_SIZE_*`/`PLAYER_COUNT_OPTIONS` values are Civ7 engine ids — moving `ui/constants` into a published package ships domain data (shared-kernel decision).

## 3. AppHeader — `src/ui/components/AppHeader.tsx` — **app-shaped**

- **Story:** `src/ui/components/AppHeader.stories.tsx`
- **Tier evidence:** full read (295 lines). VALUE-imports three domain functions from `../../features/civ7Setup/setupConfig` (AppHeader.tsx:4-9); those helpers call `normalizeStudioSetupConfig` → `normalizeRunInGameSetupConfig` from `@civ7/studio-server/contract` at runtime (setupConfig.ts:107-109,192,212; contract value-imports at setupConfig.ts:1-11) — a UI component with a two-hop RUNTIME path into the server-contract package. Its public prop `setupConfig: Civ7StudioSetupConfig` (AppHeader.tsx:28) is an alias of the server type `RunInGameSetupConfig` (setupConfig.ts:28), so the published `.d.ts` references `@civ7/studio-server`. Launch-precedence domain rules live in the component: the `CUSTOM_SETUP_VALUE` drift sentinel (AppHeader.tsx:21,149-174) and the difficulty handler that writes BOTH the game option and the player option (AppHeader.tsx:87-92). This is "value imports of domain functions/state" — extraction needs a designed prop-contract split (intent callbacks or injected update helpers), not a mechanical move.
- **Crossings:**
  1. `../../features/civ7Setup/setupConfig` (value: getLocalPlayerSetup, updateStudioSetupGameOption, updateStudioSetupPlayerOption) — drag: setupConfig.ts (305 lines) value-imports 5 bindings from `@civ7/studio-server/contract`; the two update helpers run contract normalization (setupConfig.ts:192,212); **runtime**. Remedy: **inject-prop** — parent owns config computation, header emits intent (onLeaderChange/onCivChange/onDifficultyChange/onSpeedChange) or receives the update functions as props.
  2. `../../features/civ7Setup/setupConfig` (type: Civ7StudioSetupConfig) — drag: alias of `RunInGameSetupConfig`, `.d.ts` references `@civ7/studio-server`; type-only. Remedy: **re-home-type** (structural UI-facing setup shape) or accept server package as types-only peer (defect per directive).
- **External deps:** react, lucide-react (Gamepad2, Settings); radix tooltip/select via primitives; TRANSITIVE RUNTIME: `@civ7/studio-server` (workspace).
- **Cleanups:**
  - Prop-type leak (crossing 2) — the group's instance of recon smell §3.4.
  - Non-null assertion `setupConfig.savedConfig!.id` (AppHeader.tsx:167) — the outer ternary guards it, but restructure to a narrowed local (Biome noNonNullAssertion class).
  - Unstable inline options array built per render when `savedConfigModified` (AppHeader.tsx:153-160) — memoize or hoist the sentinel-option prepend.
  - Domain semantics in UI (Custom sentinel + difficulty double-write) — should move to the caller with the inject-prop remedy.
  - String-interpolated class fragments (`${panelBg} ${panelBorder}`, :127,208) instead of `cn`, same class-conflict exposure as AppFooter.
  - ResizeObserver height-reporting effect (AppHeader.tsx:96-110) is correct (cleanup present, dep-complete); no change needed — checked because it's the one effect in the slice.
- **Story notes:** imports `@/ui/components/AppHeader` + `type Civ7StudioSetupConfig` from `@/features/civ7Setup/setupConfig` (AppHeader.stories.tsx:3) — the ONE story in this group typed directly against an app-feature module; the fixture completes the real contract shape (savedConfig ref + gameOptions + playerOptions). Relative `Bar` wrapper (920×72); two stories (Default, ModifiedConfig warning state). Tooltips ride the global preview TooltipProvider. Card override: `column`. Composes AppBrand + OptionSelect + ViewControls internally, and takes a `gameConsole` ReactNode slot (good composition — GameConsole is injected, not imported).
- **Risks:** the inject-prop redesign changes the public API — both stories' args and the `.design-sync` grade contract move; visual output should be identical but it is NOT a verbatim move, so the "changed:[] proves fidelity" shortcut (sync-surface §3.4) is unavailable for this component. If `ui/types` re-homes, `ThemePreference` (AppHeader.tsx:10) moves with it.

## 4. StageViewTabs — `src/ui/components/StageViewTabs.tsx` — **moderate**

- **Story:** `src/ui/components/StageViewTabs.stories.tsx`
- **Tier evidence:** full read (69 lines). One crossing: `import type { StageView } from "../../stores/viewStore"` (StageViewTabs.tsx:3). Everything else is react + lucide-react. List rendering is keyed (`key={id}`, :52-53).
- **Crossings:**
  1. `../../stores/viewStore` (type: StageView) — drag: viewStore.ts is a zustand store (`import { create } from "zustand"`, viewStore.ts:1); the imported type is the 2-literal union `"map" | "pipeline"` (viewStore.ts:32). Type-only, erased at runtime, but the package module graph/.d.ts names an app store module. Remedy: **re-home-type** — own the union in the component (or package types) and have viewStore import it back; trivial.
- **External deps:** react, lucide-react (Map, Workflow).
- **Cleanups:**
  - Barrel gap: NOT exported from `ui/components/index.ts` (verified full read of the barrel — absent); consumers and `.design-sync/ds-entry.tsx` deep-import it (sync-surface §2 entry note). Add to the package barrel.
  - Absolute self-positioning (`absolute left-1/2 z-20 -translate-x-1/2` + `top` prop, StageViewTabs.tsx:46-47) — placement baked in; fine as documented stage furniture, but placement-as-prop is the library shape; changes DOM → oracle-gated.
- **Story notes:** imports `@/ui/components/StageViewTabs`; relative `Stage` wrapper (360×64) with `top: 12`; two stories (MapActive, PipelineActive). No fixture type deps. Card override: `column`.
- **Risks:** none beyond the oracle-gated positioning cleanup; the type re-home is invisible to rendering.

## 5. ViewControls — `src/ui/components/ViewControls.tsx` — **clean**

- **Story:** `src/ui/components/ViewControls.stories.tsx`
- **Tier evidence (what was checked):** full read (111 lines). Imports: react, lucide-react (:11-12), `components/ui` Tooltip trio (:13), `../types` ThemePreference type (:14), `../utils` cn (:15) — all external or intra-surface (`ui/types`:14 is the 3-literal ThemePreference union at ui/types/index.ts:14; `ui/utils/cn.ts` verified plain twMerge(clsx)). No feature/store/lib imports.
- **Crossings:** none (ui/types + ui/utils are shared-kernel intra-surface; see Shared findings 1-3).
- **External deps:** react, lucide-react (Grid3x3, Monitor, Moon, Sun); clsx + tailwind-merge via cn; radix tooltip via primitives.
- **Cleanups:**
  - Divergent cn: uses the PLAIN `cn` (ui/utils/cn.ts:10-12, bare `twMerge(clsx())`) while all primitives use the EXTENDED cn (src/lib/utils.ts registers `text-data`/`text-label` as font-size classes). Today's inputs (:55-62) don't mix text-size and text-color utilities so no live clobber, but the split is the bug class — unify on ONE extended cn in the package.
  - Barrel over-drag: `import { cn } from "../utils"` resolves through ui/utils/index.ts, which also re-exports config.ts domain helpers + formatting.ts (ui/utils/index.ts:8-30) — the module graph carries domain config manipulation it never uses. Import from the cn module directly (or fix the package barrel).
  - Module-scope `cn()` for the static button classes (:55-62) is GOOD (stable references) — checked, no change.
- **Story notes:** imports `@/ui/components/ViewControls`; `Demo` wrapper; two stories (GridOn dark, GridOff system). Tooltips require the global preview TooltipProvider (story JSDoc says so; component does not self-provide). No card override.
- **Risks:** unifying onto the extended cn could theoretically change merge results for conflicting class pairs; here inputs are static and non-conflicting (verified :55-62), so no visual change expected — still oracle-verified for the three plain-cn consumers.

## 6. WaterStatsSection — `src/ui/components/WaterStatsSection.tsx` — **moderate**

- **Story:** `src/ui/components/WaterStatsSection.stories.tsx`
- **Tier evidence:** full read (189 lines). One crossing: type-only import of `RiverLakeFloodplainInspectorSummary` + `RiverLakeInspectorLayerRef` from `../../features/viz/riverLakeInspector` (WaterStatsSection.tsx:15-18). Rest: react, lucide-react, `components/ui` Tooltip trio, `./DisclosureHeader`.
- **Crossings:**
  1. `../../features/viz/riverLakeInspector` (type) — drag: 641-line viz-domain module whose own imports are type-only from `@swooper/mapgen-viz` (riverLakeInspector.ts:1-8, verified). No runtime pull, but the published `.d.ts` (prop types `summary`/`onLayerSelect`, WaterStatsSection.tsx:26-28) would reference the viz module and transitively `@swooper/mapgen-viz`. Remedy: **re-home-type** — the component reads only `rowKey/label/counts/layerRefs` and `layerKey/dataTypeKey/label/presentation.categoryLabel/presentation.palette.activeColor` (story JSDoc confirms, WaterStatsSection.stories.tsx:32-34); a narrow structural type owned by the package covers it, with the viz module conforming.
- **External deps:** react, lucide-react (Droplets); radix tooltip via primitives; `@swooper/mapgen-viz` types two hops (type-only).
- **Cleanups:**
  - Domain vocabulary baked into UI: `formatLayerButtonLabel` hardcodes 13 mapgen dataTypeKey substring→label heuristics (WaterStatsSection.tsx:46-62) and `isDivergenceCount` a `/mismatch|reject|drift/i` regex (:44) — layer-labeling knowledge should ride the layer-ref data (the presentation object already travels with it). Changing labels changes rendered text → oracle-gated.
  - `rows` derivation (map+filter+Object.entries) recomputed every render without memo (:83-90) — fine at this scale; memo if it becomes list-rendered by a hot parent. Lists ARE correctly keyed (row.rowKey :137, count key :145, ref.layerKey :159) — checked.
  - Magic truncation `row.layerRefs.slice(0, 4)` (:156) drops evidence chips silently — name the limit or surface an overflow count.
  - Inline `style={{ background: ref.presentation.palette.activeColor }}` (:174) is LEGAL per the system's data-color rule (comment :168-171) — checked, keep.
- **Story notes:** imports `@/ui/components/WaterStatsSection` + FOUR types from `@/features/viz/riverLakeInspector` (stories:3-8); the fixture fully satisfies the real viz types via `makeRef`/`makeRow` completions — if the prop type is re-homed/narrowed, the story's import specifiers and fixture typing must follow. `Dock` wrapper (bg-card 320px). Two stories (Expanded, Collapsed). Tooltip chips need the global TooltipProvider. No card override.
- **Risks:** narrowing the prop type is `.d.ts`-visible API change (app call site passes the wide viz type — still assignable if structural). Label-heuristic relocation changes rendered chip text → oracle-gated.

## 7. OptionSelect — `src/ui/components/OptionSelect.tsx` — **clean**

- **Story:** `src/ui/components/OptionSelect.stories.tsx`
- **Tier evidence (what was checked):** full read (63 lines). Exactly ONE import: the `components/ui` Select quintet (OptionSelect.tsx:1). No react import needed (no hooks/JSX-namespace use beyond automatic runtime), no types/constants/features. Options list keyed by `opt.value` (:55).
- **Crossings:** none.
- **External deps:** radix select via primitives (no direct external imports).
- **Cleanups:**
  - Barrel gap: NOT exported from `ui/components/index.ts` (verified) — AppFooter/AppHeader deep-import `./OptionSelect` (fine intra-package) but ds-entry must special-case it (sync-surface §2). Add to the package barrel.
  - Empty-value sentinel round-trip (`__option-select-empty__`, :30,41-42) is a documented Radix constraint workaround — checked, sound; duplicate `opt.value` inputs would collide keys AND sentinel semantics, worth a dev-mode guard in a published package.
- **Story notes:** imports `@/ui/components/OptionSelect`; rendered CLOSED (trigger + selected label only — the portal content never opens in capture, hence no card override needed); three stories (MapSize, ResourceMode, Disabled); `Demo` wrapper.
- **Risks:** none.

## 8. DisclosureHeader — `src/ui/components/DisclosureHeader.tsx` — **clean**

- **Story:** `src/ui/components/DisclosureHeader.stories.tsx`
- **Tier evidence (what was checked):** full read (172 lines). Imports: react, lucide-react (ChevronDown), `../utils` cn (DisclosureHeader.tsx:1-3). No features/stores/lib. Controlled component, ReactNode slots, `render` escape hatch reproduces the button ARIA contract — no state, no effects.
- **Crossings:** none.
- **External deps:** react, lucide-react; clsx + tailwind-merge via cn.
- **Cleanups:**
  - Divergent cn (same class as ViewControls): plain `cn` from `../utils` (:3). This file even DOCUMENTS the hazard it lives with — "the feature-tier `cn` does not register them and would clobber size vs color" (DisclosureHeader.tsx:70-73) and works around tailwind-merge's px↔pl/pr conflict model by refusing to bake padding (:83-85). Unifying on the extended cn removes the documented bug class and lets the padding-contract comment relax.
  - Barrel over-drag via `../utils` (same as ViewControls).
- **Story notes:** imports `@/ui/components/DisclosureHeader` + its Props type; render-driven stories with the CSF3 cast trick `args: {} as unknown as DisclosureHeaderProps` (stories:16); `Dock` wrapper (bg-popover column); two stories (PanelHeaders with expanded+collapsed rows, ChevronlessWithTag). Card override: `column`.
- **Risks:** cn unification could change merged-class output where consumers pass conflicting utilities; this component's contract explicitly routes typography to slots to avoid that (verified comments :66-73), so expected no-op — oracle-verified.

## 9. EmptyState — `src/ui/components/EmptyState.tsx` — **clean**

- **Story:** `src/ui/components/EmptyState.stories.tsx`
- **Tier evidence (what was checked):** full read (43 lines). Imports: react + `../utils` cn only (EmptyState.tsx:1-2). Stateless slot card; deliberately does not own the centering layer (documented :12-16).
- **Crossings:** none.
- **External deps:** react; clsx + tailwind-merge via cn.
- **Cleanups:**
  - Divergent cn (third plain-cn consumer, EmptyState.tsx:2) + `../utils` barrel over-drag — unify.
  - Note: also consumed outside the composites by `PipelineStage.tsx:4` via DIRECT FILE import (not the barrel) — import-style inconsistency to normalize when the package barrel becomes the boundary.
- **Story notes:** imports `@/ui/components/EmptyState` + Props type; cast-trick meta args; `Stage` wrapper supplies the `absolute inset-0` centering layer the component intentionally lacks; three stories (Loading with animate-spin Loader2, ErrorState, Awaiting eyebrow variant). Card override: `column`.
- **Risks:** none beyond the shared cn unification check.

## 10. ErrorBanner — `src/app/ErrorBanner.tsx` — **clean**

- **Story:** `src/app/ErrorBanner.stories.tsx`
- **Tier evidence (what was checked):** full read (31 lines). ZERO imports (verified — pure JSX + tailwind classes, message/top props, early-null when no message). `role="alert"` + `aria-live="assertive"` — correct interruptive-alert semantics.
- **Crossings:** none.
- **External deps:** none (react/jsx-runtime only).
- **Cleanups:**
  - Token-vocabulary drift: uses raw `text-xs` (ErrorBanner.tsx:24) where the rest of the surface uses the named scale (`text-data` 11px / `text-label` 10px). Aligning changes font size 12→11px → oracle-gated; alternatively record as accepted.
  - Home placement: a manifest component living in `src/app/` beside StudioShell/StudioProviders — moves out with the package; app dir keeps only orchestration (see Shared findings 5).
  - Absolute self-positioning + `top` prop (:24,26) — same placement-as-prop note as StageViewTabs; changes DOM → oracle-gated.
- **Story notes:** imports `@/app/ErrorBanner`; relative `Stage` wrapper (480×120); single story (GenerationFailed). No card override. No fixture deps.
- **Risks:** the text-xs→text-data alignment is a visible 1px type change — only under oracle sign-off.

## 11. PresetErrorDialog — `src/features/presets/PresetDialogs.tsx` — **clean**

- **Story:** `src/features/presets/PresetErrorDialog.stories.tsx`
- **Tier evidence (what was checked):** full read of the shared file (167 lines). File-level imports: react `useState` + the `components/ui` barrel (Button, Dialog×7, Input) ONLY (PresetDialogs.tsx:1-12). PresetErrorDialog (:31-53) uses Dialog set + Button; fully props-driven (`open`/`onOpenChange`); imports NONE of its feature-dir siblings (dialogState.ts, usePresets.ts, storage.ts etc. — verified against the file's import block).
- **Crossings:** none.
- **External deps:** react; radix dialog via primitives.
- **Cleanups:**
  - `details.join("\n")` in a `<pre>` (:41-44) — checked, fine (no list keys needed).
  - Home placement: three manifest components inside `features/presets/` next to app plumbing — the directory needs the same components-out/plumbing-stays split as configOverrides (Shared findings 5).
- **Story notes:** imports `@/features/presets/PresetDialogs` (multi-component file — story imports the named export); controlled `open: true` via args + noop `onOpenChange`; portals its own overlay → card override `single` 680×420; portal-dialog capture has the known manual-verification limit (memory: portal capture).
- **Risks:** none component-side; the multi-component file means all three preset rows move together.

## 12. PresetSaveDialog — `src/features/presets/PresetDialogs.tsx` — **clean**

- **Story:** `src/features/presets/PresetSaveDialog.stories.tsx`
- **Tier evidence (what was checked):** same file read (component at :63-135). Props-driven (`open/initialLabel/initialDescription/onCancel/onConfirm`); local `useState` only; no sibling/feature imports.
- **Crossings:** none.
- **External deps:** react; radix dialog via primitives.
- **Cleanups:**
  - The render-time initials re-sync uses the React-endorsed store-prev-value pattern instead of an effect, explicitly documented (:68-85) — checked, CORRECT; do not "fix" into an effect.
  - `canSave` gating duplicated (disabled + early return, :122-126) — defensive double-check, fine.
- **Story notes:** controlled `open: true`, seeded initials ("Tropical Archipelago"), noop callbacks; portal → card override `single` 680×460.
- **Risks:** none.

## 13. PresetConfirmDialog — `src/features/presets/PresetDialogs.tsx` — **clean**

- **Story:** `src/features/presets/PresetConfirmDialog.stories.tsx`
- **Tier evidence (what was checked):** same file read (component at :146-166). Props-driven, stateless; no sibling/feature imports.
- **Crossings:** none.
- **External deps:** react; radix dialog via primitives.
- **Cleanups:**
  - **Double-fire on Cancel:** the Cancel button carries an explicit `onClick={onCancel}` (:157) INSIDE a `DialogClose`, whose close also triggers `onOpenChange(false)` → `onCancel()` (:149) — `onCancel` runs twice per Cancel click. Harmless today only because the app's onCancel is an idempotent state-setter; PresetSaveDialog's Cancel (:119-121) correctly omits the onClick, proving the redundancy. Drop the explicit onClick.
- **Story notes:** controlled `open: true` ("Delete preset?" destructive confirm), noop callbacks; portal → card override `single` 680×340.
- **Risks:** removing the duplicate onClick is behavior-only (no render change); still note for review since it touches the interaction contract.

---

## Shared findings (group-level)

1. **Shared UI kernel moves or splits:** AppFooter/AppHeader/ViewControls (+ StageViewTabs via barrel absence) lean on `ui/types` (307 lines, zero imports), `ui/constants` (LAYOUT + Civ7 option data; self-contained except type-imports of ui/types), `ui/utils`. Treated intra-surface here, but these modules are co-owned by 15+ app files (coupling-recon §3.7) — the package/app split of `src/ui/{types,constants,utils,hooks}` is a single design decision gating four rows at once. Note `ui/constants/options.ts` embeds Civ7 engine ids (MAPSIZE_*, player counts) — domain data that a "clean UI package" arguably should receive via props (AppFooter cleanup) rather than ship.
2. **Divergent cn is a live defect in exactly 3 of these 13:** DisclosureHeader.tsx:3, EmptyState.tsx:2, ViewControls.tsx:15 use the plain `cn` (ui/utils/cn.ts) vs the extended `cn` (src/lib/utils.ts, registers text-data/text-label). DisclosureHeader.tsx:70-73 documents the resulting clobber hazard in-source. Package must ship ONE cn (the extended one) and re-point all three.
3. **`../utils` barrel over-drag:** `import { cn } from "../utils"` pulls `ui/utils/config.ts` (domain config manipulation) + `formatting.ts` into the module graph of all three plain-cn consumers (ui/utils/index.ts:8-30).
4. **Barrel gaps:** `StageViewTabs` and `OptionSelect` are missing from `ui/components/index.ts` (verified); `.design-sync/ds-entry.tsx` special-cases both. The package barrel should export all 13.
5. **Directory splits required:** `features/presets/` (PresetDialogs.tsx OUT — it imports zero siblings; dialogState/usePresets/storage/importFlow STAY) and `src/app/` (ErrorBanner OUT; StudioShell/StudioProviders stay). Mirrors the configOverrides/configBuilders split (recon §3.8).
6. **Only runtime server-contract path in this group is AppHeader** (via setupConfig normalization, setupConfig.ts:1-11,192,212). All other workspace-package exposure in the group is type-only (WaterStatsSection → riverLakeInspector → @swooper/mapgen-viz types).
7. **Card overrides for the group** (sync-surface §2): `column` = AppFooter, AppHeader, StageViewTabs, DisclosureHeader, EmptyState; `single`+viewport = PresetErrorDialog 680×420, PresetSaveDialog 680×460, PresetConfirmDialog 680×340 (portal overlays); no override = AppBrand, ViewControls, WaterStatsSection, OptionSelect, ErrorBanner.
8. **Positioning-as-chrome pattern:** AppFooter/AppHeader/StageViewTabs/ErrorBanner bake absolute app-shell placement (+z-index) into the component root; every corresponding story compensates with a relative wrapper. Library-grade shape would lift placement to the consumer — flagged per-row as oracle-gated because it changes DOM.
9. **TooltipProvider dependency split:** AppFooter self-provides (AppFooter.tsx:151); AppHeader/ViewControls/WaterStatsSection rely on the ambient provider (global preview decorator / cfg.provider). Inconsistent provider policy — pick one for the package (self-providing everywhere duplicates providers; ambient-only makes bare mounts silently blank, the known NOTES.md:25 failure mode).
10. **Story import shape:** all 13 stories import via the `@` alias (deep component paths; multi-component file for the preset dialogs); story-level fixture type imports that must chase re-homed types: AppFooter.stories (ui/types), AppHeader.stories (features/civ7Setup/setupConfig), WaterStatsSection.stories (features/viz/riverLakeInspector ×4).
