# Classification ledger — ds-group `primitives` (16 components)

Checkout read: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` @ `c4ebaf1e1` (main tip). Paths relative to `apps/mapgen-studio/` unless absolute. Method: every component source file AND its co-located story file read IN FULL (32 files), plus `src/lib/utils.ts`, `src/ui/utils/cn.ts`, `src/components/ui/index.ts`, `src/ui/components/fields/index.ts`, `components.json`, `package.json` dependency pins, and greps for `useThemeFromClass` consumers / `.custom-scrollbar` / plain-`cn` importers. Ground reports used as hints and re-verified where relied on (two corrections recorded in §Shared).

**Slice verdict: 16/16 clean.** No component in this group value-imports app domain logic, stores, transport, or workspace server packages. The one recorded boundary crossing — `@/lib/utils` (`cn`) — is shared by the 14 styled shadcn primitives and is a mis-homed shared UI util (it lives in `src/lib/` next to `orpc.ts`/`query.ts`/`control/`), not a domain dependency; it moves with the package. `Toaster` (sonner.tsx) and `FieldRow` have zero crossings of any kind.

---

## Shared findings (group level)

1. **One crossing class for the whole group: `cn` from `@/lib/utils`.** 14 of 16 import it (all except `sonner.tsx` and `FieldRow.tsx`). `src/lib/utils.ts` is self-contained (`clsx` + `extendTailwindMerge` only, `lib/utils.ts:1-2`) but homed in the app transport directory (`src/lib/` also holds `orpc.ts`, `query.ts`, `control/`) and reached via the app-root alias `@/*` (`tsconfig.json:12`). Remedy: **move-with** — the extended `cn` (registers `text-data`/`text-label` in the `font-size` class group, `lib/utils.ts:12-18`) is the ONE `cn` the package ships. No visual delta for this group (same implementation, new home).
2. **Divergent duplicate `cn` exists and is live** — `src/ui/utils/cn.ts` (plain `twMerge(clsx(...))`, `cn.ts:10-12`) is re-exported from the `ui/utils` barrel (`ui/utils/index.ts:7`) and imported by `DisclosureHeader.tsx`, `ViewControls.tsx`, `EmptyState.tsx` (grep-verified). **Correction to theme-token.md:150** ("no importers" — false; it has 3 barrel-path importers, all in the composites slice). Those three are exposed to the size-clobber bug class the extended `cn` exists to prevent (`lib/utils.ts:4-11`). The package must delete the plain one; unifying the composites onto extended `cn` is a (low) visual-risk change owned by the composites slice.
3. **shadcn generator pin:** `components.json` `aliases.utils = "@/lib/utils"` (components.json:15, alongside `ui: "@/components/ui"`). Any future `shadcn add` regenerates against the app alias. The extracted package needs its own `components.json` (or documented no-generator policy) or the crossing re-grows.
4. **Unpinned `"latest"` runtime deps:** `class-variance-authority`, `clsx`, `tailwind-merge` (`package.json:163,164,172`). Behind Button (cva) and all 14 `cn` consumers. Must be pinned before publishing; a floating tailwind-merge major could silently change class-conflict resolution → visual drift across the whole surface. Radix packages are exact-pinned (package.json:146-157), `sonner` 2.0.7, `lucide-react` 0.522.0.
5. **Barrel state (`src/components/ui/index.ts`):** re-exports all 15 primitive files — no gaps for components. Two shape smells: (a) `export { toast } from "sonner"` (index.ts:13) — a value re-export of an external package from the primitives barrel, consumed by `app/hooks/useToast.ts` and `sonner.stories.tsx`; decide keep-as-API vs. have consumers import `sonner` directly. (b) `useThemeFromClass` is exported from `sonner.tsx:88` but NOT via the barrel — a theme hook living in (and deep-imported out of) a component file; see Toaster row.
6. **Token/CSS contract every row depends on:** the custom utilities in these classlists (`text-data`, `text-label`, `bg-input-background`, `border-subtle`, `border-strong`, `bg-popover` palette, ring tokens) exist only through `src/index.css` `@theme inline` (index.css:21-68), and the overlay primitives use `tw-animate-css` utilities (`animate-in/out`, `fade-*`, `zoom-*`, `slide-in-*`: dialog.tsx:25,43; dropdown-menu.tsx:48,66; popover.tsx:25-26; select.tsx:83; tooltip.tsx:25-26). The package CSS entry must carry the `@theme` block + `@import "tw-animate-css"` or every overlay animates/renders wrong. Story `Demo` scaffolding also uses token utilities (`bg-background text-foreground`, `bg-card border-border`) — Tailwind v4 content scan must include the story files or scaffolding backdrops lose styling (storybook-oracle §5).
7. **Story corpus properties (all 16):** CSF3 `satisfies Meta` + `StoryObj<typeof meta>`; title `primitives/<Name>` (grouping authority for the ds sync — must be preserved); ZERO per-story decorators/parameters; all component imports via the `@/components/ui` barrel (FieldRow additionally `@/ui/components/fields`); module-scope `Demo`/fixture scaffolding (stable identities, keyed lists where mapped — scroll-area.stories.tsx:70 `key={name}`). Relocation cost = recreate the `@` alias or rewrite specifiers; no other app tie in any of the 16 story files.
8. **React 19 modernization (optional, group-wide):** all 13 forwardRef-style primitives use `React.forwardRef` (legacy under React 19's ref-as-prop). No rendered-output change if migrated, but it churns all files against the 46-story oracle — recommend deferring to a post-extraction pass, not the move itself.
9. **Correction to theme-token.md §5.2:** `scroll-area.tsx` does NOT use the `.custom-scrollbar` global class — it appears only in a doc comment (scroll-area.tsx:8). The Radix thumb is styled inline via tokens (scroll-area.tsx:43). `.custom-scrollbar` remains a real dependency of composites/panels files, not of any primitive.

---

## Per-component rows

### 1. Button — `src/components/ui/button.tsx` (61 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react, `@radix-ui/react-slot` (v), `class-variance-authority` (v `cva` + t `VariantProps`), `@/lib/utils` cn (button.tsx:1-5). No app/domain/state imports. Exports `Button`, `buttonVariants`, `ButtonProps` — all barrel-exported (index.ts:14).
- **Crossings:** `@/lib/utils` (value; drags clsx+tailwind-merge only, runtime; remedy move-with).
- **External:** react ^19.2.4, @radix-ui/react-slot 1.2.5, class-variance-authority **"latest" (unpinned)**, clsx+tailwind-merge via cn **"latest" (unpinned)**.
- **Cleanups:** none file-specific (shared §3, §4 apply).
- **Story** (`button.stories.tsx`): imports `@/components/ui` barrel + lucide-react (Dices, Play); 3 stories (Variants/Sizes/States); module-scope `Demo` backdrop; no portal, no override.
- **Risks:** cva unpinned — a future `latest` resolution could alter variant class emission (shared §4).

### 2. Checkbox — `src/components/ui/checkbox.tsx` (33 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react, `@radix-ui/react-checkbox` (v), lucide-react `Check` (v), cn (checkbox.tsx:1-5).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-checkbox 1.3.4, lucide-react 0.522.0, cn transitives.
- **Cleanups:** `cn("flex items-center justify-center text-current")` wraps a single static string (checkbox.tsx:26) — pointless runtime merge call; inline the literal. Zero output change (identical class string).
- **Story** (`checkbox.stories.tsx`): barrel import (Checkbox, Label); 4 stories incl. label pairing; Demo backdrop; no portal. Known ds false-positive `[RENDER_BLANK]` on bare form controls (sync NOTES.md:128-131) — expected, screenshot is the judge.
- **Risks:** none beyond shared.

### 3. Dialog — `src/components/ui/dialog.tsx` (107 lines, read in full) [card override: single 680x360]
- **Tier: clean.** Checked: entire file (10 exports: Root/Trigger/Portal/Close/Overlay/Content/Header/Footer/Title/Description). Imports = react, `@radix-ui/react-dialog` (v), lucide-react `X` (v), cn (dialog.tsx:1-5).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-dialog 1.1.16, lucide-react 0.522.0, cn transitives; tw-animate-css utilities (dialog.tsx:25,43 — shared §6).
- **Cleanups:** none file-specific. (DialogContent hardcodes overlay + close button — canonical shadcn shape, keep.)
- **Story** (`dialog.stories.tsx`): barrel import only; single story `SavePreset` rendered **uncontrolled `defaultOpen`** with full compound structure (dialog.stories.tsx:28) — portal surface up on first paint; ds card override single 680x360. Portal-dialog capture limit applies (manual verify on repoint).
- **Risks:** none beyond shared §6 (animation CSS must travel).

### 4. DropdownMenu — `src/components/ui/dropdown-menu.tsx` (193 lines, read in full) [card override: single 420x460]
- **Tier: clean.** Checked: entire file (15 exports). Imports = react, `@radix-ui/react-dropdown-menu` (v), lucide-react `Check, ChevronRight, Circle` (v), cn (dropdown-menu.tsx:1-5).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-dropdown-menu 2.1.17, lucide-react 0.522.0, cn transitives; tw-animate-css (dropdown-menu.tsx:48,66).
- **Cleanups:** none file-specific.
- **Story** (`dropdown-menu.stories.tsx`): barrel import + lucide `ChevronDown`; single story `PresetActions` rendered **forced controlled `<DropdownMenu open>`** (dropdown-menu.stories.tsx:28); portal; ds override single 420x460.
- **Risks:** none beyond shared.

### 5. Input — `src/components/ui/input.tsx` (31 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react + cn ONLY (input.tsx:1-3).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, cn transitives.
- **Cleanups:** none.
- **Story** (`input.stories.tsx`): barrel (Input, Label); 4 stories; Demo backdrop; no portal. `[RENDER_BLANK]` false positive class applies.
- **Risks:** none beyond shared.

### 6. Label — `src/components/ui/label.tsx` (25 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react, `@radix-ui/react-label` (v), cn (label.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-label 2.1.9, cn transitives.
- **Cleanups:** none.
- **Story** (`label.stories.tsx`): barrel (Checkbox, Input, Label, Switch); 4 stories pairing label with controls; Demo backdrop; no portal.
- **Risks:** none beyond shared.

### 7. Popover — `src/components/ui/popover.tsx` (35 lines, read in full) [card override: single 460x360]
- **Tier: clean.** Checked: entire file (Root/Trigger/Anchor/Content). Imports = react, `@radix-ui/react-popover` (v), cn (popover.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-popover 1.1.16, cn transitives; tw-animate-css (popover.tsx:25-26).
- **Cleanups:** none.
- **Story** (`popover.stories.tsx`): barrel + lucide `SlidersHorizontal`; single story `OverlayOpacity` rendered **`defaultOpen`** (popover.stories.tsx:20); portal; ds override single 460x360.
- **Risks:** none beyond shared.

### 8. ScrollArea — `src/components/ui/scroll-area.tsx` (48 lines, read in full)
- **Tier: clean.** Checked: entire file (ScrollArea + ScrollBar, both barrel-exported index.ts:48). Imports = react, `@radix-ui/react-scroll-area` (v), cn (scroll-area.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-scroll-area 1.2.11, cn transitives.
- **Cleanups:** doc comment references the app-global `.custom-scrollbar` class (scroll-area.tsx:8) — comment-only, NO code dependency (correction to theme-token.md §5.2); reword on move so the package doc doesn't cite an app stylesheet.
- **Story** (`scroll-area.stories.tsx`): barrel import; single story `PresetList`; module-scope 15-item fixture, keyed map (`key={name}`, scroll-area.stories.tsx:70); fixed 160px viewport forces overflow; no portal.
- **Risks:** none beyond shared.

### 9. Select — `src/components/ui/select.tsx` (169 lines, read in full) [card override: single 420x460]
- **Tier: clean.** Checked: entire file (10 exports). Imports = react, `@radix-ui/react-select` (v), lucide-react `Check, ChevronDown, ChevronUp` (v), cn (select.tsx:1-5).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-select 2.3.0, lucide-react 0.522.0, cn transitives; tw-animate-css (select.tsx:83).
- **Cleanups:** none file-specific.
- **Story** (`select.stories.tsx`): barrel import; single story `MapSize` rendered **`defaultOpen` + controlled `value="standard"`** (select.stories.tsx:20); portal; ds override single 420x460.
- **Risks:** none beyond shared.

### 10. Separator — `src/components/ui/separator.tsx` (28 lines, read in full) [card override: column]
- **Tier: clean.** Checked: entire file. Imports = react, `@radix-ui/react-separator` (v), cn (separator.tsx:1-4). Uses custom token utility `bg-border-subtle` (separator.tsx:19 — shared §6).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-separator 1.1.9, cn transitives.
- **Cleanups:** none.
- **Story** (`separator.stories.tsx`): barrel import; 2 stories (Horizontal card sections / Vertical toolbar hairlines); Demo backdrop; no portal; ds override column.
- **Risks:** none beyond shared.

### 11. Switch — `src/components/ui/switch.tsx` (36 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react, `@radix-ui/react-switch` (v), cn (switch.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-switch 1.3.0, cn transitives.
- **Cleanups:** none. (Thumb `cn()` call at switch.tsx:27-30 merges two static strings — same static-literal pattern as Checkbox; harmless, can inline in the same sweep.)
- **Story** (`switch.stories.tsx`): barrel (Label, Switch); 4 stories; Demo backdrop; no portal.
- **Risks:** none beyond shared.

### 12. Tabs — `src/components/ui/tabs.tsx` (60 lines, read in full) [card override: column]
- **Tier: clean.** Checked: entire file (Root/List/Trigger/Content). Imports = react, `@radix-ui/react-tabs` (v), cn (tabs.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-tabs 1.1.14, cn transitives.
- **Cleanups:** none.
- **Story** (`tabs.stories.tsx`): barrel import; 2 stories (RecipePanel 3-tab / MapPipeline 2-tab, differing `defaultValue`); Demo backdrop; no portal; ds override column.
- **Risks:** none beyond shared.

### 13. Textarea — `src/components/ui/textarea.tsx` (28 lines, read in full) [card override: column]
- **Tier: clean.** Checked: entire file. Imports = react + cn ONLY (textarea.tsx:1-3).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, cn transitives.
- **Cleanups:** none.
- **Story** (`textarea.stories.tsx`): barrel (Label, Textarea); 3 stories; module-scope JSON-string fixture; Demo backdrop; no portal; ds override column. `[RENDER_BLANK]` false-positive class applies.
- **Risks:** none beyond shared.

### 14. Tooltip — `src/components/ui/tooltip.tsx` (35 lines, read in full) [card override: single 400x240]
- **Tier: clean.** Checked: entire file (Provider/Root/Trigger/Content). Imports = react, `@radix-ui/react-tooltip` (v), cn (tooltip.tsx:1-4).
- **Crossings:** `@/lib/utils` (value; move-with).
- **External:** react, @radix-ui/react-tooltip 1.2.9, cn transitives; tw-animate-css (tooltip.tsx:25-26).
- **Cleanups:** none file-specific. Usage contract to carry into package docs: host must mount `TooltipProvider` once — absence renders tooltip consumers **silently blank, no console error** (sync NOTES.md:25; carried today in cfg.provider + `.storybook/preview.tsx` + conventions.md).
- **Story** (`tooltip.stories.tsx`): barrel import + lucide `Dices`; single story `ReRoll` **self-provides `TooltipProvider` + forced `<Tooltip open>`** (tooltip.stories.tsx:22-23) — deliberately independent of the global decorator; portal; ds override single 400x240.
- **Risks:** none beyond shared; provider contract is the operational risk on any preview-shell change.

### 15. Toaster — `src/components/ui/sonner.tsx` (89 lines, read in full) [card override: single, primaryStory "Notifications"]
- **Tier: clean.** Checked: entire file. Imports = react + `sonner` (v `Toaster as Sonner` + t `ToasterProps`) ONLY (sonner.tsx:1-2). No cn, no `@/` import at all — **zero boundary crossings**. Token binding is via inline CSS vars (`--normal-bg: hsl(var(--popover))` etc., sonner.tsx:69-71) + tailwind group classnames (sonner.tsx:75-81).
- **Crossings:** none.
- **External:** react, sonner 2.0.7.
- **Cleanups (the group's biggest):**
  1. **Duplicated theme-reading logic** — `useThemeFromClass` (sonner.tsx:21-58) is a functionally identical private duplicate of `src/ui/hooks/useResolvedTheme.ts` (same MutationObserver subscribe, same `.dark`/`.light`/`color-scheme` snapshot, same `"dark"` SSR snapshot; both verified by read). The package should ship ONE hook (`useResolvedTheme`, already dependency-free) and `sonner.tsx` should consume it. Plausible original motive: keeping `components/ui` free of `src/ui` imports — the unsettled dependency direction between the two component trees; the package merge dissolves that excuse.
  2. **Hook exported from a component file, off-barrel** — `export { Toaster, useThemeFromClass }` (sonner.tsx:88); the barrel exports only `Toaster` (index.ts:62); `test/ui/sonnerTheme.test.tsx:5` deep-imports the hook by file path. On unification the test must repoint at the package hook (behavioral coverage worth keeping: it pins `.dark`/`.light`/`color-scheme` resolution + resubscribe semantics).
- **Story** (`sonner.stories.tsx`): imports `Toaster, toast` from the barrel (toast is the sonner re-export, index.ts:13); story does NOT mount its own Toaster — a `ToastDemo` component fires `toast.success/info/error` in a mount `useEffect` (sonner.stories.tsx:22-38) and **relies on the global preview decorator's `<Toaster/>`** (preview.tsx). A package Storybook must keep Toaster in its decorator or `Notifications` renders an empty stage. ds override: cardMode single + primaryStory "Notifications".
- **Risks:** hook unification changes Toaster's theme-code path (not its logic) — verify with `test/ui/sonnerTheme.test.tsx` + the Notifications story capture; logic is line-equivalent so no visual delta expected, but this IS a rendered-output-adjacent edit (theme prop selection) → flag to the story oracle.

### 16. FieldRow — `src/ui/components/fields/FieldRow.tsx` (13 lines, read in full)
- **Tier: clean.** Checked: entire file. Imports = react ONLY (FieldRow.tsx:1). Static classlist, one prop (`children`). Zero crossings.
- **Crossings:** none.
- **External:** react.
- **Cleanups:** typed as `React.FC<FieldRowProps>` (FieldRow.tsx:10) — the only component in the group using the `React.FC` style; align with the group's explicit-props convention on move (no output change). List-rendered by `rjsfTemplates.tsx` per form field, but it is a single static div — memo NOT warranted.
- **Story** (`FieldRow.stories.tsx`): imports `@/ui/components/fields` barrel + `@/components/ui` (Input, Switch); CSF3 required-args cast trick `args: {} as unknown as ComponentProps<typeof FieldRow>` (FieldRow.stories.tsx:16); 2 stories; Demo card substrate; no portal.
- **Risks:** none. **Placement note:** grouped `primitives` by story title but homed in the composites tree (`src/ui/components/fields/`), and deliberately NOT re-exported by `.design-sync/ds-entry.tsx` (it flows via the `./fields` sub-barrel through `@/ui/components/index`; re-export would collide — sync NOTES.md:13). A single package barrel dissolves the collision hazard; the story's `@/ui/components/fields` specifier must follow wherever FieldRow lands.

---

## Summary table

| # | Component | Tier | Crossings | Remedy | Output-affecting cleanup? |
|---|---|---|---|---|---|
| 1 | Button | clean | `@/lib/utils` cn (v) | move-with | no |
| 2 | Checkbox | clean | cn (v) | move-with | no (static-string inline is byte-identical) |
| 3 | Dialog | clean | cn (v) | move-with | no |
| 4 | DropdownMenu | clean | cn (v) | move-with | no |
| 5 | Input | clean | cn (v) | move-with | no |
| 6 | Label | clean | cn (v) | move-with | no |
| 7 | Popover | clean | cn (v) | move-with | no |
| 8 | ScrollArea | clean | cn (v) | move-with | no |
| 9 | Select | clean | cn (v) | move-with | no |
| 10 | Separator | clean | cn (v) | move-with | no |
| 11 | Switch | clean | cn (v) | move-with | no |
| 12 | Tabs | clean | cn (v) | move-with | no |
| 13 | Textarea | clean | cn (v) | move-with | no |
| 14 | Tooltip | clean | cn (v) | move-with | no |
| 15 | Toaster | clean | — | — | theme-hook unification (logic-equivalent; flag to oracle) |
| 16 | FieldRow | clean | — | — | no |
