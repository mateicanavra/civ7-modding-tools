/**
 * @copyright 2025, Firaxis Games
 * @description Utilities for common functions when interacting with the diplomacy system.
 */
export declare function getPlayerDiplomacy(playerId: PlayerId): PlayerDiplomacy | null;
export declare function getPlayerDiplomacy(player: PlayerLibrary): PlayerDiplomacy | null;
export declare function getRelationshipIconFromPlayer(playerId: PlayerId): string;
export interface PlayerRelationship {
    type: DiplomacyPlayerRelationships;
    levelName: string;
    amount: number;
}
export declare function getRelationship(playerAId: PlayerId, playerBId?: PlayerId): PlayerRelationship;
export interface WarStatus {
    isAtWar: boolean;
    /**
     * War Support is a value that refers to the difference between
     * the number of support envoys that each player has in the war,
     * including bonus envoys.
     * In-game this is referred to as War Weariness.
     */
    warSupport: number;
}
export declare function getWarStatusFromPlayerId(playerId: PlayerId): WarStatus;
export declare function getMajorLeader(playerId: PlayerId): PlayerLibrary | null;
