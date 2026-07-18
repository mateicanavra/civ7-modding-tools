import type { RecipeModule } from "@mapgen/authoring/index.js";
import {
  createRecipe,
  createStage,
  createStep,
  defineOp,
  defineStep,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsEqual, IsStringLiteral } from "type-fest";

type Expect<T extends true> = T;

const MultiStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-multi-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    default: Type.Object({ plateauCount: Type.Integer() }, { additionalProperties: false }),
    fast: Type.Object({ turbo: Type.Boolean() }, { additionalProperties: false }),
  },
});

const MultiOpStep = createStep(
  defineStep({
    id: "multi-op-step",
    phase: "foundation",
    requires: [],
    provides: [],
    schema: Type.Object({}, { additionalProperties: false }),
    ops: { multi: MultiStrategyOp },
  }),
  { run: () => {} }
);

const TypeTestStage = createStage({
  id: "type-test",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [MultiOpStep] as const,
});

const TypeTestRecipe = createRecipe({
  id: "test.type-recipe",
  tagDefinitions: [],
  stages: [TypeTestStage] as const,
  compileOpsById: {},
});

if (false) {
  const replacementCompile: typeof TypeTestRecipe.compile = () => {
    throw new Error("unreachable");
  };
  // @ts-expect-error Compiled recipe capabilities are immutable after authorship.
  TypeTestRecipe.compile = replacementCompile;
  // @ts-expect-error Public recipe structure is deeply readonly.
  TypeTestRecipe.recipe.steps[0]!.id = "forged";
  // @ts-expect-error Public recipe structure cannot acquire new execution nodes.
  TypeTestRecipe.recipe.steps.push({ id: "forged" });
}

type ConfigInput =
  typeof TypeTestRecipe extends RecipeModule<infer TConfigInput, any> ? TConfigInput : never;

// @ts-expect-error Unknown stage ids are not part of the authored config.
type NoBogusStage = ConfigInput["bogus-stage"];

type TypeTestStageConfig = NonNullable<ConfigInput["type-test"]>;
// @ts-expect-error Unknown step ids are not part of the authored config.
type NoBogusStep = TypeTestStageConfig["bogus-step"];

type TypeTestStepConfig = NonNullable<TypeTestStageConfig["multi-op-step"]>;
export type StepConfigHasMulti = Expect<
  IsEqual<"multi" extends keyof TypeTestStepConfig ? true : false, true>
>;

type AuthoredMultiEnvelope = NonNullable<TypeTestStepConfig["multi"]>;
type AuthoredStrategy = AuthoredMultiEnvelope extends { strategy?: infer TStrategy }
  ? TStrategy
  : never;
export type AuthoredStrategyIsNarrow = Expect<
  IsStringLiteral<Exclude<AuthoredStrategy, undefined>>
>;

const validConfig: ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": { multi: { strategy: "fast", config: { turbo: true } } },
  },
};

const invalidStrategyConfig: ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": {
      multi: {
        // @ts-expect-error Only declared strategy ids are accepted.
        strategy: "nope",
        config: { turbo: true },
      },
    },
  },
};

const invalidValueConfig: ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": {
      multi: {
        strategy: "fast",
        config: {
          // @ts-expect-error The fast strategy requires a boolean turbo value.
          turbo: 123,
        },
      },
    },
  },
};

void validConfig;
void invalidStrategyConfig;
void invalidValueConfig;
