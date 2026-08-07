/**
 * @file tutorial-events
 * @copyright 2024, Firaxis Games
 * @description Events related to the tutorial system
 *
 */
/**
 * Details type in the custom event signaled when the callout is closed
 */
export type LowerCalloutDetails = {
    itemID: string;
    optionNum: 1 | 2 | 3;
    nextID?: string;
    closed: boolean;
} | {
    closed: boolean;
};
export declare class LowerCalloutEvent extends CustomEvent<LowerCalloutDetails> {
    constructor(detail: LowerCalloutDetails);
}
/**
 * Details type in the custom event signaled when the callout is closed
 */
export interface LowerQuestPanelDetails {
    itemID: string;
    advisorPath: AdvisorType;
    nextID?: string;
    closed: boolean;
}
export declare class LowerQuestPanelEvent extends CustomEvent<LowerQuestPanelDetails> {
    constructor(detail: LowerQuestPanelDetails);
}
export declare const TutorialCalloutMinimizeEventName = "callout-minimize";
export declare class TutorialCalloutMinimizeEvent extends CustomEvent<{
    bubbles: boolean;
}> {
    constructor(bubbles: boolean);
}
export declare const TutorialCalloutInspectEventName = "callout-inspect";
export declare class TutorialCalloutInspectEvent extends CustomEvent<{
    bubbles: boolean;
}> {
    constructor(bubbles: boolean);
}
