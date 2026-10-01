declare class TunerUtilities {
    getGameValueDisplayItems(tValue: TrackedValue, depthIn?: number): string[];
    getGameValueDisplayItemsTree(tValue: TrackedValue, depthIn?: number): object;
    getGameValueStepTypeString(type: number): string;
    getYieldSourceTypeString(type: number): string;
    getCityDisplayEntry(cityId: ComponentID): string | null;
    getShortCityDisplayEntry(cityId: ComponentID): string | null;
    getCityDisplayList(): string[];
}
declare const tunerUtilities: TunerUtilities;
