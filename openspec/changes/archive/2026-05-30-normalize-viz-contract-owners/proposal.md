## Why

The biome visualization repair exposed a categorical ownership issue: stable
visualization contracts can be pulled out of private step files, copied through
wrapper files, or placed in broad shared buckets unless the repo defines the
standard owner shape. That makes Studio/debug surfaces harder to maintain and
lets projection stages depend on another stage's implementation internals.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  stages exist for real authoring/projection boundaries, not debug groupings,
  and broad buckets are not owners.
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`: canonical MapGen
  visualization contract entrypoint.
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`: implemented
  cleanup should become mechanical relapse protection only after source truth
  exists.

## What Changes

- Define a stage/step visualization ownership standard:
  - shared or stable stage/phase visualization contracts live at
    `stages/<stage>/viz.ts`;
  - step-private visualization helpers may live at
    `stages/<stage>/steps/<step>/viz.ts` only when consumed inside that step;
  - `stages/<stage>/steps/viz.ts` hubs and wrapper re-exports are forbidden.
- Move current shared visualization helpers to the stage owner surface.
- Remove wrapper-only visualization files that preserve the old location.
- Add a categorical guard so future cross-stage/stage-shared viz contracts do
  not re-enter private step paths.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds visualization contract ownership as
  a durable normalization guardrail.

## Dependencies

- Builds on `normalize-guardrails-promotion`.
- Enables future Studio/debug work to consume visualization contracts through
  owner surfaces instead of private step files.

## Forbidden Non-Goals

- No new visualization event envelope or deck.gl viewer architecture.
- No broad shared `visualization/`, `ecology/`, or `utils/` bucket unless a
  named invariant and concrete consumers require it.
- No wrapper/re-export file that keeps a private step path alive after the
  stage surface exists.
- No generated-output edits.

## Impact

- Affected owners: standard recipe stage source, MapGen visualization docs,
  normalization guard script/policy, OpenSpec normalization spec.
- Expected write set:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/**/viz.ts`
  - `scripts/lint/lint-normalization-guardrails.mjs`
  - `docs/system/libs/mapgen/reference/VISUALIZATION.md`
  - `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
  - `openspec/changes/normalize-viz-contract-owners/**`
- Stop conditions:
  - the guard red-bars intended current source;
  - the change needs a broad shared bucket to pass;
  - a moved helper is actually step-private and has no cross-step/stage
    consumer.
- Verification gates:
  - `bun run lint:normalization-guardrails -- --self-test`
  - `bun run lint:normalization-guardrails`
  - `bun run --cwd mods/mod-swooper-maps check`
  - focused recipe/ecology/foundation tests if affected
  - `bun run openspec -- validate normalize-viz-contract-owners --strict`
  - `bun run openspec:validate`
  - `git diff --check`
