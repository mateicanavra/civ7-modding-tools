# MapGen Core Sources — Agent Router

Scope: `packages/mapgen-core/src/**`

- Engine implementation. Keep logic organized by architectural phase and data products.
- Steps should be deterministic from `MapContext` plus validated config and publish inter-step data only through declared artifacts.
- Do not introduce mod‑specific entrypoints or Civ7 runtime imports here.

Tooling: validate with this package’s `bun` scripts.

Docs:
- `docs/system/libs/mapgen/architecture.md`
- `docs/system/libs/mapgen/design.md`
