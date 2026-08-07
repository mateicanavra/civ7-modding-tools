/**
 * @file Unit Map Decoration support
 * @copyright 2021, Firaxis Games
 * @description Unit Map Decoration support for interface modes (unit-select, unit-move)
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare namespace UnitMapDecorationSupport {
    export enum Mode {
        selection = 0,
        movement = 1,
        both = 2
    }
    class Instance {
        private unitID;
        private mode;
        private unitSelectedOverlayPossibleMovementStyle;
        private unitSelectedOverlayZoCStyle;
        private unitSelectedOverlayAttackStyle;
        private unitSelectedCommandRadiusStyle;
        private unitSelectedOverlayMovementGroup;
        private unitSelectedOverlayZoCGroup;
        private unitSelectedOverlayAttackGroup;
        private commandRadiusOverlayGroup;
        private unitMovementOverlay;
        private commandRadiusOverlay;
        private unitZoneOfControlOverlay;
        private unitAttackOverlay;
        protected unitSelectedModelGroup: WorldUI.ModelGroup;
        private unitMovementStaticModelGroup;
        private unitMovementDynamicModelGroup;
        private movePathModelMap;
        private turnCounterModelMap;
        private movementPathColor;
        private queuedPathColor;
        private movementPathLastVisibleHeight;
        private movementCounterLastVisibleHeight;
        private desiredDestination;
        private _showDesiredDestination;
        set showDesiredDestination(shouldShow: boolean);
        get showDesiredDestination(): boolean;
        activate(unitID: ComponentID, mode: Mode): void;
        private onUnitKilled;
        private onUnitMovementPointsCleared;
        private updateRanges;
        setMode(mode: Mode): void;
        update(newDestination?: PlotCoord): void;
        private updateVisualization;
        private clearVisualizations;
        private visualizeTurnCounter;
        private addTurnCounterVFX;
        private removeTurnCounterVFX;
        private getDirectionsFromPath;
        private visualizeMovePath;
        private addMovePathVFX;
        private removeMovePathVFX;
        private getDirectionNumberFromDirectionType;
        private getPathVFXforPlot;
        private onUnitMoveComplete;
        deactivate(): void;
    }
    export const manager: Instance;
    export {};
}
