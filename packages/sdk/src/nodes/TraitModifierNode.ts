import { BaseNode } from "./BaseNode";

export type TTraitModifierNode = Pick<TraitModifierNode, "traitType" | "modifierId">;

/** Binds a gameplay modifier to the trait that activates it. */
export class TraitModifierNode extends BaseNode<TTraitModifierNode> {
  traitType: string | null = "TRAIT_";
  modifierId: string | null = "MOD_";

  constructor(payload: Partial<TTraitModifierNode> = {}) {
    super();
    this.fill(payload);
  }
}
