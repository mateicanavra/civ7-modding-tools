import { BaseNode } from "./BaseNode";

export type TRequirementArgumentNode = Pick<
  RequirementArgumentNode,
  "requirementId" | "name" | "value"
>;

/** Supplies one named argument to a gameplay requirement. */
export class RequirementArgumentNode extends BaseNode<TRequirementArgumentNode> {
  requirementId: string | null = "REQ_";
  name: string | null = null;
  value: string | number | null = null;

  constructor(payload: Partial<TRequirementArgumentNode> = {}) {
    super();
    this.fill(payload);
  }
}
