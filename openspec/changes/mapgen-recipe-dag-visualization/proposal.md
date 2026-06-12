## Why

MapGen recipe authors need a first-class way to inspect the pipeline they are
authoring as an artifact dependency graph. Studio currently exposes recipe
configuration and runtime visualization layers, but it does not show which
stages produce the artifacts consumed by later stages or how sequential steps
inside a stage relate to those dependencies.

The graph must be derived from authored recipe/stage/step contracts, not from
React-local guesses or generated UI labels. This keeps the view aligned with
the architecture rule that recipe order is the execution order and dependency
tags are gates, while explicit `artifacts.requires/provides` are the strongest
source for artifact dependency edges.

## Target Authority Refs

- Direct user decision, 2026-06-10: create an oRPC + Effect-backed program,
  service, and tool for visualizing the selected MapGen recipe as an artifact
  dependency DAG in MapGen Studio.
- Root `AGENTS.md`: use Graphite/OpenSpec workstreams, update docs/tests with
  behavior changes, treat generated artifacts as read-only, and use Bun
  workspace scripts.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  recipe owns global stage/step order; stages are authoring/config surfaces;
  steps own executable contracts; truth and projection remain separate.
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`: step
  contracts own `phase`, `requires`, `provides`, and explicit artifact
  requirements/provisions.
- `docs/system/libs/mapgen/reference/PLAN-COMPILATION.md`: compiled plans are
  deterministic from recipe + registry, and `phase`/requires/provides come from
  registered steps.
- `docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`: runtime recipes are flat
  ordered step lists.
- `packages/mapgen-core/AGENTS.md` and `packages/mapgen-core/src/AGENTS.md`:
  MapGen core remains pure TypeScript domain logic with no Civ7 runtime imports.
- `mods/mod-swooper-maps/AGENTS.md`: Swooper Maps recipe artifacts and generated
  outputs are source-owned by scripts, not hand edits.
- `packages/civ7-control-orpc/AGENTS.md`: native oRPC/Effect examples use
  contract-first procedure composition and in-process service behavior.

## What Changes

- Add a MapGen authoring DAG model/extractor that accepts authored recipe
  stages and returns a JSON-safe dependency graph:
  - phase clusters from `step.contract.phase`;
  - stage nodes from authored stage ids and recipe order;
  - expandable sequential step entries inside each stage;
  - artifact edges derived solely from explicit `contract.artifacts`
    producer/consumer relationships;
  - tag metadata from merged `requires`/`provides` carried as diagnostics, not
    as artifact edges.
- Add a Studio oRPC + Effect surface that loads a selected recipe id from the
  Studio recipe catalog and returns the prepared DAG DTO through `/api` server
  code.
- Add a secondary full-screen Studio tab/view that renders the selected recipe
  DAG, grouped by phase clusters, with stage nodes as the primary graph units
  and expandable step details.
- Add focused tests for DAG extraction, oRPC procedure behavior, selected recipe
  loading, and the Studio view state/rendering contract.

## Requires

- Trunk-visible authoring contracts from `@swooper/mapgen-core`.
- Trunk-visible Swooper recipe exports `STANDARD_STAGES` and
  `BROWSER_TEST_STAGES`.
- Trunk-visible Studio recipe catalog and Vite server middleware.
- Existing oRPC + Effect patterns from `@civ7/control-orpc`.

## Enables Parallel Work

- A later editable graph workstream can add authoring mutations over the same
  DTO identity model after this read-only graph contract stabilizes.
- Later browser/runtime proof work can overlay run status, trace events, or
  artifact materialization state on the same stage/step ids.

## Forbidden Non-Goals

- Do not derive artifact dependency edges in React.
- Do not use generated `dist/` files or generated Studio artifacts as the
  source of DAG truth.
- Do not invent a second recipe ordering model.
- Do not turn phase ids into execution ordering. They are grouping labels.
- Do not add Civ7 runtime/direct-control imports to MapGen core.
- Do not add editable graph mutation APIs in this slice.

## Affected Owners

- MapGen authoring core: generic recipe DAG extraction and DTO types.
- Swooper Maps recipe source: concrete recipe stage arrays consumed by Studio.
- MapGen Studio server: selected-recipe DAG oRPC + Effect procedure.
- MapGen Studio client: full-screen DAG tab, graph layout, expansion state, and
  accessible controls.

## Forbidden Owners

- Civ7 direct-control runtime.
- Civ7 adapter.
- Generated `dist/` and `mod/` outputs.
- Browser worker trace/viz execution semantics.

## Write Set

- `packages/mapgen-core/src/authoring/**`
- `mods/mod-swooper-maps/src/recipes/**`
- `mods/mod-swooper-maps/test/**`
- `apps/mapgen-studio/src/**`
- `apps/mapgen-studio/test/**`
- `docs/system/libs/mapgen/**` only for durable contract notes required by the
  implementation
- `openspec/changes/mapgen-recipe-dag-visualization/**`

## Consumer Impact

Recipe authors gain a read-only full-pipeline dependency view for the currently
selected Studio recipe. Existing recipe execution, generated map output, config
schema generation, and in-game run controls must remain behaviorally unchanged.

## Stop Conditions

- Current recipe source does not expose enough authored stage/step contract
  data to derive artifact edges without generated artifacts.
- oRPC + Effect cannot be mounted in the current trunk Studio server without
  replacing unrelated run-in-game endpoints.
- The graph view requires a new dependency that conflicts with existing Studio
  package constraints.
- Existing unmerged Studio redesign stack is required for correctness; if so,
  this main-based slice must stop and be retargeted explicitly.

## Verification Gates

- `bun run --cwd packages/mapgen-core check`
- `bun run --cwd packages/mapgen-core test`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd mods/mod-swooper-maps test`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio test`
- `bun run --cwd apps/mapgen-studio build`
- `bun run openspec -- validate mapgen-recipe-dag-visualization --strict`
- `bun run openspec:validate`
- `git diff --check`
