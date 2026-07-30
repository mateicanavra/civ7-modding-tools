import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeCrustEvolutionContract from "./ops/compute-crust-evolution/contract.js";

/** Orogeny branch contract for evolving initial crust through reconstructed tectonic history. */
const orogeny = defineDomainSubdomain({
  id: "orogeny",
  ops: { computeCrustEvolution: ComputeCrustEvolutionContract },
});

export default orogeny;
