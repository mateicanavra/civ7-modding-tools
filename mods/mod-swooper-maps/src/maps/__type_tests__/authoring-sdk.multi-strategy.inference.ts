/// <reference types="@civ7/types" />

import type {
  OpTypeBagOf,
  RecipeModule,
  Static,
  StepRuntimeOps,
} from "@swooper/mapgen-core/authoring";
import {
  createRecipe,
  createStage,
  createStep,
  defineOp,
  defineStep,
  Type,
} from "@swooper/mapgen-core/authoring";
import type { IsAny, IsEqual, IsNever, IsStringLiteral, IsUnknown, Or } from "type-fest";

// This file exists purely to lock in critical authoring type paths:
// - defineOp strategies stay narrow (not widened to string)
// - multi-strategy op envelopes remain discriminated unions
// - defineStep merges op envelope schemas into the step schema
// - createStep / createStage / createRecipe preserve literal ids so config surfaces are keyed (no index signatures)

type Expect<T extends true> = T;

// --- Op contract: multi-strategy discrimination must remain intact.

const MultiStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-multi-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    default: Type.Object(
      {
        // Distinct property name so we can test discriminated narrowing.
        plateauCount: Type.Integer({ default: 3, minimum: 1 }),
      },
      { additionalProperties: false }
    ),
    fast: Type.Object(
      {
        // Distinct property name so we can test discriminated narrowing.
        turbo: Type.Boolean({ default: true }),
      },
      { additionalProperties: false }
    ),
  },
});

type _StrategyIds = keyof (typeof MultiStrategyOp)["strategies"] & string;
// If strategies are constrained via an index signature, keyof will widen to `string`.
// This MUST remain narrow or IntelliSense degenerates.
export type _StrategyIdsAreNarrow = Expect<IsStringLiteral<_StrategyIds>>;

// The op envelope type should be a discriminated union over `strategy`.
type _Envelope = Static<(typeof MultiStrategyOp)["config"]>;

type _EnvelopeStrategy = _Envelope["strategy"];
export type _EnvelopeStrategyIsNarrow = Expect<IsStringLiteral<_EnvelopeStrategy>>;

// OpTypeBagOf is the canonical authoring surface for runtime ops;
// it MUST preserve the envelope union (strategy + config shapes).
type _BagEnvelope = OpTypeBagOf<typeof MultiStrategyOp>["envelope"];
type _BagEnvelopeStrategy = _BagEnvelope["strategy"];
export type _BagEnvelopeStrategyIsNarrow = Expect<IsStringLiteral<_BagEnvelopeStrategy>>;

type _DefaultConfig = Extract<_Envelope, { strategy: "default" }>["config"];
type _FastConfig = Extract<_Envelope, { strategy: "fast" }>["config"];

// Discriminated branches must preserve their own config shapes.
type _DefaultHasPlateauCount = "plateauCount" extends keyof _DefaultConfig ? true : false;
export type _DefaultHasPlateauCountAssertion = Expect<IsEqual<_DefaultHasPlateauCount, true>>;

type _FastHasTurbo = "turbo" extends keyof _FastConfig ? true : false;
export type _FastHasTurboAssertion = Expect<IsEqual<_FastHasTurbo, true>>;

// And MUST NOT pick up each other's keys.
type _DefaultHasTurbo = "turbo" extends keyof _DefaultConfig ? true : false;
export type _DefaultLacksTurboAssertion = Expect<IsEqual<_DefaultHasTurbo, false>>;

type _FastHasPlateauCount = "plateauCount" extends keyof _FastConfig ? true : false;
export type _FastLacksPlateauCountAssertion = Expect<IsEqual<_FastHasPlateauCount, false>>;

function _acceptsEnvelopeStrategy(_s: _EnvelopeStrategy): void {
  // type-only
}

// @ts-expect-error - strategy must be one of the declared strategy ids.
_acceptsEnvelopeStrategy("nope");

defineOp({
  kind: "compute",
  id: "test/missing-default-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    // @ts-expect-error - defineOp requires a default strategy.
    fast: Type.Object({}, { additionalProperties: false }),
  },
});

