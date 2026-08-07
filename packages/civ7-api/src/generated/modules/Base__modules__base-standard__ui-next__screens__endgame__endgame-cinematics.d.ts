/**
 * @file endgame-cinematics.ts
 * @copyright 2026, Firaxis Games
 * @description Controls cinematic sequences played at the end of a game.
 */
export interface VictoryData {
    victoryClass: string;
    isDefeat: boolean;
}
export declare class EndgameCinematicManager {
    private pois;
    private poiIndex;
    private playVFX;
    private looping;
    private running;
    private camera;
    private units;
    private firstRun;
    private timeout?;
    private lastPlot?;
    private currentPoi?;
    private cinematic?;
    private CinematicVFXModelGroup;
    private onComplete?;
    private vfxQueue;
    private awaitCinematicListener;
    static instance: EndgameCinematicManager;
    start(victory?: VictoryData, onComplete?: () => void): void;
    stop(): void;
    private isCoastTile;
    private startCinematic;
    private awaitCinematic;
    private endCinematic;
    private nextCinematic;
    private getPointsOfInterest;
    private getCinematicPlotVFXAssetName;
}
