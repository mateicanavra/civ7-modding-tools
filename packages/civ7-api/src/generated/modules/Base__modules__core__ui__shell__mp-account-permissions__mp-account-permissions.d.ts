/**
 * @file mp-account-permissions.ts
 * @copyright 2020-2026, Firaxis Games
 * @description A reusable account portal popup with dynamic localization key support.
 */
import Panel from "/core/ui/panel-support.js";
declare class MpAccountPermissions extends Panel {
    private engineInputListener;
    private qrCodeImage;
    private qrCodeText;
    private locKey;
    private customUrl;
    private blockReason;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private renderContent;
    private renderQrImage;
    private renderQrLink;
    private onEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-mp-account-permissions": ComponentRoot<MpAccountPermissions>;
    }
}
export {};
