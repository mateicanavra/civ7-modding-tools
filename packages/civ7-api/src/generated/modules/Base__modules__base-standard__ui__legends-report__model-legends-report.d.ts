/**
 * model-legends-report.ts
 * @copyright 2024, Firaxis Games
 * @description Data model for legend progress and challenge information
 */
import { LegendsData } from "/base-standard/ui/legends-manager/legends-manager.js";
declare class LegendsReportModel {
    legendsData: LegendsData | null;
    _showRewards: boolean;
    private onUpdate?;
    constructor();
    get showRewards(): boolean;
    set showRewards(shouldShowRewards: boolean);
    set updateCallback(callback: (model: LegendsReportModel) => void);
    private updateGate;
}
declare const LegendsReport: LegendsReportModel;
export { LegendsReport as default };
