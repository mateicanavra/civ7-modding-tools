# Adversarial verification — ds-group "forms" (11 rows)

Verdict: **verified = true**. Every import surface was re-derived from source in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction`.
No tier changes. No missed runtime import crossing. All 11 "clean" tiers hold.
Corrections are minor (externalDeps completeness, two storyNotes overstatements);
one contract-level crossing the builder missed is recorded.

## Re-derived import surfaces (confirmed)

- `rjsfWidgets.tsx` — L1 `@rjsf/utils` (type-only), L2-12 `../../components/ui`
  barrel (value), L13 `./rjsfTemplates` (type-only, erased). No react import
  (jsx-runtime). Component spans match: TextWidget 47-81, TextareaWidget 83-115,
  NumberWidget 117-157, SelectWidget 159-188, CheckboxWidget 190-203,
  SwitchWidget 205-218, TagSelectWidget 220-263; sentinel L28; errorA11yProps
  L38-45 with `${id}__error` at L43; manual join L242; conflicting
  bg/border pairs L230-231. All confirmed.
- `rjsfTemplates.tsx` — L1-6 `@rjsf/utils` (type-only), L7 `lucide-react`
  (value), L8 `react` (value: Fragment), L9 `../../ui/components/fields`
  (FieldRow), L10 `./schemaPresentation`. FieldTemplate 147-221 (joins 184/201,
  renderGsComments join L98, errorId L179, hidden-branch style L163); Object
  template 295-431 (CollapsibleHeader 115-145, FlatObjectChildren 272-293,
  formContext read L344, `key={index}` L284, fallback keys 282/286/318/330);
  Array template 433-500 (Add 448-457, `as any` L488, `style={{flex:1}}` L477,
  `item.key ?? index` L490). All confirmed.
- `SchemaConfigForm.tsx` closure — `pathUtils.ts` zero imports ✓;
  `schemaPresentation.ts` `@rjsf/utils` type-only ✓; `SchemaForm.tsx` deep
  subpath `@rjsf/core/lib/components/Form.js` (value, L7, CSP rationale L1-6),
  templates/widgets/validator L10-17, per-mount validator memo L32-35, `as any`
  L57, neutralizing wrapper L38-45 ✓; `typeboxRjsfValidator.ts` `@rjsf/utils`
  value+type (L29-48), `typebox/value` L49, `reset()` no-op L339-343, class is
  stateless (no instance fields) ✓. console.error L106, fallback copy L199-204,
  dep-free `buildUiSchema` memo L47-95 ✓. Consumer: `src/ui/components/RecipePanel.tsx:31` ✓.
- Boundary sweep: grep for zustand/orpc/import.meta.env/@tanstack/stores across
  the full closure (feature files + `components/ui/*` + `lib/utils.ts` +
  `ui/components/fields/*` + `mockWidgetProps.tsx`) → zero hits. `sonner.tsx`
  (Toaster) reads theme off the `<html>` class via useSyncExternalStore — react
  + sonner only, no next-themes, no app store. FieldRow is react-only; the
  fields barrel exports only FieldRow.
- Versions all match package.json: react ^19.2.4, @rjsf/core+utils ^6.2.5,
  typebox ^1.0.80, lucide-react 0.522.0, sonner 2.0.7, radix select 2.3.0 /
  checkbox 1.3.4 / switch 1.3.0.
- `.design-sync/config.json` overrides confirmed: cardMode column for the three
  templates + SchemaConfigForm; Select primitive cardMode single; no overrides
  for the widget stories. `storyImports.shim` covers components/ui,
  features/configOverrides, ui/components/fields.
- Both cn homes exist as described: `src/lib/utils.ts` (extendTailwindMerge,
  text-data/text-label font-size groups) vs `src/ui/utils/cn.ts` (plain twMerge).
- mockWidgetProps.tsx: `widgetProps` L29-38, `alwaysExpandedCollapse` L45-48 ✓.
- Risk flags present where cleanups are render-affecting (TagSelect cn merge,
  FieldTemplate cn strings, FlatObjectChildren re-key, SchemaForm wrapper/
  fallback copy). No proposed remedy introduces a shim or re-export bridge.

## Corrections

1. **externalDeps incomplete on all 7 widget rows + SchemaConfigForm row.** The
   `components/ui` barrel's transitive set is listed as "@radix-ui/react-*,
   lucide-react, sonner" but every primitive imports `cn` from `@/lib/utils`
   (e.g. `src/components/ui/input.tsx:3`), which value-imports **clsx** and
   **tailwind-merge** (`src/lib/utils.ts:1-2`), and `button.tsx:2` value-imports
   **class-variance-authority**. All three enter every widget's module graph
   one hop out. External-npm only — no tier impact.
2. **SchemaConfigForm storyNotes overstate coverage**: "exercising every
   widget/template path" is false for **CheckboxWidget** — `buildUiSchema` maps
   boolean → `"switch"` unconditionally (`SchemaConfigForm.tsx:60-61`), so no
   fixture schema can route the form engine through CheckboxWidget. It is
   covered only by its own standalone stories.
3. **BrowserConfigArrayFieldTemplate storyNotes/risks miss a branch gap**: both
   stories (WithItems/Empty) supply `collapse` via the shared `base` fixture, so
   the no-collapse header branch (`rjsfTemplates.tsx:474-480`) — the exact home
   of the `style={{flex:1}}` cleanup at L477 — is outside the story oracle.
   The flex-1 swap is computed-style-identical (`flex:1` ≡ `flex:1 1 0%`), but
   any change there escapes the 46-story gate; the row should say so (the
   object-template row correctly covers its equivalent branch via
   WithoutCollapse).

## Missed crossing (contract-level, not an import)

- **DOM data-attribute contract across the package boundary.** The templates
  stamp `data-config-header` + `data-config-pointer`
  (`rjsfTemplates.tsx:129-130`) and the `configContentId` id scheme (L104-106);
  app-side `useConfigCollapse.ts` — NOT in the extraction slice — queries them
  by string (`useConfigCollapse.ts:124-128, 165-166`). Import direction is
  clean (app → package), but after extraction the package's rendered DOM is an
  implicit API the app's sticky/scroll engine depends on. The builder recorded
  the intra-slice `${id}__error` string contract but not this boundary-crossing
  one. Needs to be documented as part of the package's public contract.

## Notes (non-material)

- Trivial line-cite drift: isTransparent-branch fallback key is at
  `rjsfTemplates.tsx:330` (builder cited 329, the `.map` line); the
  FieldTemplate stories' cast-trick comment+meta sit at L19-27 (cited 22-26);
  SchemaConfigForm fallback div spans L199-204 (cited 200-203). All within ±1-2
  lines; evidence otherwise exact.
- "FocusedStage covers the focusPath wrap/mergeBack path": the wrap path
  executes at render; `mergeBack` is constructed but never invoked in a captured
  story (onChange is noop, no events fire). Fine as coverage of the memo path,
  not of merge semantics.
- SelectWidget's placeholder sentinel is render-side only: SelectContent never
  renders a sentinel item, so the empty→onChange path is unreachable from UI —
  consistent with the row's "round-trip is module-local" framing.
- Story-side duplication (Demo/Row wrappers copy-pasted across all 7 widget
  stories; `mockFieldContent` hand-mirrors FieldTemplate markup) is a latent
  drift risk in fixtures, not components — optional consolidation candidate.
