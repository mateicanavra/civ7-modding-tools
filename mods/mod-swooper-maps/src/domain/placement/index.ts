import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Stable Placement domain contract consumed by recipe and runtime registries. */
const domain = defineDomain({ id: "placement", ops } as const);

export default domain;
