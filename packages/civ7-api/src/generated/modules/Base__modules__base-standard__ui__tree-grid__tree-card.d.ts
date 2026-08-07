/**
 * @file tree-card.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Component tree card (used in civic and tech trees)
 */
export declare enum TreeCardStates {
    COMPLETE = 0,
    RESEARCHING = 1,
    AVAILABLE = 2,
    LOCKED = 3
}
export declare const TreeCardHoveredEventName: "tree-card-hovered";
export interface TreeCardHoveredEventDetail {
    type: string;
    level: string;
}
export declare class TreeCardHoveredEvent extends CustomEvent<TreeCardHoveredEventDetail> {
    constructor(detail: TreeCardHoveredEventDetail);
}
export declare const TreeCardDehoveredEventName: "tree-card-dehovered";
export interface TreeCardDehoveredEventDetail {
    type: string;
    level: string;
}
export declare class TreeCardDehoveredEvent extends CustomEvent<TreeCardActivatedEventDetail> {
    constructor(detail: TreeCardDehoveredEventDetail);
}
export declare const TreeCardActivatedEventName: "tree-card-activated";
export interface TreeCardActivatedEventDetail {
    type: string;
    level: string;
}
export declare class TreeCardActivatedEvent extends CustomEvent<TreeCardActivatedEventDetail> {
    constructor(detail: TreeCardActivatedEventDetail);
}
