# Civ7 Engine Adapter — Agent Router

Scope: `packages/civ7-adapter/**`

- Sole boundary for importing Civ7 engine globals / `base-standard` APIs.
- Exposes stable `EngineAdapter` implementations consumed by MapGen and mods.
- Owns final Civ7 map-script compatibility through
  `@civ7/adapter/map-script-build`; neutral libraries must not carry embedded-V8
  shims or global polyfills.
- Keep this package thin: translate engine calls to adapter methods; no MapGen algorithms or mod logic.

Tooling: use `nx run civ7-adapter:build` and `nx run civ7-adapter:check`.

Docs:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` for MapGen / Swooper Maps truth/projection normalization.
- `docs/system/libs/mapgen/MAPGEN.md` and `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md` for adapter-boundary context.
