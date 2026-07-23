import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "morphology", ops } as const);

export { artifacts } from "./artifacts/index.js";

export default domain;
