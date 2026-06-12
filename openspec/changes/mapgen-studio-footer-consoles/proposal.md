# Footer consoles: studio vs live-game separation with a state bridge

## Why

The footer interleaves two ownership domains with no boundary: studio-runtime
controls/info (generation status, last-run summary, seed, reroll, auto-run,
Run) and Civ7-runtime controls/info (live turn/seed chip, apply-suggestion,
autoplay start/stop, Run in Game + its status/retry/diagnostics, save-deploy
chip). The user proposed — and grounding confirms — a structural split: the
game side is expected to grow (more live-game controls coming), and today new
controls have no named home, so they accrete into the run bar. Deliberated and
accepted, with one deviation from the literal ask: **Run in Game belongs to
the game console** (it commands the live game), even though it sits in the
studio run bar today.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md` (issues 5–6; D2 design)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-3 amendment: footer = two consoles)
- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core = behavior parity)

## What Changes

- **`AppFooter` splits into two visual consoles** (one component file may still
  own both, but the game side becomes a named, modular unit — `GameConsole` —
  so future live-game controls have a designated home):
  - **Studio console, centered:** status dot/text (Ready/Modified/Running/
    Error), last-run summary (seed · size · players · resources), seed input,
    reroll, auto-run toggle, Run. The two current studio bars merge into one.
  - **Game console, right-docked:** identity eyebrow ("Civ7"), live runtime
    chip (turn/seed/readiness + apply-suggestion affordance), autoplay
    start/stop, Run in Game button + status chip + retry + diagnostics, and
    the save-deploy status chip.
- **Centering is independent of the right dock**: the studio console stays
  truly centered regardless of game-console width; narrow viewports wrap
  rather than overlap.
- **Bridge (state legibility):** the relation cues that tie consoles together
  are preserved and co-located — stale-vs-studio warning ring + Current/Stale/
  Previous chip on the Game console; dirty emphasis (Modified + Run ring) on
  the Studio console. No relation signal is dropped.
- All callbacks, gating (`operationControlsDisabled`), tooltips, aria
  contracts, and status semantics are unchanged (behavior parity).

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/AppFooter.tsx`
  (+ a `GameConsole` unit), `src/app/StudioShell.tsx` wiring if props
  regroup, footer parity tests.
