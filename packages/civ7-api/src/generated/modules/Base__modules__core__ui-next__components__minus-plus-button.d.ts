/**
 * A Minus-Plus Button component.
 * A button with a state using the minus for deactivation and plus for activation.
 * ```tsx
 * // Example - Right Arrow
 * <MinusPlusButton onActivate={() => console.log("activated")} right={true} />
 * ```
 * Default implementation: {@link MinusPlusButtonComponent} Based on: {@link Activatable}
 * @param {MinusPlusButtonComponentProps} props See {@link MinusPlusButtonComponentProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {boolean} props.type Set the button state (minus or plus) directly
 * @param {boolean} props.dataDisabled Disabled both visually and for input? Default: false
 * @param {string} props.hotkeyAction The name of a hotkey action which activates this component. Default: undefined
 * @param {string} props.name The name of the component set as the data-name property - useful for debugging or searching the DOM tree. Default: "Activatable"
 * @param {() => void} props.onActivate Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction. Default: undefined
 */
export declare const MinusPlusButton: any;
