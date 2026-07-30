<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="algorithm" title="Algorithm (current)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Plan compilation (ExecutionPlan)

## Purpose

Define how a run request is compiled into an execution plan:

- errors are explicit and structured,
- missing/unknown steps fail fast,
- and the plan contains all data required for execution.

## Contract

Plan compilation must:

- respect recipe enablement (`enabled: false` removes the node),
- reject unknown step ids (registry is authoritative),
- and build a deterministic node list from the recipe + registry.

## Algorithm (current)

`compileExecutionPlan(...)`:

- validates the run request shape (schema-driven),
- iterates recipe steps in order,
- applies enablement (`enabled ?? true`),
- validates step ids are unique,
- validates steps exist in the StepRegistry,
- emits `ExecutionPlanNode` for each enabled step:
  - `stageId` is assigned by the recipe composition that owns the step occurrence
  - `requires`/`provides` are taken from the registered step
  - `config` is taken from the recipe step config

The resulting plan retains the exact physical `MapSetup` projected from the recipe's admitted
initial value. Execution accepts only a `MapContext` that owns that same setup identity. The plan
fingerprint includes both the recipe's initial-setup authority id and its complete admitted value;
observation sinks remain excluded. Physical setup is admitted once before context construction,
and step or operation normalizers cannot reinterpret it as operation configuration.

`recipe.inspectPlan(plan)` proves that a plan belongs to that exact recipe runtime and returns
frozen evidence containing the recipe's literal id, the stable plan fingerprint, the initial-setup
authority id, and the complete admitted initial value. Integrations use that retained evidence when
they must configure an adapter or report launch facts; they do not pair the plan with a second,
caller-supplied setup snapshot.

## Ground truth anchors

- Execution plan compilation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Recipe compilation and inspection authority: `packages/mapgen-core/src/authoring/recipe/create.ts`
- Recipe and run-request schemas: `packages/mapgen-core/src/engine/execution-plan.ts`
- Target posture: pipeline boundary and compiled plan: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`
