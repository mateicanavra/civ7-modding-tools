import { BaseNode } from "./BaseNode";

export type TTraditionNode = Pick<TraditionNode, "traditionType" | "name" | "description">;

/** Represents a tradition's identity and localized database references. */
export class TraditionNode extends BaseNode<TTraditionNode> {
  traditionType: `TRADITION_${string}` | null = "TRADITION_";
  name: string | null = "Name";
  description: string | null = "Description";
  isCrisis: boolean | null = null;

  constructor(payload: Partial<TTraditionNode> = {}) {
    super();
    this.fill(payload);
  }
}
