/**
 * model-age-summary-hub.ts
 * @copyright 2024, Firaxis Games
 * @description Age Summary data model
 */
interface AgeData {
    name: string;
    type: string;
    isCurrent: boolean;
    isSelected: boolean;
    isDisabled: boolean;
}
declare class AgeSummaryModel {
    ageName: string;
    ageData: AgeData[];
    selectedAgeType: string;
    selectedAgeChangedEvent: any;
    private onUpdate?;
    constructor();
    set updateCallback(callback: (model: AgeSummaryModel) => void);
    private updateGate;
    selectAgeType(type: string): void;
    selectCurrentAge(): void;
}
declare const AgeSummary: AgeSummaryModel;
export { AgeSummary as default };
