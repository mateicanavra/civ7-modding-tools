import { BaseNode } from "./BaseNode";

export type TGameModifierNode = Pick<GameModifierNode, "modifierId">;

/** Activates a modifier globally by adding it to the game-modifier table. */
export class GameModifierNode extends BaseNode<TGameModifierNode> {
  modifierId: string | null = null;

  constructor(payload: Partial<TGameModifierNode> = {}) {
    super();
    this.fill(payload);
  }
}
