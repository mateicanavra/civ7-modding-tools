## Design

This is an additive infrastructure slice. It introduces the canonical primitive
library the rest of the redesign assembles from; it changes no runtime behavior
and swaps no call site.

## Location And Coexistence

The new library lives at `apps/mapgen-studio/src/components/ui/` — distinct from
the legacy `apps/mapgen-studio/src/ui/components/ui/`. The two coexist
deliberately: the migration that retires the legacy primitives and removes the
`lightMode` prop is a later slice (P3/P4). Keeping the new library on a separate
path lets the build prove the new components compile without forcing a
risky big-bang swap.

## Token Discipline

Every primitive consumes only design-system tokens via Tailwind utilities:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-input-background`,
  `bg-muted`, `bg-accent`, `bg-primary`, `bg-destructive`.
- Borders: `border-border`, `border-input`, `border-subtle`, `border-strong`.
- Text: `text-foreground`, `text-muted-foreground`, `text-popover-foreground`,
  `text-primary-foreground`, `text-data`, `text-label`.
- Focus: the `ring` token (`--ring`) as a 1px luminance contour, never a
  saturated glow block.

No hex literals, no `dark:` variants, no `lightMode` prop. Theming flips through
the single `.dark` class on `<html>`; even the sonner Toaster reads that class
(via a class MutationObserver) instead of next-themes or `prefers-color-scheme`.

## Depth Strategy

Borders-only for chrome. Shadows appear ONLY on floating layers
(dialog/popover/dropdown/tooltip/select content/toast), which also take the 8px
(`rounded-lg`) radius. In-surface controls take the 4px (`rounded-sm`) radius.
This keeps the substrate-elevation hierarchy felt rather than seen.

## Signature

- Focus renders as the `--ring` contour (`focus-visible:ring-1
  focus-visible:ring-ring`), offset so it reads as a drawn line.
- Active/selected states are contours, not slabs: the active Tab is a 1px
  primary underline rule; the one filled action is the primary Button.

## Named Type Scale And tailwind-merge

`system.md` mandates a named type scale to replace ad-hoc `text-[11px]`. The
foundation slice did not yet define it, so this slice adds `--text-data` (11px)
and `--text-label` (10px) as `@theme` font-size tokens. Because tailwind-merge's
default config does not know these custom font-size utilities, it would treat
`text-data` as a generic `text-*` class and let a later color utility
(`text-foreground`) clobber the size when both pass through `cn`. The fix
registers `text-data`/`text-label` in tailwind-merge's `font-size` class group
so size and color resolve independently. This was caught during preview
verification (computed font fell back to 16px) and corrected before close.

## Parity Boundary

No map generation, deck.gl, recipe semantics, run-in-game, live-runtime poll
gating, localStorage schema, or browserRunner gating is touched. The `cn` change
only adds a class group; existing call sites (which use `text-[11px]` arbitrary
values and standard utilities) keep their exact prior merge behavior.
