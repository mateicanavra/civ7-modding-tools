import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import computeEraPlateMembership from "./compute-era-plate-membership/index.js";
import computeEraTectonicFields from "./compute-era-tectonic-fields/index.js";
import computeHotspotEvents from "./compute-hotspot-events/index.js";
import computeCrust from "./compute-crust/index.js";
import computeCrustEvolution from "./compute-crust-evolution/index.js";
import computeMantleForcing from "./compute-mantle-forcing/index.js";
import computeMantlePotential from "./compute-mantle-potential/index.js";
import computeMesh from "./compute-mesh/index.js";
import computePlateGraph from "./compute-plate-graph/index.js";
import computePlateMotion from "./compute-plate-motion/index.js";
import computePlatesTensors from "./compute-plates-tensors/index.js";
import computeSegmentEvents from "./compute-segment-events/index.js";
import computeTectonicHistory from "./compute-tectonic-history/index.js";
import computeTectonicHistoryRollups from "./compute-tectonic-history-rollups/index.js";
import computeTectonicProvenance from "./compute-tectonic-provenance/index.js";
import computeTectonicsCurrent from "./compute-tectonics-current/index.js";
import computeTectonicSegments from "./compute-tectonic-segments/index.js";
import computeTracerAdvection from "./compute-tracer-advection/index.js";

const implementations = {
  computeMesh,
  computeMantlePotential,
  computeMantleForcing,
  computeCrust,
  computeCrustEvolution,
  computePlateGraph,
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
  computeTectonicHistory,
  computePlatesTensors,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  computeEraPlateMembership,
  computeEraTectonicFields,
  computeHotspotEvents,
  computeCrust,
  computeCrustEvolution,
  computeMantleForcing,
  computeMantlePotential,
  computeMesh,
  computePlateGraph,
  computePlateMotion,
  computePlatesTensors,
  computeSegmentEvents,
  computeTectonicHistory,
  computeTectonicHistoryRollups,
  computeTectonicProvenance,
  computeTectonicsCurrent,
  computeTectonicSegments,
  computeTracerAdvection,
};
