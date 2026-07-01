# Adversarial verification — ds-group "composites" (13 rows)

Verifier re-derived the import surface of all 13 components + their one-hop helpers from source in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction`. Verdict: **verified=true** —
no tier changes, no missed runtime crossings. Three corrections (one remedy-quality defect, one false
storyNote claim, one incomplete categorical sweep) and several notes.

## Re-derived import surfaces (all confirmed against the rows)

| Component | Imports found in source | Row match |
|---|---|---|
| AppBrand.tsx (72 ln) | lucide-react (:1), react (:2). Nothing else. | ✓ clean |
| AppFooter.tsx (339 ln) | lucide (:1), react (:2), components/ui barrel (:3-10), **VALUE** seedPolicy (:11), ui/constants (:12), ui/types type-only (:13), ./OptionSelect (:14) | ✓ moderate, crossing captured |
| AppHeader.tsx (295 ln) | lucide (:1), react (:2), components/ui (:3), **VALUE** setupConfig 3 fns + type Civ7StudioSetupConfig (:4-9), ui/types type (:10), AppBrand (:11), OptionSelect (:12), ViewControls (:13) | ✓ app-shaped, both crossings captured |
| StageViewTabs.tsx (69 ln) | lucide (:1), react (:2), **type-only** stores/viewStore (:3) | ✓ moderate |
| ViewControls.tsx (111 ln) | lucide (:11), react (:12), components/ui Tooltip trio (:13), ui/types type (:14), plain cn via ../utils (:15) | ✓ clean |
| WaterStatsSection.tsx (189 ln) | lucide (:12), react (:13), Tooltip trio (:14), **type-only** features/viz/riverLakeInspector (:15-18), ./DisclosureHeader (:19) | ✓ moderate |
| OptionSelect.tsx (63 ln) | components/ui Select quintet (:1) only | ✓ clean |
| DisclosureHeader.tsx (171 ln) | react (:1), lucide (:2), plain cn (:3) | ✓ clean |
| EmptyState.tsx (43 ln) | react (:1), plain cn (:2) | ✓ clean |
| ErrorBanner.tsx (30 ln) | ZERO imports | ✓ clean |
| PresetDialogs.tsx (167 ln) | react useState (:1), components/ui barrel (:2-12); no feature-dir sibling imports (dialogState/usePresets/storage/importFlow absent) | ✓ all three rows clean |

One-hop helpers re-verified:
- `seedPolicy.ts`: 57 lines, ZERO imports — confirmed self-contained.
- `setupConfig.ts` (306 ln): value-imports 5 bindings + 4 types from `@civ7/studio-server/contract` (:1-11);
  `normalizeStudioSetupConfig` (:107-109) wraps `normalizeRunInGameSetupConfig`; called from update helpers
  at :192 and :212; `getLocalPlayerSetup` (:181) also touches the contract value `DEFAULT_...`. Runtime
  server-contract dependency two hops deep — CONFIRMED. `Civ7StudioSetupConfig = RunInGameSetupConfig` (:28) —
  .d.ts leak CONFIRMED.
- `viewStore.ts`: zustand store (:1); `StageView` 2-literal union (:32) — CONFIRMED.
- `riverLakeInspector.ts`: 641 lines; sole import is type-only from `@swooper/mapgen-viz` (:1-8) — CONFIRMED.
- `ui/utils/cn.ts` (:10-12) plain `twMerge(clsx)`; `src/lib/utils.ts` (:12-18) extended merge registering
  text-data/text-label — divergent-cn claim CONFIRMED. Exactly 3 plain-cn consumers (ViewControls,
  DisclosureHeader, EmptyState) — grep-confirmed.
- `ui/utils/index.ts` re-exports config.ts (12 domain helpers) + formatting.ts (:8-30) — over-drag CONFIRMED
  (config.ts's own imports are type-only ../types + formatStageName; no store/feature drag through it).
- `ui/components/index.ts`: AppBrand :8, FOOTER_HEIGHT :9; StageViewTabs and OptionSelect ABSENT — barrel
  gaps CONFIRMED; `.design-sync/ds-entry.tsx:14-15` special-cases both, exactly as claimed.
- `.design-sync/config.json` card overrides: AppFooter/AppHeader/DisclosureHeader/EmptyState/StageViewTabs =
  column; PresetErrorDialog single 680x420, PresetSaveDialog single 680x460, PresetConfirmDialog single
  680x340; AppBrand/ViewControls/WaterStatsSection/OptionSelect/ErrorBanner absent — ALL row claims match.
- `.storybook/preview.tsx:34` global `TooltipProvider delayDuration={300}` — decorator claims CONFIRMED.
- PresetConfirmDialog double-fire: explicit `onClick={onCancel}` (:157) inside DialogClose + `onOpenChange`
  → `onCancel()` (:149) — CONFIRMED; PresetSaveDialog Cancel (:119-121) omits it — CONFIRMED.
- PresetSaveDialog render-time store-prev-value re-sync (:74-85) — verified correct as written; the "do not
  'fix' into an effect" guard is right.
- AppFooter inert `min`/`max` on `type="text"` Input (:266, :272-273) — correct HTML semantics (min/max are
  inert on text inputs; pattern/inputMode still work).
- AppHeader ResizeObserver effect (:96-110) — cleanup + deps verified correct.

## Corrections

1. **AppFooter — boundaryCrossings[0].remedy `inline` violates the one-owner end state.**
   seedPolicy.ts is not footer-only: three app hooks value-import its parse/format/random functions
   (`src/app/hooks/useRunInGame.ts:7-9`, `useBrowserRun.ts:15-18`, `useSetupControls.ts:5-7`) and validate
   the SAME seed the footer's aria-label/title text describes (`Generation seed (MIN-MAX)`, AppFooter.tsx:274,280).
   Inlining CIV7_STUDIO_SEED_MIN/MAX into the published package creates a second owner of the Civ7 seed-range
   policy — app policy change (seedPolicy.ts stays behind) silently desyncs the package's rendered range text.
   Remedy should be inject-prop (range as props with defaults) or re-home seedPolicy into the shared kernel
   alongside the ui/constants domain-data decision the row itself raises in risks.

2. **AppHeader — storyNotes claim "the one story in this group typed directly against an app-feature module"
   is false.** WaterStatsSection.stories.tsx:3-8 types its fixture directly against FOUR types from
   `@/features/viz/riverLakeInspector` — recorded in the builder's own WaterStatsSection row. Two stories in
   this group (AppHeader, WaterStatsSection) must chase feature-module type re-homes, not one.

3. **EmptyState — cleanup's direct-file-import sweep is incomplete.** It names only
   `src/features/recipeDag/PipelineStage.tsx:4`; `src/app/CanvasStage.tsx:6` also imports
   `"../ui/components/EmptyState"` directly, bypassing the barrel. The import-style normalization is a
   2-consumer class, not 1.

## Missed crossings

None at the boundary level — every feature/store/lib import in all 13 files is accounted for, and no value
import hides behind a type-only sibling (AppHeader's mixed `{ type X, fn, fn, fn }` block is correctly split
into value + type crossings).

## Notes

- **externalDeps understatement (uniform, 6 rows):** `src/components/ui/index.ts:13` VALUE re-exports
  `toast` from `sonner`, so every barrel importer (AppFooter, AppHeader, ViewControls, WaterStatsSection,
  OptionSelect, PresetDialogs) drags sonner + the full primitive kit (all Radix packages, cva) at
  module-graph level. Intra-surface + external only — no app store/feature reached — so no tier impact, but
  the extracted package must declare `sonner` (and the primitives import the EXTENDED cn from
  `src/lib/utils.ts`, which itself is clean: clsx + tailwind-merge only).
- **WaterStatsSection slice(0,4) cleanup:** the "surface overflow" branch of that cleanup would change
  rendered chip output, and the story fixture never exercises the truncation (max 2 layerRefs per row) — the
  oracle cannot gate it. If executed as overflow-surfacing rather than a named constant, it needs its own
  risk flag and a fixture with ≥5 refs.
- Trivial line-count drift, no substantive effect: setupConfig.ts is 306 lines (row: 305),
  DisclosureHeader.tsx 171 (row: 172), ErrorBanner.tsx 30 (row: 31); AppBrand links span :40-60 (row: 40-59);
  ErrorBanner `top` is applied at :25 (row: :24,26).
- Tier spot-checks for inflation/deflation: AppHeader's app-shaped grade is earned (runtime server-contract
  reach two hops deep + .d.ts type leak + domain precedence rules in-component — not a mechanical move);
  AppFooter stays moderate (sole crossing is two constants; all public prop types travel with ui/types);
  StageViewTabs/WaterStatsSection moderate-on-type-only is internally consistent (crossing targets stay in
  the app; ui/types targets move with the package and are correctly graded clean).
