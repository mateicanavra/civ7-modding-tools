import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeEraPlateMembership from "./ops/compute-era-plate-membership/index.js";
import computeEraTectonicFields from "./ops/compute-era-tectonic-fields/index.js";
import computeHotspotEvents from "./ops/compute-hotspot-events/index.js";
import computePlateMotion from "./ops/compute-plate-motion/index.js";
import computeSegmentEvents from "./ops/compute-segment-events/index.js";
import computeTectonicHistoryRollups from "./ops/compute-tectonic-history-rollups/index.js";
import computeTectonicProvenance from "./ops/compute-tectonic-provenance/index.js";
import computeTectonicSegments from "./ops/compute-tectonic-segments/index.js";
import computeTectonicsCurrent from "./ops/compute-tectonics-current/index.js";
import computeTracerAdvection from "./ops/compute-tracer-advection/index.js";

/** Executable Foundation tectonics branch. */
const tectonics = createDomainSubdomainRouter(contract, {
  computePlateMotion,
  computeTectonicSegments,
  computeEraPlateMembership,
  computeSegmentEvents,
  computeHotspotEvents,
  computeEraTectonicFields,
  computeTectonicHistoryRollups,
  computeTectonicsCurrent,
  computeTracerAdvection,
  computeTectonicProvenance,
});

export default tectonics;
