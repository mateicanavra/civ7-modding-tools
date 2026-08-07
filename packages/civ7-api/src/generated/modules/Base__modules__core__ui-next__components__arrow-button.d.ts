/**
 * An Arrow Button component.
 * A button styled like an arrow.
 * ```tsx
 * // Example - Right Arrow
 * <ArrowButton onActivate={() => console.log("activated")} right={true} />
 * ```
 * Default implementation: {@link ArrowButtonComponent} Based on: {@link Activatable}
 * @param {ArrowButtonComponentProps} props See {@link ArrowButtonComponentProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {boolean} props.right Set to true if the arrow should point right and false to point left. Default: false
 * @param {boolean} props.disabled Is this control disabled both visually and for input? Default: false
 * @param {string} props.hotkeyAction The name of a hotkey action which activates this component. Default: undefined
 * @param {string} props.name The name of the component set as the data-name property - useful for debugging or searching the DOM tree. Default: "Activatable"
 * @param {() => void} props.onActivate Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction. Default: undefined
 */
export declare const ArrowButton: any;
