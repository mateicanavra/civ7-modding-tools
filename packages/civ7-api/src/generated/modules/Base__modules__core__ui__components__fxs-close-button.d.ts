/**
 * @file fxs-close-button.ts
 * @copyright 2021, Firaxis Games
 * @description A UI button control to close a panel/screen/window.
 *
 */
export declare class FxsCloseButton extends Component {
    private activateCounter;
    private engineInputListener;
    private activeDeviceTypeListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onEngineInput;
    private setVisibility;
    private onActiveDeviceTypeChanged;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-close-button": ComponentRoot<FxsCloseButton>;
    }
}
