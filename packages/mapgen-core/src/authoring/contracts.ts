export { MapSetupSchema } from "@mapgen/core/map-setup.js";
export type { Static, TObject, TSchema } from "typebox";
export { Type } from "typebox";
export type { ArtifactCatalog } from "./artifact/catalog.js";
export { defineArtifactCatalog } from "./artifact/catalog.js";
export type {
  Artifact,
  ArtifactReadValueOf,
  ArtifactValueOf,
  DeepReadonly,
} from "./artifact/contract.js";
export { defineArtifact } from "./artifact/contract.js";
export type {
  DomainAggregateContract,
  DomainAggregateContractAny,
  DomainContract,
  DomainContractAny,
  DomainSubdomainContract,
  DomainSubdomainContractAny,
} from "./domain/contract.js";
export { defineDomain, defineDomainSubdomain } from "./domain/contract.js";
export type {
  BasePhysicalInitialSetupDefinition,
  DeepReadonlyInitialSetup,
  InitialSetupDefinition,
  InitialSetupInputOf,
  InitialSetupRefinement,
  InitialSetupValueOf,
} from "./initial-setup/definition.js";
export {
  basePhysicalInitialSetupDefinition,
  defineInitialSetup,
} from "./initial-setup/definition.js";
export { defineOp } from "./operation/contract.js";
export type { StrategyDefinition } from "./operation/strategy-definition.js";
export { defineStrategy } from "./operation/strategy-definition.js";
export type { OpTypeBagOf } from "./operation/types.js";
export { TypedArraySchemas } from "./schema/typed-array.js";
export { defineStep } from "./step/contract.js";
