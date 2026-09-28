import { HexMap } from "/base-standard/scripts/hex-map.js";
export declare class PlayerRegion {
    tiles: float2[];
    landmassId: number;
    regionId: number;
    toString(): string;
}
export declare class PlayerRegionScores {
    scores: number[];
    totalBias: number;
    playerId: number;
    playerIndex: number;
    toString(): string;
}
export declare function chooseStartSectors(iNumPlayersLandmass1: number, iNumPlayersLandmass2: number, iRows: number, iCols: number, bHumanNearEquator: boolean): boolean[];
export declare function assignStartPositions(iNumWest: number, iNumEast: number, west: ContinentBoundary, east: ContinentBoundary, iStartSectorRows: number, iStartSectorCols: number, sectors: boolean[]): number[];
export declare function assignStartPositionsFromHexMap(hexMap: HexMap, humanLandmassId?: number): number[];
export declare function assignStartPositionsFromTiles(playerRegions: PlayerRegion[], humanLandmassId?: number): number[];
export declare function assignSingleContinentStartPositions(iNumPlayers: number, primaryLandmass: ContinentBoundary, iStartSectorRows: number, iStartSectorCols: number, sectors: boolean[]): number[];
