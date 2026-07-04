import * as beltDrivers from "./belt-drivers.artifact.js";
import * as coastlineMetrics from "./coastline-metrics.artifact.js";
import * as landmasses from "./landmasses.artifact.js";
import * as mountains from "./mountains.artifact.js";
import * as routing from "./routing.artifact.js";
import * as shelf from "./shelf.artifact.js";
import * as substrate from "./substrate.artifact.js";
import * as topography from "./topography.artifact.js";
import * as volcanoes from "./volcanoes.artifact.js";

export { beltDrivers, coastlineMetrics, landmasses, mountains, routing, shelf, substrate, topography, volcanoes };

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
