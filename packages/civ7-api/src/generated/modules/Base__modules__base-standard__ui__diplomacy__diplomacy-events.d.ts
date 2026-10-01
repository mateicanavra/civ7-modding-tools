/**
 * @file diplomacy-events.ts
 * @copyright 2025, Firaxis Games
 * @description Defines events for the diplomacy manager
 */
export declare const RaiseDiplomacyEventName: "raise-diplomacy";
export declare class RaiseDiplomacyEvent extends CustomEvent<{
    playerID: PlayerId;
}> {
    constructor(playerID: PlayerId);
}
