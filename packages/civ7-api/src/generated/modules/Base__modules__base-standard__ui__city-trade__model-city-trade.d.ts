/**
 * @file City Trade Screen Model
 * @copyright 2020-2021, Firaxis Games
 * @description Handles all of the data for a City's resources and trade mgmt
 */
export interface AggregateYield {
    yieldType: YieldType;
    value: number;
    memberAttributes: GameAttribute[];
}
declare class CityTradeModel {
    private _cityID;
    private _resourceYields;
    private _tradeYields;
    private _allYields;
    private _numLocalResources;
    private onUpdate?;
    constructor();
    set cityID(id: ComponentID | null);
    get hasValidCity(): boolean;
    get cityID(): ComponentID | null;
    get yields(): AggregateYield[];
    get tradeYields(): GameAttribute[] | null;
    get resourceYields(): GameAttribute[] | null;
    get numLocalResources(): number;
    set updateCallback(callback: (model: CityTradeModel) => void);
    update(): void;
    aggregateYieldAttributes(yieldAttributes: GameAttribute[], yieldDataRef: AggregateYield[]): void;
}
declare const CityTradeData: CityTradeModel;
export { CityTradeData as default };
