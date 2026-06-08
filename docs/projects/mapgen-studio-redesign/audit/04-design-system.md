# 04 — Design System & shadcn Migration Audit

**Scope:** `apps/mapgen-studio` — current Tailwind 3.4 + hand-rolled CVA primitives → full canonical shadcn/ui (Radix, `components.json`, formalized tokens).
**Evidence base:** `src/index.css`, `tailwind.config.js`, `src/ui/hooks/useTheme.ts`, `src/ui/components/ui/*`, `src/ui/components/fields/*`, `src/features/configOverrides/rjsf*`, `src/App.tsx`. Companion: `apps/mapgen-studio/system.md` (extracted design language).
**Date:** 2026-06-08.

---

## 0. Three findings that change everything (read first)

1. **Theming is structurally broken, not just inconsistent.** `createTheme()` (`src/ui/hooks/useTheme.ts:130-175`) builds Tailwind classes by **runtime string interpolation** — e.g. `` container: `bg-[${p.bg.page}] text-[${p.text.primary}]` ``. Tailwind 3 JIT scans source statically and **never emits these classes**, so a large chunk of the `Theme` object resolves to class names that don't exist in the stylesheet. The app only looks right because components *also* hardcode the same hex literals directly. This is dead/duplicated infrastructure.

2. **Dark mode uses two conflicting mechanisms.** `tailwind.config.js` has **no `darkMode` key** → Tailwind defaults to `media` (`prefers-color-scheme`). But the app's real dark/light switch is a **`lightMode` boolean prop threaded through 24 files** plus the `Theme` object. The 13 scattered `dark:` utilities key off OS preference while `lightMode` keys off the user's in-app choice → they desync (pick "light" on a dark-OS machine and inputs render with `dark:` styles). shadcn's `.dark` class strategy collapses all of this into one toggle.

3. **The accent declared is not the accent used.** `--color-accent: #5e5ce6` (indigo, `index.css:42`) and `dark.accent: #5e5ce6` (`tailwind.config.js`) are declared as the brand color, but every interactive surface uses **`#4b5563` slate** (19 uses: primary button, switch-on, active tag). The product has no committed accent. This is the #1 reason it reads as commodity.

---

## 1. Token Inventory

### 1a. CSS variables (`src/index.css`)
| Var | Light | Dark (media) | Verdict |
|---|---|---|---|
| `--color-bg-primary` | `#f5f5f7` | `#0a0a12` | → `--background` |
| `--color-bg-secondary` | `#ffffff` | `#16161d` | → `--card` / `--popover` |
| `--color-bg-tertiary` | `#f0f0f2` | `#1f1f28` | → `--muted` / `--secondary` |
| `--color-text-primary` | `#1f2933` | `#e2e2e9` | → `--foreground` |
| `--color-text-secondary` | `#6b7280` | `#7a7a8c` | → `--muted-foreground` |
| `--color-text-muted` | `#9ca3af` | `#6a6a7c` | redundant w/ secondary → fold into `--muted-foreground` |
| `--color-border-primary` | `#e5e7eb` | `#26262e` | → `--border` |
| `--color-border-secondary` | `#d1d5db` | `#32323e` | → `--input` (input border) |
| `--color-accent` | `#4b5563` | `#5e5ce6` | → `--primary` (**resolve light/dark mismatch**) |
| `--color-accent-hover` | `#374151` | `#7472f7` | derive via `--primary` + state, drop |
| `--spacing-xs…xl` (4–32) | — | — | redundant w/ Tailwind scale → **delete** |
| `--radius-sm…xl` (4–12) | — | — | → single shadcn `--radius` (+ derived sm/md/lg) |
| `--transition-fast/normal` | 150/200ms | — | keep as `--duration-*` or Tailwind defaults |

**The values in `index.css` disagree with `useTheme.ts` and `tailwind.config.js`** (e.g. border `#e5e7eb` vs `#e5e5e5` vs `#2a2a32` for dark). `useTheme.ts` is the de-facto truth because components mirror its hex. Consolidate to ONE source: shadcn HSL vars.

