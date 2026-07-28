import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import DeriveHabitatFieldsContract from "./ops/derive-habitat-fields/contract.js";

/** Resource-habitat contract for deriving the physical planning lanes. */
const habitat = defineDomainSubdomain({
  id: "habitat",
  ops: {
    deriveHabitatFields: DeriveHabitatFieldsContract,
  },
});

export default habitat;
