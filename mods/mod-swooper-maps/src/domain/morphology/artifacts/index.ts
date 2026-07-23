import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as beltDrivers } from "./belt-drivers.artifact.js";
import { artifact as carvedCoastline } from "./carved-coastline.artifact.js";
import { artifact as landmasses } from "./landmasses.artifact.js";
import { artifact as mountains } from "./mountains.artifact.js";
import { artifact as routing } from "./routing.artifact.js";
import { artifact as shelf } from "./shelf.artifact.js";
import { artifact as substrate } from "./substrate.artifact.js";
import { artifact as baseSubstrate } from "./substrate-base.artifact.js";
import { artifact as topography } from "./topography.artifact.js";
import { artifact as baseTopography } from "./topography-base.artifact.js";
import { artifact as carvedTopography } from "./topography-carved.artifact.js";
import { artifact as erodedTopography } from "./topography-eroded.artifact.js";
import { artifact as volcanoes } from "./volcanoes.artifact.js";

/** morphology artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  beltDrivers,
  carvedCoastline,
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
