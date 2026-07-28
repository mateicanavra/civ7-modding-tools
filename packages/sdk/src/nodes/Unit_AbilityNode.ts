import { BaseNode } from "./BaseNode";

export type TUnit_AbilityNode = {
  unitType: string;
  unitAbilityType: string;
};

/** Associates a unit with an ability through Civ7's `Unit_Abilities` join table. */
export class Unit_AbilityNode extends BaseNode<TUnit_AbilityNode> {
  unitType: string;
  unitAbilityType: string;

  constructor(options: Partial<TUnit_AbilityNode> = {}) {
    super(options);
    this.unitType = options.unitType || "";
    this.unitAbilityType = options.unitAbilityType || "";
  }
}
