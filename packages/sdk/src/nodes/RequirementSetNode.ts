import { randomUUID } from "node:crypto";
import { REQUIREMENT_SET } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TRequirementSetNode = Pick<
  RequirementSetNode,
  "requirementSetId" | "requirementSetType"
>;

export class RequirementSetNode extends BaseNode<TRequirementSetNode> {
  requirementSetId: string | null = "REQSET_" + randomUUID().replace(/-/g, "_").toLocaleUpperCase();
  requirementSetType: TObjectValues<typeof REQUIREMENT_SET> | null = REQUIREMENT_SET.TEST_ALL;

  constructor(payload: Partial<TRequirementSetNode> = {}) {
    super();
    this.fill(payload);
  }
}
