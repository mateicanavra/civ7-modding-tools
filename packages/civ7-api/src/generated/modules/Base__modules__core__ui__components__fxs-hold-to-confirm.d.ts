/**
 * @file fxs-hold-to-confirm.ts
 * @copyright 2023, Firaxis Games
 * @description Hold to confirm.
 *
 * Set the `action-key` attribute to the action key to display the icon for and have the ring respond to.
 * Set the `caption` attribute to set the text you want to display
 * Set the `disabled` attribute to disable this component.
 *
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export type FxsHoldToConfirmAttribute = "action-key";
/** @description The hold to confirm primitive; makes a circle appear out of nowhere, like magic. */
export declare class FxsHoldToConfirm extends Component {
    private readonly DEFAULT_HOLD_SECS;
    private ringElement?;
    private iconElement?;
    private labelElement?;
    private engineInputEventListener;
    private updateIconEventListener;
    get disabled(): boolean;
    set disabled(value: boolean);
    get actionKey(): string | null;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onEngineInput(inputEvent: InputEngineEvent): void;
    private updateIcon;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-hold-to-confirm": ComponentRoot<FxsHoldToConfirm>;
    }
}
export { FxsHoldToConfirm as default };
