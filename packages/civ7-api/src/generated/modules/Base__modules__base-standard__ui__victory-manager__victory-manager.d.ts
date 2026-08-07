/**
 * victory-manager.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Queries and caches data from the VictoryManagerLibrary to be used by various UI
 */
export interface VictoryData {
    Name: string;
    Description: string;
    Icon: string;
    Type: string;
    ClassType: string;
    playerData: PlayerData[];
}
export interface PlayerData {
    playerID: PlayerId;
    playerName: string;
    leaderPortrait: string;
    civIcon: string;
    currentScore: number;
    maxScore: number;
    isLocalPlayer: boolean;
}
export interface PlayerScoreData {
    playerID: PlayerId;
    playerName: string;
    playerNameFirstParty: string;
    playerNameT2GP: string;
    playerHostingIcon: string;
    leaderPortrait: string;
    civIcon: string;
    isSameHostPlatform: boolean;
    isLocalPlayer: boolean;
    isHumanPlayer: boolean;
    previousAgeScore: number;
    totalAgeScore: number;
    victoryScoreData: PlayerVictoryScoreData[];
    legactPointData: CardCategoryInstance[];
    team: number;
}
export interface PlayerVictoryScoreData {
    name: string;
    description: string;
    icon: string;
    score: number;
}
declare class VictoryManagerImpl {
    claimedVictories: VictoryManagerLibrary_VictoryInfo[];
    victoryEnabledPlayers: PlayerId[];
    victoryProgress: VictoryManagerLibrary_VictoryProgress[];
    enabledLegacyPathDefinitions: LegacyPathDefinition[];
    processedVictoryData: any;
    processedScoreData: PlayerScoreData[];
    totalLegacyPointsEarned: number;
    victoryManagerUpdateEvent: any;
    constructor();
    private updateGate;
    private processVictoryData;
    private processScoreData;
    getHighestAmountOfLegacyEarned(): number;
    private processLegacyPoints;
    private playerSorter;
    private onCityAddedToMap;
    private onCityRemovedFromMap;
    private onGreatWorkCreated;
    private onGreatWorkMoved;
    private onGreatWorkArchived;
    private onTradeRouteAddedToMap;
    private onTradeRouteRemovedFromMap;
    private onTradeRouteChanged;
    private onConstructibleAddedToMap;
    private onConstructibleChanged;
    private onConstructibleRemovedFromMap;
    private onWonderCompleted;
    private onVPChanged;
}
declare const VictoryManager: VictoryManagerImpl;
export { VictoryManager as default };
