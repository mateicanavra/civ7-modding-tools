<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="algorithm" title="Algorithm (current)"/>
  <item id="error-model" title="Error model"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Config compilation

## Purpose

Define how an admitted complete recipe config is translated into strict,
schema-valid internal step configuration and then compiled into a plan.

## Contract

Config compilation must be:

- **strict**: unknown keys are errors, not ignored,
- **exact at the public boundary**: public config is cloned and validated without
  defaulting, cleaning, merging, or migration,
- **shape-preserving internally**: any internal normalization must still
  validate against the step schema,
- **deterministic**: the same inputs produce the same compiled config and errors.

Default construction is not compilation. A recipe may publish a complete
default config by calling `Value.Create` on its executable public schema and
validating the result. Every persisted or runtime caller supplies a complete
value after that point.

## Algorithm (current)

At a high level, `compileRecipeConfig(...)` does:

1) For each stage:
   - validate the supplied public stage config unchanged against its authoring
     schema
   - run `stage.toInternal({ setup, stageConfig })` to produce:
     - `knobs` (derived tuning values)
     - `rawSteps` (recipe-produced internal per-step inputs)
   - error if `toInternal` references unknown step ids

2) For each step in the stage:
   - materialize defaults on the recipe-produced internal step input
   - strict-validate against the step schema
   - run `step.normalize(...)` (optional), then strict-validate again (shape-preserving requirement)
   - run declared op normalization over operation config only and bind op implementations
   - strict-validate again as a final gate

The output is per-stage, per-step compiled config that is then inserted into `RecipeV2.steps[].config`.

The step materialization in item 2 is the only defaulting boundary in this
algorithm. It cannot accept or repair incomplete public recipe config: it runs
only after a complete public stage value has passed validation and the stage has
translated that value into an internal step envelope.

`MapSetup` is admitted at the run boundary. Step normalization may derive configuration from that
already-valid physical setup; domain-operation normalization never receives setup and cannot become
a second owner of dimension, seed, or latitude validation.

## Error model

Config compilation throws `RecipeCompileError` with a list of structured error items.

## Ground truth anchors

- Config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Exact validation and op normalization: `packages/mapgen-core/src/compiler/normalize.ts`
- Authoring surface that calls compilation: `packages/mapgen-core/src/authoring/recipe.ts`
- Complete-config policy: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Policy: compilation vs execution split: `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`
