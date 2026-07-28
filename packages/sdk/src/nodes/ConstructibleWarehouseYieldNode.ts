import { BaseNode } from "./BaseNode";

export type TConstructibleWarehouseYieldNode = Pick<
  ConstructibleWarehouseYieldNode,
  "constructibleType" | "requiresActivation" | "yieldChangeId"
>;

/** Associates a constructible with a warehouse-style conditional yield definition. */
export class ConstructibleWarehouseYieldNode extends BaseNode<TConstructibleWarehouseYieldNode> {
  constructibleType: string | null = "BUILDING_";
  requiresActivation: boolean | null = null;
  yieldChangeId: string | null = null;

  constructor(payload: Partial<TConstructibleWarehouseYieldNode> = {}) {
    super();
    this.fill(payload);
  }
}
