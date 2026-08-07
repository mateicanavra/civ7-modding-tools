/**
 * @file panel-action
 * @copyright 2019-2025, Firaxis Games
 * @description The panel which hosts the main action button for progressing to the next turn and activating turn blocking notifications.
 */
import Panel from "/core/ui/panel-support.js";
/**
 * Area for sub system button icons.
 */
export declare class PanelAction extends Panel {
    private actionButton;
    private mpTurnTimerContainer;
    private mpTimerMaxTime;
    private turnTimerElement;
    private timerAnimationElements;
    private notificationIcon;
    private actionText;
    private lastPlayerMessageContainer;
    private navHelpContainer;
    private lastPlayerMessageVisibility;
    private pleaseWaitAnimation;
    private static actionIconCache;
    private updateGate;
    private engineInputListener;
    private activeDeviceChangedEventListener;
    private nextActionHotKeyListener;
    private centerButtonAnimListener;
    private inputContextChangedListener;
    private notificationSlots;
    private currentTurnTimerDisplay;
    onInitialize(): void;
    onAttach(): void;
    private onActiveDeviceChanged;
    onDetach(): void;
    private inputContextChanged;
    private onGameStarted;
    private onActionPanelBlockerActivated;
    private disableButton;
    private enableButton;
    disableActionButton(): void;
    enableActionButton(): void;
    /**
     * Engine callback - autoplay ended
     */
    private onAutoplayEnd;
    /**
     * Engine callback - autoplay started
     */
    private onAutoplayStarted;
    private onLocalPlayerTurnBegin;
    private onLocalPlayerTurnEnd;
    private remotePlayerTurnChanged;
    private updatePlayerFocus;
    private onUpdate;
    private playNextActionAnimation;
    private playBlockerAnimation;
    private showBlockerIcon;
    private hideBlockerIcon;
    private getNotificationInfo;
    private refreshActionButton;
    private centerButtonAnimEnd;
    private setEndTurnWaiting;
    canEndTurn(): boolean;
    canUnreadyTurn(): boolean;
    showRemainingMovesState(): boolean;
    private queueUpdateIfLocalPlayer;
    private onNextActionHotkey;
    private tryEndTurn;
    private sendEndTurn;
    private sendUnreadyTurn;
    private activateBlockingNotification;
    onPlayerTurnActivated(data: PlayerTurnActivated_EventData): void;
    onLocalPlayerChanged(): void;
    onNotificationAdded(data: Notification_EventData): void;
    onNotificationDismissed(data: Notification_EventData): void;
    onNotificationUpdated(data: Notification_EventData): void;
    private onActionButton;
    private onEngineInput;
    onActionNextAction(event: Event): void;
    private onPlayerTurnDeactivated;
    private isLastPlayerInMPTurn;
    private lastPlayerMessageShow;
    private lastPlayerMessageHide;
    private onUnitOperationStart;
    private onUnitNumModified;
    private onUnitMoved;
    private onUnitActivityChanged;
    private onUnitBermudaTeleported;
    private tryAutoUnitCycle;
    private onTurnTimerUpdated;
    private startMPTimerAnimation;
}
