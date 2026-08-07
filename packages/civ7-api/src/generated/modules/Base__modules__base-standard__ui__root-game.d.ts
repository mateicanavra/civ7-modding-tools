/**
 * @file root-game.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Top level User Interface script (UI root) when playing the game.
 *
 * Imports below using "await import" are doing so in order for the bundler to keep them separate.
 */
/**
 * When the curtain is removed, anything registered to receive signals before
 * the first playable turn.
 */
export interface StartCurtainData {
    id: string;
    index: number;
    max: number;
}
export declare const LoadingStartCurtainRemoveName: "loading-start-curtain-removed";
export declare class LoadingStartCurtainRemoveEvent extends CustomEvent<StartCurtainData> {
    constructor(detail: StartCurtainData);
}
