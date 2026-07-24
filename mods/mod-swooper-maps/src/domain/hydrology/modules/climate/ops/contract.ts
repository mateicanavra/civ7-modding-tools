import ComputeAtmosphericCirculationContract from "./compute-atmospheric-circulation/contract.js";
import ComputeClimateDiagnosticsContract from "./compute-climate-diagnostics/contract.js";
import ComputeEvaporationSourcesContract from "./compute-evaporation-sources/contract.js";
import ComputeLandWaterBudgetContract from "./compute-land-water-budget/contract.js";
import ComputePrecipitationContract from "./compute-precipitation/contract.js";
import ComputeRadiativeForcingContract from "./compute-radiative-forcing/contract.js";
import ComputeThermalStateContract from "./compute-thermal-state/contract.js";
import TransportMoistureContract from "./transport-moisture/contract.js";

/** Climate operation contracts keyed for exact branch composition. */
const contracts = {
  computeRadiativeForcing: ComputeRadiativeForcingContract,
  computeThermalState: ComputeThermalStateContract,
  computeAtmosphericCirculation: ComputeAtmosphericCirculationContract,
  computeEvaporationSources: ComputeEvaporationSourcesContract,
  transportMoisture: TransportMoistureContract,
  computePrecipitation: ComputePrecipitationContract,
  computeLandWaterBudget: ComputeLandWaterBudgetContract,
  computeClimateDiagnostics: ComputeClimateDiagnosticsContract,
} as const;

export default contracts;
