# MapGen Mod Entry Sources — Agent Router

Scope: `mods/mod-swooper-maps/src/**`

- These files are game‑facing entrypoints for map variants. Keep them small and declarative (bootstrap + imports).
- Avoid adding generator logic here; put shared logic in MapGen core or the mod’s shared modules instead.
- Validate changes with `nx run mod-swooper-maps:check` and the relevant
  `mod-swooper-maps` build or test target.

Docs:
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/libs/mapgen/architecture.md`
