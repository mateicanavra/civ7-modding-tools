## Why

Found during Pass-2 final verification (2026-06-11, live app): cycling the theme
control changes the button label (Auto → Light → Dark) and the deck.gl scene's
`lightMode` input, but the chrome never re-themes — `<html>` keeps whatever
class the `index.html` no-flash bootstrap set at boot. The theming-finish slice
deleted the legacy runtime theme plumbing in favor of the single `.dark` class,
but no runtime writer of that class was ever added: the only `classList.add("dark")`
calls in the app are the pre-paint bootstrap. The in-app theme toggle is
therefore functionally broken; light mode is reachable only by reloading with a
light OS preference and no stored override.

## Target Authority Refs

- `apps/mapgen-studio/.interface-design/system.md` (§Theming mechanism: single
  `.dark` class on `<html>`, "one theme switch writes the class")
- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (verification
  contract — found by the visual gate)

## What Changes

- `StudioProviders` (the component that owns theme-preference wiring) gains the
  missing effect: it syncs `document.documentElement.classList` `.dark` to the
  resolved preference (`isLightMode`) on change. The bootstrap still owns the
  pre-paint initial state; React owns every change after hydration.

## Out Of Scope / Parity Guarantees

- No change to the preference cycle, storage key (`theme-preference`), bootstrap
  script, tokens, or deck.gl `lightMode` input.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-theme-class-sync --strict`
- tsc + mapgen-studio vitest project green
- Visual on :5173: cycle the theme control → chrome re-themes live (dark and
  light screenshots); reload preserves the chosen theme without flash.
