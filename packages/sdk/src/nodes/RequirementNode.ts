import { randomUUID } from "node:crypto";
import { REQUIREMENT } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TRequirementNode = Pick<RequirementNode, "requirementId" | "requirementType">;

/** Defines a reusable gameplay predicate over a selected collection and requirement type. */
export class RequirementNode extends BaseNode<TRequirementNode> {
  requirementId: string | null = "REQ_" + randomUUID().replace(/-/g, "_").toLocaleUpperCase();
  requirementType: TObjectValues<typeof REQUIREMENT> | null = REQUIREMENT.IS_AGE_COUNT;

  constructor(payload: Partial<TRequirementNode> = {}) {
    super();
    this.fill(payload);
  }
}
