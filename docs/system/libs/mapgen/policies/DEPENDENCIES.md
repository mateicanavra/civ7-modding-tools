<toc>
  <item id="purpose" title="Purpose"/>
  <item id="allowed" title="Allowed"/>
  <item id="disallowed" title="Disallowed"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: step dependencies

## Purpose

Keep cross-step causality explicit without turning pipeline ordering,
observation, or adapter calls into parallel authorities.

## Allowed

- Select exact `Artifact` objects for cross-step data.
- Select typed `completion:*` constants only for genuine payload-free
  prerequisites in mutable external state that no exact artifact edge expresses.
- Let recipe and selected-plan compilation enforce one earlier provider.
- Let the executor admit artifact publication once and stop before consumers
  whenever an earlier provider fails.

## Disallowed

- Raw string literals in `requires` or `provides`.
- Artifact ids in place of exact artifact authorities.
- Tag registries, completion definition records, postcondition callbacks, or
  adapter-owned satisfaction ledgers.
- Runtime completion emission, accumulation, or satisfaction reports.
- A completion parallel to an exact artifact that already represents the same
  completed outcome.
- Using a planning or pre-materialization artifact as a sentinel for a later
  external-state transaction performed by the same provider.
- Treating initial setup, trace events, method authorization, or array order as
  dependency kinds.
- Adding a completion with no genuine downstream consumer.

## Ground truth anchors

- Reference: `docs/system/libs/mapgen/reference/DEPENDENCIES.md`
- Step contract: `packages/mapgen-core/src/authoring/step/contract.ts`
- Plan validation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Executor: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
