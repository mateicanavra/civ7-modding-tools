/**
 * @file triumph-complete-queue-manager.ts
 * @copyright 2026, Firaxis Games
 * @description Manages the reading/writing of tracked triumph ids and adds them to the quest tracker
 */
import { DisplayHandlerBase } from "/core/ui/context-manager/display-handler.js";
import { TriumphCompletePopupData } from "/base-standard/ui-next/screens/legacies/triumph-tracking-manager.js";
declare class TriumphCompleteQueueManagerClass extends DisplayHandlerBase {
    private static instance;
    currentTriumphData: TriumphCompletePopupData | null;
    constructor();
    private initializeListeners;
    private onLegacyCompleted;
    show(request: TriumphCompletePopupData): void;
    hide(): void;
    closePopup: () => void;
    isShowing(): boolean;
}
export declare const TriumphCompleteQueueManager: TriumphCompleteQueueManagerClass;
export {};
