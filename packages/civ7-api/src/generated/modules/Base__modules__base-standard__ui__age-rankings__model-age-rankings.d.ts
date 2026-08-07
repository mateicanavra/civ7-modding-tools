/**
 * model-age-rankings.ts
 * @copyright 2023-2024, Firaxis Games
 * @description Age Rankings data model
 */
declare class AgeRankingsModel {
    victoryData: any;
    private onUpdate?;
    constructor();
    set updateCallback(callback: (model: AgeRankingsModel) => void);
    private updateGate;
    private onVictoryManagerUpdate;
    getMilestonesCompleted(legacyPathType: string): number;
    getMaxMilestoneProgressionTotal(legacyPathType: string): number;
    getMilestoneBarPercentages(legacyPathType: string): number[];
}
declare const AgeRankings: AgeRankingsModel;
export { AgeRankings as default };
