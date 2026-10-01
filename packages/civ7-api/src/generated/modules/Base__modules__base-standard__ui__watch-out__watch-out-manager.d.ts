/**
 * @file watch-out-manager.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Main coordinator for Watch Out Notifications.
 */
import { DisplayHandlerBase } from "/core/ui/context-manager/display-handler.js";
import { DisplayHideOptions, IDisplayRequest, IDisplayRequestBase } from "/core/ui/context-manager/display-queue-manager.js";
import { NotificationID } from "/base-standard/ui/notification-train/model-notification-train.js";
import TutorialItem, { TutorialAdvisorType } from "/base-standard/ui/tutorial/tutorial-item.js";
export interface WatchOutPopupData extends IDisplayRequestBase {
    item: TutorialItem;
}
/**
 * The main class of the watch out notification system.
 */
declare class WatchOutManagerClass extends DisplayHandlerBase<WatchOutPopupData> {
    private static instance;
    private isNotificationPanelRaised;
    currentWatchOutPopupData: WatchOutPopupData | null;
    get isManagerActive(): boolean;
    constructor();
    isShowing(): boolean;
    /**
     * @implements {IDisplayQueue}
     */
    show(request: WatchOutPopupData): void;
    /**
     * @implements {IDisplayQueue}
     */
    hide(_request: WatchOutPopupData, _options?: DisplayHideOptions): void;
    canShow(_request: WatchOutPopupData, _activeRequests: readonly IDisplayRequest[]): boolean;
    closePopup: () => void;
    raiseNotificationPanel(notificationId: NotificationID, advisorType?: TutorialAdvisorType, lookAtCallback?: (notificationId: NotificationID) => void): void;
}
declare const WatchOutManager: WatchOutManagerClass;
export { WatchOutManager as default };
