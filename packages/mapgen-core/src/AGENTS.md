# MapGen Core Sources — Agent Router

Scope: `packages/mapgen-core/src/**`

- MapGen authoring/compiler/executor/artifact/trace substrate. Keep generic logic
  organized by responsibility and data product.
- Steps should be deterministic from `MapContext` plus validated config and publish inter-step data only through declared artifacts.
- Do not introduce mod-specific entrypoints, Swooper domain algorithms, or Civ7 runtime imports here.

Tooling: validate with this package’s `bun` scripts.

Docs:
- `docs/system/libs/mapgen/architecture.md`
- `docs/system/libs/mapgen/design.md`
