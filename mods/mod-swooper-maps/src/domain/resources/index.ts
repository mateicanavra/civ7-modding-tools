import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

/** Stable Resources domain contract consumed by recipe and runtime registries. */
const domain = defineDomain({ id: "resources", ops } as const);

export default domain;

export {
  type ResourceFamily,
  ResourceFamilySchema,
  type ResourceSymbol,
  ResourceSymbolSchema,
} from "./model/schemas/resource-family.schema.js";

export {
  DEFERRED_INITIAL_MAP_RESOURCE_TYPES,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
  type InitialMapResourceAuthoringStatus,
} from "./model/policy/initial-map-authoring.js";
