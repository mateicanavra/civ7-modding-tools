import { BaseNode } from "./BaseNode";

export type TUnitUpgradeNode = Pick<UnitUpgradeNode, "unit" | "upgradeUnit">;

/** Declares the successor unit available through a unit upgrade path. */
export class UnitUpgradeNode extends BaseNode<TUnitUpgradeNode> {
  unit: string | null = "UNIT_TYPE";
  upgradeUnit: string | null = "UNIT_TYPE";

  constructor(payload: Partial<TUnitUpgradeNode> = {}) {
    super();
    this.fill(payload);
  }
}
