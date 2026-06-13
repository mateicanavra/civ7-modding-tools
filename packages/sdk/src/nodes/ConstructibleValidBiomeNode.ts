import { BIOME } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TConstructibleValidBiomeNode = Pick<
  ConstructibleValidBiomeNode,
  "constructibleType" | "biomeType"
>;

export class ConstructibleValidBiomeNode extends BaseNode<TConstructibleValidBiomeNode> {
  constructibleType: string | null = "BUILDING_";
  biomeType: TObjectValues<typeof BIOME> | null = BIOME.GRASSLAND;

  constructor(payload: Partial<TConstructibleValidBiomeNode> = {}) {
    super();
    this.fill(payload);
  }
}
