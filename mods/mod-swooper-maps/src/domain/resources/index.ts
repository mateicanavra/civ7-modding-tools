import { defineDomain } from "@swooper/mapgen-core/authoring";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "resources", ops } as const);

export default domain;

export * from "./corpus/index.js";
export * from "./earthlike-expectations/index.js";
export * from "./initial-map-authoring-policy.js";
