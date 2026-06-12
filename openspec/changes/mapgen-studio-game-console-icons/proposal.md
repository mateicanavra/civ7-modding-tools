# Game console commands go icon-only + Explore button

## Why

With the console docked beneath the world bar, its labeled buttons ("Start
Auto", "Run in Game") are the widest things in the header zone, and a third
command (Explore — tile visibility) is arriving. Labels also communicated
poorly: `Bot` read as a chatbot, `MonitorPlay` undersold that the action
launches the external Civ7 app. The Pass-4 icon contract (frame E2): secondary
repeated-use actions in dense consoles are icon-only with full accessible
names; primary CTAs keep labels.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-4-design-fixes.md` (E2 table)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-4 amendment:
  icon-only contract + console glyphs)

## What Changes

All in `src/ui/components/GameConsole.tsx`:

- **Autoplay** becomes icon-only: `FastForward` (start) / `Square` (stop),
  `LoaderCircle` spinner while the start/stop request is in flight; the
  start/stop/in-flight wording moves into `aria-label`/`title`/Tooltip.
- **Run in Game** becomes icon-only: `SquareArrowOutUpRight` (launches the
  external app). The dynamic action label ("Run in Game" / "Retry Run" /
  "Restart Civ & Run") is preserved as the FIRST line of the button's
  `aria-label`/`title`/Tooltip.
- **Explore** (NEW): icon-only `Binoculars` between autoplay and the
  run-in-game group (both autoplay and explore command the live game; Run in
  Game launches it). Behavior is wired later behind an optional `onExplore`
  prop; the button renders disabled until a handler exists, with an
  accessible name saying so.
- Tests: GameConsole scenarios gain assertions that the action labels survive
  in accessible names and that Explore renders.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/GameConsole.tsx`,
  `apps/mapgen-studio/test/runInGame/GameConsole.test.tsx`
