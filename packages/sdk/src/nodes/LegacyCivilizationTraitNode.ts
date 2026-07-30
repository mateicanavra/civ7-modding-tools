import { BaseNode } from "./BaseNode";

export type TLegacyCivilizationTraitNode = Pick<
  LegacyCivilizationTraitNode,
  "traitType" | "civilizationType"
>;

/** Associates a civilization trait with its legacy transition metadata. */
export class LegacyCivilizationTraitNode extends BaseNode<TLegacyCivilizationTraitNode> {
  traitType: string | null = "TRAIT_";
  civilizationType: string | null = "CIVILIZATION_";

  constructor(payload: Partial<TLegacyCivilizationTraitNode> = {}) {
    super();
    this.fill(payload);
  }
}
