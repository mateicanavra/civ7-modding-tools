import { BIOME } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TConstructibleValidBiomeNode = Pick<
  ConstructibleValidBiomeNode,
  "constructibleType" | "biomeType"
>;

/** Allows a constructible to be placed in a specific biome. */
export class ConstructibleValidBiomeNode extends BaseNode<TConstructibleValidBiomeNode> {
  constructibleType: string | null = "BUILDING_";
  biomeType: TObjectValues<typeof BIOME> | null = BIOME.GRASSLAND;

  constructor(payload: Partial<TConstructibleValidBiomeNode> = {}) {
    super();
    this.fill(payload);
  }
}
