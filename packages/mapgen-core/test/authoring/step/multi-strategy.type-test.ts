import type { ArtifactReadValueOf, Static, StepRuntimeOps } from "@mapgen/authoring/index.js";
import {
  defineArtifact,
  defineOp,
  defineStep,
  defineStrategy,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsAny, IsEqual, IsNever, IsUnknown, Or } from "type-fest";

type Expect<T extends true> = T;

const MultiStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-multi-strategy",
  input: Type.Object(
    {
      payload: Type.Object(
        {
          rows: Type.Array(Type.Object({ value: Type.Integer() }, { additionalProperties: false })),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      result: Type.Object({ value: Type.Integer() }, { additionalProperties: false }),
      rows: Type.Array(Type.Integer()),
    },
    { additionalProperties: false }
  ),
  defaultStrategy: "balanced",
  strategies: [
    defineStrategy({
      id: "balanced",
      config: Type.Object({ plateauCount: Type.Integer() }, { additionalProperties: false }),
    }),
    defineStrategy({
      id: "fast",
      config: Type.Object({ turbo: Type.Boolean() }, { additionalProperties: false }),
    }),
  ],
});

const MultiOpStepContract = defineStep({
  id: "multi-op-step",
  requires: [],
  provides: [],
  ops: { multi: MultiStrategyOp },
});

const EmptyStepContract = defineStep({
  id: "empty-step",
  requires: [],
  provides: [],
});

defineStep({
  id: "invalid-explicit-empty-step",
  requires: [],
  provides: [],
  // @ts-expect-error Empty step-local schemas must be omitted so Core owns the empty surface.
  schema: Type.Object({}),
});

type EmptyStepConfig = Static<(typeof EmptyStepContract)["schema"]>;
export type OmittedStepSchemaIsEmpty = Expect<IsEqual<keyof EmptyStepConfig, never>>;

type StepRuntimeConfig = Static<(typeof MultiOpStepContract)["schema"]>;
export type StepHasMulti = Expect<
  IsEqual<"multi" extends keyof StepRuntimeConfig ? true : false, true>
>;

type StepMultiEnvelope = StepRuntimeConfig["multi"];
export type StepMultiEnvelopeIsKnown = Expect<
  Or<
    Or<IsNever<StepMultiEnvelope>, IsUnknown<StepMultiEnvelope>>,
    IsAny<StepMultiEnvelope>
  > extends true
    ? false
    : true
>;

type RuntimeOps = StepRuntimeOps<{ multi: typeof MultiStrategyOp }>;
type RuntimeOpConfig = Parameters<RuntimeOps["multi"]>[1];
export type RuntimeOpConfigHasStrategy = Expect<
  IsEqual<"strategy" extends keyof RuntimeOpConfig ? true : false, true>
>;

const MultiStrategyInputArtifact = defineArtifact({
  name: "multiStrategyInput",
  id: "artifact:test.multi-strategy-input",
  schema: MultiStrategyOp.input,
});
declare const publishedInput: ArtifactReadValueOf<typeof MultiStrategyInputArtifact>;

if (false) {
  const boundOps = {} as RuntimeOps;
  const multi = boundOps.multi;
  multi(publishedInput, {} as RuntimeOpConfig);
  // @ts-expect-error Step operation capability bindings are immutable across executions.
  boundOps.multi = multi;

  const input = {} as Parameters<typeof multi>[0];
  // @ts-expect-error Step operation inputs are observational data, so abstract inputs are readonly.
  input.payload.rows[0]!.value = 2;
  // @ts-expect-error Step operation input arrays cannot grow.
  input.payload.rows.push({ value: 2 });
  // @ts-expect-error Step operation input indexes cannot be replaced.
  input.payload.rows[0] = { value: 2 };

  const output = {} as ReturnType<typeof multi>;
  output.result.value = 2;
  output.rows[0] = 2;
  output.rows.push(3);
}

defineStep({
  id: "invalid-scoped-default-step",
  requires: [],
  provides: [],
  ops: {
    multi: {
      // @ts-expect-error Steps select canonical contracts, not step-local default wrappers.
      contract: MultiStrategyOp,
      defaultStrategy: "fast",
    },
  },
});

export type StepSelectionRetainsExactContract = Expect<
  IsEqual<Required<typeof MultiOpStepContract>["ops"]["multi"], typeof MultiStrategyOp>
>;
export type BaseDefaultRemainsBalanced = Expect<
  IsEqual<(typeof MultiStrategyOp)["defaultStrategy"], "balanced">
>;
