# Game console docks beneath the world bar (vertical zoning)

## Why

The user flagged the bottom-right Game console as misplaced: run-in-game
controls belong near the world-config toolbar that parameterizes the launch.
Deliberation (Pass-4 frame, E1) chose **colocation over merge**: the world bar
is an input strip while the Game console is live status + commands — merging
them mixes readouts into a settings row, and measured widths (world bar
≈930px + console ≈580px at 1600px viewport) make a single row impossible
anyway. Colocation yields clean vertical zoning: **top = game** (world
definition + live-game console), **bottom = studio** (iteration loop). This
supersedes the *placement* scenarios of `mapgen-studio-footer-consoles`
(right-docked-in-footer, centering-independence, no-overlap); the console
*split* and every state-legibility requirement from that change carry forward
unchanged.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-4-design-fixes.md` (E1 decision)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-4 amendment:
  vertical zoning)

## What Changes

- `AppHeader` gains a `gameConsole` slot (ReactNode) rendered as a centered
  row in the header's center column, **after** the transient setup panel (the
  disclosure stays attached to its button). Side panels reflow automatically
  via the existing measured-header mechanism (`onHeaderHeightChange` →
  `panelTop`).
- `StudioShell` composes `GameConsole` into that slot with the same props it
  passed through `AppFooter`.
- `AppFooter` drops the game console and its right zone; the studio console
  is simply centered. The shared operation-gating booleans
  (`isRunInGameRunning`, `isSaveDeployRunning`) stay on the footer — seed/
  reroll/run disabling during game operations is behavior parity.
- Tests: game-console scenarios move from `AppFooter.test.tsx` to a
  `GameConsole.test.tsx` that mounts the component that owns the markup;
  footer tests keep studio-console + gating assertions. Stale `lightMode`
  props (removed from the component in P4) are swept from test mounts.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/AppHeader.tsx`,
  `AppFooter.tsx`, `apps/mapgen-studio/src/app/StudioShell.tsx`,
  `apps/mapgen-studio/test/runInGame/{AppFooter,GameConsole}.test.tsx`
