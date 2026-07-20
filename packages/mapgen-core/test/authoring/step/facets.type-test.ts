import { createStep, defineStep, Type } from "@mapgen/authoring/index.js";
import type { StepFacetSinks } from "@mapgen/engine/index.js";
import type { IsEqual } from "type-fest";

type Expect<T extends true> = T;

const FacetedStep = createStep(
  defineStep({
    id: "faceted-step",
    phase: "foundation",
    requires: [],
    provides: [],
    schema: Type.Object({ scale: Type.Number() }, { additionalProperties: false }),
  }),
  {
    run: (_context, config) => ({
      score: config.scale * 2,
      nested: { ready: true },
      samples: new Float32Array([1, 2]),
    }),
    metrics: (input) => {
      const { result, config, dimensions } = input;
      type ResultScoreIsInferred = Expect<IsEqual<typeof result.score, number>>;
      type ResultNestedStateIsInferred = Expect<IsEqual<typeof result.nested.ready, boolean>>;
      type ResultSamplesAreInferred = Expect<
        typeof result.samples extends Float32Array ? true : false
      >;

      // @ts-expect-error The borrowed result binding cannot be replaced.
      input.result = result;
      // @ts-expect-error The borrowed config binding cannot be replaced.
      input.config = config;
      // @ts-expect-error Execution dimensions are immutable author input.
      dimensions.width = 0;

      return { score: result.score, scale: config.scale, width: dimensions.width };
    },
    viz: ({ result }) => {
      type VizResultMatchesRun = Expect<IsEqual<typeof result.score, number>>;
      return [];
    },
  }
);

type InferredResult = Awaited<ReturnType<(typeof FacetedStep)["run"]>>;
export type StepRunScoreIsPreserved = Expect<IsEqual<InferredResult["score"], number>>;
export type StepRunNestedStateIsPreserved = Expect<
  IsEqual<InferredResult["nested"]["ready"], boolean>
>;
export type StepRunSamplesArePreserved = Expect<
  InferredResult["samples"] extends Float32Array ? true : false
>;

const AsyncFacetedStep = createStep(
  defineStep({
    id: "async-faceted-step",
    phase: "foundation",
    requires: [],
    provides: [],
    schema: Type.Object({}, { additionalProperties: false }),
  }),
  {
    run: async () => ({ score: 3 }),
    metrics: ({ result }) => {
      type AsyncResultIsAwaited = Expect<IsEqual<typeof result.score, number>>;
      return { score: result.score };
    },
  }
);

export type AsyncStepRunResultIsPreserved = Expect<
  IsEqual<Awaited<ReturnType<(typeof AsyncFacetedStep)["run"]>>, { score: number }>
>;

export const SynchronousFacetSinksCompile = {
  metrics: () => undefined,
  viz: () => undefined,
  onError: () => undefined,
} satisfies StepFacetSinks;

export const AsyncFacetSinksAreRejected: StepFacetSinks = {
  // @ts-expect-error Metric sinks cannot cross an asynchronous boundary.
  metrics: async () => undefined,
  // @ts-expect-error Visualization sinks cannot cross an asynchronous boundary.
  viz: async () => undefined,
  // @ts-expect-error Failure observers cannot cross an asynchronous boundary.
  onError: async () => undefined,
};
