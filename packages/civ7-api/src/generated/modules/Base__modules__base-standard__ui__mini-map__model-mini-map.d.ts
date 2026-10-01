/**
 * @file model-mini-map.ts
 * @copyright 2024, Firaxis Games
 * @description Data for the mini map
 */
declare class MiniMapModel {
    private static _Instance;
    static getInstance(): MiniMapModel;
    setLensDisplayOption(lens: string, value: string): void;
    getLensDisplayOption(lens: string): string;
}
declare const MiniMapData: MiniMapModel;
export { MiniMapData as default };
