import { FEATURE, RESOURCE, TERRAIN } from "../constants";
import { TObjectValues } from "../types";
import { BaseNode } from "./BaseNode";

export type TDistrictFreeConstructibleNode = Pick<
  DistrictFreeConstructibleNode,
  | "biomeType"
  | "constructibleType"
  | "districtType"
  | "featureType"
  | "priority"
  | "resourceType"
  | "riverType"
  | "terrainType"
  | "tier"
>;

export class DistrictFreeConstructibleNode extends BaseNode<TDistrictFreeConstructibleNode> {
  constructibleType: string | null = "CONSTRUCTIBLE_";
  districtType: `DISTRICT_${string}` | null = "DISTRICT_";
  featureType: TObjectValues<typeof FEATURE> | null = null;
  resourceType: TObjectValues<typeof RESOURCE> | null = null;
  terrainType: TObjectValues<typeof TERRAIN> | null = null;
  biomeType: string | null = null;
  riverType: string | null = null;
  priority: number | null = null;
  tier: number | null = null;

  constructor(payload: Partial<TDistrictFreeConstructibleNode> = {}) {
    super();
    this.fill(payload);
  }
}