// --- Step contract: op envelope schemas must be merged into step schema.

const MultiOpStepContract = defineStep({
  id: "multi-op-step",
  phase: "foundation",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  ops: {
    multi: MultiStrategyOp,
  },
});

type _StepRuntimeConfig = Static<(typeof MultiOpStepContract)["schema"]>;

// Step schema should include the op envelope property.
type _StepHasMulti = "multi" extends keyof _StepRuntimeConfig ? true : false;
export type _StepHasMultiAssertion = Expect<IsEqual<_StepHasMulti, true>>;

// And it should match the op's envelope type (i.e. be discriminated, not `unknown`).
type _StepMultiEnvelope = _StepRuntimeConfig["multi"];

export type _StepMultiEnvelopeIsNotUnknown = Expect<
  Or<
    Or<IsNever<_StepMultiEnvelope>, IsUnknown<_StepMultiEnvelope>>,
    IsAny<_StepMultiEnvelope>
  > extends true
    ? false
    : true
>;

// Step runtime ops must receive the typed envelope (not unknown/any).
type _RuntimeOps = StepRuntimeOps<{ multi: typeof MultiStrategyOp }>;
type _RuntimeOpConfigParam = Parameters<_RuntimeOps["multi"]>[1];
type _RuntimeOpConfigHasStrategy = "strategy" extends keyof _RuntimeOpConfigParam ? true : false;
export type _RuntimeOpConfigHasStrategyAssertion = Expect<
  IsEqual<_RuntimeOpConfigHasStrategy, true>
>;

// --- Stage + Recipe config authoring: keys must remain literal and indexed by known ids.

const MultiOpStep = createStep(MultiOpStepContract, { run: () => {} });

const KnobsSchema = Type.Object({}, { additionalProperties: false });

const TypeTestStage = createStage({
  id: "type-test",
  knobsSchema: KnobsSchema,
  steps: [MultiOpStep] as const,
});

const TypeTestRecipe = createRecipe({
  id: "test.type-recipe",
  tagDefinitions: [],
  stages: [TypeTestStage] as const,
  compileOpsById: {},
});

type _ConfigInput =
  typeof TypeTestRecipe extends RecipeModule<any, infer TConfigInput, any> ? TConfigInput : never;

// Accessing unknown stage ids should be a type error (no index signature).
// @ts-expect-error - unknown stage id should not be indexable.
type _NoBogusStage = _ConfigInput["bogus-stage"];

type _TypeTestStageConfig = NonNullable<_ConfigInput["type-test"]>;

// @ts-expect-error - unknown step id should not be indexable.
type _NoBogusStep = _TypeTestStageConfig["bogus-step"];

type _TypeTestStepConfig = NonNullable<_TypeTestStageConfig["multi-op-step"]>;

// Step config should include the op envelope authoring surface.
type _StepConfigHasMulti = "multi" extends keyof _TypeTestStepConfig ? true : false;
export type _StepConfigHasMultiAssertion = Expect<IsEqual<_StepConfigHasMulti, true>>;

type _AuthoredMultiEnvelope = NonNullable<_TypeTestStepConfig["multi"]>;

// The authored envelope should still keep strategy ids narrow.
type _AuthoredStrategy = _AuthoredMultiEnvelope extends { strategy?: infer S } ? S : never;
export type _AuthoredStrategyIsNarrow = Expect<
  IsStringLiteral<Exclude<_AuthoredStrategy, undefined>>
>;

const _okConfig: _ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": {
      multi: {
        strategy: "fast",
        config: {
          turbo: true,
        },
      },
    },
  },
};

const _badStrategyConfig: _ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": {
      multi: {
        // @ts-expect-error - invalid strategy string should fail.
        strategy: "nope",
        config: { turbo: true },
      },
    },
  },
};

const _badConfigValueType: _ConfigInput = {
  "type-test": {
    knobs: {},
    "multi-op-step": {
      multi: {
        strategy: "fast",
        config: {
          // @ts-expect-error - turbo must be boolean.
          turbo: 123,
        },
      },
    },
  },
};

void _okConfig;
void _badStrategyConfig;
void _badConfigValueType;

export {};
