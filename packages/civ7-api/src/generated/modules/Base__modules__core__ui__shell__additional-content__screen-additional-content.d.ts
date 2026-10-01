/**
 * @file screen-additional-content.ts
 * @copyright 2024, Firaxis Games
 * @description Frame showcasing the collection-content and mods-content.
 */
import Panel from "/core/ui/panel-support.js";
export declare class ScreenAdditionalContent extends Panel {
    private backButton;
    private modsContent;
    private backButtonActivateListener;
    private engineInputListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    getContent(): string;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    private onEngineInput;
    private handleEngineInput;
    private onBackButtonActivate;
}
