# Design: Deep Habitat Effect Public Surface Guards

## Domain Boundary

Owner: public surface and architecture guardrails.

This packet closes the implementation train only after previous packets have
moved command families. It may add enforcement rules, update public exports, and
realign docs. It may not hide unfinished migrations by exporting internals.

## Write Set

```text
tools/habitat-harness/src/index.ts
tools/habitat-harness/src/plugin.ts
tools/habitat-harness/src/public/**
tools/habitat-harness/package.json
tools/habitat-harness/src/rules/**
.habitat/rules/**
.habitat/patterns/**
.habitat/baselines/**
docs/projects/habitat-harness/deep-refactor/**
docs/projects/habitat-harness/openspec-remediation/**
```

## Guard Requirements

- No `Effect.run*` outside approved runtime edges.
- No `spawnSync` or `node:child_process` outside provider implementation.
- No direct `Date.now`/`new Date` in migrated feature domains.
- No direct `process.env` reads outside config/provider boundaries.
- No direct `node:fs` side-effect imports in migrated feature domains.
- No new feature logic under `src/lib`.
- No provider implementation exports from public package facade.
- No authored artifact semantics under `tools/habitat-harness/src`.
- No remaining implementation ownership under `src/lib`, `src/base`, or
  `src/adapters` unless the packet records an explicit public adapter with a
  closure action.

## Public Surface Rules

`src/index.ts` may export:

- stable CLI/library schemas intentionally used by current consumers;
- public feature functions that were already exported before the train;
- TypeBox schemas needed for consumer validation;
- Nx plugin entrypoints through `./plugin`.

It must not export:

- live provider Layers;
- runtime internals;
- test fakes;
- vendor command builders;
- authored `.habitat` data.

## Stop Conditions

- A public export is kept only because tests or internal modules import it.
- A guard is implemented as a brittle test when a Habitat/Grit/Biome/Nx rule can
  own it.
- The packet closes with stale workstream records or unsubmitted stack state.
