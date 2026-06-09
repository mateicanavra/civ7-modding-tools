## Design

This is a presentation-only migration slice. It moves the shell/chrome off the
legacy hand-rolled primitives and ad-hoc hex palette onto the design system
tokens and the new `src/components/ui` primitives. No runtime logic changes —
refactors MOVE styling and swap primitive mechanisms; they do not rewrite
behavior.

## Token Mapping

The shell encoded its surfaces as a `lightMode ? '<light hex>' : '<dark hex>'`
ternary per class. Because the design tokens already carry both themes (light in
`:root`, dark in `.dark`), each ternary collapses to one token utility:

| Legacy (dark / light) | Token |
| --- | --- |
| `bg-[#141418]/95` / `bg-white/95` (floating dock) | `bg-popover/95` |
| `bg-[#16161d]/90` / `bg-white/90` (brand pill) | `bg-popover/90` |
| `border-[#2a2a32]` / `border-gray-200` | `border-border` |
| `border-[#222228]` / `border-gray-100` (subtle) | `border-subtle` |
| `bg-[#0f0f12]` / `bg-gray-50` (sunken JSON) | `bg-surface-sunken` |
| `text-[#e8e8ed]` / `text-[#1f2937]` (primary) | `text-foreground` |
| `text-[#8a8a96]` / `text-[#6b7280]` (secondary) | `text-muted-foreground` |
| `text-[#5a5a66]` / `text-[#9ca3af]` (tertiary) | `text-muted-foreground/70` |
| `hover:bg-[#1a1a1f]` / `hover:bg-gray-50` | `hover:bg-accent` |
| `bg-[#222228]` / `bg-gray-200` (active) | `bg-muted` |
| `accent-[#64748b]` (range slider) | `accent-primary` |

The floating chrome docks ride the `popover` tier deliberately: they float above
the deck.gl map (with `backdrop-blur`), and `popover` is the system's
floating-layer surface. Nested sunken surfaces (the JSON config view) use
`surface-sunken`; text inputs use `input-background`.

## Accent Discipline

`system.md` mandates ONE elevated cool-steel slate accent. The shell previously
used orange (`ring-orange-400`, `border-orange-400`, `text-orange-500`) for two
distinct jobs:

- **Chrome identity** — the dirty/modified ring on Run, the active auto-run
  toggle, focus emphasis. These move to the slate `primary`/`ring` tokens, since
  they are instrument identity.
- **Live-stale emphasis** — the "your Studio state is stale vs the live game"
  call-to-action. This is a *warning about data*, so it moves to the `warning`
  token rather than `primary`, keeping the slate reserved for identity.

Status dots (running = amber, error = `destructive`, ready/live-ok = `success`)
are semantic data the instrument reports about the map and the live game — the
one place real color belongs in the chrome — so they keep their semantic hues.

## Primitive And Mechanism Swaps

- Shell call sites adopt `@/components/ui` Button/Input/Select/Switch where the
  prop surface matches. The legacy primitives still accept a `lightMode` prop;
  the new ones ignore theme props entirely (they read `.dark`), so the migration
  drops the `lightMode=` pass-through at each migrated site.
- Native `title=` tooltips become the shadcn `Tooltip` (Radix), wrapped by a
  single `TooltipProvider` mounted at the shell root. This gives the chrome real,
  token-styled, delay-grouped tooltips instead of native browser ones.
- The legacy `AlertDialog` (RecipePanel reset confirm, PresetDialogs) migrates to
  the shadcn `Dialog`. The confirm/cancel/destructive semantics are preserved by
  composing `DialogFooter` with Buttons; `onOpenChange` keeps the same
  open-state contract the callers already pass.
- `ToastProvider`/`useToast` migrate to the sonner `Toaster` + the `toast`
  function. The legacy `toast(message, { variant })` call shape maps to
  `toast.success` / `toast.error` / `toast.info` / `toast` so message content and
  trigger points are unchanged.

## Parity Boundary

No map generation, deck.gl math, recipe semantics, run-in-game phases, the
live-runtime poll's staleness/backoff gating, the localStorage schema, or
browserRunner gating is touched. Every change is a class string, a primitive
import, or a dialog/toast call-shape swap. The shell's props, callbacks, and
control flow are untouched.
