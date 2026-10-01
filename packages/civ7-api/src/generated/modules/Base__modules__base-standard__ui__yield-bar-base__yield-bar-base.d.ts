/**
 * @file yield-bar-base.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Basis yield bar which supports positve negative styling for each yield
 */
export declare enum YieldBarEntryStyle {
    NONE = 0,
    GAIN = 1,
    LOSS = 2
}
export interface YieldBarEntry {
    type: string;
    value: number;
    style: YieldBarEntryStyle;
}
