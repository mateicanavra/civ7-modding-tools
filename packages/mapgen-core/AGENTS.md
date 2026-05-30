# MapGen Engine Core — Agent Router

Scope: `packages/mapgen-core/**`

## What This Package Is

- Shared MapGen engine/library used by map mods.
- Pure TypeScript domain logic: algorithms, phases/layers, config schema, orchestration glue.
- `dist/` is generated build output; treat it as read‑only.

## Tooling Rules

- Use package scripts via `bun` for build, type‑checks, and tests (`bun --cwd packages/mapgen-core run <script>`).
- Run workspace‑wide validation from repo root when changing cross‑package contracts.

## Domain Rules

- No direct Civ7 engine imports here; all engine interaction goes through `@civ7/adapter` and `MapGenContext.adapter`.
- Avoid global mutable state; steps/layers communicate only via `MapGenContext`.
- Step identity is recipe-unique (`step.id` only); `instanceId`/`nodeId` are retired and tracing/plan fingerprints are keyed by `stepId`.

## Canonical Docs

- MapGen / Swooper Maps normalization baseline: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`; downstream implementation slices: `openspec/changes/README.md`.
- Engine architecture & contracts: `docs/system/libs/mapgen/MAPGEN.md`
- Design notes & invariants: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`, `docs/system/libs/mapgen/policies/POLICIES.md`
- Testing overview: `docs/system/TESTING.md`
