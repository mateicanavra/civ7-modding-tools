import type { OpTypeBagOf, Static } from "@mapgen/authoring/index.js";
import {
  createOp,
  createStrategy,
  defineOp,
  defineStrategy,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsEqual, IsStringLiteral } from "type-fest";

type Expect<T extends true> = T;

const CanonicalMeasured = defineStrategy({
  id: "measured",
  config: Type.Object({ sampleCount: Type.Integer() }, { additionalProperties: false }),
});
const CanonicalEstimated = defineStrategy({
  id: "estimated",
  config: Type.Object({ bias: Type.Number() }, { additionalProperties: false }),
});
const widenedStrategyId: string = "widened";
defineStrategy({
  // @ts-expect-error Strategy identities must remain semantic string literals.
  id: widenedStrategyId,
  config: Type.Object({}, { additionalProperties: false }),
});
const ambiguousStrategyId: "measured" | "estimated" =
  Math.random() > 0.5 ? "measured" : "estimated";
defineStrategy({
  // @ts-expect-error One strategy definition owns one exact semantic identity.
  id: ambiguousStrategyId,
  config: Type.Object({}, { additionalProperties: false }),
});
const patternedStrategyId: `measured-${string}` = "measured-runtime";
defineStrategy({
  // @ts-expect-error Open template identities cannot define a finite strategy key.
  id: patternedStrategyId,
  config: Type.Object({}, { additionalProperties: false }),
});

defineOp({
  kind: "compute",
  id: "test/duplicate-canonical-strategy-definitions",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Number(),
  // @ts-expect-error The legacy overload cannot admit canonical strategy definition tuples.
  defaultStrategy: "measured",
  // @ts-expect-error Canonical strategy definition tuples cannot repeat an identity.
  strategies: [CanonicalMeasured, CanonicalMeasured, CanonicalEstimated],
});

const CanonicalOp = defineOp({
  kind: "compute",
  id: "test/canonical-strategy-types",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Number(),
  defaultStrategy: "measured",
  strategies: [CanonicalMeasured, CanonicalEstimated],
});
type CanonicalStrategyIds = keyof (typeof CanonicalOp)["strategies"] & string;
export type CanonicalStrategyIdsAreExact = Expect<
  IsEqual<CanonicalStrategyIds, "measured" | "estimated">
>;
export type CanonicalMeasuredConfigIsExact = Expect<
  IsEqual<Static<(typeof CanonicalOp)["strategies"]["measured"]["config"]>, { sampleCount: number }>
>;
const measuredImplementation = createStrategy(CanonicalOp, CanonicalMeasured, {
  run: (_input, config) => config.sampleCount,
});
const estimatedImplementation = createStrategy(CanonicalOp, CanonicalEstimated, {
  run: (_input, config) => config.bias,
});
createOp(CanonicalOp, { strategies: [estimatedImplementation, measuredImplementation] });
// @ts-expect-error Canonical implementation tuples must cover every declared strategy identity.
createOp(CanonicalOp, { strategies: [measuredImplementation] });
createOp(CanonicalOp, {
  // @ts-expect-error Canonical implementation tuples cannot repeat a strategy identity.
  strategies: [measuredImplementation, measuredImplementation, estimatedImplementation],
});

const CanonicalSole = defineOp({
  kind: "compute",
  id: "test/canonical-sole-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Number(),
  strategies: [CanonicalMeasured],
});
export type CanonicalSoleDefaultIsInferred = Expect<
  IsEqual<(typeof CanonicalSole)["defaultStrategy"], "measured">
>;

defineOp({
  kind: "compute",
  id: "test/canonical-redundant-sole-default",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Number(),
  // @ts-expect-error A sole canonical strategy is necessarily the default.
  defaultStrategy: "measured",
  // @ts-expect-error The legacy overload cannot admit canonical strategy definitions.
  strategies: [CanonicalMeasured],
});

defineOp({
  kind: "compute",
  id: "test/canonical-missing-multi-default",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Number(),
  // @ts-expect-error A canonical multi-strategy operation must declare its semantic default.
  strategies: [CanonicalMeasured, CanonicalEstimated],
});

const ForeignStrategy = defineStrategy({
  id: "foreign",
  config: Type.Object({}, { additionalProperties: false }),
});
// @ts-expect-error Implementations bind only to strategy definitions composed into the operation.
createStrategy(CanonicalOp, ForeignStrategy, { run: () => 0 });

const SoleStrategyOp = defineOp({
  kind: "compute",
  id: "test/compute-sole-strategy",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    measured: Type.Object(
      { sampleCount: Type.Integer({ default: 3, minimum: 1 }) },
      { additionalProperties: false }
    ),
  },
});

export type SoleStrategyIsInferredExactly = Expect<
  IsEqual<(typeof SoleStrategyOp)["defaultStrategy"], "measured">
>;
export type SoleDefaultConfigIsInferredExactly = Expect<
  IsEqual<
    (typeof SoleStrategyOp)["defaultConfig"],
    Readonly<{ strategy: "measured"; config: { sampleCount: number } }>
  >
>;

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

defineOp({
  kind: "compute",
  id: "test/redundant-sole-default",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error A sole semantic strategy is necessarily the default.
  defaultStrategy: "measured",
  strategies: {
    measured: Type.Object({}, { additionalProperties: false }),
  },
});

const ExplicitUndefinedSoleStrategyOp = defineOp({
  kind: "compute",
  id: "test/undefined-sole-default",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  defaultStrategy: undefined,
  strategies: {
    measured: Type.Object({}, { additionalProperties: false }),
  },
});
export type ExplicitUndefinedIsEquivalentToOmission = Expect<
  IsEqual<(typeof ExplicitUndefinedSoleStrategyOp)["defaultStrategy"], "measured">
>;

// @ts-expect-error A multi-strategy operation must declare its semantic default.
defineOp({
  kind: "compute",
  id: "test/missing-multi-default",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  strategies: {
    measured: Type.Object({}, { additionalProperties: false }),
    estimated: Type.Object({}, { additionalProperties: false }),
  },
});

defineOp({
  kind: "compute",
  id: "test/generic-strategy-identity",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error Strategy ids describe behavior; `default` is not a semantic identity.
  strategies: { default: Type.Object({}, { additionalProperties: false }) },
});

const symbolicStrategy = Symbol("symbolic-strategy");
defineOp({
  kind: "compute",
  id: "test/symbol-strategy-identity",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error Runtime strategy ids are enumerable string-literal keys.
  strategies: { [symbolicStrategy]: Type.Object({}, { additionalProperties: false }) },
});

const numericStrategySchema = Type.Object({}, { additionalProperties: false });
const numericStrategies: Readonly<Record<number, typeof numericStrategySchema>> = {
  1: numericStrategySchema,
};
defineOp({
  kind: "compute",
  id: "test/numeric-strategy-identity",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error Runtime strategy ids are enumerable string-literal keys.
  strategies: numericStrategies,
});

defineOp({
  kind: "compute",
  id: "test/empty-strategy-set",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error An operation must declare at least one strategy.
  strategies: {},
});
