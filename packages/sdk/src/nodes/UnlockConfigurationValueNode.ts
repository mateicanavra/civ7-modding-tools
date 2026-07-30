import { BaseNode } from "./BaseNode";

export type TUnlockConfigurationValueNode = Pick<
  UnlockConfigurationValueNode,
  "unlockType" | "configurationValue"
>;

/** Associates an unlock with the configuration value that selects its destination content. */
export class UnlockConfigurationValueNode extends BaseNode<TUnlockConfigurationValueNode> {
  unlockType: string | null = "UNLOCK_";
  configurationValue: string | null = null;

  constructor(payload: Partial<TUnlockConfigurationValueNode> = {}) {
    super();
    this.fill(payload);
  }
}
