import type {
  RecipeModule,
  Stage,
  StageModule,
  StageObservation,
} from "@mapgen/authoring/index.js";
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
  defaultStrategy: "balanced",
  strategies: {
    balanced: Type.Object({ plateauCount: Type.Integer() }, { additionalProperties: false }),
    fast: Type.Object({ turbo: Type.Boolean() }, { additionalProperties: false }),
  },
});

const MultiOpStep = createStep(
  defineStep({
    id: "multi-op-step",
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

const ConfigurationlessStage = createStage({
  id: "configurationless",
  compile: ({ config, knobs }) => {
    if (false) {
      // @ts-expect-error Configurationless compile input has no authored fields.
      config.extra;
      // @ts-expect-error Omitted stage knobs expose no authored fields.
      knobs.extra;
    }
    return { "multi-op-step": {} };
  },
  steps: [MultiOpStep] as const,
});

const InternalWithoutKnobsStage = createStage({
  id: "internal-without-knobs",
  steps: [MultiOpStep] as const,
});

const EmptyInternalStage = createStage({
  id: "empty-internal",
  steps: [] as const,
});

const EmptyCompiledStage = createStage({
  id: "empty-compiled",
  compile: () => ({}),
  steps: [] as const,
});

if (false) {
  createStage({
    id: "invalid-empty-compiled",
    // @ts-expect-error A zero-step compile function must return an exact empty object.
    compile: () => 1,
    steps: [] as const,
  });
}

const KnobsOnlyCompiledStage = createStage({
  id: "knobs-only-compiled",
  knobsSchema: Type.Object({ enabled: Type.Boolean() }, { additionalProperties: false }),
  compile: ({ knobs }) => ({ "multi-op-step": { enabled: knobs.enabled } }),
  steps: [MultiOpStep] as const,
});

const PublicWithoutKnobsStage = createStage({
  id: "public-without-knobs",
  public: Type.Object({ amount: Type.Number() }, { additionalProperties: false }),
  compile: ({ config }) => ({ "multi-op-step": { amount: config.amount } }),
  steps: [MultiOpStep] as const,
});

const PublicWithKnobsStage = createStage({
  id: "public-with-knobs",
  knobsSchema: Type.Object({ enabled: Type.Boolean() }, { additionalProperties: false }),
  public: Type.Object({ amount: Type.Number() }, { additionalProperties: false }),
  compile: ({ config, knobs }) => ({
    "multi-op-step": { amount: config.amount, enabled: knobs.enabled },
  }),
  steps: [MultiOpStep] as const,
});

const genericStages: readonly StageObservation[] = [
  TypeTestStage,
  ConfigurationlessStage,
  InternalWithoutKnobsStage,
  KnobsOnlyCompiledStage,
  PublicWithoutKnobsStage,
  PublicWithKnobsStage,
];
const genericEmptyInternal: StageObservation = EmptyInternalStage;
const legacyStage: Stage<typeof TypeTestStage.steps, typeof TypeTestStage.knobsSchema, undefined> =
  TypeTestStage;
const legacyStageModule: StageModule<
  typeof TypeTestStage.id,
  typeof TypeTestStage.knobsSchema,
  ReturnType<typeof TypeTestStage.toInternal>["knobs"],
  typeof TypeTestStage.steps,
  undefined
> = TypeTestStage;

type ConfigurationlessCompileInput = Parameters<typeof ConfigurationlessStage.compile>[0];
const nonemptyStageInput = { extra: true } as const;

if (false) {
  // @ts-expect-error Omitted knobs reject nonempty objects, including values held in variables.
  const invalidEmptyKnobs: ConfigurationlessCompileInput["knobs"] = nonemptyStageInput;
  // @ts-expect-error Omitted stage config rejects primitive values.
  const invalidEmptyConfig: ConfigurationlessCompileInput["config"] = 1;

  // @ts-expect-error A callback cannot re-infer the schema-derived knobs type.
  const invalidKnobsCompile: typeof KnobsOnlyCompiledStage.compile = ({
    knobs,
  }: {
    knobs: { enabled: string };
  }) => ({ "multi-op-step": { enabled: knobs.enabled } });

  // @ts-expect-error Public-stage knobs remain fixed by knobsSchema.
  const invalidPublicKnobsCompile: typeof PublicWithKnobsStage.compile = ({
    knobs,
  }: {
    knobs: { enabled: string };
  }) => ({ "multi-op-step": { enabled: knobs.enabled } });

  void invalidEmptyKnobs;
  void invalidEmptyConfig;
  void invalidKnobsCompile;
  void invalidPublicKnobsCompile;
}

void InternalWithoutKnobsStage;
void KnobsOnlyCompiledStage;
void PublicWithoutKnobsStage;
void PublicWithKnobsStage;
void genericStages;
void genericEmptyInternal;
void legacyStage;
void legacyStageModule;

const EmptyInternalRecipe = createRecipe({
  id: "test.empty-internal-recipe",
  tagDefinitions: [],
  stages: [EmptyInternalStage] as const,
  compileOpsById: {},
});

type EmptyInternalInput =
  typeof EmptyInternalRecipe extends RecipeModule<infer TConfigInput, any> ? TConfigInput : never;

const validEmptyInternalConfig: EmptyInternalInput = { "empty-internal": {} };
const invalidEmptyInternalConfig: EmptyInternalInput = {
  "empty-internal": {
    // @ts-expect-error Zero-step stages reject fields that runtime admission would also refuse.
    extra: true,
  },
};

void validEmptyInternalConfig;
void invalidEmptyInternalConfig;

const EmptyCompiledRecipe = createRecipe({
  id: "test.empty-compiled-recipe",
  tagDefinitions: [],
  stages: [EmptyCompiledStage] as const,
  compileOpsById: {},
});

type EmptyCompiledOutput =
  typeof EmptyCompiledRecipe extends RecipeModule<any, infer TConfigCompiled>
    ? TConfigCompiled
    : never;
type EmptyCompiledRawSteps = ReturnType<typeof EmptyCompiledStage.toInternal>["rawSteps"];

const validEmptyCompiledOutput: EmptyCompiledOutput = { "empty-compiled": {} };
const invalidEmptyCompiledPrimitive: EmptyCompiledOutput = {
  // @ts-expect-error Zero-step compiled output rejects primitive stage values.
  "empty-compiled": 1,
};
const invalidEmptyCompiledField: EmptyCompiledOutput = {
  "empty-compiled": {
    // @ts-expect-error Zero-step compiled output rejects fictional step fields.
    extra: {},
  },
};
const validEmptyCompiledRawSteps: EmptyCompiledRawSteps = {};
const invalidEmptyCompiledRawSteps: EmptyCompiledRawSteps = {
  // @ts-expect-error Zero-step compilation cannot invent step output fields.
  extra: {},
};

void validEmptyCompiledOutput;
void invalidEmptyCompiledPrimitive;
void invalidEmptyCompiledField;
void validEmptyCompiledRawSteps;
void invalidEmptyCompiledRawSteps;

const ConfigurationlessRecipe = createRecipe({
  id: "test.configurationless-recipe",
  tagDefinitions: [],
  stages: [ConfigurationlessStage] as const,
  compileOpsById: {},
});

type ConfigurationlessInput =
  typeof ConfigurationlessRecipe extends RecipeModule<infer TConfigInput, any>
    ? TConfigInput
    : never;

const validConfigurationlessConfig: ConfigurationlessInput = { configurationless: {} };
const invalidConfigurationlessConfig: ConfigurationlessInput = {
  configurationless: {
    // @ts-expect-error Configurationless stages do not persist fictional knobs.
    knobs: {},
  },
};

void validConfigurationlessConfig;
void invalidConfigurationlessConfig;

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
