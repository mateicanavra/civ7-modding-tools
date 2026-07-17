/** The size and graph diameter already measured for one connected component. */
export type MetricComponent = Readonly<{
  size: number;
  diameter: number;
}>;

/** Product-neutral topology facts summarized from authoritative component measurements. */
export type ComponentMetricSummary = Readonly<{
  componentCount: number;
  largestComponentSize: number;
  maximumComponentDiameter: number;
  singleTileComponentCount: number;
}>;

/**
 * Summarizes component rows without reimplementing the grid topology that produced them.
 * Empty input truthfully describes an empty topology; malformed component facts are refused.
 */
export function summarizeMetricComponents(
  components: readonly MetricComponent[]
): ComponentMetricSummary {
  let largestComponentSize = 0;
  let maximumComponentDiameter = 0;
  let singleTileComponentCount = 0;

  for (const component of components) {
    if (!Number.isSafeInteger(component.size) || component.size <= 0) {
      throw new Error(
        `Metric component size must be a positive integer; received ${component.size}.`
      );
    }
    if (!Number.isSafeInteger(component.diameter) || component.diameter < 0) {
      throw new Error(
        `Metric component diameter must be a nonnegative integer; received ${component.diameter}.`
      );
    }
    if (component.diameter > component.size - 1) {
      throw new Error(
        `Metric component diameter ${component.diameter} cannot exceed size minus one (${component.size - 1}).`
      );
    }
    largestComponentSize = Math.max(largestComponentSize, component.size);
    maximumComponentDiameter = Math.max(maximumComponentDiameter, component.diameter);
    if (component.size === 1) singleTileComponentCount += 1;
  }

  return Object.freeze({
    componentCount: components.length,
    largestComponentSize,
    maximumComponentDiameter,
    singleTileComponentCount,
  });
}
