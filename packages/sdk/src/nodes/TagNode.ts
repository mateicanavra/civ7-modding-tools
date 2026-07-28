import { BaseNode } from "./BaseNode";

export type TTagNode = Pick<TagNode, "tag" | "category">;

/** Declares a named database tag under a vocabulary category. */
export class TagNode extends BaseNode<TTagNode> {
  tag: string | null = "TAG";
  category: string | null = "CATEGORY";

  constructor(payload: Partial<TTagNode> = {}) {
    super();
    this.fill(payload);
  }
}
