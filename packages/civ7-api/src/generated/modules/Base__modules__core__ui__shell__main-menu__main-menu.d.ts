/**
 * @file main-menu.ts
 * @copyright 2020-2025, Firaxis Games
 */
import { MainMenuReturnEvent } from "/core/ui/events/shell-events.js";
/**
 * NOTE: Used to distinguish starting the game from the Events panel or directly from Create Game/Multiplayer
 */
export declare const isLiveEventGame = false;
declare global {
    interface WindowEventMap {
        "main-menu-return": MainMenuReturnEvent;
    }
}
