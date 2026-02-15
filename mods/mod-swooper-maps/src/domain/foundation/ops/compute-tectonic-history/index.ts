import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicHistoryContract from "./contract.js";

const ORCHESTRATION_MIGRATION_HINT =
  "[Foundation] foundation/compute-tectonic-history is disabled. " +
  "Tectonics orchestration belongs to the foundation tectonics step " +
  "and should use focused ops (computeEraPlateMembership, computeSegmentEvents, computeHotspotEvents, " +
  "computeEraTectonicFields, computeTectonicHistoryRollups, computeTectonicsCurrent, " +
  "computeTracerAdvection, computeTectonicProvenance).";

const computeTectonicHistory = createOp(ComputeTectonicHistoryContract, {
  strategies: {
    default: {
      run: (input, config) => {
        void input;
        void config;
        throw new Error(ORCHESTRATION_MIGRATION_HINT);
      },
    },
  },
});

export default computeTectonicHistory;
