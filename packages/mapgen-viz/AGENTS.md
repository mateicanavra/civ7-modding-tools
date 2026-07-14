# MapGen Viz Contract — Agent Router

Scope: `packages/mapgen-viz/**`

## What This Package Is

- Shared visualization contract types + small helpers used by:
  - MapGen Studio (viewer + streaming protocol)
  - MapGen pipeline dump tooling
- Source of truth is `packages/mapgen-viz/src/index.ts`.
- `dist/` is generated build output; treat it as read-only.

## Tooling Rules

- Use `nx run mapgen-viz:build` and `nx run mapgen-viz:check`.
- When changing exported contracts, run workspace-wide checks from repo root.

## Canonical Docs

- Viz SDK v1 contract (implemented): `docs/projects/mapgen-studio/VIZ-SDK-V1.md`
- Pipeline visualization overview: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
