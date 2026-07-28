import { BaseNode } from "./BaseNode";

export type TStartBiasAdjacentToCoastNode = Pick<
  StartBiasAdjacentToCoastNode,
  "civilizationType" | "leaderType" | "score"
>;

/** Biases civilization start placement toward or away from coastal adjacency. */
export class StartBiasAdjacentToCoastNode extends BaseNode<TStartBiasAdjacentToCoastNode> {
  civilizationType: string | null = null;
  leaderType: `LEADER_${string}` | null = null;
  score: number | null = 5;

  constructor(payload: Partial<TStartBiasAdjacentToCoastNode> = {}) {
    super();
    this.fill(payload);
  }
}
