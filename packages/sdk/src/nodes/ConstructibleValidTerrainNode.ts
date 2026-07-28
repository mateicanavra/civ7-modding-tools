import { TERRAIN } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TConstructibleValidTerrainNode = Pick<
  ConstructibleValidTerrainNode,
  "constructibleType" | "terrainType"
>;

/** Allows a constructible to be placed on a specific terrain type. */
export class ConstructibleValidTerrainNode extends BaseNode<TConstructibleValidTerrainNode> {
  constructibleType: string | null = "BUILDING_";
  terrainType: TObjectValues<typeof TERRAIN> | null = TERRAIN.FLAT;

  constructor(payload: Partial<TConstructibleValidTerrainNode> = {}) {
    super();
    this.fill(payload);
  }
}
