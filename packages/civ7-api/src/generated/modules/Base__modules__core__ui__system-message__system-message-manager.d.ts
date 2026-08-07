/**
 * @file system-message-manager.ts
 * @copyright 2022, Firaxis Games
 * @description Manages the data and queue for important system messages
 */
import { DisplayHandlerBase, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
interface SystemMessageData {
    systemMessageTitle: string;
    systemMessageContent: string;
    buttonData: SystemMessageButtonData[];
    queueToOverride?: string;
}
interface SystemMessageButtonData {
    callback(): void;
    caption: string;
}
interface SystemMessageRequest extends SystemMessageData, IDisplayRequestBase {
}
declare class SystemMessageManagerClass extends DisplayHandlerBase<SystemMessageRequest> {
    private showInviteListener;
    private OnlineErrorListener;
    private LoadLatestSaveGameListener;
    private HostMPGameListener;
    private pendingInviteJoinCode;
    private pendingInviteInviterName;
    currentSystemMessage: SystemMessageData | null;
    private errorMessagesCodes;
    constructor();
    private onShowInvite;
    showInvitePopup(inviterName: string, joinCode: string): void;
    show(): void;
    hide(): void;
    showPendingInvitePopup(): void;
    acceptInviteAfterSaveComplete(): void;
    private DisplayOnlineError;
    private displayMessage;
    private onActivityLoadLastSaveGame;
    private onActivityHostMPGame;
}
declare const SystemMessageManager: SystemMessageManagerClass;
export { SystemMessageManager as default };
