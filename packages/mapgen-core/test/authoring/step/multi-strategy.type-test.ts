import type { Static, StepRuntimeOps } from "@mapgen/authoring/index.js";
import { defineOp, defineStep, Type } from "@mapgen/authoring/index.js";
import type { IsAny, IsEqual, IsNever, IsUnknown, Or } from "type-fest";

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

const MultiOpStepContract = defineStep({
  id: "multi-op-step",
  phase: "foundation",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  ops: { multi: MultiStrategyOp },
});

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
