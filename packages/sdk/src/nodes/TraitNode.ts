import { BaseNode } from "./BaseNode";

export type TTraitNode = Pick<TraitNode, "traitType" | "name" | "description" | "internalOnly">;

/** Declares a trait type and its localized name and description references. */
export class TraitNode extends BaseNode<TTraitNode> {
  traitType: string | null = "TRAIT_";
  name: string | null = null;
  description: string | null = null;
  internalOnly: boolean | null = null;

  constructor(payload: Partial<TTraitNode> = {}) {
    super();
    this.fill(payload);
  }
}
