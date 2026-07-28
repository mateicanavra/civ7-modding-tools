import { BaseNode } from "./BaseNode";

export type TKindNode = Pick<KindNode, "kind">;

/** Declares a database kind that new moddable types can inherit from. */
export class KindNode extends BaseNode<TKindNode> {
  kind: `KIND_${string}` | null = "KIND_";

  constructor(payload: Partial<TKindNode> = {}) {
    super();
    this.fill(payload);
  }
}
