export type { Static, TObject, TSchema } from "typebox";
export { Type } from "typebox";

import type { StepOpsDecl } from "./step/ops.js";

export type {
  ArtifactContract,
  ArtifactReadValueOf,
  ArtifactValueOf,
  DeepReadonly,
} from "./artifact/contract.js";
export { defineArtifact } from "./artifact/contract.js";
export type { ArtifactValidationContext, ArtifactValidationIssue } from "./artifact/validation.js";
export { artifactCellCount, validateArtifactSchema } from "./artifact/validation.js";
export { defineOp } from "./op/contract.js";
export type { OpTypeBagOf } from "./op/types.js";
export { defineStep } from "./step/contract.js";
export { TypedArraySchemas } from "./typed-array-schemas.js";

export type DomainContract<Id extends string, Ops extends StepOpsDecl> = Readonly<{
  id: Id;
  ops: Ops;
}>;

export function defineDomain<const Id extends string, const Ops extends StepOpsDecl>(
  def: DomainContract<Id, Ops>
): typeof def {
  return def;
}
