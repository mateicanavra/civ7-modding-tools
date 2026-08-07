/**
 * @file yield-change-visualizer
 * @copyright 2023-2025, Firaxis Games
 * @description Helper class to display yield deltas in different layers
 */
import { YieldLike } from "/base-standard/ui/utilities/utilities-city-yields.js";
export type YieldPillData = YieldLike & {
    yieldDelta: number;
};
export declare class YieldChangeVisualizer {
    private readonly BASE_TEXT_PARAMS;
    private readonly POSITIVE_ICON_PARAMS;
    private readonly NEGATIVE_ICON_PARAMS;
    private readonly PILL_SCALE;
    private readonly ICON_SCALE;
    private isDestroyed;
    private backgroundSpriteGrid;
    private foregroundSpriteGrid;
    constructor(name: string);
    release(): void;
    clear(): void;
    clearPlot(plot: WorldUI.Plot): void;
    setVisible(visible: boolean): void;
    addSprite(plot: WorldUI.Plot, asset: string, offset: float3, params?: WorldUI.SpriteParams): void;
    addText(plot: WorldUI.Plot, text: string, offset: float3, params?: WorldUI.TextParams): void;
    addYieldChange(data: YieldPillData, location: WorldUI.Plot, offset: float2, color: number, plotOffset?: float3): void;
}