### 1b. Tailwind theme extensions (`tailwind.config.js`)
| Extension | Verdict |
|---|---|
| `fontFamily.sans/mono` | **Keep** → maps to `--font-sans` / `--font-mono`. |
| `colors.light.*` / `colors.dark.*` (nested) | **Delete.** Never referenced as `bg-light-bg-primary` anywhere; pure dead config. Replaced by HSL semantic tokens. |
| `spacing.18/88` | Audit usage (near-zero) → likely delete. |
| `borderRadius.xl/2xl` | Replace with shadcn `--radius` derivation. |
| `transitionDuration.150/200` | Redundant (Tailwind ships `duration-150/200`). Delete. |
| `animation/keyframes.pulse-subtle` | Keep (used for running state) — move into shadcn `@theme`/animate config. |

### 1c. Target shadcn token map (the canonical set)

Standard shadcn (Tailwind v3 HSL form shown; v4 uses oklch but same names):

```css
:root {
  --background: 240 9% 96%;        /* #f5f5f7 */
  --foreground: 215 25% 16%;       /* #1f2933 */
  --card: 0 0% 100%;               /* #ffffff */
  --card-foreground: 215 25% 16%;
  --popover: 0 0% 100%;
  --popover-foreground: 215 25% 16%;
  --primary: 220 13% 34%;          /* #4b5563 — OR commit to indigo, see §6 */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 94%;         /* #f0f0f2 */
  --secondary-foreground: 215 25% 16%;
  --muted: 240 5% 94%;
  --muted-foreground: 220 9% 46%;  /* #6b7280 */
  --accent: 240 5% 94%;
  --accent-foreground: 215 25% 16%;
  --destructive: 0 84% 60%;        /* unify rose/red → one */
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 91%;           /* #e5e7eb */
  --input: 220 13% 91%;
  --ring: 220 13% 34%;             /* focus ring = primary */
  --radius: 0.25rem;               /* 4px base — matches `rounded` default */
}
.dark {
  --background: 240 26% 5%;        /* #0a0a0f */
  --foreground: 240 14% 91%;       /* #e8e8ed */
  --card: 240 11% 9%;              /* #141418 */
  --popover: 240 11% 9%;
  --primary: 220 13% 34%;          /* #4b5563 (or indigo #5e5ce6 = 241 75% 64%) */
  --secondary: 240 9% 14%;         /* #222228 */
  --muted: 240 11% 7%;             /* #0f0f12 */
  --muted-foreground: 240 7% 57%;  /* #8a8a96 */
  --border: 240 9% 17%;            /* #2a2a32 */
  --input: 240 9% 17%;
  --ring: 240 9% 25%;              /* #3a3a44 — current focus border */
}
```

Plus the shadcn `cn` util — **already present and correct** at `src/ui/utils/cn.ts` (clsx + tailwind-merge). No change needed; point `components.json` `aliases.utils` at it.

---

## 2. Primitive Migration Table

`components.json` config to target: `style: "new-york"` (matches the dense/tight aesthetic better than "default"), `rsc: false`, `tsx: true`, `tailwind.cssVariables: true`, `aliases.components: "src/ui/components/ui"`, `aliases.utils: "src/ui/utils/cn"`, `iconLibrary: "lucide"` (already the icon set).

