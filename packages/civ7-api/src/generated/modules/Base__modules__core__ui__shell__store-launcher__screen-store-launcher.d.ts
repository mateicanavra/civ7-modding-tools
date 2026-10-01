/**
 * @file collection-content.ts
 * @copyright 2024, Firaxis Games
 * @description Screen containning the collection-content.
 */
import Panel from "/core/ui/panel-support.js";
export declare class ScreenStoreLauncher extends Panel {
    private backButton;
    private redeemButton;
    private collectionContent;
    private backButtonActivateListener;
    private redeemButtonActivateListener;
    private engineInputListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    setPanelOptions(_panelOptions: object): void;
    private onEngineInput;
    private handleEngineInput;
    private onBackButtonActivate;
    private onRedeemButtonActivate;
}
