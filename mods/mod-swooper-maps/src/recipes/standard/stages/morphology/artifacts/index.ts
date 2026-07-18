import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as beltDrivers from "./belt-drivers.artifact.js";
import * as coastlineMetrics from "./coastline-metrics.artifact.js";
import * as landmasses from "./landmasses.artifact.js";
import * as mountains from "./mountains.artifact.js";
import * as routing from "./routing.artifact.js";
import * as shelf from "./shelf.artifact.js";
import * as substrate from "./substrate.artifact.js";
import * as baseSubstrate from "./substrate-base.artifact.js";
import * as topography from "./topography.artifact.js";
import * as baseTopography from "./topography-base.artifact.js";
import * as carvedTopography from "./topography-carved.artifact.js";
import * as erodedTopography from "./topography-eroded.artifact.js";
import * as volcanoes from "./volcanoes.artifact.js";

const catalog = defineArtifactCatalog({
  beltDrivers,
  coastlineMetrics,
  landmasses,
  mountains,
  routing,
  shelf,
  baseSubstrate,
  substrate,
  baseTopography,
  carvedTopography,
  erodedTopography,
  topography,
  volcanoes,
});

/** morphology artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** morphology artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
