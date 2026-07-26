import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeEraPlateMembership from "./compute-era-plate-membership/index.js";
import computeEraTectonicFields from "./compute-era-tectonic-fields/index.js";
import computeHotspotEvents from "./compute-hotspot-events/index.js";
import computePlateMotion from "./compute-plate-motion/index.js";
import computeSegmentEvents from "./compute-segment-events/index.js";
import computeTectonicHistoryRollups from "./compute-tectonic-history-rollups/index.js";
import computeTectonicProvenance from "./compute-tectonic-provenance/index.js";
import computeTectonicSegments from "./compute-tectonic-segments/index.js";
import computeTectonicsCurrent from "./compute-tectonics-current/index.js";
import computeTracerAdvection from "./compute-tracer-advection/index.js";

type Contracts = typeof import("./contract.js").default;

/** Tectonics implementations keyed exactly like the branch contract registry. */
const implementations = {
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
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
