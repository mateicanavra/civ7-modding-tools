/**
 * @file operation-target-layer.ts
 * @copyright 2025, Firaxis Games
 * @description Layer that lets the UI highlight unit operation targets when selecting/hovering over unit actions
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare const UpdateOperationTargetEventName: string;
export declare class UpdateOperationTargetEvent extends CustomEvent<{
    plots: PlotIndex[];
    canStart: boolean;
}> {
    constructor(plots: PlotIndex[], canStart: boolean);
}
declare class OperationTargetLensLayer implements ILensLayer {
    private overlayGroup;
    private plotOverlay;
    private updateOperationTargetListener;
    private unitSelectionChangedListener;
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    private onUnitSelectionChanged;
    private onUpdateOperationTarget;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-operation-target-layer": OperationTargetLensLayer;
    }
}
export {};
