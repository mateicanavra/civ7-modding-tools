import { BaseNode } from "./BaseNode";

export type TUnitStatNode = Pick<
  UnitStatNode,
  "unitType" | "bombard" | "combat" | "range" | "rangedCombat"
>;

/** Supplies combat and range statistics for a unit independently of its core definition. */
export class UnitStatNode extends BaseNode<TUnitStatNode> {
  unitType: string | null = "UNIT_TYPE";
  bombard: number | null = null;
  combat: number | null = null;
  range: number | null = null;
  rangedCombat: number | null = null;

  constructor(payload: Partial<TUnitStatNode> = {}) {
    super();
    this.fill(payload);
  }
}
