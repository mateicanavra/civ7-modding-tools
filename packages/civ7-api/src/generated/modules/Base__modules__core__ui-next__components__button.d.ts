import { ActivatableProps } from "/core/ui-next/components/activatable.js";
export interface ButtonProps extends ActivatableProps {
    size?: "standard" | "small";
}
/**
 * A Button component.
 * A simple activatable button.
 * ```tsx
 * // Example - Simple button
 * <Button onActivate={() => console.log("activated")}>Click Me!</Button>
 * ```
 * Default implementation: {@link ButtonComponent} Based on: {@link Activatable}
 * @param {ActivatableProps} props See {@link ActivatableProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {boolean} props.disabled Is this control disabled both visually and for input? Default: false
 * @param {string} props.hotkeyAction The name of a hotkey action which activates this component. Default: undefined
 * @param {string} props.name The name of the component set as the data-name property - useful for debugging or searching the DOM tree. Default: "Activatable"
 * @param {() => void} props.onActivate Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction. Default: undefined
 */
export declare const Button: any;
