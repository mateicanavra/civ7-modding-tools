import type { OpTypeBagOf, Static } from "@mapgen/authoring/index.js";
import { defineOp, Type } from "@mapgen/authoring/index.js";
import type { IsEqual, IsStringLiteral } from "type-fest";

type Expect<T extends true> = T;

const MultiStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-multi-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    default: Type.Object(
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

type DefaultConfig = Extract<Envelope, { strategy: "default" }>["config"];
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
  id: "test/missing-default-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    // @ts-expect-error Every operation requires a default strategy.
    fast: Type.Object({}, { additionalProperties: false }),
  },
});
