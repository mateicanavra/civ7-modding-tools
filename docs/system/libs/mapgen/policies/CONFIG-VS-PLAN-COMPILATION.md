<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="rule" title="Rule"/>
  <item id="allowed" title="Allowed"/>
  <item id="disallowed" title="Disallowed"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: config compilation vs plan compilation

## Purpose

Keep MapGen runs deterministic and debuggable by cleanly separating:

1) **Config compilation** (schemas/defaults/normalization, op bindings)
2) **Plan compilation** (execution plan graph, gating rules)
3) **Execution** (purely runs the compiled plan)

## Audience

- Compiler/runtime maintainers.
- Step/op authors (especially when adding new config surfaces).

## Rule

If a transformation can be performed before execution (defaults, validation, binding, enablement compilation), it should happen during compilation — not during execution.

## Allowed

- Config compilation applies schema defaults and strict validation.
- Plan compilation builds a deterministic execution plan from the recipe.
- Execution is a pure “apply plan to context” process.

## Disallowed

- Runtime-only enablement decisions (“shouldRun”) that depend on hidden state.
- Silent skips when requirements aren’t satisfied.
- Steps that “normalize” config on the fly.

## Ground truth anchors

- Config normalization (strict): `packages/mapgen-core/src/compiler/normalize.ts`
- Recipe compilation entrypoints: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Execution plan schema and compile errors: `packages/mapgen-core/src/engine/execution-plan.ts`
- Target posture: pipeline boundary is `RunRequest = { recipe, settings }` compiled to `ExecutionPlan`: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`

