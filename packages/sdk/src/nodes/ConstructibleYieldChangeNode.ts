import { YIELD } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TConstructibleYieldChangeNode = Pick<
  ConstructibleYieldChangeNode,
  "constructibleType" | "yieldType" | "yieldChange"
>;

export class ConstructibleYieldChangeNode extends BaseNode<TConstructibleYieldChangeNode> {
  constructibleType: string | null = "BUILDING_";
  yieldType: TObjectValues<typeof YIELD> | null = YIELD.GOLD;
  yieldChange: number | null = 1;

  constructor(payload: Partial<TConstructibleYieldChangeNode> = {}) {
    super();
    this.fill(payload);
  }
}
