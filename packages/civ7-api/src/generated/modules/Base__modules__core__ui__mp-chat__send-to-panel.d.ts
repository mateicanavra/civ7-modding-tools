/**
 * @file send-to-panel.ts
 * @copyright 2023, Firaxis Games
 * @description Multiplayer Chat SendTo panel
 */
import Panel from "/core/ui/panel-support.js";
export declare class SendToPanel extends Panel {
    readonly globalChatIndex: number;
    private targetsContainer;
    private targetElements;
    private targetProfileIcons;
    private targetMuteIcons;
    private targets;
    private scrollableContainer;
    private currentFocusIndex;
    private engineInputListener;
    private targetActivateListener;
    private targetFocusListener;
    private windowEngineInputListener;
    private targetProfileActivateListener;
    private targetMuteActivateListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private getContent;
    private getMuteLocString;
    private isTargetSendToPanelTrayHidden;
    private isTargetProfileHidden;
    private updateTargetProfileIcons;
    private updateTargetMuteIcons;
    private getShowMutedIcon;
    private onTargetActivate;
    private selectTargetByIndex;
    private onTargetFocusListener;
    private onTargetProfileActivate;
    private onTargetMuteActivate;
    private updatePlayerOrGlobalMutedIcon;
    private updateTeamMutedIcon;
    private updateMutedIcon;
    private handleMuteButtonClicked;
    private isTeamChatMuted;
    private onPlayerConnected;
    private onPlayerDisconnected;
    private onPlayersSwapped;
    private onEngineInput;
    private handleEngineInput;
    private onWindowEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "send-to-panel": ComponentRoot<SendToPanel>;
    }
}
