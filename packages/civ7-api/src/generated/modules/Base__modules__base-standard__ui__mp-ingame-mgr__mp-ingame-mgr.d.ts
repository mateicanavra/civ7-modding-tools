import "/base-standard/ui-next/screens/hotseat/hotseat-curtain.js";
declare class MultiplayerIngameSingleton {
    private mpPauseDialogID?;
    private multiplayerGameAbandonedListener;
    private multiplayerGameLastPlayerListener;
    private localPlayerChangedListener;
    private loadingStartCurtainRemoveListener;
    private multiplayerGamePauseStateChangedListener;
    /**
     * CTOR
     */
    constructor();
    /**
     * Engine ready, establish callbacks.
     */
    onReady(): void;
    /**
     * Engine Event - multiplayer game has been abandoned (by other players?)
     * @param data
     */
    onMultiplayerGameAbandoned(data: MultiplayerGameAbandonedData): void;
    /**
     * Engine Event - Last player in the game.
     */
    onMultiplayerGameLastPlayer(): void;
    onMultiplayerPauseStatus(data: GenericDataInt32): void;
    onAbandonedConfirm(): void;
    /**
     * Is the hotseat curtain up (attached to the DOM and showing?)
     * @returns true if up, false otherwise.
     */
    private isHotseatCurtainUp;
    private attachHotseatCurtain;
    private canAttachCurtain;
    /**
     * Local player changed; likely handing off game to another player (hotseat).
     */
    private onLocalPlayerChanged;
    private onLoadingStartCurtainRemove;
}
declare const MultiplayerIngame: MultiplayerIngameSingleton;
export { MultiplayerIngame as default };
