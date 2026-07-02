# Classification ledger — ds-group `forms` (11 components)

Slice built from full reads of every component source file, every co-located story file, all co-located support modules (`pathUtils.ts`, `schemaPresentation.ts`, `typeboxRjsfValidator.ts`, `useConfigCollapse.ts`, `configBuilders.ts` header, `SchemaForm.tsx`), the shared story fixture kit (`src/storybook/mockWidgetProps.tsx`), `components/ui/index.ts` (barrel), `ui/components/fields/FieldRow.tsx`, and `.design-sync/config.json`. All paths relative to `apps/mapgen-studio/` unless prefixed. Checkout: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` (HEAD = main tip `c4ebaf1e1`).

**Headline: this is the cleanest group in the surface — all 11 components are `clean`.** Zero app-boundary imports anywhere in the four component files or their support graph (verified import-by-import below). The group's issues are (a) a directory that must be split (`configBuilders.ts` is app plumbing living in the home), (b) React/packaging best-practice defects inside otherwise-clean files, and (c) one deliberate packaging hazard (`@rjsf/core` deep subpath) that must be preserved, not "cleaned".

## Import graph of the home (exhaustive)

| Module | Imports | App crossing? |
|---|---|---|
| `rjsfWidgets.tsx` | `@rjsf/utils` (t: RJSFSchema, WidgetProps) L1; `../../components/ui` (v: 9 primitives) L2-12; `./rjsfTemplates` (t: BrowserConfigFormContext) L13 | NO — barrel is intra-surface |
| `rjsfTemplates.tsx` | `@rjsf/utils` (t ×4) L1-6; `lucide-react` (v: ChevronDown, ChevronRight) L7; `react` (v Fragment, t ReactNode) L8; `../../ui/components/fields` (v: FieldRow) L9; `./schemaPresentation` (v: pathToPointer) L10 | NO — FieldRow is a manifest component |
| `SchemaConfigForm.tsx` | `@rjsf/utils` (t) L1; `react` (v useMemo) L2; `./pathUtils` (v) L3; `./rjsfTemplates` (t) L4; `./SchemaForm` (v) L5; `./schemaPresentation` (v ×4) L6-11 | NO |
| `SchemaForm.tsx` (support) | `@rjsf/core/lib/components/Form.js` (v, **deep subpath**, documented CSP fix) L1-7; `@rjsf/utils` (t) L8; `react` (v) L9; `./rjsfTemplates` (v+t) L10-15; `./rjsfWidgets` (v) L16; `./typeboxRjsfValidator` (v) L17 | NO |
| `pathUtils.ts` (support) | zero imports | NO |
| `schemaPresentation.ts` (support) | `@rjsf/utils` (t) L1 only | NO |
| `typeboxRjsfValidator.ts` (support) | `@rjsf/utils` (v+t) L29-48; `typebox/value` (v: Check, Errors) L49 | NO |
| `useConfigCollapse.ts` (support, consumed by RecipePanel) | `react` (v+t) L1-2; `./rjsfTemplates` (t: ConfigCollapseContext) L3 | NO |
| `configBuilders.ts` (**NOT in any component's graph**) | `@swooper/mapgen-core/authoring` (v), `@swooper/mapgen-core/compiler/normalize` (v), `../../recipes/catalog` (t), `../../ui/types` (t), `../configMigrations/pipelineConfig` (v), `../presets/types` (t) — configBuilders.ts:8-13 | **YES — must stay app-side** |

Reverse consumers of the home outside itself: `ui/components/RecipePanel.tsx:31-32` (SchemaConfigForm + useConfigCollapse, deep file paths — no barrel exists) and `src/storybook/mockWidgetProps.tsx:4-7` (rjsfTemplates types).

---

## Rows

### 1. TextWidget — `clean`
- **src:** `apps/mapgen-studio/src/features/configOverrides/rjsfWidgets.tsx` (L47-81)
- **story:** `apps/mapgen-studio/src/features/configOverrides/TextWidget.stories.tsx`
- **Tier evidence:** read rjsfWidgets.tsx in full; module imports are `@rjsf/utils` (type-only, L1), the intra-surface `components/ui` barrel (L2-12), and a type from sibling `rjsfTemplates` (L13). TextWidget itself uses only `Input` + module-local helpers `normalizeEmptyValue` (L30) / `errorA11yProps` (L38). No app imports, no stores, no env, no assets.
- **externalDeps:** `@rjsf/utils` ^6.2.5 (type-only); react via jsx-runtime (no direct react import in file); transitive via barrel: `@radix-ui/react-*`, `lucide-react`, `sonner`.
- **Cleanups:**
  - Barrel over-drag: imports `Input` via `../../components/ui` (rjsfWidgets.tsx:2-12); that barrel value-re-exports `toast` from `sonner` (components/ui/index.ts:13) and all 15 primitives (several importing lucide icons, e.g. select.tsx:2) — the whole set enters every widget's module graph. Prefer per-file imports or a value-free barrel in the package.
  - Checked-and-not-flagged: no `React.memo` on widgets is fine — rjsf gates field re-renders via `SchemaField.shouldComponentUpdate` deepEquals (documented at rjsfTemplates.tsx:17-22), so memo would be redundant.
- **Story notes:** alias import `@/features/configOverrides/rjsfWidgets` + typed fixture factory `widgetProps` from `@/storybook/mockWidgetProps` (mockWidgetProps.tsx:29-38, casts an honest subset to full `WidgetProps`). Local `Demo` wrapper uses token classes (`bg-background text-foreground`) — token CSS must load. No portal, no open-state. No card override.
- **Risks:** none beyond group-shared.

### 2. TextareaWidget — `clean`
- **src:** same file, L83-115. **story:** `TextareaWidget.stories.tsx`.
- **Tier evidence:** same module-level check as TextWidget; uses `Textarea` + the two module-local helpers only.
- **externalDeps / cleanups / story notes:** identical shape to TextWidget (stories: Filled/Empty on token `Demo` backdrop; `widgetProps` factory; no card override).

### 3. NumberWidget — `clean`
- **src:** same file, L117-157. **story:** `NumberWidget.stories.tsx`.
- **Tier evidence:** same module check; uses `Input` (type=number, inputMode=decimal) + `errorA11yProps`; NaN→`options.emptyValue` plumbing is self-contained (L146-154).
- **externalDeps / cleanups:** as TextWidget. Story notes: `options: { emptyValue: undefined }` fixtures; Filled/Disabled; no card override.

### 4. SelectWidget — `clean`
- **src:** same file, L159-188. **story:** `SelectWidget.stories.tsx`.
- **Tier evidence:** same module check; uses `Select/SelectContent/SelectItem/SelectTrigger/SelectValue`; the `SELECT_EMPTY_SENTINEL` round-trip (L28, L164-174) is module-local.
- **externalDeps:** as above; note Radix Select (`@radix-ui/react-select` 2.3.0) is the real runtime behind it, one hop via the barrel.
- **Cleanups:** `enumOptions` cast + `Map` rebuilt every render (L161-162) — cheap for config-sized enums; checked, not flagged as a defect. Items are keyed (`key={String(opt.value)}`, L181).
- **Story notes:** stories render the CLOSED trigger only — `SelectContent` is portal-based and never opens in the captured state (portal open-state not exercised). Token `Demo` backdrop. No card override (the `Select` primitive's own story has `cardMode: single` but this widget does not).

### 5. CheckboxWidget — `clean`
- **src:** same file, L190-203. **story:** `CheckboxWidget.stories.tsx`.
- **Tier evidence:** same module check; uses `Checkbox` + `errorA11yProps`; `onCheckedChange` normalizes indeterminate to boolean (L200).
- **Story notes:** story adds a preview-only `Row` label wrapper (the widget is just the box; label chrome is the template's job in-app). No card override.

### 6. SwitchWidget — `clean`
- **src:** same file, L205-218. **story:** `SwitchWidget.stories.tsx`.
- **Tier evidence:** same module check; uses `Switch` + `errorA11yProps`.
- **Story notes:** preview-only `Row` wrapper, On/Off stories. No card override.

### 7. TagSelectWidget — `clean`
- **src:** same file, L220-263. **story:** `TagSelectWidget.stories.tsx`.
- **Tier evidence:** same module check; uses NO ui primitive — raw `<button>` pills styled with token utility classes (L229-231). Everything else module-local.
- **Cleanups:**
  - Divergent classname composition: builds classes via `[baseTag, isActive ? activeTag : null].filter(Boolean).join(" ")` (rjsfWidgets.tsx:242) instead of either `cn` (`src/lib/utils.ts` extended vs `src/ui/utils/cn.ts` plain — the home uses NEITHER). Package should unify on the extended `cn`.
  - **Latent conflict resolved by stylesheet order, not by merge:** `activeTag` appends `bg-primary`/`border-primary`/`hover:bg-primary/90` AFTER `baseTag`'s `bg-input-background`/`border-input`/`hover:bg-accent` with plain string join (L230-231, 242) — both conflicting utilities coexist on the element and Tailwind's stylesheet order decides the winner. Works today; a cn/twMerge adoption changes the class set deterministically.
- **Story notes:** Selection/Disabled with module-scope `biomeOptions` fixture; token `Demo` backdrop; no card override.
- **Risks:** converting L242 to `cn` is render-affecting in principle (conflicting bg/border classes get merged away) — must re-verify against the TagSelectWidget story oracle.

### 8. BrowserConfigFieldTemplate — `clean` [card override: `cardMode: column`]
- **src:** `apps/mapgen-studio/src/features/configOverrides/rjsfTemplates.tsx` (L147-221)
- **story:** `BrowserConfigFieldTemplate.stories.tsx`
- **Tier evidence:** read rjsfTemplates.tsx in full; module imports: `@rjsf/utils` (t, L1-6), `lucide-react` (v, L7 — not used by THIS component), `react` (L8), `FieldRow` from `../../ui/components/fields` (L9 — manifest component, intra-surface), `pathToPointer` from `./schemaPresentation` (L10 — support module whose only import is `@rjsf/utils` type). Component body uses `FieldRow` (L202), module-local `FORM` const, `humanizeSchemaLabel`, `renderGsComments`. Zero app crossings.
- **externalDeps:** react ^19.2.4; `@rjsf/utils` (type-only). (`lucide-react` rides the module but this component does not render icons.)
- **Cleanups:**
  - Manual join instead of `cn`: L184, L201 (`[..., classNames].filter(Boolean).join(" ")`), L98 (renderGsComments).
  - The `${id}__error` live-region id is a cross-file DOM contract with `errorA11yProps` (rjsfWidgets.tsx:38-45 ↔ rjsfTemplates.tsx:179) — undocumented as a shared constant; extract the id builder so the contract is one definition.
  - Hidden branch renders `<div style={{ display: "none" }} />` (L163) with a fresh style object each render — trivial; hoist or use a class.
- **Story notes:** render-only stories with the `args: {} as unknown as FieldTemplateProps<...>` CSF3 cast trick (stories L22-26); `children` is a pre-rendered `Input`; `Demo` wrapper is a `bg-card` panel (token CSS required). Invalid story exercises the `rawErrors`-gated live region. Card override `cardMode: column` (.design-sync/config.json overrides).
- **Risks:** none beyond group-shared; cn unification here is class-string-identical (no conflicting utilities in the joined sets) but still oracle-check the two stories.

### 9. BrowserConfigObjectFieldTemplate — `clean` [card override: `cardMode: column`]
- **src:** same file, L295-431. **story:** `BrowserConfigObjectFieldTemplate.stories.tsx`.
- **Tier evidence:** same module check as row 8. Uses lucide chevrons via module-local `CollapsibleHeader` (L115-145), `pathToPointer` (support), `FORM`, `FlatObjectChildren` (L272-293), `renderGsComments`, `configContentId`. Collapse state arrives as DATA through `registry.formContext` (L344) — deliberately store-free (design rationale documented L17-23). Zero app crossings.
- **externalDeps:** react; `lucide-react` 0.522.0 (ChevronDown/ChevronRight); `@rjsf/utils` (type-only).
- **Cleanups:**
  - **Index-keyed run blocks:** `FlatObjectChildren` keys scalar-run wrappers by partition index (`key={index}`, rjsfTemplates.tsx:284). When a property toggles `hidden` or a section appears mid-run, run indices shift and React remounts input subtrees (losing focus/DOM state) — key by first-item name instead. Fallback `?? index` keys also at L282, L286, L318, L329.
  - Manual join instead of `cn`: L128 (CollapsibleHeader).
- **Story notes:** render-only + cast trick; fixture `stageProps` hoisted to module scope; `alwaysExpandedCollapse` fakes `ReadonlySet` via `{ has: () => true }` cast (mockWidgetProps.tsx:45-48) and `noTransparentPaths`; two stories cover with/without collapse plumbing (chevron vs plain header). `bg-card` Demo frame. Card override `cardMode: column`.
- **Risks:** re-keying FlatObjectChildren changes remount behavior, not static markup — low oracle exposure but verify ExpandedStage.

### 10. BrowserConfigArrayFieldTemplate — `clean` [card override: `cardMode: column`]
- **src:** same file, L433-500. **story:** `BrowserConfigArrayFieldTemplate.stories.tsx`.
- **Tier evidence:** same module check. Uses `CollapsibleHeader`, `pathToPointer`, `FORM`, `renderGsComments`, `configContentId`; Add button rides the header action zone (L448-457). Zero app crossings.
- **externalDeps:** react; `lucide-react` (chevrons); `@rjsf/utils` (type-only).
- **Cleanups:**
  - **`as any` escape:** `(item as any)?.children ?? (item as any)?.props?.children ?? item` (rjsfTemplates.tsx:488) — untyped probe across rjsf version shapes; type a narrowing helper instead.
  - Fresh `style={{ flex: 1 }}` object per render in the no-collapse header (L477) — use a class (`flex-1`).
  - Item keys use `item.key ?? index` (L490) — rjsf provides stable `item.key`; the index fallback is the smell.
- **Story notes:** render-only + cast trick; `base` fixture module-scoped; items supply pre-rendered `children` via `mockFieldContent`; WithItems/Empty. `bg-card` Demo frame. Card override `cardMode: column`.
- **Risks:** none beyond group-shared.

### 11. SchemaConfigForm — `clean` [card override: `cardMode: column`]
- **src:** `apps/mapgen-studio/src/features/configOverrides/SchemaConfigForm.tsx`
- **story:** `apps/mapgen-studio/src/features/configOverrides/SchemaConfigForm.stories.tsx`
- **Tier evidence:** read in full plus its complete transitive closure: `pathUtils.ts` (zero imports), `schemaPresentation.ts` (`@rjsf/utils` t only), `SchemaForm.tsx` (deep `@rjsf/core` subpath v, rjsf templates/widgets, TypeBox validator), `typeboxRjsfValidator.ts` (`@rjsf/utils` v+t, `typebox/value` v). Every edge is external-npm or intra-surface; zero app imports anywhere in the closure. Props-driven engine (schema + value + onChange + disabled + focusPath + collapse) — exactly how RecipePanel feeds it.
- **externalDeps:** react (useMemo); `@rjsf/utils` ^6.2.5; transitive runtime: `@rjsf/core` ^6.2.5 (**deep subpath** `lib/components/Form.js`, SchemaForm.tsx:7), `typebox` ^1.0.80 (`typebox/value`, typeboxRjsfValidator.ts:49), `lucide-react` + `@radix-ui/*` + `sonner` (via templates/widgets/barrel).
- **Cleanups:**
  - **App-branded copy inside a would-be package component:** `console.error("[mapgen-studio] failed to resolve config schema", ...)` (SchemaConfigForm.tsx:106) and the fallback body "Run the pipeline build to regenerate studio artifacts" (L200-203) bake app identity + app-domain instructions into the component. Remedy: neutral copy + optional `fallback`/`onSchemaError` prop.
  - Dep-free `useMemo` wrapping a pure function: `buildUiSchema` (L47-95, deps `[]`) closes over nothing — hoist to a module-level function; removes hook noise and an eslint-exhaustive-deps hazard.
  - Same in SchemaForm.tsx:32-35: `createTypeboxValidator()` memoized per mount, but `TypeboxValidator` is stateless (`reset()` is a documented no-op, typeboxRjsfValidator.ts:339-343) — a module-level singleton is simpler.
  - **`as any` escape:** `widgets={configWidgets as any}` (SchemaForm.tsx:57).
  - Neutralizing wrapper `<div style={{ padding: 0, borderRadius: 0, border: "none", background: "transparent" }}>` (SchemaForm.tsx:38-45) — inert style resets suggesting dead chrome; removing it changes DOM structure (see risks).
  - **Keep, do not "clean":** the `@rjsf/core/lib/components/Form.js` deep subpath import (SchemaForm.tsx:1-7) is the CSP fix (barrel drags ajv's `new Function`); it pins the package to rjsf's internal layout — document as a pinned packaging hazard, and re-verify on every `@rjsf/core` bump.
- **Story notes:** the heaviest story of the group — runs the REAL rjsf engine (Form + TypeBox validator execute in-story), driven by a plain schema+value fixture exercising every widget/template path; `Panel` wrapper is a `bg-popover` token surface; `alwaysExpandedCollapse` + `noop` from mockWidgetProps; FocusedStage covers the focusPath wrap/mergeBack path. Render-only + cast trick. Card override `cardMode: column`. No server/oRPC anywhere.
- **Risks:** removing the SchemaForm neutralizing wrapper or changing fallback copy alters rendered output — the fallback state is NOT covered by either story (both fixtures resolve), so a copy change escapes the oracle; verify manually. Deep-subpath import breaks silently on rjsf internal reshuffles.

---

## Shared findings (group level)

1. **Directory split required:** `features/configOverrides/` mixes the extractable UI suite with `configBuilders.ts` — app plumbing (value-imports `@swooper/mapgen-core/authoring` + `/compiler/normalize`, type-imports `recipes/catalog`, `ui/types`, `presets/types`, value-imports `configMigrations/pipelineConfig`; configBuilders.ts:8-13), consumed only by app guts and in NO component's graph. It stays app-side; everything else in the directory moves.
2. **Move-with set for the package:** `SchemaForm.tsx`, `pathUtils.ts`, `schemaPresentation.ts`, `typeboxRjsfValidator.ts` (+ its co-located `typeboxRjsfValidator.test.ts`, which must keep running in the package), and `useConfigCollapse.ts` (react-only, type-imports `ConfigCollapseContext` from rjsfTemplates.ts:3; consumed by manifest component RecipePanel at RecipePanel.tsx:32).
3. **Barrel gap:** the home has NO `index.ts`; consumers deep-path import (`RecipePanel.tsx:31-32`). The package needs a public entry for `SchemaConfigForm`, `useConfigCollapse`, `configWidgets`, the three templates, and the `BrowserConfigFormContext`/`ConfigCollapseContext` types.
4. **Story fixture kit moves cleanly:** `src/storybook/mockWidgetProps.tsx` serves all 10 widget/template stories and imports only intra-surface modules (`@/components/ui` Input, rjsfTemplates types, FieldRow — mockWidgetProps.tsx:1-8). It must relocate with the package Storybook; note its `{ has: () => true } as unknown as ReadonlySet<string>` cast (L45-48) is a deliberate fixture hack.
5. **Alias-only story imports:** every story imports via `@/…` — the package Storybook must recreate the alias or rewrite specifiers (matches the storybook-oracle ground finding; `storyImports.shim` in .design-sync/config.json lists `features/configOverrides` as a shimmed root).
6. **`cn` divergence, third variant:** this home uses neither `src/lib/utils.ts` (extended) nor `src/ui/utils/cn.ts` (plain) — it string-joins manually (rjsfWidgets.tsx:242; rjsfTemplates.tsx:98, 128, 184, 201). Unify on the package's single extended `cn`; TagSelectWidget's active-pill conflict (row 7) is the one render-affecting case.
7. **Cross-file DOM/ARIA contract:** widgets and FieldTemplate share the `${id}__error` convention (rjsfWidgets.tsx:38-45 ↔ rjsfTemplates.tsx:179) and templates stamp `data-config-header`/`data-config-pointer` that `useConfigCollapse` queries (rjsfTemplates.tsx:129-130, useConfigCollapse.ts:123-125) — these five modules form one cohesive unit; extract together, never split.
8. **Card overrides:** the four flagged components all carry `cardMode: "column"` in `.design-sync/config.json` overrides — a sync capture-layout concern only; no code implication.
9. **Barrel `toast` value re-export** (components/ui/index.ts:13) puts `sonner` in the module graph of all seven widgets via the L2-12 barrel import — a package barrel should not value-re-export a toast API from its primitives entry.
