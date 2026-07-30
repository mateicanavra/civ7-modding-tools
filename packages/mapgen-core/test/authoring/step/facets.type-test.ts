import { createStep, defineStep, Type } from "@mapgen/authoring/index.js";
import type { StepFacetSinks } from "@mapgen/engine/index.js";
import type { IsEqual } from "type-fest";

type Expect<T extends true> = T;

const FacetedStep = createStep(
  defineStep({
    id: "faceted-step",
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
      const { observation, config, dimensions } = input;
      type ObservationScoreIsInferred = Expect<IsEqual<typeof observation.score, number>>;
      type ObservationNestedStateIsInferred = Expect<
        IsEqual<typeof observation.nested.ready, boolean>
      >;
      type ObservationSamplesAreInferred = Expect<
        typeof observation.samples extends Float32Array ? true : false
      >;

      // @ts-expect-error The invocation observation binding cannot be replaced.
      input.observation = observation;
      // @ts-expect-error The observed config binding cannot be replaced.
      input.config = config;
      // @ts-expect-error Execution dimensions are immutable author input.
      dimensions.width = 0;

      return { score: observation.score, scale: config.scale, width: dimensions.width };
    },
    viz: ({ observation }) => {
      type VizObservationMatchesRun = Expect<IsEqual<typeof observation.score, number>>;
      return [];
    },
  }
);

type InferredObservation = Awaited<ReturnType<(typeof FacetedStep)["run"]>>;
export type StepRunScoreIsPreserved = Expect<IsEqual<InferredObservation["score"], number>>;
export type StepRunNestedStateIsPreserved = Expect<
  IsEqual<InferredObservation["nested"]["ready"], boolean>
>;
export type StepRunSamplesArePreserved = Expect<
  InferredObservation["samples"] extends Float32Array ? true : false
>;

const AsyncFacetedStep = createStep(
  defineStep({
    id: "async-faceted-step",
    requires: [],
    provides: [],
  }),
  {
    run: async () => ({ score: 3 }),
    metrics: ({ observation }) => {
      type AsyncObservationIsAwaited = Expect<IsEqual<typeof observation.score, number>>;
      return { score: observation.score };
    },
  }
);

export type AsyncStepRunObservationIsPreserved = Expect<
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
