import { YIELD } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TConstructibleMaintenanceNode = Pick<
  ConstructibleMaintenanceNode,
  "constructibleType" | "yieldType" | "amount"
>;

export class ConstructibleMaintenanceNode extends BaseNode<TConstructibleMaintenanceNode> {
  constructibleType = "BUILDING_";
  yieldType: TObjectValues<typeof YIELD> = YIELD.GOLD;
  amount = 1;

  constructor(payload: Partial<TConstructibleMaintenanceNode> = {}) {
    super();
    this.fill(payload);
  }
}
