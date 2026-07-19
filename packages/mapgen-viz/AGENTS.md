# MapGen Viz Kernel — Agent Router

Scope: `packages/mapgen-viz/**`

## What This Package Is

- Environment-neutral visualization projections, scalar statistics, and binary materialization.
- Projections describe inspectable spatial evidence; they do not carry trace/run identity,
  filesystem paths, browser buffers, rendered views, recipes, or domain policy.
- `materializeVizProjection` validates a complete projection before delegating each binary slot
  exactly once to an injected synchronous materializer.
- Viz owns runtime admission of its portable v2 representations; host packages own transport and
  persistence around those admitted values.
- MapGen Studio owns inline-buffer transport. Swooper diagnostic tooling owns path persistence.
- Public exports are composed through `packages/mapgen-viz/src/index.ts`; keep projection contracts,
  metadata defaults, geometry helpers, statistics, and materialization in their focused source
  modules.
- `dist/` is generated build output; treat it as read-only.

## Tooling Rules

- Use `nx run mapgen-viz:build`, `nx run mapgen-viz:check`, and `nx run mapgen-viz:test`.
- When changing exported contracts, run workspace-wide checks from repo root.

## Canonical Docs

- Visualization contract and ownership: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Pipeline visualization overview: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
