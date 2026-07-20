# MapGen Mod Entry Sources — Agent Router

Scope: `mods/mod-swooper-maps/src/**`

- This source tree owns Swooper's six domain models, recipes, map configuration,
  and game-facing map entrypoints.
- Keep map entrypoints small and declarative. Domain generation logic stays in
  `domain/`; recipe composition stays in `recipes/`; generic SDK mechanics move
  only to a named substrate such as MapGen Core, Metrics, or Viz.
- Validate changes with `nx run mod-swooper-maps:check` and the relevant
  `mod-swooper-maps` build or test target.

Docs:
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/libs/mapgen/architecture.md`
