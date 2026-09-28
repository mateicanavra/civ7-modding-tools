import { HexMap, HexTile } from "/base-standard/scripts/hex-map.js";
import { WrapDistOptions } from "/base-standard/scripts/voronoi-utils.js";
export declare class PlayerRegion {
    id: number;
    playerAreas: number;
    filter: (tile: HexTile) => boolean;
}
export declare function CreatePlayerRegions(hexMap: HexMap, totalPlayers: number): PlayerRegion[];
export declare function CreateMajorPlayerAreas(hexMap: HexMap, playerRegions: PlayerRegion[], valueFunction?: (tile: HexTile) => number, wrap?: WrapDistOptions): void;
