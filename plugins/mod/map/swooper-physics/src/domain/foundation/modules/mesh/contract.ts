import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeMeshContract from "./ops/compute-mesh/contract.js";

/** Mesh branch contract for deterministic world-space discretization. */
const mesh = defineDomainSubdomain({
  id: "mesh",
  ops: { computeMesh: ComputeMeshContract },
});

export default mesh;
