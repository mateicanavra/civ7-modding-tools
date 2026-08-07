/**
 * model-victory-points.ts
 * @copyright 2024, Firaxis Games
 * @description Victory Points data model
 */
import { PlayerScoreData } from "/base-standard/ui/victory-manager/victory-manager.js";
declare class VictoryPointsModel {
    scoreData: PlayerScoreData[];
    highestScore: number;
    private onUpdate?;
    constructor();
    set updateCallback(callback: (model: VictoryPointsModel) => void);
    private updateGate;
    private onVictoryManagerUpdate;
    legacyTypeToBgColor(legacyType: CardCategories): "bg-victory-science" | "bg-victory-culture" | "bg-victory-military" | "bg-victory-economic" | "";
    legacyTypeToVictoryType(legacyType: CardCategories): "" | "VICTORY_CLASS_SCIENCE" | "VICTORY_CLASS_CULTURE" | "VICTORY_CLASS_MILITARY" | "VICTORY_CLASS_ECONOMIC";
    scoreDataByTeam(): any;
}
declare const VictoryPoints: VictoryPointsModel;
export { VictoryPoints as default };
