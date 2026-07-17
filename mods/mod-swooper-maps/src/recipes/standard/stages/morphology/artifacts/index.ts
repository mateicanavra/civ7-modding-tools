import * as beltDrivers from "./belt-drivers.artifact.js";
import * as coastlineMetrics from "./coastline-metrics.artifact.js";
import * as landmasses from "./landmasses.artifact.js";
import * as mountains from "./mountains.artifact.js";
import * as routing from "./routing.artifact.js";
import * as shelf from "./shelf.artifact.js";
import * as substrate from "./substrate.artifact.js";
import * as topography from "./topography.artifact.js";
import * as volcanoes from "./volcanoes.artifact.js";

export {
  beltDrivers,
  coastlineMetrics,
  landmasses,
  mountains,
  routing,
  shelf,
  substrate,
  topography,
  volcanoes,
};

/** Contract modules retaining each Morphology artifact's schema, handle, and validator. */
export const artifactContracts = {
  beltDrivers,
  coastlineMetrics,
  landmasses,
  mountains,
  routing,
  shelf,
  substrate,
  topography,
  volcanoes,
} as const;

/**
 * Curated Morphology artifact handles spanning tectonic drivers, topography,
 * landforms, routing, coastlines, shelf truth, and projection intent.
 */
export const artifacts = {
  beltDrivers: beltDrivers.artifact,
  coastlineMetrics: coastlineMetrics.artifact,
  landmasses: landmasses.artifact,
  mountains: mountains.artifact,
  routing: routing.artifact,
  shelf: shelf.artifact,
  substrate: substrate.artifact,
  topography: topography.artifact,
  volcanoes: volcanoes.artifact,
} as const;

/** Validators keyed exactly like the Morphology artifact catalog for runtime payload admission. */
export const validators = {
  beltDrivers: beltDrivers.validate,
  coastlineMetrics: coastlineMetrics.validate,
  landmasses: landmasses.validate,
  mountains: mountains.validate,
  routing: routing.validate,
  shelf: shelf.validate,
  substrate: substrate.validate,
  topography: topography.validate,
  volcanoes: volcanoes.validate,
} as const;
