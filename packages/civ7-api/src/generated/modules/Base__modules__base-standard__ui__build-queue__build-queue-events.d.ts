/**
 * @file build-queue-events.ts
 * @copyright 2026, Firaxis Games
 * @description Events for city build queue.
 */
export declare class RequestBuildQueueMoveItemUpEvent extends CustomEvent<{
    index: string;
}> {
    constructor(index: string);
}
export declare class RequestBuildQueueMoveItemLastEvent extends CustomEvent<{
    index: string;
}> {
    constructor(index: string);
}
export declare class RequestBuildQueueCancelItemEvent extends CustomEvent<{
    index: string;
}> {
    constructor(index: string);
}
declare global {
    interface WindowEventMap {
        "request-build-queue-move-item-up": RequestBuildQueueMoveItemUpEvent;
        "request-build-queue-cancel-item": RequestBuildQueueCancelItemEvent;
        "request-build-queue-move-item-last": RequestBuildQueueMoveItemLastEvent;
    }
}
