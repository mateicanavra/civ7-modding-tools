import { BaseNode } from "./BaseNode";

export type TRequirementSetRequirementNode = Pick<
  RequirementSetRequirementNode,
  "requirementSetId" | "requirementId"
>;

/** Adds a requirement to the set that owns its evaluation. */
export class RequirementSetRequirementNode extends BaseNode<TRequirementSetRequirementNode> {
  requirementSetId: string | null = "REQSET_";
  requirementId: string | null = "REQ_";

  constructor(payload: Partial<TRequirementSetRequirementNode> = {}) {
    super();
    this.fill(payload);
  }
}
