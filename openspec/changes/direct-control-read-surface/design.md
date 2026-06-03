## Design

Read wrappers are package-owned command profiles that return JSON parsed into
stable TypeScript shapes. Historical implementation targeted Tuner for
post-Begin gameplay reads and App UI for lifecycle/session reads. The
2026-06-03 controller realignment supersedes that implementation route: proven
post-Begin gameplay reads should move to the project-owned game-scoped App UI
controller, with Tuner retained for canary, parity, diagnostics, and explicit
research calls.

## Public Wrappers

- `getCiv7PlayableStatus()`
- `getCiv7MapSummary()`
- `getCiv7PlotSnapshot({ x, y, playerId? })`
- `getCiv7MapGrid({ bounds?, fields?, playerId?, maxPlots? })`
- `getCiv7PlayerSummary({ playerId? })`
- `getCiv7UnitSummary({ playerId?, maxUnits? })`
- `getCiv7CitySummary({ playerId?, maxCities? })`
- `getCiv7VisibilitySummary({ playerId, includeGrid?, bounds?, maxPlots? })`
- `getCiv7GameInfoRows({ table, limit?, offset? })`
- `inspectCiv7Root({ state?, root, maxKeys? })`

## Boundedness

All grid, list, table, and root reads require explicit or default bounds.
Default maximums live in the package and are visible to callers. A request that
would exceed the bound fails with a package error rather than streaming an
unbounded dump.

## Hidden Information

Player/LLM-facing consumers should pass `playerId` and use visibility summaries
or revealed-state fields. Developer/mapgen callers may request full map facts;
the wrapper output labels the view as developer/full or player-filtered.

## CLI/Studio Exposure

CLI exposes developer-oriented reads under `civ7 game status`, `map`, `plot`,
`players`, `units`, `cities`, and `catalog` style commands. Studio may call the
package directly from server endpoints for map summary and runtime comparison.

## Review Lanes Required

- Product review for developer/player/LLM usefulness.
- Architecture review for package-owned command builders.
- Verification review for bounds and stale state selection.
