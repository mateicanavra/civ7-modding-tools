import type { OpTypeBagOf, Static } from "@mapgen/authoring/index.js";
import { defineOp, Type } from "@mapgen/authoring/index.js";
import type { IsEqual, IsStringLiteral } from "type-fest";

type Expect<T extends true> = T;

const MultiStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-multi-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  defaultStrategy: "balanced",
  strategies: {
    balanced: Type.Object(
      { plateauCount: Type.Integer({ default: 3, minimum: 1 }) },
      { additionalProperties: false }
    ),
    fast: Type.Object({ turbo: Type.Boolean({ default: true }) }, { additionalProperties: false }),
  },
});

type StrategyIds = keyof (typeof MultiStrategyOp)["strategies"] & string;
export type StrategyIdsAreNarrow = Expect<IsStringLiteral<StrategyIds>>;

type Envelope = Static<(typeof MultiStrategyOp)["config"]>;
type EnvelopeStrategy = Envelope["strategy"];
export type EnvelopeStrategyIsNarrow = Expect<IsStringLiteral<EnvelopeStrategy>>;

type BagEnvelope = OpTypeBagOf<typeof MultiStrategyOp>["envelope"];
type BagEnvelopeStrategy = BagEnvelope["strategy"];
export type BagEnvelopeStrategyIsNarrow = Expect<IsStringLiteral<BagEnvelopeStrategy>>;

export type ContractDefaultStrategyIsExact = Expect<
  IsEqual<(typeof MultiStrategyOp)["defaultStrategy"], "balanced">
>;
export type ContractDefaultConfigIsExact = Expect<
  IsEqual<(typeof MultiStrategyOp)["defaultConfig"], Extract<Envelope, { strategy: "balanced" }>>
>;

type DefaultConfig = Extract<Envelope, { strategy: "balanced" }>["config"];
type FastConfig = Extract<Envelope, { strategy: "fast" }>["config"];
export type DefaultHasPlateauCount = Expect<
  IsEqual<"plateauCount" extends keyof DefaultConfig ? true : false, true>
>;
export type FastHasTurbo = Expect<IsEqual<"turbo" extends keyof FastConfig ? true : false, true>>;
export type DefaultLacksTurbo = Expect<
  IsEqual<"turbo" extends keyof DefaultConfig ? true : false, false>
>;
export type FastLacksPlateauCount = Expect<
  IsEqual<"plateauCount" extends keyof FastConfig ? true : false, false>
>;

function acceptsEnvelopeStrategy(_strategy: EnvelopeStrategy): void {}

// @ts-expect-error Only declared strategy ids are accepted.
acceptsEnvelopeStrategy("nope");

defineOp({
  kind: "compute",
  id: "test/unknown-default-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error The default must name one of this contract's declared strategies.
  defaultStrategy: "missing",
  strategies: {
    balanced: Type.Object({}, { additionalProperties: false }),
    fast: Type.Object({}, { additionalProperties: false }),
  },
});
