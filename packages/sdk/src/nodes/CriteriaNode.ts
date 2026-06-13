import { randomUUID } from "node:crypto";
import { AGE } from "../constants";

import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TCriteriaNode = Pick<CriteriaNode, "id" | "any" | "ages">;

export class CriteriaNode extends BaseNode<TCriteriaNode> {
  _name = "Criteria";

  id: string | null = randomUUID();
  ages: TObjectValues<typeof AGE>[] = [];
  any: boolean | null = null;

  constructor(payload: Partial<TCriteriaNode> = {}) {
    super();
    this.fill(payload);
  }

  toXmlElement() {
    return {
      _name: this._name,
      _attrs: {
        id: this.id,
        ...(this.any ? { any: "true" } : {}),
      },
      _content: this.ages.length ? this.ages.map((AgeInUse) => ({ AgeInUse })) : { AlwaysMet: "" },
    };
  }
}
