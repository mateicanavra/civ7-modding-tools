import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "resources", ops } as const);

export default domain;

export * from "./lib/corpus/index.js";
export * from "./lib/corpus/runtime-ids.js";
export * from "./lib/earthlike-expectations/index.js";
export * from "./policy/habitat-eligibility.js";
export * from "./policy/initial-map-authoring.js";
export * from "./policy/resource-legality.js";
