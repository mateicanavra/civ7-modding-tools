import { ActivatableProps } from "/core/ui-next/components/activatable.js";
export declare enum RadioButtonSize {
    SMALL = "small",
    LARGE = "large",
    STANDARD = "standard"
}
export type RadioButtonProps = {
    isChecked?: boolean;
    size?: RadioButtonSize;
    highRes?: boolean;
} & ActivatableProps;
/**
 * A radio button
 * Shows a toggleable state. Can be used as a pip in other components.
 * ```tsx
 * // Example: Toggleable pip
 * const [isToggled, setIsToggled] = createSignal(false);
 * ...
 * <RadioButton isChecked={isToggled()} onActivate={() => setIsToggled((toggled) => !toggled)} />
 * ```
 * Default implementation: {@link PanelComponent}
 * @param {PanelProps} props See {@link PanelProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.name The name of the panel. This is used for various tracking contexts like focus.
 */
export declare const RadioButton: any;
