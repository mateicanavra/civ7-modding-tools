import AccumulateDischargeContract from "./accumulate-discharge/contract.js";
import ApplyAlbedoFeedbackContract from "./apply-albedo-feedback/contract.js";
import ComputeAtmosphericCirculationContract from "./compute-atmospheric-circulation/contract.js";
import ComputeClimateDiagnosticsContract from "./compute-climate-diagnostics/contract.js";
import ComputeCryosphereStateContract from "./compute-cryosphere-state/contract.js";
import ComputeDrainageRoutingContract from "./compute-drainage-routing/contract.js";
import ComputeEvaporationSourcesContract from "./compute-evaporation-sources/contract.js";
import ComputeLandWaterBudgetContract from "./compute-land-water-budget/contract.js";
import ComputeOceanGeometryContract from "./compute-ocean-geometry/contract.js";
import ComputeOceanSurfaceCurrentsContract from "./compute-ocean-surface-currents/contract.js";
import ComputeOceanThermalStateContract from "./compute-ocean-thermal-state/contract.js";
import ComputePrecipitationContract from "./compute-precipitation/contract.js";
import ComputeRadiativeForcingContract from "./compute-radiative-forcing/contract.js";
import ComputeRiverNetworkMetricsContract from "./compute-river-network-metrics/contract.js";
import ComputeThermalStateContract from "./compute-thermal-state/contract.js";
import PlanLakesContract from "./plan-lakes/contract.js";
import ProjectRiverNetworkContract from "./project-river-network/contract.js";
import SelectNavigableRiverTerrainContract from "./select-navigable-river-terrain/contract.js";
import TransportMoistureContract from "./transport-moisture/contract.js";

export const contracts = {
  computeRadiativeForcing: ComputeRadiativeForcingContract,
  computeThermalState: ComputeThermalStateContract,
  computeAtmosphericCirculation: ComputeAtmosphericCirculationContract,
  computeOceanSurfaceCurrents: ComputeOceanSurfaceCurrentsContract,
  computeOceanGeometry: ComputeOceanGeometryContract,
  computeOceanThermalState: ComputeOceanThermalStateContract,
  computeEvaporationSources: ComputeEvaporationSourcesContract,
  transportMoisture: TransportMoistureContract,
  computePrecipitation: ComputePrecipitationContract,
  computeCryosphereState: ComputeCryosphereStateContract,
  applyAlbedoFeedback: ApplyAlbedoFeedbackContract,
  computeLandWaterBudget: ComputeLandWaterBudgetContract,
  computeClimateDiagnostics: ComputeClimateDiagnosticsContract,
  computeDrainageRouting: ComputeDrainageRoutingContract,
  accumulateDischarge: AccumulateDischargeContract,
  projectRiverNetwork: ProjectRiverNetworkContract,
  computeRiverNetworkMetrics: ComputeRiverNetworkMetricsContract,
  planLakes: PlanLakesContract,
  selectNavigableRiverTerrain: SelectNavigableRiverTerrainContract,
} as const;

export default contracts;
