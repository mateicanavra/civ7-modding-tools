/**
 * @file player-yields-report-screen.ts
 * @copyright 2024, Firaxis Games
 * @description Model containing data for panel-yields-report-screen
 */
export interface YieldIncomeRow {
    isTitle: boolean;
    rowLabel: string;
    rowLabelTabbed?: boolean;
    rowIcon?: string;
    yieldNumbers: Record<YieldType, number>;
}
declare class ModelYieldsReport {
    private _yieldTotalRows;
    private _yieldCityRows;
    private _yieldUnitRows;
    private _yieldSummaryRows;
    private _yieldOtherRows;
    private totalYield;
    private totalYieldCity;
    private _netGoldFromUnits;
    private _curGoldBalance;
    private _curInfluenceBalance;
    private onUpdate?;
    set updateCallback(callback: (model: ModelYieldsReport) => void);
    update(): void;
    private constructTotalData;
    private constructCityData;
    private getCityCenterYields;
    private getCityDistrictTypeYields;
    private getDistrictYields;
    private constructUnitData;
    private constructYieldSummary;
    private constructOtherData;
    get yieldTotal(): YieldIncomeRow[];
    get yieldSummary(): YieldIncomeRow[];
    get yieldCity(): YieldIncomeRow[];
    get yieldUnits(): YieldIncomeRow[];
    get yieldOther(): YieldIncomeRow[];
    get netUnitGold(): number;
    get currentGoldBalance(): number;
    get currentInfluenceBalance(): number;
    private addYieldNumbers;
    private subtractYieldNumbers;
    private createBlankMap;
    getYieldMap: (api: PlayerStats | CityYields) => {
        [x: number]: any;
    };
}
declare const YieldReportData: ModelYieldsReport;
export { YieldReportData as default };
