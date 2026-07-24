import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Climate branch contract for atmospheric forcing, moisture transport, and water budgeting. */
const climate = defineDomainSubdomain({ id: "climate", ops });

export default climate;
