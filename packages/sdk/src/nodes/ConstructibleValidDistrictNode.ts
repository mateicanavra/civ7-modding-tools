import { DISTRICT } from "../constants";
import { TObjectValues } from "../types";

import { BaseNode } from "./BaseNode";

export type TConstructibleValidDistrictNode = Pick<
  ConstructibleValidDistrictNode,
  "constructibleType" | "districtType"
>;

/** Allows a constructible to be placed in a specific district. */
export class ConstructibleValidDistrictNode extends BaseNode<TConstructibleValidDistrictNode> {
  constructibleType: string | null = "BUILDING_";
  districtType: TObjectValues<typeof DISTRICT> | null = DISTRICT.RURAL;

  constructor(payload: Partial<TConstructibleValidDistrictNode> = {}) {
    super();
    this.fill(payload);
  }
}
