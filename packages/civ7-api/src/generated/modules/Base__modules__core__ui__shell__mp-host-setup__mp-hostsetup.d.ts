declare class MpHostSetup {
    private buttonList;
    private buttonBox?;
    constructor();
    onInit(): void;
    onStartGame(): void;
    onBackToMultiplayerMenu(): void;
    onReady(): void;
}
declare const MultiplayerHostSetup: MpHostSetup;
export { MultiplayerHostSetup as default };
