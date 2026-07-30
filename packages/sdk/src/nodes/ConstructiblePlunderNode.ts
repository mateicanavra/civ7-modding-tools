import { PLUNDER } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TConstructiblePlunderNode = Pick<
  ConstructiblePlunderNode,
  "constructibleType" | "plunderType" | "amount"
>;

/** Associates a constructible with the effect granted when it is plundered. */
export class ConstructiblePlunderNode extends BaseNode<TConstructiblePlunderNode> {
  constructibleType: string | null = "BUILDING_";
  plunderType: TObjectValues<typeof PLUNDER> | null = PLUNDER.HEAL;
  amount: number | null = 30;

  constructor(payload: Partial<TConstructiblePlunderNode> = {}) {
    super();
    this.fill(payload);
  }
}
