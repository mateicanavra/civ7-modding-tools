/**
 * Developer diagnostics module for map generation.
 *
 * Provides logging, timing, ASCII visualization, histograms, and summaries
 * for debugging foundation/climate/biomes behavior.
 *
 * All diagnostics are no-op unless trace verbosity is enabled.
 *
 * @example
 * ```typescript
 * import { devLog, timeSection, logFoundationSummary } from "@swooper/mapgen-core/dev";
 *
 * // Use timing wrapper
 * const result = timeSection(context.trace, "Foundation init", () => initFoundation());
 *
 * // Log summaries
 * logFoundationSummary(context.trace, adapter, width, height, foundation);
 * ```
 *
 * @module dev
 */

// Logging
export {
  devLog,
  devLogIf,
  devLogPrefixed,
  devWarn,
  devError,
  devLogJson,
  devLogLines,
} from "@mapgen/dev/logging.js";

// Timing
export {
  timeSection,
  timeStart,
  timeEnd,
  measureMs,
  type TimingToken,
} from "@mapgen/dev/timing.js";

// Engine surface introspection
export { logEngineSurfaceApisOnce } from "@mapgen/dev/introspection.js";
export {
  snapshotEngineHeightfield,
  type EngineHeightfieldSnapshot,
} from "@mapgen/dev/engine-heightfield.js";

// General-purpose visualization helpers
export { BYTE_SHADE_RAMP, shadeByte } from "@mapgen/dev/shading.js";

// ASCII visualization
export {
  ASCII_CHARS,
  computeSampleStep,
  renderAsciiGrid,
  logAsciiGrid,
  logFoundationAscii,
  logLandmassAscii,
  logReliefAscii,
  logRainfallAscii,
  logBiomeAscii,
  type AsciiGridConfig,
  type AsciiCell,
} from "@mapgen/dev/ascii.js";

// Histograms
export {
  buildHistogram,
  formatHistogramPercent,
  logRainfallHistogram,
  logRainfallStats,
  logFoundationHistograms,
  logBoundaryMetrics,
} from "@mapgen/dev/histograms.js";

// Summaries
export {
  logFoundationSummary,
  logBiomeSummary,
  logMountainSummary,
  logVolcanoSummary,
  logElevationSummary,
  logLandmassWindows,
  type FoundationPlates,
} from "@mapgen/dev/summaries.js";

// Visualization metadata helpers
export { defineVizMeta } from "@mapgen/dev/viz-meta.js";

// Vector visualization helpers
export { dumpVectorFieldVariants, type VectorFieldVariantsOptions } from "@mapgen/dev/viz-vector.js";

// Scalar visualization helpers
export { dumpScalarFieldVariants, type ScalarFieldVariantsOptions } from "@mapgen/dev/viz-scalar.js";

/** Module version */
export const DEV_MODULE_VERSION = "1.0.0";
