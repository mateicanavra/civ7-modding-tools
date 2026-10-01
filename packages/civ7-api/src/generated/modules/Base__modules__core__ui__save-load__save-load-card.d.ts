/**
 * @file save-load-card.ts
 * @copyright 2023, Firaxis Games
 * @description Activatable styled component as a card used in the SaveLoad screen
 */
export declare const ActionConfirmEventName: "action-confirm";
export declare class ActionConfirmEvent extends CustomEvent<never> {
    constructor();
}
declare global {
    interface HTMLElementEventMap {
        [ActionConfirmEventName]: ActionConfirmEvent;
    }
}
