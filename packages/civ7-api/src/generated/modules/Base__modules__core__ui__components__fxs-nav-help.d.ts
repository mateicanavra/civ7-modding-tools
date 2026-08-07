/**
 * @file fxs-nav-help.ts
 * @copyright 2021, Firaxis Games
 * @description Provide navigation input help.
 */
/**
 * A container that fills with navigation button icon and label.
 */
export declare class FxsNavHelp extends Component {
    private textHelp?;
    private readonly label;
    private iconStartText;
    private iconElement?;
    private activeDeviceTypeListener;
    private actionKey;
    private altActionKey;
    private decorationMode;
    private caption;
    private prevState;
    private updateGate;
    /**
     * Get the matching Gamepad action name of an Input action name
     * @param actionKey Input action name
     */
    static getGamepadActionName(actionKey: string): string | undefined;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onActiveContextChanged;
    private onInputActionBinded;
    private onPreferencesLoaded;
    private onActiveDeviceTypeChanged;
    private refreshContainers;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
    private onUpdate;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-nav-help": ComponentRoot<FxsNavHelp>;
    }
}
export { FxsNavHelp as default };
