/**
 * @file screen-extras.ts
 * @copyright 2024, Firaxis Games
 * @description Sub-menu showing additional items that aren't on the main menu.
 */
import Panel from "/core/ui/panel-support.js";
export declare class ScreenExtras extends Panel {
    private title;
    private closeButtonListener;
    private engineInputListener;
    private creditsListener;
    private legalListener;
    private rewatchIntroListener;
    private additionalContentButtonListener;
    private activeDeviceTypeListener;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    generateOpenCallbacks(callbacks: Record<string, OptionalOpenCallback>): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    close(): void;
    private onEngineInput;
    private onActiveDeviceTypeChanged;
    private onAdditionalContentButtonPressed;
    private onCredits;
    private onLegal;
    private onRewatchIntro;
    private onGraphicsBenchmark;
    private onAiBenchmark;
}
