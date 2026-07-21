# MapGen Studio — building with this design system

MapGen Studio is a dense, **dark-first "cartographer's instrument"**: a graphite
substrate, one cool-steel **slate** accent, **borders-only** chrome, and a
luminance focus ring. Every component is React, imported from the bundle as
`window.MapGenStudio.<Name>`.

## Setup
- **React 19, vendored.** `_ds_bundle.js` is compiled against the React pair
  shipped at `_vendor/react.js` + `_vendor/react-dom.js` (React 19; components
  call APIs an 18.x runtime lacks). Any page or sheet that loads the bundle
  must put those two on the page as plain `<head>` scripts **before** any
  runtime that would fetch its own React (for `.dc.html` sheets: before
  `./support.js`, in `<head>` — helmet scripts race the runtime's async React
  fetch and lose nondeterministically). "React on the page" always means this
  vendored pair, never a CDN React 18.
- **Dark by default.** Tokens resolve to the studio's dark palette on `:root` —
  no theme prop or wrapper class is needed to get the dark look. (A `.dark` class
  on `<html>` still works for components that read it at runtime, e.g. `Toaster`.)
- **Mount one `TooltipProvider` at the app root.** Any component that uses a
  tooltip — `AppHeader`, `GameConsole`, `RecipePanel`, `ExplorePanel`,
  `ViewControls`, `WaterStatsSection`, and `Tooltip` itself — renders **blank**
  without a `TooltipProvider` ancestor. `AppFooter` self-provides one.
- **Notifications pair `Toaster` with the bundle's own `toast`.** Mount
  `Toaster` once, fire with `window.MapGenStudio.toast(...)` — both ship on
  the barrel so they share one sonner instance. A `toast` imported from
  anywhere else is a second instance whose calls never render.
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

## How this design system is operated

This is a **product design system**: it deliberately carries MapGen Studio's
app-level composites and panels alongside the generic primitives — that is the
point, not a mistake. It is a **library, not a workspace**. The single source
of truth is the repo package `@swooper/mapgen-studio-ui`; everything in the
design-system project is a regenerated build artifact of it, except
`explorations/` and `scraps/`.

- **Work in the design-system project is about evolving the library itself.**
  `explorations/` wears its taxonomy in the file tree (`explorations/README.md`
  indexes every open item): `explorations/proposals/<subject>/` holds candidate
  new components (`legend/new-panel.html`) and before/after changes
  (`recipe-panel/flat-and-flush.html`), nested by design subject;
  `explorations/references/` holds canonical assemblies (`studio-shell.html`);
  `explorations/fixtures/` holds shared data the explorations load. Every
  exploration states its intent, status, and pull-down path in a manifest
  header. Filenames are kebab-case, no spaces.
- **Assemblies that earn reuse graduate into the package.** Graduation yields
  a real slot-based component with a story and a card — `StudioShellLayout` is
  the studio shell; its card files under the `templates` *card group* (the
  Storybook title prefix). The **Templates picker** is a different surface:
  hand-authored `templates/<slug>/` Design Component starting points (see
  `templates/README.md`), which survive every sync. A graduated component
  becomes a picker starting point only when a template wraps it —
  `templates/studio-shell/` mounts `StudioShellLayout` with its slots filled
  from the canonical story fixtures. Start whole-app work from that template;
  don't hand-assemble the chrome.
- **Exploration data can live in the cloud.** `explorations/fixtures/*.js`
  assign onto `window.__dsFixtures` and are loaded via `<script src>`; edit
  them here to reshape a legend/inspector across every proposal that reads
  them, or keep simpler/denser variants for different depths. (The fixtures
  that back graded component *cards* still come from the repo's typed story
  args — those are the sync's oracle and can't move.)
- **Product design happens in consuming projects.** Screens, flows, feature
  concepts, and design-space exploration belong in a Claude Design project
  that attaches this design system (e.g. "App Shell") — never here.
- **The component cards are always the current state.** They are regenerated
  from the repo on every sync. A proposal's "before" is the live render by
  reference, never a maintained snapshot.
- **Nothing converter-owned is hand-edited — ever.** Changing a component
  means changing the package and re-syncing; direct edits outside
  `explorations/`, `templates/`, and `uploads/` are overwritten by the next
  sync. This includes "fixes": if a scan, lint, or design-system check flags
  something in `_ds_bundle.css`, `styles.css`, `_ds_bundle.js`, or
  `components/**`, the finding routes to the repo lane — do not patch the
  artifact in place. In particular, never register `--tw-*` engine variables
  in a `:root` block to satisfy the token scanner: the hoist-to-`:root`
  advice is deliberately refused repo-side (registration is exactly what
  turns Tailwind utility internals into bogus token and theme entries), and
  the curated token surface is owned by the package build.
