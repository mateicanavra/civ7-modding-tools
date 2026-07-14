# Civ7 Intelligence Bridge Mod - Agent Router

Scope: `mods/mod-civ7-intelligence-bridge/**`

- This package is the game-scoped Civ7 UI mod that bootstraps
  `globalThis.Civ7IntelligenceBridge.invoke(...)` into the native
  `@civ7/control-orpc` in-process router.
- `src/` and `scripts/` are source of truth. `mod/` is generated deployable
  Civ7 output; regenerate it with package scripts instead of hand-editing.
- Keep this mod as a thin game-runtime adapter. Do not add procedure logic,
  custom dispatchers, raw JavaScript command surfaces, HTTP transports, or
  CLI/Studio behavior here.
- Runtime/live-game proof requires an explicit deployed Civ7 run; package
  tests and bundle checks are local source proof only.

Validate with:

- `nx run mod-intelligence-bridge:test`
- `nx run mod-intelligence-bridge:check`
- `nx run mod-intelligence-bridge:build`
