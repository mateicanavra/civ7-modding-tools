<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="algorithm" title="Algorithm (current)"/>
  <item id="error-model" title="Error model"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Config compilation

## Purpose

Define how user config is compiled into a strict, schema-valid configuration bundle that can be instantiated into a structural recipe and then compiled into a plan.

## Contract

Config compilation must be:

- **strict**: unknown keys are errors, not ignored,
- **shape-preserving**: any normalization must still validate against the step schema,
- **deterministic**: the same inputs produce the same compiled config and errors.

## Algorithm (current)

At a high level, `compileRecipeConfig(...)` does:

1) For each stage:
   - validate stage config against `stage.surfaceSchema` (strict)
   - run `stage.toInternal({ env, stageConfig })` to produce:
     - `knobs` (derived tuning values)
     - `rawSteps` (per-step config inputs)
   - error if `toInternal` references unknown step ids

2) For each step in the stage:
   - prefill op defaults
   - strict-validate against the step schema
   - run `step.normalize(...)` (optional), then strict-validate again (shape-preserving requirement)
   - normalize op envelopes and bind op implementations
   - strict-validate again as a final gate

The output is per-stage, per-step compiled config that is then inserted into `RecipeV2.steps[].config`.

## Error model

Config compilation throws `RecipeCompileError` with a list of structured error items.

## Ground truth anchors

- Config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Strict normalization helper: `packages/mapgen-core/src/compiler/normalize.ts`
- Authoring surface that calls compilation: `packages/mapgen-core/src/authoring/recipe.ts`
- Policy: compilation vs execution split: `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`

