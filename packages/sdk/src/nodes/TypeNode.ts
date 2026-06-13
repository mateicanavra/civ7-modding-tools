import { KIND } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TTypeNode = Pick<TypeNode, "type" | "kind">;

export class TypeNode extends BaseNode<TTypeNode> {
  type: string | null = "TYPE";
  kind: TObjectValues<typeof KIND> | null = KIND.CONSTRUCTIBLE;

  constructor(payload: Partial<TTypeNode> = {}) {
    super();
    this.fill(payload);
  }
}
