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

// ASCII visualization
export {
  ASCII_CHARS,
  type AsciiCell,
  type AsciiGridConfig,
  computeSampleStep,
  logAsciiGrid,
  logBiomeAscii,
  logFoundationAscii,
  logLandmassAscii,
  logRainfallAscii,
  logReliefAscii,
  renderAsciiGrid,
} from "@mapgen/dev/ascii.js";
export {
  type EngineHeightfieldSnapshot,
  snapshotEngineHeightfield,
} from "@mapgen/dev/engine-heightfield.js";
// Histograms
export {
  buildHistogram,
  formatHistogramPercent,
  logBoundaryMetrics,
  logFoundationHistograms,
  logRainfallHistogram,
  logRainfallStats,
} from "@mapgen/dev/histograms.js";
// Engine surface introspection
export { logEngineSurfaceApisOnce } from "@mapgen/dev/introspection.js";
// Logging
export {
  devError,
  devLog,
  devLogIf,
  devLogJson,
  devLogLines,
  devLogPrefixed,
  devWarn,
} from "@mapgen/dev/logging.js";
// General-purpose visualization helpers
export { BYTE_SHADE_RAMP, shadeByte } from "@mapgen/dev/shading.js";
// Summaries
export {
  type FoundationPlates,
  logBiomeSummary,
  logElevationSummary,
  logFoundationSummary,
  logLandmassWindows,
  logMountainSummary,
  logVolcanoSummary,
} from "@mapgen/dev/summaries.js";
// Timing
export {
  measureMs,
  type TimingToken,
  timeEnd,
  timeSection,
  timeStart,
} from "@mapgen/dev/timing.js";

// Visualization metadata helpers
export { defineVizMeta } from "@mapgen/dev/viz-meta.js";
// Scalar visualization helpers
export {
  dumpScalarFieldVariants,
  type ScalarFieldVariantsOptions,
} from "@mapgen/dev/viz-scalar.js";
// Vector visualization helpers
export {
  dumpVectorFieldVariants,
  type VectorFieldVariantsOptions,
} from "@mapgen/dev/viz-vector.js";

/** Module version */
export const DEV_MODULE_VERSION = "1.0.0";
