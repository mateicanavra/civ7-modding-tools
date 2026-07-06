import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "foundation", ops } as const);

export { artifactContracts, artifacts, validators } from "./artifacts/index.js";

export default domain;
