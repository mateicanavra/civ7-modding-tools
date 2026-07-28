import { BaseNode } from "./BaseNode";

export type TProgressionTreePrereqNode = Pick<ProgressionTreePrereqNode, "node" | "prereqNode">;

/** Declares the prerequisite edge between two progression-tree nodes. */
export class ProgressionTreePrereqNode extends BaseNode<TProgressionTreePrereqNode> {
  node: `NODE_${string}` | null = "NODE_";
  prereqNode: `NODE_${string}` | null = "NODE_";

  constructor(payload: Partial<TProgressionTreePrereqNode> = {}) {
    super();
    this.fill(payload);
  }
}
