# MapGen Studio — building with this design system

MapGen Studio is a dense, **dark-first "cartographer's instrument"**: a graphite
substrate, one cool-steel **slate** accent, **borders-only** chrome, and a
luminance focus ring. Every component is React, imported from the bundle as
`window.MapGenStudio.<Name>`.

## Setup
- **Dark by default.** Tokens resolve to the studio's dark palette on `:root` —
  no theme prop or wrapper class is needed to get the dark look. (A `.dark` class
  on `<html>` still works for components that read it at runtime, e.g. `Toaster`.)
- **Mount one `TooltipProvider` at the app root.** Any component that uses a
  tooltip — `AppHeader`, `GameConsole`, `RecipePanel`, `ExplorePanel`,
  `ViewControls`, `WaterStatsSection`, and `Tooltip` itself — renders **blank**
  without a `TooltipProvider` ancestor. `AppFooter` self-provides one.
- Fonts ship in the bundle: **Inter** (`font-sans`) for UI, **JetBrains Mono**
  (`font-mono`) for data, seeds, and IDs.

## Styling idiom — Tailwind v4 utilities driven by design tokens
Style with token-named utility classes (never raw hex). The vocabulary:

| Role | Classes |
|---|---|
| Surfaces (low→high) | `bg-background` (page) · `bg-surface-sunken` · `bg-card` (panel) · `bg-popover` (floating) · `bg-input-background` (inset) |
| Text | `text-foreground` · `text-muted-foreground` · `text-primary-foreground` |
| Accent / state | `bg-primary` (the one slate accent) · `bg-destructive` · `bg-success` · `bg-warning` · `bg-accent` / `bg-muted` (hover / inset) |
| Borders | `border border-border` · `border-border-subtle` (dividers) · `border-input` |
| Type scale | `text-data` (11px body) · `text-label` (10px uppercase eyebrow) · `font-medium` |
| Focus | `focus-visible:ring-1 focus-visible:ring-ring` (the luminance contour) |

`styles.css` is **pre-compiled** (no Tailwind runs at design time), so use the
token utilities above plus standard layout utilities (`flex`, `gap-*`, `p-*`,
`rounded-lg`, `w-*`…); for one-off arbitrary values, an inline `style` is the
reliable escape hatch.

The idiom: **one filled action** — `<Button>` default is the slate primary;
everything else is a contour (`variant="outline" | "ghost" | "link"`). Floating
layers (dialog / popover / dropdown / tooltip / toast) carry `shadow-lg` on
`bg-popover`. Status color is reserved for data the instrument observes
(`success` / `warning` / `destructive` dots), not chrome. Use `font-mono` for
seeds, IDs, and JSON.

## Where the truth lives
- `styles.css` (and its `@import` closure) — the compiled tokens, utilities, and
  `@font-face` rules. Read it before inventing class names.
- Per component: `<Name>.d.ts` (the exact prop contract) and `<Name>.prompt.md`
  (usage notes + examples). Read these before composing a component.

## Idiomatic snippet
```jsx
const { Button, Input } = window.MapGenStudio;
<div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
  <span className="text-label text-muted-foreground">Seed</span>
  <div className="flex items-center gap-2">
    <Input className="w-32 font-mono" defaultValue="1474829" />
    <Button>Generate map</Button>
    <Button variant="outline">Re-roll</Button>
  </div>
</div>
```
