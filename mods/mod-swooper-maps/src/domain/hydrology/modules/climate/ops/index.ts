import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import computeAtmosphericCirculation from "./compute-atmospheric-circulation/index.js";
import computeClimateDiagnostics from "./compute-climate-diagnostics/index.js";
import computeEvaporationSources from "./compute-evaporation-sources/index.js";
import computeLandWaterBudget from "./compute-land-water-budget/index.js";
import computePrecipitation from "./compute-precipitation/index.js";
import computeRadiativeForcing from "./compute-radiative-forcing/index.js";
import computeThermalState from "./compute-thermal-state/index.js";
import transportMoisture from "./transport-moisture/index.js";

type Contracts = typeof import("./contract.js").default;

/** Climate implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeRadiativeForcing,
  computeThermalState,
  computeAtmosphericCirculation,
  computeEvaporationSources,
  transportMoisture,
  computePrecipitation,
  computeLandWaterBudget,
  computeClimateDiagnostics,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
