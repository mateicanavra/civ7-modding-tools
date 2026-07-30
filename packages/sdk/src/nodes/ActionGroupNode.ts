import { randomUUID } from "node:crypto";

import { BaseNode } from "./BaseNode";
import { CriteriaNode } from "./CriteriaNode";

export type TActionGroupNode = Pick<ActionGroupNode, "id" | "scope" | "criteria">;

/** Describes a mod-info action group and the criterion that controls when Civ7 loads it. */
export class ActionGroupNode extends BaseNode<TActionGroupNode> {
  id: string = randomUUID();
  scope: "game" | "shell" = "game";
  criteria: CriteriaNode = new CriteriaNode();

  constructor(payload: Partial<TActionGroupNode> = {}) {
    super();
    this.fill(payload);
  }
}
