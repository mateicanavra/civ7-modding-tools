import { BaseNode } from "./BaseNode";

export type TUnitAbilityNode = {
  unitAbilityType: string;
  name: string;
  description: string;
};

/** Declares a unit ability and its localized name and description references. */
export class UnitAbilityNode extends BaseNode<TUnitAbilityNode> {
  unitAbilityType: string;
  name: string;
  description: string;

  constructor(options: Partial<TUnitAbilityNode> = {}) {
    super(options);
    this.unitAbilityType = options.unitAbilityType || "";
    this.name = options.name || "";
    this.description = options.description || "";
  }

  toXmlElement() {
    return super.toXmlElement();
  }
}
