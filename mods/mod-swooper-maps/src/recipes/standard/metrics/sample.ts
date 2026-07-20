import type { NonEmptyTuple } from "type-fest";
import type { StandardMapCapture } from "./capture.js";
import { measureStandardEcology, type StandardEcologyMetrics } from "./families/ecology.js";
import { measureStandardGeography, type StandardGeographyMetrics } from "./families/geography.js";
import { measureStandardHydrology, type StandardHydrologyMetrics } from "./families/hydrology.js";
import { measureStandardPlacement, type StandardPlacementMetrics } from "./families/placement.js";
import { measureStandardRelief, type StandardReliefMetrics } from "./families/relief.js";
import { measureStandardResources, type StandardResourceMetrics } from "./families/resources.js";

/** Family measurements projected from one completed Standard map. */
export type StandardMapMetrics = Readonly<{
  geography: StandardGeographyMetrics;
  relief: StandardReliefMetrics;
  hydrology: StandardHydrologyMetrics;
  ecology: StandardEcologyMetrics;
  resources: StandardResourceMetrics;
  placement: StandardPlacementMetrics;
}>;

/** Immutable scenario identity paired with one complete set of Standard product measurements. */
export type StandardMapProductSample = Readonly<{
  provenance: StandardMapCapture["provenance"] & Readonly<{ recipeId: "standard" }>;
  metrics: StandardMapMetrics;
}>;

/** A nonempty Standard sample set evaluated as one product cohort. */
export type StandardMapMetricCohort = NonEmptyTuple<StandardMapProductSample>;

/** Measures every Standard product family from one already-closed capture. */
export function measureStandardMapCapture(capture: StandardMapCapture): StandardMapProductSample {
  return Object.freeze({
    provenance: Object.freeze({ recipeId: "standard", ...capture.provenance }),
    metrics: Object.freeze({
      geography: measureStandardGeography(capture),
      relief: measureStandardRelief(capture),
      hydrology: measureStandardHydrology(capture),
      ecology: measureStandardEcology(capture),
      resources: measureStandardResources(capture),
      placement: measureStandardPlacement(capture),
    }),
  });
}
