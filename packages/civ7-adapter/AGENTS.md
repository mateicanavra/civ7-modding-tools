# Civ7 MapGen Adapter — Agent Router

Scope: `packages/civ7-adapter/**`

- Runtime-free shared package for the `EngineAdapter` contract, map metadata,
  deterministic mock, and adapter-owned outcome types.
- It does not import Civ7 engine globals, `/base-standard/` modules, generated
  API declarations, host tooling, or a concrete runtime implementation.
- Concrete MapGen lowering and map-script compilation belong to the deployable
  Swooper realization app.
- Keep the public surface singular: consumers import `@civ7/adapter`.

Tooling: use `nx run civ7-adapter:build` and `nx run civ7-adapter:check`.

Docs:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` for MapGen / Swooper Maps truth/projection normalization.
- `docs/system/libs/mapgen/MAPGEN.md` and `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md` for adapter-boundary context.
