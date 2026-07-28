import { BaseNode } from "./BaseNode";

export type TStartBiasRiverNode = Pick<
  StartBiasRiverNode,
  "civilizationType" | "leaderType" | "score"
>;

/** Biases civilization start placement toward or away from rivers. */
export class StartBiasRiverNode extends BaseNode<TStartBiasRiverNode> {
  civilizationType: string | null = null;
  leaderType: `LEADER_${string}` | null = null;
  score: number | null = 5;

  constructor(payload: Partial<TStartBiasRiverNode> = {}) {
    super();
    this.fill(payload);
  }
}
