import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import computeRadiativeForcing from "./compute-radiative-forcing/index.js";
import computeThermalState from "./compute-thermal-state/index.js";
import computeAtmosphericCirculation from "./compute-atmospheric-circulation/index.js";
import computeOceanSurfaceCurrents from "./compute-ocean-surface-currents/index.js";
import computeOceanGeometry from "./compute-ocean-geometry/index.js";
import computeOceanThermalState from "./compute-ocean-thermal-state/index.js";
import computeEvaporationSources from "./compute-evaporation-sources/index.js";
import transportMoisture from "./transport-moisture/index.js";
import computePrecipitation from "./compute-precipitation/index.js";
import computeCryosphereState from "./compute-cryosphere-state/index.js";
import applyAlbedoFeedback from "./apply-albedo-feedback/index.js";
import computeLandWaterBudget from "./compute-land-water-budget/index.js";
import computeClimateDiagnostics from "./compute-climate-diagnostics/index.js";
import computeDrainageRouting from "./compute-drainage-routing/index.js";
import accumulateDischarge from "./accumulate-discharge/index.js";
import projectRiverNetwork from "./project-river-network/index.js";
import computeRiverNetworkMetrics from "./compute-river-network-metrics/index.js";
import planLakes from "./plan-lakes/index.js";
import selectNavigableRiverTerrain from "./select-navigable-river-terrain/index.js";

const implementations = {
  computeRadiativeForcing,
  computeThermalState,
  computeAtmosphericCirculation,
  computeOceanSurfaceCurrents,
  computeOceanGeometry,
  computeOceanThermalState,
  computeEvaporationSources,
  transportMoisture,
  computePrecipitation,
  computeCryosphereState,
  applyAlbedoFeedback,
  computeLandWaterBudget,
  computeClimateDiagnostics,
  computeDrainageRouting,
  accumulateDischarge,
  projectRiverNetwork,
  computeRiverNetworkMetrics,
  planLakes,
  selectNavigableRiverTerrain,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  computeRadiativeForcing,
  computeThermalState,
  computeAtmosphericCirculation,
  computeOceanSurfaceCurrents,
  computeOceanGeometry,
  computeOceanThermalState,
  computeEvaporationSources,
  transportMoisture,
  computePrecipitation,
  computeCryosphereState,
  applyAlbedoFeedback,
  computeLandWaterBudget,
  computeClimateDiagnostics,
  computeDrainageRouting,
  accumulateDischarge,
  projectRiverNetwork,
  computeRiverNetworkMetrics,
  planLakes,
  selectNavigableRiverTerrain,
};
