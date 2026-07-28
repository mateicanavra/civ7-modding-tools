import { BaseNode } from "./BaseNode";

export type TUniqueQuarterModifierNode = Pick<
  UniqueQuarterModifierNode,
  "uniqueQuarterType" | "modifierId"
>;

/** Binds a gameplay modifier to the unique quarter that activates it. */
export class UniqueQuarterModifierNode extends BaseNode<TUniqueQuarterModifierNode> {
  uniqueQuarterType: `QUARTER_${string}` | null = "QUARTER_";
  modifierId: string | null = null;

  constructor(payload: Partial<TUniqueQuarterModifierNode> = {}) {
    super();
    this.fill(payload);
  }
}
