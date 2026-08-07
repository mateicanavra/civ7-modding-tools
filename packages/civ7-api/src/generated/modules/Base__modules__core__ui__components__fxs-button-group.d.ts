/**
 * @file fxs-button-group.ts
 * @copyright 2023, Firaxis Games
 * @description A container component for managing the sizing of a group of buttons.
 */
export declare class FxsButtonGroup extends Component {
    private containerType;
    private onResizeEventListener;
    private activeDeviceTypeListener;
    onInitialize(): void;
    onAttach(): void;
    /**
     * Waits for the next layout cycle and then resizes all buttons to the size of the longest button.
     *
     * This is used as a workaround for Coherent Gameface not supporting grid layouts.
     *
     * Note: You don't need this for vertical button groups, only horizontal.
     */
    private setButtonWidth;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-button-group": ComponentRoot<FxsButtonGroup>;
    }
}
