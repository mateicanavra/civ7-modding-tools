/**
 * @file live-event-logic.ts
 * @copyright 2021, Firaxis Games
 * @description An object to catch mp messages and orchestrate UI responses.
 */
declare class LiveEventManagerSingleton {
    private static _Instance;
    skipAgeSelect(): boolean;
    restrictToPreferredCivs(): boolean;
    /**
     * Singleton accessor
     */
    static getInstance(): LiveEventManagerSingleton;
}
declare const LiveEventManager: LiveEventManagerSingleton;
export { LiveEventManager as default };
