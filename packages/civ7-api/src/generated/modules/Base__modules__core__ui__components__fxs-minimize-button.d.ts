/**
 * @file fxs-minimize-button.ts
 * @copyright 2023, Firaxis Games
 * @description A UI button control to minimize a panel/screen/window.
 *
 */
import { FxsMinusPlusButton } from "/core/ui/components/fxs-minus-plus.js";
declare class FxsMinimizeButton extends FxsMinusPlusButton {
    private engineInputListener;
    private minimized;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    private onEngineInputMinimize;
    private updateImage;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-minimize-button": ComponentRoot<FxsMinimizeButton>;
    }
}
export {};
