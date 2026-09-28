/**
 * @file screen-endgame.ts
 * @copyright 2023, Firaxis Games
 * @description Information to show at the end of a game.
 */
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
import { EndGameScreenCategory } from "/base-standard/ui/cinematic/cinematic-manager.js";
declare class EndGameScreenManager extends DisplayHandlerBase {
    endGameScreenElement: HTMLElement | null;
    /** Track if we've already shown the end game screen to prevent redundant calls from edge cases
     *  For Example: Player gets defeated in MP but then the Age Ends for other players before they've transitioned out of the game
     */
    hasShownEndGameScreen: boolean;
    constructor();
    show(_request: IDisplayRequestBase): void;
    hide(_request: IDisplayRequestBase, _options: DisplayHideOptions): void;
    private onTeamVictory;
    private onAgeEnded;
    private onPlayerDefeated;
}
declare const EndGameScreenManagerInstance: EndGameScreenManager;
export { EndGameScreenCategory, EndGameScreenManagerInstance as default };
