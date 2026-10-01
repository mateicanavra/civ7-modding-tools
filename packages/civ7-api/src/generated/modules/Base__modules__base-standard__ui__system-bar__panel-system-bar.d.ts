/**
 * @file panel-system-bar.ts
 * @copyright 2021-2025, Firaxis Games
 * @description System bar attached to the top-right corner; holds access to default functionality such as the pause menu.
 */
import Panel from "/core/ui/panel-support.js";
/**
 * A panel containg system elements, such as pause menu button, clock, etc.
 */
export declare class PanelSystemBar extends Panel {
    private joinCode;
    private civilopediaButtonListener;
    private pauseButtonListener;
    private mutiplayerCodeButtonListener;
    private onJoinCodeButtonActivatedListener;
    private onPlayerTurnActivatedListener;
    private onNetworkConnectionStatusChangedListener;
    private onSPoPCompleteListener;
    private onSPoPHeartbeatListener;
    private onLogoutListener;
    private joinCodeButton;
    private multiplayerStringCode;
    private timeoutCallback;
    private timeoutID;
    private currentTurnTimerDisplay;
    private joinCodeShowing;
    private shouldShowJoinCode;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onMetagamingStatusChanged;
    private onPlayerTurnActivated;
    private updateTurnNumber;
    private updateTime;
    private addButton;
    private onShowPauseMenu;
    private hotLinkToCivilopedia;
    private toggleShowMultiplayerCode;
    private onJoinCodeButtonActivated;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-system-bar": ComponentRoot<PanelSystemBar>;
    }
}
