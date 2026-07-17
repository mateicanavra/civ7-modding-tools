import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as crust from "./crust.artifact.js";
import * as crustInit from "./crust-init.artifact.js";
import * as currentTectonics from "./current-tectonics.artifact.js";
import * as mantleForcing from "./mantle-forcing.artifact.js";
import * as mantlePotential from "./mantle-potential.artifact.js";
import * as mesh from "./mesh.artifact.js";
import * as plateGraph from "./plate-graph.artifact.js";
import * as plateIdByEra from "./plate-id-by-era.artifact.js";
import * as plateMotion from "./plate-motion.artifact.js";
import * as plateTopology from "./plate-topology.artifact.js";
import * as tectonicEraFields from "./tectonic-era-fields.artifact.js";
import * as tectonicEvents from "./tectonic-events.artifact.js";
import * as tectonicHistory from "./tectonic-history.artifact.js";
import * as tectonicProvenance from "./tectonic-provenance.artifact.js";
import * as tectonicSegments from "./tectonic-segments.artifact.js";
import * as tracerIndexByEra from "./tracer-index-by-era.artifact.js";

const catalog = defineArtifactCatalog({
  crust,
  crustInit,
  currentTectonics,
  mantleForcing,
  mantlePotential,
  mesh,
  plateGraph,
  plateIdByEra,
  plateMotion,
  plateTopology,
  tectonicEraFields,
  tectonicEvents,
  tectonicHistory,
  tectonicProvenance,
  tectonicSegments,
  tracerIndexByEra,
});

/** Foundation artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** Foundation artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
