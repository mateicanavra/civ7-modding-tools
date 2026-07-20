# MapGen Diagnostics - Agent Router

Scope: `packages/mapgen-diagnostics/**`

## What This Package Is

- Reusable Node/Bun capture, filesystem evidence reads, exact binary admission,
  inventory, and neutral diffing for path-backed MapGen diagnostics.
- Public API is the package root only. Do not add environment subpaths or deep
  imports.
- The package may consume MapGen Core, MapGen Viz, and Node built-ins. It must
  not import Swooper domains or recipes, Studio, Civ7 adapters, or product
  metric targets.
- Swooper owns Standard replay, product analysis and thresholds, report shape,
  and diagnostic command UX.
- `dist/` is generated build output; treat it as read-only.

## Tooling Rules

- Use `nx run mapgen-diagnostics:build`,
  `nx run mapgen-diagnostics:typecheck`, and
  `nx run mapgen-diagnostics:test`.

## Canonical Docs

- Package ownership migration:
  `docs/projects/engine-refactor-v1/package-ownership-migration.md`
- Visualization contract:
  `docs/system/libs/mapgen/reference/VISUALIZATION.md`
