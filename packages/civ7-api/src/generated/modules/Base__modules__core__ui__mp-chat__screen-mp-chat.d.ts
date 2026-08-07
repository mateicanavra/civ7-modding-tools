/**
 * @file screen-mp-chat.ts
 * @copyright 2020-2022, Firaxis Games
 * @description Multiplayer Chat panel
 */
import { NotificationType } from "/core/ui/mp-chat/chat-command-manager.js";
import Panel from "/core/ui/panel-support.js";
export declare const mapChatTargetTypeToImageClass: {
    [x: number]: string;
};
export declare const PRIVATE_SELECT_EVENT_NAME = "private-select-event";
export declare class PrivateSelectEvent extends CustomEvent<{
    currentTarget: ChatTargetEntry;
}> {
    constructor(currentTarget: ChatTargetEntry);
}
export declare const EMOTICON_SELECT_EVENT_NAME = "emoticon-select-event";
export declare class EmoticonSelectEvent extends CustomEvent<{
    iconId: string;
}> {
    constructor(iconId: string);
}
export declare class ScreenMPChat extends Panel {
    private editBox;
    private editBoxGamepadText;
    private chatList;
    private scrollableContainer;
    private preview;
    private previewText;
    private previewTarget;
    private previewTargetContainer;
    private unreadButton;
    private unreadButtonContainer;
    private inputContainer;
    private sendToButton;
    private sendToButtonIcon;
    private emoticonButton;
    private emoticonButtonIcon;
    private sendButton;
    private scrollable;
    private currentChatTargets;
    private currentTarget;
    private stylizedMarkupMessage;
    private markupMessage;
    private editBoxObserver;
    private commandError;
    private privateToLocalPlayer;
    private forcedUnread;
    private chatCommandManager;
    private sendToButtonActivateListener;
    private sendButtonActivateListener;
    private emoticonButtonActivateListener;
    private privateSelectListener;
    private emoticonSelectListener;
    private editBoxAttributeMutateListener;
    private validateVirtualKeyboardListener;
    private editBoxValueChangeListener;
    private keyDownListener;
    private scrollAtBottomListener;
    private unreadButtonActivateListener;
    private focusListener;
    private scrollableBlurListener;
    private scrollableFocusListener;
    private activeDeviceTypeChangedListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onReceiveFocus(): void;
    close(): void;
    private getContent;
    private onEngineInput;
    private handleEngineInput;
    /**
     * Track the content in the real input (editBox) on change.
     */
    private onEditBoxAttributeMutate;
    onDetach(): void;
    private onPlayerConnected;
    private onPlayerDisconnected;
    private onKickVoteComplete;
    private onKickDirectComplete;
    private onPlayerKicked;
    private onKeyDown;
    private onFocus;
    private onScrollableBlur;
    private onScrollableFocus;
    private onActiveDeviceTypeChanged;
    private onScrollAtBottom;
    private onUnreadButtonActivate;
    private onSend;
    private onContextClose;
    private updateSendButton;
    private updateSendToButton;
    private updateEmoticonButton;
    private updateEditBox;
    private updatePreview;
    private updatePreviewText;
    private updatePreviewTarget;
    private updateUnreadButtonContainer;
    onMultiplayerChat: (data: MultiplayerChatData, playSound?: boolean) => void;
    private updateNavHelp;
    private onPlayerInfoChanged;
    private onPrivateSelect;
    private onEmoticonSelect;
    /**
     * @param {string} playerName: The player to search
     * @returns: A collection of targets with the matching name (substring)
     */
    getCurrentPlayersByName(playerName: string): ChatTargetEntry[];
    getGlobalChatTarget(): ChatTargetEntry | undefined;
    lastPrivateToLocalTarget(): ChatTargetEntry | undefined;
    getLocalTeamChatTarget(): ChatTargetEntry | undefined;
    setCurrentTarget(currentTarget: ChatTargetEntry): void;
    setCommandError(error: string): void;
    setMarkupMessage(message: string): void;
    attachNodeToScrollable(msgNode?: HTMLElement): void;
    private resetCurrentTarget;
    private createMessage;
    /**
     * @param {string} content: The content of the message
     * @param {string} classNames: The className to apply the notification styles
     * @returns: The HTML message node
     */
    createNotificationMessage(content: string, notificationType: NotificationType): HTMLElement | undefined;
    private onValidateVirtualKeyboard;
    private onEditBoxValueChange;
    private onSendToButtonActivate;
    private onSendButtonActivate;
    private onEmoticonButtonActivate;
    private toggleSendToPanel;
    private toggleEmoticonPanel;
    private scrollAtBottom;
    private setCaretAtPosition;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-mp-chat": ComponentRoot<ScreenMPChat>;
    }
    interface HTMLElementEventMap {
        PRIVATE_SELECT_EVENT_NAME: PrivateSelectEvent;
        EMOTICON_SELECT_EVENT_NAME: EmoticonSelectEvent;
    }
}
