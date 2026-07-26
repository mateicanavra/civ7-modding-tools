import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeAtmosphericCirculationContract from "./ops/compute-atmospheric-circulation/contract.js";
import ComputeClimateDiagnosticsContract from "./ops/compute-climate-diagnostics/contract.js";
import ComputeEvaporationSourcesContract from "./ops/compute-evaporation-sources/contract.js";
import ComputeLandWaterBudgetContract from "./ops/compute-land-water-budget/contract.js";
import ComputePrecipitationContract from "./ops/compute-precipitation/contract.js";
import ComputeRadiativeForcingContract from "./ops/compute-radiative-forcing/contract.js";
import ComputeThermalStateContract from "./ops/compute-thermal-state/contract.js";
import TransportMoistureContract from "./ops/transport-moisture/contract.js";

/** Climate branch contract for atmospheric forcing, moisture transport, and water budgeting. */
const climate = defineDomainSubdomain({
  id: "climate",
  ops: {
    computeRadiativeForcing: ComputeRadiativeForcingContract,
    computeThermalState: ComputeThermalStateContract,
    computeAtmosphericCirculation: ComputeAtmosphericCirculationContract,
    computeEvaporationSources: ComputeEvaporationSourcesContract,
    transportMoisture: TransportMoistureContract,
    computePrecipitation: ComputePrecipitationContract,
    computeLandWaterBudget: ComputeLandWaterBudgetContract,
    computeClimateDiagnostics: ComputeClimateDiagnosticsContract,
  },
});

export default climate;
