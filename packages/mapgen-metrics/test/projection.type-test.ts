import type { IsEqual } from "type-fest";
import type { MetricProjection, MetricValue } from "../src/index.js";

type Expect<T extends true> = T;

export type ProjectionUsesMetricValues = Expect<
  IsEqual<MetricProjection, Readonly<Record<string, MetricValue>>>
>;

declare const projection: MetricProjection;

// @ts-expect-error Metric projection identities cannot be replaced after projection.
projection.score = 3;

// @ts-expect-error Metric projections admit only the closed MetricValue representation.
const invalidProjection: MetricProjection = { callback: () => 3 };
