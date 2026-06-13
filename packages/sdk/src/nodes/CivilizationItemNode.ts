import { KIND } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TCivilizationItemNode = Pick<
  CivilizationItemNode,
  "civilizationDomain" | "civilizationType" | "type" | "kind" | "name" | "description" | "icon"
>;

export class CivilizationItemNode extends BaseNode<TCivilizationItemNode> {
  civilizationDomain: string | null = null;
  civilizationType: string | null = "CIVILIZATION_";
  type: string | null = null;
  kind: TObjectValues<typeof KIND> | null = KIND.UNIT;
  name: string | null = null;
  description: string | null = null;
  icon: string | null = null;

  constructor(payload: Partial<TCivilizationItemNode> = {}) {
    super();
    this.fill(payload);
  }
}
