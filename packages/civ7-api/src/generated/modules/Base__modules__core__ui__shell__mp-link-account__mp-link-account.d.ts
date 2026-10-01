/**
 * @file mp-link-account.ts
 * @copyright 2020-2025, Firaxis Games
 * @description The Create/Link 2K Account screen
 */
import Panel from "/core/ui/panel-support.js";
export declare class MpLinkAccount extends Panel {
    private engineInputListener;
    private QrLinkAndImageReadyListener;
    private QrLinkCompletedListener;
    private qrCodeImage;
    private qrCodeText;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    private isAccountLinked;
    private setupQrLinkAndImage;
    private setupQrImage;
    private setupQrLink;
    private onQrLinkAndImageReady;
    private onQrLinkCompleted;
    private onEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-mp-link-account": ComponentRoot<MpLinkAccount>;
    }
}
