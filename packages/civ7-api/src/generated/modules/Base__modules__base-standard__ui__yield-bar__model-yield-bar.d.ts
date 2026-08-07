/**
 * model-yield-bar.ts
 * @copyright 2025, Firaxis Games
 * @description Model for yield bar data
 */
declare class YieldBarModel {
    cityYields: {
        type: string;
        value: number;
    }[];
    yieldBarUpdateEvent: any;
    constructor();
    private onUpdate?;
    set updateCallback(callback: (model: YieldBarModel) => void);
    private updateGate;
    private onCitySelectionChanged;
}
declare const YieldBar: YieldBarModel;
export { YieldBar as default };
