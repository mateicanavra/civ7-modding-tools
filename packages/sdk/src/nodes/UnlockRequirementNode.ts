import { BaseNode } from "./BaseNode";

export type TUnlockRequirementNode = Pick<
  UnlockRequirementNode,
  "unlockType" | "requirementSetId" | "description" | "narrativeText" | "tooltip"
>;

/** Connects an unlock to its requirement set and player-facing explanatory text. */
export class UnlockRequirementNode extends BaseNode<TUnlockRequirementNode> {
  unlockType: string | null = "UNLOCK_";
  requirementSetId: string | null = null;
  description: string | null = null;
  tooltip: string | null = null;
  narrativeText: string | null = null;

  constructor(payload: Partial<TUnlockRequirementNode> = {}) {
    super();
    this.fill(payload);
  }
}
