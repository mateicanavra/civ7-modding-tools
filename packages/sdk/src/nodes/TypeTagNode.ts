import { BaseNode } from "./BaseNode";

export type TTypeTagNode = Pick<TypeTagNode, "tag" | "type">;

/** Associates a declared database type with a classification tag. */
export class TypeTagNode extends BaseNode<TTypeTagNode> {
  tag: string | null = "TAG";
  type: string | null = "TYPE";

  constructor(payload: Partial<TTypeTagNode> = {}) {
    super();
    this.fill(payload);
  }
}
