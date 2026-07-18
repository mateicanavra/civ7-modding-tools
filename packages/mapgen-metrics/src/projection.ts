import type { MetricValue } from "./target.js";

/** Semantic metric values projected by one generation unit for an execution-owned sink. */
export type MetricProjection = Readonly<Record<string, MetricValue>>;
