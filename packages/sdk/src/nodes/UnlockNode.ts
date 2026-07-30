import { BaseNode } from "./BaseNode";

export type TUnlockNode = Pick<UnlockNode, "unlockType">;

/** Declares the stable identity shared by an unlock's requirements, values, and rewards. */
export class UnlockNode extends BaseNode<TUnlockNode> {
  unlockType: string | null = "UNLOCK_";

  constructor(payload: Partial<TUnlockNode> = {}) {
    super();
    this.fill(payload);
  }
}
