import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeAtmosphericCirculation from "./ops/compute-atmospheric-circulation/index.js";
import computeClimateDiagnostics from "./ops/compute-climate-diagnostics/index.js";
import computeEvaporationSources from "./ops/compute-evaporation-sources/index.js";
import computeLandWaterBudget from "./ops/compute-land-water-budget/index.js";
import computePrecipitation from "./ops/compute-precipitation/index.js";
import computePressureField from "./ops/compute-pressure-field/index.js";
import computeRadiativeForcing from "./ops/compute-radiative-forcing/index.js";
import computeThermalState from "./ops/compute-thermal-state/index.js";
import refinePrecipitation from "./ops/refine-precipitation/index.js";
import transportMoisture from "./ops/transport-moisture/index.js";

/**
 * Canonically binds the Climate contract to forcing, circulation, moisture, precipitation
 * generation and refinement, budget, and diagnostic implementations. The Hydrology router is the
 * sole executable aggregate; step authoring continues to reference the contract.
 */
const climate = createDomainSubdomainRouter(contract, {
  computeRadiativeForcing,
  computeThermalState,
  computePressureField,
  computeAtmosphericCirculation,
  computeEvaporationSources,
  transportMoisture,
  computePrecipitation,
  refinePrecipitation,
  computeLandWaterBudget,
  computeClimateDiagnostics,
});

export default climate;
