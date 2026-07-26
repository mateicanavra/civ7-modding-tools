import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeAtmosphericCirculation from "./ops/compute-atmospheric-circulation/index.js";
import computeClimateDiagnostics from "./ops/compute-climate-diagnostics/index.js";
import computeEvaporationSources from "./ops/compute-evaporation-sources/index.js";
import computeLandWaterBudget from "./ops/compute-land-water-budget/index.js";
import computePrecipitation from "./ops/compute-precipitation/index.js";
import computeRadiativeForcing from "./ops/compute-radiative-forcing/index.js";
import computeThermalState from "./ops/compute-thermal-state/index.js";
import transportMoisture from "./ops/transport-moisture/index.js";

/**
 * Canonically binds the Climate contract to the forcing, circulation, moisture, precipitation,
 * budget, and diagnostic implementations that produce baseline and refined climate evidence. The
 * Hydrology router is the sole executable aggregate; step authoring continues to reference the
 * contract.
 */
const climate = createDomainSubdomainRouter(contract, {
  computeRadiativeForcing,
  computeThermalState,
  computeAtmosphericCirculation,
  computeEvaporationSources,
  transportMoisture,
  computePrecipitation,
  computeLandWaterBudget,
  computeClimateDiagnostics,
});

export default climate;
