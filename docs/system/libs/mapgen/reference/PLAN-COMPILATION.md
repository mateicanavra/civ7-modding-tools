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
  - `phase` is taken from the registered step
  - `requires`/`provides` are taken from the registered step
  - `config` is taken from the recipe step config

The resulting plan also carries the validated `env` (current) as part of the plan.

## Ground truth anchors

- Execution plan compilation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Recipe schema and run request schema: `packages/mapgen-core/src/engine/execution-plan.ts`
- Target posture: pipeline boundary and compiled plan: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`