| Current primitive | File | shadcn replacement (Radix backing) | a11y / behavior gaps it closes | Call sites to migrate |
|---|---|---|---|---|
| **Button** | `ui/Button.tsx` | `button.tsx` (Slot via `@radix-ui/react-slot`, `asChild`) | adds `asChild` composition (today `AlertDialogTrigger` wraps a bare `<span onClick>` — not focusable, not keyboard-activatable). Keep CVA variants. | 2 files, ~2 JSX + indirect via AlertDialog/dropdowns |
| **Input** | `ui/Input.tsx` | `input.tsx` | drop `lightMode` prop → token classes. | 5 files |
| **Textarea** | `ui/Textarea.tsx` | `textarea.tsx` | same | 1 file |
| **Select** (native) | `ui/Select.tsx` | `select.tsx` (`@radix-ui/react-select`) | **typeahead, keyboard nav, ARIA listbox, portal positioning, scroll-into-view**; native select can't be styled per-option or themed in dark portals. | 5 files |
| **Switch** | `ui/Switch.tsx` | `switch.tsx` (`@radix-ui/react-switch`) | proper `role="switch"`, `aria-checked`, label association without `sr-only` peer hack. | 3 files |
| **Checkbox** | `ui/Checkbox.tsx` | `checkbox.tsx` (`@radix-ui/react-checkbox`) | removes the fragile `onClick→ref.current.click()` re-dispatch (double-fire risk); real indeterminate state, ARIA. | 2 files |
| **AlertDialog** | `ui/AlertDialog.tsx` (300+ ln) | `alert-dialog.tsx` (`@radix-ui/react-alert-dialog`) | **focus trap, Esc-to-close, `aria-modal`, focus restore, scroll-lock, portal**, role=alertdialog. Current impl has none. Trigger is a non-button `<span>`. | 2 files (`RecipePanel`, `PresetDialogs` → 3 dialog instances) |
| **Toast** | `ui/Toast.tsx` | **Sonner** (`sonner`) — shadcn's canonical toast | swipe-dismiss, stacking/queue, `aria-live` region, pause-on-hover, promise toasts. Current is a setTimeout list with no live region. | 1 provider + `useToast`/`showToast` (1 call site each) |
| **Tooltip** | `ui/Tooltip.tsx` | `tooltip.tsx` (`@radix-ui/react-tooltip`) | collision-aware positioning, delay groups, `role="tooltip"` wiring, keyboard/focus parity, portal (current clips inside `overflow-hidden` panels). | **0 component uses today** — but **28 native `title=` attributes** should migrate to it (see Craft #6). |

**Net:** 8 primitives, ~21 import sites, ~5 dialog/toast instances, 28 `title=` upgrades. Low call-site count = **cheap, high-leverage migration** (the surface is small; the win is correctness + polish).

---

## 3. shadcn components to ADD (hand-rolled or missing)

| Component | Radix backing | Where it lands in the app | Replaces / enables |
|---|---|---|---|
| **DropdownMenu** | `@radix-ui/react-dropdown-menu` | RecipePanel Save menu (`RecipePanel.tsx:420-500`), AppHeader Setup menu (`AppHeader.tsx:185+`) | the hand-rolled `fixed inset-0` click-catcher + abs-positioned `<button>` lists. Closes: arrow-key nav, typeahead, Esc, focus return, `role=menu`, collision flip. |
| **Dialog** | `@radix-ui/react-dialog` | PresetSaveDialog (it's a form-in-modal, not a confirm) → currently misusing AlertDialog (`PresetDialogs.tsx`) | proper non-destructive modal w/ form; AlertDialog stays for confirm/delete only. |
| **Popover** | `@radix-ui/react-popover` | inline help/info bubbles, the Setup bar (could be a popover instead of an inline expanding row, `AppHeader.tsx`) | richer-than-tooltip transient panels. |
| **Tabs** | `@radix-ui/react-tabs` | ExplorePanel stage/step/data-type sections; RecipePanel recipe-vs-config | replaces the bespoke collapse/`aria-expanded` group toggles (`ExplorePanel.tsx:445+`) where the relationship is "switch view," not "expand." |
| **Accordion** | `@radix-ui/react-accordion` | RecipePanel collapsible recipe/config sections (`recipeCollapsed`/`configCollapsed` props), ExplorePanel expandable groups | replaces hand-rolled `collapsed`/`expanded` boolean + ChevronDown rotation pattern; adds ARIA + animation. |
| **ScrollArea** | `@radix-ui/react-scroll-area` | both side panels + the long rjsf config form + dialog `<pre>` blocks (`.custom-scrollbar` in `index.css`) | replaces hand-CSS `::-webkit-scrollbar` (non-cross-browser); consistent themed overlay scrollbars. |
| **Separator** | `@radix-ui/react-separator` | the many `border-t`/`w-px h-5` dividers in AppHeader, cards, dropdowns | semantic `role=separator`, orientation; ~10 ad-hoc dividers. |
| **Slider** | `@radix-ui/react-slider` | rjsf `RangeWidget` (currently aliased to NumberWidget — `rjsfWidgets.tsx`), numeric params with min/max (deck.gl view tuning, ViewControls) | real range UX for bounded numeric schema fields instead of a number box. |
| **Command** (cmdk) | `cmdk` + Dialog | **NEW**: ⌘K palette to jump stages/steps/presets/data-types. App already owns a keyboard-shortcut layer (`src/shared/shortcuts/`, `App.tsx:2597-2664` toggles panels) — natural home. | currently nothing; biggest "pro tool" upgrade. |
| **Combobox** (Popover+Command) | composite | AppHeader Config/Leader/Resources selects with long lists (`setupOptions.savedConfigOptions`, `leaderOptions`) | searchable/filterable select; native `<select>` can't search. |
| **Sheet** | `@radix-ui/react-dialog` (side) | mobile/narrow: left RecipePanel + right ExplorePanel as slide-over drawers | the app toggles left/right panels via shortcuts (`toggleLeftPanel`/`toggleRightPanel`, `App.tsx:2551`) — Sheet is the responsive form of that. |
| **Resizable** | `react-resizable-panels` | the 3-pane layout (left panel │ map │ right panel) in `App.tsx` (`leftPanel`/`rightPanel`/deck canvas, ~line 2799-2984) | user-draggable panel widths — currently fixed via `LAYOUT` constants. High-value for a data-explorer. |
| **Skeleton** | (css only) | generation-in-progress / recipe-loading states (see Craft #5) | structured loading instead of opacity pulse. |

---

## 4. rjsf Theming through shadcn

The JSON-schema form is the **largest single surface** (`features/configOverrides/`): `rjsfWidgets.tsx` (widgets) + `rjsfTemplates.tsx` (field/object/array templates) + `ui/components/fields/` (styles). Today it routes through the hand-rolled primitives and a parallel `getFormTheme()`/`getInputStyles()` class-soup that **duplicates** the primitive styling with its own hardcoded hex.

**Strategy — make rjsf a thin adapter over shadcn:**

1. **Widgets → shadcn primitives, drop `lightMode`.** `rjsfWidgets.tsx` already maps `TextWidget/NumberWidget/SelectWidget/CheckboxWidget/SwitchWidget/TextareaWidget/TagSelectWidget` to the `ui/` primitives. Swap each to the shadcn equivalent and **delete the `getLightMode(props)` plumbing and the `lightMode` formContext field** — theming becomes the `.dark` class on `<html>`, so widgets need zero theme awareness. `SelectWidget` should move from native `<select>` to shadcn `Select` (build `SelectTrigger/Content/Item` from `enumOptions`). `RangeWidget` → shadcn `Slider`. `TagSelectWidget` (the hand-rolled pill multiselect) → shadcn `ToggleGroup` (`@radix-ui/react-toggle-group`) for real `aria-pressed` group semantics + roving focus.

2. **Templates → tokens + shadcn surfaces.** `rjsfTemplates.tsx` `getFormTheme()` returns ~10 class strings per mode (card/nested/divider/label/button…). **Delete it entirely** and replace with token classes: `card` → `bg-card border-border`, `nested` → `bg-muted border-border`, `label` → `text-muted-foreground`, `divider` → `Separator`, the inline `<button>Add</button>` and array-item wrappers → shadcn `Button variant="outline" size="sm"` and `Card`. The stage `<section className="rounded-lg border p-2.5">` becomes a shadcn `Card`. Errors (`text-rose-400`) → `text-destructive` (unifies with the rest of the app, which uses `red`).

3. **`fields/styles.ts` + `fields/*Field.tsx` are a third parallel system** — `getInputStyles(lightMode)` re-implements input/select/label classes that the primitives already own. These hand-fields appear largely unused vs the rjsf path; **audit and delete** the duplicate (consolidate to rjsf-widgets-over-shadcn). One styling source, not three.

4. **Scrolling + density:** wrap the form body in shadcn `ScrollArea`; keep the dense `py-1` field rhythm but express it as a `FieldRow` built on shadcn `Label` + token spacing (preserve the 11px/`min-w-[96px]` label column — that density is the design DNA, keep it).

5. **a11y wins for free:** rjsf gives every field an `id`; pairing with shadcn `Label htmlFor` + Radix descriptions wires `aria-describedby` for the `gs.comments`/description/help/error blocks that are currently plain `<div>`s with no association.

Net: rjsf collapses from **3 styling systems (widgets + templates + fields/styles) to 1** (shadcn tokens), and loses the `lightMode` prop entirely.

---

## 5. Craft Findings (top 15)

Ordered by visual leverage.

1. **Commit to an accent (highest leverage).** App declares indigo `#5e5ce6`, uses slate `#4b5563`. Pick one and use it for primary action, focus ring, active state, switch-on, selection. A single deliberate accent is the difference between "a dark dashboard" and "*this* tool." → `--primary` / `--ring`.
2. **Real focus rings.** Today: `ring-1 ring-gray-400` (Button) / border-color shift (inputs) — a thin gray that's nearly invisible on `#0f0f12`. shadcn pattern: `ring-2 ring-ring ring-offset-2 ring-offset-background` in the accent color. Makes keyboard nav legible and on-brand.
3. **Dead overlay motion → real motion.** `animate-in fade-in-0 zoom-in-95` is sprinkled on dialog/toast/tooltip but **no `tailwindcss-animate` plugin is installed**, so they don't animate. Add `tailwindcss-animate` (v3) / `tw-animate-css` (v4); Radix `data-[state]` + these classes give the enter/exit the code already asks for.
4. **Hover/active/disabled depth.** Buttons have hover but many surfaces (dropdown rows, tags, list items) only shift background flatly. Add a 75ms `transition-colors` + a pressed `active:` darken + `active:scale-[0.98]` on primary actions for tactility. Disabled is uniformly `opacity-50` (lazy) — give disabled a distinct muted token treatment, not just transparency.
5. **Loading state is an opacity pulse.** `animate-pulse-subtle` (whole-element fade) is the only loading affordance, and generation can be slow. Add shadcn **Skeleton** rows for the recipe/config form and an inline progress indicator for the deck.gl generation phase. Structured > pulsing.
6. **28 native `title=` tooltips.** Browser tooltips are slow, unstyled, untouchable on mobile, and break the dark aesthetic. Migrate to Radix Tooltip (with a `TooltipProvider` delayDuration group). This alone lifts perceived polish across the header/controls.
7. **Empty states are absent.** No "no presets yet" / "no results" / "select a stage to begin" treatments — empty selects and lists just render blank. Add quiet centered empty states (icon + 11px muted line + optional action).
8. **Toast → Sonner.** Current toast has no `aria-live` (screen-reader silent), no stacking discipline, no swipe. Sonner is the shadcn-canonical answer and looks intentional out of the box.
9. **Dark-mode correctness.** The `lightMode`-prop vs `dark:`-utility vs broken `createTheme()` triad means dark mode is partially wrong in mixed-OS scenarios. Moving to `.dark` class makes it *one* correct switch. This is correctness, but it reads as craft because edges stop glitching.
10. **Destructive color is inconsistent** (`rose-400` in forms, `red-500/600` in buttons, `red-600` in delete menu). Unify to `--destructive`. Inconsistent error color is a classic commodity tell.
11. **Scrollbars are bespoke + Chromium-only.** `.custom-scrollbar` uses `::-webkit-scrollbar` (invisible in Firefox). Radix ScrollArea gives a themed overlay scrollbar everywhere; also lets you keep the "hide thumb until hover" behavior intentionally.
12. **Selection/active affordance is weak.** Active tag/stage = slate fill only. Add a left accent bar or ring for the selected stage/step so the user always knows "where am I" in a dense list.
13. **Hand-rolled dropdowns trap nothing.** The Save/Setup menus close on outside-click but don't trap focus, don't return focus to the trigger, and aren't arrow-navigable. Radix DropdownMenu fixes all three — invisible craft that experts feel immediately.
14. **Typography hierarchy leans on size alone.** 11 vs 10px is a thin gap; pair size with weight + `text-muted-foreground` opacity tiers so hierarchy survives squint-test. Eyebrow labels already do this well (uppercase+tracking) — extend the discipline to card titles vs body.
15. **Fonts are render-blocking Google `@import`.** `index.css` `@import url(fonts.googleapis…)` blocks first paint. Self-host Inter + JetBrains Mono (or `<link rel=preconnect>` + `font-display:swap`) — a perf/polish win on a tool people open all day.

---

## 6. Tailwind v3 → v4 Decision

**Recommendation: migrate to Tailwind v4, do it as part of the shadcn init (one cutover), not as a separate later step.**

Rationale:
- **shadcn fully supports v4** (confirmed current: `@theme` directive, `@theme inline`, oklch token defaults, all components updated, React 19 support). This app is already on **React 19.2** and **Vite 7** — the exact stack v4 targets. Initializing shadcn on v3 now means a forced second migration later.
- v4 deletes most of `tailwind.config.js` (CSS-first `@theme` in `index.css`) — which is desirable here because the config is mostly **dead** (nested `colors.light/dark` unused, redundant spacing/radius/duration). We're rewriting `index.css` and gutting the config regardless; doing it once into v4 form is strictly less work than v3-then-v4.
- v4's `@import "tailwindcss"` + `@theme` is where shadcn's token model is heading; staying on v3 means living on the legacy `tailwind.config.js` + `:root{}`/`@media` HSL path that shadcn now treats as the older flow.

**Migration cost (moderate, mostly mechanical):**
- Replace `@tailwind base/components/utilities` → `@import "tailwindcss";` in `index.css`. **Low.**
- Move `fontFamily`, `pulse-subtle` keyframes, radius into `@theme` block; delete the rest of `tailwind.config.js`. **Low** (config is largely dead).
- PostCSS: swap to `@tailwindcss/postcss` (or `@tailwindcss/vite` plugin — cleaner with Vite 7). Drop `autoprefixer`/`postcss` deps v4 bundles. **Low.**
- Tokens: author as **oklch** (v4 default) instead of HSL — one-time conversion of the §1c values. **Low–medium.**
- Breaking-change sweep: v4 renames a few utilities (`shadow-sm`→`shadow-xs` etc.), changes default ring width (1px→ none/`ring` now 1px), and removes deprecated opacity-shorthand. The app uses a **small, modern utility set** (no legacy opacity utils found), so exposure is **small**. Budget a focused pass over `shadow-*`, `ring-*`, and `outline` (the `*:focus-visible{outline}` reset in `index.css` interacts with v4 ring changes). **Medium, time-boxed.**
- Run the official `npx @tailwindcss/upgrade` codemod first to catch the mechanical bits.

**Risk if we stay on v3:** you ship the redesign on the legacy path and re-migrate within a year — paying the breaking-change sweep twice and authoring tokens in HSL then oklch. Net: **v4 now is lower total cost** given the stack is already v4-ready and the config is disposable.

---

## 7. Sequenced execution (suggested)
1. Migrate Tailwind v3→v4 (codemod + token rewrite to oklch shadcn vars) + `darkMode` via `.dark` class; delete dead config. *(unblocks everything)*
2. `shadcn init` (`components.json`, `new-york`, point utils at existing `cn.ts`); add `tailwindcss-animate`/`tw-animate-css`.
3. Replace 8 primitives (≈21 sites) — Button/Input/Textarea/Select/Switch/Checkbox/AlertDialog/Tooltip; Toast→Sonner.
4. Rip out `lightMode` prop (24 files) + delete broken `createTheme()` interpolation + `fields/styles.ts` duplicate.
5. rjsf: widgets→shadcn, delete `getFormTheme`/`getInputStyles`, errors→`--destructive`.
6. Add layout/nav components: DropdownMenu (Save/Setup), Accordion/Tabs (panels), ScrollArea, Separator, Resizable (3-pane), Sheet (responsive), Command (⌘K), Slider (RangeWidget).
7. Craft pass: accent commit, focus rings, motion, skeletons, empty states, Tooltip-ify 28 `title=`, self-host fonts.

---

## One-screen summary

**Token map at a glance**
```
#f5f5f7/#0a0a0f → --background      #1f2933/#e8e8ed → --foreground
#ffffff/#141418 → --card,--popover  #6b7280/#8a8a96 → --muted-foreground
#e5e7eb/#2a2a32 → --border,--input   #4b5563(↔#5e5ce6) → --primary,--ring  ⚠ pick ONE
rose/red mix     → --destructive     4px base → --radius(0.25rem)
DELETE: createTheme() runtime-interpolated classes (broken), colors.light/dark config (dead),
        --spacing-*/--radius-* CSS vars (redundant), lightMode prop (24 files), fields/styles.ts
THEMING: media-query + lightMode-prop + broken Theme obj  →  single .dark class
```

**Primitive migration:** 8 primitives → Radix-backed shadcn (+Sonner for toast), ≈**21 import sites + 5 dialog/toast instances + 28 `title=`→Tooltip**. Small surface, high correctness gain (focus trap, ARIA, keyboard nav all currently missing).

**Top 3 craft upgrades (most leverage):**
1. **Commit to one accent** (indigo or slate) across primary/focus/active/selection — the single change that moves it from commodity-dark to branded.
2. **Real focus rings + working overlay motion** (`ring-2 ring-ring ring-offset` + install the animate plugin the dead `animate-in` classes already expect).
3. **Migrate 28 native `title=` to Radix Tooltip + Toast→Sonner** — instant perceived-polish lift across the whole chrome.

**Tailwind:** go **v4 now** (stack is React 19 + Vite 7, shadcn supports it, config is mostly dead → cheaper than v3-then-v4 later).
