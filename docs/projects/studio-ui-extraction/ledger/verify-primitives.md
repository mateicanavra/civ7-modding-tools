# Adversarial verification — ds-group "primitives" (16 rows)

Verifier: independent re-derivation from source in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction/apps/mapgen-studio`.
Every component file and every story file in the slice was read IN FULL; supporting
evidence (package.json, index.css, barrel, sub-barrel, useResolvedTheme, sonner test,
.storybook/preview.tsx, .design-sync/{config.json,NOTES.md,conventions.md,ds-entry.tsx})
was independently checked. Verdict: **VERIFIED (true)** — no tier changes, no missed
runtime crossings inside the slice, only minor corrections.

## Re-derived import surfaces (source of truth for the compare)

| Component | File (lines) | Value imports | Type-only | Crossing |
|---|---|---|---|---|
| Button | button.tsx (61) | react, @radix-ui/react-slot (Slot), class-variance-authority (cva), @/lib/utils (cn) | VariantProps | @/lib/utils |
| Checkbox | checkbox.tsx (33) | react, @radix-ui/react-checkbox, lucide-react (Check), cn | — | @/lib/utils |
| Dialog | dialog.tsx (107, 10 exports) | react, @radix-ui/react-dialog, lucide-react (X), cn | — | @/lib/utils |
| DropdownMenu | dropdown-menu.tsx (193, 15 exports) | react, @radix-ui/react-dropdown-menu, lucide-react (Check/ChevronRight/Circle), cn | — | @/lib/utils |
| Input | input.tsx (31) | react, cn | — | @/lib/utils |
| Label | label.tsx (25) | react, @radix-ui/react-label, cn | — | @/lib/utils |
| Popover | popover.tsx (35) | react, @radix-ui/react-popover, cn | — | @/lib/utils |
| ScrollArea | scroll-area.tsx (48) | react, @radix-ui/react-scroll-area, cn | — | @/lib/utils |
| Select | select.tsx (169, 10 exports) | react, @radix-ui/react-select, lucide-react (Check/ChevronDown/ChevronUp), cn | — | @/lib/utils |
| Separator | separator.tsx (28) | react, @radix-ui/react-separator, cn | — | @/lib/utils |
| Switch | switch.tsx (36) | react, @radix-ui/react-switch, cn | — | @/lib/utils |
| Tabs | tabs.tsx (60) | react, @radix-ui/react-tabs, cn | — | @/lib/utils |
| Textarea | textarea.tsx (28) | react, cn | — | @/lib/utils |
| Tooltip | tooltip.tsx (35) | react, @radix-ui/react-tooltip, cn | — | @/lib/utils |
| Toaster | sonner.tsx (89) | react, sonner (Toaster as Sonner) | ToasterProps | NONE |
| FieldRow | ui/components/fields/FieldRow.tsx (13) | react | — | NONE |

Barrel `components/ui/index.ts`: value re-export `export { toast } from "sonner"` (line 13);
Button/ButtonProps/buttonVariants at line 14; Toaster-only at line 62 (no useThemeFromClass).
All exactly as the rows state. `src/lib/utils.ts` imports only clsx +
tailwind-merge `extendTailwindMerge` (lines 1-2) and is homed beside orpc.ts/query.ts/control/
— drag description confirmed. **All 16 tier=clean assignments hold.**

## Spot-checked row claims that all verified

- Versions (package.json): checkbox 1.3.4, dialog 1.1.16, dropdown-menu 2.1.17, label 2.1.9,
  popover 1.1.16, scroll-area 1.2.11, select 2.3.0, separator 1.1.9, slot 1.2.5, switch 1.3.0,
  tabs 1.1.14, tooltip 1.2.9, lucide-react 0.522.0, sonner 2.0.7, react ^19.2.4;
  cva/clsx/tailwind-merge = "latest" at package.json:163/164/172 (UNPINNED claim correct).
- tw-animate-css imported at src/index.css:9; utility uses at dialog.tsx:25,43;
  dropdown-menu.tsx:48,66; popover.tsx:25-26; select.tsx:83; tooltip.tsx:25-26 — all exact.
- ds overrides (.design-sync/config.json): Dialog single/680x360, DropdownMenu single/420x460,
  Popover single/460x360, Select single/420x460, Tooltip single/400x240,
  Toaster single+primaryStory "Notifications", Separator/Tabs/Textarea column — all exact;
  no overrides for Button/Checkbox/Input/Label/ScrollArea/Switch/FieldRow (matches "no card override").
- cfg.provider = TooltipProvider {delayDuration:300}; .storybook/preview.tsx mounts
  QueryClientProvider(stub) > TooltipProvider(300) > [Story, Toaster] — Tooltip/Toaster
  decorator claims exact. conventions.md:12-15 carries the TooltipProvider contract.
- NOTES.md citations located: FieldRow duplicate-export-collision (Components section),
  TooltipProvider-blank + the exact 6 affected composites (ViewControls, WaterStatsSection,
  AppHeader, GameConsole, RecipePanel, ExplorePanel; AppFooter self-provides) — the "6
  tooltip-consuming composite stories" risk count is right; `[RENDER_BLANK]` false positive
  at NOTES.md:127-131.
- Sonner: useThemeFromClass cluster (sonner.tsx:21-58) is functionally identical to
  src/ui/hooks/useResolvedTheme.ts line-for-line in behavior (same module-scope
  MutationObserver subscribe on class attr, same .dark → .light → colorScheme snapshot
  order, same "dark" SSR fallback). Off-barrel export at sonner.tsx:88; deep import at
  test/ui/sonnerTheme.test.tsx:5. Barrel-toast consumers = src/app/hooks/useToast.ts
  (via relative `../../components/ui`) + sonner.stories.tsx — grep-confirmed, no others.
- ScrollArea: `.custom-scrollbar` appears ONLY in the doc comment (scroll-area.tsx:8) —
  the builder's correction of theme-token.md §5.2 is itself correct.
- FieldRow: only React.FC in the slice (checked all 16); rjsfTemplates.tsx imports it
  (line 9) and renders it (202-208); fields/index.ts:11 re-exports; ds-entry.tsx mentions
  it only in a comment (line 17), no re-export.
- Static-literal cn cleanups (checkbox.tsx:26; switch.tsx:27-30): inlining is genuinely
  byte-identical — no conflicting Tailwind groups inside either call, so twMerge is a
  pass-through concat. Correctly not risk-flagged.
- Story shapes: Button 3 (Variants/Sizes/States); Checkbox 4; Dialog 1 defaultOpen (:28);
  DropdownMenu 1 forced open (:28); Input 4; Label 4 (incl. text-label Eyebrow); Popover 1
  defaultOpen (:20); ScrollArea 1 (15-item module-scope fixture, 160px height); Select 1
  defaultOpen value="standard" (:20); Separator 2; Switch 4; Tabs 2 (differing defaultValue);
  Textarea 3 (module-scope JSON fixture); Tooltip 1 self-provided provider + open (:22-23);
  Toaster 1 (no own Toaster, useEffect fires toasts, relies on decorator); FieldRow 2 with
  args-cast trick (:16). All match.

## Corrections (minor, evidence anchors only)

1. **ScrollArea / storyNotes** — keyed-map anchor is off by one: `key={name}` is at
   scroll-area.stories.tsx:71 (the keyed `<div>` opens at line 70). Cosmetic.

## Missed by the builder (remedy-adjacent, not an in-slice import)

1. **Second, non-equivalent `cn` twin: `src/ui/utils/cn.ts`** (exported via
   `src/ui/utils/index.ts:7`, consumed by src/ui components e.g. DisclosureHeader.tsx:3,
   EmptyState.tsx:2 via `../utils`). It uses **plain** `twMerge`, NOT the
   `extendTailwindMerge` variant — so it has different merge semantics: under plain twMerge
   a later color utility clobbers the custom `text-data`/`text-label` size (the exact bug
   src/lib/utils.ts documents). No primitive in this slice imports it, so no row changes —
   but every row's `move-with` remedy implies ONE package `cn`, and the one-owner end state
   must unify BOTH helpers. Folding the plain-twMerge consumers onto the extended cn is a
   **rendered-output-adjacent change** (class emission differs wherever text-data/text-label
   meet a color utility) and needs a risk flag in whichever slice owns those composites.
2. **Move-with is even cleaner than claimed** (strengthens the remedy): grep shows
   `src/lib/utils.ts` has ZERO consumers outside `src/components/ui/` (exactly the 14
   cn-importing primitives). After the move the file can be deleted outright — no re-export
   bridge is needed or justifiable, satisfying one-owner by construction.

## Notes

- **tw-animate-css is devDependencies-only** (`^1.4.0`, package.json:189). The Dialog risk
  (package CSS entry must carry the @import) is right but incomplete: the extracted package
  must also re-declare tw-animate-css in its own dependency graph or the CSS build breaks.
- **Toaster has a second CSS-side drag beyond the inline CSS vars**: `toastOptions.classNames`
  uses Tailwind arbitrary-variant utilities (`group-[.toaster]:bg-popover`, `group-[.toast]:…`,
  sonner.tsx:75-81). These exist only if the package's Tailwind compile scans sonner.tsx —
  same class of risk as the tw-animate-css entry-CSS requirement; worth carrying on the
  Toaster row when the package CSS pipeline is designed.
- The `@` alias is app-root (tsconfig.json:12 `"@/*": ["src/*"]`; vite.config.ts:43) —
  "app-root @ alias" drag phrasing confirmed.
- No tier inflation/deflation anywhere in the slice: nothing here is app-shaped or moderate;
  Toaster and FieldRow genuinely have zero import crossings.
- No remedy in the slice proposes a shim or re-export bridge; all `move-with` — compatible
  with the one-owner end state given note (2) above.
