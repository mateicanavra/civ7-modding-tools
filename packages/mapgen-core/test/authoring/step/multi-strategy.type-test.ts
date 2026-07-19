import type { Static, StepRuntimeOps } from "@mapgen/authoring/index.js";
import { defineOp, defineStep, Type } from "@mapgen/authoring/index.js";
import type { IsAny, IsEqual, IsNever, IsUnknown, Or } from "type-fest";
import type { StepOpUse } from "../../../src/authoring/step/ops.js";

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

const MultiOpStepContract = defineStep({
  id: "multi-op-step",
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

const FastDefaultStepContract = defineStep({
  id: "fast-default-step",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  ops: { multi: { contract: MultiStrategyOp, defaultStrategy: "fast" } },
});

const reusableFastDefault: StepOpUse<typeof MultiStrategyOp, "fast"> = {
  contract: MultiStrategyOp,
  defaultStrategy: "fast",
};

const ReusableFastDefaultStepContract = defineStep({
  id: "reusable-fast-default-step",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  ops: { multi: reusableFastDefault },
});

defineStep({
  id: "invalid-inline-default-step",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  ops: {
    // @ts-expect-error A step override must name a strategy from its own contract.
    multi: {
      contract: MultiStrategyOp,
      defaultStrategy: "missing",
    },
  },
});

type FastDefaultMultiOp = Required<typeof FastDefaultStepContract>["ops"]["multi"];

export type StepOverrideDefaultStrategyIsExact = Expect<
  IsEqual<FastDefaultMultiOp["defaultStrategy"], "fast">
>;
export type StepOverrideDefaultConfigIsExact = Expect<
  IsEqual<
    FastDefaultMultiOp["defaultConfig"],
    Extract<Static<(typeof MultiStrategyOp)["config"]>, { strategy: "fast" }>
  >
>;
export type BaseDefaultRemainsBalanced = Expect<
  IsEqual<(typeof MultiStrategyOp)["defaultStrategy"], "balanced">
>;
export type ReusableStepOverrideRemainsFast = Expect<
  IsEqual<
    Required<typeof ReusableFastDefaultStepContract>["ops"]["multi"]["defaultStrategy"],
    "fast"
  >
>;
