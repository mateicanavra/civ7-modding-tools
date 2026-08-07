/**
 * model-great-works.ts
 * @copyright 2022 - 2023, Firaxis Games
 * @description Gathers Great Works data for the active player
 */
export interface GreatWorkDetails {
    iconURL: string;
    name: string;
}
export interface GreatWorkBuildingYields {
    type: YieldType;
    iconURL: string;
    amount: number;
}
export interface GreatWorkTotalYields {
    type: YieldType;
    amount: number;
}
export interface GreatWorkData {
    cityName: string;
    buildingName: string;
    totalSlots: number;
    yields: GreatWorkBuildingYields[];
    details: GreatWorkDetails[];
}
declare class GreatWorksModel {
    private onUpdate?;
    private selectedGreatWork;
    private selectedGreatWorkLocation;
    private greatWorkCreatedListener;
    private greatWorkArchivedListener;
    private greatWorkMovedListener;
    private cityProductionCompletedListener;
    private greatWorksHotkeyListener;
    private greatWorkSlotCreatedListener;
    GreatWorks: GreatWorkData[];
    private isGreatWorksInit;
    YieldTotals: GreatWorkTotalYields[];
    GreatWorkBuildings: GreatWorkBuilding[];
    WorksInArchive: number;
    private TotalGreatWorks;
    private LocalPlayer;
    private TotalGreatWorkSlots;
    private LatestGreatWorkDetails;
    private updateGate;
    constructor();
    set updateCallback(callback: (model: GreatWorksModel) => void);
    get playerId(): PlayerId;
    get allGreatWorks(): GreatWorkData[];
    get allGreatWorkBuildings(): GreatWorkData[];
    get totalGreatWorks(): number;
    get totalSlots(): number;
    get localPlayer(): any;
    get selectedWork(): number;
    get latestGreatWorkDetails(): GreatWorkDetails | null;
    hasSelectedGreatWork(): boolean;
    clearSelectedGreatWork(): void;
    update(): void;
    private handleYield;
    private onGreatWorksHotkey;
    selectGreatWork(greatWorkIndex: number, greatWorkCityID?: number): void;
    selectEmptySlot(cityID: number, buildingID: number): void;
}
declare const GreatWorks: GreatWorksModel;
export { GreatWorks as default };
