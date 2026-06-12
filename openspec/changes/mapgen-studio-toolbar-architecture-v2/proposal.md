# Toolbar architecture v2: top = Game bar, bottom = World/Map console

## Why

The user refined Pass-4's vertical zoning after seeing it live: instead of a
world-config bar with a game console docked beneath it, the top bar IS the
single Game toolbar and the bottom bar IS the World/Map console. Map
settings (size, players, resources) move down next to Seed — "no map
settings in the top bar at all" — which dissolves the width problem that
forced Pass-4's two-row colocation. The last-run stats compress into a
History affordance with a hover tooltip. This supersedes the *placement*
scenarios of `mapgen-studio-game-console-dock`; every state-legibility,
gating, and behavior-parity requirement carries forward unchanged.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X1)
- `apps/mapgen-studio/.interface-design/system.md` (Pass-5 amendment:
  Game/World zoning v2)

## What Changes

- `AppHeader` center bar becomes the **Game bar**: identity renames World →
  Game; Size/Players/Resources selects leave; the bar carries the
  saved-config selector, the game command cluster (live chip + autoplay +
  Explore + status chips + retry/diagnostics + Run in Game), and an
  icon-only setup disclosure (`SlidersHorizontal`, no "Setup" text) LAST in
  the bar, dropping down the game-setup row (Leader · Civ · Difficulty ·
  Speed only).
- `GameConsole` loses its own panel chrome and identity label and renders as
  an inline command cluster composed INTO the Game bar row (component
  boundary, props, and behavior unchanged).
- `AppFooter` becomes the **World/Map console**: gains
  `globalSettings`/`onGlobalSettingsChange` and renders Size · Players ·
  Resources selects left of Seed; the last-run text cluster is replaced by a
  History icon button whose tooltip (mirrored to `aria-label`/`title`)
  carries the last run (seed · size · players · resources) and whose click
  copies the last seed.
- `StudioShell` reroutes the `WorldSettings` wiring (header keeps
  `setupConfig` + saved-config only) and composes the console into the bar.
- Tests: AppHeader/AppFooter/GameConsole assertions follow the moved
  controls; operation-gating coverage extends to the relocated selects.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/AppHeader.tsx`,
  `AppFooter.tsx`, `GameConsole.tsx`, `apps/mapgen-studio/src/app/StudioShell.tsx`,
  `apps/mapgen-studio/test/runInGame/{AppFooter,GameConsole}.test.tsx`
