import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Biome branch contract for classification and deterministic edge refinement. */
const biomes = defineDomainSubdomain({ id: "biomes", ops });

export default biomes;
