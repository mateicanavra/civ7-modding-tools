/**
 * @file Unit Map Decoration support
 * @copyright 2021, Firaxis Games
 * @description Unit Map Decoration support for interface modes (unit-select, unit-move)
 */
export declare namespace ReinforcementMapDecorationSupport {
    class Instance {
        private movePathModelMap;
        private turnCounterModelMap;
        private reinforcementPathColor;
        updateVisualization(results: UnitGetPathToResults): void;
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
        deactivate(): void;
    }
    export const manager: Instance;
    export {};
}
