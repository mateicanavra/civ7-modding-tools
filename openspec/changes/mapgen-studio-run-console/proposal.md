## Why

Two defects observed live (2026-06-11):

1. **Two simultaneous "Run" primary CTAs** — one at the bottom of the recipe
   panel, one in the footer run console. A duplicated primary action splits
   attention and muddles the chrome's story about where running happens. The
   footer already *is* the run console: it owns seed, re-roll, auto-run,
   Run in Game, and run status.
2. The footer's last-run summary renders `123 · Standard · 6p · Bal` — "Bal" is
   a deliberate abbreviation (`formatResourceMode`) but reads as accidental
   truncation next to the unabbreviated "Standard".

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (issues 6–7)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-2 amendment: "One Run CTA. The footer is the run console")
- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 behavior parity — run semantics unchanged)

## What Changes

- **RecipePanel loses its Run button.** Its footer row keeps **Save & Deploy**
  (now the row's full-width action). The `onRun`/`isRunning`/dirty-ring plumbing
  that existed only for that button is removed from `RecipePanel`'s props and
  from `StudioShell`'s wiring of it; the run path itself is untouched (the footer
  Run triggers the exact same handler).
- **The footer Run carries the dirty affordance.** The "config changed since last
  run" emphasis (ring) that lived on the panel Run moves to the footer Run so the
  signal is not lost; the footer's existing "Modified" status chip stays.
- **`formatResourceMode('balanced')` returns "Balanced"** (and the other modes
  their full words) — the footer has the space, and the summary stops reading as
  cut off.

## Out Of Scope / Parity Guarantees

- The run handler, its disabled conditions, queueing, and status semantics are
  unchanged — this removes a *duplicate trigger*, not behavior. The footer Run
  already exists and already calls the same callback.
- Run in Game, auto-run, seed, and re-roll controls are untouched.
- No localStorage or test-contract changes (no test references the panel Run or
  the "Bal" string — verified by grep).

## Verification Gates

- `bun run openspec -- validate mapgen-studio-run-console --strict`
- tsc + mapgen-studio vitest project green (AppFooter suite must stay green)
- Visual proof on :5173: exactly one Run button on screen; dirty state shows on
  the footer Run; footer summary reads "… · Balanced".
