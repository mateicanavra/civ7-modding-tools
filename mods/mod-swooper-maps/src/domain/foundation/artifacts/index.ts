import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as crust } from "./crust.artifact.js";
import { artifact as crustTiles } from "./crust-tiles.artifact.js";
import { artifact as currentTectonics } from "./current-tectonics.artifact.js";
import { artifact as initialCrust } from "./initial-crust.artifact.js";
import { artifact as mantleForcing } from "./mantle-forcing.artifact.js";
import { artifact as mantlePotential } from "./mantle-potential.artifact.js";
import { artifact as mesh } from "./mesh.artifact.js";
import { artifact as plateGraph } from "./plate-graph.artifact.js";
import { artifact as plateIdByEra } from "./plate-id-by-era.artifact.js";
import { artifact as plateMotion } from "./plate-motion.artifact.js";
import { artifact as plateTopology } from "./plate-topology.artifact.js";
import { artifact as plates } from "./plates.artifact.js";
import { artifact as tectonicEraFields } from "./tectonic-era-fields.artifact.js";
import { artifact as tectonicEvents } from "./tectonic-events.artifact.js";
import { artifact as tectonicHistory } from "./tectonic-history.artifact.js";
import { artifact as tectonicHistoryTiles } from "./tectonic-history-tiles.artifact.js";
import { artifact as tectonicProvenance } from "./tectonic-provenance.artifact.js";
import { artifact as tectonicProvenanceTiles } from "./tectonic-provenance-tiles.artifact.js";
import { artifact as tectonicSegments } from "./tectonic-segments.artifact.js";
import { artifact as tracerIndexByEra } from "./tracer-index-by-era.artifact.js";

/** Foundation artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  crust,
  crustTiles,
  currentTectonics,
  initialCrust,
  mantleForcing,
  mantlePotential,
  mesh,
  plateGraph,
  plateIdByEra,
  plateMotion,
  plateTopology,
  plates,
  tectonicEraFields,
  tectonicEvents,
  tectonicHistory,
  tectonicHistoryTiles,
  tectonicProvenance,
  tectonicProvenanceTiles,
  tectonicSegments,
  tracerIndexByEra,
});
