import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
import { NotificationID } from "/base-standard/ui/notification-train/model-notification-train.js";
interface NarrativePopupData {
    storyID: number | null;
    type: number | null;
    playerID: PlayerId;
}
interface NarrativePopupRequest extends NarrativePopupData, IDisplayRequestBase {
}
declare class NarrativePopupManagerImpl extends DisplayHandlerBase<NarrativePopupRequest> {
    private currentNarrativeData;
    private isNotificationPanelRaised;
    private notificationID;
    private static instance;
    constructor();
    raiseNotificationPanel(notificationId: NotificationID, _activatedBy: PlayerId | null, favorDiscovery: boolean): false | undefined;
    private onInterfaceModeChanged;
    closePopup: () => void;
    /**
     * @implements {IDisplayHandler}
     */
    canShow(): any;
    /**
     * @implements {IDisplayHandler}
     */
    show(request: NarrativePopupRequest): void;
    isShowing(): boolean;
    /**
     * @implements {IDisplayHandler}
     */
    hide(request: NarrativePopupRequest, _options?: DisplayHideOptions): void;
}
export declare const NarrativePopupManager: NarrativePopupManagerImpl;
export {};
