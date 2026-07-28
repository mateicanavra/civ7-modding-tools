<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="satisfaction" title="Satisfaction"/>
  <item id="boundaries" title="Boundaries"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Step dependencies

## Purpose

Define the two causal prerequisites a recipe step may select without creating a
second pipeline model.

## Contract

`requires` and `provides` are the sole dependency lists on a step contract. An
entry is either:

- the exact `Artifact` authority for a validated write-once data product; or
- a typed `CompletionId` (`completion:*`) for a payload-free prerequisite whose
  relevant result exists only in mutable external state.

Recipe and selected-plan compilation require every dependency consumer to have
one earlier provider. Artifact consumers must select the provider's exact
authority identity. The JSON-safe plan projects both kinds to ids, while the
private executable plan retains exact artifact objects.

## Satisfaction

- An artifact is satisfied only when its exact authority is present in the
  private write-once store. Publication performs its sole admission transition.
- A completion is a plan edge, not emitted runtime state. Plan compilation
  requires one earlier selected provider; sequential fail-fast execution means
  a consumer can run only after that provider returned successfully.
- A throwing step stops before its consumers. A valid semantic no-op still
  satisfies its plan edge because completion does not count low-level calls.

There is no tag registry, completion definition object, postcondition predicate,
adapter evidence ledger, completion accumulator, or public satisfaction report.
A completion proves provider reachability and successful return, not that any
particular adapter method ran. The provider implementation owns that behavior.

## Boundaries

Initial setup exists before the graph and remains immutable invocation context;
it is not a dependency. Trace events describe occurrences for observers; they
are not causal completion evidence. Engine-method declarations authorize the
adapter surface available to a step, but individual method calls do not prove a
whole step transaction and do not emit completions automatically. The executor
does not need to: successful reachability is already implied by the admitted
linear plan.

Use an exact artifact when that artifact semantically represents the completed
outcome required by the consumer. Do not use a planning or pre-materialization
artifact merely as a sentinel for a later external-state transaction performed
by the same provider. Add a completion only when a later selected step genuinely
depends on invisible external state and no outcome artifact expresses that
causality. Authored recipe order alone is not a reason to add one.

## Ground truth anchors

- Completion identity: `packages/mapgen-core/src/engine/completion.ts`
- Step dependency authoring: `packages/mapgen-core/src/authoring/step/contract.ts`
- Selected-plan validation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Artifact publication proof: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Standard completion catalog: `plugins/mod/map/swooper-physics/src/recipes/standard/completions.ts`
- Artifact contract: `docs/system/libs/mapgen/reference/ARTIFACTS.md`
