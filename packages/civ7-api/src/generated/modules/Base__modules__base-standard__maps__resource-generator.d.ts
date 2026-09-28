import { getTileClass, isCoastalAdjacentToLand, tileClassIdFromValidBiome, tileClassLabel } from "/base-standard/maps/resource-placement-common.js";
import type { PackedBlueNoiseWindows, TileClass } from "/base-standard/maps/resource-placement-common.js";
export { getTileClass, isCoastalAdjacentToLand, tileClassIdFromValidBiome, tileClassLabel };
export type { PackedBlueNoiseWindows, TileClass };
export declare function generateResources(iWidth: number, iHeight: number, minMarineResourceTypesOverride?: number): void;
