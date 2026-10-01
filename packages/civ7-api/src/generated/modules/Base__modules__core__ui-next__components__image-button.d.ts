import { spacing } from "/core/ui-next/utilities/spacing.js";
import { ActivatableProps } from "/core/ui-next/components/activatable.js";
export interface ImageButtonProps extends ActivatableProps {
    imageData: {
        base: string;
        focus: string;
        active?: string;
        disabled?: string;
    };
    size?: spacing;
}
/**
 * An Image Button component.
 * A simple activatable button that allows the user to pass in custom image to represent the button
 * ```tsx
 * // Example - Simple image button
 * <ImageButton
 * 	imageData={
 * 		base: "url(blp:button_image_base.png)",
 * 		focus: "url(blp:button_image_focus.png)"
 * 	}
 * 	size="6"
 * 	onActivate={() => console.log("activated")} />
 * ```
 * Default implementation: {@link ImageButtonComponent} Based on: {@link Activatable}
 * @param imageData If no disabled or active images are provided, will fall back to using base (at 50% opacity) and focus images respectively
 * @param size Defaults to `12`
 * @param {ActivatableProps} props See {@link ActivatableProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {boolean} props.disabled Is this control disabled both visually and for input? Default: false
 * @param {string} props.hotkeyAction The name of a hotkey action which activates this component. Default: undefined
 * @param {string} props.name The name of the component set as the data-name property - useful for debugging or searching the DOM tree. Default: "Activatable"
 * @param {() => void} props.onActivate Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction. Default: undefined
 */
export declare const ImageButton: any;
