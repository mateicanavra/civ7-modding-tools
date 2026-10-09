import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeAtmosphericCirculation from "./ops/compute-atmospheric-circulation/index.js";
import computeAtmosphericAggregate from "./ops/compute-atmospheric-aggregate/index.js";
import computeMoistureAggregate from "./ops/compute-moisture-aggregate/index.js";
import computeMoistureForcing from "./ops/compute-moisture-forcing/index.js";
import computeSeasonalSampling from "./ops/compute-seasonal-sampling/index.js";
import computeClimateDiagnostics from "./ops/compute-climate-diagnostics/index.js";
import computeLandWaterBudget from "./ops/compute-land-water-budget/index.js";
import computePotentialDemand from "./ops/compute-potential-demand/index.js";
import computePressureField from "./ops/compute-pressure-field/index.js";
import computeRadiativeForcing from "./ops/compute-radiative-forcing/index.js";
import computeThermalState from "./ops/compute-thermal-state/index.js";

/**
 * Canonically binds the Climate contract to forcing, circulation, coupled source-limited moisture,
 * budget, and diagnostic implementations. The Hydrology router is the
 * sole executable aggregate; step authoring continues to reference the contract.
 */
const climate = createDomainSubdomainRouter(contract, {
  computeSeasonalSampling,
  computeAtmosphericAggregate,
  computeMoistureAggregate,
  computeMoistureForcing,
  computeRadiativeForcing,
  computeThermalState,
  computePressureField,
  computeAtmosphericCirculation,
  computeLandWaterBudget,
  computePotentialDemand,
  computeClimateDiagnostics,
});

export default climate;
